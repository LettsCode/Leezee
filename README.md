<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Leezee (Visual Video Describer)

Leezee is a powerful, client-first web application designed to generate detailed, customizable descriptions from uploaded video files. By leveraging advanced Gemini API capabilities, this application provides users with an intelligent workflow for analyzing video content and iteratively refining the output to match specific stylistic and content requirements.

**Note:** This is a **frontend-only** application built entirely using **Google AI Studio**. Data persistence (user profiles, saved voices) is handled locally using the browser's `localStorage`.

-----

## Features

The application offers a complete workflow, from initial file selection to advanced post-generation refinement and personalization.

### **Core Workflow**

  * **Video Uploader:** Simple drag-and-drop or file selection for video files.
  * **Intelligent Processing:** Utilizes the Gemini API to analyze the video and generate an initial, detailed description.
  * **State-Driven UI:** Clear visual indicators for the application's current state (`idle`, `processing`, `success`, `error`).

### **Advanced Pre-Generation Customization**

All advanced controls are available in a collapsible **"Advanced Options"** section for a clean main interface.

  * **Person Profiles:** Create, save, and select persistent **Person Profiles** (name, pronouns, description). The selected profiles are prepended to the prompt, instructing the AI to identify and reference those individuals in the output.
  * **Detail Level:** Choose the desired depth of the analysis: **Brief**, **Average**, or **Detailed**.
  * **Video Focus:** Provide a specific string (e.g., "focus on the background props") to guide the AI's analysis and output.

### **Post-Generation Refinement & Personalization**

The application shifts from a one-off generation to an **iterative chat-based refinement** model.

  * **Iterative Chat Refinement:** After the initial description is generated, users can enter a chat interface to send follow-up prompts (e.g., "Make it wittier," or "Explain the scene in two sentences"). The main description updates in real-time with the refined text.
  * **Save Preferred Voice:** A "Save Voice" feature allows users to capture a specific writing style demonstrated during the refinement chat. The AI generates a **reusable style guide** based on the conversation history, which is saved to `localStorage`.
  * **Voice Selector:** Users can select a saved "Preferred Voice" from the **Advanced Options** to ensure consistent, personalized output for future video descriptions.

-----

## Technology Stack

  * **Frontend Framework:** React (using a component-based architecture for modularity)
  * **State Management:** Standard React Hooks and a custom state machine logic.
  * **Data Persistence:** Browser `localStorage` (no backend required).
  * **AI Integration:** Google Gemini API (using both `generateContent` and the more powerful `ai.chats.create` for iterative refinement).
  * **Styling:** `TailwindCSS`


#### **Core Libraries & Frameworks**

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React** (`react`, `react-dom`) | Building the user interface using a component-based architecture. |
| **AI Integration** | **@google/genai** | Directly interacting with the Gemini models for video analysis and chat refinement. |

#### **Development & Tooling**

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Build Tool & Dev Server** | **Vite** | Modern, fast build tool and development server for bundling and running the application. |
| **Language** | **TypeScript** | Provides static typing for enhanced code quality and developer experience. |
| **React Plugin** | **@vitejs/plugin-react** | Handles React-specific features and optimizations within the Vite build process. |

### **Key Highlights**

* The project uses a **modern JavaScript/TypeScript** stack driven by **Vite** for a fast development experience.
* The reliance on **`@google/genai`** confirms the direct integration with the **Gemini API** for its core functionality.
* The use of **React** aligns with the roadmap's mention of a **Component-Based Architecture** and **State-Driven UI**.

-----

## Architecture & Design Principles

This project was built with a strong focus on maintainability, user experience, and predictability.

  * **Client-First:** Designed to operate entirely in the browser, reducing infrastructure complexity.
  * **Progressive Disclosure:** Advanced complexity is hidden until the user intentionally expands the "Advanced Options."
  * **Component-Based:** Features are built as modular and reusable React components (`<AdvancedOptions />`, `<ProfileSelector.tsx />`, `<ChatRefinement.tsx />`).
  * **State-Driven UI:** The user interface is a direct reflection of the application's underlying state (`idle`, `processing`, `refining`, etc.).

-----

## 🚀 Getting Started

To run the Visual Video Describer locally, you will need to:

1.  **Clone the repository:**
    ```bash
    git clone [repository-url]
    cd visual-video-describer
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    ```
3.  **Set up the Gemini API Key:**
      * Create a `.env` file in the root directory.
      * Add your Gemini API key: `VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE`
4.  **Start the application:**
    ```bash
    npm run dev
    # or yarn dev
    ```

The application will now be running on `http://localhost:XXXX`.