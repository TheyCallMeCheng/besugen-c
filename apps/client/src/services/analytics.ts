import posthog from 'posthog-js';

/**
 * Analytics service for tracking user events
 * Wraps PostHog for easy use throughout the app
 */

// Identify a user (call when Discord user is authenticated)
export function identifyUser(userId: string, properties?: Record<string, any>) {
    posthog.identify(userId, properties);
}

// Track screen/page views
export function trackScreenView(screenName: string) {
    posthog.capture('screen_view', { screen: screenName });
}

// Track room events
export function trackRoomCreated(roomId: string) {
    posthog.capture('room_created', { room_id: roomId });
}

export function trackRoomJoined(roomId: string) {
    posthog.capture('room_joined', { room_id: roomId });
}

// Track game events
export function trackGameStarted(playerCount: number) {
    posthog.capture('game_started', { player_count: playerCount });
}

export function trackGameEnded(data: {
    winner?: boolean;
    roundsPlayed: number;
    playerCount: number;
}) {
    posthog.capture('game_ended', data);
}

// Track tutorial
export function trackTutorialOpened() {
    posthog.capture('tutorial_opened');
}

export function trackTutorialCompleted(slidesViewed: number) {
    posthog.capture('tutorial_completed', { slides_viewed: slidesViewed });
}
