import { Uniwind } from 'uniwind';
import type RestaurantSettings from '@shared/restaurant_settings';

type Appearance = NonNullable<RestaurantSettings['appearance']>;
type Rgb = readonly [number, number, number];
type Palette = { primary: Rgb; hover: Rgb; soft: Rgb; canvas: Rgb; sidebar: Rgb; sidebarAccent: Rgb; darkPrimary: Rgb; darkHover: Rgb };

/** Web src/index.css theme colours, expressed as RGB components to keep raw colours out of native UI styles. */
const PALETTES: Record<Appearance['theme'], Palette> = {
  indigo: { primary: [79, 70, 229], hover: [67, 56, 202], soft: [238, 242, 255], canvas: [246, 247, 249], sidebar: [30, 27, 75], sidebarAccent: [165, 180, 252], darkPrimary: [129, 140, 248], darkHover: [165, 180, 252] },
  saffron: { primary: [194, 65, 12], hover: [154, 52, 18], soft: [255, 247, 237], canvas: [250, 248, 245], sidebar: [59, 18, 6], sidebarAccent: [253, 186, 116], darkPrimary: [251, 146, 60], darkHover: [253, 186, 116] },
  emerald: { primary: [4, 120, 87], hover: [6, 95, 70], soft: [236, 253, 245], canvas: [245, 248, 246], sidebar: [2, 44, 34], sidebarAccent: [110, 231, 183], darkPrimary: [52, 211, 153], darkHover: [110, 231, 183] },
  ocean: { primary: [14, 116, 144], hover: [21, 94, 117], soft: [236, 254, 255], canvas: [245, 248, 249], sidebar: [8, 47, 62], sidebarAccent: [103, 232, 249], darkPrimary: [34, 211, 238], darkHover: [103, 232, 249] },
  bordeaux: { primary: [159, 18, 57], hover: [136, 19, 55], soft: [255, 241, 242], canvas: [250, 247, 247], sidebar: [63, 7, 22], sidebarAccent: [253, 164, 175], darkPrimary: [251, 113, 133], darkHover: [253, 164, 175] },
  onyx: { primary: [180, 83, 9], hover: [146, 64, 14], soft: [255, 251, 235], canvas: [247, 247, 245], sidebar: [17, 17, 17], sidebarAccent: [252, 211, 77], darkPrimary: [251, 191, 36], darkHover: [252, 211, 77] },
};

const rgb = (value: Rgb) => `rgb(${value[0]}, ${value[1]}, ${value[2]})`;
const mix = (base: Rgb, tint: Rgb, weight: number) =>
  rgb([0, 1, 2].map((i) => Math.round(base[i]! * weight + tint[i]! * (1 - weight))) as unknown as [number, number, number]);

/**
 * The restaurant's saved settings control every native screen. Uniwind's light/dark themes remain
 * responsible for system mode and native dialogs; only the matching semantic color tokens are updated.
 * Both palettes are always refreshed so switching restaurant never leaks the last restaurant's colours.
 */
export default function applyAppearance(appearance?: Appearance) {
  const choice = appearance ?? { theme: 'indigo', mode: 'light', sidebar: 'plain' };
  const palette = PALETTES[choice.theme] ?? PALETTES.indigo;
  const baseDarkCanvas: Rgb = [11, 15, 25];
  const baseDarkSurface: Rgb = [21, 27, 40];
  const baseDarkSunken: Rgb = [28, 35, 51];
  const baseDarkHover: Rgb = [37, 45, 64];
  const baseDarkBorder: Rgb = [42, 51, 71];

  Uniwind.updateCSSVariables('light', {
    '--color-primary': rgb(palette.primary),
    '--color-primary-hover': rgb(palette.hover),
    '--color-primary-soft': rgb(palette.soft),
    '--color-on-primary': 'rgb(255, 255, 255)',
    '--color-canvas': rgb(palette.canvas),
    '--color-focus': rgb(palette.primary),
    '--color-accent': rgb(palette.primary),
    '--color-accent-text': rgb(palette.hover),
    '--color-accent-soft': rgb(palette.soft),
    '--color-accent-alt': rgb(palette.hover),
    '--color-on-accent': 'rgb(255, 255, 255)',
    '--color-sidebar': rgb(palette.sidebar),
    '--color-sidebar-accent': rgb(palette.sidebarAccent),
    '--color-theme-light': rgb(palette.primary),
    '--color-theme-dark': rgb(palette.darkPrimary),
    '--color-hero-start': rgb(palette.soft),
    '--color-hero-mid': rgb(palette.canvas),
  });
  const darkCanvas = mix(baseDarkCanvas, palette.sidebar, 0.92);
  const darkSoft = mix(palette.darkPrimary, baseDarkSurface, 0.18);
  Uniwind.updateCSSVariables('dark', {
    '--color-canvas': darkCanvas,
    '--color-surface': mix(baseDarkSurface, palette.sidebar, 0.90),
    '--color-sunken': mix(baseDarkSunken, palette.sidebar, 0.90),
    '--color-hover': mix(baseDarkHover, palette.sidebar, 0.90),
    '--color-border': mix(baseDarkBorder, palette.sidebar, 0.88),
    '--color-primary': rgb(palette.darkPrimary),
    '--color-primary-hover': rgb(palette.darkHover),
    '--color-primary-soft': darkSoft,
    '--color-on-primary': rgb(palette.sidebar),
    '--color-focus': rgb(palette.darkHover),
    '--color-accent': rgb(palette.darkPrimary),
    '--color-accent-text': rgb(palette.darkHover),
    '--color-accent-soft': darkSoft,
    '--color-accent-alt': rgb(palette.darkHover),
    '--color-on-accent': rgb(palette.sidebar),
    '--color-sidebar': rgb(palette.sidebar),
    '--color-sidebar-accent': rgb(palette.sidebarAccent),
    '--color-theme-light': rgb(palette.primary),
    '--color-theme-dark': rgb(palette.darkPrimary),
    '--color-hero-start': mix(palette.darkPrimary, baseDarkCanvas, 0.12),
    '--color-hero-mid': darkCanvas,
  });
  Uniwind.setTheme(choice.mode);
}
