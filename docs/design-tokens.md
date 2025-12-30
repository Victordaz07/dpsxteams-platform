# DSP SYSTEM - DESIGN TOKENS
## Silicone Valley Logistic - Design System Specification

---

## 1️⃣ COLORES (Colors)

### SVL Brand Colors (Principales)
```json
{
  "svl-navy": "#0C1222",    // Navy oscuro - Sidebar, fondos principales
  "svl-blue": "#1E40AF",    // Azul primario - Botones, acciones principales
  "svl-green": "#22C55E",   // Verde éxito - Estados positivos, completados
  "svl-amber": "#F59E0B",   // Ámbar advertencia - Alertas, warnings
  "svl-dark": "#111827",    // Gris oscuro - Textos, fondos secundarios
  "svl-gray": "#6B7280",    // Gris medio - Textos secundarios
  "svl-light": "#F3F4F6"    // Gris claro - Fondos claros, superficies
}
```

### Performance Tier Colors (KPI Levels)
```json
{
  "platinum": "#C7D4E6",    // Nivel Platinum
  "gold": "#F7C948",        // Nivel Gold
  "silver": "#C0C0C0",      // Nivel Silver
  "bronze": "#B08D57"       // Nivel Bronze
}
```

### Primary System Colors
```json
{
  "primary": "#1E40AF",           // Color primario principal (mismo que svl-blue)
  "primary-foreground": "#FFFFFF", // Texto sobre primario
  "primary-blue": "#2264FF",      // Azul alternativo
  "soft-blue": "#E8F0FF"          // Azul suave para fondos
}
```

### Background & Surface Colors
```json
{
  "background": "#FFFFFF",              // Fondo principal (light mode)
  "foreground": "oklch(0.145 0 0)",     // ≈ #1F1F1F - Texto principal
  "card": "#FFFFFF",                    // Fondo de tarjetas
  "card-foreground": "oklch(0.145 0 0)", // Texto en tarjetas
  "popover": "oklch(1 0 0)",            // ≈ #FFFFFF - Fondo popovers
  "popover-foreground": "oklch(0.145 0 0)" // Texto en popovers
}
```

### Secondary & Muted Colors
```json
{
  "secondary": "oklch(0.95 0.0058 264.53)",     // ≈ #F1F1F4 - Fondos secundarios
  "secondary-foreground": "#030213",             // Texto sobre secundario
  "muted": "#ECECF0",                            // Gris muy claro - Fondos deshabilitados
  "muted-foreground": "#717182",                 // Texto deshabilitado/secundario
  "accent": "#E9EBEF",                           // Acento sutil
  "accent-foreground": "#030213"                 // Texto sobre acento
}
```

### Status & Feedback Colors
```json
{
  "success": "#22C55E",         // Verde (mismo que svl-green)
  "error": "#EF4444",           // Rojo error
  "warning": "#F59E0B",         // Ámbar (mismo que svl-amber)
  "info": "#1E40AF",            // Azul info (mismo que primary)
  "destructive": "#EF4444",     // Rojo destructivo
  "destructive-foreground": "#FFFFFF" // Texto sobre destructivo
}
```

### Border & Input Colors
```json
{
  "border": "rgba(0, 0, 0, 0.1)",    // Bordes generales (10% negro)
  "input": "transparent",             // Fondo de inputs (transparente)
  "input-background": "#F3F3F5",      // Fondo de inputs visible
  "switch-background": "#CBCED4",     // Fondo de switches
  "ring": "oklch(0.708 0 0)"          // ≈ #B3B3B3 - Focus ring
}
```

### Sidebar Colors
```json
{
  "sidebar": "#0C1222",                        // Fondo sidebar (svl-navy)
  "sidebar-foreground": "#F3F4F6",             // Texto sidebar (svl-light)
  "sidebar-primary": "#1E40AF",                // Primario sidebar (svl-blue)
  "sidebar-primary-foreground": "#FFFFFF",     // Texto sobre primario
  "sidebar-accent": "#111827",                 // Acento sidebar (svl-dark)
  "sidebar-accent-foreground": "#F3F4F6",      // Texto sobre acento
  "sidebar-border": "rgba(255, 255, 255, 0.1)", // Bordes sidebar (10% blanco)
  "sidebar-ring": "oklch(0.708 0 0)"           // Focus ring sidebar
}
```

