# VetraIQ Cloud Deployment Guide

This guide details how to deploy VetraIQ to production using **Render** (for the FastAPI backend) and **Vercel** (for the Vite + React frontend).

---

## Architecture Overview

VetraIQ is a decoupled full-stack application:
- **Frontend**: Vite + React + TypeScript + TailwindCSS.
- **Backend**: FastAPI + SQLite database.
- **Pipeline Mode**: Local Ollama support for offline extraction, and an optimized **Demo Mode** for hosting platforms like Render where running heavy local LLMs is not feasible.

---

## 1. Deploy the Backend on Render

[Render](https://render.com/) is a cloud platform that allows hosting python services with zero configuration.

### Steps to Deploy:
1. Log in to [Render](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`Nimalan07/VetraIQ`).
4. Set the following parameters:
   - **Name**: `vetraiq-backend`
   - **Runtime**: `Python`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Click **Advanced** and add the following **Environment Variables**:
   - `DEMO_MODE`: `true` 
     *(This ensures the service runs using the pre-compiled high-quality Golden Dataset for demo uploads. It provides instantaneous, accurate, and cost-free responses for judges without requiring a heavy GPU instance for Ollama).*
   - `DATABASE_URL`: `sqlite:///./products.db`
6. Click **Create Web Service**.
7. Once the deployment finishes, copy the URL of your live backend (e.g., `https://vetraiq-backend.onrender.com`).

---

## 2. Deploy the Frontend on Vercel

[Vercel](https://vercel.com/) is the premium choice for hosting Vite applications due to its edge delivery network and automatic deployments on git push.

### Steps to Deploy:
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository (`Nimalan07/VetraIQ`).
4. Set the following configuration parameters:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand the **Environment Variables** section and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://vetraiq-backend.onrender.com` *(Paste your Render backend URL)*
6. Click **Deploy**.
7. Vercel will compile your React app and provide a live URL (e.g., `https://vetraiq.vercel.app`).

---

## 3. Testing the Live Cloud Deployment

1. Open your Vercel URL.
2. Go to the **Analyze Product / Upload** page.
3. Drag and drop or select one of the sample product PDFs (from `sample_data/` folder).
4. The backend will instantly retrieve the structured specification metadata and validation audit report.
5. Review the metrics update on the live dashboard and download your submission package!
