# Product Requirements Document: Influencer Deal Calculator

* **Product:** Influencer Deal & Profile Manager
* **Author:** Diaa, Marketing Manager
* **Date:** July 23, 2025
* **Status:** Version 1.0 - Ready for Development

### 1. Objective & Problem Statement

The current process for creating influencer payment requests is manual, time-consuming, and error-prone. A new CRM requires itemized pricing and view counts for every single post (video/story) on each platform. This tool will automate these calculations, manage influencer data, and streamline the entire workflow, saving significant time and reducing administrative overhead.

### 2. Target User

**Persona:** A busy Marketing Manager (like Diaa) who manages hundreds of influencer deals. They need a tool that is extremely fast for simple tasks but powerful enough for complex deals and data management. They are tech-savvy but not a developer. Efficiency, accuracy, and ease of use are paramount.

### 3. Core Features & User Stories

* **US-1: Simple Calculation:** As a user, I want to quickly input a total price, total views, and content quantities to see the calculated per-post breakdown, so I can handle simple deals in seconds.
* **US-2: Advanced Weighting:** As a user, I want to adjust the relative value (weights) of different content types on different platforms, so I can accurately model complex, non-uniform deals.
* **US-3: Profile Management:** As a user, I want to create, save, and select influencer profiles (including their name, promocode, links, and notes), so I don't have to re-enter their information for every deal.
* **US-4: Deal History:** As a user, I want the tool to automatically save every calculation I run for a saved profile, so I have a complete history for reference and reporting.
* **US-5: Chrome Extension:** As a user, I want to access this tool as a side panel in my Chrome browser, so I can use it directly alongside my CRM without switching tabs.
* **US-6: Google Sheets Sync:** As a power user, I want to sync all my profile and deal data with a Google Sheet, so I can have a central, editable database for all my influencer marketing activities.

### 4. Design System & UX Guidelines

This system is designed for a modern, clean aesthetic using **Tailwind CSS**.

#### UX Principles

1.  **Clarity Over Clutter:** The UI must be intuitive. The "Simple Mode" is the default. Advanced features are hidden until explicitly requested.
2.  **Real-time Feedback:** All calculations must update instantly as the user types or adjusts a slider. No "Calculate" button is needed.
3.  **Efficiency is Key:** Minimize clicks. The workflow should be seamless, from selecting an influencer to copying the output.
4.  **Forgiving Interface:** The user should not lose their input data if they accidentally close the panel. Use local storage to persist the current state.

#### Colors (Dark Theme)

