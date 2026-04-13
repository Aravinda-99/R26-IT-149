/**
 * Game Card Component
 * ====================
 * Reusable card for displaying game info on the games page.
 */

export function createGameCard(game, onClick) {
    const id = `game-card-${game.game_id}`;
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el && onClick) el.addEventListener("click", () => onClick(game));
    }, 0);

    return `
        <div class="card game-card" id="${id}" style="cursor: pointer;">
            <h3 style="color: var(--text-primary); font-size: 1.1rem;">${game.title}</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0.5rem 0;">Concept: ${game.concept}</p>
            <div style="display: flex; justify-content: space-between; color: var(--text-secondary); font-size: 0.8rem;">
                <span>${game.levels} Levels</span>
                <span style="color: var(--accent-green)">${game.xp_reward} XP</span>
            </div>
        </div>
    `;
}
