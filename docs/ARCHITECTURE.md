# Architecture Overview

## System Context

```
                    ┌──────────────────────────────────────────────┐
                    │           LOUIS POLO GS1 SYSTEM              │
                    │                                              │
  Factory Staff     │  ┌──────────┐  ┌───────────┐  ┌──────────┐  │
  (Mobile Browser)──┼─▶│ React UI │─▶│ Cloudinary│  │  Google   │  │
                    │  │ (Vite)   │  │ (Photos)  │  │  Sheets   │  │
                    │  │          │─▶│           │  │  (Data)   │  │
                    │  │          │──────────────┼─▶│           │  │
                    │  │          │◀─────────────┼──│ Apps Scrpt│  │
                    │  └──────────┘  └───────────┘  └──────────┘  │
                    └──────────────────────────────────────────────┘
```

## State Management

The app uses a single-source-of-truth state pattern at the `App` level:

```
App.jsx
├── phase: string          → Controls which screen is visible
├── data: object           → All form field values (name, photos, specs)
├── submitState: object    → Upload progress/error state
└── editMode: object|null  → null = create mode, { rowNumber } = edit mode
```

**Why not Redux/Zustand?** The app has a linear wizard flow with no parallel state needs.
Prop drilling is explicit and traceable, which is preferable at this complexity level.

## Data Flow

### Create Flow
```
User Input → data state → handleSubmit()
  → uploadToCloudinary(frontPhotos[]) → Cloudinary URLs
  → uploadToCloudinary(backPhoto) → Cloudinary URL
  → uploadToCloudinary(packagingPhoto) → Cloudinary URL
  → submitToSheets(payload) → Apps Script doPost() → Sheet.appendRow()
```

### Edit Flow
```
fetchProducts() → Apps Script doGet() → Product List
  → User taps product → startEdit(product)
  → Converts sheet URLs back to photo objects with { url, preview }
  → Same wizard flow, pre-filled
  → handleSubmit() detects editMode
  → Only re-uploads photos that have a new .file (user replaced them)
  → updateInSheets(payload) → Apps Script doPost({ action: "update" })
```

### Photo State Shape

```js
// Single photo (back, packaging):
{ file: File, preview: "data:image/..." }          // New capture
{ url: "https://...", preview: "https://..." }      // Existing from sheet
null                                                 // No photo

// Multi-photo (front, up to 5):
[
  { file: File, preview: "data:image/..." },        // New capture
  { url: "https://...", preview: "https://..." },   // Existing from sheet
]
```

## Phase Machine

```
splash → welcome ──→ step1 → step2 → step3 → step4 → step5 → review → submitting → success
              │                                                    ↑           │
              └──→ products ──→ step1 (edit mode) ─── ... ────────┘           │
                                                                               │
              ◀────────────────────────────────────────────────────────────────┘
                                        (resetForm)
```

## Error Handling Strategy

| Layer | Strategy |
|---|---|
| Photo upload | `try/catch` with retry via UI (user taps back to review, re-submits) |
| Sheet write | Fire-and-forget (`no-cors`). Console error logged. |
| Sheet read | `try/catch` → error state in ProductListScreen with Retry button |
| Form validation | Per-field error state, prevents progression |

## Security Notes

- **No auth**: This is an internal tool on a private network. Add auth if exposed publicly.
- **Cloudinary**: Uses unsigned upload preset. Restrict to specific folders in Cloudinary settings.
- **Apps Script**: "Anyone" access. The sheet ID provides minimal obscurity, not security.
- **No secrets in frontend**: All config values are non-sensitive (cloud name, preset, public URL).
