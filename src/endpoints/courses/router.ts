import { Hono } from "hono";
import { fromHono } from "chanfana";
import { CourseList } from "./courseList";
import { CourseCreate } from "./courseCreate";
import { CourseRead } from "./courseRead";
import { CourseUpdate } from "./courseUpdate";
import { CourseDelete } from "./courseDelete";

const coursesApp = new Hono<{ Bindings: Env }>();
export const coursesRouter = fromHono(coursesApp, {
	schema: {
		tags: [{ name: "Courses" }],
	},
});

coursesRouter.get("/", CourseList);
coursesRouter.post("/", CourseCreate);
coursesRouter.get("/:id", CourseRead);
coursesRouter.put("/:id", CourseUpdate);
coursesRouter.delete("/:id", CourseDelete);
