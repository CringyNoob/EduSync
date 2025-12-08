# Soothing Color Palette Update 🎨

## Overview
Adopted a specific soothing color palette across the application to enhance user experience and visual comfort.

## 🎨 New Color Palette
| Color Name | Hex Code | Visual/Use Case |
|------------|----------|-----------------|
| **Celadon** | `#b8d8ba` | Soft green-blue, used for backgrounds, accents, and calm indicators |
| **Beige** | `#d9dbbc` | Warm neutral, used for base gradients and subtle borders |
| **Soft Apricot** | `#fcddbc` | Warm peach, used for engaging but soft highlights and marketplace items |
| **Cotton Candy** | `#ef959d` | Soft pink, used for forum interactions, alerts, and playful accents |
| **Taupe Grey** | `#69585f` | Strong neutral, used for text, borders, and structured elements |

## 🛠️ Implementation Details

### Tailwind Config
Added to `theme.extend.colors`:
```javascript
custom: {
    celadon: '#b8d8ba',
    beige: '#d9dbbc',
    'soft-apricot': '#fcddbc',
    'cotton-candy': '#ef959d',
    'taupe-grey': '#69585f',
}
```

### Component Updates

#### 1. Sidebar (`src/components/Sidebar/Sidebar.jsx`)
- **Background**: Soft gradient using `beige` and `white`.
- **Decorations**: Blobs using `celadon` and `soft-apricot`.
- **Navigation**:
  - Dashboard: `celadon` → `taupe-grey`
  - Marketplace: `soft-apricot` → `orange`
  - Forum: `cotton-candy` → `pink`
  - Notices: `beige` → `yellow`
  - Chat: `celadon` → `green`
  - Issues: `cotton-candy` → `red`
- **User Profile**: Border and subtle background using `celadon` and `soft-apricot`.

#### 2. Dashboard (`src/pages/dashboard/Home.jsx`)
- **Background Blobs**:
  - Top Right: `celadon`, `beige`, `soft-apricot`
  - Bottom Left: `cotton-candy`, `soft-apricot`, `beige`
  - Top Left/Center: `soft-apricot`, `cotton-candy`
  - Top Right: `celadon`, `beige`

#### 3. Layout (`src/components/Layout.jsx`)
- **Global Background**: `from-custom-beige/40 via-white to-custom-celadon/20`

#### 4. Marketplace Item Details (`src/pages/marketplace/MarketplaceItemDetails.jsx`)
- **Background**: `celadon` and `cotton-candy` blobs.

## 🎯 Benefits
- **Visual Harmony**: A cohesive set of colors that work well together.
- **Reduced Eye Strain**: Lower saturation compared to previous bright gradients.
- **Unique Identity**: Distinct look separate from generic "Bootstrap" or "Tailwind" default colors.
- **Professional & Friendly**: Balances sophistication (Taupe Grey) with approachability (Soft Apricot, Cotton Candy).

---

*Last Updated: December 2025*
