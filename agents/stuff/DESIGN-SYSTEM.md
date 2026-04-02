# SteppsAI Design System

Dit document beschrijft alle design- en themakeuzes voor hergebruik in andere projecten.

---

## Kleurenpalet

### Primaire Kleuren

| Naam | Hex | Gebruik |
|------|-----|---------|
| **Primary** | `#4f46e5` | Hoofdacties, buttons, links, focus states |
| **Secondary** | `#0ea5e9` | Secundaire acties, gradients |
| **Accent** | `#f43f5e` | Highlights, nadruk elementen |

### Gradient Combinatie

```css
--gradient-1: #4f46e5; /* Indigo */
--gradient-2: #0ea5e9; /* Sky Blue */
```

Gebruik: `linear-gradient(135deg, #4f46e5, #0ea5e9)`

### Indigo Schaal (Primary Color Scale)

| Step | Hex | CSS Variable |
|------|-----|--------------|
| 50 | `#eef2ff` | `--color-50` |
| 100 | `#e0e7ff` | `--color-100` |
| 200 | `#c7d2fe` | `--color-200` |
| 300 | `#a5b4fc` | `--color-300` |
| 400 | `#818cf8` | `--color-400` |
| 500 | `#6366f1` | `--color-500` |
| 600 | `#4f46e5` | `--color-600` (Primary) |
| 700 | `#4338ca` | `--color-700` |
| 800 | `#3730a3` | `--color-800` |
| 900 | `#312e81` | `--color-900` |
| 950 | `#1e1b4b` | `--color-950` |

### Neutrale Kleuren

#### Light Mode

| Naam | Hex | Gebruik |
|------|-----|---------|
| Background | `#FFFFFF` | Pagina achtergrond |
| Foreground | `#0f172a` | Primaire tekst |
| Muted | `#f1f5f9` | Subtiele achtergronden |
| Muted Foreground | `#64748b` | Secundaire tekst |
| Border | `#e2e8f0` | Randen, dividers |
| Input | `#e2e8f0` | Input velden |

#### Dark Mode

| Naam | Hex | Gebruik |
|------|-----|---------|
| Background | `#020617` | Pagina achtergrond (Slate 950) |
| Foreground | `#f8fafc` | Primaire tekst (Slate 50) |
| Muted | `#1e293b` | Subtiele achtergronden (Slate 800) |
| Muted Foreground | `#94a3b8` | Secundaire tekst |
| Border | `#1e293b` | Randen, dividers |

### Functionele Kleuren

| Naam | Hex | Gebruik |
|------|-----|---------|
| Destructive | `#ef4444` | Error states, delete acties |
| Ring | `#4f46e5` | Focus ring (= Primary) |

---

## Typografie

### Font Families

| Naam | Font | Gebruik |
|------|------|---------|
| **Sans (Body)** | `Inter` | Alle body tekst |
| **Display** | `Space Grotesk` | Headlines, titels |
| **Serif** | `Roboto Serif` | Optioneel voor accenten |
| **Mono** | `Roboto Mono` | Code snippets |
| **Cursive** | `Caveat`, `Kalam` | Handgeschreven accenten |
| **Playfair** | `Playfair Display` | Elegante titels |

### Font Weights

- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## Spacing & Border Radius

### Border Radius

| Naam | Waarde |
|------|--------|
| Default (LG) | `0.5rem` (8px) |
| MD | `0.375rem` (6px) |
| SM | `0.25rem` (4px) |
| XS | `0.25rem` (4px) |
| Full | `9999px` (pills/badges) |

### Breakpoints

| Naam | Waarde |
|------|--------|
| SM | `640px` |
| MD | `768px` |
| LG | `1024px` |
| XL | `1280px` |
| 2XL | `1400px` |

---

## Component Styles

### Glassmorphism Buttons

#### Primary Button

```css
.btn-glass-primary {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.95) 0%, rgba(79, 70, 229, 0.85) 100%);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 0 rgba(0, 0, 0, 0.1);
  border-radius: 9999px; /* Full rounded */
}
```

#### Secondary Button

```css
.btn-glass-secondary {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.65) 100%);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.8),
              inset 0 -1px 0 0 rgba(0, 0, 0, 0.05);
  border-radius: 9999px;
}
```

### Card Styling

```css
.card {
  background: var(--card); /* #FFFFFF light, #020617 dark */
  border: 1px solid var(--border);
  border-radius: 0.5rem;
}
```

### Sidebar (Light Mode)

| Element | Hex |
|---------|-----|
| Background | `#e0e7ff` (color-100) |
| Text | `#4338ca` (color-700) |
| Active | `#4f46e5` (primary) |
| Accent BG | `#c7d2fe` (color-200) |
| Border | `#c7d2fe` (color-200) |

---

## Gradient Text Effect

```css
.text-gradient {
  background: linear-gradient(135deg, #4f46e5, #0ea5e9);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
```

Tailwind variant:
```html
<span class="bg-gradient-to-r from-[#4f46e5] to-[#0ea5e9] bg-clip-text text-transparent">
  Gradient Text
</span>
```

---

## Achtergrond Effecten

### Hero Clouds (Soft Gradient Background)

Meerdere overlappende radial gradients met indigo tinten:

```css
.bg-hero-clouds {
  background-image:
    linear-gradient(to bottom, transparent 70%, white 90%),
    radial-gradient(circle at 20% 40%, rgba(255, 255, 255, 0.8) 0%, transparent 35%),
    radial-gradient(circle at 15% 15%, var(--color-300) 0%, transparent 55%),
    radial-gradient(circle at 25% 65%, var(--color-400) 0%, transparent 45%);
}
```

### Glow Effect

```css
.glow {
  background: rgba(79, 70, 229, 0.1); /* primary/10 */
  filter: blur(80px);
  border-radius: 9999px;
}
```

---

## Chart Kleuren

### Light Mode

| Chart | HSL |
|-------|-----|
| Chart 1 | `hsl(221.2 83.2% 53.3%)` |
| Chart 2 | `hsl(212 95% 68%)` |
| Chart 3 | `hsl(216 92% 60%)` |
| Chart 4 | `hsl(210 98% 78%)` |
| Chart 5 | `hsl(212 97% 87%)` |

### Dark Mode

| Chart | HSL |
|-------|-----|
| Chart 1 | `hsl(220 70% 50%)` |
| Chart 2 | `hsl(160 60% 45%)` |
| Chart 3 | `hsl(30 80% 55%)` |
| Chart 4 | `hsl(280 65% 60%)` |
| Chart 5 | `hsl(340 75% 55%)` |

---

## Design Systeem Basis

- **UI Framework**: shadcn/ui (New York style)
- **CSS Framework**: Tailwind CSS v4
- **Theming**: CSS Variables met `.dark` class toggle
- **Icons**: Lucide React

---

## Samenvatting Kernkleuren

```
Primary:     #4f46e5 (Indigo 600)
Secondary:   #0ea5e9 (Sky 500)
Accent:      #f43f5e (Rose 500)
Destructive: #ef4444 (Red 500)
Background:  #FFFFFF / #020617
Foreground:  #0f172a / #f8fafc
Border:      #e2e8f0 / #1e293b
```
