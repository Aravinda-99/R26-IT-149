/**
 * FatigueDetector — Eye-Aspect-Ratio Fatigue Signal
 * ====================================================
 * Uses MediaPipe's FaceLandmarker to get 478 face landmarks from the shared
 * webcam feed (WebcamCapture.js) and computes the Eye Aspect Ratio (EAR) —
 * a low EAR means closed/near-closed eyes, a proxy for blinking/fatigue.
 *
 * Reuses WebcamCapture's existing camera stream (getVideoElement()) rather
 * than requesting getUserMedia again.
 */
import { WebcamCapture } from "./WebcamCapture.js";

let FaceLandmarker = null;
let FilesetResolver = null;

const MODEL_URL = "/models/face_landmarker.task";

// MediaPipe's wasm fileset loader dynamically loads its own JS/wasm glue
// code at runtime, the same category of thing that broke onnxruntime-web
// under Vite's dev server (files under public/ can only be served as
// static assets, not dynamically loaded as modules by a library). Loading
// the fileset from MediaPipe's official CDN sidesteps Vite's dev server
// for that resolution entirely -- this is also what MediaPipe's own docs
// recommend by default, not just a workaround. Version pinned to match
// the exact installed @mediapipe/tasks-vision release (see package-lock.json).
const WASM_FILESET_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";

// The .task model file itself is a plain binary fetch (not a dynamic JS
// import), so -- like emotion_cnn.onnx -- it's safe to serve locally from
// public/models/.

const RIGHT_EYE = [33, 160, 158, 133, 153, 144];
const LEFT_EYE = [362, 385, 387, 263, 373, 380];

class _FatigueDetector {
  constructor() {
    this.landmarker = null;
    this._loading = null;
    this.currentEAR = null;
  }

  /**
   * Loads the FaceLandmarker task. Safe to call multiple times — reuses
   * the same instance/in-flight load instead of re-initializing.
   * @returns {Promise<FaceLandmarker|null>}
   */
  async load() {
    if (this.landmarker) return this.landmarker;
    if (this._loading) return this._loading;

    this._loading = (async () => {
      try {
        if (!FaceLandmarker || !FilesetResolver) {
          const mp = await import("@mediapipe/tasks-vision");
          FaceLandmarker = mp.FaceLandmarker;
          FilesetResolver = mp.FilesetResolver;
        }
        const fileset = await FilesetResolver.forVisionTasks(WASM_FILESET_URL);
        return await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
        });
      } catch (err) {
        console.warn("[WARN] FatigueDetector (@mediapipe/tasks-vision) unavailable:", err.message);
        return null;
      }
    })();

    try {
      this.landmarker = await this._loading;
      return this.landmarker;
    } finally {
      this._loading = null;
    }
  }

  /** Euclidean distance between two normalized landmarks, in pixel space. */
  _distance(a, b, width, height) {
    const dx = (a.x - b.x) * width;
    const dy = (a.y - b.y) * height;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * EAR = (||p1-p5|| + ||p2-p4||) / (2 * ||p0-p3||), using the 6-point eye
   * index convention passed in via `indices`.
   */
  _eyeAspectRatio(landmarks, indices, width, height) {
    const p = indices.map((i) => landmarks[i]);
    const vertical1 = this._distance(p[1], p[5], width, height);
    const vertical2 = this._distance(p[2], p[4], width, height);
    const horizontal = this._distance(p[0], p[3], width, height);
    if (horizontal === 0) return null;
    return (vertical1 + vertical2) / (2 * horizontal);
  }

  /**
   * Runs face landmark detection on the current webcam frame and updates
   * the cached EAR value.
   * @returns {Promise<number|null>} the average EAR, or null if no face
   * was detected in this frame
   */
  async detect() {
    const video = WebcamCapture.getVideoElement();
    if (!video || !video.videoWidth) {
      this.currentEAR = null;
      return null;
    }

    const landmarker = await this.load();
    if (!landmarker) {
      this.currentEAR = null;
      return null;
    }
    const result = landmarker.detectForVideo(video, performance.now());
    const faceLandmarks = result.faceLandmarks && result.faceLandmarks[0];

    if (!faceLandmarks) {
      this.currentEAR = null;
      return null;
    }

    const { videoWidth: width, videoHeight: height } = video;
    const rightEAR = this._eyeAspectRatio(faceLandmarks, RIGHT_EYE, width, height);
    const leftEAR = this._eyeAspectRatio(faceLandmarks, LEFT_EYE, width, height);

    if (rightEAR == null || leftEAR == null) {
      this.currentEAR = null;
      return null;
    }

    this.currentEAR = (rightEAR + leftEAR) / 2;
    return this.currentEAR;
  }

  /**
   * @returns {number|null} the most recently computed average EAR, or
   * null if no face was detected in the last detect() call
   */
  getAverageEAR() {
    return this.currentEAR;
  }
}

export const FatigueDetector = new _FatigueDetector();
