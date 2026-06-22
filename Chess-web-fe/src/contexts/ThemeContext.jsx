import React, { createContext, useContext, useState, useEffect } from 'react';

// =========================================================
// PRESET THEMES
// =========================================================
export const PRESET_THEMES = [
    {
        id: 'ocean-blue',
        name: 'Ocean Blue',
        emoji: '🔵',
        accentBlue: '#3b82f6',
        accentBlueHover: '#60a5fa',
        accentPurple: '#8b5cf6',
        bgDark: '#0f1115',
        panelBg: '25, 28, 36',
        sidebarBg: '20, 22, 28',
    },
    {
        id: 'galaxy-purple',
        name: 'Galaxy Purple',
        emoji: '🟣',
        accentBlue: '#a855f7',
        accentBlueHover: '#c084fc',
        accentPurple: '#6366f1',
        bgDark: '#0d0b14',
        panelBg: '22, 18, 35',
        sidebarBg: '18, 15, 28',
    },
    {
        id: 'forest-green',
        name: 'Forest Green',
        emoji: '🟢',
        accentBlue: '#10b981',
        accentBlueHover: '#34d399',
        accentPurple: '#059669',
        bgDark: '#0a0f0d',
        panelBg: '15, 25, 20',
        sidebarBg: '12, 20, 16',
    },
    {
        id: 'crimson-red',
        name: 'Crimson Red',
        emoji: '🔴',
        accentBlue: '#ef4444',
        accentBlueHover: '#f87171',
        accentPurple: '#dc2626',
        bgDark: '#110a0a',
        panelBg: '28, 18, 18',
        sidebarBg: '22, 14, 14',
    },
    {
        id: 'sunset-orange',
        name: 'Sunset Orange',
        emoji: '🟠',
        accentBlue: '#f97316',
        accentBlueHover: '#fb923c',
        accentPurple: '#ea580c',
        bgDark: '#110d08',
        panelBg: '28, 22, 14',
        sidebarBg: '22, 17, 10',
    },
    {
        id: 'rose-pink',
        name: 'Rose Pink',
        emoji: '🩷',
        accentBlue: '#ec4899',
        accentBlueHover: '#f472b6',
        accentPurple: '#db2777',
        bgDark: '#110b10',
        panelBg: '28, 18, 26',
        sidebarBg: '22, 14, 20',
    },
    {
        id: 'cyan-ice',
        name: 'Cyan Ice',
        emoji: '🩵',
        accentBlue: '#06b6d4',
        accentBlueHover: '#22d3ee',
        accentPurple: '#0891b2',
        bgDark: '#080f12',
        panelBg: '12, 24, 30',
        sidebarBg: '10, 20, 25',
    },
    {
        id: 'minimal-gray',
        name: 'Minimal Gray',
        emoji: '🩶',
        accentBlue: '#6b7280',
        accentBlueHover: '#9ca3af',
        accentPurple: '#4b5563',
        bgDark: '#0c0c0d',
        panelBg: '22, 22, 24',
        sidebarBg: '18, 18, 20',
    },
];

const DEFAULT_THEME = PRESET_THEMES[0];

// =========================================================
// APPLY THEME to DOM
// =========================================================
function applyTheme(theme) {
    const root = document.documentElement;
    root.style.setProperty('--accent-blue', theme.accentBlue);
    root.style.setProperty('--accent-blue-hover', theme.accentBlueHover);
    root.style.setProperty('--accent-purple', theme.accentPurple);
    root.style.setProperty('--bg-dark', theme.bgDark);
    root.style.setProperty('--panel-bg', `rgba(${theme.panelBg}, 0.6)`);
    root.style.setProperty('--sidebar-bg', `rgb(${theme.sidebarBg})`);
}

// =========================================================
// CONTEXT
// =========================================================
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [currentTheme, setCurrentTheme] = useState(() => {
        try {
            const saved = localStorage.getItem('app-theme');
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed;
            }
        } catch (e) {
            // ignore
        }
        return DEFAULT_THEME;
    });

    // Apply on mount and whenever theme changes
    useEffect(() => {
        applyTheme(currentTheme);
    }, [currentTheme]);

    const selectPreset = (preset) => {
        const newTheme = { ...preset };
        setCurrentTheme(newTheme);
        localStorage.setItem('app-theme', JSON.stringify(newTheme));
    };

    const updateColor = (key, value) => {
        // Derive hover color from accent blue if needed
        let hoverValue = value;
        if (key === 'accentBlue') {
            // Lighten slightly for hover — just use same color shifted lighter
            hoverValue = lightenHex(value, 30);
        }

        const newTheme = {
            ...currentTheme,
            id: 'custom',
            name: 'Tùy chỉnh',
            emoji: '✨',
            [key]: value,
            ...(key === 'accentBlue' ? { accentBlueHover: hoverValue } : {}),
        };
        setCurrentTheme(newTheme);
        localStorage.setItem('app-theme', JSON.stringify(newTheme));
    };

    return (
        <ThemeContext.Provider value={{ currentTheme, selectPreset, updateColor, presets: PRESET_THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}

// =========================================================
// HELPER: lighten a hex color
// =========================================================
function lightenHex(hex, amount) {
    try {
        const clean = hex.replace('#', '');
        const r = Math.min(255, parseInt(clean.substring(0, 2), 16) + amount);
        const g = Math.min(255, parseInt(clean.substring(2, 4), 16) + amount);
        const b = Math.min(255, parseInt(clean.substring(4, 6), 16) + amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch {
        return hex;
    }
}
