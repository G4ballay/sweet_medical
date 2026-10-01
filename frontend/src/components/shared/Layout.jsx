import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Box component="main" sx={{ py: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;