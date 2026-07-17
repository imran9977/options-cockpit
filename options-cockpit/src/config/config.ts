export const config = {
    dhan: {
        clientId: import.meta.env.VITE_DHAN_CLIENT_ID,
        accessToken: import.meta.env.VITE_DHAN_ACCESS_TOKEN,
        baseUrl: import.meta.env.VITE_DHAN_BASE_URL,
    },
} as const;