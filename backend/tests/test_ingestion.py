from pathlib import Path

import pytest

from app.pipeline.normalization import normalize_text
from app.utils.pdf_utils import extract_pdf_text


def test_normalize_text():

    raw = (
        "Product:   Motor\n\n\n"
        "Voltage:    230V"
    )

    result = normalize_text(
        raw
    )

    assert "Product: Motor" in result
    assert "Voltage: 230V" in result


def test_missing_pdf():

    with pytest.raises(
        FileNotFoundError
    ):

        extract_pdf_text(
            "does_not_exist.pdf"
        )
