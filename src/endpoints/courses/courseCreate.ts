import { D1CreateEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { CourseModel } from "./base";

export class CourseCreate extends D1CreateEndpoint<HandleArgs> {
	_meta = {
		model: CourseModel,
		fields: CourseModel.schema.pick({
			user_id: true,
			course_name: true,
		}),
		tags: ["Courses"],
		summary: "Add a new course",
		description: "Users can freely input any course name they are studying.",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Courses"],
		};
	}
}
