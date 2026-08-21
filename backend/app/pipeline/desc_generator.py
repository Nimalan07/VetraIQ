def generate_invoice_desc(mfg: str, category: str, specs: list, max_len: int = 100) -> str:
    """
    Generate an uppercase distributor invoice description.
    Format: [MFG] [CATEGORY] [SPEC_VALUES]
    """
    parts = []
    if mfg:
        parts.append(str(mfg).upper())
    if category:
        parts.append(str(category).upper())
    
    for label, val in specs:
        if val:
            # Strip spaces inside specifications for compact invoice format
            parts.append(str(val).upper().replace(" ", ""))
            
    desc = " ".join(parts)
    return desc[:max_len].strip()

def generate_mobile_desc(brand: str, prod_name: str, category: str, specs: list, max_len: int = 250) -> str:
    """
    Generate mobile descriptions under 250 characters.
    Format: [Brand] [Product Name] [Category], [Spec 1], [Spec 2]...
    """
    prefix = f"{brand} {prod_name}" if brand and brand.lower() not in str(prod_name).lower() else prod_name
    parts = [prefix]
    
    for label, val in specs:
        if val:
            parts.append(f"{label} {val}" if label.lower() not in ("material", "dimensions", "weight") else str(val))
            
    desc = ", ".join(parts)
    return desc[:max_len].strip()

def generate_short_desc(prod_title: str, specs: list, max_len: int = 100) -> str:
    """
    Generate short description under 100 characters.
    """
    parts = [prod_title]
    for label, val in specs[:3]:
        if val:
            parts.append(str(val))
    desc = ", ".join(parts)
    return desc[:max_len].strip()

def generate_long_desc(brand: str, prod_name: str, category: str, specs: list) -> str:
    """
    Generate long description.
    """
    parts = [f"{brand} {prod_name} {category}"]
    specs_str = ", ".join([f"{l}: {v}" for l, v in specs if v])
    if specs_str:
        parts.append(f"featuring specifications: {specs_str}")
    return ". ".join(parts) + "."