* **Background:** `bg-gray-900` (#111827)
* **Primary UI Elements (Cards, Inputs):** `bg-gray-800` (#1F2937)
* **Borders & Dividers:** `border-gray-700` (#374151)
* **Primary Text:** `text-gray-200` (#E5E7EB)
* **Secondary/Muted Text:** `text-gray-400` (#9CA3AF)
* **Primary Action Color (Buttons, Sliders, Links):** `bg-indigo-600` (#4F46E5)
* **Success/Confirmation:** `text-green-400` (#4ADE80)
* **Error/Warning:** `text-red-400` (#F87171)

#### Typography

* **Font:** Use **Inter** from Google Fonts.
* **Headings (`h1`, `h2`):** `text-xl` or `text-2xl`, `font-bold`, `text-white`
* **Sub-Headings/Section Titles:** `text-lg`, `font-semibold`, `text-gray-200`
* **Body/Input Text:** `text-base`, `font-normal`, `text-gray-200`
* **Labels/Small Text:** `text-sm`, `font-medium`, `text-gray-400`

#### Spacing & Layout

* **Base Unit:** 8px. Use Tailwind's spacing scale (e.g., `p-2` for 8px, `p-4` for 16px).
* **Layout:** Use Flexbox and Grid for all layouts (`flex`, `grid`, `gap-4`).
* **Inputs:** Should have a clear label above them and consistent padding (`px-3 py-2`).
* **Buttons:** Consistent padding (`px-4 py-2`), rounded corners (`rounded-lg`), and a subtle hover effect (`hover:bg-indigo-500`).
* **Cards/Sections:** Use `rounded-xl` for containers with `border` and `border-gray-700`.

### 5. Technical Stack & Performance

* **Framework:** **React** (using Vite for the build tool).
* **Styling:** **Tailwind CSS**.
* **State Management:** React Hooks (`useState`, `useContext`, `useReducer`). No need for Redux.
* **Data Persistence:**
    1.  **Local:** `chrome.storage.local` API for the extension.
    2.  **Cloud:** Google APIs (`gapi-script`) for Google Sign-In and Google Sheets integration.
* **Performance Optimization:**
    1.  **Memoization:** Use `React.memo` for components that don't need to re-render often. Use `useCallback` and `useMemo` for functions and expensive calculations to prevent unnecessary re-renders.
    2.  **Debouncing:** De-bounce inputs that trigger calculations to prevent the app from re-calculating on every single keystroke. A 200-300ms delay is ideal.
    3.  **Lazy Loading:** For the web app version, lazy load components that are not critical for the initial view (e.g., the Google Sheets integration logic).
    4.  **Bundle Size:** Keep the final build size small by using modern tools and avoiding heavy libraries.

### 6. Step-by-Step Development Plan (To-Do List)

Follow this phased approach. Complete each phase before moving to the next.

#### Phase 1: The Core Calculator (MVP)
* `[ ]` **1.1:** Set up a new React + Vite + Tailwind CSS project.
* `[ ]` **1.2:** Implement the basic UI layout: an input area and an output area.
* `[ ]` **1.3:** Create all the input fields for the "Simple Mode": Total Price, Total Views, Video Count, Story Count, and a basic platform checklist.
* `[ ]` **1.4:** Implement the core calculation logic using hard-coded default weights.
* `[ ]` **1.5:** Display the results in a clean, read-only output table. Ensure calculations update in real-time.
* `[ ]` **1.6:** Apply the full design system (Colors, Typography, Spacing).

#### Phase 2: Advanced Features & UI
* `[ ]` **2.1:** Create the "Advanced Mode" toggle.
* `[ ]` **2.2:** Build the advanced weighting UI: add sliders for platform-specific and content-type-specific weights.
* `[ ]` **2.3:** Update the calculation logic to use the new advanced weight inputs when in Advanced Mode.
* `[ ]` **2.4:** Build the UI for the Influencer Profile section (searchable dropdown, input fields for name, promocode, etc.) but without save/load functionality yet.

#### Phase 3: Local Data Persistence
* `[ ]` **3.1:** Implement the logic to Save, Load, and Update influencer profiles using `localStorage` (or `chrome.storage` if already in the extension shell).
* `[ ]` **3.2:** Implement the automatic saving of a new "Deal History" entry whenever a calculation is performed for a saved profile.
* `[ ]` **3.3:** Build the UI to view the list of deal history entries for the selected influencer.

#### Phase 4: Chrome Extension Shell
* `[ ]` **4.1:** Create the `manifest.json` file required for a Chrome Extension.
* `[ ]` **4.2:** Configure the manifest to use the Side Panel API (`"side_panel"`).
* `[ ]` **4.3:** Set up the build process to package the React app into the format required for a Chrome extension.
* `[ ]` **4.4:** Test the app running as a side panel in the Chrome browser. Ensure the responsive, vertical layout works correctly.

#### Phase 5: Google Sheets Integration (Stretch Goal)
* `[ ]` **5.1:** Add the Google API library to the project.
* `[ ]` **5.2:** Implement Google OAuth 2.0 for user sign-in.
* `[ ]` **5.3:** Create functions to read from and write to a specified Google Sheet using the Sheets API.
* `[ ]` **5.4:** Build the UI for the user to authenticate and link their Google Sheet.
* `[ ]` **5.5:** Implement the one-way "Sync to Sheets" functionality.

### 7. Success Metrics

* **Primary Metric:** Reduction in time spent creating a single payment request in the CRM.
* **Secondary Metrics:** User adoption (how many deals are calculated via the tool), user satisfaction, and data accuracy (reduction in calculation errors).