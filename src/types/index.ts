export type Tenant = {
  id: string;
  name: string;
  slug: string;
  whatsapp_number: string; // <--- The critical piece we were missing
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
  transmission: 'Automatic' | 'Manual';
  daily_rate_omr: number;
  images: string[];
  is_available: boolean;
  features: string[];
  
  // RELATIONS
  // We make this optional (?) because we only fetch it on the Marketplace page
  tenants?: Tenant; 
};