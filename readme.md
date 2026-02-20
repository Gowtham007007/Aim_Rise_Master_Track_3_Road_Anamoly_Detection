# 🚧 RoadGuard AI - Anamoly Detection Using Raspberry Pi

## Intelligent Road Crack & Pothole Detection System

**Transforming road safety through edge-based AI detection and geospatial visualization.**

RoadGuard AI is a smart infrastructure monitoring system that leverages **Raspberry Pi-powered computer vision** to automatically detect potholes and road cracks. The system combines **edge AI processing**, **structured anomaly storage**, and **map-based visualization architecture** to enable proactive road maintenance and data-driven municipal decisions.

Instead of manual inspections, RoadGuard AI delivers automated, scalable, and intelligent road health monitoring.

---

# 🌍 Why RoadGuard AI?

Poor road conditions cause:

- Vehicle damage
- Increased accident risk
- Higher maintenance costs
- Delayed infrastructure response

RoadGuard AI solves this by:

✔ Automatically detecting road anomalies

✔ Logging structured damage data

✔ Enabling geospatial analytics

✔ Prioritizing repair using threshold-based logic

---

# ✨ Core Capabilities

## 🧠 1. Edge-Based AI Detection

- Runs on **Raspberry Pi**
- Uses **YOLOv5 custom-trained model**
- Supports optimized inference:
    - TensorFlow Lite (INT8)
    - ONNX
- Processes video input (`road6.mp4`) or live camera feed
- Detects:
    - Potholes
    - Surface cracks

Designed for **low-power, real-world deployment**.

---

## 💾 2. Structured Anomaly Logging

All detections are stored locally in:

`road_data.db` (SQLite)

Each record includes:

- Anomaly type
- Confidence score
- Timestamp
- Optional location metadata

This enables:

- Offline-first operation
- Lightweight edge storage
- Future synchronization to cloud database

---

## 🗺️ 3. Intelligent Dashboard Architecture (System Vision)

In the complete RoadGuard ecosystem:

Raspberry Pi → MongoDB → Express API → React + MapTiler

The dashboard:

- Fetches anomalies within the visible map viewport
- Uses MongoDB `$geoWithin` for spatial filtering
- Dynamically updates based on bounding box
- Color-codes regions using severity thresholds

---

## 🖥️ Frontend & Backend Usage Clarification

The **React (Frontend)** and **Express (Backend)** components are utilized exclusively for **map-based visualization and geospatial data integration**.

They are responsible for:

- Rendering the interactive MapTiler dashboard
- Fetching anomaly data using spatial queries
- Applying threshold-based color coding
- Dynamically updating the viewport data

All heavy AI computation and anomaly detection logic are **not handled by the web stack**, but rather by the edge device (Raspberry Pi).

This ensures clear separation between:

- 🧠 Edge Intelligence Layer (Detection)
- 🌐 Visualization Layer (Map Dashboard)

---

## 🧠 Onboard Processing with Tkinter GUI (Raspberry Pi)

The core detection system runs entirely within the **Python environment on the Raspberry Pi**.

A **Tkinter-based GUI framework** is implemented for:

- Displaying real-time detection results
- Showing bounding boxes around potholes/cracks
- Running inference locally on the Pi
- Providing a lightweight monitoring interface

All model inference and anomaly processing are performed **on-device (edge processing)**, ensuring:

- Low latency
- Reduced cloud dependency
- Offline operability
- Energy-efficient deployment

This design enables fully autonomous onboard processing without requiring continuous server connectivity.

---


# 🎥 System Demonstration

After understanding the system architecture, you can now see it in action:

📺 **Watch the full working demo here:**

https://drive.google.com/file/d/13lElNk2jI319pKpVxEmzJ7Kc1zEP1DqL/view?usp=sharing

This demo showcases:

- Real-time detection
- Bounding box predictions
- Model performance
- GUI interaction
- Edge-based execution

---

# 📊 Threshold-Based Severity Logic

When integrated with the web dashboard, regions are categorized as:

🔴 **Critical (≥ 20 anomalies)**

Immediate maintenance required.

🟡 **Warning (10 – 19 anomalies)**

Monitor and schedule repair.

🟢 **Healthy (< 10 anomalies)**

No urgent intervention required.

This threshold-based visualization enables smart repair prioritization.

---

# 🌐 Spatial Querying Mechanism

To ensure performance and scalability, the dashboard fetches only the anomalies inside the current map viewport using MongoDB’s geospatial operator:

`$geoWithin`

This provides:

- Efficient data retrieval
- Smooth zoom and pan updates
- Reduced server load
- Real-time interactive experience

---

# 🛠️ Technology Stack

## Edge Module (Current Repository)

- Python
- YOLOv5
- ONNX
- OpenCV
- SQLite
- Raspberry Pi

## Centralized Dashboard (Extended Architecture)

- React.js
- Express.js
- MongoDB (Geospatial indexing)
- MapTiler SDK

---

# ⚙️ Installation & Execution

## 1️⃣ Clone the Repository

Download or clone the project to your system or Raspberry Pi.

## 2️⃣ Create a Python Virtual Environment (Recommended)

Set up a virtual environment to isolate dependencies.

## 3️⃣ Install Dependencies

Install required packages such as:

- torch
- torchvision
- opencv-python
- numpy

Or use the provided requirements file if available.

## 4️⃣ Run the Application

GUI Version:

- Run `[ython app_gui.py`

---

# 🏗️ Complete System Architecture

Raspberry Pi (YOLO Detection)

↓

SQLite Local Storage

↓ (Sync Layer)

MongoDB (Cloud Geospatial Database)

↓

Express API

↓

React Dashboard + MapTiler Visualization

This modular design ensures:

- Scalability
- Maintainability
- Performance efficiency
- Real-world deployability

---

# 📂 Repository Structure Overview

- app.py
- app_gui.py
- app_gui_int8.py
- best-int8.tflite
- best.onnx
- road_data.db
- road6.mp4

This repository represents the **Edge Intelligence Layer** of the full RoadGuard ecosystem.

---

# 🚀 Future Enhancements

- Automatic SQLite → MongoDB synchronization
- Real-time anomaly streaming
- Predictive road degradation analytics
- GPS-based geo-tagging
- Municipal command center dashboard

---

# 🎯 Vision

RoadGuard AI aims to create a **scalable, intelligent, and automated road monitoring system** that replaces reactive maintenance with proactive, data-driven infrastructure management.

By combining:

Edge AI

Geospatial Intelligence

Interactive Web Visualization

RoadGuard AI lays the foundation for smarter, safer cities.
