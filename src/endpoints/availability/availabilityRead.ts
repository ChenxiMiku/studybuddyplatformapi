import { D1ReadEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { AvailabilityModel } from "./base";

export class AvailabilityRead extends D1ReadEndpoint<HandleArgs> {
	_meta = {
		model: AvailabilityModel,
		tags: ["Availability"],
		summary: "Get availability by ID",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Availability"],
		};
	}
}
