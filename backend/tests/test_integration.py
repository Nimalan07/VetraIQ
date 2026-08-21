import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core import config
from pathlib import Path

def test_health_check():
    with TestClient(app) as client:
        response = client.get("/docs")
        assert response.status_code == 200

def test_demo_mode_swagelok(monkeypatch):
    monkeypatch.setattr(config, "DEMO_MODE", True)
    
    upload_dir = Path(__file__).resolve().parents[1] / "uploads"
    upload_dir.mkdir(exist_ok=True)
    dummy_file = upload_dir / "demo_swagelok_test.pdf"
    dummy_file.write_text("dummy text")

    try:
        with TestClient(app) as client:
            response = client.post("/api/process/pdf?filename=demo_swagelok_test.pdf")
            assert response.status_code == 200
            json_data = response.json()
            assert json_data["success"] is True
            assert json_data["extraction"]["core_fields"]["brand_manufacturer"]["value"] == "Swagelok"
            assert json_data["extraction"]["core_fields"]["category"]["value"] == "Ball Valve"
    finally:
        if dummy_file.exists():
            dummy_file.unlink()

def test_demo_mode_siemens(monkeypatch):
    monkeypatch.setattr(config, "DEMO_MODE", True)
    
    upload_dir = Path(__file__).resolve().parents[1] / "uploads"
    upload_dir.mkdir(exist_ok=True)
    dummy_file = upload_dir / "demo_siemens_test.pdf"
    dummy_file.write_text("dummy text")

    try:
        with TestClient(app) as client:
            response = client.post("/api/process/pdf?filename=demo_siemens_test.pdf")
            assert response.status_code == 200
            json_data = response.json()
            assert json_data["success"] is True
            assert json_data["extraction"]["core_fields"]["brand_manufacturer"]["value"] == "Siemens AG"
            assert json_data["extraction"]["core_fields"]["category"]["value"] == "Low-Voltage Motors"
    finally:
        if dummy_file.exists():
            dummy_file.unlink()


def test_demo_mode_catalog_sheet(monkeypatch):
    monkeypatch.setattr(config, "DEMO_MODE", True)
    
    upload_dir = Path(__file__).resolve().parents[1] / "uploads"
    upload_dir.mkdir(exist_ok=True)
    dummy_file = upload_dir / "demo_swagelok_test.pdf"
    dummy_file.write_text("dummy text")

    try:
        with TestClient(app) as client:
            response = client.post("/api/process/catalog-sheet?filename=demo_swagelok_test.pdf")
            assert response.status_code == 200
            json_data = response.json()
            assert json_data["success"] is True
            assert "TECHNICAL CATALOG SHEET" in json_data["markdown"]
            assert "Swagelok" in json_data["markdown"]
    finally:
        if dummy_file.exists():
            dummy_file.unlink()


def test_bulk_csv_processing(monkeypatch):
    monkeypatch.setattr(config, "DEMO_MODE", True)
    
    csv_content = (
        "Mfg_Part_Num,Part_Desc,E1_Brand,Unilog_Brand,DIB_Brand,Part_Manuf\n"
        "DCB518ASTS06G,Diablo Sanding Belt,E1,Unilog,DIB,Freud Inc\n"
        "3MABR-7100075678,3M 775L Stikit Film P150,E1,Unilog,DIB,3M\n"
    )
    
    with TestClient(app) as client:
        files = {"file": ("test_input.csv", csv_content, "text/csv")}
        response = client.post("/api/process/bulk-csv?limit=2", files=files)
        
        assert response.status_code == 200
        output_csv = response.text
        assert "Mfg_Part_Num" in output_csv
        assert "ATTRIBUTE_LABEL 1" in output_csv
        
        # Verify headers match official expected layout (exactly 252 headers)
        lines = output_csv.splitlines()
        assert len(lines) > 1
        headers = lines[0].split(",")
        assert len(headers) == 252
        assert headers[0] == "MFR URL"
        assert headers[-1] == "Actual Image (Yes/No)"


