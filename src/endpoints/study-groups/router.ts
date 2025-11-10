import { Hono } from "hono";
import { fromHono } from "chanfana";
import { GroupCreate } from "./groupCreate";
import { GroupList } from "./groupList";
import { GroupRead } from "./groupRead";
import { GroupUpdate } from "./groupUpdate";
import { GroupDelete } from "./groupDelete";
import { GroupJoin } from "./groupJoin";
import { GroupLeave } from "./groupLeave";
import { GroupManageMember } from "./groupManageMember";

// Study Groups Router
const studyGroupsApp = new Hono<{ Bindings: Env }>();
export const studyGroupsRouter = fromHono(studyGroupsApp, {
	schema: {
		tags: [{ name: "Study Groups", description: "👥 Study group management - Create, join, and manage learning groups" }],
	},
});

// CRUD operations
studyGroupsRouter.post("/", GroupCreate);
studyGroupsRouter.get("/", GroupList);
studyGroupsRouter.get("/:id", GroupRead);
studyGroupsRouter.put("/:id", GroupUpdate);
studyGroupsRouter.delete("/:id", GroupDelete);

// Membership operations
studyGroupsRouter.post("/:id/join", GroupJoin);
studyGroupsRouter.post("/:id/leave", GroupLeave);
studyGroupsRouter.put("/:id/members/:userId", GroupManageMember);
