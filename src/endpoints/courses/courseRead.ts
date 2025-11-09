import { D1ReadEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { CourseModel } from "./base";

export class CourseRead extends D1ReadEndpoint<HandleArgs> {
	_meta = {
		model: CourseModel,
		tags: ["Courses"],
		summary: "Get course by ID",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Courses"],
		};
	}
}
