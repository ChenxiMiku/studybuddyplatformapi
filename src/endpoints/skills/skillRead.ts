import { D1ReadEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { SkillModel } from "./base";

export class SkillRead extends D1ReadEndpoint<HandleArgs> {
	_meta = {
		model: SkillModel,
		tags: ["Skills"],
		summary: "Get skill details",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Skills"],
		};
	}
}
