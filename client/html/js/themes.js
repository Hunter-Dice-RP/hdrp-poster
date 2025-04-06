/**
 * Theme management for qadr_poster_creator
 *
 * This module handles theme switching and customization.
 */

// Available themes
const themes = {
    default: {
        name: 'Default',
        colors: {
            primary: '#E6D5B8',
            secondary: '#8B7355',
            background: 'rgba(0, 0, 0, 0.6)',
            highlight: '#FFFFFF',
            border: '#483C32'
        },
        fonts: {
            primary: 'crock, serif',
            secondary: 'Playfair Display, serif'
        }
    },
    dark: {
        name: 'Dark',
        colors: {
            primary: '#D0C0A0',
            secondary: '#705E45',
            background: 'rgba(0, 0, 0, 0.8)',
            highlight: '#F0E0C0',
            border: '#382C22'
        },
        fonts: {
            primary: 'crock, serif',
            secondary: 'Playfair Display, serif'
        }
    },
    light: {
        name: 'Light',
        colors: {
            primary: '#483C32',
            secondary: '#8B7355',
            background: 'rgba(230, 213, 184, 0.9)',
            highlight: '#2A2018',
            border: '#8B7355'
        },
        fonts: {
            primary: 'crock, serif',
            secondary: 'Playfair Display, serif'
        }
    }
};

// Current theme
let currentTheme = 'default';

/**
 * Apply a theme to the UI
 * @param {string} themeName - Name of the theme to apply
 */
function applyTheme(themeName) {
    if (!themes[themeName]) {
        console.error(`Theme '${themeName}' not found.`);
        return false;
    }

    const theme = themes[themeName];
    currentTheme = themeName;

    // Create CSS variables
    const root = document.documentElement;

    // Apply colors
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-highlight', theme.colors.highlight);
    root.style.setProperty('--color-border', theme.colors.border);

    // Apply fonts
    root.style.setProperty('--font-primary', theme.fonts.primary);
    root.style.setProperty('--font-secondary', theme.fonts.secondary);

    // Trigger an event so other components can update
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeName } }));

    return true;
}

/**
 * Get the current theme
 * @returns {string} Current theme name
 */
function getCurrentTheme() {
    return currentTheme;
}

/**
 * Get all available themes
 * @returns {Object} Available themes
 */
function getAvailableThemes() {
    return Object.keys(themes).map(key => ({
        id: key,
        name: themes[key].name
    }));
}

/**
 * Initialize the theme system
 * Applies the default theme or the one from localStorage
 */
function initThemes() {
    // Add CSS variables to the document
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --color-primary: ${themes.default.colors.primary};
            --color-secondary: ${themes.default.colors.secondary};
            --color-background: ${themes.default.colors.background};
            --color-highlight: ${themes.default.colors.highlight};
            --color-border: ${themes.default.colors.border};
            --font-primary: ${themes.default.fonts.primary};
            --font-secondary: ${themes.default.fonts.secondary};
        }
    `;
    document.head.appendChild(style);

    // Try to get theme from localStorage
    const savedTheme = localStorage.getItem('qadr_poster_creator_theme');
    if (savedTheme && themes[savedTheme]) {
        applyTheme(savedTheme);
    } else {
        applyTheme('default');
    }
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', initThemes);

// Export functions for use in other modules
window.themes = {
    apply: applyTheme,
    getCurrent: getCurrentTheme,
    getAvailable: getAvailableThemes
};
