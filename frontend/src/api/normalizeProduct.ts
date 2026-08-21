import type { ProductResponse } from "../types/product";

export function normalizeProduct(data: ProductResponse) {
  const core = data.extraction?.core_fields || {};
  const technical = data.extraction?.technical_attributes || {};
  const validation = data.extraction?.validation || {
    missing_required_fields: [],
    unit_inconsistencies: [],
    duplicate_of: null,
    flags: [],
  };

  return {
    productId: data.product_id,
    sourceType: data.source_type,
    sourceReference: data.source_reference,

    productName: core.product_name?.value ?? null,
    manufacturer: core.brand_manufacturer?.value ?? null,
    category: core.category?.value ?? null,
    sku: core.sku_part_number?.value ?? null,
    description: core.description?.value ?? null,
    price: core.price?.value ?? null,

    material: technical.material?.value ?? null,
    dimensions: technical.dimensions?.value ?? null,
    weight: technical.weight?.value ?? null,
    voltagePowerRating: technical.voltage_power_rating?.value ?? null,
    certifications: technical.certifications_compliance?.value ?? null,
    compatibleParts: technical.compatible_parts?.value ?? null,
    customAttributes: technical.custom_attributes || {},

    validation: {
      missingRequiredFields: validation.missing_required_fields ?? [],
      unitInconsistencies: validation.unit_inconsistencies ?? [],
      duplicateOf: validation.duplicate_of ?? null,
      flags: validation.flags ?? [],
    },

    fields: {
      productName: core.product_name,
      manufacturer: core.brand_manufacturer,
      category: core.category,
      sku: core.sku_part_number,
      description: core.description,
      price: core.price,

      material: technical.material,
      dimensions: technical.dimensions,
      weight: technical.weight,
      voltagePowerRating: technical.voltage_power_rating,
      certifications: technical.certifications_compliance,
      compatibleParts: technical.compatible_parts,
    },
  };
}
