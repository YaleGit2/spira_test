import * as React from 'react';
import { Outlet } from 'react-router-dom';
import MobileTopBar from './mobile-top-bar';
import DrawerContent from './drawer-content';
import {
  Box,
  Drawer,
  Toolbar,
  CssBaseline,
  useMediaQuery,
  useTheme,
} from '../../mui/material';

const drawerWidth = 260;

const Layout = (props) => {
  const { window } = props;
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        {isMobile ? (
          <MobileTopBar
            drawerWidth={drawerWidth}
            handleDrawerToggle={handleDrawerToggle}
          />
        ) : null}

        {/* Side Menu */}
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="mailbox folders"
        >
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            <DrawerContent />
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
            open
          >
            <DrawerContent />
          </Drawer>
        </Box>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          {isMobile && <Toolbar />}
          <Outlet />
        </Box>
      </Box>
    </>
  );
};

export default Layout;
