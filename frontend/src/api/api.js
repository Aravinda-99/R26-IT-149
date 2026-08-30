/**
 * API Client
 * Centralized fetch wrapper for all backend API calls.
 * Vite proxy sends /api/* requests to Flask at localhost:5000.
 */

const API_BASE = "/api";

let backendUnavailable = false;
let lastFailureWarningTime = 0;
const WARNING_COOLDOWN_MS = 10000; // 10s warning throttle

async function apiRequest(endpoint, method = "GET", body = null) {
    const options = {
        method,
        headers: { "Content-Type": "application/json" },
    };
    if (body) options.body = JSON.stringify(body);

    let response;
    try {
        response = await fetch(`${API_BASE}${endpoint}`, options);
        // Reset backend availability flag on successful fetch
        backendUnavailable = false;
    } catch (netErr) {
        backendUnavailable = true;
        const now = Date.now();
        if (now - lastFailureWarningTime > WARNING_COOLDOWN_MS) {
            lastFailureWarningTime = now;
            console.warn("[CodeQuest] Backend server is not available. Please start the backend.");
        }
        throw new Error("Backend server is not available. Please start the backend.");
    }

    const text = await response.text();
    let data = {};
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = {
                error: response.status === 404
                    ? `Not found (${endpoint}) — is the API running?`
                    : `API error ${response.status}`,
            };
        }
    }

    if (!response.ok) {
        throw new Error(data.error || data.message || `API error ${response.status}`);
    }

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
    predict: (data) => apiRequest("/schema-mastery/predict", "POST", data),
    generateQuestions: (data) => apiRequest("/schema-mastery/questions/generate", "POST", data),
    getPendingQuestions: (concept = "") => apiRequest(`/schema-mastery/questions/pending${concept ? `?concept=${encodeURIComponent(concept)}` : ""}`),
    getRejectedQuestions: (concept = "") => apiRequest(`/schema-mastery/questions/rejected${concept ? `?concept=${encodeURIComponent(concept)}` : ""}`),
    updateQuestion: (questionId, data) => apiRequest(`/schema-mastery/questions/${questionId}`, "PUT", data),
    approveQuestion: (questionId, data = {}) => apiRequest(`/schema-mastery/questions/${questionId}/approve`, "POST", data),
    rejectQuestion: (questionId, data = {}) => apiRequest(`/schema-mastery/questions/${questionId}/reject`, "POST", data),
    deactivateQuestion: (questionId, data = {}) => apiRequest(`/schema-mastery/questions/${questionId}/deactivate`, "POST", data),
    reactivateQuestion: (questionId, data = {}) => apiRequest(`/schema-mastery/questions/${questionId}/reactivate`, "POST", data),
    deleteQuestion: (questionId, data = {}) => apiRequest(`/schema-mastery/questions/${questionId}`, "DELETE", data),
    getQuestionBank: (concept = "", activeOnly = false) => apiRequest(`/schema-mastery/question-bank?active_only=${activeOnly}${concept ? `&concept=${encodeURIComponent(concept)}` : ""}`),
    getPostTestQuestions: (params = {}) => {
        let studentId = "STU001";
        let concept = "Loops";
        let errorType = "";
        if (typeof params === "string") {
            concept = params;
        } else if (params && typeof params === "object") {
            studentId = params.student_id || params.studentId || "STU001";
            concept = params.concept || params.concept_name || "Loops";
            errorType = params.error_type || params.errorType || "";
        }
        const query = `student_id=${encodeURIComponent(studentId)}&concept=${encodeURIComponent(concept)}${errorType ? `&error_type=${encodeURIComponent(errorType)}` : ""}`;
        return apiRequest(`/schema-mastery/post-test/questions?${query}`);
    },
    submitPostTest: (data) => apiRequest("/schema-mastery/post-test/submit", "POST", data),
};

// --- Wellbeing / Struggle Detection ---
export const WellbeingAPI = {
    predictStruggle: (data) => apiRequest("/wellbeing/predict-struggle", "POST", data),
};

// --- Component 5: Auth ---
export const AuthAPI = {
    register: (data) => apiRequest("/auth/register", "POST", data),
    getProfile: (userId) => apiRequest(`/auth/profile/${userId}`),
    verifyToken: (idToken) => apiRequest("/auth/verify-token", "POST", { id_token: idToken }),
};

// --- Health Check ---
export async function checkHealth() {
    try {
        const data = await apiRequest("/health");
        return true;
    } catch {
        return false;
    }
}
