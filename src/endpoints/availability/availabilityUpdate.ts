import { D1UpdateEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { AvailabilityModel } from "./base";

export class AvailabilityUpdate extends D1UpdateEndpoint<HandleArgs> {
	_meta = {
		model: AvailabilityModel,
		fields: AvailabilityModel.schema.pick({
			weekday: true,
			time_slot: true,
		}),
		tags: ["Availability"],
		summary: "Update availability",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Availability"],
		};
	}
}
