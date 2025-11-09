import { Hono } from "hono";
import { fromHono } from "chanfana";
import { UserList } from "./userList";
import { UserCreate } from "./userCreate";
import { UserRead } from "./userRead";
import { UserUpdate } from "./userUpdate";
import { UserDelete } from "./userDelete";
import { UserRegister } from "./userRegister";
import { UserLogin } from "./userLogin";
import { UserChangePassword } from "./userChangePassword";
import { UserProfile } from "./userProfile";
import { UserMatchSearch } from "./userMatchSearch";
import { SmartMatchSearch } from "./smartMatchSearch";

// Users Router
const usersApp = new Hono<{ Bindings: Env }>();
export const usersRouter = fromHono(usersApp, {});

// Basic CRUD operations  
usersRouter.get("/", UserList);
usersRouter.post("/", UserCreate);
usersRouter.get("/:id", UserRead);
usersRouter.put("/:id", UserUpdate);
usersRouter.delete("/:id", UserDelete);

// Extended user features
usersRouter.get("/:id/profile", UserProfile);
usersRouter.post("/:id/change-password", UserChangePassword);

// Auth Router
const authApp = new Hono<{ Bindings: Env }>();
export const authRouter = fromHono(authApp, {
	schema: {
		tags: [{ name: "Authentication" }],
	},
});
authRouter.post("/register", UserRegister);
authRouter.post("/login", UserLogin);

// Search Router
const searchApp = new Hono<{ Bindings: Env }>();
export const searchRouter = fromHono(searchApp, {
	schema: {
		tags: [{ name: "Search" }],
	},
});
searchRouter.get("/match", UserMatchSearch); // Legacy search (simple filtering)
searchRouter.get("/smart", SmartMatchSearch); // Smart algorithm (recommended)
