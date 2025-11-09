import { D1DeleteEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { UserSkillModel } from "./base";

export class UserSkillDelete extends D1DeleteEndpoint<HandleArgs> {
	_meta = {
		model: UserSkillModel,
		tags: ["User Skills"],
		summary: "Remove skill from user",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["User Skills"],
		};
	}
}
