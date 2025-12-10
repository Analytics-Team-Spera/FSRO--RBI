"""
FSRO - Financial System Risk Observatory
Database Seeding Script
Loads data from RBI DATA folder into MongoDB
"""

import asyncio
import os
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import logging
import uuid

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(str(ROOT_DIR / ".env"))

# MongoDB configuration
MONGO_URL = os.getenv("MONGO_URL") or os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB", "fsro_rbi")

# Data folder path
DATA_PATH = Path(r"C:\Users\Sourav Acharya\Downloads\RBI DATA")

def clean_dataframe(df):
    """Clean dataframe by replacing NaN values and converting types"""
    # Replace NaN with None for MongoDB
    df = df.replace({np.nan: None, np.inf: None, -np.inf: None})
    
    # Convert date columns
    for col in df.columns:
        if 'date' in col.lower():
            try:
                df[col] = pd.to_datetime(df[col], format='mixed', dayfirst=True, errors='coerce')
            except:
                pass
    
    return df

async def seed_rbi_climate_data(db):
    """Seed main RBI climate data"""
    file_path = DATA_PATH / "rbi.csv"
    
    if not file_path.exists():
        logger.warning(f"File not found: {file_path}")
        return 0
    
    logger.info("Loading RBI climate data...")
    df = pd.read_csv(file_path)
    df = clean_dataframe(df)
    
    # Parse date column
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], format='mixed', dayfirst=True, errors='coerce')
    elif 'date_dd_mm_yyyy' in df.columns:
        df['date'] = pd.to_datetime(df['date_dd_mm_yyyy'], format='%d-%b-%y', errors='coerce')
    
    # Add unique ID and metadata
    records = df.to_dict('records')
    for record in records:
        record['_id'] = str(uuid.uuid4())
        record['created_at'] = datetime.now(timezone.utc)
        # Convert datetime objects for MongoDB
        if record.get('date') and pd.notna(record['date']):
            if isinstance(record['date'], pd.Timestamp):
                record['date'] = record['date'].to_pydatetime()
    
    # Clear existing and insert new
    await db.climate_data.delete_many({})
    if records:
        await db.climate_data.insert_many(records)
        logger.info(f"Inserted {len(records)} climate data records")
    
    # Create indexes
    await db.climate_data.create_index("date")
    await db.climate_data.create_index("daily_npa_climate_pct")
    
    return len(records)

async def seed_financial_sector_data(db):
    """Seed financial sector exposure data"""
    file_path = DATA_PATH / "india_financial_sector_exposure.csv"
    
    if not file_path.exists():
        logger.warning(f"File not found: {file_path}")
        return 0
    
    logger.info("Loading financial sector data...")
    df = pd.read_csv(file_path)
    df = clean_dataframe(df)
    
    # Parse date
    if 'Date' in df.columns:
        df['date'] = pd.to_datetime(df['Date'], errors='coerce')
        df = df.drop(columns=['Date'])
    
    records = df.to_dict('records')
    for record in records:
        record['_id'] = str(uuid.uuid4())
        record['created_at'] = datetime.now(timezone.utc)
        if record.get('date') and pd.notna(record['date']):
            if isinstance(record['date'], pd.Timestamp):
                record['date'] = record['date'].to_pydatetime()
    
    await db.financial_sector.delete_many({})
    if records:
        await db.financial_sector.insert_many(records)
        logger.info(f"Inserted {len(records)} financial sector records")
    
    await db.financial_sector.create_index("date")
    
    return len(records)

async def seed_esg_data(db):
    """Seed ESG company data"""
    file_path = DATA_PATH / "ESG.csv"
    
    if not file_path.exists():
        logger.warning(f"File not found: {file_path}")
        return 0
    
    logger.info("Loading ESG data...")
    df = pd.read_csv(file_path)
    df = clean_dataframe(df)
    
    records = df.to_dict('records')
    for record in records:
        record['_id'] = str(uuid.uuid4())
        record['created_at'] = datetime.now(timezone.utc)
    
    await db.esg_data.delete_many({})
    if records:
        await db.esg_data.insert_many(records)
        logger.info(f"Inserted {len(records)} ESG records")
    
    await db.esg_data.create_index("Symbol")
    await db.esg_data.create_index("Sector")
    await db.esg_data.create_index("Year")
    await db.esg_data.create_index("esg_risk_level")
    
    return len(records)

async def seed_co2_emissions(db):
    """Seed CO2 emissions data"""
    file_path = DATA_PATH / "CO2 emissions.xlsx"
    
    if not file_path.exists():
        logger.warning(f"File not found: {file_path}")
        return 0
    
    logger.info("Loading CO2 emissions data...")
    try:
        df = pd.read_excel(file_path)
        df = clean_dataframe(df)
        
        records = df.to_dict('records')
        for record in records:
            record['_id'] = str(uuid.uuid4())
            record['created_at'] = datetime.now(timezone.utc)
        
        await db.co2_emissions.delete_many({})
        if records:
            await db.co2_emissions.insert_many(records)
            logger.info(f"Inserted {len(records)} CO2 emissions records")
        
        return len(records)
    except Exception as e:
        logger.error(f"Error loading CO2 emissions: {e}")
        return 0

