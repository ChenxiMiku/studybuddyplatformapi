import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { usersRouter, authRouter, searchRouter } from "./endpoints/users/router";
import { coursesRouter } from "./endpoints/courses/router";
import { skillsRouter } from "./endpoints/skills/router";
import { userSkillsRouter } from "./endpoints/user-skills/router";
import { availabilityRouter } from "./endpoints/availability/router";
import { studyGroupsRouter } from "./endpoints/study-groups/router";
import { messagingRouter } from "./endpoints/messaging/router";
import { FriendRequest } from "./endpoints/friends/friendRequest";
import { FriendAccept } from "./endpoints/friends/friendAccept";
import { FriendReject } from "./endpoints/friends/friendReject";
import { FriendDelete } from "./endpoints/friends/friendDelete";
import { FriendsList } from "./endpoints/friends/friendsList";
import { FriendsRequests } from "./endpoints/friends/friendsRequests";
import { handleWebSocket } from "./endpoints/messaging/websocket";
import { ContentfulStatusCode } from "hono/utils/http-status";
import type { Env } from "./types";

// Helper function to check if a path is an API route
function isApiRoute(path: string): boolean {
	return path.startsWith("/api/") || 
	       path.startsWith("/ws") || 
	       path.startsWith("/docs") ||
	       path.startsWith("/openapi") || // OpenAPI JSON/YAML files
	       path.startsWith("/playground");
}

// Helper function to serve index.html for SPA routing
async function serveIndexHtml(c: any): Promise<Response> {
	try {
		const url = new URL(c.req.url);
		url.pathname = "/index.html";
		const indexHtml = await c.env.ASSETS.fetch(url.toString());
		
		if (indexHtml.ok) {
			return new Response(indexHtml.body, {
				status: 200,
				headers: {
					"Content-Type": "text/html; charset=utf-8",
					"Cache-Control": "no-cache",
				},
			});
		}
	} catch (error) {
		console.error("Failed to serve index.html:", error);
	}
	
	return new Response("Not Found", { status: 404 });
}

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Global middleware to handle static assets and SPA routing BEFORE any other routes
app.use("*", async (c, next) => {
	const path = new URL(c.req.url).pathname;
	
	// Skip middleware for API routes - let them pass through to OpenAPI
	if (isApiRoute(path)) {
		return next();
	}
	
	// For root path or paths without extension, serve index.html (SPA)
	if (path === "/" || !path.includes(".")) {
		return serveIndexHtml(c);
	}
	
	// For static assets (files with extensions like .js, .css, .png, etc.)
	if (path.includes(".")) {
		try {
			const assetResponse = await c.env.ASSETS.fetch(c.req.raw);
			if (assetResponse.ok) {
				return assetResponse;
			}
		} catch (error) {
			console.error("Failed to serve static asset:", path, error);
		}
		// If asset not found, try serving index.html (might be a client route with dots)
		return serveIndexHtml(c);
	}
	
	// Continue to next middleware
	return next();
});

// WebSocket endpoint for real-time messaging - use Durable Object
app.get("/ws", async (c) => {
	// Get or create a Durable Object ID (using a fixed ID for single global chat room)
	const id = c.env.CHAT_ROOM.idFromName("global-chat-room");
	const stub = c.env.CHAT_ROOM.get(id);
	return stub.fetch(c.req.raw);
});

// Custom 404 handler for API routes
app.notFound(async (c) => {
	const path = new URL(c.req.url).pathname;
	
	// For API routes, return JSON 404
	if (isApiRoute(path)) {
		return c.json({ error: "Not Found" }, 404);
	}
	
	// For all other routes, serve index.html (SPA fallback)
	return serveIndexHtml(c);
});

app.onError((err, c) => {
	if (err instanceof ApiException) {
		// If it's a Chanfana ApiException, let Chanfana handle the response
		return c.json(
			{ success: false, errors: err.buildResponse() },
			err.status as ContentfulStatusCode,
		);
	}

	console.error("Global error handler caught:", err); // Log the error if it's not known

	// For other errors, return a generic 500 response
	return c.json(
		{
			success: false,
			errors: [{ code: 7000, message: "Internal Server Error" }],
		},
		500,
	);
});

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/docs",
	schema: {
		openapi: "3.1.0",
		info: {
			title: "Study Buddy Platform API",
			version: "2.0.0",
			description: "API for Study Buddy Platform - Connecting learners through shared courses, skills, and availability. Features include user authentication, profile management, course tracking, skill matching, and study buddy recommendations.",
		},
		tags: [
			{ name: "Authentication", description: "🔐 User registration and login" },
			{ name: "Users", description: "👤 User profile management and CRUD operations" },
			{ name: "Search", description: "🔍 Study buddy matching and search algorithms" },
			{ name: "Study Groups", description: "👥 Study group management - Create, join, and manage learning groups" },
			{ name: "Messages", description: "💬 Real-time messaging - Private and group chat with online status" },
			{ name: "Friends", description: "🤝 Friend management - Add, accept, reject, and remove friends" },
			{ name: "Courses", description: "📚 Course management - Track user's enrolled courses" },
			{ name: "Skills", description: "🎯 Skill management - Manage available skills" },
			{ name: "User Skills", description: "🔗 User-skill associations - Connect users with their skills" },
			{ name: "Availability", description: "📅 Availability management - Track user's available time slots" },
		],
	},
});

