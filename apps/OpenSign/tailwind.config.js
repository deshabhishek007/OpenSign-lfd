/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {}
  },
  plugins: [
    require("daisyui"),
    function ({ addUtilities, addVariant }) {
      // ✅ Variants that match html[data-theme="..."] (or any ancestor with data-theme)
      addVariant("opensigncss", '[data-theme="opensigncss"] &');
      addVariant("opensigndark", '[data-theme="opensigndark"] &');

      addUtilities({
        // Prevent iOS long-press popup
        ".touch-callout-none": {
          "-webkit-touch-callout": "none"
        },
        // VS Code-style disabled button for all themes
        ".op-btn-vscode-disabled": {
          "background-color": "#3C3C3C !important",
          color: "#CCCCCC !important",
          "border-color": "#565656 !important",
          cursor: "not-allowed !important",
          opacity: "1 !important",
          "&:hover": {
            "background-color": "#3C3C3C !important",
            color: "#CCCCCC !important",
            "border-color": "#565656 !important",
            transform: "none !important"
          }
        },
        // Dark mode icon improvements using DaisyUI theme detection
        '[data-theme="opensigndark"] .icon-improved': {
          color: "#CCCCCC !important"
        },
        '[data-theme="opensigndark"] .icon-muted': {
          color: "#999999 !important"
        },
        '[data-theme="opensigndark"] .icon-disabled': {
          color: "#858585 !important"
        },
        // Gray text improvements for dark mode
        '[data-theme="opensigndark"] .text-gray-500': {
          color: "#CCCCCC !important"
        },
        '[data-theme="opensigndark"] .text-gray-400': {
          color: "#999999 !important"
        },
        '[data-theme="opensigndark"] .text-gray-600': {
          color: "#CCCCCC !important"
        },
        // CSS variable utilities that work with arbitrary values
        ".icon-themed": {
          color: "var(--icon-color)"
        },
        ".icon-themed-muted": {
          color: "var(--icon-color-muted)"
        },
        ".icon-themed-disabled": {
          color: "var(--icon-color-disabled)"
        },
        ".btn-themed-disabled": {
          "background-color": "var(--btn-disabled-bg)",
          color: "var(--btn-disabled-color)",
          "border-color": "var(--btn-disabled-border)",
          cursor: "not-allowed",
          "&:hover": {
            "background-color": "var(--btn-disabled-bg)",
            color: "var(--btn-disabled-color)",
            "border-color": "var(--btn-disabled-border)",
            transform: "none"
          }
        }
      });
    }
  ],
  daisyui: {
    // themes: true,
    // Colors below are peenak's "clean SaaS" reskin (Linear/Notion-inspired:
    // thin borders over shadows, one restrained indigo accent, muted
    // neutrals) — previously injected at runtime via nginx sub_filter
    // (opensign-peenak/brand/theme-modern.css), now baked in here instead.
    // See PR/commit history on the peenak-saas branch for the migration.
    themes: [
      {
        opensigndark: {
          primary: "#818CF8", // indigo-400
          "primary-content": "#0B0F19",

          secondary: "#64748B", // slate-500 — neutral, not a second hue
          "secondary-content": "#0B0F19",

          accent: "#A5B4FC", // indigo-300, same family as primary
          "accent-content": "#0B0F19",

          neutral: "#1E293B", // slate-800
          "neutral-content": "#F1F5F9",

          "base-100": "#0F1420",
          "base-200": "#131826",
          "base-300": "#1A2030",
          "base-content": "#E2E8F0",

          info: "#38BDF8",
          success: "#34D399",
          warning: "#FBBF24",
          error: "#F87171",

          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.5rem",
          "--tab-border": "2px",
          "--tab-radius": "0.7rem",

          // Custom CSS variables for icon and button states
          "--icon-color": "#CCCCCC",
          "--icon-color-muted": "#999999",
          "--icon-color-disabled": "#858585",
          "--btn-disabled-bg": "#3C3C3C",
          "--btn-disabled-color": "#CCCCCC",
          "--btn-disabled-border": "#565656",

          // Optional polish
          "--navbar-padding": "0.8rem",
          "--border-color": "#2C2C2C", // Card/table separation
          "--tooltip-color": "#1F2937"
        }
      },
      {
        opensigncss: {
          primary: "#4F46E5", // indigo-600, single accent
          "primary-content": "#F8FAFC",
          secondary: "#475569", // slate-600 — neutral, not a second hue
          "secondary-content": "#F8FAFC",
          accent: "#6366F1", // indigo-500, same family as primary
          "accent-content": "#F8FAFC",
          neutral: "#0F172A", // slate-900
          "neutral-content": "#F1F5F9",
          "base-100": "#FFFFFF",
          "base-200": "#FAFBFC", // barely-tinted white
          "base-300": "#F1F5F9", // slate-100, hover/subtle-fill surface
          "base-content": "#1E293B", // slate-800, soft near-black
          info: "#3B82F6",
          "info-content": "#F8FAFC",
          success: "#10B981",
          "success-content": "#F8FAFC",
          warning: "#F59E0B",
          "warning-content": "#1E293B",
          error: "#EF4444",
          "error-content": "#F8FAFC",
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.5rem",
          "--tab-border": "2px",
          "--tab-radius": "0.7rem"
        }
      }
    ],
    prefix: "op-"
  }
};
