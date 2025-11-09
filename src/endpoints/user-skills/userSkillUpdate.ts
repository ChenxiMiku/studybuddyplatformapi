import { D1UpdateEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { UserSkillModel } from "./base";

export class UserSkillUpdate extends D1UpdateEndpoint<HandleArgs> {
	_meta = {
		model: UserSkillModel,
		fields: UserSkillModel.schema.pick({
			proficiency_level: true,
		}),
		tags: ["User Skills"],
		summary: "Update skill proficiency",
		description: "Update user's proficiency level for a specific skill",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["User Skills"],
		};
	}
}
