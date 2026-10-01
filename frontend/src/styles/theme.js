import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#D9043D',
      dark: '#AD0227',
    },
    secondary: {
      main: '#FFFFFF',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
    },
    background: {
      default: '#F8F9FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D2D2D',
      secondary: '#6B7280',
      tertiary: '#D9D9D9',
    },
    divider: '#E5E7EB'
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    button: {
      textTransform: 'none',
    }
  },
  shape: {
    borderRadius: 14
  },
  custom: {
    radiusSm: '10px',
    radiusMd: '14px',
    radiusLg: '20px',
    radiusXl: '28px',
    shadowElevate: '0 20px 40px rgba(0,0,0,0.12)',
    transitionSmooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transitionFast: 'all 0.2s ease',
    gradientPrimary: 'linear-gradient(135deg, #D9043D 0%, #AD0227 100%)'
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
          '&.Mui-disabled': {
            pointerEvents: 'auto',
            cursor: 'not-allowed',
            '&.MuiButton-contained': {
              backgroundColor: '#EAECEF',
              color: 'rgba(0, 0, 0, 0.26)'
            }
          }
        },
        containedPrimary: {
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#AD0227',
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          border: '1px solid #E5E7EB',
          boxShadow: 'none'
        },
      },
      variants: [
        {
          props: { variant: 'elevate' },
          style: {
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
              borderColor: 'transparent',
            },
          }
        },
      ],
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: 'none'
        },
        elevation1: {
          boxShadow: 'none'
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: 'none',
          marginTop: '8px'
        },
      },
    },
    MuiTypography: {
      variants: [
        {
          props: { variant: 'pageTitle' },
          style: {
            fontWeight: 700,
            color: '#2D2D2D',
            marginBottom: '16px',
            fontSize: '2.125rem'
          }
        },
      ],
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          backgroundColor: theme.palette.background.default,
          transition: 'all 0.25s ease',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: theme.palette.background.paper
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.divider,
            transition: 'border-color 0.25s ease'
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            borderWidth: '1px'
          },
          '&.Mui-focused': {
            boxShadow: 'none'
          },
          '&.Mui-disabled': {
            backgroundColor: '#EAECEF',
            cursor: 'not-allowed',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.divider
            },
            '& .MuiOutlinedInput-input': {
              cursor: 'not-allowed'
            }
          }
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-focused': {
            color: theme.palette.primary.main,
          }
        }),
      },
    }
  }
});
