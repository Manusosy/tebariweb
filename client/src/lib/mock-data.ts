import { Hotspot, CollectionSubmission, User } from './types';

// Mock Users
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Sarah CEO', email: 'sarah@tebari.com', role: 'super_admin', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 'u2', name: 'Ops Manager', email: 'ops@tebari.com', role: 'admin', avatar: 'https://i.pravatar.cc/150?u=ops' },
  { id: 'u3', name: 'John Field', email: 'john@tebari.com', role: 'field_officer', avatar: 'https://i.pravatar.cc/150?u=john' },
  { id: 'u4', name: 'Eco Partners', email: 'partner@eco.com', role: 'partner', avatar: 'https://i.pravatar.cc/150?u=eco' },
];

// Mock Hotspots (Coastal Kenya focus: Kilifi, Mtwapa, Watamu)
export const MOCK_HOTSPOTS: Hotspot[] = [
  {
    id: 'h1',
    name: 'Watamu Beach North',
    location: { lat: -3.350, lng: 40.015 },
    status: 'Critical',
    severity: 'critical',
    trend: 'up',
    estimatedVolume: 450,
    reportedBy: 'u3',
    reportedAt: '2025-02-10T08:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-5f8dd1203941?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'h2',
    name: 'Mtwapa Creek Landing',
    location: { lat: -3.935, lng: 39.760 },
    status: 'Active',
    severity: 'high',
    trend: 'stable',
    estimatedVolume: 200,
    reportedBy: 'u3',
    reportedAt: '2025-02-12T10:15:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'h3',
    name: 'Kilifi Bridge Underpass',
    location: { lat: -3.630, lng: 39.850 },
    status: 'Improving',
    severity: 'medium',
    trend: 'down',
    estimatedVolume: 80,
    reportedBy: 'u2',
    reportedAt: '2025-02-05T14:20:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'h4',
    name: 'Malindi Market Outskirts',
    location: { lat: -3.220, lng: 40.110 },
    status: 'New',
    severity: 'low',
    trend: 'up',
    estimatedVolume: 50,
    reportedBy: 'u3',
    reportedAt: '2025-02-13T09:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=60'
  }
];

// Mock Submissions
export const MOCK_SUBMISSIONS: CollectionSubmission[] = [
  {
    id: 's1',
    officerId: 'u3',
    hotspotId: 'h1',
    location: { lat: -3.350, lng: 40.015 },
    timestamp: '2025-02-13T08:45:00Z',
    plasticTypes: { 'PET': 20, 'HDPE': 15 },
    totalWeight: 35,
    imageUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop&q=60',
    status: 'pending',
    notes: 'Heavy rain exposed more waste.'
  },
  {
    id: 's2',
    officerId: 'u3',
    hotspotId: 'h2',
    location: { lat: -3.935, lng: 39.760 },
    timestamp: '2025-02-12T16:00:00Z',
    plasticTypes: { 'PP': 50 },
    totalWeight: 50,
    imageUrl: 'https://images.unsplash.com/photo-1605600659873-d808a13a4d2a?w=800&auto=format&fit=crop&q=60',
    status: 'approved'
  }
];

// Database Schema Representation (for future migration)
export const POSTGRES_SCHEMA_REFERENCE = `
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'field_officer', 'partner')),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Hotspots Table
CREATE TABLE hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  status TEXT CHECK (status IN ('New', 'Active', 'Critical', 'Improving', 'Collected', 'Archived')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
  estimated_volume_kg DECIMAL,
  reported_by UUID REFERENCES users(id),
  reported_at TIMESTAMP DEFAULT NOW()
);

-- Submissions Table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id UUID REFERENCES users(id),
  hotspot_id UUID REFERENCES hotspots(id),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  total_weight_kg DECIMAL NOT NULL,
  image_url TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  
  -- Plastic Types (could be a JSONB column or separate table)
  pet_kg DECIMAL DEFAULT 0,
  hdpe_kg DECIMAL DEFAULT 0,
  pp_kg DECIMAL DEFAULT 0,
  ldpe_kg DECIMAL DEFAULT 0,
  ps_kg DECIMAL DEFAULT 0,
  pvc_kg DECIMAL DEFAULT 0,
  other_kg DECIMAL DEFAULT 0
);
`;
