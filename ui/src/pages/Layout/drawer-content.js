import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import useUserService from '../../services/user';
import styled from 'styled-components';

import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '../../mui/material';

import {
  InboxIcon,
  LibraryAddIcon,
  LogoutIcon,
  MailIcon,
  QrCodeScannerIcon,
  QueryStatsIcon,
  SearchIcon,
} from '../../mui/icons-material';

const DesktopTitle = styled(Typography)`
  && {
    font-size: 1.2em;
    font-weight: 800;
    color: #a7c0d3;
  }
`;

const menu = [
  {
    label: 'Capture',
    icon: <LibraryAddIcon />,
    route: 'capture',
  },
  {
    label: 'Query',
    icon: <SearchIcon />,
    route: 'query',
  },
  {
    label: 'Traceability',
    icon: <QrCodeScannerIcon />,
    route: 'traceability',
  },
];

const secondaryMenu = [
  {
    label: 'Dashboard',
    icon: <QueryStatsIcon />,
    url: `http://14.42.170.22:7082`,
    available: true,
  },
  {
    label: 'Admin',
    icon: <MailIcon />,
    url: '#',
    available: false,
  },
  {
    label: 'Help',
    icon: <InboxIcon />,
    url: '#',
    available: false,
  },
];

const DrawerContent = (drawerWidth) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    useUserService.logout();
    navigate('/');
    navigate(0);
  };

  return (
    <div>
      <Toolbar sx={{ backgroundColor: '#F8F8F8' }}>
        <DesktopTitle>EPCIS 2.0 Blockchain</DesktopTitle>
      </Toolbar>
      <List>
        {menu.map((menuItem, index) => (
          <ListItem
            key={index}
            disablePadding
            onClick={() => navigate(menuItem.route)}
          >
            <ListItemButton>
              <ListItemIcon>{menuItem.icon}</ListItemIcon>
              <ListItemText primary={menuItem.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {secondaryMenu.map((menuItem, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              disabled={!menuItem.available}
              onClick={() => window.open(menuItem.url)}
            >
              <ListItemIcon>{menuItem.icon}</ListItemIcon>
              <ListItemText primary={menuItem.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={'Sign Out'} />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );
};

export default DrawerContent;
