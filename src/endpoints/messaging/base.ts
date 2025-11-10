// Base types and utilities for messaging endpoints
import type { Env } from "../../types";

export interface Message {
	id: number;
	sender_id: number;
	receiver_id: number | null;
	group_id: number | null;
	content: string;
	created_at: string;
}

export interface MessageWithSender extends Message {
	sender_username: string;
	sender_email: string;
}

// KV keys for online status
export const getOnlineStatusKey = (userId: number): string => {
	return `online:user:${userId}`;
};

// Set user online status with 5 minute TTL
export const setUserOnline = async (
	kv: KVNamespace,
	userId: number,
): Promise<void> => {
	await kv.put(getOnlineStatusKey(userId), "true", {
		expirationTtl: 300, // 5 minutes
	});
};

// Check if user is online
export const isUserOnline = async (
	kv: KVNamespace,
	userId: number,
): Promise<boolean> => {
	const status = await kv.get(getOnlineStatusKey(userId));
	return status === "true";
};

// Remove user online status
export const setUserOffline = async (
	kv: KVNamespace,
	userId: number,
): Promise<void> => {
	await kv.delete(getOnlineStatusKey(userId));
};
