import { D1DeleteEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { AvailabilityModel } from "./base";

export class AvailabilityDelete extends D1DeleteEndpoint<HandleArgs> {
	_meta = {
		model: AvailabilityModel,
		tags: ["Availability"],
		summary: "Remove availability",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Availability"],
		};
	}
}
