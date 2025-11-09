import { Hono } from "hono";
import { fromHono } from "chanfana";
import { AvailabilityList } from "./availabilityList";
import { AvailabilityCreate } from "./availabilityCreate";
import { AvailabilityRead } from "./availabilityRead";
import { AvailabilityUpdate } from "./availabilityUpdate";
import { AvailabilityDelete } from "./availabilityDelete";

const availabilityApp = new Hono<{ Bindings: Env }>();
export const availabilityRouter = fromHono(availabilityApp, {
	schema: {
		tags: [{ name: "Availability" }],
	},
});

availabilityRouter.get("/", AvailabilityList);
availabilityRouter.post("/", AvailabilityCreate);
availabilityRouter.get("/:id", AvailabilityRead);
availabilityRouter.put("/:id", AvailabilityUpdate);
availabilityRouter.delete("/:id", AvailabilityDelete);
