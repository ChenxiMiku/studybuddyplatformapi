import { D1UpdateEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { UserModel } from "./base";

export class UserUpdate extends D1UpdateEndpoint<HandleArgs> {
	_meta = {
		model: UserModel,
		fields: UserModel.schema.pick({
			username: true,
			email: true,
			password_hash: true,
			bio: true,
			avatar_url: true,
			goals: true,
			study_preference: true,
		}),
		tags: ["Users"],
		summary: "Update user information",
		description: "Update user profile information including bio and avatar. To change password, use /users/:id/change-password endpoint.",
	};

	getSchema() {
		const schema = super.getSchema();
		return {
			...schema,
			tags: ["Users"],
		};
	}
}
