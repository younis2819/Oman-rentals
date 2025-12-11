export type Tenant = {
  id: string;
  name: string;
  slug: string;
  whatsapp_number: string;
  logo_url: string | null; // Added logo_url
  address: string | null;  // Added address
  brand_config?: {
    primary: string;
    font: string;
  };
};

export type Car = {
  id: string;
  tenant_id: string;
  make: string;
  model: string;
  year: number;
  daily_rate_omr: number;
  images: string[];
  is_available: boolean;
  is_featured: boolean; // Added
  created_at: string;   // Added

  // 👇 The critical missing fields causing your build error
  category: 'car' | 'heavy';
  description?: string | null;
  transmission?: string | null; // Changed to string | null to match DB
  features: string[] | null;    // Changed to nullable array

  // Dynamic Specs (JSONB)
  specs?: {
    fuel?: string;
    seats?: number;
    tonnage?: string;
    usage_hours?: string;
    reach?: string;
  } | null;
  
  // Relations
  tenants?: Tenant; 
};