### Chart Colors (Data Visualization)
```json
{
  "chart-1": "oklch(0.646 0.222 41.116)",  // ≈ #E88D2D - Naranja
  "chart-2": "oklch(0.6 0.118 184.704)",   // ≈ #6BADA6 - Turquesa
  "chart-3": "oklch(0.398 0.07 227.392)",  // ≈ #505A73 - Azul grisáceo
  "chart-4": "oklch(0.828 0.189 84.429)",  // ≈ #F4E44D - Amarillo
  "chart-5": "oklch(0.769 0.188 70.08)"    // ≈ #F7C948 - Dorado
}
```

### Dark Mode Colors
```json
{
  "dark": {
    "background": "#0C1222",              // Navy oscuro
    "foreground": "#F3F4F6",              // Gris claro
    "card": "#111827",                    // Gris oscuro
    "card-foreground": "#F3F4F6",         // Gris claro
    "popover": "#111827",                 // Gris oscuro
    "popover-foreground": "#F3F4F6",      // Gris claro
    "primary": "#1E40AF",                 // Azul (igual que light)
    "primary-foreground": "#FFFFFF",      // Blanco
    "secondary": "oklch(0.269 0 0)",      // ≈ #3D3D3D - Gris oscuro
    "secondary-foreground": "oklch(0.985 0 0)", // ≈ #FBFBFB - Casi blanco
    "muted": "oklch(0.269 0 0)",          // Gris oscuro
    "muted-foreground": "oklch(0.708 0 0)", // ≈ #B3B3B3 - Gris medio
    "accent": "oklch(0.269 0 0)",         // Gris oscuro
    "accent-foreground": "oklch(0.985 0 0)", // Casi blanco
    "destructive": "oklch(0.396 0.141 25.723)", // ≈ #7A3030 - Rojo oscuro
    "destructive-foreground": "oklch(0.637 0.237 25.331)", // ≈ #E76F6F - Rojo claro
    "border": "rgba(255, 255, 255, 0.1)", // Bordes claros (10% blanco)
    "input": "oklch(0.269 0 0)",          // Gris oscuro
    "ring": "oklch(0.439 0 0)",           // ≈ #6F6F6F - Gris medio
    "chart-1": "oklch(0.488 0.243 264.376)", // ≈ #5B3FD6 - Púrpura
    "chart-2": "oklch(0.696 0.17 162.48)",   // ≈ #60D4A8 - Verde agua
    "chart-3": "oklch(0.769 0.188 70.08)",   // ≈ #F7C948 - Dorado
    "chart-4": "oklch(0.627 0.265 303.9)",   // ≈ #D557D0 - Magenta
    "chart-5": "oklch(0.645 0.246 16.439)"   // ≈ #E97B5E - Coral
  }
}
```

---

## 2️⃣ TIPOGRAFÍA (Typography)

### Font Families
```json
{
  "font-sans": "'Inter', system-ui, -apple-system, sans-serif",
  "font-display": "'DM Sans', system-ui, -apple-system, sans-serif"
}
```

**Uso:**
- `Inter` - Texto general, cuerpo, párrafos, labels, inputs
- `DM Sans` - Títulos, headings, texto destacado

### Font Sizes
```json
{
  "text-xs": "0.75rem",      // 12px
  "text-sm": "0.875rem",     // 14px
  "text-base": "1rem",       // 16px (default)
  "text-lg": "1.125rem",     // 18px
  "text-xl": "1.25rem",      // 20px
  "text-2xl": "1.5rem",      // 24px
  "text-3xl": "1.875rem",    // 30px
  "text-4xl": "2.25rem",     // 36px
  "text-5xl": "3rem",        // 48px
  "text-6xl": "3.75rem",     // 60px
  "text-7xl": "4.5rem",      // 72px
  "text-8xl": "6rem",        // 96px
  "text-9xl": "8rem"         // 128px
}
```

**Base font size:** 16px (definido en `:root` como `--font-size: 16px`)

