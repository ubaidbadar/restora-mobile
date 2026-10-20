/**
 * Closes a sheet, then runs the action once it has slid away: another sheet or an alert can't open over a closing one.
 */
const afterSheetCloses = (close: () => void, action: () => void) => {
  close();
  setTimeout(action, 450);
};

export default afterSheetCloses;
