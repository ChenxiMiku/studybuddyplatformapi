import { D1UpdateEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { SkillModel } from "./base";

export class SkillUpdate extends D1UpdateEndpoint<HandleArgs> {
	_meta = {
		model: SkillModel,
		fields: SkillModel.schema.pick({
			skill_name: true,
		}),
		tags: ["Skills"],
		summary: "Update skill",
		description: "Update skill name (admin operation)",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Skills"],
		};
	}
}
