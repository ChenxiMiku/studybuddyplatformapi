import { D1ListEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { UserSkillModel } from "./base";

export class UserSkillList extends D1ListEndpoint<HandleArgs> {
	_meta = {
		model: UserSkillModel,
		tags: ["User Skills"],
		summary: "List user skills",
		description: "Get user-skill associations. Filter by user_id to get a specific user's skills.",
	};

	defaultOrderBy = "id DESC";

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["User Skills"],
		};
	}
}
