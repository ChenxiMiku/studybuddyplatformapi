import { D1ReadEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { UserModel } from "./base";

export class UserRead extends D1ReadEndpoint<HandleArgs> {
	_meta = {
		model: UserModel,
		tags: ["Users"],
		summary: "Get user by ID",
		description: "Get basic user information by user ID. For complete profile, use /users/:id/profile endpoint.",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Users"],
		};
	}
}
