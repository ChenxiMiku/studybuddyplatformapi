import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { usersRouter, authRouter, searchRouter } from "./endpoints/users/router";
import { coursesRouter } from "./endpoints/courses/router";
import { skillsRouter } from "./endpoints/skills/router";
import { userSkillsRouter } from "./endpoints/user-skills/router";
import { availabilityRouter } from "./endpoints/availability/router";
import { ContentfulStatusCode } from "hono/utils/http-status";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

app.onError((err, c) => {
	if (err instanceof ApiException) {
		// If it's a Chanfana ApiException, let Chanfana handle the response
		return c.json(
			{ success: false, errors: err.buildResponse() },
			err.status as ContentfulStatusCode,
		);
	}

	console.error("Global error handler caught:", err); // Log the error if it's not known

	// For other errors, return a generic 500 response
	return c.json(
		{
			success: false,
			errors: [{ code: 7000, message: "Internal Server Error" }],
		},
		500,
	);
});

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
	schema: {
		info: {
			title: "Study Buddy Platform API",
			version: "2.0.0",
			description: "API for Study Buddy Platform - Connecting learners through shared courses, skills, and availability. Features include user authentication, profile management, course tracking, skill matching, and study buddy recommendations.",
		},
		tags: [
			{ name: "Authentication", description: "🔐 User registration and login" },
			{ name: "Users", description: "👤 User profile management and CRUD operations" },
			{ name: "Search", description: "🔍 Study buddy matching and search algorithms" },
			{ name: "Courses", description: "📚 Course management - Track user's enrolled courses" },
			{ name: "Skills", description: "🎯 Skill management - Manage available skills" },
			{ name: "User Skills", description: "🔗 User-skill associations - Connect users with their skills" },
			{ name: "Availability", description: "📅 Availability management - Track user's available time slots" },
		],
	},
});

// Authentication routes
openapi.route("/auth", authRouter);

// User Management routes
openapi.route("/users", usersRouter);

// Resource Management routes
openapi.route("/courses", coursesRouter);
openapi.route("/skills", skillsRouter);
openapi.route("/user-skills", userSkillsRouter);
openapi.route("/availability", availabilityRouter);

// Search and matching routes
openapi.route("/search", searchRouter);

// Export the Hono app
export default app;
