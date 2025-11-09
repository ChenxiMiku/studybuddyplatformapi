import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../../src/index";

describe("Users API", () => {
	let env: Env;

	beforeAll(async () => {
		env = getMiniflareBindings();
	});

	afterAll(async () => {
		// Cleanup if needed
	});

	it("should create a new user", async () => {
		const res = await app.request(
			"/users",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: "test_user",
					email: "test@example.com",
					password_hash: "hashed_password_123",
					goals: "Learn TypeScript and React",
					study_preference: "group",
				}),
			},
			env,
		);

		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.result).toBeDefined();
		expect(data.result.username).toBe("test_user");
	});

	it("should list users", async () => {
		const res = await app.request("/users", {}, env);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.result).toBeDefined();
		expect(Array.isArray(data.result)).toBe(true);
	});

	it("should get a single user", async () => {
		// First create a user
		const createRes = await app.request(
			"/users",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: "test_user_2",
					email: "test2@example.com",
					password_hash: "hashed_password_456",
					goals: "Learn Python",
					study_preference: "one-on-one",
				}),
			},
			env,
		);

		const createData = await createRes.json();
		const userId = createData.result.id;

		// Now get the user
		const res = await app.request(`/users/${userId}`, {}, env);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.result.id).toBe(userId);
		expect(data.result.username).toBe("test_user_2");
	});

	it("should update a user", async () => {
		// First create a user
		const createRes = await app.request(
			"/users",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: "test_user_3",
					email: "test3@example.com",
					password_hash: "hashed_password_789",
					goals: "Original goals",
					study_preference: "both",
				}),
			},
			env,
		);

		const createData = await createRes.json();
		const userId = createData.result.id;

		// Update the user
		const res = await app.request(
			`/users/${userId}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					goals: "Updated learning goals",
					study_preference: "group",
				}),
			},
			env,
		);

		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.result.goals).toBe("Updated learning goals");
		expect(data.result.study_preference).toBe("group");
	});

	it("should delete a user", async () => {
		// First create a user
		const createRes = await app.request(
			"/users",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: "test_user_delete",
					email: "delete@example.com",
					password_hash: "hashed_password_000",
					goals: "To be deleted",
					study_preference: "both",
				}),
			},
			env,
		);

		const createData = await createRes.json();
		const userId = createData.result.id;

		// Delete the user
		const res = await app.request(
			`/users/${userId}`,
			{
				method: "DELETE",
			},
			env,
		);

		expect(res.status).toBe(200);

		// Verify user is deleted
		const getRes = await app.request(`/users/${userId}`, {}, env);
		expect(getRes.status).toBe(404);
	});
});

function getMiniflareBindings(): Env {
	// This would be implemented based on your test setup
	// For now, return a mock
	return {} as Env;
}
