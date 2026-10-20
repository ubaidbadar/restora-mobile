/** What `withOverlay` gives a panel and its trigger. `state`: open, closing (sliding away), or closed. */
export default interface ShowTools {
  state: 'active' | 'close' | '';
  open: () => void;
  close: () => void;
}
