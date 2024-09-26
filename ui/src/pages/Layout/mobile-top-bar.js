import { AppBar, Toolbar, Typography } from '../../mui/material';
import { IconButton, MenuIcon } from '../../mui/icons-material';

const MobileTopBar = ({ drawerWidth, handleDrawerToggle }) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          EPCIS 2.0 Blockchain Panel
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default MobileTopBar;
