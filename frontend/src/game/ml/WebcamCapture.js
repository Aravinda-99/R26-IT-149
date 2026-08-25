/**
 * WebcamCapture — Shared Webcam Access
 * =====================================
 * Singleton that requests webcam access once (video only) and lets other
 * modules (ML feature detectors, etc.) pull the current frame on demand,
 * either as the live <video> element or as a snapshot drawn to a canvas.
 */

class _WebcamCapture {
  constructor() {
    this.stream = null;
    this.video = null;
    this._canvas = null;
    this._ctx = null;
    this._starting = null;
  }

  /**
   * Request webcam access and start streaming. Safe to call multiple
   * times — subsequent calls while already running/starting reuse the
   * same stream instead of requesting getUserMedia again.
   * @returns {Promise<HTMLVideoElement>} the live video element
   */
  async start() {
    if (this.video && this.stream) {
      return this.video;
    }
    if (this._starting) {
      return this._starting;
    }

    this._starting = (async () => {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      const video = document.createElement("video");
      video.srcObject = this.stream;
      video.playsInline = true;
      video.muted = true;

      await video.play();
      await new Promise((resolve) => {
        if (video.readyState >= 2) resolve();
        else video.onloadeddata = () => resolve();
      });

      this.video = video;
      return video;
    })();

    try {
      return await this._starting;
    } finally {
      this._starting = null;
    }
  }

  /**
   * @returns {boolean} whether the webcam is currently active
   */
  isActive() {
    return !!(this.stream && this.video);
  }

  /**
   * @returns {HTMLVideoElement|null} the live video element, or null if
   * start() hasn't been called (or resolved) yet
   */
  getVideoElement() {
    return this.video;
  }

  /**
   * Draws the current video frame to an internal canvas and returns the
   * pixel data — the input format ML models (ONNX/MediaPipe) expect.
   * @returns {ImageData|null}
   */
  getFrame() {
    if (!this.isActive()) return null;

    const { videoWidth, videoHeight } = this.video;
    if (!videoWidth || !videoHeight) return null;

    if (!this._canvas) {
      this._canvas = document.createElement("canvas");
      this._ctx = this._canvas.getContext("2d", { willReadFrequently: true });
    }
    if (this._canvas.width !== videoWidth || this._canvas.height !== videoHeight) {
      this._canvas.width = videoWidth;
      this._canvas.height = videoHeight;
    }

    this._ctx.drawImage(this.video, 0, 0, videoWidth, videoHeight);
    return this._ctx.getImageData(0, 0, videoWidth, videoHeight);
  }

  /**
   * Stops all tracks and releases the camera. Call this when leaving the
   * Games section so the browser's camera indicator turns off.
   */
  stop() {
    if (this.stream) {
      for (const track of this.stream.getTracks()) track.stop();
    }
    this.stream = null;
    this.video = null;
  }
}

export const WebcamCapture = new _WebcamCapture();
