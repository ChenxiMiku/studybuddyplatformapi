import { D1ListEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { AvailabilityModel } from "./base";

export class AvailabilityList extends D1ListEndpoint<HandleArgs> {
	_meta = {
		model: AvailabilityModel,
		tags: ["Availability"],
		summary: "List availability",
		description: "Get user availability time slots. Filter by user_id to get a specific user's schedule.",
	};

	defaultOrderBy = "weekday ASC, time_slot ASC";

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Availability"],
		};
	}
}
