# Project Requirements: Visual Video Describer

## 1. Vision & Problem Statement

**Vision:** To empower content creators to effortlessly generate rich, accurate, and customizable visual descriptions for videos, making digital content universally accessible to the blind and visually impaired community.

**Problem Statement:** A significant portion of online video content is inaccessible to people with visual impairments because it lacks descriptive audio or text that explains the visual context. This creates a digital barrier, excluding them from cultural moments, educational content, and entertainment. Manually creating these descriptions is time-consuming and requires specific skills, often leading creators to skip this crucial accessibility step.

This project aims to bridge that gap by leveraging advanced AI to automate the creation of high-quality, customizable visual descriptions.

---

## 2. Target Audience

*   **Primary:** **Content Creators & Social Media Managers:** Individuals and teams who produce and post video content on platforms like TikTok, Instagram, YouTube, and Facebook. They need a fast, easy, and powerful tool to make their content inclusive without disrupting their workflow.
*   **Secondary:**
    *   **Accessibility Advocates:** Professionals and volunteers working to improve digital accessibility standards.
    *   **Organizations & Businesses:** Companies committed to DEI (Diversity, Equity, and Inclusion) and ensuring their digital presence is compliant and accessible.
    *   **Friends & Family:** Individuals who want to share video content with visually impaired loved ones in an accessible format.

---

## 3. Core Features

### Functional Requirements (MVP)

#### FR1: Video Input
*   **FR1.1: File Upload:** The user should be able to choose between uploading a video file from their local machine and copy pasting the URL of a online video into a text box.
*   **FR1.2: Drag-and-Drop Interface:** The application must provide a user-friendly drag-and-drop area for video file uploads, in addition to a standard file selection button.
*   **FR1.3: Supported Formats:** The uploader should accept common video formats (e.g., `.mp4`, `.mov`, `.webm`, `.avi`).
*   **FR1.4: Input Constraints:** For the MVP, we will limit the video size (e.g., < 100MB) and duration (e.g., < 2 minutes) to manage API costs and processing time. This should be clearly communicated to the user in the UI.

#### FR2: AI-Powered Video Analysis
*   **FR2.1: Gemini Pro Integration:** The application will use the `gemini-2.5-pro` model to analyze the video's visual content.
*   **FR2.2: High-Quality Description Generation:** The AI will generate a comprehensive text description of the video. The prompt will be engineered based on standard visual description "rules" to request:
    *   Scene-by-scene descriptions that follow the flow of the video.
    *   Identification of key objects, characters, and settings.
    *   Description of actions and movements.
    *   Transcription of any significant on-screen text or captions.
    *   Interpretation of moods or emotional cues conveyed visually.
    *   Providing necessary on-screen context without overwhelming the reader with unnecessary information.
*   **FR2.3: Processing Feedback:** The UI must provide visual confirmation that a file has been successfully drag/dropped or found from its URL. The UI should also display a clear loading or progress indicator while the video is being uploaded and processed by the Gemini API. This should include reassuring messages about the analysis process.

#### FR3: Description Output & Usability
*   **FR3.1: Display Description:** The generated description will be displayed in a clean, readable text area.
*   **FR3.2: Copy to Clipboard:** A prominent "Copy Description" button will allow the user to easily copy the full text to their clipboard for pasting into social media posts, video platforms, or other documents.
*   **FR3.3: Clear Results:** The output area should be distinct and easy to find, presenting the final result without clutter.

---

### Functional Requirements (Advanced Features)

These features are designed to be optional and customizable, enhancing the power of the tool without complicating the core user experience.

#### FR4: Pre-Generation Customization
*   **FR4.1: Person Profiles:**
    *   Users can optionally create, save, and edit profiles for recurring individuals in their videos.
    *   A profile will contain: Name, Pronouns, and a short physical description to help the AI identify them.
    *   Before generating a description, the user can select from their saved profiles to prime the AI.
*   **FR4.2: Description Detail Levels:**
    *   Users can optionally choose a desired level of detail: "Brief," "Average," or "Detailed." This will adjust the prompt sent to the AI.
*   **FR4.3: Video Focus Guidance:**
    *   Users can optionally guide the AI by selecting or typing the main focus of the video (e.g., "Dance," "Lip-syncing," "Outfit Check," "Educational," "Comedy Sketch"). This helps the AI prioritize what to describe.

#### FR5: Post-Generation Refinement
*   **FR5.1: Iterative Chat Editing:**
    *   After a description is generated, the user has the option to enter a chat-like interface to refine it.
    *   They can send follow-up requests like, "Make this more brief," "Make the tone less formal," or "Focus more on the outfit."
