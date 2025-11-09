import { D1ListEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { UserModel } from "./base";

export class UserList extends D1ListEndpoint<HandleArgs> {
	_meta = {
		model: UserModel,
		tags: ["Users"],
		summary: "List all users",
		description: "Get a paginated list of all users. Supports search and filtering. Admin function.",
	};

	searchFields = ["username", "email", "goals"];
	defaultOrderBy = "id DESC";

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Users"],
		};
	}
}
