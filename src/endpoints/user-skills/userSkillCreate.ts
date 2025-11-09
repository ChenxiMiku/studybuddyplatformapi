import { D1CreateEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { UserSkillModel } from "./base";

export class UserSkillCreate extends D1CreateEndpoint<HandleArgs> {
	_meta = {
		model: UserSkillModel,
		fields: UserSkillModel.schema.pick({
			user_id: true,
			skill_id: true,
			proficiency_level: true,
		}),
		tags: ["User Skills"],
		summary: "Add skill to user",
		description: "Associate a skill with a user and set proficiency level",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["User Skills"],
		};
	}
}
