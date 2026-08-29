import { AuthAPI } from "../api/api.js";

export async function renderProfile(container) {
    // Check if user is logged in
    const userStr = localStorage.getItem("codequest_user");
    if (!userStr) {
        container.innerHTML = `<div style="text-align: center; padding: 4rem; color: #fff;"><h3>Please Sign In</h3><p>You need to be logged in to view your profile.</p></div>`;
        return;
    }
    const user = JSON.parse(userStr);
    const userId = user.id || user.user_id;

    // Show initial loading skeleton or spinner
    container.innerHTML = `
        <div class="auth-container">
            <!-- Animated background blobs -->
            <div class="glass-blob glass-blob-1"></div>
            <div class="glass-blob glass-blob-2"></div>
            <div class="glass-blob glass-blob-3"></div>

            <div class="auth-card" style="width: 100%; max-width: 600px; padding: 3rem;">
                <h2 class="auth-title" style="margin-bottom: 2rem;">Loading Profile...</h2>
                <div style="text-align: center;"><div class="spinner"></div></div>
            </div>
        </div>
    `;

    try {
        // Fetch full profile from backend
        // We assume AuthAPI.getProfile is properly set up in api.js
        const profileData = await AuthAPI.getProfile(userId);
        
        // Generate an initial for the avatar
        const initial = profileData.display_name ? profileData.display_name.charAt(0).toUpperCase() : '?';

        // Render the premium profile UI
        container.innerHTML = `
            <div class="auth-container">
                <!-- Animated background blobs -->
                <div class="glass-blob glass-blob-1"></div>
                <div class="glass-blob glass-blob-2"></div>
                <div class="glass-blob glass-blob-3"></div>
                
                <div class="auth-card" style="width: 100%; max-width: 700px; padding: 3rem 2rem;">
                    
                    <!-- Avatar Header -->
                    <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 2rem;">
                        <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: bold; color: white; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); border: 2px solid rgba(255, 255, 255, 0.1); margin-bottom: 1rem;">
                            ${initial}
                        </div>
                        <h2 class="auth-title" style="margin-bottom: 0.25rem;">${profileData.display_name}</h2>
                        <p style="color: var(--text-secondary); font-size: 0.95rem;">${profileData.email}</p>
                        <span style="margin-top: 0.75rem; background: rgba(99, 102, 241, 0.15); color: #818cf8; padding: 0.25rem 1rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; text-transform: capitalize; border: 1px solid rgba(99, 102, 241, 0.3);">
                            ${profileData.role || 'Student'}
                        </span>
                    </div>

                    <div style="height: 1px; background: rgba(255,255,255,0.05); margin: 2rem 0;"></div>

                    <!-- Statistics Grid -->
                    <h3 style="color: white; margin-bottom: 1rem; font-size: 1.1rem; text-align: center;">Learning Statistics</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        <div style="background: rgba(0, 0, 0, 0.2); padding: 1.5rem 1rem; border-radius: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
                            <div style="font-size: 2rem; font-weight: bold; color: #34d399; margin-bottom: 0.25rem;">${profileData.total_xp || 0}</div>
                            <div style="color: var(--text-secondary); font-size: 0.85rem;">Total XP</div>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.2); padding: 1.5rem 1rem; border-radius: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
                            <div style="font-size: 2rem; font-weight: bold; color: #f472b6; margin-bottom: 0.25rem;">${profileData.games_played || 0}</div>
                            <div style="color: var(--text-secondary); font-size: 0.85rem;">Games Played</div>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.2); padding: 1.5rem 1rem; border-radius: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
                            <div style="font-size: 2rem; font-weight: bold; color: #fbbf24; margin-bottom: 0.25rem;">${(profileData.badges || []).length}</div>
                            <div style="color: var(--text-secondary); font-size: 0.85rem;">Badges Earned</div>
                        </div>
                    </div>

                    <!-- Account Details -->
                    <div style="background: rgba(0,0,0,0.15); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; justify-content: space-between; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 1rem;">
                            <span style="color: var(--text-secondary); font-size: 0.9rem;">Member Since</span>
                            <span style="color: white; font-weight: 500; font-size: 0.9rem;">${profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary); font-size: 0.9rem;">Account ID</span>
                            <span style="color: white; font-weight: 500; font-size: 0.9rem; font-family: monospace;">${userId}</span>
                        </div>
                    </div>

                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `
            <div class="auth-container">
                <div class="auth-card" style="width: 100%; max-width: 500px; padding: 3rem;">
                    <h2 class="auth-title" style="color: #ef4444;">Error Loading Profile</h2>
                    <p style="color: var(--text-secondary); text-align: center; margin-top: 1rem;">${err.message}</p>
                </div>
            </div>
        `;
    }
}
