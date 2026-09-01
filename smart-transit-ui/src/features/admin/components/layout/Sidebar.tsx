import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PaidIcon from '@mui/icons-material/Paid';
import PeopleIcon from '@mui/icons-material/People';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

export interface NavItem {
    text: string;
    icon: React.ReactNode;
    path: string;
}

const navItems: NavItem[] = [
    { text: 'Genel Bakış', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Tarife Yönetimi', icon: <PaidIcon />, path: '/admin/tariffs' },
    { text: 'Operatör Yönetimi', icon: <PeopleIcon />, path: '/admin/operators' },
    { text: 'Akıllı Asistan', icon: <AutoAwesomeIcon />, path: '/admin/assistant' },
    { text: 'Filo Takibi', icon: <DirectionsBusIcon />, path: '/admin/fleet' },
];

interface SidebarProps {
    drawerWidth: number;
    mobileOpen: boolean;
    handleDrawerToggle: () => void;
    currentPath?: string;
    onNavigate?: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    drawerWidth,
    mobileOpen,
    handleDrawerToggle,
    currentPath,
    onNavigate,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const activePath = currentPath || location.pathname;

    const handleItemClick = (path: string) => {
        if (onNavigate) {
            onNavigate(path);
        } else {
            navigate(path);
        }

        if (mobileOpen) {
            handleDrawerToggle();
        }
    };

    const drawerContent = (
        <Box sx={{ height: '100%', bgcolor: '#0f172a', color: '#ffffff' }}>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: [2] }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#38bdf8', letterSpacing: '-0.5px' }}>
                    ⚡ SmartTransit
                </Typography>
            </Toolbar>
            <Divider sx={{ borderColor: '#1e293b' }} />
            <List sx={{ p: 1.5 }}>
                {navItems.map((item) => {
                    const selected = activePath === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                selected={selected}
                                onClick={() => handleItemClick(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    py: 1,
                                    color: selected ? '#ffffff' : '#94a3b8',
                                    '&:hover': {
                                        backgroundColor: selected ? '#1d4ed8' : '#1e293b',
                                        color: '#ffffff',
                                        '& .MuiListItemIcon-root': {
                                            color: '#ffffff',
                                        },
                                    },
                                    '&.Mui-selected': {
                                        backgroundColor: '#2563eb',
                                        color: '#ffffff',
                                        '& .MuiListItemIcon-root': {
                                            color: '#ffffff',
                                        },
                                        '&:hover': {
                                            backgroundColor: '#1d4ed8',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36, color: selected ? '#ffffff' : '#94a3b8' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    slotProps={{
                                        primary: {
                                            sx: {
                                                fontSize: 14,
                                                fontWeight: selected ? 700 : 500,
                                            },
                                        },
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    return (
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        bgcolor: '#0f172a',
                        borderRight: '1px solid #1e293b',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        bgcolor: '#0f172a',
                        borderRight: '1px solid #1e293b',
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};