*   **FR5.2: Save "Preferred Voice":**
    *   Once a user has refined a description to a tone and style they like, they will have the option to save this as a "Preferred Voice". Multiple preferred voices can be saved and named - for different styles of videos.
    *   This saved preference can then be applied to future generations, personalizing the AI's output.

---

### Non-Functional Requirements

#### NFR1: User Interface & Experience (UI/UX)
*   **NFR1.1: Simplicity:** The core interface will remain minimalist, with a single, clear call-to-action for the MVP flow.
*   **NFR1.2: Progressive Disclosure:** All advanced/optional settings (Person Profiles, Detail Level, etc.) will be cleanly organized, possibly within a collapsible "Advanced Options" section, to avoid overwhelming new users. The user should be able to hide these settings for a streamlined view.
*   **NFR1.3: Accessibility:** The application itself will adhere to high accessibility standards (WCAG 2.1 AA), including high-contrast colors, keyboard navigability, and screen-reader compatibility.
*   **NFR1.4: Responsiveness:** The design will be fully responsive and functional on desktop, tablet, and mobile devices.

#### NFR2: Performance
*   **NFR2.1: Frontend Responsiveness:** The application will remain interactive and responsive even while a file is being uploaded or the API is processing the request.
*   **NFR2.2: Error Handling:** The application will gracefully handle potential errors (e.g., invalid file type, API failure, network issues) and provide clear, helpful feedback to the user.

#### NFR3: Security
*   **NFR3.1: API Key Management:** The Google Gemini API key will be managed securely using environment variables and will not be exposed on the client-side.
*   **NFR3.2: Data Privacy:** User-created profiles will be stored client-side (e.g., using `localStorage`) to ensure privacy.

---

## 4. Technology Stack

*   **Frontend Framework:** React 18+ with TypeScript
*   **Styling:** Tailwind CSS
*   **AI Service:** Google Gemini API (`gemini-2.5-pro`) via `@google/genai` SDK
*   **State Management:** React Hooks (`useState`, `useReducer`, `useContext`)
*   **Deployment Target:** Google Cloud Run (for its scalability and ease of use with containerized applications)

---

## 5. Implementation Plan / Roadmap

### Phase 1: MVP Development (Core Functionality)
1.  **Project Setup:** Initialize a React project with Vite, TypeScript, and Tailwind CSS.
2.  **UI Scaffolding:** Build the main application layout: header, video uploader, results display, and footer.
3.  **Video Uploader Component:** Implement drag-and-drop and file selection logic with validation.
4.  **Gemini Service Integration:** Create a service to handle file encoding and the basic `generateContent` call.
5.  **State Management:** Implement state logic for `idle`, `uploading`, `processing`, `success`, `error`.
6.  **End-to-End Flow:** Connect UI to state and the Gemini service for a complete upload-to-description flow.
7.  **Styling & Polish:** Apply styles for a visually appealing, responsive, and accessible UI.
8.  **Deployment Prep:** Containerize the application using Docker.

### Phase 2: Advanced Customization
1.  **UI for Advanced Options:** Design and implement the "Advanced Options" section with progressive disclosure.
2.  **Person Profiles Feature:** Build the UI for creating, editing, and deleting profiles. Implement client-side storage (`localStorage`) and logic to add selected profiles to the AI prompt.
3.  **Detail Level & Video Focus:** Add UI controls (radio buttons, dropdowns) for these options and integrate them into the prompt engineering logic.

### Phase 3: Iterative Refinement & Personalization
1.  **Chat Interface:** Implement the post-generation chat UI.
2.  **Chat Functionality:** Integrate Gemini's chat capabilities (`chat.sendMessage`) to handle follow-up refinement prompts.
3.  **Save "Preferred Voice":** Implement the logic and UI to save and retrieve a preferred tone/style, storing it in `localStorage` and applying it to future requests.

### Phase 4: Future-State (Requires Backend)
*   **URL-based Analysis:** Develop a backend service that can download a video from a public URL and pass it to the Gemini API.
*   **User Accounts:** Introduce authentication for cross-device profile and voice syncing.
*   **Batch Processing:** Allow creators to upload and process multiple videos at once.

---

## 6. Post-Launch Evaluation

Upon completion of the MVP and subsequent phases, a **Quality Function Deployment (QFD) / House of Quality** analysis will be conducted. This will involve:
1.  **Identifying Customer Requirements ("What's"):** Gathering direct feedback from target users (content creators, visually impaired individuals) on the quality, accuracy, and usefulness of the generated descriptions.
2.  **Defining Technical Characteristics ("How's"):** Mapping user feedback to technical metrics like AI prompt effectiveness, processing speed, and UI clarity.
3.  **Analysis:** Evaluating how well the application meets user needs and identifying the most critical areas for improvement in subsequent development cycles. This will ensure the application's evolution is data-driven and user-centric.
