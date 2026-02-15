/**
 * Courts Module - Type Definitions
 * Basketball courts discovery types
 */

/**
 * Court facilities available at the basketball court
 */
export interface CourtFacilities {
  parking?: boolean;
  restrooms?: boolean;
  water?: boolean;
  seating?: boolean;
  changeRooms?: boolean;
}

/**
 * Court domain object (camelCase for API responses)
 */
export interface Court {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  suburb?: string;
  city: string;
  state: string;
  postcode?: string;
  country: string;
  numHoops: number;
  indoor: boolean;
  surfaceType?: string;
  hasLights: boolean;
  description?: string;
  facilities?: CourtFacilities;
  distance?: number; // Only present when searching by location (in km)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Court row from database (snake_case from PostgreSQL)
 */
export interface CourtRow {
  id: string;
  name: string;
  address?: string;
  latitude: string; // DB returns NUMERIC as string
  longitude: string; // DB returns NUMERIC as string
  suburb?: string;
  city: string;
  state: string;
  postcode?: string;
  country: string;
  num_hoops: number;
  indoor: boolean;
  surface_type?: string;
  has_lights: boolean;
  description?: string;
  facilities?: object;
  distance?: number; // Calculated distance in km
  created_at: Date;
  updated_at: Date;
}

/**
 * Query parameters for listing courts
 */
export interface ListCourtsQuery {
  // Location filters
  city?: string;
  suburb?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;

  // Court attribute filters
  indoor?: boolean;
  hasLights?: boolean;

  // Pagination
  limit?: number;
  offset?: number;
}

/**
 * Response for list courts endpoint
 */
export interface ListCourtsResponse {
  data: Court[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}