async def seed_climate_india(db):
    """Seed Climate India data"""
    file_path = DATA_PATH / "Climate India.xlsx"
    
    if not file_path.exists():
        logger.warning(f"File not found: {file_path}")
        return 0
    
    logger.info("Loading Climate India data...")
    try:
        df = pd.read_excel(file_path)
        df = clean_dataframe(df)
        
        records = df.to_dict('records')
        for record in records:
            record['_id'] = str(uuid.uuid4())
            record['created_at'] = datetime.now(timezone.utc)
        
        await db.climate_india.delete_many({})
        if records:
            await db.climate_india.insert_many(records)
            logger.info(f"Inserted {len(records)} Climate India records")
        
        return len(records)
    except Exception as e:
        logger.error(f"Error loading Climate India: {e}")
        return 0

async def seed_natural_disasters(db):
    """Seed Natural Disaster data"""
    file_path = DATA_PATH / "Natural Disaster data.xlsx"
    
    if not file_path.exists():
        logger.warning(f"File not found: {file_path}")
        return 0
    
    logger.info("Loading Natural Disaster data...")
    try:
        df = pd.read_excel(file_path)
        df = clean_dataframe(df)
        
        records = df.to_dict('records')
        for record in records:
            record['_id'] = str(uuid.uuid4())
            record['created_at'] = datetime.now(timezone.utc)
        
        await db.natural_disasters.delete_many({})
        if records:
            await db.natural_disasters.insert_many(records)
            logger.info(f"Inserted {len(records)} Natural Disaster records")
        
        return len(records)
    except Exception as e:
        logger.error(f"Error loading Natural Disasters: {e}")
        return 0

async def seed_gas_emissions(db):
    """Seed Gas Emissions State Wise data"""
    file_path = DATA_PATH / "Other Gas Emissions State Wise.xlsx"
    
    if not file_path.exists():
        logger.warning(f"File not found: {file_path}")
        return 0
    
    logger.info("Loading Gas Emissions data...")
    try:
        df = pd.read_excel(file_path)
        df = clean_dataframe(df)
        
        records = df.to_dict('records')
        for record in records:
            record['_id'] = str(uuid.uuid4())
            record['created_at'] = datetime.now(timezone.utc)
        
        await db.gas_emissions.delete_many({})
        if records:
            await db.gas_emissions.insert_many(records)
            logger.info(f"Inserted {len(records)} Gas Emissions records")
        
        return len(records)
    except Exception as e:
        logger.error(f"Error loading Gas Emissions: {e}")
        return 0

async def seed_rbi_complaints(db):
    """Seed RBI Complaints data"""
    file_path = DATA_PATH / "RBI Complaints Data.xlsx"
    
    if not file_path.exists():
        logger.warning(f"File not found: {file_path}")
        return 0
    
    logger.info("Loading RBI Complaints data...")
    try:
        df = pd.read_excel(file_path)
        df = clean_dataframe(df)
        
        records = df.to_dict('records')
        for record in records:
            record['_id'] = str(uuid.uuid4())
            record['created_at'] = datetime.now(timezone.utc)
        
        await db.rbi_complaints.delete_many({})
        if records:
            await db.rbi_complaints.insert_many(records)
            logger.info(f"Inserted {len(records)} RBI Complaints records")
        
        return len(records)
    except Exception as e:
        logger.error(f"Error loading RBI Complaints: {e}")
        return 0

