import { D1CreateEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { AvailabilityModel } from "./base";

export class AvailabilityCreate extends D1CreateEndpoint<HandleArgs> {
	_meta = {
		model: AvailabilityModel,
		fields: AvailabilityModel.schema.pick({
			user_id: true,
			weekday: true,
			time_slot: true,
		}),
		tags: ["Availability"],
		summary: "Add availability time",
		description: "Add a time slot when the user is available (weekday: 0=Sun, 6=Sat)",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Availability"],
		};
	}
}