// Handle /playground route separately
app.get("/playground", (c) => {
	return c.html('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Study Buddy Playground</title><meta name="viewport" content="width=device-width,initial-scale=1"/><style>body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;margin:0;padding:1.25rem;background:#f5f7fb}h1{margin-top:0}section{background:#fff;border-radius:8px;padding:1rem 1.25rem;margin-bottom:1rem;box-shadow:0 1px 4px rgba(0,0,0,.08)}fieldset{border:1px solid #d7dae2;border-radius:6px;padding:.75rem 1rem 1rem;margin:0 0 1rem}legend{font-weight:600}label{display:block;font-size:.85rem;margin:.6rem 0 .25rem}input,select,textarea,button{width:100%;box-sizing:border-box;padding:.5rem .6rem;font:inherit;border:1px solid #c9ced8;border-radius:4px}button{cursor:pointer;margin-top:.6rem;background:#2563eb;color:#fff;font-weight:600;border:none}button.secondary{background:#6b7280}button:disabled{opacity:.55;cursor:not-allowed}.row{display:flex;flex-wrap:wrap;gap:.75rem}.row>div{flex:1 1 12rem}#out{white-space:pre-wrap;background:#111827;color:#e5e7eb;padding:1rem;border-radius:8px;min-height:8rem;font-family:JetBrains Mono,Fira Code,Consolas,monospace;overflow:auto}.badge{background:#eef2ff;color:#1d4ed8;padding:.2rem .45rem;border-radius:4px;font-size:.7rem;display:inline-block;margin-right:.35rem}.bad{background:#fee2e2;color:#b91c1c}</style></head><body><h1>Study Buddy API Playground</h1><p>Open this page via your Worker URL (e.g. https://your-worker.workers.dev/playground). All requests are same-origin.</p><section><fieldset><legend>Auth</legend><form id="regForm" autocomplete="off"><label>Username<input name="username" required minlength="3"></label><label>Email<input name="email" type="email" required></label><label>Password<input name="password" type="password" required minlength="6"></label><label>Goals<textarea name="goals" rows="2"></textarea></label><label>Preference<select name="study_preference"><option value="">(optional)</option><option value="group">Group</option><option value="one-on-one">One-on-one</option><option value="both">Both</option></select></label><button type="submit">Register</button></form><form id="loginForm" autocomplete="off"><label>Username or Email<input name="username_or_email" required></label><label>Password<input name="password" type="password" required></label><button type="submit">Login</button></form><button id="refreshBtn" type="button" style="margin-top:.5rem">Refresh Token</button><div id="tokState" style="margin-top:.5rem"></div></fieldset></section><section><fieldset><legend>Profile & Match</legend><form id="profileForm"><label>User ID<input name="userId" type="number" min="1" required></label><button type="submit">Get Profile</button></form><form id="matchForm"><div class="row"><div><label>User ID<input name="user_id" type="number" min="1" required></label></div><div><label>Course<input name="course"></label></div><div><label>Skill ID<input name="skill_id" type="number" min="1"></label></div></div><div class="row"><div><label>Weekday<input name="weekday" type="number" min="0" max="6"></label></div><div><label>Time Slot<input name="time_slot" placeholder="HH:MM-HH:MM"></label></div><div><label>Preference<select name="study_preference"><option value="">Any</option><option value="group">Group</option><option value="one-on-one">One-on-one</option><option value="both">Both</option></select></label></div></div><button type="submit">Search Match</button></form></fieldset></section><section><fieldset><legend>Output</legend><div id="out"></div></fieldset></section><script>(function(){const S={access:localStorage.getItem("sb-access-token")||"",refresh:localStorage.getItem("sb-refresh-token")||"",uid:localStorage.getItem("sb-user-id")||""};const out=document.getElementById("out");const tokState=document.getElementById("tokState");function showTok(){tokState.innerHTML=(S.access?"<span class=\'badge\'>Access ✓</span>":"<span class=\'badge bad\'>Access ✗</span>")+(S.refresh?"<span class=\'badge\'>Refresh ✓</span>":"<span class=\'badge bad\'>Refresh ✗</span>")+(S.uid?"<span class=\'badge\'>UID "+S.uid+"</span>":"<span class=\'badge bad\'>UID ✗</span>");document.getElementById("refreshBtn").disabled=!S.refresh;}showTok();function log(lbl,data){const t=new Date().toLocaleTimeString();out.textContent="["+t+"] "+lbl+"\\n\\n"+JSON.stringify(data,null,2);localStorage.setItem("sb-last-output",out.textContent);}function restoreOutput(){const last=localStorage.getItem("sb-last-output");if(last){out.textContent=last;}}restoreOutput();async function call(p,m,body,auth){m=m||"GET";const h={"Content-Type":"application/json"};if(auth&&S.access)h.Authorization="Bearer "+S.access;let resObj = null;try{const r=await fetch(p,{method:m,headers:h,body:body?JSON.stringify(body):undefined});const txt=await r.text();let json;try{json=txt?JSON.parse(txt):{};}catch(e){json={raw:txt,parseError:e.message};}if(!r.ok)throw{status:r.status,data:json};resObj = json;log(p+" "+m+" OK",json);}catch(err){log(p+" "+m+" FAIL",err);}return resObj;}document.getElementById("regForm").addEventListener("submit",async e=>{e.preventDefault();const fd=new FormData(e.target);const payload=Object.fromEntries(fd.entries());if(!payload.study_preference)delete payload.study_preference;if(!payload.goals)delete payload.goals;const res=await call("/api/auth/register","POST",payload);if(res&&res.result){S.access=res.result.tokens.accessToken;S.refresh=res.result.tokens.refreshToken;S.uid=res.result.user.id;localStorage.setItem("sb-access-token",S.access);localStorage.setItem("sb-refresh-token",S.refresh);localStorage.setItem("sb-user-id",S.uid);showTok();document.querySelector("#profileForm [name=userId]").value=S.uid;document.querySelector("#matchForm [name=user_id]").value=S.uid;}});document.getElementById("loginForm").addEventListener("submit",async e=>{e.preventDefault();const fd=new FormData(e.target);const payload=Object.fromEntries(fd.entries());const res=await call("/api/auth/login","POST",payload);if(res&&res.result){S.access=res.result.tokens.accessToken;S.refresh=res.result.tokens.refreshToken;S.uid=res.result.user.id;localStorage.setItem("sb-access-token",S.access);localStorage.setItem("sb-refresh-token",S.refresh);localStorage.setItem("sb-user-id",S.uid);showTok();document.querySelector("#profileForm [name=userId]").value=S.uid;document.querySelector("#matchForm [name=user_id]").value=S.uid;}});document.getElementById("refreshBtn").addEventListener("click",async()=>{if(!S.refresh)return;const res=await call("/api/auth/refresh","POST",{refreshToken:S.refresh});if(res&&res.result){S.access=res.result.tokens.accessToken;S.refresh=res.result.tokens.refreshToken;localStorage.setItem("sb-access-token",S.access);localStorage.setItem("sb-refresh-token",S.refresh);showTok();}});document.getElementById("profileForm").addEventListener("submit",async e=>{e.preventDefault();const id=e.target.userId.value.trim();if(!id)return;await call("/api/users/"+id+"/profile","GET",undefined,true);});document.getElementById("matchForm").addEventListener("submit",async e=>{e.preventDefault();const fd=new FormData(e.target);const ps=new URLSearchParams();for(const [k,v] of fd.entries())if(v)ps.append(k,v);await call("/api/search/match?"+ps.toString(),"GET",undefined,true);});if(S.uid){document.querySelector("#profileForm [name=userId]").value=S.uid;document.querySelector("#matchForm [name=user_id]").value=S.uid;}})();</script></body></html>');
});

// Authentication routes
openapi.route("/api/auth", authRouter);

// User Management routes
openapi.route("/api/users", usersRouter);

// Study Groups routes
openapi.route("/api/groups", studyGroupsRouter);

// Messaging routes
openapi.route("/api/messages", messagingRouter);

// Friends routes
openapi.post('/api/friends/request', FriendRequest);
openapi.post('/api/friends/:id/accept', FriendAccept);
openapi.post('/api/friends/:id/reject', FriendReject);
openapi.delete('/api/friends/:id', FriendDelete);
openapi.get('/api/friends/requests', FriendsRequests); // More specific route first
openapi.get('/api/friends', FriendsList);

// Resource Management routes
openapi.route("/api/courses", coursesRouter);
openapi.route("/api/skills", skillsRouter);
openapi.route("/api/user-skills", userSkillsRouter);
openapi.route("/api/availability", availabilityRouter);

// Search and matching routes
openapi.route("/api/search", searchRouter);

// Register OpenAPI routes on the main app
app.route("/", openapi);

// Export the Hono app
export default app;

// Export Durable Object
export { ChatRoom } from "./durable-objects/ChatRoom";
