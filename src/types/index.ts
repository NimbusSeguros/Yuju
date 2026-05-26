// ============================================================================
// SHARED TYPES FOR YUJU COTIZADORES
// ============================================================================

// ----------------------------------------------------------------------------
// Auth Types
// ----------------------------------------------------------------------------

export interface AuthTokenResponse {
  token: string;
  expiresAt?: number;
}

export interface ApiClientConfig {
  baseURL: string;
  tokenKey: string;
  clientSecret?: string;
}

// ----------------------------------------------------------------------------
// Cotizador (Quote) Types
// ----------------------------------------------------------------------------

export type CoverageCategory =
  | 'RC'
  | 'TerceroCompleto'
  | 'TercerosCombinado'
  | 'Basico'
  | 'Full'
  | 'Premium';

export type InsuranceType = 'auto' | 'moto' | 'bici' | 'hogar' | 'notebook' | 'monopatin';

export interface Quote {
  aseguradora: string;
  nombrePlan: string;
  precio: number;
  precioOriginal?: number;
  originalPrice?: number;
  discountPercent?: number;
  coverage?: string;
  cobertura?: string;
  sumaAsegurada?: number;
  category?: CoverageCategory;
  imageUrl?: string;
  insurerLogo?: string;
  exceso?: number;
  deducible?: number;
  benefits?: string[];
  tieneInspeccion?: boolean;
}

export interface QuoteGroup {
  insuranceType: InsuranceType;
  quotes: Quote[];
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
}

export interface CotizacionPayload {
  marca: string;
  modelo: string;
  anio: number;
  codigoPostal: string;
  localidad?: string;
  vigencia?: string;
  uso?: string;
}

export interface QuotationResult {
  rus?: Quote[];
  atm?: Quote[];
  integrity?: Quote[];
  rusError?: string;
  atmError?: string;
  integrityError?: string;
}

// ----------------------------------------------------------------------------
// Vehicle Types (Auto, Moto)
// ----------------------------------------------------------------------------

export interface VehicleBrand {
  id: string | number;
  name: string;
  logo?: string;
  vehicleType?: number;
}

export interface VehicleModel {
  id: string | number;
  codia?: string | number;
  description?: string;
  group?: {
    id?: string | number;
    name?: string;
  };
  prices_from?: number;
  prices_to?: number;
  brand?: string | number;
  brandId?: string | number;
}

export interface VehicleVersion {
  id: string | number;
  description: string;
  codia: string | number;
  groupId?: string | number;
}

export interface YearRange {
  from: number;
  to: number;
}

// ----------------------------------------------------------------------------
// Vigencia (Policy Duration) Types
// ----------------------------------------------------------------------------

export interface Vigencia {
  id: string | number;
  descripcion: string;
  description?: string;
  months?: number;
}

export interface VigenciaOption {
  value: string | number;
  label: string;
  months?: number;
}

// ----------------------------------------------------------------------------
// Locality / Postal Code Types
// ----------------------------------------------------------------------------

export interface Localidad {
  postalCode: string;
  place: string;
  cityCode?: string;
  admin1: string; // Province/State
  admin2?: string; // City
  lat?: number;
  lon?: number;
  // Extended fields from RUS API
  id?: string | number;
  ID?: string | number;
  descripcion?: string;
  description?: string;
  localidad?: string;
}

export interface PostalCodeSearchResult {
  matches: Localidad[];
  found: boolean;
}

// ----------------------------------------------------------------------------
// Coverage Types
// ----------------------------------------------------------------------------

export interface CoverageDetail {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  deductible?: number;
}

export interface CoveragePlan {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  coverageType: CoverageCategory;
  coverages: CoverageDetail[];
  hasDeductible?: boolean;
  deductibleAmount?: number;
}

// ----------------------------------------------------------------------------
// Form State Types
// ----------------------------------------------------------------------------

export interface CotizadorFormState {
  step: number;
  brand: VehicleBrand | null;
  model: VehicleModel | null;
  year: string;
  locality: Localidad | null;
  selectedPlan: CoveragePlan | null;
  loading: boolean;
  error: string | null;
}

// ----------------------------------------------------------------------------
// API Response Types
// ----------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ----------------------------------------------------------------------------
// Cache Types
// ----------------------------------------------------------------------------

export interface CacheEntry<T> {
  data: T;
  expiry: number;
}

// ----------------------------------------------------------------------------
// UI State Types
// ----------------------------------------------------------------------------

export type ThemeMode = 'light' | 'dark' | 'system';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}