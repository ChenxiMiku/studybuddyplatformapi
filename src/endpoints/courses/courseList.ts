import { D1ListEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { CourseModel } from "./base";

export class CourseList extends D1ListEndpoint<HandleArgs> {
	_meta = {
		model: CourseModel,
		tags: ["Courses"],
		summary: "List courses",
		description: "Get a paginated list of courses. Can be filtered by user_id.",
	};

	searchFields = ["course_name"];
	defaultOrderBy = "id DESC";

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Courses"],
		};
	}
}
