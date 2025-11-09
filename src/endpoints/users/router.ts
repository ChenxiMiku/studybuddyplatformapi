import { Hono } from "hono";
import { fromHono } from "chanfana";
import { UserList } from "./userList";
import { UserCreate } from "./userCreate";
import { UserRead } from "./userRead";
import { UserUpdate } from "./userUpdate";
import { UserDelete } from "./userDelete";
import { UserRegister } from "./userRegister";
import { UserLogin } from "./userLogin";
import { TokenRefresh } from "./tokenRefresh";
import { UserChangePassword } from "./userChangePassword";
import { UserProfile } from "./userProfile";
import { UserCurrentProfile } from "./userCurrentProfile";
import { UserCurrentUpdate } from "./userCurrentUpdate";
import { UserMatchSearch } from "./userMatchSearch";
import { SmartMatchSearch } from "./smartMatchSearch";

// Users Router
const usersApp = new Hono<{ Bindings: Env }>();
export const usersRouter = fromHono(usersApp, {});

// Basic CRUD operations  
usersRouter.get("/", UserList);
usersRouter.post("/", UserCreate);

// Extended user features (specific routes MUST be before parameterized routes)
usersRouter.get("/profile", UserCurrentProfile); // Current user profile - must be before /:id
usersRouter.put("/profile", UserCurrentUpdate); // Update current user profile - must be before /:id
usersRouter.post("/change-password", UserChangePassword); // Change current user password - must be before /:id

// Parameterized routes (MUST be last to avoid matching specific routes)
usersRouter.get("/:id", UserRead);
usersRouter.put("/:id", UserUpdate);
usersRouter.delete("/:id", UserDelete);
usersRouter.get("/:id/profile", UserProfile); // Get specific user profile
usersRouter.post("/:id/change-password", UserChangePassword); // Legacy - kept for compatibility

// Auth Router
const authApp = new Hono<{ Bindings: Env }>();
export const authRouter = fromHono(authApp, {
	schema: {
		tags: [{ name: "Authentication" }],
	},
});
authRouter.post("/register", UserRegister);
authRouter.post("/login", UserLogin);
authRouter.post("/refresh", TokenRefresh);

// Search Router
const searchApp = new Hono<{ Bindings: Env }>();
export const searchRouter = fromHono(searchApp, {
	schema: {
		tags: [{ name: "Search" }],
	},
});
searchRouter.get("/match", UserMatchSearch); // Legacy search (simple filtering)
searchRouter.get("/smart", SmartMatchSearch); // Smart algorithm (recommended)
