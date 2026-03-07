# Louis Polo — GS1 Product Data Entry

> Internal tool for capturing and managing product data from the factory floor for GS1 registration.

Built with **React 18 + Vite** · Photos via **Cloudinary** · Data via **Google Sheets + Apps Script**

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Google Sheets Backend Setup](#google-sheets-backend-setup)
- [Folder Structure](#folder-structure)
- [App Flow](#app-flow)
- [API Reference](#api-reference)
- [Component Reference](#component-reference)
- [Customization Guide](#customization-guide)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

This mobile-first React app allows factory floor staff to:

1. **Create** product entries — name, photos (front ×5, back, packaging/barcode), MRP, weights
2. **Browse** all saved products with search and missing-data indicators
3. **Edit** any existing product — update fields, replace/add photos, re-submit

Data flows: **App → Cloudinary (photos) → Google Sheets (structured data)**

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│  React App  │────▶│  Cloudinary  │     │  Google Sheets  │
│  (Vite PWA) │     │  (Image CDN) │     │  (Data Store)   │
│             │────▶│              │     │                 │
│             │────────────────────────▶│  Apps Script    │
│             │◀────────────────────────│  (REST API)     │
└─────────────┘     └──────────────┘     └────────────────┘

Photo Upload:   App → Cloudinary → returns secure_url
Data Write:     App → Apps Script doPost() → Sheet.appendRow / updateRow
Data Read:      App → Apps Script doGet() → returns JSON array of products
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| Google Sheets as DB | Zero-cost, familiar to ops team, easy auditing |
| Cloudinary for photos | Free tier generous, auto-optimization, CDN delivery |
| `no-cors` for writes | Apps Script doesn't return CORS headers; fire-and-forget is acceptable |
| Standard `fetch` for reads | `doGet` returns proper JSON with CORS support |
| Multi-step wizard | Mobile-friendly, reduces cognitive load on factory floor |
| Functional updater pattern for multi-photo | Prevents race conditions when adding multiple photos rapidly |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 8
- A Google account (for Sheets + Apps Script)
- A Cloudinary account (free tier works)

### Install & Run

```bash
git clone <repo-url>
cd lp-gs1-product-entry
npm install
npm run dev
```

Opens at `http://localhost:5173`. Since `host: true` is set in Vite config, you can also access it from your phone on the same Wi-Fi network at `http://<your-local-ip>:5173`.

---

## Configuration

All external service configuration lives in `src/config.js`:

```js
export const CONFIG = {
  CLOUDINARY_CLOUD_NAME: "your-cloud-name",       // Cloudinary dashboard → Cloud Name
  CLOUDINARY_UPLOAD_PRESET: "your-preset",         // Cloudinary → Settings → Upload Presets
  GOOGLE_SHEETS_URL: "https://script.google.com/macros/s/.../exec",  // Apps Script Web App URL
}
```

### Environment-Specific Notes

- **Development**: The app works without Sheets configured — it logs payloads to console.
- **Production**: All three values must be set for full functionality.

---

## Google Sheets Backend Setup

### 1. Create the Sheet

Create a Google Sheet with these exact headers in Row 1:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Timestamp | Product Name | MRP | Net Weight (kg) | Gross Weight (kg) | Front Photos | Back Photo | Packaging Photo |

### 2. Install the Apps Script

1. Open your sheet → **Extensions → Apps Script**
2. Delete the default code
3. Paste the contents of `backend/google-apps-script.js`
4. Replace `SPREADSHEET_ID` with your sheet ID (from the URL)
5. Save (Ctrl+S)

### 3. Deploy as Web App

1. **Deploy → New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Click **Deploy** → Authorize when prompted
6. Copy the Web App URL → paste into `src/config.js`

### 4. Updating the Script

When you update the Apps Script code:

1. **Deploy → Manage deployments → Edit (pencil icon)**
2. Version: **New version**
3. Click **Deploy**

> ⚠️ If you create a *new* deployment instead of updating, you'll get a new URL.

---

## Folder Structure

```
lp-gs1-product-entry/
├── index.html                              # Vite HTML entry point
├── vite.config.js                          # Vite config (host: true for mobile testing)
├── package.json                            # Dependencies and scripts
├── .gitignore
├── README.md                               # ← You are here
│
├── src/
│   ├── main.jsx                            # React DOM mount point
│   ├── App.jsx                             # Root component — phase orchestration + state
│   ├── styles.css                          # Global styles + keyframe animations
│   ├── config.js                           # External service configuration
│   ├── tokens.js                           # Design tokens — colors, fonts, shared styles
│   ├── api.js                              # API layer — Cloudinary upload, Sheets CRUD
│   │
│   ├── hooks/
│   │   └── useStepAnimation.js             # Reusable enter-animation hook
│   │
│   ├── utils/
│   │   └── helpers.js                      # Pure utility functions
│   │
│   └── components/
│       ├── LogoImg.jsx                     # Brand logo (text-based, replaceable)
│       ├── Grain.jsx                       # SVG noise texture overlay
│       ├── Splash.jsx                      # Animated splash/loading screen
│       ├── WelcomeScreen.jsx               # Home — start entry or view products
│       ├── StepHeader.jsx                  # Progress bar + back button
│       ├── StepProductInfo.jsx             # Step 1: Product name input
│       ├── PhotoStep.jsx                   # Steps 2-4: Single or multi-photo capture
│       ├── StepSpecs.jsx                   # Step 5: MRP + weights
│       ├── ReviewScreen.jsx                # Pre-submit review (create or edit)
│       ├── SubmittingScreen.jsx            # Upload progress / error state
│       ├── SuccessScreen.jsx               # Confirmation (create or edit)
│       ├── ProductListScreen.jsx           # Browse/search all products
│       └── FloatingMenu.jsx               # Persistent navigation FAB
│
├── backend/
│   └── google-apps-script.js               # Apps Script — paste into Google Sheets
│
└── docs/
    └── ARCHITECTURE.md                     # Detailed architecture documentation
```

---

## App Flow

### Create Flow (New Product)

```
Splash → Welcome → Step 1 (Name) → Step 2 (Front Photos ×5)
→ Step 3 (Back Photo) → Step 4 (Packaging Photo) → Step 5 (MRP/Weights)
→ Review → Submitting → Success
```

### Edit Flow (Existing Product)

```
Welcome/Menu → Product List → Tap Product → Step 1 (pre-filled)
→ ... same steps ... → Review ("Confirm changes") → Submitting → Success ("Product updated")
```

### Navigation

- **Back button**: Each step has a back button to the previous step
- **Floating menu**: Visible on all screens (except splash/submitting), gives quick access to Product List or New Product

---

## API Reference

### `api.js` Exports

| Function | Params | Returns | Description |
|---|---|---|---|
| `uploadToCloudinary(photoObj)` | `{ file: File }` | `Promise<string\|null>` | Uploads image, returns secure URL |
| `submitToSheets(payload)` | `object` | `void` (fire-and-forget) | Appends new row to sheet |
| `updateInSheets(payload)` | `object` with `rowNumber` | `void` (fire-and-forget) | Updates existing row in sheet |
| `fetchProducts()` | none | `Promise<Product[]>` | Fetches all products from sheet |

### Apps Script Endpoints

| Method | Action | Request Body | Response |
|---|---|---|---|
| `GET` | List all products | — | `{ status, products: [...] }` |
| `POST` | Create product | `{ productName, mrp, ... }` | `{ status, message, row }` |
| `POST` | Update product | `{ action: "update", rowNumber, ... }` | `{ status, message, row }` |

### Product Object Shape

```js
{
  rowNumber: 2,                              // Sheet row (1-indexed, row 1 = headers)
  timestamp: "2026-03-06 14:30:00",          // IST formatted
  productName: "SkyTrial Blue 20 inches",
  mrp: "2999",
  netWeight: "2.5",
  grossWeight: "3.2",
  frontPhotoUrls: "https://..., https://...",  // Comma-separated Cloudinary URLs
  backPhotoUrl: "https://...",
  packagingPhotoUrl: "https://...",
}
```

---

## Component Reference

### Core Components

| Component | Props | Description |
|---|---|---|
| `App` | — | Root. Manages phase state, form data, edit mode, and submit logic |
| `Splash` | `onDone` | Animated brand intro (auto-advances after ~3.9s) |
| `WelcomeScreen` | `onStart, onViewProducts` | Landing page with CTA buttons |
| `ProductListScreen` | `onBack, onEdit` | Fetches + displays all products, search, missing-data badges |
| `FloatingMenu` | `visible, onViewProducts, onNewProduct` | Persistent FAB with dropdown |

### Form Step Components

| Component | Props | Description |
|---|---|---|
| `StepHeader` | `step, total, onBack` | Progress bar + navigation |
| `StepProductInfo` | `data, onChange, onNext, onBack` | Product name input with validation |
| `PhotoStep` | `title, subtitle, photo, onPhoto, onNext, onBack, stepNum, totalSteps, maxPhotos` | Single or multi-photo capture. `maxPhotos > 1` enables gallery mode |
| `StepSpecs` | `data, onChange, onNext, onBack` | Numeric inputs for MRP, net weight, gross weight |
| `ReviewScreen` | `data, onSubmit, onBack, isEdit` | Summary view. Shows "Update Product" in edit mode |
| `SubmittingScreen` | `status, message` | Spinner or error display during upload |
| `SuccessScreen` | `productName, onNew, isEdit` | Confirmation with contextual messaging |

### Shared / Utility

| Component | Props | Description |
|---|---|---|
| `LogoImg` | `size, invert` | Text-based brand logo |
| `Grain` | — | SVG fractal noise overlay for texture |

---

## Customization Guide

| Want to... | Edit this file |
|---|---|
| Change colors, fonts, spacing | `src/tokens.js` |
| Add/remove form fields | `StepProductInfo.jsx` or `StepSpecs.jsx` |
| Change photo step count/limits | `App.jsx` (adjust `maxPhotos` prop) |
| Update Cloudinary/Sheets config | `src/config.js` |
| Replace the brand logo | `src/components/LogoImg.jsx` |
| Change splash animation timing | `src/components/Splash.jsx` |
| Modify what's sent to Sheets | `src/api.js` + `App.jsx` (handleSubmit) |
| Add a new form step | Create component, add phase in `App.jsx` |
| Change product list behavior | `src/components/ProductListScreen.jsx` |

### Adding a New Form Step

1. Create `src/components/StepNewField.jsx` (copy `StepProductInfo.jsx` as template)
2. In `App.jsx`, add a new phase string (e.g., `"step6"`)
3. Update `totalSteps` across all step components
4. Wire the new phase into the `handleSubmit` payload
5. Update `backend/google-apps-script.js` to include the new column

---

## Deployment

### Static Hosting (Vercel / Netlify / Cloudflare Pages)

```bash
npm run build
```

Upload the `dist/` folder to your preferred host, or connect your Git repo for auto-deploy.

### Vercel CLI

```bash
npx vercel --prod
```

### Environment Notes

- This is a **static SPA** — no server runtime required
- All API calls go to external services (Cloudinary, Apps Script)
- CORS is handled by Cloudinary natively; Sheets uses `no-cors` for writes

---

## Contributing

### Code Style

- **Components**: Functional components with hooks. No class components.
- **State**: `useState` at the App level, prop-drilled down. No external state library needed at this scale.
- **Styling**: Inline styles using design tokens from `tokens.js`. No CSS modules or Tailwind.
- **Naming**: PascalCase for components, camelCase for functions/variables, SCREAMING_CASE for constants.
- **Documentation**: JSDoc for all exported functions. Inline comments for non-obvious logic.

### Git Conventions

```
feat: add barcode scanning step
fix: prevent double-submit on slow networks
docs: update API reference for new fields
refactor: extract photo upload logic into hook
```

### Pull Request Checklist

- [ ] All existing steps still work (manual test on mobile)
- [ ] New fields propagated to: form → review → api.js → Apps Script → Sheet headers
- [ ] JSDoc added for new exports
- [ ] README updated if public API changed

---

## License

Internal tool — Louispolo Fashion India Private Limited. Not for redistribution.