async def seed_demo_users(db):
    """Seed demo user for testing"""
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    demo_user = {
        "_id": str(uuid.uuid4()),
        "id": str(uuid.uuid4()),
        "email": "admin@rbi.org.in",
        "name": "RBI Admin",
        "department": "Financial Stability Department",
        "designation": "Deputy Director",
        "role": "admin",
        "password_hash": pwd_context.hash("admin123"),
        "is_2fa_enabled": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Check if user exists
    existing = await db.users.find_one({"email": demo_user["email"]})
    if not existing:
        await db.users.insert_one(demo_user)
        logger.info(f"Created demo user: {demo_user['email']} / admin123")
    else:
        logger.info("Demo user already exists")
    
    return 1

async def seed_anomalies(db):
    """Seed sample anomalies for demo"""
    anomaly_types = [
        {"type": "npa_spike", "title": "Sudden Spike in Climate-Linked NPAs", "category": "Financial Risk", "severity": "high"},
        {"type": "emission_increase", "title": "Abnormal Emission Level Increase", "category": "Environmental", "severity": "medium"},
        {"type": "green_finance_drop", "title": "Unexpected Drop in Green Financing", "category": "Financial Risk", "severity": "medium"},
        {"type": "carbon_intensity", "title": "Rapid Carbon Intensity Rise in Sector", "category": "Environmental", "severity": "high"},
        {"type": "esg_disclosure", "title": "Irregular ESG Disclosure or Filing Missing", "category": "Compliance", "severity": "low"},
        {"type": "carbon_price_volatility", "title": "Sharp Volatility in Carbon Credit Prices", "category": "Market Risk", "severity": "medium"},
        {"type": "temperature_deviation", "title": "Temperature Deviation Beyond 10-Year Baseline", "category": "Physical Risk", "severity": "high"},
        {"type": "monsoon_anomaly", "title": "Rainfall/Monsoon Anomaly Score", "category": "Physical Risk", "severity": "medium"},
        {"type": "extreme_weather", "title": "Unusual Frequency of Extreme Weather Events", "category": "Physical Risk", "severity": "high"},
        {"type": "water_stress", "title": "Water Stress Level Breach", "category": "Physical Risk", "severity": "critical"},
        {"type": "crop_yield", "title": "Crop Yield Drop Beyond Expected Model Range", "category": "Agricultural", "severity": "high"},
        {"type": "coastal_flood", "title": "Coastal Flood Risk Surge", "category": "Physical Risk", "severity": "critical"},
        {"type": "heatwave", "title": "Industrial Cluster Heatwave Alert", "category": "Physical Risk", "severity": "high"},
        {"type": "groundwater", "title": "Groundwater Depletion Acceleration", "category": "Environmental", "severity": "medium"},
        {"type": "transition_risk", "title": "Corporate Transition Risk Spike", "category": "Transition Risk", "severity": "high"},
        {"type": "fsi_movement", "title": "Sudden Movement in Financial Stability Index", "category": "Financial Risk", "severity": "critical"},
        {"type": "loss_gdp", "title": "Unexpected Loss-to-GDP Surge Alert", "category": "Economic Impact", "severity": "high"},
        {"type": "threshold_breach", "title": "Risk Threshold Breach for High-Exposure Assets", "category": "Financial Risk", "severity": "critical"},
        {"type": "carbon_liquidity", "title": "Carbon Market Liquidity Breakdown Alert", "category": "Market Risk", "severity": "high"},
        {"type": "esg_violation", "title": "ESG Violation or Incident Surge", "category": "Compliance", "severity": "medium"}
    ]
    
    from datetime import timedelta
    import random
    
    anomalies = []
    for i, atype in enumerate(anomaly_types):
        detected_at = datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 168))
        anomalies.append({
            "_id": str(uuid.uuid4()),
            "id": str(uuid.uuid4()),
            "type": atype["type"],
            "title": atype["title"],
            "category": atype["category"],
            "severity": atype["severity"],
            "detected_at": detected_at.isoformat(),
            "score": round(random.uniform(0.6, 0.98), 2),
            "status": random.choice(["open", "investigating", "resolved"]),
            "description": f"Anomaly detected in {atype['category'].lower()} metrics. Deviation exceeds threshold by {random.randint(15, 45)}%.",
            "affected_entities": random.randint(5, 50),
            "recommended_actions": [
                "Review affected portfolios",
                "Escalate to risk committee",
                "Monitor closely for 24 hours"
            ]
        })
    
    await db.anomalies.delete_many({})
    await db.anomalies.insert_many(anomalies)
    logger.info(f"Inserted {len(anomalies)} sample anomalies")
    
    await db.anomalies.create_index("severity")
    await db.anomalies.create_index("category")
    await db.anomalies.create_index("detected_at")
    
    return len(anomalies)

async def main():
    """Main seeding function"""
    logger.info("=" * 60)
    logger.info("FSRO Database Seeding Script")
    logger.info("=" * 60)
    
    if not MONGO_URL:
        logger.error("MONGO_URL not found in environment variables")
        return
    
    logger.info(f"Connecting to MongoDB...")
    logger.info(f"Database: {DB_NAME}")
    
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(
            MONGO_URL,
            server_api=ServerApi('1'),
            serverSelectionTimeoutMS=30000,
            connectTimeoutMS=30000,
        )
        
        # Test connection
        await client.admin.command('ping')
        logger.info("✅ MongoDB connection successful!")
        
        db = client[DB_NAME]
        
        # Seed all data
        results = {}
        
        results['climate_data'] = await seed_rbi_climate_data(db)
        results['financial_sector'] = await seed_financial_sector_data(db)
        results['esg_data'] = await seed_esg_data(db)
        results['co2_emissions'] = await seed_co2_emissions(db)
        results['climate_india'] = await seed_climate_india(db)
        results['natural_disasters'] = await seed_natural_disasters(db)
        results['gas_emissions'] = await seed_gas_emissions(db)
        results['rbi_complaints'] = await seed_rbi_complaints(db)
        results['demo_users'] = await seed_demo_users(db)
        results['anomalies'] = await seed_anomalies(db)
        
        # Summary
        logger.info("=" * 60)
        logger.info("SEEDING COMPLETE - Summary:")
        logger.info("=" * 60)
        for collection, count in results.items():
            logger.info(f"  {collection}: {count} records")
        logger.info("=" * 60)
        logger.info("✅ Database seeding completed successfully!")
        logger.info("")
        logger.info("Demo Login Credentials:")
        logger.info("  Email: admin@rbi.org.in")
        logger.info("  Password: admin123")
        logger.info("=" * 60)
        
        # Close connection
        client.close()
        
    except Exception as e:
        logger.error(f"❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    asyncio.run(main())
