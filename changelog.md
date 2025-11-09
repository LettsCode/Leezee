# Changelog

All notable changes to this project will be documented in this file.

## [2024-08-04] - Profile Management Enhancements

### Added
- **Edit Profile Functionality:** Users can now edit their saved "People" profiles. An "Edit" button appears on hover next to each profile, allowing users to load the profile's details into the form, make changes, and update it.

## [2024-08-03] - Feature Enhancement and Prompt Tuning

### Added
- **Pronouns Field:** A new "Pronouns" input field has been added to the "People In This Video" section. The AI will now use these pronouns along with the name and description to more accurately identify and describe individuals.

### Changed
- **Dynamic Upload Field:** The upload area now provides clearer feedback, changing its primary text from "Upload Field" to "Video Uploaded" once a file has been successfully selected.
- **Direct-to-Description Prompting:** The core AI prompt has been tuned to omit any introductory phrases (e.g., "Here is a description of the video..."). The generated text now begins immediately with the visual description.

## [2024-08-02] - Reverted to Neutral Dark Theme

### Changed
- **Dark Theme Reverted:** The color scheme for dark mode has been reverted from a stylized blue theme to a more conventional, neutral dark theme. The new theme uses a `slate` color palette for backgrounds, containers, and interface elements, improving readability and providing a more standard user experience. The light theme remains unchanged.

## [2024-08-01] - Theme Toggle Fix and Color Scheme Overhaul

### Fixed
- **Theme Toggle:** Implemented a more robust theme initialization script to permanently fix the bug where the light/dark mode toggle would get stuck. The theme is now correctly applied on initial page load and reliably switches on user interaction.

### Changed
- **New Dark Theme:** Overhauled the dark mode to use a deep blue background with lighter blue containers and interface elements, creating a more cohesive and aesthetically pleasing "blue box" theme.
- **Refined Light Theme:** Updated the light theme to use a pure white background with more distinct grey boxes for better visual separation and contrast.

## [2024-07-31] - Fixed Theme Toggle Functionality

### Fixed
- **Theme Toggle:** Resolved an issue where the light/dark mode toggle was not working. The application was stuck in dark mode because the Tailwind CSS configuration was missing. Added the necessary `darkMode: 'class'` configuration to enable class-based theme switching.

## [2024-07-30] - UI Text and Light Theme Refinements

### Changed
- **Light Theme Polish:** The light mode color scheme has been updated for better contrast and a cleaner look, featuring a pure white background with light grey containers and UI elements.
- **Improved "People" Section:** The instructional text and placeholder examples in the "People In This Video" section have been revised for improved clarity and better examples.
- **Improved "Focus" Section:** The descriptive text in the "Video Focus" section has been updated to be more user-friendly and clearly explain its purpose.

## [2024-07-29] - Theme Toggle and Prompt Enhancement

### Added
- **Light/Dark Mode Toggle:** Implemented a theme switcher with sun and moon icons in the top-right corner to toggle between a new light mode and the existing dark mode. The user's preference is saved in their browser.

### Changed
- **System Instruction Update:** The core prompt for the AI has been updated to strongly emphasize that all on-screen text must be transcribed in the visual description as a critical requirement.

## [2024-07-28] - Visual Polish and Dark Theme

### Added
- **Dark Blue Color Scheme:** The entire UI has been updated to a modern dark blue theme to improve aesthetics and reduce eye strain.
- **Detail Level Icons:** Added simple line icons under each "Description Detail Level" option (brief, standard, detailed) for clearer visual communication.

### Changed
- **Unified Font:** The application now consistently uses the 'Inter' font, removing the monospace style from the main header for a more unified typographic appearance.
- **Heading Case:** All section headings have been updated to title case (e.g., "Upload," "Video Focus") for a cleaner, more polished look.
- **Enlarged Optional Settings Button:** The button to reveal "Optional Settings" has been made significantly larger and more prominent to improve usability and discoverability.

## [2024-07-27] - Major UI Reconfiguration from Wireframes

### Changed
- **Complete UI Overhaul:** The application layout has been completely reconfigured to match new design wireframes, resulting in a cleaner, more structured user experience.
- **Section-Based Layout:** The UI is now organized into distinct bordered sections for "Upload," "Description Detail Level," and "Optional Settings."
- **Collapsible Optional Settings:** "Advanced Options" have been renamed to "Optional Settings" and are now in a collapsible section that is closed by default, simplifying the primary view. The toggle button shows a `+` or `−` icon.
- **Redesigned "People in this Video" Section:** The UI for adding and selecting person profiles has been updated to match the wireframe, with a clear form for adding new profiles and a list for selecting saved ones.
- **Upgraded "Video Focus" Functionality:** The video focus feature has been enhanced to support multiple tags. Users can type a custom focus or select from a list of suggested keywords.

## [2024-07-26] - UI Simplification and Workflow Improvement

### Changed
- **"Description Detail Level" Relocated:** This setting has been moved out of "Advanced Options" and placed in a more prominent position for easier access before generating a description.
- **"Advanced Options" Open by Default:** The advanced settings panel is now expanded by default to improve discoverability of customization features.
- **Simplified Advanced Options:** The section has been streamlined into two focused tabs: "Add Person Profiles" and "Video Focus".
- **Inline Profile Creation:** The "Add Person Profiles" tab now includes an inline form to add new profiles, removing the need for a separate modal and simplifying the user workflow.

### Removed
- **"Style & Tone" and "Voice" Features:** To create a more focused and streamlined user experience, the "Style & Tone" tab (including Tone, Format, Language, Custom Instructions) and the "Preferred Voice" feature have been removed.

## [2024-07-25] - UI Overhaul & Advanced Styling

### Added
- **Tabbed Main Input:** The main content area now features two tabs: "Upload Video" and "Import from URL".
  - "Import from URL" is a UI placeholder for a future backend-dependent feature and is currently disabled.
- **Tabbed Advanced Options:** The "Advanced Options" section has been reorganized into three tabs for better clarity:
  - **General Settings:** Contains existing options like Detail Level, Video Focus, and Preferred Voice.
  - **Person Profiles:** A dedicated tab for managing and selecting person profiles.
  - **Style & Tone:** A new tab offering granular control over the output:
    - **Tone:** Multi-select options (Formal, Casual, Humorous, etc.).
    - **Format:** Multi-select options (Paragraph, Bullet Points, etc.).
    - **Language:** Dropdown to select the output language.
    - **Custom Instructions:** A textarea for specific user-defined instructions.
- **Prompt Integration:** The new "Style & Tone" options are now integrated into the prompt sent to the Gemini API.

### Changed
- The UI for advanced options has been significantly restructured from a single scrolling list to a more organized tabbed interface.