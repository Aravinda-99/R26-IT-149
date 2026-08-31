/**
 * API Client
 * Centralized fetch wrapper for all backend API calls.
 * Vite proxy sends /api/* requests to Flask at localhost:5000.
 */

const API_BASE = "/api";
const DEV_FALLBACK_BASE = "http://localhost:5000/api";

function shouldTryDevFallback(response, endpoint) {
    // If the Vite proxy isn't active/misconfigured, requests to /api/* may 404 on :3000.
    // In dev, retry directly against the Flask server.
    try {
        const isDev = typeof import.meta !== "undefined" && import.meta.env?.DEV;
        if (!isDev) return false;
        if (!response || response.status !== 404) return false;
        if (!endpoint?.startsWith("/")) return false;
        return true;
    } catch {
        return false;
    }
}

async function apiRequest(endpoint, method = "GET", body = null) {
    const options = {
        method,
        headers: { "Content-Type": "application/json" },
    };
    if (body) options.body = JSON.stringify(body);

    let response = await fetch(`${API_BASE}${endpoint}`, options);
    if (shouldTryDevFallback(response, endpoint)) {
        response = await fetch(`${DEV_FALLBACK_BASE}${endpoint}`, options);
    }

    const text = await response.text();
    let data = {};
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = {
                error:
                    response.status === 404
                        ? `Not found (${endpoint}) — is the API running and is the URL correct?`
                        : `API error ${response.status}`,
            };
        }
    }
    if (!response.ok) throw new Error(data.error || `API error ${response.status}`);
    return data;
}

// --- Component 1: Adaptive Learning ---
export const AdaptiveAPI = {
    getNextActivity: (userId) => apiRequest(`/adaptive/next-activity/${userId}`),
    updateProgress: (data) => apiRequest("/adaptive/update-progress", "POST", data),
    getLearningPath: (userId) => apiRequest(`/adaptive/learning-path/${userId}`),
};

// --- Component 2: Error Detector ---
export const ErrorAPI = {
    analyze: (data) => apiRequest("/errors/analyze", "POST", data),
    getLatest: (userId) => apiRequest(`/errors/latest/${userId}`),
    getHistory: (userId) => apiRequest(`/errors/history/${userId}`),
    getSummary: (userId) => apiRequest(`/errors/summary/${userId}`),
    // Feature 1 — Error Progression Analytics
    getAnalytics: (userId) => apiRequest(`/errors/analytics/${userId}`),
    // Feature 3 — Personalized Learning Report
    getLearningReport: (userId) => apiRequest(`/errors/learning-report/${userId}`),
};

// --- Component 3: Gamification ---
export const GamificationAPI = {
    getGames: () => apiRequest("/gamification/games"),
    submitScore: (data) => apiRequest("/gamification/submit-score", "POST", data),
    getLeaderboard: () => apiRequest("/gamification/leaderboard"),
    getProfile: (userId) => apiRequest(`/gamification/profile/${userId}`),
};

// --- Game State Persistence (backend-mediated; replaces direct Firestore client writes) ---
export const GameStateAPI = {
    saveState: (data) => apiRequest("/gamification/state", "POST", data),
    loadState: (userId) => apiRequest(`/gamification/state/${userId}`, "GET"),
    deleteState: (userId) => apiRequest(`/gamification/state/${userId}`, "DELETE"),
};

// --- Component 4: Mastery Tracker & Schema Mastery ---
export const MasteryAPI = {
    getStatus: (userId) => apiRequest(`/mastery/status/${userId}`),
    getStudents: () => apiRequest("/mastery/students"),
    update: (data) => apiRequest("/mastery/update", "POST", data),
    getQuestions: (concept) => apiRequest(`/mastery/questions/${concept}`),
    submitDiagnostic: (data) => apiRequest("/mastery/diagnostic", "POST", data),
    getHistory: (userId, schema) => apiRequest(`/mastery/history/${userId}/${schema}`),
    predictSchemaMastery: (data) => apiRequest("/schema-mastery/predict", "POST", data),
};

