import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

let player: AudioPlayer | undefined;

/**
 * Two short rising notes (the web app's chime), so staff hear a new order or a guest's call over a busy floor. Music
 * playing on the phone dips for it instead of stopping. The phone's silent mode and volume are respected.
 */
export default function playChime() {
  if (!player) {
    void setAudioModeAsync({ interruptionMode: 'duckOthers' });
    player = createAudioPlayer(require('@/assets/sounds/new_order.wav'));
  }
  void player.seekTo(0);
  player.play();
}
