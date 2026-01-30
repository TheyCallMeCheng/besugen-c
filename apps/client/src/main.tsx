import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { ErrorBoundary } from './components/ui';
import { isDiscordActivity, initializeDiscord, getDiscordDisplayName, getDiscordAvatarUrl, getDiscordUser } from './services/discord';
import { PostHogProvider } from 'posthog-js/react';
import { identifyUser } from './services/analytics';

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
            const discordUser = getDiscordUser();
            discordContext = {
                isDiscord: true,
                userName: getDiscordDisplayName(),
                avatarUrl: getDiscordAvatarUrl(),
            };
            console.log('[Main] Discord initialized:', discordContext);

            // Identify user in analytics
            if (discordUser?.id) {
                identifyUser(discordUser.id, {
                    username: discordUser.username,
                    display_name: discordUser.global_name || discordUser.username,
                    platform: 'discord',
                });
            }
        } catch (error) {
            console.error('[Main] Failed to initialize Discord:', error);
            // Fall back to non-Discord mode
        }
    } else {
        console.log('[Main] Running in browser mode (not a Discord Activity)');
    }

    // Debug env vars
    console.log('[PostHog] Key:', import.meta.env.VITE_PUBLIC_POSTHOG_KEY);
    console.log('[PostHog] Host:', import.meta.env.VITE_PUBLIC_POSTHOG_HOST);

    // Render the app
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <PostHogProvider
                apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
                options={{
                    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
                    capture_pageview: true,
                    capture_pageleave: true,
                    autocapture: true,
                    capture_exceptions: true,
                    debug: import.meta.env.MODE === 'development',
                }}
            >
                <ErrorBoundary>
                    <App discordContext={discordContext} />
                </ErrorBoundary>
            </PostHogProvider>
        </React.StrictMode>
    );
}

main();
