export function visiblePostTestResults(results, archived, includeArchived = false) {
    if (includeArchived) return results;
    const ids = new Set(archived.map(s => String(s.student_id)));
    const emails = new Set(archived.filter(s => s.email).map(s => s.email.trim().toLowerCase()));
    return results.filter(r => !ids.has(String(r.student_id)) && !emails.has(String(r.student_email || "").trim().toLowerCase()));
}

export function mergeTeacherStudents(groups, results, archived = []) {
    const aliases = new Map();
    const roster = new Set();
    function merge(student) {
        if (student.role && !["student", "learner"].includes(student.role.toLowerCase())) return null;
        const id = student.studentId || student.student_id || student.uid || student.id || student.user_id;
        const email = String(student.email || student.student_email || "").trim().toLowerCase();
        if (!id && !email) return null;
        const entry = aliases.get(`id:${id}`) || (email && aliases.get(`email:${email}`)) || {};
        Object.assign(entry, student, {
            studentId: id || entry.studentId || email,
            studentName: student.studentName || student.display_name || student.displayName || student.name || entry.studentName || id || "Student",
            email: email || entry.email,
        });
        if (id) aliases.set(`id:${id}`, entry);
        if (email) aliases.set(`email:${email}`, entry);
        roster.add(entry);
        return entry;
    }
    groups.forEach(group => (Array.isArray(group) ? group : []).forEach(merge));
    const newestFirst = [...results].sort((a, b) => String(b.created_at || b.updated_at || "").localeCompare(String(a.created_at || a.updated_at || "")));
    const updated = new Set();
    for (const result of newestFirst) {
        const entry = aliases.get(`id:${result.student_id}`) || aliases.get(`email:${String(result.student_email || "").toLowerCase()}`)
            || merge({ studentId: result.student_id, email: result.student_email, name: result.student_name });
        if (!entry || updated.has(entry)) continue;
        updated.add(entry);
        Object.assign(entry, {
            overall_mastery: result.post_test_score, overall_state: result.learning_status || "Post-Test Submitted",
            conceptName: result.concept_name, postTestCompleted: true,
            postTestScore: result.post_test_score, preTestScore: result.pre_test_score,
            masteryLevel: result.mastery_level, nextAction: result.next_action,
            masteryProbability: result.mastery_probability, latestResultId: result.result_id,
            postTestCompletedAt: result.created_at,
        });
    }
    const archivedIds = new Set(archived.map(s => String(s.student_id)));
    const archivedEmails = new Set(archived.filter(s => s.email).map(s => s.email.trim().toLowerCase()));
    return [...roster].filter(s => !archivedIds.has(String(s.studentId)) && !archivedEmails.has(String(s.email || "").trim().toLowerCase()));
}
