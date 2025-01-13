import { CloseSharp } from "@mui/icons-material";
import { Alert, Button, IconButton, Snackbar } from "@mui/material";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { closeToast } from "../store/toasts";

const Toasts = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.toasts.toasts);

  return (
    <>
      {[
        toasts.map((toast) => (
          <Snackbar
            sx={{ maxWidth: "20%" }}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            key={toast.index}
            open={true}
            autoHideDuration={6000}
            onClose={() => dispatch(closeToast({ index: toast.index }))}
            action={
              <>
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={() => dispatch(closeToast({ index: toast.index }))}
                >
                  <CloseSharp fontSize="small" />
                </IconButton>
              </>
            }
          >
            <Alert
              onClose={() => dispatch(closeToast({ index: toast.index }))}
              severity="error"
              variant="filled"
              sx={{ width: "100%" }}
            >
              {toast.toastError.status} - {toast.message}
            </Alert>
          </Snackbar>
        )),
      ]}
    </>
  );
};

export default Toasts;
