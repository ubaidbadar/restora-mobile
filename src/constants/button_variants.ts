/** How each button variant looks: its fill, its label, and its icon color. */
const BUTTON_VARIANTS = {
  primary: { container: 'bg-primary active:bg-primary-hover', text: 'text-on-primary', icon: 'accent-on-primary' },
  secondary: { container: 'bg-primary-soft active:opacity-80', text: 'text-accent-text', icon: 'accent-accent-text' },
  outline: { container: 'border border-border-strong bg-surface active:bg-sunken', text: 'text-ink', icon: 'accent-ink' },
  ghost: { container: 'active:bg-hover', text: 'text-body', icon: 'accent-body' },
  danger: { container: 'border border-danger-200 bg-surface active:bg-danger-50', text: 'text-danger-700', icon: 'accent-danger-700' },
  destructive: { container: 'bg-danger-600 active:bg-danger-700', text: 'text-on-primary', icon: 'accent-on-primary' },
  whatsapp: { container: 'bg-whatsapp active:opacity-85', text: 'text-on-primary', icon: 'accent-on-primary' },
  primaryLink: { container: 'px-0 min-h-0 active:opacity-60', text: 'text-accent-text', icon: 'accent-accent-text' },
} as const;

export default BUTTON_VARIANTS;
