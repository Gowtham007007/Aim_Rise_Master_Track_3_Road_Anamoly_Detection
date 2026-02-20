const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Added the database name 'road_anomalies' to the URI
const MONGO_URI = 'mongodb+srv://gowthammece2023_db_user:Gowtham007@cluster0.gpyep5s.mongodb.net/?appName=Cluster0';
app.use(cors());
app.use(express.json());

const anomalySchema = new mongoose.Schema({
  type: { type: String, default: 'Feature' },
  geometry: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  properties: {
    road_name: { type: String, required: true },
    count: { type: Number, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'] },
  },
});

anomalySchema.index({ geometry: '2dsphere' });
const Anomaly = mongoose.model('Anomaly', anomalySchema);

app.get('/api/anomalies', async (req, res) => {
  try {
    const { minLng, minLat, maxLng, maxLat } = req.query;
    if (!minLng || !minLat || !maxLng || !maxLat) {
      return res.status(400).json({ error: 'Missing bounding box parameters' });
    }
    const anomalies = await Anomaly.find({
      geometry: {
        $geoWithin: {
          $box: [
            [parseFloat(minLng), parseFloat(minLat)],
            [parseFloat(maxLng), parseFloat(maxLat)],
          ],
        },
      },
    });
    res.json(anomalies);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });