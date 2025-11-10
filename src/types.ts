import type { Context } from "hono";

export interface Env {
	DB: D1Database;
	ONLINE_STATUS: KVNamespace;  // KV for storing user online status
	ASSETS: Fetcher;  // Workers Assets binding for serving static files
	CHAT_ROOM: DurableObjectNamespace;  // Durable Object for WebSocket connections
	JWT_SECRET: string;
	JWT_ACCESS_EXPIRATION: string;
	JWT_REFRESH_EXPIRATION: string;
}

export type AppContext = Context<{ Bindings: Env }>;
export type HandleArgs = [AppContext];
