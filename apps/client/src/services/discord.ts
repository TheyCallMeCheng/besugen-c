import { DiscordSDK, type Types } from '@discord/embedded-app-sdk';

// Get Discord Client ID from environment
const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;

// Discord SDK instance (only created when running as an Activity)
let discordSdk: DiscordSDK | null = null;

// Authenticated user info
let discordUser: Types.GetActivityInstanceConnectedParticipantsResponse['participants'][0] | null = null;

/**
 * Check if we're running inside a Discord Activity iframe
 */
export function isDiscordActivity(): boolean {
    // Check multiple indicators that we're in a Discord Activity
    const urlParams = new URLSearchParams(window.location.search);
    
    // Method 1: Check for Discord-specific query params
    const hasFrameId = urlParams.has('frame_id');
    const hasInstanceId = urlParams.has('instance_id');
    
    // Method 2: Check if we're on a discordsays.com domain (Discord's activity hosting)
    const isDiscordDomain = window.location.hostname.includes('discordsays.com') || 
                            window.location.hostname.includes('discord.com');
    
    // Method 3: Check if we're in an iframe (Activities are always iframed)
    const isIframed = window.self !== window.top;
    
    const result = hasFrameId || hasInstanceId || isDiscordDomain;
    
    console.log('[Discord] Activity detection:', {
        hasFrameId,
        hasInstanceId,
        isDiscordDomain,
        isIframed,
        hostname: window.location.hostname,
        result
    });
    
    return result;
}

/**
 * Initialize the Discord SDK and authenticate the user
 * Should only be called when running as a Discord Activity
 */
export async function initializeDiscord(): Promise<void> {
    if (!DISCORD_CLIENT_ID) {
        console.error('[Discord] Missing VITE_DISCORD_CLIENT_ID environment variable');
        throw new Error('Discord Client ID not configured');
    }

    console.log('[Discord] Initializing SDK...');

    // Create SDK instance
    discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);

    // Wait for SDK to be ready
    await discordSdk.ready();
    console.log('[Discord] SDK ready');

    // Authorize with Discord
    const { code } = await discordSdk.commands.authorize({
        client_id: DISCORD_CLIENT_ID,
        response_type: 'code',
        state: '',
        prompt: 'none',
        scope: ['identify', 'guilds'],
    });

    console.log('[Discord] Authorization code received');

    // Exchange the code for an access token via our server
    const tokenResponse = await fetch('/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
    });

    if (!tokenResponse.ok) {
        throw new Error('Failed to exchange Discord auth code for token');
    }

    const { access_token } = await tokenResponse.json();

    // Authenticate with Discord using the access token
    await discordSdk.commands.authenticate({ access_token });
    console.log('[Discord] Authenticated successfully');

    // Get the current user's participant info
    const participants = await discordSdk.commands.getInstanceConnectedParticipants();
    
    // Find the current user (they should be in the participants list)
    if (participants.participants.length > 0) {
        discordUser = participants.participants[0];
        console.log('[Discord] Current user:', discordUser.username);
    }
}

/**
 * Get the Discord SDK instance
 */
export function getDiscordSdk(): DiscordSDK | null {
    return discordSdk;
}

/**
 * Get the authenticated Discord user info
 */
export function getDiscordUser() {
    return discordUser;
}

/**
 * Get the user's display name (username or global_name if set)
 */
export function getDiscordDisplayName(): string | null {
    if (!discordUser) return null;
    return discordUser.global_name || discordUser.username;
}

/**
 * Get the user's avatar URL
 */
export function getDiscordAvatarUrl(): string | null {
    if (!discordUser?.avatar) return null;
    return `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`;
}
