// Messaging router
import { Hono } from "hono";
import { fromHono } from "chanfana";
import { MessageHistoryPrivate } from "./historyPrivate";
import { MessageHistoryGroup } from "./historyGroup";
import { MessageSendPrivate } from "./sendPrivate";
import { MessageSendGroup } from "./sendGroup";
import { OnlineStatus } from "./onlineStatus";

const messagingApp = new Hono<{ Bindings: Env }>();
export const messagingRouter = fromHono(messagingApp, {
	schema: {
		tags: [{ name: "Messages" }],
	},
});

// Message history endpoints
messagingRouter.get("/user/:peerId", MessageHistoryPrivate);
messagingRouter.get("/group/:groupId", MessageHistoryGroup);

// Send message endpoints
messagingRouter.post("/user", MessageSendPrivate);
messagingRouter.post("/group", MessageSendGroup);

// Online status endpoint
messagingRouter.get("/online", OnlineStatus);
