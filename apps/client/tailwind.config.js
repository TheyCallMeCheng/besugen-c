/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Menu theme (blue/purple dark)
                menu: {
                    bg: '#1a1c2e',
                    card: '#252840',
                    accent: '#4f7cff',
                },
                // Game table theme (green)
                table: {
                    bg: '#0f1a14',
                    felt: '#2d4a3e',
                    border: '#3d5a4e',
                },
                // Lobby theme
                lobby: {
                    bg: '#151824',
                    panel: '#1e2235',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
                'card-hover': '0 8px 30px rgba(0, 0, 0, 0.4)',
                'glow-green': '0 0 20px rgba(34, 197, 94, 0.6)',
                'glow-blue': '0 0 20px rgba(59, 130, 246, 0.6)',
            },
        },
    },
    plugins: [],
}
