import { D1UpdateEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { CourseModel } from "./base";

export class CourseUpdate extends D1UpdateEndpoint<HandleArgs> {
	_meta = {
		model: CourseModel,
		fields: CourseModel.schema.pick({
			course_name: true,
		}),
		tags: ["Courses"],
		summary: "Update course",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Courses"],
		};
	}
}
