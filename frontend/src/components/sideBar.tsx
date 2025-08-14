import React from "react";
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import SettingsIcon from "@mui/icons-material/Settings";
import { FlashOn } from "@mui/icons-material";

const drawerWidth = 240;

const menuItems = [
    { text: "Transformers", icon: <FlashOn />, path: "/" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

const Sidebar: React.FC = () => {
    const location = useLocation();
    return (
        <Box>

            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: "border-box",
                    },
                }}
            >

                <Typography variant="h6" noWrap component="div" sx={{ p: 2, fontWeight: 'bold', justifyContent: 'center', textAlign: 'center' }}>
                    Devix
                </Typography>
                <List>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                component={Link}
                                to={item.path}
                                selected={location.pathname === item.path}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </Box>
    );
};

export default Sidebar;
