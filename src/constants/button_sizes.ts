/** Heights stay at or above the 44pt tap target, except `sm`, which is only used inside cards with room around it. */
const BUTTON_SIZES = {
  sm: { container: 'min-h-9 px-3 gap-1.5', text: 'text-sm', icon: 16 },
  md: { container: 'min-h-11 px-4 gap-2', text: 'text-base', icon: 18 },
  lg: { container: 'min-h-13 px-5 gap-2', text: 'text-base', icon: 20 },
} as const;

export default BUTTON_SIZES;
