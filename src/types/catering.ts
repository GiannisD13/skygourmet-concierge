export interface Airport {
  id?: number;
  code: string;
  name: string;
  city: string;
  is_active?: boolean;
  pickupLocation?: string;
  coordinates?: { lat: number; lng: number };
}

// Local metadata not stored in backend (physical/operational info)
export const airportMeta: Record<string, { pickupLocation: string; coordinates: { lat: number; lng: number } }> = {
  ATH: { pickupLocation: 'General Aviation Terminal - VIP Gate 3', coordinates: { lat: 37.9364, lng: 23.9445 } },
  SKG: { pickupLocation: 'Private Aviation Center - Gate A', coordinates: { lat: 40.5197, lng: 22.9709 } },
  JMK: { pickupLocation: 'Executive Lounge - Apron Access', coordinates: { lat: 37.4351, lng: 25.3481 } },
};

// Static fallback used if API is unavailable
export const airports: Airport[] = [
  { code: 'ATH', name: 'Athens International Airport', city: 'Athens', ...airportMeta.ATH },
  { code: 'SKG', name: 'Thessaloniki Airport', city: 'Thessaloniki', ...airportMeta.SKG },
  { code: 'JMK', name: 'Mykonos Airport', city: 'Mykonos', ...airportMeta.JMK },
];

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  items: string[];
}

export interface MenuTier {
  id: string;
  bundleId?: number;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  image: string;
  items: MenuItem[];
  featured?: boolean;
  isCustom?: boolean;
}

export interface OrderDetails {
  airport: Airport;
  menu: MenuTier;
  tailNumber: string;
  flightDate: string;
  deliveryTime: string;
  attendantName: string;
  specialRequirements: string;
  passengerCount: number;
}
