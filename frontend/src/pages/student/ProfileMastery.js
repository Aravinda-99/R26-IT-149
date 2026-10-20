import { SchemaMasteryAPI } from "../../api/api.js";
import { gameForConcept } from "../concept-theme.js";

const pendingRequests = new Map();
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function percentage(value) {
    if (value === null || value === undefined || value === "") return "Not available";
    const number = Number(value);
    return Number.isFinite(number) ? `${Math.round(Math.max(0, Math.min(1, number)) * 100)}%` : "Not available";
}

function completedDate(record) {
    const date = new Date(record.created_at || record.updated_at || "");
    return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString(undefined, {
        dateStyle: "medium", timeStyle: "short",
    });
}

export function resultHref(result) {
    return `#/student/post-test/result?result_id=${encodeURIComponent(result.result_id)}`;
}

export function lessonHref(concept) {
    const game = gameForConcept(concept);
    return game ? `#/student/game-player?module=${encodeURIComponent(game.module)}` : "#/student/games";
}

function nextStep(result) {
    if (result.next_action === "DONE") return "Continue Learning";
    if (result.next_action === "LEARN_AGAIN") return "Review Game Lesson";
    return "Not available";
}

export function profileMasteryHtml(results) {
    if (!results.length) {
        return `<p class="text-muted">No completed understanding checks yet.</p>
            <a href="#/student/post-test/start" class="btn btn-outline"><i class="fa-solid fa-clipboard-check"></i> Go to Understanding Check</a>`;
    }
    const latest = results[0];
    const outcomeClass = latest.next_action === "DONE" ? "c4-outcome-done" : "c4-outcome-review";
    return `<div class="c4-profile-heading">
            <div><span class="text-muted">Latest Result</span><h4>${escapeHtml(latest.concept_name)}</h4></div>
            <span class="${outcomeClass}">${escapeHtml(latest.mastery_level || "Not available")}</span>
        </div>
        <dl class="c4-profile-summary">
            <div><dt>Post-test Score</dt><dd>${percentage(latest.post_test_score)}</dd></div>
            <div><dt>Next Step</dt><dd>${nextStep(latest)}</dd></div>
            <div><dt>Completed</dt><dd>${escapeHtml(completedDate(latest))}</dd></div>
            ${latest.mastery_probability != null ? `<div><dt>Mastery Probability</dt><dd>${percentage(latest.mastery_probability)}</dd></div>` : ""}
        </dl>
        <div class="c4-profile-actions">
            <a href="${escapeHtml(resultHref(latest))}" class="btn btn-primary"><i class="fa-solid fa-chart-line"></i> View Result</a>
            ${latest.next_action === "LEARN_AGAIN"
                ? `<a href="${escapeHtml(lessonHref(latest.concept_name))}" class="btn btn-outline"><i class="fa-solid fa-gamepad"></i> Review Game Lesson</a>`
                : latest.next_action === "DONE" ? `<a href="#/student/dashboard" class="btn btn-outline"><i class="fa-solid fa-arrow-right"></i> Continue Learning</a>` : ""}
        </div>
        <details class="c4-profile-history">
            <summary>Attempt History (${results.length})</summary>
            <div class="c4-history-scroll" tabindex="0" role="region" aria-label="Understanding check attempt history">
                <table class="c4-history-table">
                    <thead><tr><th scope="col">Concept / Completed</th><th scope="col">Score</th><th scope="col">Understanding Level</th><th scope="col">Next Step</th><th scope="col">Result</th></tr></thead>
                    <tbody>${results.map(result => `<tr>
                        <td>${escapeHtml(result.concept_name)}<small>${escapeHtml(completedDate(result))}</small></td>
                        <td>${percentage(result.post_test_score)}</td>
                        <td>${escapeHtml(result.mastery_level || "Not available")}</td>
                        <td>${nextStep(result)}</td>
                        <td><a href="${escapeHtml(resultHref(result))}" aria-label="View ${escapeHtml(result.concept_name)} result from ${escapeHtml(completedDate(result))}">View Result</a></td>
                    </tr>`).join("")}</tbody>
                </table>
            </div>
        </details>`;
}

export async function loadProfileMastery(slot, studentId) {
    slot.innerHTML = `<p class="text-muted" role="status">Loading understanding check results...</p>`;
    try {
        if (!studentId) throw new Error("Student identity unavailable");
        // Share an in-flight request when gameplay hydration re-renders the profile.
        if (!pendingRequests.has(studentId)) {
            pendingRequests.set(studentId, SchemaMasteryAPI.getPostTestResults({ student_id: studentId })
                .finally(() => pendingRequests.delete(studentId)));
        }
        const response = await pendingRequests.get(studentId);
        if (!response.success || !Array.isArray(response.results)) throw new Error("Results unavailable");
        const results = response.results.filter(result => String(result.student_id) === String(studentId) && result.result_id)
            .sort((a, b) => String(b.created_at || b.updated_at || "").localeCompare(String(a.created_at || a.updated_at || "")));
        if (slot.isConnected) slot.innerHTML = profileMasteryHtml(results);
    } catch {
        if (!slot.isConnected) return;
        slot.innerHTML = `<p role="alert">Could not load your understanding check results.</p>
            <button class="btn btn-outline" data-retry-results><i class="fa-solid fa-rotate-right"></i> Retry</button>`;
        slot.querySelector("[data-retry-results]")?.addEventListener("click", () => loadProfileMastery(slot, studentId));
    }
}
