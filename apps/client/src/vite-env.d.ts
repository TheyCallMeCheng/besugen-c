/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DISCORD_CLIENT_ID: string;
    readonly VITE_COLYSEUS_URL: string;
    readonly VITE_PUBLIC_POSTHOG_KEY: string;
    readonly VITE_PUBLIC_POSTHOG_HOST: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
