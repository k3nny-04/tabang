import { createContext, useCallback, useState } from "react";
import FloatingToast from "../components/FloatingToast";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    const showToast = useCallback((message, severity = "info") => {
        setToast({ open: true, message, severity });
    }, []);
    
    const hideToast = useCallback((event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setToast((prev) => ({ ...prev, open: false }));
    }, []);
    
    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            <FloatingToast
                open={toast.open}
                handleClose={hideToast}
                message={toast.message}
                severity={toast.severity}
            />
        </ToastContext.Provider>
    );
}

export { ToastContext };