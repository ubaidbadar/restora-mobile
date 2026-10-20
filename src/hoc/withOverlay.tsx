import type { ComponentType } from 'react';
import useShow from '@/hooks/useShow';
import type OverlayControllerProps from '@/types/overlay_controller_props';
import type ShowTools from '@/types/show_tools';

/**
 * Turns a panel (a sheet, a menu) into a self-managing overlay: owns the open state, renders the trigger
 * (`component={({ open }) => <Button onPress={open} />}`), and mounts the panel only while it is open or closing.
 */
export default function withOverlay<Props extends ShowTools>(Panel: ComponentType<Props>) {
  function Overlay({ component, ...panelProps }: OverlayControllerProps<Props>) {
    const tools = useShow();

    return (
      <>
        {component?.(tools)}
        {tools.state !== '' && <Panel {...(panelProps as unknown as Props)} {...tools} />}
      </>
    );
  }

  Overlay.displayName = `withOverlay(${Panel.displayName || Panel.name || 'Panel'})`;
  return Overlay;
}
