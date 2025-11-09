import { OpenAPIRoute } from "chanfana";
import { Context } from "hono";
import { z } from "zod";

/**
 * Base configuration for Study Groups endpoints
 */
export const StudyGroupsTag = "Study Groups";

/**
 * Common Zod schemas for Study Groups
 */
export const StudyGroupSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().nullable(),
	cover_image_url: z.string().nullable(),
	created_by_user_id: z.number(),
	is_private: z.number().transform(val => val === 1),
	created_at: z.string(),
	updated_at: z.string(),
});

export const GroupMemberSchema = z.object({
	id: z.number(),
	group_id: z.number(),
	user_id: z.number(),
	role: z.enum(["admin", "member"]),
	status: z.enum(["pending", "active", "rejected"]),
	joined_at: z.string(),
});

export const StudyGroupWithMembersSchema = StudyGroupSchema.extend({
	member_count: z.number(),
	members: z.array(z.object({
		user_id: z.number(),
		username: z.string(),
		email: z.string(),
		role: z.enum(["admin", "member"]),
		status: z.enum(["pending", "active", "rejected"]),
		joined_at: z.string(),
	})).optional(),
});

/**
 * Type definitions
 */
export type StudyGroup = z.infer<typeof StudyGroupSchema>;
export type GroupMember = z.infer<typeof GroupMemberSchema>;
export type StudyGroupWithMembers = z.infer<typeof StudyGroupWithMembersSchema>;

/**
 * Base class for Study Groups endpoints
 */
export abstract class StudyGroupsEndpoint extends OpenAPIRoute {
	/**
	 * Helper method to check if a user is a group admin
	 */
	protected async isGroupAdmin(
		c: Context,
		groupId: number,
		userId: number
	): Promise<boolean> {
		const result = await (c.env as any).DB
			.prepare(
				"SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND status = 'active'"
			)
			.bind(groupId, userId)
			.first();

		return result?.role === "admin";
	}

	/**
	 * Helper method to check if a user is a group member
	 */
	protected async isGroupMember(
		c: Context,
		groupId: number,
		userId: number
	): Promise<boolean> {
		const result = await (c.env as any).DB
			.prepare(
				"SELECT id FROM group_members WHERE group_id = ? AND user_id = ? AND status = 'active'"
			)
			.bind(groupId, userId)
			.first();

		return !!result;
	}

	/**
	 * Helper method to get group by ID
	 */
	protected async getGroupById(
		c: Context,
		groupId: number
	): Promise<any | null> {
		const result = await (c.env as any).DB
			.prepare("SELECT * FROM study_groups WHERE id = ?")
			.bind(groupId)
			.first();

		return result || null;
	}
}
