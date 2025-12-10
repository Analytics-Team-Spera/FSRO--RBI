# FSRO Setup Guide

## Quick Start (5 minutes)

### Step 1: Install Dependencies

**Backend:**
```bash
cd C:\Users\Sourav Acharya\Downloads\FSRO\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd C:\Users\Sourav Acharya\Downloads\FSRO\frontend
npm install
```

### Step 2: Configure MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster or use existing one
3. Get your connection string
4. Edit `backend\.env` and update:
   ```
   MONGO_URI=your_mongodb_connection_string_here
   ```

### Step 3: Configure reCAPTCHA (Optional)

1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Register your site
3. Get Site Key and Secret Key
4. Update in:
   - `backend\.env` → RECAPTCHA_SECRET_KEY
   - `frontend\.env` → REACT_APP_RECAPTCHA_SITE_KEY

**For testing, you can use test keys:**
- Site Key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- Secret Key: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

### Step 4: Seed Database with RBI Data

**Option A: Using API (After starting backend)**
```bash
# Start backend first
cd backend
python app.py

# Then in another terminal or use Postman:
# POST http://localhost:8000/api/data/seed
```

**Option B: Using Python script**
```python
# Create a file: backend/seed_data.py
import asyncio
from pathlib import Path
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB", "fsro_rbi")

async def seed_data():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    
    data_path = Path(r"C:\Users\Sourav Acharya\Downloads\RBI DATA")
    
    # Seed RBI climate data
    rbi_file = data_path / "rbi.csv"
    if rbi_file.exists():
        df = pd.read_csv(rbi_file)
        df['date'] = pd.to_datetime(df['date'], format='mixed', dayfirst=True)
        records = df.to_dict('records')
        await db.climate_data.delete_many({})
        await db.climate_data.insert_many(records)
        print(f"✓ Seeded {len(records)} climate data records")
    
    # Seed financial sector data
    fin_file = data_path / "india_financial_sector_exposure.csv"
    if fin_file.exists():
        df = pd.read_csv(fin_file)
        df['Date'] = pd.to_datetime(df['Date'])
        df = df.rename(columns={'Date': 'date'})
        records = df.to_dict('records')
        await db.financial_sector.delete_many({})
        await db.financial_sector.insert_many(records)
        print(f"✓ Seeded {len(records)} financial sector records")
    
    # Seed ESG data
    esg_file = data_path / "ESG.csv"
    if esg_file.exists():
        df = pd.read_csv(esg_file)
        records = df.to_dict('records')
        await db.esg_data.delete_many({})
        await db.esg_data.insert_many(records)
        print(f"✓ Seeded {len(records)} ESG data records")
    
    print("\n✓ Database seeding completed!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
```

Run: `python backend/seed_data.py`

### Step 5: Start the Application

**Easiest way - Double-click:**
```
START_FSRO.bat
```

**Or manually:**

Terminal 1 (Backend):
```bash
cd C:\Users\Sourav Acharya\Downloads\FSRO\backend
python app.py
```

Terminal 2 (Frontend):
```bash
cd C:\Users\Sourav Acharya\Downloads\FSRO\frontend
npm start
```

### Step 6: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Step 7: Register and Login

1. Go to http://localhost:3000
2. Click "Register"
3. Fill in your details
4. Login with your credentials
5. Optionally enable 2FA in Settings

## Troubleshooting

### Port Already in Use
If port 8000 or 3000 is already in use:

**Backend:**
Edit `backend/app.py` and change the port number.

**Frontend:**
Create a `.env` file in frontend and add:
```
PORT=3001
```

### MongoDB Connection Error
1. Check your MongoDB Atlas cluster is running
2. Verify connection string in `backend/.env`
3. Check if your IP is whitelisted in MongoDB Atlas
4. For development, you can whitelist all IPs (0.0.0.0/0)

### Module Not Found Errors
**Backend:**
```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### Data Not Loading
1. Make sure you've seeded the database
2. Check backend logs for errors
3. Verify MongoDB connection
4. Try the `/api/data/seed` endpoint

### reCAPTCHA Not Working
For testing, use test keys:
- Frontend: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- Backend: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

## Production Deployment

### Security Checklist
- [ ] Change JWT_SECRET in `backend/.env`
- [ ] Use real MongoDB credentials
- [ ] Configure proper reCAPTCHA keys
- [ ] Set up HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Enable MongoDB authentication
- [ ] Set up backup strategy
- [ ] Configure rate limiting
- [ ] Enable logging and monitoring

### Environment Variables

**Backend (.env):**
```env
MONGO_URI=your_production_mongodb_uri
MONGO_DB=fsro_rbi
CORS_ORIGINS=https://your-domain.com
JWT_SECRET=your-super-secret-production-key
RECAPTCHA_SECRET_KEY=your_real_secret_key
```

**Frontend (.env):**
```env
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_RECAPTCHA_SITE_KEY=your_real_site_key
```

### Build for Production

**Frontend:**
```bash
cd frontend
npm run build
# Deploy the 'build' folder to your web server
```

**Backend:**
Use a production ASGI server:
```bash
pip install gunicorn uvicorn
gunicorn server:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Features Overview

### Completed Features ✓
- [x] User Registration & Login
- [x] MongoDB Integration
- [x] Google reCAPTCHA
- [x] Two-Factor Authentication (2FA)
- [x] JWT Authentication
- [x] Dashboard with 20+ KPIs
- [x] 20+ Forecast Models
- [x] 20 What-If Scenarios
- [x] 20+ Anomaly Alerts
- [x] CSV Export Reports
- [x] Settings (Slack, Email, Thresholds)
- [x] Date Range Filters
- [x] Real-time Data Updates
- [x] Responsive Design
- [x] RBI Branding
- [x] Spera Digital Logo Integration

## Next Steps

1. **Configure your MongoDB Atlas cluster**
2. **Run the seed script to import RBI data**
3. **Start both backend and frontend servers**
4. **Register your first user account**
5. **Explore the dashboard and features**
6. **Set up Slack alerts (optional)**
7. **Enable 2FA for enhanced security**
8. **Export your first report**

## Need Help?

- Check the main README.md for detailed documentation
- Review API documentation at http://localhost:8000/docs
- Check backend logs for error messages
- Verify all dependencies are installed correctly

---

**You're all set! The FSRO application is ready to use. 🚀**

**FSRO - Financial System Risk Observatory**  
Reserve Bank of India | Powered by Spera Digital
