import SweetMedicalIcon from '@/assets/logo.svg?react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import { AppBar, Avatar, Badge, Box, Button, Container, Divider, IconButton, ListItemIcon, Menu, MenuItem, SvgIcon, Toolbar, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Role } from '../../enums/role.enum';

const patientPages = [
  { label: 'Inicio', path: '/inicio' },
  { label: 'Buscar Turnos', path: '/buscar-turnos' },
  { label: 'Mis Turnos', path: '/mis-turnos' },
  { label: 'Notificaciones', path: '/notificaciones' },
];

const doctorPages = [
  { label: 'Inicio', path: '/inicio' },
  { label: 'Mis Turnos', path: '/mis-turnos' },
  { label: 'Notificaciones', path: '/notificaciones' },
];

function Navbar({ onNavigate }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const { notificaciones } = useNotification();
  const unreadCount = notificaciones.filter(n => !n.isRead).length;

  const isLanding = location.pathname === '/';

  const landingPages = [
    { label: 'Inicio', target: 'hero' },
    { label: 'Cómo funciona', target: 'comoFunciona' },
    { label: 'Nosotros', target: 'nosotros' },
    { label: 'FAQ', target: 'faq' },
  ];

  const appPages = user?.role === Role.DOCTOR ? doctorPages : patientPages;
  const pages = isLanding ? landingPages : appPages;

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleNavClick = (page) => {
    handleCloseNavMenu();
    if (isLanding && page.target) {
      if (onNavigate) {
        onNavigate(page.target);
      }
    } else if (page.path) {
      navigate(page.path);
    }
  };

  const handleLogoClick = () => {
    if (isLanding) {
      if (onNavigate) {
        onNavigate('hero');
      }
    } else {
      navigate(isAuthenticated ? '/inicio' : '/');
    }
  };

  const handleProfileClick = () => {
    const isMedico = user?.role === Role.DOCTOR;
    navigate(isMedico ? '/perfil-medico' : '/perfil');
    handleCloseUserMenu();
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
  };

  const getInitials = () => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(/\s+/);
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const isPageActive = (page) => {
    if (isLanding) return false;
    return location.pathname === page.path;
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ top: 0, zIndex: 1100, backgroundColor: 'background.paper', borderBottom: (t) => `1px solid ${t.palette.divider}`, color: 'text.primary', borderRadius: 0 }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: '80px', px: 0 }}>

          <Box
            onClick={handleLogoClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLogoClick();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Sweet Medical - Volver al inicio"
            sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', cursor: 'pointer', gap: 1 }}
          >
            <SvgIcon component={SweetMedicalIcon} inheritViewBox sx={{ fontSize: 30, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.01em', cursor: 'pointer', userSelect: 'none' }}>
              Sweet Medical
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            <IconButton
              size="large"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{ p: 1, color: 'text.primary' }}
              aria-label="Abrir menú de navegación"
              aria-controls="menu-appbar-nav"
              aria-haspopup="true"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar-nav"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.label}
                  onClick={() => handleNavClick(page)}
                  selected={isPageActive(page)}
                  sx={{ py: 1.2, px: 2 }}
                >
                  <Typography sx={{ fontWeight: isPageActive(page) ? 600 : 500, fontSize: '0.95rem' }}>
                    {page.label}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box
            onClick={handleLogoClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLogoClick();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Sweet Medical - Volver al inicio"
            sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', cursor: 'pointer', gap: 1, flexGrow: 1, justifyContent: 'center' }}
          >
            <SvgIcon component={SweetMedicalIcon} inheritViewBox sx={{ fontSize: 26, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em', cursor: 'pointer', userSelect: 'none' }}>
              Sweet Medical
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
            {pages.map((page) => (
              <Button
                key={page.label}
                onClick={() => handleNavClick(page)}
                aria-current={isPageActive(page) ? 'page' : undefined}
                sx={{
                  color: isPageActive(page) ? 'primary.main' : 'text.secondary',
                  fontWeight: isPageActive(page) ? 700 : 500,
                  fontSize: '0.92rem',
                  borderRadius: '10px',
                  px: 2,
                  py: 0.8,
                  backgroundColor: isPageActive(page) ? (theme) => alpha(theme.palette.primary.main, 0.06) : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                {page.label === 'Notificaciones' ? (
                  <Badge
                    variant="dot"
                    color="primary"
                    invisible={unreadCount === 0 || isPageActive(page)}
                    sx={{
                      '& .MuiBadge-badge': {
                        top: 3,
                        right: -5,
                      },
                    }}
                  >
                    {page.label}
                  </Badge>
                ) : (
                  page.label
                )}
              </Button>

            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isAuthenticated ? (
              <>
                {isLanding && (
                  <Button
                    onClick={() => navigate('/inicio')}
                    variant="contained"
                    startIcon={<DashboardIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      display: { xs: 'none', sm: 'inline-flex' },
                      px: 2.5,
                      py: 1,
                    }}
                  >
                    Ir al Panel
                  </Button>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500, fontSize: '0.88rem', color: 'text.primary' }}>
                    {user?.name || 'Usuario'}
                  </Typography>
                  <Tooltip title="Mi cuenta">
                    <IconButton
                      onClick={handleOpenUserMenu}
                      sx={{ p: 0 }}
                      aria-label="Menú de cuenta de usuario"
                      aria-controls="menu-appbar-user"
                      aria-haspopup="true"
                    >
                      <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', color: 'secondary.main', fontSize: '0.85rem', fontWeight: 600 }}>{getInitials()}</Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar-user"
                    anchorEl={anchorElUser}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                    slotProps={{ paper: { sx: { minWidth: 200 } } }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.primary' }}>
                        {user?.name || 'Usuario'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.2 }}>
                        {user?.email || ''}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={handleProfileClick} sx={{ py: 1.2 }}>
                      <ListItemIcon><PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></ListItemIcon>
                      <Typography sx={{ fontSize: '0.88rem' }}>Mi Perfil</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ py: 1.2 }}>
                      <ListItemIcon><LogoutIcon sx={{ color: 'primary.main', fontSize: 20 }} /></ListItemIcon>
                      <Typography sx={{ fontSize: '0.88rem', color: 'primary.main', fontWeight: 500 }}>Cerrar Sesión</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/iniciar-sesion')}
                  variant="contained"
                  sx={{
                    px: 3,
                    py: 1,
                  }}
                >
                  Iniciar sesión
                </Button>
                <Button
                  onClick={() => navigate('/registro')}
                  variant="outlined"
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    px: 3,
                    py: 1,
                    borderColor: 'text.secondary',
                    color: 'text.secondary',
                    backgroundColor: 'background.default',
                    "&:hover": {
                      backgroundColor: (t) => alpha(t.palette.primary.main, 0.1),
                      color: 'primary.main',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  Registrarse
                </Button>
              </>
            )}
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
