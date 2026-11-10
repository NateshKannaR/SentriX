export interface SafeMusterZone {
  id: string;
  name: string;
  type: 'Shelter' | 'Hospital' | 'FireStation';
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  contactPhone: string;
  address: string;
  status: 'Open' | 'Near Capacity' | 'Full';
}

export const SAFE_MUSTER_ZONES: SafeMusterZone[] = [
  {
    id: 'sz-01',
    name: 'Kanteerava Indoor Stadium Evacuation Shelter',
    type: 'Shelter',
    latitude: 12.9698,
    longitude: 77.5926,
    capacity: 2500,
    currentOccupancy: 420,
    contactPhone: '+91 80 2221 4455',
    address: 'Kasturba Road, Sampangi Rama Nagar, Bengaluru',
    status: 'Open',
  },
  {
    id: 'sz-02',
    name: 'Victoria Hospital Level-1 Trauma Emergency Care',
    type: 'Hospital',
    latitude: 12.9634,
    longitude: 77.5746,
    capacity: 450,
    currentOccupancy: 380,
    contactPhone: '+91 80 2670 1150',
    address: 'Fort Road, Near City Market, Bengaluru',
    status: 'Open',
  },
  {
    id: 'sz-03',
    name: 'Manipal Hospital Critical Care & Burn Unit',
    type: 'Hospital',
    latitude: 12.9592,
    longitude: 77.6499,
    capacity: 300,
    currentOccupancy: 275,
    contactPhone: '+91 80 2502 4444',
    address: '98 HAL Old Airport Rd, Kodihalli, Bengaluru',
    status: 'Near Capacity',
  },
  {
    id: 'sz-04',
    name: 'South Zone Central Fire & Disaster Rescue Station',
    type: 'FireStation',
    latitude: 12.9304,
    longitude: 77.5838,
    capacity: 120,
    currentOccupancy: 35,
    contactPhone: '+91 80 2297 1500',
    address: 'Jayanagar 4th Block, Bengaluru',
    status: 'Open',
  },
  {
    id: 'sz-05',
    name: 'Whitefield Municipal Community Relief Centre',
    type: 'Shelter',
    latitude: 12.9738,
    longitude: 77.7499,
    capacity: 1800,
    currentOccupancy: 150,
    contactPhone: '+91 80 2845 3300',
    address: 'Inner Circle, Whitefield, Bengaluru',
    status: 'Open',
  },
];
