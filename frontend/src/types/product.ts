export interface ProductField {
  value: any;
  confidence: number;
  method: "extracted" | "enriched" | null;
  source_ref: string | null;
  flags: string[];
}

export interface ProductData {
  core_fields: {
    product_name: ProductField;
    brand_manufacturer: ProductField;
    category: ProductField;
    sku_part_number: ProductField;
    description: ProductField;
    price: ProductField;
  };

  technical_attributes: {
    material: ProductField;
    dimensions: ProductField;
    weight: ProductField;
    voltage_power_rating: ProductField;
    certifications_compliance: ProductField;
    compatible_parts: ProductField;
    custom_attributes: Record<string, ProductField>;
  };

  validation?: {
    missing_required_fields: string[];
    unit_inconsistencies: string[];
    duplicate_of: string | null;
    flags: string[];
  };
}

export interface ProductResponse {
  success: boolean;
  product_id: string;
  source_type: string;
  source_reference: string;
  extraction: ProductData;
}
