import { NormalizedLandmark } from "@mediapipe/tasks-vision";

// MediaPipe Pose Landmark indices
export const LANDMARK = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
} as const;

export interface PostureMetrics {
  neckAngle: number;
  shoulderAlignment: number;
  spineAngle: number;
  overallScore: number;
  status: "good" | "fair" | "poor";
  issues: string[];
}

/** Calculate angle between three points in degrees */
export function calculateAngle(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark
): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/** Calculate vertical angle of a line segment relative to vertical axis */
function verticalAngle(top: NormalizedLandmark, bottom: NormalizedLandmark): number {
  const dx = top.x - bottom.x;
  const dy = top.y - bottom.y;
  return Math.abs(Math.atan2(dx, -dy) * (180 / Math.PI));
}

/** Midpoint of two landmarks */
function midpoint(a: NormalizedLandmark, b: NormalizedLandmark): NormalizedLandmark {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2, visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1) };
}

export function analyzePosture(landmarks: NormalizedLandmark[]): PostureMetrics {
  const issues: string[] = [];

  const nose = landmarks[LANDMARK.NOSE];
  const leftShoulder = landmarks[LANDMARK.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARK.RIGHT_SHOULDER];
  const leftEar = landmarks[LANDMARK.LEFT_EAR];
  const rightEar = landmarks[LANDMARK.RIGHT_EAR];
  const leftHip = landmarks[LANDMARK.LEFT_HIP];
  const rightHip = landmarks[LANDMARK.RIGHT_HIP];

  const shoulderMid = midpoint(leftShoulder, rightShoulder);
  const hipMid = midpoint(leftHip, rightHip);
  const earMid = midpoint(leftEar, rightEar);

  // 1. Neck angle: angle between ear-midpoint, shoulder-midpoint, and hip-midpoint
  // Ideally ears should be above shoulders (close to 180°)
  const neckAngle = calculateAngle(earMid, shoulderMid, hipMid);

  // 2. Shoulder alignment: difference in Y between left and right shoulder
  // Lower is better (shoulders should be level)
  const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
  const shoulderAlignment = Math.max(0, 100 - shoulderDiff * 500);

  // 3. Spine angle: how vertical the torso is (shoulder-mid to hip-mid)
  const spineAngle = verticalAngle(shoulderMid, hipMid);

  // Score calculations
  let neckScore = 100;
  if (neckAngle < 150) {
    neckScore = Math.max(0, (neckAngle / 150) * 100);
    issues.push("Neck tilted forward — adjust screen height");
  }

  let spineScore = 100;
  if (spineAngle > 15) {
    spineScore = Math.max(0, 100 - (spineAngle - 15) * 5);
    issues.push("Spine leaning — sit upright");
  }

  if (shoulderAlignment < 80) {
    issues.push("Shoulders uneven — try to level them");
  }

  // Forward head posture check: nose significantly ahead of shoulders
  const headForward = nose.x - shoulderMid.x;
  let headScore = 100;
  if (Math.abs(headForward) > 0.08) {
    headScore = Math.max(0, 100 - Math.abs(headForward) * 400);
    if (!issues.some(i => i.includes("Neck"))) {
      issues.push("Head too far forward — pull chin back");
    }
  }

  const overallScore = Math.round(
    neckScore * 0.3 + spineScore * 0.3 + shoulderAlignment * 0.25 + headScore * 0.15
  );

  let status: PostureMetrics["status"] = "good";
  if (overallScore < 60) status = "poor";
  else if (overallScore < 80) status = "fair";

  return {
    neckAngle: Math.round(neckAngle),
    shoulderAlignment: Math.round(shoulderAlignment),
    spineAngle: Math.round(spineAngle),
    overallScore,
    status,
    issues,
  };
}

/** Connections for drawing skeleton */
export const POSE_CONNECTIONS: [number, number][] = [
  [LANDMARK.LEFT_EAR, LANDMARK.LEFT_SHOULDER],
  [LANDMARK.RIGHT_EAR, LANDMARK.RIGHT_SHOULDER],
  [LANDMARK.LEFT_SHOULDER, LANDMARK.RIGHT_SHOULDER],
  [LANDMARK.LEFT_SHOULDER, LANDMARK.LEFT_ELBOW],
  [LANDMARK.RIGHT_SHOULDER, LANDMARK.RIGHT_ELBOW],
  [LANDMARK.LEFT_ELBOW, LANDMARK.LEFT_WRIST],
  [LANDMARK.RIGHT_ELBOW, LANDMARK.RIGHT_WRIST],
  [LANDMARK.LEFT_SHOULDER, LANDMARK.LEFT_HIP],
  [LANDMARK.RIGHT_SHOULDER, LANDMARK.RIGHT_HIP],
  [LANDMARK.LEFT_HIP, LANDMARK.RIGHT_HIP],
];
