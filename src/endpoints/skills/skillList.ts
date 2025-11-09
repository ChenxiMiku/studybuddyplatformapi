import { D1ListEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { SkillModel } from "./base";

export class SkillList extends D1ListEndpoint<HandleArgs> {
	_meta = {
		model: SkillModel,
		tags: ["Skills"],
		summary: "List skills",
		description: "Get all available skills (preset list for matching)",
	};

	searchFields = ["skill_name"];
	defaultOrderBy = "skill_name ASC";

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Skills"],
		};
	}
}
