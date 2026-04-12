import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const FloatingToast = ({ open, handleClose, message, severity = "error" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      TransitionComponent={(props) => <Slide {...props} direction={isMobile ? "right" : "left"} />}
      anchorOrigin={{ vertical: 'top', horizontal: isMobile ? 'left' : 'right' }}
      sx={{
        zIndex: 9999,
        top: '20px !important',
        left: isMobile ? '20px !important' : 'auto',
        right: isMobile ? 'auto' : '20px !important',
        
        maxWidth: isMobile ? 'calc(100% - 40px)' : '450px', 
        
        pointerEvents: 'none', 
      }}
    >
      <Alert
        elevation={0}
        variant="standard"
        severity={severity}
        sx={{
          pointerEvents: 'auto',

          backgroundColor: 'var(--bg-primary, #ffffff)', 
          color: 'var(--text-primary, #0f172a)',
          
          fontFamily: 'inherit',
          fontWeight: 600,
          letterSpacing: '0.01em',
          fontSize: '0.875rem', 
          
          borderRadius: '12px',
          padding: '12px 24px 12px 20px', 
          
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          
          width: '100%',

          '& .MuiAlert-icon': {
            color: severity === 'error' ? '#ef4444' :  
                   severity === 'success' ? '#10b981' : 
                   severity === 'info' ? '#3b82f6' :    
                   '#f97316',                           
            padding: 0,
            margin: 0,
            fontSize: '1.4rem', 
            display: 'flex',
            alignItems: 'center',
          },
          
          '& .MuiAlert-message': {
            padding: 0,
            margin: 0,
            lineHeight: 1.4,
            overflowWrap: 'break-word',
          }
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default FloatingToast;