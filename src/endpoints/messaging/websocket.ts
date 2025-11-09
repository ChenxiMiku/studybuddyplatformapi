// WebSocket handler for real-time messaging
import { verifyToken } from "../../utils/jwt";
import type { Env } from "../../types";

interface WebSocketMessage {
	type: "private" | "group" | "heartbeat" | "auth";
	to?: number;  // userId for private, groupId for group
	content?: string;
	token?: string;
}

interface ConnectionInfo {
	userId: number;
	email: string;
	webSocket: WebSocket;
}

// Store active connections (in production, use Durable Objects for multi-instance support)
const connections = new Map<number, ConnectionInfo>();

export async function handleWebSocket(request: Request, env: Env): Promise<Response> {
	const upgradeHeader = request.headers.get("Upgrade");
	if (!upgradeHeader || upgradeHeader !== "websocket") {
		console.log("❌ WebSocket upgrade failed: missing Upgrade header");
		return new Response("Expected Upgrade: websocket", { status: 426 });
	}

	console.log("🔌 New WebSocket connection request");

	// Create WebSocket pair
	const pair = new WebSocketPair();
	const [client, server] = Object.values(pair);

	let connectionInfo: ConnectionInfo | null = null;

	// Handle WebSocket events
	server.accept();
	console.log("✅ WebSocket connection accepted");

	server.addEventListener("message", async (event: MessageEvent) => {
		try {
			const data = JSON.parse(event.data as string) as WebSocketMessage;

			// Handle authentication
			if (data.type === "auth") {
				if (!data.token) {
					server.send(JSON.stringify({ 
						type: "error", 
						message: "Token required" 
					}));
					server.close(1008, "Authentication required");
					return;
				}

				const payload = await verifyToken(data.token, env.JWT_SECRET, "access");
				if (!payload) {
					server.send(JSON.stringify({ 
						type: "error", 
						message: "Invalid token" 
					}));
					server.close(1008, "Invalid authentication");
					return;
				}

				// Store connection
				connectionInfo = {
					userId: payload.userId,
					email: payload.email,
					webSocket: server,
				};
				connections.set(payload.userId, connectionInfo);
				console.log(`✅ User ${payload.userId} (${payload.email}) connected. Total connections:`, connections.size);
				console.log(`📊 Active user IDs:`, Array.from(connections.keys()));

				// Set user online in KV with 5 minute TTL
				await env.ONLINE_STATUS.put(
					`online:user:${payload.userId}`,
					"true",
					{ expirationTtl: 300 }
				);

				server.send(JSON.stringify({ 
					type: "authenticated", 
					userId: payload.userId 
				}));
				return;
			}

			// Require authentication for other message types
			if (!connectionInfo) {
				server.send(JSON.stringify({ 
					type: "error", 
					message: "Not authenticated" 
				}));
				return;
			}

			// Handle heartbeat to keep connection alive and update online status
			if (data.type === "heartbeat") {
				await env.ONLINE_STATUS.put(
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
					server.send(JSON.stringify({ 
						type: "error", 
						message: "Missing to or content" 
					}));
					return;
				}

				// Save message to database
				const result = await env.DB.prepare(`
					INSERT INTO messages (sender_id, receiver_id, content)
					VALUES (?, ?, ?)
				`).bind(connectionInfo.userId, data.to, data.content).run();

				if (!result.success) {
					server.send(JSON.stringify({ 
						type: "error", 
						message: "Failed to save message" 
					}));
					return;
				}

				// Get the created message
				const message = await env.DB.prepare(`
					SELECT id, sender_id, receiver_id, content, created_at
					FROM messages WHERE id = ?
				`).bind(result.meta.last_row_id).first();

				// Send to recipient if online
				const recipientConnection = connections.get(data.to);
				console.log(`📤 Trying to send message to user ${data.to}, connection found:`, !!recipientConnection);
				console.log(`📊 Active connections:`, Array.from(connections.keys()));
				if (recipientConnection) {
					console.log(`✅ Sending message to recipient ${data.to}`);
					recipientConnection.webSocket.send(JSON.stringify({
						type: "new_message",
						message: {
							...message,
							sender_username: connectionInfo.email,
						},
					}));
				} else {
					console.log(`⚠️ Recipient ${data.to} is not connected`);
				}

				// Also send back to sender so they see their own message immediately
				server.send(JSON.stringify({
					type: "new_message",
					message: {
						...message,
						sender_username: connectionInfo.email,
					},
				}));
				return;
			}

			// Handle group message
			if (data.type === "group") {
				if (!data.to || !data.content) {
					server.send(JSON.stringify({ 
						type: "error", 
						message: "Missing to or content" 
					}));
					return;
				}

				// Verify user is member of group
				const membership = await env.DB.prepare(
					"SELECT id FROM group_members WHERE group_id = ? AND user_id = ?"
				).bind(data.to, connectionInfo.userId).first();

				if (!membership) {
					server.send(JSON.stringify({ 
						type: "error", 
						message: "Not a member of this group" 
					}));
					return;
				}

				// Save message to database
				const result = await env.DB.prepare(`
					INSERT INTO messages (sender_id, group_id, content)
					VALUES (?, ?, ?)
				`).bind(connectionInfo.userId, data.to, data.content).run();

				if (!result.success) {
					server.send(JSON.stringify({ 
						type: "error", 
						message: "Failed to save message" 
					}));
					return;
				}

				// Get the created message
				const message = await env.DB.prepare(`
					SELECT id, sender_id, group_id, content, created_at
					FROM messages WHERE id = ?
				`).bind(result.meta.last_row_id).first();

				// Get all group members
				const { results: members } = await env.DB.prepare(
					"SELECT user_id FROM group_members WHERE group_id = ?"
				).bind(data.to).all();

				// Send to all online group members (including sender)
				for (const member of members as any[]) {
					const memberConnection = connections.get(member.user_id);
					if (memberConnection) {
						memberConnection.webSocket.send(JSON.stringify({
							type: "new_group_message",
							message: {
								...message,
								sender_username: connectionInfo.email,
							},
						}));
					}
				}
				return;
			}

		} catch (error) {
			console.error("WebSocket message error:", error);
			const errorMessage = error instanceof Error ? error.message : "Internal server error";
			console.error("Error details:", errorMessage, "Data received:", event.data);
			try {
				server.send(JSON.stringify({ 
					type: "error", 
					message: errorMessage 
				}));
			} catch (sendError) {
				console.error("Failed to send error message:", sendError);
			}
		}
	});

	server.addEventListener("close", async () => {
		if (connectionInfo) {
			console.log(`👋 User ${connectionInfo.userId} disconnected. Remaining connections:`, connections.size - 1);
			connections.delete(connectionInfo.userId);
			// Set user offline in KV
			await env.ONLINE_STATUS.delete(`online:user:${connectionInfo.userId}`);
		} else {
			console.log("❌ WebSocket closed before authentication");
		}
	});

	server.addEventListener("error", (event) => {
		console.error("❌ WebSocket error:", event);
		if (connectionInfo) {
			console.log(`❌ Error for user ${connectionInfo.userId}, removing connection`);
			connections.delete(connectionInfo.userId);
		}
	});

	return new Response(null, {
		status: 101,
		webSocket: client,
	});
}
