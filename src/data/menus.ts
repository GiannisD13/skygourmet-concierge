import { MenuTier } from '@/types/catering';
import executiveImg from '@/assets/menu-executive.jpg';
import mediterraneanImg from '@/assets/menu-mediterranean.jpg';
import signatureImg from '@/assets/menu-signature.jpg';

export const menuTiers: MenuTier[] = [
  {
    id: 'executive',
    name: 'The Executive',
    subtitle: 'Business Class Elegance',
    description: 'Perfect for morning departures and business meetings. A refined selection of continental breakfast favorites and light cold platters.',
    price: 890,
    image: executiveImg,
    items: [
      {
        id: 'breakfast',
        name: 'Continental Breakfast',
        description: 'Artisan pastries and premium coffee',
        items: [
          'Fresh butter croissants & pain au chocolat',
          'Artisan sourdough with Greek honey',
          'Smoked Norwegian salmon with cream cheese',
          'Premium espresso & specialty teas',
        ],
      },
      {
        id: 'cold-platter',
        name: 'Cold Platter Selection',
        description: 'Refined charcuterie and cheese',
        items: [
          'Aged Gruyère & Manchego selection',
          'Italian prosciutto di Parma',
          'Seasonal fruit arrangement',
          'Greek yogurt with thyme honey',
        ],
      },
    ],
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean Elite',
    subtitle: 'Aegean Treasures',
    description: 'A celebration of Greece\'s finest ingredients. Fresh seafood, vibrant salads, and premium meats inspired by the Mediterranean coast.',
    price: 1450,
    image: mediterraneanImg,
    featured: true,
    items: [
      {
        id: 'seafood',
        name: 'Aegean Seafood',
        description: 'Fresh catch from Greek waters',
        items: [
          'Grilled octopus with olive oil & lemon',
          'Fresh oysters on crushed ice',
          'Seared tuna with sesame crust',
          'Langoustine tartare',
        ],
      },
      {
        id: 'greek-classics',
        name: 'Greek Classics',
        description: 'Traditional flavors, elevated',
        items: [
          'Santorini cherry tomato salad',
          'Barrel-aged feta with capers',
          'Lamb chops with rosemary',
          'Moussaka in individual portions',
        ],
      },
      {
        id: 'desserts',
        name: 'Sweet Finale',
        description: 'Traditional Greek desserts',
        items: [
          'Baklava with pistachio',
          'Galaktoboureko portions',
          'Greek loukoumades',
        ],
      },
    ],
  },
  {
    id: 'signature',
    name: 'Signature Gourmet',
    subtitle: 'The Ultimate Experience',
    description: 'Our most exclusive offering. A multi-course fine dining experience featuring caviar, truffles, and champagne-paired courses for the most discerning palates.',
    price: 2890,
    image: signatureImg,
    items: [
      {
        id: 'caviar',
        name: 'Caviar Service',
        description: 'The finest roe, expertly served',
        items: [
          'Oscietra caviar (50g per guest)',
          'Traditional blinis & crème fraîche',
          'Mother of pearl spoons',
          'Champagne pairing included',
        ],
      },
      {
        id: 'main-courses',
        name: 'Main Courses',
        description: 'Michelin-inspired creations',
        items: [
          'Wagyu beef tenderloin A5',
          'Black truffle risotto',
          'Lobster thermidor',
          'Foie gras with fig compote',
        ],
      },
      {
        id: 'wine-selection',
        name: 'Beverage Pairing',
        description: 'Curated selections',
        items: [
          'Dom Pérignon Vintage',
          'Château Margaux selection',
          'Rare Greek Assyrtiko reserve',
          'Premium spirits collection',
        ],
      },
    ],
  },
];
