export interface Airport {
  code: string;
  name: string;
  city: string;
  pickupLocation: string;
  coordinates: { lat: number; lng: number };
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  items: string[];
}

export interface MenuTier {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  image: string;
  items: MenuItem[];
  featured?: boolean;
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

export const airports: Airport[] = [
  {
    code: 'ATH',
    name: 'Athens International Airport',
    city: 'Athens',
    pickupLocation: 'General Aviation Terminal - VIP Gate 3',
    coordinates: { lat: 37.9364, lng: 23.9445 },
  },
  {
    code: 'SKG',
    name: 'Thessaloniki Airport',
    city: 'Thessaloniki',
    pickupLocation: 'Private Aviation Center - Gate A',
    coordinates: { lat: 40.5197, lng: 22.9709 },
  },
  {
    code: 'JMK',
    name: 'Mykonos Airport',
    city: 'Mykonos',
    pickupLocation: 'Executive Lounge - Apron Access',
    coordinates: { lat: 37.4351, lng: 25.3481 },
  },
];