### Font Weights
```json
{
  "font-light": 300,
  "font-normal": 400,      // Default (--font-weight-normal)
  "font-medium": 500,      // Usado en headings (--font-weight-medium)
  "font-semibold": 600,
  "font-bold": 700,
  "font-extrabold": 800,
  "font-black": 900
}
```

**Uso predominante:**
- `400` (normal) - Texto general, inputs
- `500` (medium) - Headings (h1-h4), labels, buttons

### Line Heights
```json
{
  "leading-none": 1,
  "leading-tight": 1.25,
  "leading-snug": 1.375,
  "leading-normal": 1.5,     // Default para headings, labels, buttons
  "leading-relaxed": 1.625,
  "leading-loose": 2
}
```

**Default line-height:** `1.5` (para h1-h4, labels, buttons, inputs)

### Typography Elements Defaults
```css
h1 {
  font-size: 1.5rem;        // 24px (text-2xl)
  font-weight: 500;         // medium
  line-height: 1.5;
}

h2 {
  font-size: 1.25rem;       // 20px (text-xl)
  font-weight: 500;         // medium
  line-height: 1.5;
}

h3 {
  font-size: 1.125rem;      // 18px (text-lg)
  font-weight: 500;         // medium
  line-height: 1.5;
}

h4 {
  font-size: 1rem;          // 16px (text-base)
  font-weight: 500;         // medium
  line-height: 1.5;
}

label {
  font-size: 1rem;          // 16px (text-base)
  font-weight: 500;         // medium
  line-height: 1.5;
}

button {
  font-size: 1rem;          // 16px (text-base)
  font-weight: 500;         // medium
  line-height: 1.5;
}

input {
  font-size: 1rem;          // 16px (text-base)
  font-weight: 400;         // normal
  line-height: 1.5;
}
```

---

## 3️⃣ ESPACIADO (Spacing Scale)

### Tailwind Default Spacing (presente en proyecto)
```json
{
  "0": "0px",
  "0.5": "0.125rem",    // 2px
  "1": "0.25rem",       // 4px
  "1.5": "0.375rem",    // 6px
  "2": "0.5rem",        // 8px
  "2.5": "0.625rem",    // 10px
  "3": "0.75rem",       // 12px
  "3.5": "0.875rem",    // 14px
  "4": "1rem",          // 16px
  "5": "1.25rem",       // 20px
  "6": "1.5rem",        // 24px
  "7": "1.75rem",       // 28px
  "8": "2rem",          // 32px
  "9": "2.25rem",       // 36px
  "10": "2.5rem",       // 40px
  "11": "2.75rem",      // 44px
  "12": "3rem",         // 48px
  "14": "3.5rem",       // 56px
  "16": "4rem",         // 64px
  "20": "5rem",         // 80px
  "24": "6rem",         // 96px
  "28": "7rem",         // 112px
  "32": "8rem",         // 128px
  "36": "9rem",         // 144px
  "40": "10rem",        // 160px
  "44": "11rem",        // 176px
  "48": "12rem",        // 192px
  "52": "13rem",        // 208px
  "56": "14rem",        // 224px
  "60": "15rem",        // 240px
  "64": "16rem",        // 256px
  "72": "18rem",        // 288px
  "80": "20rem",        // 320px
  "96": "24rem"         // 384px
}
```

### Valores más usados en el proyecto:
```json
{
  "common": [
    "2px",    // 0.5
    "4px",    // 1
    "6px",    // 1.5
    "8px",    // 2
    "12px",   // 3
    "16px",   // 4
    "20px",   // 5
    "24px",   // 6
    "32px",   // 8
    "40px",   // 10
    "48px",   // 12
    "64px"    // 16
  ]
}
```

---

## 4️⃣ BORDER RADIUS

### Border Radius Scale
```json
{
  "radius-base": "0.625rem",              // 10px (--radius)
  "radius-sm": "calc(10px - 4px)",        // 6px
  "radius-md": "calc(10px - 2px)",        // 8px
  "radius-lg": "10px",                    // 10px (default)
  "radius-xl": "calc(10px + 4px)",        // 14px
  "radius-2xl": "1rem",                   // 16px
  "radius-3xl": "1.5rem",                 // 24px
  "radius-full": "9999px"                 // Completamente redondeado
}
```

