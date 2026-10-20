/* eslint-disable @typescript-eslint/no-deprecated -- react-native-svg types mark a transform shorthand `x`/`y` as deprecated, and the same names are the position of <Rect>, which is not deprecated (SVG spec). This file only draws shapes. */
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { useCSSVariable } from 'uniwind';

// A four-point sparkle centred on (x, y).
const sparkle = (x: number, y: number, s: number) =>
  `M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}z`;

const TICKET_ROWS = [114, 136, 158, 180];

const VARIABLES = ['--color-art-sand', '--color-art-rice', '--color-art-saffron', '--color-art-chili', '--color-art-leaf', '--color-art-chat', '--color-border', '--color-border-strong', '--color-ink', '--color-muted', '--color-primary', '--color-primary-hover', '--color-primary-soft', '--color-sunken', '--color-surface'];

/**
 * The welcome drawing (the same as the web's sign-in): the Restora cloche lifting its lid over a plate of biryani, a
 * cup of chai, an order ticket and a WhatsApp chat. Decorative only; colors are theme tokens, so it follows dark mode.
 * Without `width` it fills its box and keeps its shape (centred), so it can take whatever height a screen has left.
 */
export default function AuthArt({ width }: { width?: number }) {
  const [sand, rice, saffron, chili, leaf, chat, border, borderStrong, ink, muted, primary, primaryHover, primarySoft, sunken, surface] = useCSSVariable(VARIABLES) as string[];
  const c = { sand, rice, saffron, chili, leaf, chat, border, borderStrong, ink, muted, primary, primaryHover, primarySoft, sunken, surface };

  return (
    <Svg viewBox="0 0 520 460" width={width ?? '100%'} height={width ? width * (460 / 520) : '100%'} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Circle cx="468" cy="58" r="11" fill={c.rice} />
      <Circle cx="30" cy="196" r="6" fill={c.saffron} opacity={0.5} />
      <Path d={sparkle(196, 74, 11)} fill={c.saffron} />
      <Path d={sparkle(338, 52, 7)} fill={c.primary} opacity={0.6} />
      <Path d={sparkle(470, 392, 9)} fill={c.saffron} />
      <Path d={sparkle(30, 300, 6)} fill={c.chili} opacity={0.7} />

      <Ellipse cx="258" cy="378" rx="214" ry="18" fill={c.sand} />

      <G transform="rotate(-8 102 145)">
        <Rect x="45" y="77" width="124" height="150" rx="12" fill={c.ink} opacity={0.05} />
        <Rect x="40" y="70" width="124" height="150" rx="12" fill={c.surface} stroke={c.border} strokeWidth="1.5" />
        <Path d="M40 100V82a12 12 0 0 1 12-12h100a12 12 0 0 1 12 12v18z" fill={c.primarySoft} />
        <Rect x="54" y="81" width="54" height="9" rx="4.5" fill={c.primary} opacity={0.5} />
        <Circle cx="148" cy="85" r="9" fill={c.leaf} />
        <Path d="m144 85 3 3 5-6" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" stroke={c.surface} />
        {TICKET_ROWS.map((y) => (
          <G key={y}>
            <Circle cx="58" cy={y + 4} r="4" fill={c.saffron} />
            <Rect x="68" y={y} width="58" height="8" rx="4" fill={c.sunken} />
            <Rect x="134" y={y} width="18" height="8" rx="4" fill={c.border} />
          </G>
        ))}
        <Rect x="54" y="202" width="98" height="2" fill={c.border} />
      </G>

      <Ellipse cx="99" cy="346" rx="36" ry="7" fill={c.sand} />
      <Path d="M76 288h46l-6 56H82z" fill={c.saffron} />
      <Rect x="75" y="284" width="48" height="10" rx="3" fill={c.rice} />
      <Path d="M92 276c-6-8 6-12 0-22M108 274c-6-8 6-12 0-22" fill="none" strokeWidth="4" strokeLinecap="round" stroke={c.borderStrong} opacity={0.4} />

      <G transform="rotate(7 431 215)">
        <Rect x="372" y="108" width="118" height="214" rx="20" fill={c.ink} />
        <Rect x="380" y="122" width="102" height="186" rx="13" fill={c.surface} />
        <Circle cx="394" cy="137" r="7" fill={c.leaf} />
        <Rect x="406" y="133" width="44" height="8" rx="4" fill={c.sunken} />
        <Rect x="388" y="156" width="62" height="20" rx="8" fill={c.sunken} />
        <Rect x="410" y="184" width="64" height="30" rx="8" fill={c.chat} />
        <Rect x="388" y="222" width="52" height="20" rx="8" fill={c.sunken} />
        <Rect x="404" y="250" width="70" height="20" rx="8" fill={c.chat} />
        <Rect x="388" y="280" width="40" height="18" rx="9" fill={c.sunken} />
        <Circle cx="400" cy="289" r="2.2" fill={c.muted} />
        <Circle cx="408" cy="289" r="2.2" fill={c.muted} />
        <Circle cx="416" cy="289" r="2.2" fill={c.muted} />
      </G>
      <Circle cx="486" cy="112" r="20" fill={c.chili} />
      <Path d="M486 121.5l-8.6-8.7a5.6 5.6 0 0 1 8.6-7.1a5.6 5.6 0 0 1 8.6 7.1z" fill={c.surface} />

      <Rect x="140" y="322" width="220" height="18" rx="9" fill={c.primaryHover} />
      <Path d="M168 336h30l-46 28z" fill={c.primaryHover} />
      <Ellipse cx="250" cy="322" rx="94" ry="9" fill={c.surface} />
      <Path d="M176 321c12-50 136-50 148 0z" fill={c.rice} />
      <Ellipse cx="206" cy="311" rx="10" ry="7.5" fill={c.surface} />
      <Circle cx="206" cy="311" r="4" fill={c.saffron} />
      <Circle cx="232" cy="296" r="5" fill={c.chili} />
      <Circle cx="262" cy="290" r="4" fill={c.leaf} />
      <Circle cx="248" cy="310" r="3.5" fill={c.leaf} />
      <Circle cx="286" cy="304" r="5" fill={c.chili} />
      <Path d="M302 318a12 12 0 0 1 16-11l-4 11z" fill={c.saffron} />
      <Path d="M212 280c-8-11 8-17 0-30M240 272c-8-11 8-17 0-30" fill="none" strokeWidth="5" strokeLinecap="round" stroke={c.borderStrong} opacity={0.35} />
      <G transform="rotate(35 340 322)">
        <Ellipse cx="250" cy="322" rx="90" ry="8" fill={c.primaryHover} />
        <Path d="M160 322a90 90 0 0 1 180 0z" fill={c.primary} />
        <Circle cx="250" cy="221" r="13" fill={c.primary} />
        <Path d="M188 300a64 64 0 0 1 38-52" fill="none" strokeWidth="8" strokeLinecap="round" stroke={c.surface} opacity={0.3} />
      </G>
    </Svg>
  );
}
