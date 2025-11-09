import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat } from "@google/genai";

type Status = 'idle' | 'file-selected' | 'processing' | 'refining' | 'success' | 'error';
type DetailLevel = 'brief' | 'average' | 'detailed';
type Profile = {
  id: string;
  name: string;
  description: string;
  pronouns?: string;
};

// Custom hook for using localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}


const App = () => {
    const [status, setStatus] = useState<Status>('idle');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [copyButtonText, setCopyButtonText] = useState('Copy Description');
    const [activeInputTab, setActiveInputTab] = useState<'upload' | 'url'>('upload');
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('vvd-theme', 'dark');
    
    // --- Optional Settings State ---
    const [showOptionalSettings, setShowOptionalSettings] = useState(false);
    const [profiles, setProfiles] = useLocalStorage<Profile[]>('vvd-profiles', []);
    const [selectedProfileIds, setSelectedProfileIds] = useState<Set<string>>(new Set());
    const [detailLevel, setDetailLevel] = useState<DetailLevel>('average');
    
    const [videoFocuses, setVideoFocuses] = useState<string[]>([]);
    const [videoFocusInput, setVideoFocusInput] = useState('');
    const suggestedFocuses = ['dance', 'outfit', 'comedy', 'tutorial', 'unboxing', 'product review'];
    
    const [newProfileName, setNewProfileName] = useState('');
    const [newProfilePronouns, setNewProfilePronouns] = useState('');
    const [newProfileDescription, setNewProfileDescription] = useState('');
    const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

    // --- Refinement State ---
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<{ role: string, parts: { text: string }[] }[]>([]);
    const [chatInput, setChatInput] = useState('');

    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

    const handleThemeToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        // Directly update the DOM. The script in index.html handles initial load.
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // Update state and localStorage
        setTheme(newTheme);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileSelect = useCallback((files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0];
            if (!file.type.startsWith('video/')) {
                setError('Invalid file type. Please upload a video file.');
                setStatus('error');
                return;
            }
            if (file.size > 100 * 1024 * 1024) { // 100MB
                setError('File size exceeds 100MB limit.');
                setStatus('error');
                return;
            }
            setVideoFile(file);
            setStatus('file-selected');
            setError('');
        }
    }, []);

    const handleGenerateDescription = async () => {
        if (!videoFile) return;

        setStatus('processing');
        setDescription('');
        setError('');
        setChatHistory([]);
        setChatSession(null);

        try {
            const base64Data = await fileToBase64(videoFile);
            
            const videoPart = {
                inlineData: {
                    mimeType: videoFile.type,
                    data: base64Data,
                },
            };

            let systemInstruction = `You are an expert in creating visual descriptions for the blind and visually impaired community.
            Analyze videos and generate detailed, objective descriptions.
            - Follow the video's timeline chronologically.
            - Describe the setting, characters (if any), actions, and key visual cues.
            - ALWAYS include and transcribe any on-screen text, captions, or titles that appear. This is a critical requirement.
            - Capture the mood and key visual cues.
            - The description should be clear, concise, and suitable for a social media caption or alt-text.
            - IMPORTANT: Do not include any introductory phrases or sentences. Begin the description directly with the visual information.`;

            let userPrompt = "Please generate the description for this video.";

            if (detailLevel === 'brief') {
                userPrompt += '\n- Keep the description brief and to the point, summarizing the key visual information concisely.';
            } else if (detailLevel === 'detailed') {
                userPrompt += '\n- Provide a highly detailed, comprehensive, scene-by-scene description, capturing as much visual information as possible.';
            }

            if (videoFocuses.length > 0) {
                userPrompt += `\n- The main focus of the video is on the following aspects: ${videoFocuses.join(', ')}. Pay special attention to these.`;
            }

            const selectedProfiles = profiles.filter(p => selectedProfileIds.has(p.id));
            if (selectedProfiles.length > 0) {
                userPrompt += '\n\n- The following people may appear in the video. Please identify them by name if you can, using their provided description and pronouns:\n';
                selectedProfiles.forEach(p => {
                    let profileString = `  - Name: ${p.name}`;
                    if (p.pronouns && p.pronouns.trim()) {
                        profileString += `, Pronouns: ${p.pronouns}`;
                    }
                    profileString += `, Description: ${p.description}\n`;
                    userPrompt += profileString;
                });
            }

            const chat = ai.chats.create({
              model: 'gemini-2.5-pro',
              config: { systemInstruction },
            });
            setChatSession(chat);

            const response = await chat.sendMessage({ message: [videoPart, {text: userPrompt}] });

            const initialHistory = [
                { role: 'user', parts: [{ text: "Generate the description for the provided video." }] },
                { role: 'model', parts: [{ text: response.text }] }
            ];

            setChatHistory(initialHistory);
            setDescription(response.text);
            setStatus('success');
        } catch (err) {
            console.error(err);
            setError('Failed to generate description. The video format may not be supported or an API error occurred. Please try again.');
            setStatus('error');
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !chatSession) return;
    
        const message = chatInput;
        setChatInput('');
        setStatus('refining');
        
        setChatHistory(prev => [...prev, { role: 'user', parts: [{ text: message }] }]);
    
        try {
            const response = await chatSession.sendMessage({ message });
            
            setDescription(response.text);
            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: response.text }] }]);
            setStatus('success');
        } catch (err) {
            console.error(err);
            setChatHistory(prev => prev.slice(0, -1)); 
            setStatus('success');
        }
    };

    const handleReset = () => {
        setStatus('idle');
        setVideoFile(null);
        setDescription('');
        setError('');
        setCopyButtonText('Copy Description');
        setShowOptionalSettings(false);
        setSelectedProfileIds(new Set());
        setDetailLevel('average');
        setVideoFocuses([]);
        setChatSession(null);
        setChatHistory([]);
        setChatInput('');
        setActiveInputTab('upload');
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(description).then(() => {
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy Description'), 2000);
        });
    };
    
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    }, [handleFileSelect]);

    const handleStartEditProfile = (profile: Profile) => {
        setEditingProfileId(profile.id);
        setNewProfileName(profile.name);
        setNewProfilePronouns(profile.pronouns || '');
        setNewProfileDescription(profile.description);
    };

    const handleCancelEdit = () => {
        setEditingProfileId(null);
        setNewProfileName('');
        setNewProfilePronouns('');
        setNewProfileDescription('');
    };

    const handleProfileSelectionChange = (profileId: string) => {
        setSelectedProfileIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(profileId)) {
                newSet.delete(profileId);
            } else {
                newSet.add(profileId);
            }
            return newSet;
        });
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProfileName.trim() || !newProfileDescription.trim()) return;

        if (editingProfileId) {
            setProfiles(prev => prev.map(p =>
                p.id === editingProfileId
                    ? { ...p, name: newProfileName.trim(), pronouns: newProfilePronouns.trim(), description: newProfileDescription.trim() }
                    : p
            ));
        } else {
            const newProfile: Profile = {
                id: Date.now().toString(),
                name: newProfileName.trim(),
                pronouns: newProfilePronouns.trim(),
                description: newProfileDescription.trim(),
            };
            setProfiles(prev => [...prev, newProfile]);
        }
        
        setEditingProfileId(null);
        setNewProfileName('');
        setNewProfilePronouns('');
        setNewProfileDescription('');
    };

    const handleAddFocus = (e?: React.MouseEvent | React.FormEvent) => {
      e?.preventDefault();
      if (videoFocusInput.trim() && !videoFocuses.includes(videoFocusInput.trim())) {
          setVideoFocuses(prev => [...prev, videoFocusInput.trim()]);
          setVideoFocusInput('');
      }
    };

    const handleAddSuggestedFocus = (focus: string) => {
        if (!videoFocuses.includes(focus)) {
            setVideoFocuses(prev => [...prev, focus]);
        }
    };

    const handleRemoveFocus = (focusToRemove: string) => {
        setVideoFocuses(prev => prev.filter(f => f !== focusToRemove));
    };

    const ThemeToggle = () => (
        <button
            onClick={handleThemeToggle}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )}
        </button>
    );
    
    const renderContent = () => {
        switch (status) {
            case 'processing':
                return (
                    <div className="text-center p-8">
                        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300">Analyzing Video...</h3>
                        <p className="text-slate-600 dark:text-slate-400">This may take a few moments. We're crafting the perfect description for you.</p>
                    </div>
                );
            case 'refining':
            case 'success':
                return (
                    <div className="w-full">
                        <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-200">Generated Description</h3>
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
                            <p className="text-slate-800 dark:text-slate-300 whitespace-pre-wrap">{description}</p>
                        </div>
                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                            <button onClick={handleCopyToClipboard} className="w-full sm:w-auto flex-grow bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                                {copyButtonText}
                            </button>
                            <button onClick={handleReset} className="w-full sm:w-auto flex-grow bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                                Analyze Another Video
                            </button>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-200 mb-3">Refine Description</h4>
                            <div className="space-y-4 max-h-48 overflow-y-auto mb-4 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}>
                                            <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="e.g., Make it funnier"
                                    className="flex-grow block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                                    disabled={status === 'refining'}
                                />
                                <button type="submit" className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 disabled:bg-sky-800" disabled={status === 'refining' || !chatInput.trim()}>
                                    {status === 'refining' ? '...' : 'Refine'}
                                </button>
                            </form>
                        </div>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center p-8 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-lg">
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">An Error Occurred</h3>
                        <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
                        <button onClick={handleReset} className="mt-4 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                           Try Again
                        </button>
                    </div>
                );
            case 'idle':
            case 'file-selected':
            default:
                const TabButton = ({ isActive, onClick, children }: { isActive: boolean, onClick: () => void, children: React.ReactNode }) => (
                    <button
                        onClick={onClick}
                        className={`px-4 py-2 font-medium transition-colors rounded-t-lg ${
                            isActive
                                ? 'bg-slate-100 dark:bg-slate-800 border-b-0'
                                : 'bg-slate-200/60 hover:bg-slate-200 text-slate-500 dark:bg-slate-700/60 dark:hover:bg-slate-700 dark:text-slate-400'
                        }`}
                    >
                        {children}
                    </button>
                );

                return (
                    <div className="w-full flex flex-col items-center">
                        <div className="w-full max-w-2xl space-y-6">
                            
                            {/* UPLOAD SECTION */}
                            <div className="border border-slate-300 dark:border-slate-700 rounded-lg">
                                <div className="p-4 border-b border-slate-300 dark:border-slate-700">
                                    <h2 className="font-bold text-lg text-slate-900 dark:text-slate-200 capitalize">Upload</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Upload your video here. Longer videos will take longer to process.</p>
                                </div>
                                <div className="p-4">
                                    <div className="flex border-b border-slate-300 dark:border-slate-700">
                                        <TabButton isActive={activeInputTab === 'upload'} onClick={() => setActiveInputTab('upload')}>Drag and Drop</TabButton>
                                        <TabButton isActive={activeInputTab === 'url'} onClick={() => setActiveInputTab('url')}>Upload URL</TabButton>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-800 pt-4">
                                        {activeInputTab === 'upload' ? (
                                            <div 
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                className={`w-full p-8 border-2 border-dashed rounded-lg transition-colors text-center cursor-pointer ${isDragging ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/50' : 'border-slate-300 bg-slate-200/50 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-700/50 dark:hover:border-slate-500'}`}
                                                onClick={() => document.getElementById('file-upload')?.click()}
                                            >
                                                <input type="file" id="file-upload" className="hidden" accept="video/*" onChange={(e) => handleFileSelect(e.target.files)} />
                                                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{videoFile ? 'Video Uploaded' : 'Upload Field'}</p>
                                                {videoFile ? 
                                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 break-all">{videoFile.name}</p> :
                                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Click or drag file here</p>
                                                }
                                            </div>
                                        ) : (
                                            <div className="w-full p-8 border-2 border-dashed rounded-lg border-slate-300 bg-slate-200/50 dark:border-slate-600 dark:bg-slate-700/50 text-center relative group">
                                                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Feature Coming Soon</p>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">URL uploads will be available in a future version.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* DESCRIPTION DETAIL LEVEL SECTION */}
                            <div className="p-4 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-800">
                                <h2 className="font-bold text-lg text-slate-900 dark:text-slate-200">Description Detail Level</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">How detailed would you like your visual description? Choose the appropriate option for your audience.</p>
                                <fieldset>
                                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                                        {(['brief', 'average', 'detailed'] as DetailLevel[]).map(level => (
                                            <div key={level} className="flex-grow">
                                                <input id={level} name="detail-level" type="radio" checked={detailLevel === level} onChange={() => setDetailLevel(level)} className="sr-only peer"/>
                                                <label htmlFor={level} className="block w-full text-center font-semibold py-3 px-4 rounded-md capitalize transition-colors cursor-pointer border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-sky-600 peer-checked:text-white peer-checked:border-sky-600 bg-white hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300">
                                                    <span className="text-sm">{level === 'average' ? 'Standard' : level}</span>
                                                    <div className="mt-2 h-4 flex flex-col justify-center items-center">
                                                        {level === 'brief' && <div className="h-0.5 bg-current w-6 rounded"></div>}
                                                        {level === 'average' && <>
                                                            <div className="h-0.5 bg-current w-6 mb-1 rounded"></div>
                                                            <div className="h-0.5 bg-current w-6 rounded"></div>
                                                        </>}
                                                        {level === 'detailed' && <>
                                                            <div className="h-0.5 bg-current w-6 mb-1 rounded"></div>
                                                            <div className="h-0.5 bg-current w-6 mb-1 rounded"></div>
                                                            <div className="h-0.5 bg-current w-6 rounded"></div>
                                                        </>}
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </fieldset>
                            </div>

                            {/* OPTIONAL SETTINGS SECTION */}
                            <div>
                                <button onClick={() => setShowOptionalSettings(!showOptionalSettings)} className="w-full text-center font-semibold py-3 px-4 rounded-lg transition-colors border-2 border-slate-300 hover:bg-slate-200 hover:border-slate-400 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:border-slate-600 dark:text-slate-300 text-base flex items-center justify-center gap-2">
                                    <span className="text-xl font-light">{showOptionalSettings ? '−' : '+'}</span> Optional Settings
                                </button>
                                {showOptionalSettings && (
                                    <div className="mt-2 p-4 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-800 space-y-6">
                                        {/* People in this Video */}
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-200">People In This Video</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Enhance description of people in the video by adding details here. This helps the AI describe individuals using their name and other details it may not know. You can save user profiles for future videos.</p>
                                            <form onSubmit={handleSaveProfile} className="space-y-3 p-4 bg-slate-200/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg">
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <input type="text" value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} placeholder="Name: e.g. Sage" className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 text-slate-900 dark:text-slate-200"/>
                                                    <input type="text" value={newProfilePronouns} onChange={(e) => setNewProfilePronouns(e.target.value)} placeholder="Pronouns: e.g. she/they" className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 text-slate-900 dark:text-slate-200"/>
                                                </div>
                                                <textarea value={newProfileDescription} onChange={(e) => setNewProfileDescription(e.target.value)} placeholder="Description: e.g. Young white person with medium length black hair and glasses." className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 text-slate-900 dark:text-slate-200" rows={2}></textarea>
                                                <div className="flex items-center gap-2">
                                                    <button type="submit" className="flex-grow bg-slate-700 text-white font-semibold py-2 px-3 rounded-lg hover:bg-slate-600 disabled:bg-slate-100 disabled:text-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-500" disabled={!newProfileName.trim() || !newProfileDescription.trim()}>
                                                        {editingProfileId ? 'Update Profile' : '+ Save Profile'}
                                                    </button>
                                                    {editingProfileId && (
                                                        <button type="button" onClick={handleCancelEdit} className="bg-slate-200 text-slate-800 font-semibold py-2 px-3 rounded-lg hover:bg-slate-300 dark:bg-slate-500 dark:text-slate-200 dark:hover:bg-slate-400">
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </form>
                                            {profiles.length > 0 && (
                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Choose saved profiles:</label>
                                                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900">
                                                        {profiles.map(p => (
                                                            <div key={p.id} className="flex items-center justify-between group">
                                                                <div className="flex items-center">
                                                                    <input id={`profile-${p.id}`} type="checkbox" checked={selectedProfileIds.has(p.id)} onChange={() => handleProfileSelectionChange(p.id)} className="h-4 w-4 text-sky-600 bg-slate-100 border-slate-300 rounded focus:ring-sky-500 dark:bg-slate-700 dark:border-slate-500"/>
                                                                    <label htmlFor={`profile-${p.id}`} className="ml-2 block text-sm text-slate-800 dark:text-slate-200">{p.name}</label>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleStartEditProfile(p)}
                                                                    className="text-xs font-semibold text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                                                    aria-label={`Edit profile for ${p.name}`}
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Video Focus */}
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-200">Video Focus</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">What is the main focus of your video? This helps the AI know what aspects of the video you would like your audience to know most about.</p>
                                            <form onSubmit={handleAddFocus} className="flex gap-2">
                                                <input type="text" value={videoFocusInput} onChange={(e) => setVideoFocusInput(e.target.value)} placeholder="describe: e.g. outfit of the day" className="flex-grow block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 text-slate-900 dark:text-slate-200"/>
                                                <button type="submit" className="bg-slate-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 disabled:bg-slate-100 dark:bg-slate-600 dark:hover:bg-slate-500 dark:disabled:bg-slate-700">+</button>
                                            </form>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {videoFocuses.map(focus => (
                                                    <span key={focus} className="inline-flex items-center gap-1 bg-sky-200 text-sky-900 text-xs font-medium px-2.5 py-1 rounded-full">
                                                        {focus}
                                                        <button onClick={() => handleRemoveFocus(focus)} className="text-sky-700 hover:text-sky-900 font-bold">&times;</button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="mt-4">
                                                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Choose:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {suggestedFocuses.map(focus => (
                                                        <button key={focus} onClick={() => handleAddSuggestedFocus(focus)} className="px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded-full hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:disabled:bg-slate-800 dark:disabled:text-slate-500" disabled={videoFocuses.includes(focus)}>
                                                            {focus}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                       {videoFile && (
                           <div className="mt-6 w-full max-w-2xl text-center">
                               <button onClick={handleGenerateDescription} className="w-full bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500" disabled={status !== 'file-selected'}>
                                   Generate Description
                               </button>
                           </div>
                       )}
                    </div>
                );
        }
    };
    
    return (
        <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 transition-colors duration-300">
             <div className="w-full max-w-3xl mx-auto">
                <ThemeToggle />
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
                        Visual Description Generator
                    </h1>
                    <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
                        Generate immersive visual descriptions of your videos for your visually impaired audience
                    </p>
                </header>
                <section className="bg-slate-100 dark:bg-slate-800/60 backdrop-blur-sm shadow-lg rounded-xl p-6 sm:p-8 flex items-center justify-center min-h-[20rem]">
                    {renderContent()}
                </section>
                <footer className="text-center mt-8">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Powered by Google Gemini</p>
                </footer>
            </div>
        </main>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);