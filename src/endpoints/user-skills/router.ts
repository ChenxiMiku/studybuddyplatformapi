import { Hono } from "hono";
import { fromHono } from "chanfana";
import { UserSkillList } from "./userSkillList";
import { UserSkillCreate } from "./userSkillCreate";
import { UserSkillRead } from "./userSkillRead";
import { UserSkillUpdate } from "./userSkillUpdate";
import { UserSkillDelete } from "./userSkillDelete";

const userSkillsApp = new Hono<{ Bindings: Env }>();
export const userSkillsRouter = fromHono(userSkillsApp, {
	schema: {
		tags: [{ name: "User Skills" }],
	},
});

userSkillsRouter.get("/", UserSkillList);
userSkillsRouter.post("/", UserSkillCreate);
userSkillsRouter.get("/:id", UserSkillRead);
userSkillsRouter.put("/:id", UserSkillUpdate);
userSkillsRouter.delete("/:id", UserSkillDelete);
