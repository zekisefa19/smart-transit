export type VehicleType = 'Otobüs' | 'Metro' | 'Tramvay' | 'Metrobüs';

export interface Vehicle {
    id: string; // Otomatik atanan VehicleId (UUID/Guid)
    plate: string; // Plaka
    brand: string; // Marka
    model?: string;
    type: VehicleType; // Araç cinsi
    capacity: number; // Yolcu kapasitesi
    lineId?: string | null; // Atandığı Hat ID'si
}

export interface RouteLine {
    id: string; // Hat ID
    lineCode: string; // Hat Adı/Kodu (Örn: "M4", "500T") -> BENZERSİZ
    startLocation: string; // Başlangıç Konumu
    endLocation: string; // Bitiş Konumu
    assignedVehicleIds: string[]; // Bu hatta tanımlı araçların ID listesi
}