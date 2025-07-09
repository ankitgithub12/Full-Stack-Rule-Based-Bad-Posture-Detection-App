import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

function App() {
  const webcamRef = useRef<Webcam>(null);
  const [mode, setMode] = useState<'squat'|'sitting'>('squat');
  const [feedback, setFeedback] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isRealTime, setIsRealTime] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  // Color palette
  const theme = {
    primary: '#6366F1',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    dark: '#111827',
    light: '#F9FAFB',
    border: '#E5E7EB'
  };

  // Analyze posture
  const analyzePosture = async () => {
    if (!webcamRef.current || !cameraReady || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) throw new Error('Failed to capture image');

      // Convert to blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();

      // Prepare form data
      const formData = new FormData();
      formData.append('file', blob, 'posture-frame.jpg');

      // API call
      const { data } = await axios.post('http://localhost:8000/analyze', formData, {
        params: { mode },
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFeedback(data.feedback || []);
      setLastAnalysis(new Date());
    } catch (error) {
      console.error('Analysis error:', error);
      setFeedback(['Failed to analyze posture']);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Real-time analysis effect
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      analyzePosture();
    }, 2000); // Analyze every 2 seconds

    return () => clearInterval(interval);
  }, [isRealTime, mode, cameraReady]);

  return (
    <div className="app-container" style={{
      minHeight: '100vh',
      backgroundColor: theme.light,
      padding: '1rem',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="main-card" style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: theme.primary,
          color: 'white',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}>
            <span role="img" aria-label="posture">🧘</span> PostureGuard
          </h1>
          <p style={{ 
            margin: '0.25rem 0 0',
            opacity: 0.9,
            fontSize: '0.875rem'
          }}>
            AI-powered posture correction
          </p>
        </div>

        {/* Main Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Mode Selector */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={() => setMode('squat')}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: mode === 'squat' ? theme.primary : theme.light,
                color: mode === 'squat' ? 'white' : theme.dark,
                border: `1px solid ${mode === 'squat' ? theme.primary : theme.border}`,
                borderRadius: '8px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Squat Mode
            </button>
            <button
              onClick={() => setMode('sitting')}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: mode === 'sitting' ? theme.primary : theme.light,
                color: mode === 'sitting' ? 'white' : theme.dark,
                border: `1px solid ${mode === 'sitting' ? theme.primary : theme.border}`,
                borderRadius: '8px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sitting Mode
            </button>
          </div>

          {/* Webcam Feed */}
          <div style={{
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            aspectRatio: '4/3',
            backgroundColor: '#000'
          }}>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'user' }}
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onUserMedia={() => setCameraReady(true)}
              onUserMediaError={() => setCameraReady(false)}
            />

            {!cameraReady && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                flexDirection: 'column',
                gap: '0.5rem',
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 500 }}>
                  {navigator.mediaDevices ? 
                    'Camera Permission Required' : 
                    'Camera Not Supported'}
                </div>
                <small style={{ opacity: 0.8 }}>
                  {navigator.mediaDevices ? 
                    'Please allow camera access in your browser settings' : 
                    'Try opening in a different browser'}
                </small>
              </div>
            )}

            {isAnalyzing && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)'
              }}>
                <div style={{
                  padding: '0.75rem 1.25rem',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: '8px',
                  fontWeight: 500,
                  color: theme.dark
                }}>
                  Analyzing Posture...
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={analyzePosture}
              disabled={!cameraReady || isAnalyzing}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: theme.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 500,
                cursor: 'pointer',
                opacity: (!cameraReady || isAnalyzing) ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              Analyze Now
            </button>
            <button
              onClick={() => setIsRealTime(!isRealTime)}
              disabled={!cameraReady}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: isRealTime ? theme.warning : theme.light,
                color: isRealTime ? 'white' : theme.dark,
                border: `1px solid ${isRealTime ? theme.warning : theme.border}`,
                borderRadius: '8px',
                fontWeight: 500,
                cursor: 'pointer',
                opacity: !cameraReady ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {isRealTime ? 'Stop Auto' : 'Auto Mode'}
            </button>
          </div>

          {/* Results Panel */}
          <div style={{
            backgroundColor: feedback.length ? '#FEF2F2' : '#ECFDF5',
            borderRadius: '8px',
            padding: '1.25rem',
            border: `1px solid ${feedback.length ? theme.danger : theme.success}`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}>
              <h3 style={{
                margin: 0,
                color: feedback.length ? theme.danger : theme.success,
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>{
                  feedback.length ? 
                  'Posture Issues Found' : 
                  'Good Posture!'
                }</span>
              </h3>
              {lastAnalysis && (
                <span style={{
                  fontSize: '0.75rem',
                  color: theme.dark,
                  opacity: 0.7
                }}>
                  Last analyzed: {lastAnalysis.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {feedback.length > 0 ? (
              <ul style={{
                margin: 0,
                paddingLeft: '1.25rem',
                color: theme.danger,
                fontSize: '0.875rem',
                lineHeight: '1.5'
              }}>
                {feedback.map((msg, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem' }}>{msg}</li>
                ))}
              </ul>
            ) : (
              <p style={{
                margin: 0,
                color: theme.success,
                fontSize: '0.875rem'
              }}>
                No posture issues detected. Keep up the good work!
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: theme.light,
          padding: '1rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: theme.dark,
          borderTop: `1px solid ${theme.border}`
        }}>
          <p style={{ margin: 0 }}>
            PostureGuard v1.0 • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;