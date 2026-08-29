/**
 * TeacherSettings Component — Portal Configuration & ML Status
 * =============================================================
 */

import { getCurrentUser } from "../../utils/auth.js";

export function renderTeacherSettings(container, onNavigate) {
    const user = getCurrentUser();

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 900px; margin: 0 auto;">
            
            <!-- Header -->
            <div>
                <h1 style="font-size: 1.75rem; font-weight: 800; color: #111827; letter-spacing: -0.02em;">
                    System Settings & Configuration
                </h1>
                <p style="color: #6B7280; font-size: 0.9375rem; margin-top: 0.25rem;">
                    Platform specifications, ML pipeline verification, and educator credentials.
                </p>
            </div>

            <!-- Profile Info Card -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fa-solid fa-user-shield" style="color: #1E40AF;"></i> Educator Profile
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
                    <div>
                        <label class="form-label">Full Name</label>
                        <input type="text" class="input-field" value="${user?.displayName || 'Educator'}" readonly>
                    </div>
                    <div>
                        <label class="form-label">Email Address</label>
                        <input type="text" class="input-field" value="${user?.email || 'teacher@codequest.lk'}" readonly>
                    </div>
                    <div>
                        <label class="form-label">Assigned Role</label>
                        <input type="text" class="input-field" value="${(user?.role || 'teacher').toUpperCase()}" readonly>
                    </div>
                    <div>
                        <label class="form-label">Permissions</label>
                        <input type="text" class="input-field" value="Draft, Review, Approve, Reject, Analytics" readonly>
                    </div>
                </div>
            </div>

            <!-- ML Pipeline Status Card -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fa-solid fa-microchip" style="color: #059669;"></i> Component 4 ML Pipeline Status
                    </div>
                    <span class="badge badge-success">Loaded & Verified</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 1rem; font-size: 0.875rem;">
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #E5E7EB;">
                        <span style="color: #6B7280;">Artifact Path:</span>
                        <code style="background: #F3F4F6; padding: 0.2rem 0.5rem; border-radius: 4px;">backend/ml/component4_schema_mastery/models/schema_mastery_pipeline.pkl</code>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #E5E7EB;">
                        <span style="color: #6B7280;">Feature Vector Length:</span>
                        <strong>11 behavioral & performance dimensions</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #E5E7EB;">
                        <span style="color: #6B7280;">Decision Rule:</span>
                        <strong>mastery_probability >= 0.70 -> DONE; otherwise LEARN_AGAIN</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                        <span style="color: #6B7280;">Option Randomization:</span>
                        <strong>Server-side shuffling with hidden session mappings</strong>
                    </div>
                </div>
            </div>

            <!-- Question Bank Persistence -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fa-solid fa-database" style="color: #1E40AF;"></i> Question Bank Persistence
                    </div>
                </div>

                <div style="font-size: 0.875rem; color: #4B5563; line-height: 1.6;">
                    Draft questions, approved bank entries, and student attempt histories are persisted locally in <code>backend/ml/component4_schema_mastery/question_bank/local_storage/</code> and synchronized with Cloud Firestore when network connectivity is available.
                </div>
            </div>

        </div>
    `;
}
