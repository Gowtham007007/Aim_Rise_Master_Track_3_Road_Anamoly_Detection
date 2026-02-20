// seed.js — Run this once to populate MongoDB with sample data
// Usage: node seed.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Hardcoded URI with your password (encoded '@' to '%40')
const MONGO_URI = 'mongodb+srv://gowthammece2023_db_user:Gowtham007@cluster0.gpyep5s.mongodb.net/?appName=Cluster0';
// ─── MONGOOSE SCHEMA ───────────────────────────────────────────────
const anomalySchema = new mongoose.Schema({
  type: { type: String, default: 'Feature' },
  geometry: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true }, // [Longitude, Latitude]
  },
  properties: {
    road_name: { type: String, required: true },
    count: { type: Number, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'] },
  },
});

// Enable geospatial queries
anomalySchema.index({ geometry: '2dsphere' });

const Anomaly = mongoose.model('Anomaly', anomalySchema);

// ─── SEED FUNCTION ─────────────────────────────────────────────────
async function seed() {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Optional: Clear existing data before seeding to avoid duplicates
    await Anomaly.deleteMany({});
    console.log('🗑  Cleared existing anomalies from collection');

    // Load your local JSON file
    const filePath = path.join(__dirname, 'anomalies.json');
    
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Error: Could not find 'anomalies.json' in ${__dirname}`);
        process.exit(1);
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    // Insert data into MongoDB
    const inserted = await Anomaly.insertMany(data);
    console.log(`🚀 Successfully seeded ${inserted.length} anomalies!`);

  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seed();
