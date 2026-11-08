---
name: Sunday Rollers Design System
colors:
  surface: '#fbf8ff'
  surface-dim: '#d7d8f4'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2ff'
  surface-container: '#edecff'
  surface-container-high: '#e6e6ff'
  surface-container-highest: '#e0e0fc'
  on-surface: '#181a2e'
  on-surface-variant: '#5b403f'
  inverse-surface: '#2d2f44'
  inverse-on-surface: '#f1efff'
  outline: '#8f6f6e'
  outline-variant: '#e4bebc'
  surface-tint: '#bb152c'
  primary: '#b7102a'
  on-primary: '#ffffff'
  primary-container: '#db313f'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb3b1'
  secondary: '#7d5800'
  on-secondary: '#ffffff'
  secondary-container: '#ffb702'
  on-secondary-container: '#6b4b00'
  tertiary: '#006948'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855d'
  on-tertiary-container: '#f5fff7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b1'
  on-primary-fixed: '#410007'
  on-primary-fixed-variant: '#92001c'
  secondary-fixed: '#ffdea9'
  secondary-fixed-dim: '#ffba27'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4100'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#fbf8ff'
  on-background: '#181a2e'
  surface-variant: '#e0e0fc'
typography:
  display-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
  display-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Bricolage Grotesque
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Bricolage Grotesque
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  stat-display:
    fontFamily: Bricolage Grotesque
    fontSize: 44px
    fontWeight: '800'
    lineHeight: 48px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.75rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system channels the nostalgic, high-spirited energy of Sunday afternoons on the field: squeaking rubber cleats, ice-cold post-game coolers, chalked basepaths, and effortless camaraderie. The visual direction merges mid-century rec-league typography and collegiate pennant motifs with modern digital tactility. 

The aesthetic is energetic, friendly, and intentionally physical. It uses soft pill contours, subtle two-tone rim offsets reminiscent of vintage screen-printed uniforms, and sunny, high-chroma accents. The experience prioritizes joy, accessibility, and playful sportsmanship over aggressive corporate athletics.

## Colors

The palette draws directly from the kickball diamond:

- **Primary (`#E63946` — Kickball Red):** The iconic pebbled playground ball. Drives primary calls to action, active game highlights, home team markers, and urgent status states.
- **Secondary (`#FFB703` — Sunny Gold):** Midday sunlight, post-game trophies, and MVP banners. Adds warmth, enthusiasm, and badge accents.
- **Tertiary (`#059669` — Pitch Green):** Outfield grass and fresh chalked turf. Applied to win streaks, confirm states, active play tickers, and field-condition badges.
- **Neutral (`#2B2D42` — Deep Slate Navy):** Replaces harsh pure blacks with vintage sports-jacket ink tone. Used for readable body text, structural borders, and deep contrast elements.
- **Canvas (`#FDFBF7` — Cream Chalk):** Warm, unbleached cotton paper tone. Softens optical contrast and provides an inviting, non-sterile backdrop.
- **Surface (`#FFFFFF` — Clean Card):** Bright white card surfaces stacked on cream canvas to produce natural layers.

## Typography

The type system balances expressive personality with data clarity:

- **Headlines & Display (`Bricolage Grotesque`):** Its organic, quirky curves capture the bouncy personality of kickball culture while maintaining rhythmic structure. Tight leading and heavier weights (700/800) give titles the punch of vintage sports posters.
- **Body & Data (`Plus Jakarta Sans`):** Selected for its friendly rounded terminals that complement the headline voice while providing crisp legibility for league schedules, rosters, batting orders, and box scores.
- **Numeric Display:** Scores, inning numbers, and run differentials utilize tight tabular numbers inside `Bricolage Grotesque` to keep standings aligned.

## Layout & Spacing

This design system uses a flexible 12-column layout grid on desktop (max width: 1200px) that shifts to a 6-column grid on tablet, and a single-column or 2-column card stack on mobile. 

Generous whitespace softens card densities. Spacing tokens follow an 8pt base grid for clean hierarchy between roster rows, scoreboard cells, and match timeline cards. Section headers use `space-xl` separation, while related stats and tags cluster tightly with `space-xs` and `space-sm`.

## Elevation & Depth

Visual depth is achieved through tactile, low-blur "sticker" shadows and defined retro containment lines rather than heavy diffuse gradients:

- **Resting Layer (Surface Cards):** Pure white fill surrounded by a 1.5px border in `#2B2D42` at 12% opacity, backed by a solid drop shadow: `0px 4px 0px rgba(43, 45, 66, 0.08)`.
- **Interactive Hover Layer:** Translates up by 2px with an extended drop: `0px 6px 0px rgba(43, 45, 66, 0.12)`.
- **Primary Action Depth:** Key buttons use an opaque vintage drop-shelf: `0px 4px 0px #A8202D` on red buttons to create an extruded rubber-pad look.
- **Floating Modals & Flyouts:** Crisp 2px neutral border with an elevated shadow: `0px 12px 24px -4px rgba(43, 45, 66, 0.15)`.

## Shapes

The shape system is rounded, warm, and inviting. Base cards and panels maintain smooth `1rem` corner radii (`rounded-lg`), evoking classic rounded pennants and trading cards. Micro-interactive elements—pills, season switchers, and callout tags—use complete pill radius (`rounded-full`) to match the circular kickball motif.

## Components

### Buttons
- **Primary:** Kickball Red (`#E63946`) solid fill, white bold text, `rounded-full` or `rounded-lg` (0.75rem), equipped with the 4px deep bottom-edge shelf (`#A8202D`). On click/press, transforms downward 2px to mimic a physical rubber button.
- **Secondary:** Warm Cream fill with 1.5px `#2B2D42` border, neutral text, sunny gold hover tint.
- **Tertiary:** Borderless, soft Pitch Green or Warm Gold pill background with colored text for casual in-line actions.

### Cards & Leaderboards
- **Matchup & Score Cards:** Crisp white surfaces with light slate borders. Score numbers displayed in large `Bricolage Grotesque`. In-progress games show a pulsing Pitch Green badge.
- **Podium Ranking Cards:** Top 3 teams feature top-right corner pennant ribbons: 1st (Sunny Gold), 2nd (Silver Slate), 3rd (Warm Bronze). 
- **MVP Highlight Cards:** Decorated with a subtle sunburst or dashed-line retro perimeter, featuring circular player portrait avatars bordered in `#FFB703`.

### Chips & Badges
- **Pill Season Toggles:** Segmented selector surrounded by a pill container. Active state pops in bright Kickball Red with bold white typography.
- **Stat Callout Chips:** Compact pills with light-tinted backgrounds (e.g., 10% Pitch Green background with deep green text: "12 Kicks", "8 Runs").
- **Team Crest Avatars:** Circular boundary with a solid 2px outline and a small offset drop shadow. Displays either custom mascot art or bold two-letter abbreviations.

### Form Inputs & Checkboxes
- **Input Fields:** Thick rounded borders (1.5px) in `#2B2D42` at 20% opacity on warm white surfaces. Focusing switches border to `#E63946` with a soft 3px red-tint halo.
- **Checkboxes & Radios:** Smooth rounded squares and complete circles featuring custom kickball-textured checkmarks when checked.