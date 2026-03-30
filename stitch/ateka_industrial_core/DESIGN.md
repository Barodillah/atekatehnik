# Engineering Elegance: Industrial Design System

## 1. Overview & Creative North Star
The "Creative North Star" for this design system is **The Industrial Precisionist**. 

While many B2B industrial sites feel cluttered and mechanical, this system treats heavy machinery with the reverence of a luxury timepiece. We move beyond "standard" corporate layouts by embracing **Intentional Asymmetry** and **Tonal Depth**. The goal is to reflect the stability of Ateka Tehnik’s engineering while evoking the organic warmth of the agricultural sector. 

By leveraging high-contrast typography scales and layered surfaces, we create a "Digital Editorial" experience—where white space is not "empty," but is a structural element used to direct the eye toward precision-engineered details.

---

## 2. Colors: Tonal Architecture
We utilize a sophisticated palette that balances the cold strength of navy steel with the warmth of harvest gold.

### The "No-Line" Rule
**Explicit Instruction:** Prohibit the use of 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` (#f3f4f5) section should sit directly against a `surface` (#f8f9fa) background. This creates a high-end, seamless appearance that feels architectural rather than "boxed in."

### Palette Strategy
*   **Primary (Navy Depth):** `primary-container` (#001f5b) serves as our foundational anchor. Use it for high-authority moments and deep-contrast backgrounds.
*   **Secondary (Agricultural Gold):** `secondary` (#904d00) and `secondary-container` (#ffa454) represent innovation and the rice "padi" theme. Use these sparingly as surgical accents to draw attention to CTAs or key data points.
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers.
    *   **Level 0:** `surface` (#f8f9fa) – The base canvas.
    *   **Level 1:** `surface-container-low` (#f3f4f5) – Secondary content areas.
    *   **Level 2:** `surface-container-highest` (#e1e3e4) – Interactive elements or highlighted modules.
*   **Signature Textures:** For Hero backgrounds or primary CTAs, do not use flat colors. Apply a subtle linear gradient from `primary` (#000c2e) to `primary-container` (#001f5b) at a 135-degree angle to add a "machined metal" sheen.

---

## 3. Typography: The Authority Scale
Typography is our primary tool for conveying engineering precision. We pair the structural weight of **Manrope** (serving as a modern evolution of Montserrat for better digital legibility) with the functional clarity of **Inter**.

*   **Display (Display-LG, MD):** Use Manrope with tight letter-spacing (-0.02em) for hero headlines. This conveys the massive scale of industrial machinery.
*   **Headlines (Headline-LG):** Manrope. Bold and authoritative. Use these to frame the "narrative" of the page.
*   **Body (Body-LG, MD):** Inter. Set `body-lg` at 1rem with a generous line-height (1.6) to ensure technical specifications are easily digestible.
*   **Labels (Label-MD):** Inter All-Caps. Use these for "Technical Data" or "Machine Specs" to mimic the look of etched industrial plates.

---

## 4. Elevation & Depth: Tonal Layering
In this system, "Depth" replaces "Dividers." We avoid the "floating card" cliché in favor of integrated layering.

*   **The Layering Principle:** Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f3f4f5) section. The subtle shift in hex code creates a "soft lift" that feels premium and intentional.
*   **Ambient Shadows:** If an element must float (e.g., a sticky navigation bar or a modal), use a shadow with a blur of `32px` at `4%` opacity, using a tint of `on-surface` (#191c1d). This mimics natural laboratory lighting.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline-variant` (#c5c6d1) at **20% opacity**. This creates a "suggestion" of a boundary without breaking the minimalist flow.
*   **Glassmorphism:** For overlays or mobile menus, use `surface-container-lowest` at 80% opacity with a `20px` backdrop-blur. This allows the high-quality industrial imagery to bleed through, softening the interface.

---

## 5. Components: Precision Primitives

### Buttons: The "Machine Cut" Variant
*   **Primary:** `primary-container` (#001f5b) background with `on-primary` (#ffffff) text. Use `rounded-sm` (0.125rem) for a sharp, industrial feel. 
*   **Secondary:** `surface-container-highest` (#e1e3e4) background. No border.
*   **Tertiary:** Text-only in `primary-container`, using an "Agricultural Gold" underline on hover.

### Inputs & Fields
*   **Text Inputs:** Use a `surface-container-low` fill. Instead of a 4-sided border, use a 2px bottom-stroke of `outline-variant` that transitions to `secondary` (Gold) on focus.
*   **Status Chips:** Use `secondary-fixed` (#ffdcc3) with `on-secondary-fixed` (#2f1500) for "New Model" or "In Stock" indicators.

### Cards & Industrial Lists
*   **Card Strategy:** Forbid the use of divider lines. Separate product specs using `spacing-4` (1.4rem) of vertical white space.
*   **Machine Specs Table:** Use alternating row fills of `surface` and `surface-container-low`. This "zebra-striping" provides legibility without the visual noise of grid lines.

### Featured Component: "The Specification Blueprint"
A bespoke component for rice milling machines: A large-scale technical drawing (high-quality PNG) layered over a `surface-container-lowest` background, with floating "Hotspot" chips that reveal Inter `label-sm` technical data upon interaction.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins. For example, a headline might be offset further to the left than the body text to create a dynamic, editorial feel.
*   **Do** use high-quality, desaturated imagery of steel machinery, allowing the "Agricultural Gold" accents in the UI to provide the color.
*   **Do** use the `rounded-sm` (0.125rem) or `none` (0px) radius for most components to maintain a "sharp-edged" industrial aesthetic.

### Don’t:
*   **Don’t** use 100% black (#000000). Use `primary` (#000c2e) for deep blacks to maintain a premium tonal range.
*   **Don’t** use standard shadows. If it looks like a "drop shadow," it is too heavy.
*   **Don’t** use icons with rounded, bubbly corners. Select "Sharp" or "Light" weighted stroke icons to match the Montserrat/Inter precision.
*   **Don't** use dividers to separate sections. If a section needs to end, change the background color to the next tier in the surface scale.