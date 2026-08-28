/**
 * GSAP Animation Utilities — CodeQuest LMS
 * =========================================
 * Provides clean, subtle animations respecting prefers-reduced-motion.
 */

import gsap from "gsap";

function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Smooth entrance animation for full page or card containers.
 */
export function animatePageEntrance(container, duration = 0.35) {
    if (!container || prefersReducedMotion()) return;
    try {
        gsap.fromTo(
            container,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration, ease: "power2.out", clearProps: "all" }
        );
    } catch {}
}

/**
 * Staggered entrance for lists or card grids.
 */
export function animateStaggerCards(selector, parent = document, stagger = 0.08) {
    if (prefersReducedMotion()) return;
    try {
        const elements = parent.querySelectorAll(selector);
        if (!elements.length) return;
        gsap.fromTo(
            elements,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.35, stagger, ease: "power2.out", clearProps: "all" }
        );
    } catch {}
}

/**
 * Smooth step slide transition for wizard / onboarding steps.
 */
export function animateStepTransition(stepContainer, direction = 1) {
    if (!stepContainer || prefersReducedMotion()) return;
    try {
        const xOffset = direction > 0 ? 25 : -25;
        gsap.fromTo(
            stepContainer,
            { opacity: 0, x: xOffset },
            { opacity: 1, x: 0, duration: 0.28, ease: "power2.out", clearProps: "all" }
        );
    } catch {}
}

/**
 * Subtle pulse / bounce for active selection items or buttons.
 */
export function animatePulse(element) {
    if (!element || prefersReducedMotion()) return;
    try {
        gsap.fromTo(
            element,
            { scale: 0.97 },
            { scale: 1, duration: 0.2, ease: "back.out(1.7)" }
        );
    } catch {}
}
