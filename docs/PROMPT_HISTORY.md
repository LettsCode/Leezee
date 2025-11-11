# Prompt Development History — *Leezee (Visual Video Describer)*  

This document outlines the evolution of prompts used to design, refine, and build **Leezee**, an AI-powered visual video describer app created in **Google AI Studio** and deployed via **Google Cloud Run**.

---

## Initial Concept  

> “I want to create a web-based application which allows users to upload downloaded videos (via drag and drop), or via the URL of an existing posted video in order to generate visual descriptions of these videos for the blind and visually impaired community.”

**Early Objectives:**  
- Build an inclusive tool for creators to generate AI-powered **visual descriptions** for accessibility.  
- Support **drag-and-drop uploads**, **person profiles**, and **tone customization**.  
- Enable **iterative AI refinement** (“make it more brief,” “change the tone,” etc.).  

---

## Version 1 — Defining Core Requirements  

**Prompt Focus:**  
Structured project scope and MVP requirements.  

**Key Additions:**  
- **Vision & Problem Statement** emphasizing accessibility gaps.  
- **Target Audience**: content creators, accessibility advocates, and inclusive organizations.  
- **Core Features:** video upload, Gemini API-based description generation, readable output, and copy functionality.  
- **Non-Functional Requirements:** simplicity, accessibility (WCAG 2.1 AA), and responsive UI.  
- **Tech Stack:** React + Tailwind + TypeScript + Gemini API + Google Cloud Run.  
- **Roadmap:**  
  - Phase 1: MVP with file upload and description generation.  
  - Phase 2: Editable descriptions and saved preferences.  
  - Phase 3: Backend-powered video URL analysis and batch processing.  

---

## Version 2 — Enhancing Customization and UX  

**Prompt Focus:**  
Improving personalization, accessibility, and extensibility.  

**Enhancements Introduced:**  
- **Advanced Features:**  
  - *Person Profiles*: reusable profiles with names, pronouns, and short descriptions.  
  - *Detail Level Control*: Brief / Average / Detailed options.  
  - *Video Focus Input*: user-guided scene priorities (e.g., “dance,” “outfit check”).  
- **Iterative Chat Refinement:** integrated AI chat for post-generation editing.  
- **Preferred Voice Saving:** store tone/style preferences locally.  
- **Progressive Disclosure:** collapsible “Advanced Options” section for minimal UI clutter.  
- **Refined State Logic:** `idle`, `processing`, `success`, `error`, and `refining`.  
- **Local Storage Use:** client-side persistence for privacy.  

---

## Version 3 — Integrating Video URLs and Future-State Capabilities  

**Prompt Focus:**  
Expanding the app’s reach, usability, and scalability.  

**New Capabilities:**  
- **Video URL Input:** alongside file upload, users can paste URLs for analysis (future backend support).  
- **Extended Functional Flow:**  
  - Clear upload confirmation & progress indicators.  
  - User guidance messages during analysis.  
- **Multi-Voice Personalization:** ability to save multiple voice styles for different content types.  
- **Refined Roadmap:**  
  - *Phase 1:* React + Vite + Tailwind setup with Gemini API integration.  
  - *Phase 2:* Advanced customization UI (profiles, tone, focus).  
  - *Phase 3:* Chat refinement and Preferred Voice saving.  
  - *Phase 4:* Backend expansion (URL-based analysis, user accounts, batch uploads).  
- **Evaluation Framework:** post-launch QFD analysis to map user feedback to technical improvements.  

---

## Final Outcome — Summary of Prompt Evolution  

| Version | Focus | Key Achievement |
| :-- | :-- | :-- |
| **V1** | Foundational MVP | Defined clear accessibility-focused core features. |
| **V2** | Personalization & UX | Added profiles, chat refinement, and saved voices. |
| **V3** | Scalability & Integration | Added video URLs, multi-voice saving, and backend roadmap. |

---

**Result:**  
The prompt history shows how a simple accessibility idea evolved into a structured, fully scoped AI web app — guided entirely through iterative prompting in **Google AI Studio**.
