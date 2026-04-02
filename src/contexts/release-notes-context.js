import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { ReleaseNotesDialog } from "../components/ReleaseNotesDialog";

const ReleaseNotesContext = createContext({
  openReleaseNotes: () => {},
});

export const ReleaseNotesProvider = ({ children }) => {
  const dialogRef = useRef(null);

  const openReleaseNotes = useCallback(() => {
    dialogRef.current?.open();
  }, []);

  const value = useMemo(() => ({ openReleaseNotes }), [openReleaseNotes]);

  return (
    <ReleaseNotesContext.Provider value={value}>
      {children}
      <ReleaseNotesDialog ref={dialogRef} />
    </ReleaseNotesContext.Provider>
  );
};

ReleaseNotesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useReleaseNotes = () => useContext(ReleaseNotesContext);
