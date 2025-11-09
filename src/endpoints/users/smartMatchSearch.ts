import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";
import { 
	calculateMatches, 
	MatchResult, 
	type UserMatchData 
} from "../../utils/matchingAlgorithm";

/**
 * Smart Match Search Endpoint
 * 
 * This endpoint implements the intelligent matching algorithm that:
 * 1. Retrieves the requesting user's profile and preferences
 * 2. Filters candidates based on optional criteria
 * 3. Calculates multi-dimensional compatibility scores
 * 4. Returns ranked results with explanations
 * 
 * Algorithm uses weighted scoring:
 * - Course similarity: 50%
 * - Time overlap: 30%
 * - Skill similarity: 20%
 * - Social balance factor applied for diversity
 */
export class SmartMatchSearch extends OpenAPIRoute {
	public schema = {
		tags: ["Search"],
		summary: "Find compatible study buddies (Smart Algorithm)",
		description: `
			Intelligent matching algorithm that calculates compatibility based on multiple dimensions:
			
			**Scoring Components:**
			- Course Similarity (50%): Measures shared and complementary courses
			- Time Overlap (30%): Finds users with matching availability
			- Skill Similarity (20%): Identifies users with compatible skill sets
			- Social Balance: Encourages diverse recommendations
			
			**Returns:**
			- Top 10 matches ranked by compatibility score
			- Detailed explanations for each match
			- Individual component scores for transparency
		`,
		request: {
			query: z.object({
				user_id: z.string()
					.transform(Number)
					.describe("Current user ID (required for personalized matching)"),
				min_score: z.string()
					.transform(Number)
					.default("10")
					.describe("Minimum compatibility score threshold (0-100)"),
				limit: z.string()
					.transform(Number)
					.default("10")
					.describe("Maximum number of results to return"),
			}),
		},
		responses: {
			"200": {
				description: "Successfully calculated matches with compatibility scores",
				...contentJson({
					success: z.boolean(),
					result: z.object({
						user_id: z.number(),
						matches: z.array(MatchResult),
						total_candidates: z.number(),
						algorithm_version: z.string(),
					}),
				}),
			},
			"404": {
				description: "User not found",
				...contentJson({
					success: z.boolean(),
					error: z.string(),
				}),
			},
		},
	};

	public async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { user_id, min_score, limit } = data.query;

		try {
			// Step 1: Retrieve current user's complete profile
			const currentUserData = await this.fetchUserCompleteProfile(c, user_id);
			
			if (!currentUserData) {
				return c.json({
					success: false,
					error: "User not found",
				}, 404);
			}

			// Step 2: Fetch all potential candidates with their complete profiles
			const candidates = await this.fetchAllCandidates(c, user_id);

			// Step 3: Run the matching algorithm
			const allMatches = calculateMatches(currentUserData, candidates);

			// Step 4: Filter by minimum score and limit results
			const filteredMatches = allMatches
				.filter(match => match.compatibility_score >= min_score)
				.slice(0, limit);

			return {
				success: true,
				result: {
					user_id: user_id,
					matches: filteredMatches,
					total_candidates: candidates.length,
					algorithm_version: "2.0.0",
				},
			};

		} catch (error) {
			console.error("Smart match search error:", error);
			return c.json({
				success: false,
				error: error instanceof Error ? error.message : "Internal server error",
			}, 500);
		}
	}

	/**
	 * Fetch complete profile for a user including courses, skills, and availability
	 */
	private async fetchUserCompleteProfile(
		c: AppContext, 
		userId: number
	): Promise<UserMatchData | null> {
		// Get basic user info
		const userResult = await c.env.DB
			.prepare("SELECT id, username, email, goals, study_preference, created_at FROM users WHERE id = ?")
			.bind(userId)
			.first();

		if (!userResult) {
			return null;
		}

		// Get user's courses
		const coursesResult = await c.env.DB
			.prepare("SELECT course_name FROM courses WHERE user_id = ?")
			.bind(userId)
			.all();

		// Get user's skills
		const skillsResult = await c.env.DB
			.prepare("SELECT skill_id FROM user_skills WHERE user_id = ?")
			.bind(userId)
			.all();

		// Get user's availability
		const availabilityResult = await c.env.DB
			.prepare("SELECT weekday, time_slot FROM availability WHERE user_id = ?")
			.bind(userId)
			.all();

		return {
			id: userResult.id as number,
			username: userResult.username as string,
			email: userResult.email as string,
			goals: userResult.goals as string | null,
			study_preference: userResult.study_preference as string | null,
			created_at: userResult.created_at as string,
			courses: (coursesResult.results || []).map((r: any) => r.course_name as string),
			skills: (skillsResult.results || []).map((r: any) => r.skill_id as number),
			availability: (availabilityResult.results || []).map((r: any) => ({
				weekday: r.weekday as number,
				time_slot: r.time_slot as string,
			})),
		};
	}

	/**
	 * Fetch all candidate users with their complete profiles
	 */
	private async fetchAllCandidates(
		c: AppContext,
		excludeUserId: number
	): Promise<UserMatchData[]> {
		// Get all users except the current one
		const usersResult = await c.env.DB
			.prepare(`
				SELECT id, username, email, goals, study_preference, created_at 
				FROM users 
				WHERE id != ?
				ORDER BY created_at DESC
			`)
			.bind(excludeUserId)
			.all();

		const users = usersResult.results || [];
		const candidates: UserMatchData[] = [];

		// For each user, fetch their courses, skills, and availability
		for (const user of users) {
			const userId = user.id as number;

			// Parallel fetch for performance
			const [coursesResult, skillsResult, availabilityResult] = await Promise.all([
				c.env.DB
					.prepare("SELECT course_name FROM courses WHERE user_id = ?")
					.bind(userId)
					.all(),
				c.env.DB
					.prepare("SELECT skill_id FROM user_skills WHERE user_id = ?")
					.bind(userId)
					.all(),
				c.env.DB
					.prepare("SELECT weekday, time_slot FROM availability WHERE user_id = ?")
					.bind(userId)
					.all(),
			]);

			candidates.push({
				id: userId,
				username: user.username as string,
				email: user.email as string,
				goals: user.goals as string | null,
				study_preference: user.study_preference as string | null,
				created_at: user.created_at as string,
				courses: (coursesResult.results || []).map((r: any) => r.course_name as string),
				skills: (skillsResult.results || []).map((r: any) => r.skill_id as number),
				availability: (availabilityResult.results || []).map((r: any) => ({
					weekday: r.weekday as number,
					time_slot: r.time_slot as string,
				})),
			});
		}

		return candidates;
	}
}