### Tailwind Border Radius Classes
```json
{
  "rounded-none": "0px",
  "rounded-sm": "0.125rem",     // 2px
  "rounded": "0.25rem",         // 4px
  "rounded-md": "0.375rem",     // 6px
  "rounded-lg": "0.5rem",       // 8px
  "rounded-xl": "0.75rem",      // 12px
  "rounded-2xl": "1rem",        // 16px
  "rounded-3xl": "1.5rem",      // 24px
  "rounded-full": "9999px"
}
```

### Valores predominantes en el proyecto:
- **Cards:** `rounded-xl` (12px) o `rounded-lg` (8px)
- **Buttons:** `rounded-md` (6px) o `rounded-lg` (8px)
- **Inputs:** `rounded-md` (6px)
- **Badges:** `rounded-full` (pill shape)
- **Avatars:** `rounded-full`

---

## 5️⃣ SOMBRAS (Shadows)

### Box Shadows (Tailwind defaults usados)
```css
/* No hay box-shadows personalizadas definidas en theme.css */
/* Se usan las sombras por defecto de Tailwind */

shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 
        0 1px 2px -1px rgb(0 0 0 / 0.1);
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 
           0 2px 4px -2px rgb(0 0 0 / 0.1);
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 
           0 4px 6px -4px rgb(0 0 0 / 0.1);
shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 
           0 8px 10px -6px rgb(0 0 0 / 0.1);
shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
shadow-none: 0 0 #0000;
```

### Custom Glow Shadows (Animations)
```css
/* Pulse glow animation (usado en GPS tracking) */
pulse-glow-start: 0 0 5px rgba(34, 197, 94, 0.5);
pulse-glow-end: 0 0 20px rgba(34, 197, 94, 0.8);
```

### Valores predominantes:
- **Cards:** `shadow-sm` o `shadow-md`
- **Modals/Dialogs:** `shadow-lg` o `shadow-xl`
- **Dropdowns:** `shadow-lg`
- **Hover states:** `shadow-md` → `shadow-lg`

---

## 6️⃣ BREAKPOINTS

### Tailwind CSS Default Breakpoints
```json
{
  "sm": "640px",      // Small devices (landscape phones)
  "md": "768px",      // Medium devices (tablets)
  "lg": "1024px",     // Large devices (desktops)
  "xl": "1280px",     // Extra large devices (large desktops)
  "2xl": "1536px"     // 2X Extra large devices (larger desktops)
}
```

### Uso en el proyecto:
- **Mobile:** < 640px (default)
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px
- **Large Desktop:** > 1280px

### Responsive Patterns:
```css
/* Mobile first approach */
.component {
  /* Mobile styles (default) */
}

@media (min-width: 640px) {  /* sm */
  /* Tablet portrait */
}

@media (min-width: 768px) {  /* md */
  /* Tablet landscape */
}

@media (min-width: 1024px) { /* lg */
  /* Desktop */
}

@media (min-width: 1280px) { /* xl */
  /* Large desktop */
}
```

---

## 7️⃣ ANIMACIONES (Animations)

### Custom SVL Animations
```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Clase: animate-fadeIn */
/* Duración: 0.6s ease-in */

/* Pulse Dot (para indicadores de status) */
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
/* Clase: animate-pulse-dot */
/* Duración: 2s cubic-bezier(0.4, 0, 0.6, 1) infinite */

/* Pulse Glow (para GPS tracking) */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(34, 197, 94, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.8);
  }
}
/* Clase: animate-pulse-glow */
/* Duración: 2s ease-in-out infinite */
```

### Tailwind Built-in Animations (disponibles)
```json
{
  "animate-spin": "spin 1s linear infinite",
  "animate-ping": "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
  "animate-pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  "animate-bounce": "bounce 1s infinite"
}
```

---

## 8️⃣ Z-INDEX SCALE

### Valores comunes (no explícitamente definidos, pero usados)
```json
{
  "z-0": 0,
  "z-10": 10,         // Elementos elevados
  "z-20": 20,         // Dropdowns
  "z-30": 30,         // Fixed headers
  "z-40": 40,         // Overlays
  "z-50": 50,         // Modals, dialogs
  "z-auto": "auto"
}
```

