/**
 * API Client
 * Centralized fetch wrapper for all backend API calls.
 * Vite proxy sends /api/* requests to Flask at localhost:5000.
 */

const API_BASE = "/api";

async function apiRequest(endpoint, method = "GET", body = null) {
    const options = {
        method,
        headers: { "Content-Type": "application/json" },
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
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
    getHistory: (userId) => apiRequest(`/errors/history/${userId}`),
    getSummary: (userId) => apiRequest(`/errors/summary/${userId}`),
};

// --- Component 3: Gamification ---
export const GamificationAPI = {
    getGames: () => apiRequest("/gamification/games"),
    submitScore: (data) => apiRequest("/gamification/submit-score", "POST", data),
    getLeaderboard: () => apiRequest("/gamification/leaderboard"),
    getProfile: (userId) => apiRequest(`/gamification/profile/${userId}`),
};

// --- Component 4: Mastery Tracker ---
export const MasteryAPI = {
    getStatus: (userId) => apiRequest(`/mastery/status/${userId}`),
    getStudents: () => apiRequest("/mastery/students"),
    update: (data) => apiRequest("/mastery/update", "POST", data),
    getQuestions: (concept) => apiRequest(`/mastery/questions/${concept}`),
    submitDiagnostic: (data) => apiRequest("/mastery/diagnostic", "POST", data),
    getHistory: (userId, schema) => apiRequest(`/mastery/history/${userId}/${schema}`),
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
        console.log("[OK] API healthy:", data.status);
        return true;
    } catch {
        console.warn("[WARN] API not reachable");
        return false;
    }
}
