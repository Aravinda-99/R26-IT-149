/**
 * EmotionDetector — Facial Emotion Inference
 * ============================================
 * Loads the emotion_cnn ONNX model and classifies the current webcam frame
 * (from WebcamCapture.js) into one of four emotion labels.
 *
 * Model contract (verified against public/models/emotion_cnn.onnx):
 *   input  "input"  float32 [batch, 1, 48, 48]  (NCHW, grayscale, normalized)
 *   output "output" float32 [batch, 4]           (raw logits, not softmax)
 */

import * as ort from "onnxruntime-web";
import { WebcamCapture } from "./WebcamCapture.js";

const MODEL_URL = "/models/emotion_cnn.onnx";
const INPUT_SIZE = 48;
const LABELS = ["fear", "frustrated", "neutral", "sad"];

// Threaded wasm needs SharedArrayBuffer + cross-origin isolation headers,
// which the dev server doesn't set. Force single-threaded so this runs
// without any extra server config.
ort.env.wasm.numThreads = 1;

// onnxruntime-web's internal bundle dynamically import()s its backend
// variants (e.g. the .jsep.mjs WebGPU backend) at runtime. Vite's dev
// server refuses to serve files under public/ via dynamic import() (only
// via fetch/static <script>/<link> tags), which 500s no matter which
// local path wasmPaths points at. Pointing at the CDN instead routes
// those requests straight to jsdelivr, bypassing Vite's dev server (and
// its public/ import() restriction) entirely. Version pinned to match
// the exact installed onnxruntime-web release (see package-lock.json).
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/";

class _EmotionDetector {
  constructor() {
    this.session = null;
    this._loading = null;
    this._cropCanvas = null;
    this._cropCtx = null;
    this._resizeCanvas = null;
    this._resizeCtx = null;
    this.currentEmotion = null;
  }

  /**
   * Loads the ONNX model. Safe to call multiple times — reuses the same
   * session/in-flight load instead of re-fetching.
   * @returns {Promise<ort.InferenceSession>}
   */
  async load() {
    if (this.session) return this.session;
    if (this._loading) return this._loading;

    this._loading = ort.InferenceSession.create(MODEL_URL, {
      executionProviders: ["wasm"],
    });

    try {
      this.session = await this._loading;
      return this.session;
    } finally {
      this._loading = null;
    }
  }

  /**
   * Center-crops the frame to a square, resizes to 48x48, converts to
   * grayscale, and normalizes into the NCHW Float32Array the model expects.
   * @param {ImageData} frame
   * @returns {Float32Array} length 1*1*48*48
   */
  _preprocess(frame) {
    const { width, height, data } = frame;

    // 1. Put the raw frame on a canvas so we can crop/resize via drawImage.
    if (!this._cropCanvas) {
      this._cropCanvas = document.createElement("canvas");
      this._cropCtx = this._cropCanvas.getContext("2d");
    }
    if (this._cropCanvas.width !== width || this._cropCanvas.height !== height) {
      this._cropCanvas.width = width;
      this._cropCanvas.height = height;
    }
    this._cropCtx.putImageData(frame, 0, 0);

    // 2. Center-crop to a square (avoids stretching a wide webcam frame),
    //    then resize that square down to 48x48 in the same drawImage call.
    const cropSize = Math.min(width, height);
    const sx = (width - cropSize) / 2;
    const sy = (height - cropSize) / 2;

    if (!this._resizeCanvas) {
      this._resizeCanvas = document.createElement("canvas");
      this._resizeCanvas.width = INPUT_SIZE;
      this._resizeCanvas.height = INPUT_SIZE;
      this._resizeCtx = this._resizeCanvas.getContext("2d", { willReadFrequently: true });
    }
    this._resizeCtx.drawImage(
      this._cropCanvas,
      sx, sy, cropSize, cropSize,
      0, 0, INPUT_SIZE, INPUT_SIZE
    );

    const rgba = this._resizeCtx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE).data;

    // 3+4. Grayscale (ITU-R 601-2 luma weights) + normalize + NCHW layout.
    // Single channel means NCHW is just the flat H*W array — no reordering needed.
    const tensorData = new Float32Array(INPUT_SIZE * INPUT_SIZE);
    for (let i = 0, p = 0; i < rgba.length; i += 4, p++) {
      const gray = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
      tensorData[p] = (gray / 255 - 0.5) / 0.5;
    }

    return tensorData;
  }

  /**
   * Grabs the current webcam frame, runs inference, and returns the
   * predicted emotion label. Also caches it for getEmotion().
   * @returns {Promise<string|null>} one of LABELS, or null if no frame yet
   */
  async detect() {
    const frame = WebcamCapture.getFrame();
    if (!frame) return null;

    const session = await this.load();
    const tensorData = this._preprocess(frame);
    const inputTensor = new ort.Tensor("float32", tensorData, [1, 1, INPUT_SIZE, INPUT_SIZE]);

    const results = await session.run({ input: inputTensor });
    const logits = results.output.data;

    let bestIdx = 0;
    for (let i = 1; i < logits.length; i++) {
      if (logits[i] > logits[bestIdx]) bestIdx = i;
    }

    this.currentEmotion = LABELS[bestIdx];
    return this.currentEmotion;
  }

  /**
   * @returns {string|null} the most recently detected emotion label, or
   * null if detect() hasn't successfully run yet
   */
  getEmotion() {
    return this.currentEmotion;
  }
}

export const EmotionDetector = new _EmotionDetector();
