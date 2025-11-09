import { D1DeleteEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { CourseModel } from "./base";

export class CourseDelete extends D1DeleteEndpoint<HandleArgs> {
	_meta = {
		model: CourseModel,
		tags: ["Courses"],
		summary: "Delete course",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Courses"],
		};
	}
}
