import { D1DeleteEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { UserModel } from "./base";

export class UserDelete extends D1DeleteEndpoint<HandleArgs> {
	_meta = {
		model: UserModel,
		tags: ["Users"],
		summary: "Delete user",
		description: "Delete a user account. This will cascade delete all related courses, skills, and availability. Admin function.",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Users"],
		};
	}
}
