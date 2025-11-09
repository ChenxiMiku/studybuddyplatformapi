import { D1DeleteEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { SkillModel } from "./base";

export class SkillDelete extends D1DeleteEndpoint<HandleArgs> {
	_meta = {
		model: SkillModel,
		tags: ["Skills"],
		summary: "Delete skill",
		description: "Remove a skill from the system (admin operation)",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Skills"],
		};
	}
}
