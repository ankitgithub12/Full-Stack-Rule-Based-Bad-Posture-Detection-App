from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import mediapipe as mp
import math

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

def calculate_angle(a, b, c):
    a = np.array([a.x, a.y])
    b = np.array([b.x, b.y])
    c = np.array([c.x, c.y])
    
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    return angle if angle <= 180 else 360 - angle

@app.post("/analyze")
async def analyze_posture(file: UploadFile = File(...), mode: str = "squat"):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        results = pose.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        if not results.pose_landmarks:
            return {"feedback": ["No person detected"]}
        
        feedback = []
        if mode == "squat":
            # Squat analysis logic
            if results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE].x > results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE].x:
                feedback.append("Knees over toes detected!")
        else:
            # Sitting analysis logic
            neck_angle = calculate_angle(
                results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_EAR],
                results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER],
                results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
            )
            if neck_angle < 150:
                feedback.append(f"Neck bent forward ({int(neck_angle)}°)")
        
        return {"feedback": feedback}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def health_check():
    return {"status": "API is running"}