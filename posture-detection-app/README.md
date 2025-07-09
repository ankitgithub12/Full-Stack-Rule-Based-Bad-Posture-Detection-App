# PostureGuard - AI-Powered Posture Detection



A real-time web application that analyzes your posture during squats and desk work using computer vision and rule-based detection.

## ✨ Features

- **Two Detection Modes**:
  - 🏋️ Squat Analysis (knee position, back angle)
  - 🪑 Sitting Analysis (neck bend, back alignment)
- **Real-Time Feedback**: Instant visual and textual corrections
- **Auto Mode**: Continuous analysis without button presses
- **Responsive Design**: Works on desktop and mobile
- **Privacy-First**: All processing happens locally (no cloud video uploads)

## 🧰 Tech Stack

### Frontend
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 18.2 |
| Language | TypeScript | 5.2 |
| Bundler | Vite | 5.0 |
| Camera | react-webcam | 7.0 |
| HTTP Client | Axios | 1.6 |
| Styling | CSS-in-JS | - |

### Backend
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | FastAPI | 0.109 |
| Pose Detection | MediaPipe | 0.10 |
| Computer Vision | OpenCV | 4.9 |
| Server | Uvicorn | 0.27 |

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Python 3.9+
- Git

