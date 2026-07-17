import dotenv from "dotenv";

dotenv.config();

export const config = {
    port: Number(process.env.PORT) || 3000,

    dhan: {
        clientId: process.env.DHAN_CLIENT_ID ?? "",
        accessToken: process.env.DHAN_ACCESS_TOKEN ?? "",
        baseUrl: process.env.DHAN_BASE_URL ?? ""
    }
};