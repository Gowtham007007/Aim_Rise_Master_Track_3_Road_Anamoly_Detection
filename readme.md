🚧 RoadGuard AI – Edge-Based Road Anomaly Detection System
An AI-powered Raspberry Pi system for detecting road cracks and potholes to improve road safety through automated monitoring.

This repository contains the Edge Detection Module of the RoadGuard AI system, built using YOLOv5 and optimized for Raspberry Pi deployment.

🛠️ Tech Stack
🧠 Edge AI (This Repository)
🐍 Python
🧠 YOLOv5 (Custom-trained)
📦 TensorFlow Lite (INT8 optimized model)
🧮 ONNX model
💾 SQLite (road_data.db)
🍓 Raspberry Pi
🌐 Central Dashboard (Planned / Integrated System)
⚛️ React.js (Frontend)
🚀 Express.js (Backend API)
🍃 MongoDB (Geospatial Database)
🗺️ MapTiler SDK (Map Visualization)
✨ Key Features
🎯 1. Real-Time Road Anomaly Detection
Detects potholes and cracks from video feed (road6.mp4 or camera input)
Uses optimized:
best-int8.tflite (Edge deployment)
best.onnx
Designed for low-power Raspberry Pi inference
💾 2. Local Database Logging
Detections are stored in:

road_data.db (SQLite)
Each entry typically includes:

Detection type
Confidence score
Timestamp
(Optional) Location data
This allows offline-first deployment in remote areas.

🌍 3. Centralized System Integration (Architecture Vision)
In the complete RoadGuard AI system:

Raspberry Pi detects anomalies.
Data is pushed to MongoDB.
Express API performs spatial queries.
React + MapTiler visualizes anomalies.
📊 Threshold-Based Visualization Logic (Dashboard Layer)
When integrated with the central system, regions are color-coded:

Status	Anomaly Count	Color	Action
Critical	≥ 20	🔴 Red	Immediate repair
Warning	10 – 19	🟡 Yellow	Schedule maintenance
Healthy	< 10	🟢 Green	No urgent action
🌍 Spatial Querying (MongoDB – Dashboard Layer)
The central server fetches only anomalies inside the visible map viewport:

{
  location: {
    $geoWithin: {
      $geometry: {
        type: "Polygon",
        coordinates: [...]
      }
    }
  }
}
✔️ Efficient

✔️ Scalable

✔️ Real-time viewport updates

⚙️ Installation Guide (Edge Module – This Repository)
1️⃣ Clone the Repository
git clone https://github.com/your-username/roadguard-ai.git
cd roadguard-ai
2️⃣ Install Dependencies
Create virtual environment (recommended):

python -m venv venv
source venv/bin/activate  # Linux / Pi
Install requirements (if using YOLOv5 standard setup):

pip install -r requirements.txt
If not available, install manually:

pip install torch torchvision opencv-python numpy sqlite3
3️⃣ Run Detection
GUI Version
python app_gui.py
INT8 Optimized Version (Raspberry Pi)
python app_gui_int8.py
CLI Version
python app.py
🏗️ System Architecture (Complete Vision)
[ Raspberry Pi ]
      ↓
[ YOLOv5 Detection ]
      ↓
[ SQLite (Local) ]
      ↓ (Sync)
[ MongoDB (Cloud) ]
      ↓
[ Express API ]
      ↓
[ React Dashboard + MapTiler ]
📂 Project Structure
pothole_project/
│
├── app.py
├── app_gui.py
├── app_gui_int8.py
├── best-int8.tflite
├── best.onnx
├── road_data.db
├── road6.mp4
├── models/
├── utils/
🚀 Future Scope
🔄 Auto-sync SQLite → MongoDB
📡 Real-time anomaly streaming
📲 SMS alerts to municipal authorities
🧠 Predictive road degradation analytics
☁️ Cloud deployment with scalable APIs
📍 GPS tagging from Raspberry Pi module
🎯 Project Goal
To build a scalable, intelligent, edge-powered road monitoring system that:

Detects potholes automatically
Logs structured anomaly data
Integrates with smart dashboards
Enables data-driven road maintenance
