export type Tenant = {
  id: string;
  name: string;
  slug: string;
  whatsapp_number: string;
  logo_url: string | null;
  address: string | null;
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
  is_featured: boolean;
  created_at: string;

  // 👇 FIXED: Removed '?' because these columns always exist in DB (even if null)
  category: 'car' | 'heavy';
  description: string | null;   // Changed from description?
  transmission: string | null;  // Changed from transmission?
  features: string[] | null;    // Changed from features?

  // Specs JSONB (This remains optional because it's a JSON blob)
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