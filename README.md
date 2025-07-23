# Influencer Deal & Profile Manager

## Project Goal
You are an expert AI software developer. Your task is to build a sophisticated tool for a marketing manager, starting as a web application and designed to function as a Chrome Extension. The tool will calculate itemized deal pricing and manage influencer data, with options for both simple, quick calculations and advanced, detailed management.

## Core Functionality & UI Flow
The app will have two primary modes: Simple Mode and Advanced Mode, controlled by a toggle.

**Simple Mode (Default View):** A clean, minimalist calculator. The user can quickly input total price/views and content quantities to get an immediate breakdown based on default weights. This is for rapid, on-the-fly calculations.

**Advanced Mode:** Clicking an "Advanced" button reveals all other features: Influencer Profile selection, Deal History, detailed Weighting controls, and data management options.

## UI & Technology

### Layout

**Web App:** A clean, single-page, two-column layout (Inputs/Management on left, Outputs on right).

**Chrome Extension:** The extension must be a Side Panel. The UI should be responsive and stack vertically (mobile view), with Inputs, Management, and Outputs appearing one under the other in the panel.

### Technology

**Frontend:** React or Vue.js. The app must be fully responsive.

**Data:** All calculations should be client-side. For data persistence (profiles/history), use the browser's localStorage for simplicity initially, with Google Sheets integration as a more advanced goal.

**UI Controls:** Use intuitive controls like sliders for weights, searchable dropdowns for profiles, and icons for actions like "add note."

## Calculation Logic & Formulas (Advanced)
This logic applies when in Advanced Mode, allowing for granular control. In Simple Mode, it uses pre-set default weights.

### Variables

- **P_total** = Total Deal Price
- **V_total** = Total Expected Views
- **N_p,c** = Number of posts for a given platform 'p' and content type 'c' (e.g., N_youtube,video).
- **W_P,p,c** = Price Weight for platform 'p' and content type 'c'. This is the user-defined relative value (e.g., YouTube Video = 15, IG Story = 1).
- **W_V,p,c** = Views Weight for platform 'p' and content type 'c'.

### Price Calculation

1. Calculate total weighted price units:
   ```
   U_price_total = Σ(N_p,c × W_P,p,c)
   ```

2. Calculate the value of a single "base price unit" (where weight = 1):
   ```
   Price per base unit = P_total / U_price_total
   ```

3. Calculate the price for each specific post:
   ```
   Price for post (p,c) = Price per base unit × W_P,p,c
   ```

### Views Calculation
The same logic applies, substituting the Views Weight (W_V) and Total Views (V_total).

## Data Management & Persistence (Advanced Feature)
This entire section is visible only in Advanced Mode.

### 1. Influencer Profiles

**Selector:** A searchable dropdown menu to find and select an existing influencer. The dropdown should display Name (PROMOCODE) for easy identification.

**Profile Fields:** When creating or editing a profile, include these fields:
- Influencer Name (OPTIONAL)
- PROMOCODE (Required)
- Link (Optional, for their main profile links)
- Notes: An + icon button that adds a new, empty text field for miscellaneous notes. Multiple notes can be added.
- Platform-specific weight settings can also be saved within the profile.

**Actions:** "Create New Profile" and "Save Profile" buttons.

### 2. Deal History

Once a calculation is performed for a saved influencer profile, the entire deal (inputs and outputs) is automatically saved as a new entry in that influencer's "Deal History."

The history should be viewable as a list of past deals (e.g., by date), and clicking one should load its details.

### 3. Google Sheets Integration

**Goal:** Use a single Google Sheet as the database for all influencer profiles and deal history.

**Functionality:**
- **Authentication:** The user must authenticate with their Google account to link a specific Google Sheet.
- **Export/Sync:** A "Sync to Google Sheets" button that pushes all saved profile and deal data to the sheet.
- **Bi-directional Editing (Advanced Goal):** The ability to add or edit influencer profiles directly in the Google Sheet, and have those changes reflected back in the extension upon the next sync. Note to developer: Implement one-way push first, as two-way sync is significantly more complex.

## Chrome Extension Implementation Notes

### Manifest (manifest.json)
- Configure the "side_panel" property to enable the side panel UI.
- Request necessary permissions: "storage" for local data, "identity" for Google Sign-In, and potentially "activeTab" if you add auto-fill functionality later.

### Storage
Use chrome.storage.local to store all profile and deal history data. This is a persistent, browser-based storage solution perfect for this use case. It is a simpler starting point before tackling the Google Sheets API.

### Future Auto-fill
For a future version, a content script (content_scripts) could be injected into the company's CRM page to read the DOM and provide a button to auto-fill the calculated data into the correct form fields.
