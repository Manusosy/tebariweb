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
  id: string;
  name: string;
  location: Location;
  status: HotspotStatus;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trend: TrendDirection;
  estimatedVolume: number; // in kg
  reportedBy: string; // user id
  reportedAt: string; // ISO date
  imageUrl: string;
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
