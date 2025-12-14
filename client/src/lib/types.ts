export type UserRole = 'super_admin' | 'admin' | 'field_officer' | 'partner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type PlasticType = 'PET' | 'HDPE' | 'PP' | 'LDPE' | 'PS' | 'PVC' | 'Other';

export type HotspotStatus = 'New' | 'Active' | 'Critical' | 'Improving' | 'Collected' | 'Archived';

export type TrendDirection = 'up' | 'down' | 'stable';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Hotspot {
  id: number;
  name: string;
  description: string | null;
  latitude: string; // decimal
  longitude: string; // decimal
  status: string; // active, cleared, critical
  estimatedVolume: string; // decimal
  createdAt: Date | null;

  // Optional for UI compatibility during migration if needed, but preferred to use schema fields
  imageUrl?: string;
}

export interface CollectionSubmission {
  id: string;
  officerId: string;
  hotspotId?: string; // Optional if new spot
  location: Location;
  timestamp: string;
  plasticTypes: Partial<Record<PlasticType, number>>; // type -> weight in kg
  totalWeight: number;
  imageUrl: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface AnalyticsMetric {
  label: string;
  value: string | number;
  change?: number; // percentage
  trend?: 'up' | 'down' | 'neutral';
}
