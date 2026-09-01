export interface VehicleItem {
    id: string;
    vehicleCode: string;
    plateNumber: string;
    vehicleType: string;
    lineCode?: string | null;
    isInMaintenance: boolean;
    validatorStatus: 'ONLINE' | 'OFFLINE' | 'UYARI';
}

export interface RouteItem {
    routeId: string;
    lineCode: string;
    routeName: string;
}

export interface LiveAnomaly {
    id: string;
    title: string;
    description: string;
    severity: 'Critical' | 'Medium' | 'Low' | string;
    location: string;
    timeStamp: string;
}

export interface AssistantDashboardData {
    networkHealthScore: number;
    activeAnomalyCount: number;
    criticalAnomalyCount: number;
    recommendationCount: number;
    liveAnomalies: LiveAnomaly[];
}

export interface AskAssistantResponse {
    reply: string;
    timestamp: string;
}

const VEHICLES_STORAGE_KEY = 'smart_transit_vehicles_data';
const ROUTES_STORAGE_KEY = 'smart_transit_routes_data';

const getLocalVehicles = (): VehicleItem[] => {
    try {
        const saved = localStorage.getItem(VEHICLES_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

const getLocalRoutes = (): RouteItem[] => {
    try {
        const saved = localStorage.getItem(ROUTES_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

export const assistantService = {
    /**
     * localStorage verilerinden canlı ağ sağlık skorunu ve anomali listesini hesaplar.
     */
    getDashboardData: async (): Promise<AssistantDashboardData> => {
        const vehicles = getLocalVehicles();

        const liveAnomalies: LiveAnomaly[] = vehicles
            .filter(v => v.validatorStatus !== 'ONLINE' || v.isInMaintenance)
            .map(v => {
                let severity = 'Low';
                let title = 'Araç Servis Dışı / Bakımda';
                let desc = `${v.vehicleCode} (${v.plateNumber}) kodlu araç şu an bakım durumundadır.`;

                if (v.validatorStatus === 'OFFLINE') {
                    severity = 'Critical';
                    title = 'Validatör Offline Arızası';
                    desc = `${v.vehicleCode} (${v.plateNumber}) araç validatörü çevrimdışıdır.`;
                } else if (v.validatorStatus === 'UYARI') {
                    severity = 'Medium';
                    title = 'Validatör Uyarısı';
                    desc = `${v.vehicleCode} (${v.plateNumber}) araç validatöründe sinyal veya kağıt uyarısı var.`;
                }

                return {
                    id: v.id,
                    title,
                    description: desc,
                    severity,
                    location: v.lineCode ? `Hat: ${v.lineCode}` : 'Atanmadı (Boşta)',
                    timeStamp: new Date().toISOString()
                };
            });

        const totalVehicles = vehicles.length;
        const healthyVehicles = vehicles.filter(v => !v.isInMaintenance && v.validatorStatus === 'ONLINE').length;
        const healthScore = totalVehicles > 0 ? Math.round((healthyVehicles / totalVehicles) * 100) : 100;
        const maintenanceCount = vehicles.filter(v => v.isInMaintenance).length;

        return {
            networkHealthScore: healthScore,
            activeAnomalyCount: liveAnomalies.length,
            criticalAnomalyCount: liveAnomalies.filter(a => a.severity === 'Critical').length,
            recommendationCount: maintenanceCount > 0 ? 1 : 0,
            liveAnomalies
        };
    },

    /**
     * localStorage üzerindeki canlı araç ve hat verilerine göre soruları yanıtlar.
     */
    askAssistant: async (prompt: string): Promise<AskAssistantResponse> => {
        const vehicles = getLocalVehicles();
        const routes = getLocalRoutes();
        const query = prompt.toLowerCase().trim();

        let reply = '';

        // 1. Hat / Rota Sorgusu
        const matchedRoute = routes.find(r =>
            (r.lineCode && query.includes(r.lineCode.toLowerCase())) ||
            (r.routeName && query.includes(r.routeName.toLowerCase()))
        );

        const targetLineCode = matchedRoute?.lineCode ||
            vehicles.find(v => v.lineCode && query.includes(v.lineCode.toLowerCase()))?.lineCode;

        if (targetLineCode) {
            const lineVehicles = vehicles.filter(v => v.lineCode?.toLowerCase() === targetLineCode.toLowerCase());
            const activeCount = lineVehicles.filter(v => !v.isInMaintenance).length;
            const maintenanceCount = lineVehicles.filter(v => v.isInMaintenance).length;

            reply = `📍 **${targetLineCode} Hat Analizi:**\n` +
                `• **Toplam Araç Sayısı:** ${lineVehicles.length}\n` +
                `• **Aktif / Seferde:** ${activeCount}\n` +
                `• **Bakımda / Pasif:** ${maintenanceCount}`;

            if (lineVehicles.length > 0) {
                const listStr = lineVehicles.map(v => `${v.vehicleCode} (${v.plateNumber})`).join(', ');
                reply += `\n• **Hattaki Araçlar:** ${listStr}`;
            }
        }
        // 2. Tekil Araç veya Plaka Sorgusu
        else if (vehicles.some(v => query.includes(v.vehicleCode.toLowerCase()) || query.includes(v.plateNumber.toLowerCase().replace(/\s+/g, '')))) {
            const matchedVehicle = vehicles.find(v =>
                query.includes(v.vehicleCode.toLowerCase()) ||
                query.includes(v.plateNumber.toLowerCase().replace(/\s+/g, ''))
            )!;

            reply = `🚌 **Araç Bilgisi (${matchedVehicle.vehicleCode}):**\n` +
                `• **Plaka:** ${matchedVehicle.plateNumber}\n` +
                `• **Araç Türü:** ${matchedVehicle.vehicleType}\n` +
                `• **Atandığı Hat:** ${matchedVehicle.lineCode || 'Boşta (Atanmadı)'}\n` +
                `• **Servis Durumu:** ${matchedVehicle.isInMaintenance ? 'Bakımda' : 'Aktif'}\n` +
                `• **Validatör:** ${matchedVehicle.validatorStatus}`;
        }
        // 3. Genel Filo ve Bakım Sorguları
        else if (query.includes('bakım') || query.includes('filo') || query.includes('durum') || query.includes('kaç araç')) {
            const total = vehicles.length;
            const active = vehicles.filter(v => !v.isInMaintenance).length;
            const maintenance = vehicles.filter(v => v.isInMaintenance).length;

            reply = `📊 **Filo ve Sistem Genel Durumu:**\n` +
                `• **Toplam Filo:** ${total} araç\n` +
                `• **Aktif / Seferde:** ${active} araç\n` +
                `• **Bakım / Pasif:** ${maintenance} araç`;
        }
        // 4. Tanımlanamayan Sorgularda Rehberlik
        else {
            const activeLines = Array.from(new Set(vehicles.map(v => v.lineCode).filter(Boolean)));
            const linesList = activeLines.length > 0 ? activeLines.join(', ') : 'Henüz araç atanmış bir hat yok.';

            reply = `Sorgunuza uygun bir araç veya hat verisi bulunamadı.\n\n` +
                `💡 **Sistemdeki Aktif Hatlar:** ${linesList}\n` +
                `Örnek sorular:\n` +
                `- *"Bakımda kaç araç var?"*\n` +
                `- *"${activeLines[0] || '399C'} hattında kaç araç var?"*`;
        }

        return {
            reply,
            timestamp: new Date().toISOString()
        };
    }
};

export default assistantService;