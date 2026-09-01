export interface StatItem {
    id: string;
    title: string;
    value: string | number;
    change: number; // Örn: +12.5 veya -3.2
    changeType: 'increase' | 'decrease';
    period: string; // Örn: "geçen haftaya göre"
    iconName: 'directions_bus' | 'people' | 'route' | 'warning';
}