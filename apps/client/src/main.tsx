import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { isDiscordActivity, initializeDiscord, getDiscordDisplayName, getDiscordAvatarUrl } from './services/discord';

interface DiscordContext {
    isDiscord: boolean;
    userName: string | null;
    avatarUrl: string | null;
}

async function main() {
    let discordContext: DiscordContext = {
        isDiscord: false,
        userName: null,
        avatarUrl: null,
    };
    // Check if we're running as a Discord Activity
    if (isDiscordActivity()) {
        console.log('[Main] Running as Discord Activity, initializing SDK...');
        try {
            await initializeDiscord();
            discordContext = {
                isDiscord: true,
                userName: getDiscordDisplayName(),
                avatarUrl: getDiscordAvatarUrl(),
            };
            console.log('[Main] Discord initialized:', discordContext);
        } catch (error) {
            console.error('[Main] Failed to initialize Discord:', error);
            // Fall back to non-Discord mode
        }
    } else {
        console.log('[Main] Running in browser mode (not a Discord Activity)');
    }

    // Render the app
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <App discordContext={discordContext} />
        </React.StrictMode>
    );
}

main();
