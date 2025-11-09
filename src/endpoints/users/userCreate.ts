import { D1CreateEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { UserModel } from "./base";

export class UserCreate extends D1CreateEndpoint<HandleArgs> {
	_meta = {
		model: UserModel,
		fields: UserModel.schema.pick({
			username: true,
			email: true,
			password_hash: true,
			goals: true,
			study_preference: true,
		}),
		tags: ["Users"],
		summary: "Create a new user",
		description: "Create a new user record. For regular user registration, use /auth/register endpoint.",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Users"],
		};
	}
}
