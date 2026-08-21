import re
from fractions import Fraction

def decimal_to_fraction(val: float) -> str:
    """
    Convert a float decimal to a clean fraction representation.
    Example: 0.5 -> "1/2"
             24.25 -> "24-1/4"
    """
    try:
        whole = int(val)
        frac = val - whole
        if frac == 0:
            return str(whole)
        
        # Check standard division fractions
        for num, den in [(1, 8), (1, 4), (3, 8), (1, 2), (5, 8), (3, 4), (7, 8)]:
            if abs(frac - (num / den)) < 0.01:
                frac_str = f"{num}/{den}"
                if whole > 0:
                    return f"{whole}-{frac_str}"
                return frac_str

        # Fallback fraction reducer
        f = Fraction(frac).limit_denominator(32)
        if f.denominator > 1:
            frac_str = f"{f.numerator}/{f.denominator}"
            if whole > 0:
                return f"{whole}-{frac_str}"
            return frac_str
        return str(round(val))
    except Exception:
        return str(val)

def normalize_value_and_uom(val_str: str) -> str:
    """
    Parse a string, convert decimals to fractions, normalize UOM, and insert space.
    Example: "24.5 inch" -> "24-1/2 in"
             "120V" -> "120 V"
    """
    if not val_str:
        return ""
    
    val_str = str(val_str).strip()
    
    # Check for unit matches case-insensitively
    unit_map = {
        "inch": "in", "inches": "in", "in.": "in", "in": "in",
        "feet": "ft", "foot": "ft", "ft.": "ft", "ft": "ft",
        "pound": "lb", "pounds": "lb", "lbs": "lb", "lb.": "lb", "lb": "lb",
        "volt": "V", "volts": "V", "v": "V",
        "amp": "A", "amps": "A", "a": "A",
        "decibel": "dBA", "decibels": "dBA", "dba": "dBA", "db": "dBA",
    }
    
    # Matches float + optional trailing spaces + unit
    match = re.match(r"^([\d\.]+)\s*([a-zA-Z\.\/%\*°]+)$", val_str)
    if match:
        num_str = match.group(1).strip()
        unit = match.group(2).strip().lower()
        
        try:
            val_num = float(num_str)
            num_str = decimal_to_fraction(val_num)
        except ValueError:
            pass
            
        for u_key, u_val in unit_map.items():
            if unit == u_key or unit.rstrip(".") == u_key:
                unit = u_val
                break
                
        return f"{num_str} {unit}"
        
    return val_str
