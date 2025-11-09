// Durable Object for managing WebSocket connections
import { verifyToken } from "../utils/jwt";
import type { Env } from "../types";

interface WebSocketMessage {
	type: "private" | "group" | "heartbeat" | "auth";
	to?: number;
	content?: string;
	token?: string;
}

interface ConnectionInfo {
	userId: number;
	email: string;
	webSocket: WebSocket;
}

export class ChatRoom {
	private state: DurableObjectState;
	private env: Env;
	private connections: Map<number, ConnectionInfo>;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
		this.connections = new Map();
		console.log("🏠 ChatRoom Durable Object created");
	}

	async fetch(request: Request): Promise<Response> {
		const upgradeHeader = request.headers.get("Upgrade");
		if (!upgradeHeader || upgradeHeader !== "websocket") {
			return new Response("Expected Upgrade: websocket", { status: 426 });
		}

		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);

		let connectionInfo: ConnectionInfo | null = null;

		server.accept();
		console.log("✅ WebSocket connection accepted in Durable Object");

		server.addEventListener("message", async (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.data as string) as WebSocketMessage;

				// Handle authentication
				if (data.type === "auth") {
					if (!data.token) {
						server.send(JSON.stringify({ type: "error", message: "Token required" }));
						server.close(1008, "Authentication required");
						return;
					}

					const payload = await verifyToken(data.token, this.env.JWT_SECRET, "access");
					if (!payload) {
						server.send(JSON.stringify({ type: "error", message: "Invalid token" }));
						server.close(1008, "Invalid authentication");
						return;
					}

					connectionInfo = {
						userId: payload.userId,
						email: payload.email,
						webSocket: server,
					};
					this.connections.set(payload.userId, connectionInfo);
					console.log(`✅ User ${payload.userId} connected. Total in DO:`, this.connections.size);
					console.log(`📊 Active users in DO:`, Array.from(this.connections.keys()));

					await this.env.ONLINE_STATUS.put(
						`online:user:${payload.userId}`,
						"true",
						{ expirationTtl: 300 }
					);

					server.send(JSON.stringify({ type: "authenticated", userId: payload.userId }));
					return;
				}

				if (!connectionInfo) {
					server.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
					return;
				}

				// Handle heartbeat
				if (data.type === "heartbeat") {
					await this.env.ONLINE_STATUS.put(
						`online:user:${connectionInfo.userId}`,
						"true",
						{ expirationTtl: 300 }
					);
					server.send(JSON.stringify({ type: "heartbeat_ack" }));
					return;
				}

				// Handle private message
				if (data.type === "private") {
					if (!data.to || !data.content) {
						server.send(JSON.stringify({ type: "error", message: "Missing to or content" }));
						return;
					}

					const result = await this.env.DB.prepare(`
						INSERT INTO messages (sender_id, receiver_id, content)
						VALUES (?, ?, ?)
					`).bind(connectionInfo.userId, data.to, data.content).run();

					if (!result.success) {
						server.send(JSON.stringify({ type: "error", message: "Failed to save message" }));
						return;
					}

					const message = await this.env.DB.prepare(`
						SELECT id, sender_id, receiver_id, content, created_at
						FROM messages WHERE id = ?
					`).bind(result.meta.last_row_id).first();

					// Send to recipient if online IN THIS DURABLE OBJECT
					const recipientConnection = this.connections.get(data.to);
					console.log(`📤 Sending to user ${data.to} in DO, found:`, !!recipientConnection);
					if (recipientConnection) {
						recipientConnection.webSocket.send(JSON.stringify({
							type: "new_message",
							message: { ...message, sender_username: connectionInfo.email },
						}));
					}

					// Send back to sender
					server.send(JSON.stringify({
						type: "new_message",
						message: { ...message, sender_username: connectionInfo.email },
					}));
					return;
				}

				// Handle group message
				if (data.type === "group") {
					if (!data.to || !data.content) {
						server.send(JSON.stringify({ type: "error", message: "Missing group_id or content" }));
						return;
					}

					const groupId = data.to;

					// Verify group exists and user is a member
					const membership = await this.env.DB.prepare(
						"SELECT id FROM group_members WHERE group_id = ? AND user_id = ?"
					).bind(groupId, connectionInfo.userId).first();

					if (!membership) {
						server.send(JSON.stringify({ type: "error", message: "You are not a member of this group" }));
						return;
					}

					// Save message to database
					const result = await this.env.DB.prepare(`
						INSERT INTO messages (sender_id, group_id, content)
						VALUES (?, ?, ?)
					`).bind(connectionInfo.userId, groupId, data.content).run();

					if (!result.success) {
						server.send(JSON.stringify({ type: "error", message: "Failed to save message" }));
						return;
					}

					// Get the saved message with sender info
					const message = await this.env.DB.prepare(`
						SELECT m.id, m.sender_id, m.group_id, m.content, m.created_at, u.username as sender_username
						FROM messages m
						JOIN users u ON m.sender_id = u.id
						WHERE m.id = ?
					`).bind(result.meta.last_row_id).first();

					// Get all group members
					const members = await this.env.DB.prepare(`
						SELECT user_id FROM group_members WHERE group_id = ?
					`).bind(groupId).all();

					// Broadcast to all group members who are online IN THIS DURABLE OBJECT
					const memberIds = (members.results || []).map((m: any) => m.user_id);
					console.log(`📢 Broadcasting group message to ${memberIds.length} members`);
					
					for (const memberId of memberIds) {
						const memberConnection = this.connections.get(memberId);
						if (memberConnection) {
							console.log(`📤 Sending to member ${memberId}`);
							memberConnection.webSocket.send(JSON.stringify({
								type: "new_message",
								message: message,
							}));
						}
					}

					return;
				}

			} catch (error) {
				console.error("WebSocket message error:", error);
				const errorMessage = error instanceof Error ? error.message : "Internal server error";
				try {
					server.send(JSON.stringify({ type: "error", message: errorMessage }));
				} catch (sendError) {
					console.error("Failed to send error message:", sendError);
				}
			}
		});

		server.addEventListener("close", async () => {
			if (connectionInfo) {
				console.log(`👋 User ${connectionInfo.userId} disconnected from DO`);
				this.connections.delete(connectionInfo.userId);
				await this.env.ONLINE_STATUS.delete(`online:user:${connectionInfo.userId}`);
			}
		});

		server.addEventListener("error", (event) => {
			console.error("❌ WebSocket error in DO:", event);
			if (connectionInfo) {
				this.connections.delete(connectionInfo.userId);
			}
		});

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}
}
