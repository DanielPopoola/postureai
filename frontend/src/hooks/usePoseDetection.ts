import { useRef, useState, useCallback, useEffect } from "react";
import { PoseLandmarker, FilesetResolver, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { analyzePosture, PostureMetrics } from "@/lib/postureAnalysis";

interface UsePoseDetectionOptions {
  onMetricsUpdate?: (metrics: PostureMetrics) => void;
}

export function usePoseDetection({ onMetricsUpdate }: UsePoseDetectionOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const [metrics, setMetrics] = useState<PostureMetrics | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const lastTimestampRef = useRef<number>(-1);

  const initModel = useCallback(async () => {
    if (poseLandmarkerRef.current) return;
    setIsLoading(true);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });
    } catch (err) {
      console.error("Failed to load pose model:", err);
      setError("Failed to load AI model. Please refresh and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const detectFrame = useCallback(() => {
    const video = videoRef.current;
    const poseLandmarker = poseLandmarkerRef.current;

    if (!video || !poseLandmarker || video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const timestamp = performance.now();
    if (timestamp === lastTimestampRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }
    lastTimestampRef.current = timestamp;

    try {
      const result = poseLandmarker.detectForVideo(video, timestamp);
      if (result.landmarks && result.landmarks.length > 0) {
        const lm = result.landmarks[0];
        setLandmarks(lm);
        const postureMetrics = analyzePosture(lm);
        setMetrics(postureMetrics);
        onMetricsUpdate?.(postureMetrics);
      }
    } catch (err) {
      // Detection errors are non-fatal, just skip frame
    }

    animationFrameRef.current = requestAnimationFrame(detectFrame);
  }, [onMetricsUpdate]);

  const start = useCallback(async () => {
    setError(null);
    try {
      await initModel();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsRunning(true);
      lastTimestampRef.current = -1;
      animationFrameRef.current = requestAnimationFrame(detectFrame);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera access in your browser settings.");
      } else {
        setError("Failed to start camera. Please check your device.");
      }
    }
  }, [initModel, detectFrame]);

  const stop = useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRunning(false);
    setLandmarks(null);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      poseLandmarkerRef.current?.close();
    };
  }, []);

  return { videoRef, canvasRef, landmarks, metrics, isLoading, isRunning, error, start, stop };
}
