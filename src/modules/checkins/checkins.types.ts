// Database row (snake_case)
export interface CheckinRow {
  id: string;
  user_id: string;
  court_id: string;
  checked_in_at: Date;
  checked_out_at: Date | null;
  auto_expired: boolean;
  created_at: Date;
  updated_at: Date;
}

// Domain object (camelCase)
export interface Checkin {
  id: string;
  userId: string;
  courtId: string;
  checkedInAt: Date;
  checkedOutAt: Date | null;
  autoExpired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Check-in with court details (for responses)
export interface CheckinWithCourt extends Checkin {
  court: {
    id: string;
    name: string;
    address?: string;
    city: string;
    latitude: number;
    longitude: number;
  };
}

// Occupancy types
export type OccupancyLevel = 'empty' | 'low' | 'medium' | 'high' | 'full';

export interface Occupancy {
  count: number;           // Number of active check-ins
  level: OccupancyLevel;   // Status level
}

export interface CourtOccupancy {
  courtId: string;
  occupancy: Occupancy;
}

export interface CourtOccupancyWithDetails extends CourtOccupancy {
  court: {
    id: string;
    name: string;
    address?: string;
    city: string;
    suburb?: string;
    latitude: number;
    longitude: number;
    distance?: number;
  };
}

// Query interfaces
export interface ListCheckinsQuery {
  courtId?: string;
  includeActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListCheckinsResponse {
  data: CheckinWithCourt[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface OccupancyQuery {
  courtIds?: string[];
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}