export const SchemaMasteryAPI = {
    getLLMStatus: () => apiRequest("/schema-mastery/llm/status"),
    getQuestionStats: () => apiRequest("/schema-mastery/questions/stats"),
    predict: (data) => apiRequest("/schema-mastery/predict", "POST", data),
    generateQuestions: (data) => apiRequest("/schema-mastery/questions/generate", "POST", data),
    getPendingQuestions: (concept = "") => apiRequest(`/schema-mastery/questions/pending${concept ? `?concept=${encodeURIComponent(concept)}` : ""}`),
    getQuestionBank: (concept = "", activeOnly = false) => apiRequest(`/schema-mastery/question-bank?active_only=${activeOnly}${concept ? `&concept=${encodeURIComponent(concept)}` : ""}`),
    getRejectedQuestions: (concept = "") => apiRequest(`/schema-mastery/questions/rejected${concept ? `?concept=${encodeURIComponent(concept)}` : ""}`),
    updateQuestion: (questionId, data) => apiRequest(`/schema-mastery/questions/${questionId}`, "PUT", data),
    approveQuestion: (questionId, data = {}) => apiRequest(`/schema-mastery/questions/${questionId}/approve`, "POST", data),
    rejectQuestion: (questionId, data = {}) => apiRequest(`/schema-mastery/questions/${questionId}/reject`, "POST", data),
    reactivateQuestion: (questionId, data = {}) => apiRequest(`/schema-mastery/questions/${questionId}/reactivate`, "POST", data),
    deleteQuestion: (questionId, data = {}) => apiRequest(`/schema-mastery/questions/${questionId}`, "DELETE", data),
    getPostTestQuestions: (params = {}) => {
        const studentId = params.student_id || params.studentId || "";
        const concept = params.concept || params.concept_name || "";
        const errorType = params.error_type || params.errorType || "";
        const query = `student_id=${encodeURIComponent(studentId)}&concept=${encodeURIComponent(concept)}${errorType ? `&error_type=${encodeURIComponent(errorType)}` : ""}`;
        return apiRequest(`/schema-mastery/post-test/questions?${query}`);
    },
    submitPostTest: (data) => apiRequest("/schema-mastery/post-test/submit", "POST", data),
    getPostTestResults: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") params.set(key, value);
        });
        const query = params.toString();
        return apiRequest(`/schema-mastery/post-test/results${query ? `?${query}` : ""}`);
    },
    getLatestPostTestResult: (studentId) => apiRequest(`/schema-mastery/post-test/results/latest/${encodeURIComponent(studentId)}`),
    getFlowContext: (studentId, sessionId = "") => {
        const params = new URLSearchParams({ student_id: studentId });
        if (sessionId) params.set("session_id", sessionId);
        return apiRequest(`/schema-mastery/context?${params.toString()}`);
    },
    getCurrentContext: (studentId) => {
        return apiRequest(`/schema-mastery/context/current?student_id=${encodeURIComponent(studentId)}`);
    },
    saveSessionContext: (data) => apiRequest("/schema-mastery/context/save", "POST", data),
    saveComponent1: (data) => apiRequest("/schema-mastery/session/component1", "POST", data),
    saveComponent2: (data) => apiRequest("/schema-mastery/session/component2", "POST", data),
    saveComponent3: (data) => apiRequest("/schema-mastery/session/component3", "POST", data),
    resetSessionContext: (studentId) => apiRequest("/schema-mastery/context/reset", "POST", { student_id: studentId }),
};

// --- Wellbeing / Struggle Detection ---
export const WellbeingAPI = {
    predictStruggle: (data) => apiRequest("/wellbeing/predict-struggle", "POST", data),
};

// --- Component 5: Auth ---
export const AuthAPI = {
    login: (credentials) => apiRequest("/auth/login", "POST", credentials),
    register: (data) => apiRequest("/auth/register", "POST", data),
    getProfile: (userId) => apiRequest(`/auth/profile/${userId}`),
    getMe: (userId = "") => apiRequest(`/auth/me${userId ? `?uid=${encodeURIComponent(userId)}` : ""}`),
    verifyToken: (idToken) => apiRequest("/auth/verify-token", "POST", { id_token: idToken }),
};

// --- Health Check ---
export async function checkHealth() {
    try {
        const data = await apiRequest("/health");
        console.log("[OK] API healthy:", data.status);
        return true;
    } catch {
        console.warn("[WARN] API not reachable");
        return false;
    }
}
