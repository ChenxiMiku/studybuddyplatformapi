import { D1CreateEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { SkillModel } from "./base";

export class SkillCreate extends D1CreateEndpoint<HandleArgs> {
	_meta = {
		model: SkillModel,
		fields: SkillModel.schema.pick({
			skill_name: true,
		}),
		tags: ["Skills"],
		summary: "Add new skill (Admin)",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Skills"],
		};
	}
}
