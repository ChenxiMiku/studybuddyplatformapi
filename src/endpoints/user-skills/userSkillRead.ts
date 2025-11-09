import { D1ReadEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { UserSkillModel } from "./base";

export class UserSkillRead extends D1ReadEndpoint<HandleArgs> {
	_meta = {
		model: UserSkillModel,
		tags: ["User Skills"],
		summary: "Get user skill details",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["User Skills"],
		};
	}
}
