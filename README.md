# FSRO - Financial System Risk Observatory
## Reserve Bank of India | Climate Risk Intelligence Platform

A comprehensive platform for monitoring, forecasting, and managing climate-related financial risks across India's banking sector.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** installed
- **Node.js 18+** installed
- **MongoDB Atlas** account (credentials already configured)

---

## 📦 Setup Instructions

### Step 1: Seed the Database

First, you need to populate MongoDB with your RBI data:

1. Open Command Prompt
2. Navigate to backend folder:
   ```cmd
   cd "C:\Users\Sourav Acharya\Downloads\FSRO\backend"
   ```
3. Run the seed script:
   ```cmd
   seed_database.bat
   ```
   
   Or manually:
   ```cmd
   pip install -r requirements.txt
   python seed.py
   ```

This will:
- Connect to your MongoDB Atlas cluster
- Load all data from `C:\Users\Sourav Acharya\Downloads\RBI DATA`
- Create a demo admin user: `admin@rbi.org.in` / `admin123`

---

### Step 2: Start the Backend Server

1. Open Command Prompt
2. Navigate to backend folder:
   ```cmd
   cd "C:\Users\Sourav Acharya\Downloads\FSRO\backend"
   ```
3. Install dependencies (if not already done):
   ```cmd
   pip install -r requirements.txt
   ```
4. Start the server:
   ```cmd
   uvicorn server:app --reload --host 127.0.0.1 --port 8000
   ```

Backend will be available at: **http://localhost:8000**
API Documentation: **http://localhost:8000/docs**

---

### Step 3: Start the Frontend

1. Open a **new** Command Prompt
2. Navigate to frontend folder:
   ```cmd
   cd "C:\Users\Sourav Acharya\Downloads\FSRO\frontend"
   ```
3. Install dependencies (first time only):
   ```cmd
   npm install
   ```
4. Start the development server:
   ```cmd
   npm start
   ```

Frontend will be available at: **http://localhost:3000**

---

## 🔐 Login Credentials

### Demo Admin Account
- **Email:** admin@rbi.org.in
- **Password:** admin123

### Or Register a New Account
You can also register a new account through the application.

---

## 📊 Features

### Dashboard
- 20+ Climate Risk KPIs
- Date range filtering
- Real-time data from MongoDB
- Financial sector metrics

### Forecasts
- ML-powered predictions
- Confidence intervals
- 20+ forecast models
- Diagnosis and recommendations

### Scenarios (What-If Analysis)
- 20 different scenario types
- Multiple severity levels
- Stress testing simulations

### Anomalies & Alerts
- Real-time anomaly detection
- 20+ alert types
- Severity categorization

### Reports
- CSV export functionality
- Filtered data exports
- KPI, Anomaly, and Forecast reports

### Settings
- Slack webhook integration
- Alert thresholds configuration
- Email notification settings

---

## 🔧 Configuration Files

### Backend (.env)
Location: `FSRO/backend/.env`
```
MONGO_URL=mongodb+srv://finpilot_user:Spera%401234@clusterspera.lsxis5a.mongodb.net/...
MONGO_DB=fsro_rbi
JWT_SECRET=fsro-rbi-super-secret-jwt-key-2025-production
RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

### Frontend (.env)
Location: `FSRO/frontend/.env`
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

> **Note:** The reCAPTCHA keys are Google's test keys for development. Replace with production keys in production.

---

## 📁 Data Sources

Data is loaded from: `C:\Users\Sourav Acharya\Downloads\RBI DATA`

Files included:
- `rbi.csv` - Main climate risk data
- `ESG.csv` - ESG company data
- `india_financial_sector_exposure.csv` - Financial sector data
- `CO2 emissions.xlsx` - CO2 emissions data
- `Climate India.xlsx` - Climate data
- `Natural Disaster data.xlsx` - Disaster data
- `Other Gas Emissions State Wise.xlsx` - State-wise emissions
- `RBI Complaints Data.xlsx` - Complaints data

---

## 🛠️ Troubleshooting

### Backend won't start
1. Check MongoDB connection string in `.env`
2. Ensure all dependencies are installed: `pip install -r requirements.txt`
3. Check if port 8000 is available

### Frontend won't connect to backend
1. Ensure backend is running on port 8000
2. Check CORS settings in backend
3. Verify `REACT_APP_API_URL` in frontend `.env`

### Login fails
1. Run the seed script to create demo user
2. Check MongoDB connection
3. Verify user exists in database

### reCAPTCHA errors
The test keys should work in development. If issues persist:
1. Check browser console for errors
2. Ensure site key matches in frontend
3. Try clearing browser cache

---

## 🏢 About

**FSRO - Financial System Risk Observatory**
Developed for Reserve Bank of India

**Powered by:** Spera Digital
- Website: https://speradigital.com/

---

## 📞 Support

For technical issues or feature requests, please contact the development team.
