import { SchemaMasteryAPI } from "../../api/api.js";

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function confirmArchiveStudent(student, onChanged) {
    const dialog = document.createElement("dialog");
    dialog.className = "c4-roster-dialog";
    dialog.setAttribute("aria-labelledby", "archive-student-title");
    dialog.innerHTML = `<form>
        <h2 id="archive-student-title">Remove Student from Roster?</h2>
        <p><strong>${escapeHtml(student.studentName || student.name || student.studentId)}</strong><br>${escapeHtml(student.email || student.studentId)}</p>
        <p>This hides the student from the active teacher roster. Their login account, results and learning history stay saved. You can restore them from Archived Students.</p>
        <p role="alert" data-archive-error hidden></p>
        <div class="c4-roster-dialog-actions">
            <button type="button" class="btn btn-outline" data-cancel>Cancel</button>
            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-box-archive"></i> Archive Student</button>
        </div>
    </form>`;
    let pending = false;
    dialog.addEventListener("close", () => dialog.remove(), { once: true });
    dialog.addEventListener("cancel", event => { if (pending) event.preventDefault(); });
    dialog.querySelector("[data-cancel]").addEventListener("click", () => dialog.close());
    dialog.querySelector("form").addEventListener("submit", async event => {
        event.preventDefault();
        if (pending) return;
        pending = true;
        dialog.querySelectorAll("button").forEach(button => { button.disabled = true; });
        const error = dialog.querySelector("[data-archive-error]");
        error.hidden = true;
        try {
            const response = await SchemaMasteryAPI.archiveStudent(student.studentId);
            if (!response.success) throw new Error(response.error || "Could not archive this student.");
            dialog.close();
            await onChanged({ student_id: student.studentId, name: student.studentName || student.name,
                email: student.email, ...response.student, archived: true });
        } catch (failure) {
            error.textContent = failure.message || "Could not archive this student. Please try again.";
            error.hidden = false;
        } finally {
            pending = false;
            dialog.querySelectorAll("button").forEach(button => { button.disabled = false; });
        }
    });
    document.body.append(dialog);
    dialog.showModal();
    dialog.querySelector("[data-cancel]").focus();
}

export function wireArchiveButtons(container, students, onChanged) {
    container.querySelectorAll("[data-archive-student]").forEach(button => {
        button.addEventListener("click", () => {
            const student = students.find(s => String(s.studentId) === button.dataset.archiveStudent);
            if (student) confirmArchiveStudent(student, onChanged);
        });
    });
}

export function renderArchivedStudents(container, students, onChanged) {
    container.innerHTML = students.length ? `<div class="c4-history-scroll"><table class="c4-history-table">
        <thead><tr><th scope="col">Student</th><th scope="col">Email</th><th scope="col">Archived</th><th scope="col">Action</th></tr></thead>
        <tbody>${students.map(s => `<tr>
            <td>${escapeHtml(s.name || s.student_id)}</td><td>${escapeHtml(s.email || "--")}</td>
            <td>${escapeHtml(s.archived_at ? new Date(s.archived_at).toLocaleString() : "--")}</td>
            <td><button class="btn btn-outline" data-restore-student="${escapeHtml(s.student_id)}"><i class="fa-solid fa-rotate-left"></i> Restore</button></td>
        </tr>`).join("")}</tbody></table></div><p role="alert" data-restore-error hidden></p>`
        : `<p class="text-muted">No archived students.</p>`;
    container.querySelectorAll("[data-restore-student]").forEach(button => {
        button.addEventListener("click", async () => {
            button.disabled = true;
            const error = container.querySelector("[data-restore-error]");
            error.hidden = true;
            try {
                const response = await SchemaMasteryAPI.restoreStudent(button.dataset.restoreStudent);
                if (!response.success) throw new Error(response.error || "Could not restore this student.");
                const student = students.find(s => s.student_id === button.dataset.restoreStudent);
                await onChanged({ ...student, ...response.student, student_id: button.dataset.restoreStudent, archived: false });
            } catch (failure) {
                error.textContent = failure.message || "Could not restore this student.";
                error.hidden = false;
                button.disabled = false;
            }
        });
    });
}
