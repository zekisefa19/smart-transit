import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PeopleIcon from '@mui/icons-material/People';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export interface StatCardProps {
    title: string;
    value: string | number;
    change: number;
    changeType: 'increase' | 'decrease';
    period?: string;
    iconType: 'bus' | 'passenger' | 'route' | 'alert';
    loading?: boolean;
}

const iconMap = {
    bus: { icon: <DirectionsBusIcon />, color: '#1976d2', bg: '#e3f2fd' },
    passenger: { icon: <PeopleIcon />, color: '#2e7d32', bg: '#e8f5e9' },
    route: { icon: <AltRouteIcon />, color: '#ed6c02', bg: '#fff3e0' },
    alert: { icon: <WarningAmberIcon />, color: '#d32f2f', bg: '#ffebee' },
};

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    change,
    changeType,
    period = 'geçen haftaya göre',
    iconType,
    loading = false,
}) => {
    if (loading) {
        return (
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', p: 1 }}>
                <CardContent>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="80%" height={36} />
                    <Skeleton variant="text" width="40%" height={16} />
                </CardContent>
            </Card>
        );
    }

    const selectedIcon = iconMap[iconType];
    const isPositive = changeType === 'increase';

    return (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                            {value}
                        </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: selectedIcon.bg, color: selectedIcon.color, width: 48, height: 48 }}>
                        {selectedIcon.icon}
                    </Avatar>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {isPositive ? (
                        <TrendingUpIcon fontSize="small" color="success" />
                    ) : (
                        <TrendingDownIcon fontSize="small" color="error" />
                    )}
                    <Typography
                        variant="caption"
                        color={isPositive ? 'success.main' : 'error.main'}
                        sx={{ fontWeight: 700 }}
                    >
                        {isPositive ? `+${change}%` : `-${change}%`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        {period}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};