### Uso en el proyecto:
- **Headers fijos:** `z-10`
- **Sidebars:** default (z-0)
- **Dropdowns/Popovers:** `z-20`
- **Modals/Dialogs:** `z-50`

---

## 9️⃣ OPACITY SCALE

### Tailwind Default Opacity (usados en el proyecto)
```json
{
  "opacity-0": 0,
  "opacity-5": 0.05,
  "opacity-10": 0.1,      // Usado en borders (rgba)
  "opacity-20": 0.2,
  "opacity-25": 0.25,
  "opacity-30": 0.3,
  "opacity-40": 0.4,
  "opacity-50": 0.5,
  "opacity-60": 0.6,
  "opacity-70": 0.7,
  "opacity-75": 0.75,
  "opacity-80": 0.8,
  "opacity-90": 0.9,
  "opacity-95": 0.95,
  "opacity-100": 1
}
```

### Valores usados con frecuencia:
- **Borders:** `0.1` (10%)
- **Overlays:** `0.5` (50%)
- **Disabled states:** `0.5` (50%)
- **Hover states:** `0.9` (90%)

---

## 🔟 TRANSITION & TIMING

### Transition Properties (implícitos en Tailwind)
```json
{
  "transition-none": "none",
  "transition-all": "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
  "transition": "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform 150ms cubic-bezier(0.4, 0, 0.2, 1)",
  "transition-colors": "background-color, border-color, color, fill, stroke 150ms cubic-bezier(0.4, 0, 0.2, 1)",
  "transition-opacity": "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)",
  "transition-shadow": "box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)",
  "transition-transform": "transform 150ms cubic-bezier(0.4, 0, 0.2, 1)"
}
```

### Duration Scale
```json
{
  "duration-75": "75ms",
  "duration-100": "100ms",
  "duration-150": "150ms",   // Default
  "duration-200": "200ms",
  "duration-300": "300ms",
  "duration-500": "500ms",
  "duration-700": "700ms",
  "duration-1000": "1000ms"
}
```

### Easing Functions
```json
{
  "ease-linear": "linear",
  "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
  "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
  "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)"
}
```

---

## 📋 TAILWIND CONFIG EQUIVALENTE

```javascript
// tailwind.config.js equivalent
module.exports = {
  theme: {
    extend: {
      colors: {
        // SVL Brand Colors
        'svl-navy': '#0C1222',
        'svl-blue': '#1E40AF',
        'svl-green': '#22C55E',
        'svl-amber': '#F59E0B',
        'svl-dark': '#111827',
        'svl-gray': '#6B7280',
        'svl-light': '#F3F4F6',
        
        // Performance Tiers
        'platinum': '#C7D4E6',
        'gold': '#F7C948',
        'silver': '#C0C0C0',
        'bronze': '#B08D57',
        
        // System Colors
        'primary-blue': '#2264FF',
        'soft-blue': '#E8F0FF',
        
        // Shadcn/UI tokens
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(34, 197, 94, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.8)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-in',
        'pulse-dot': 'pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
};
```

---

## 📝 NOTAS DE USO

### Modo de Color
El proyecto soporta **Light Mode** y **Dark Mode** mediante la clase `.dark` en el elemento raíz.

### CSS Variables
Todos los tokens están disponibles como CSS custom properties con el prefijo `--`:
- Colores: `--svl-blue`, `--primary`, etc.
- Espaciado: `--radius`
- Tipografía: `--font-sans`, `--font-display`

### Formato OKLCH
Algunos colores usan el espacio de color OKLCH (más moderno y perceptualmente uniforme):
- `oklch(L C H)` donde:
  - L = Lightness (0-1)
  - C = Chroma (saturación)
  - H = Hue (0-360)

### Conversión OKLCH a HEX (aproximada)
- `oklch(0.145 0 0)` ≈ `#1F1F1F` (negro casi puro)
- `oklch(1 0 0)` ≈ `#FFFFFF` (blanco)
- `oklch(0.708 0 0)` ≈ `#B3B3B3` (gris medio)

---

**Versión:** 1.0  
**Última actualización:** 29 de Diciembre, 2024  
**Sistema:** DSP System - Silicone Valley Logistic
