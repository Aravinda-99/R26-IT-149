import { AdaptiveAPI } from "../api/api.js";
import { DEFAULT_PATH } from "./data.js";

function renderPathCards(path) {
    return path
        .map((topic, i) => {
            const started = topic.status === "started";
            return `
                <div class="lp-path-item">
                    <div class="lp-step-dot ${started ? "started" : ""}">${i + 1}</div>
                    <div class="lp-step-body">
                        <strong>${topic.name}</strong>
                        <p class="lp-muted-sm">Mastery: ${topic.mastery}% • ${String(topic.status).replace("_", " ")}</p>
                    </div>
                    <span class="lp-mastery">${topic.mastery}%</span>
                </div>
            `;
        })
        .join("");
}

export async function loadLearningPath() {
    const pathEl = document.getElementById("path-list");
    if (!pathEl) return;

    try {
        const data = await AdaptiveAPI.getLearningPath("demo_user");
        const path = Array.isArray(data?.learning_path) ? data.learning_path : DEFAULT_PATH;
        pathEl.innerHTML = renderPathCards(path);
    } catch {
        pathEl.innerHTML = renderPathCards(DEFAULT_PATH);
    }
}
