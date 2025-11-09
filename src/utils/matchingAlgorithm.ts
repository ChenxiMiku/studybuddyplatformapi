/**
 * Smart Matching Algorithm for Study Buddy Platform
 * 
 * This module implements a multi-dimensional compatibility scoring system
 * that helps students find suitable study partners based on:
 * - Course similarity (50% weight)
 * - Time overlap (30% weight)
 * - Skill similarity (20% weight)
 * - Social balance factor (diversity encouragement)
 * 
 * @module matchingAlgorithm
 */

import { z } from "zod";

// Configuration weights (can be stored in KV for dynamic adjustment)
export const MATCHING_WEIGHTS = {
	COURSE_WEIGHT: 0.5,
	TIME_WEIGHT: 0.3,
	SKILL_WEIGHT: 0.2,
	SOCIAL_BALANCE_PENALTY: 0.1, // Reduce score if too many shared groups
};

// Match result schema
export const MatchResult = z.object({
	user_id: z.number(),
	username: z.string(),
	email: z.string(),
	goals: z.string().nullable(),
	study_preference: z.string().nullable(),
	compatibility_score: z.number().min(0).max(100),
	match_reasons: z.array(z.string()),
	course_similarity: z.number(),
	time_overlap: z.number(),
	skill_similarity: z.number(),
	created_at: z.string(),
});

export type MatchResultType = z.infer<typeof MatchResult>;

/**
 * User data structure for matching
 */
export interface UserMatchData {
	id: number;
	username: string;
	email: string;
	goals: string | null;
	study_preference: string | null;
	created_at: string;
	courses: string[]; // Array of course names
	skills: number[]; // Array of skill IDs
	availability: Array<{ weekday: number; time_slot: string }>; // Available time slots
	shared_groups_count?: number; // Number of groups already shared with requester
}

/**
 * Calculate course similarity score
 * Returns a percentage (0-100) based on shared courses
 */
export function calculateCourseSimilarity(
	userCourses: string[],
	candidateCourses: string[]
): number {
	if (userCourses.length === 0 || candidateCourses.length === 0) {
		return 0;
	}

	// Find common courses (case-insensitive)
	const userCoursesLower = userCourses.map(c => c.toLowerCase());
	const candidateCoursesLower = candidateCourses.map(c => c.toLowerCase());
	const commonCourses = userCoursesLower.filter(c => 
		candidateCoursesLower.includes(c)
	);

	// Calculate Jaccard similarity: intersection / union
	const union = new Set([...userCoursesLower, ...candidateCoursesLower]);
	const similarity = (commonCourses.length / union.size) * 100;

	return Math.round(similarity * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate time overlap score
 * Returns a percentage (0-100) based on overlapping time slots
 */
export function calculateTimeOverlap(
	userAvailability: Array<{ weekday: number; time_slot: string }>,
	candidateAvailability: Array<{ weekday: number; time_slot: string }>
): number {
	if (userAvailability.length === 0 || candidateAvailability.length === 0) {
		return 0;
	}

	// Create comparable strings for each time slot
	const userSlots = new Set(
		userAvailability.map(a => `${a.weekday}-${a.time_slot}`)
	);
	const candidateSlots = candidateAvailability.map(
		a => `${a.weekday}-${a.time_slot}`
	);

	// Count overlapping slots
	const overlappingSlots = candidateSlots.filter(slot => userSlots.has(slot));

	// Calculate percentage of overlap
	const maxSlots = Math.max(userAvailability.length, candidateAvailability.length);
	const overlap = (overlappingSlots.length / maxSlots) * 100;

	return Math.round(overlap * 10) / 10;
}

/**
 * Calculate skill similarity score
 * Returns a percentage (0-100) based on shared skills
 */
export function calculateSkillSimilarity(
	userSkills: number[],
	candidateSkills: number[]
): number {
	if (userSkills.length === 0 || candidateSkills.length === 0) {
		return 0;
	}

	// Find common skills
	const commonSkills = userSkills.filter(s => candidateSkills.includes(s));

	// Calculate Jaccard similarity
	const union = new Set([...userSkills, ...candidateSkills]);
	const similarity = (commonSkills.length / union.size) * 100;

	return Math.round(similarity * 10) / 10;
}

/**
 * Apply social balance factor
 * Reduces score if users already share too many groups (encourages diversity)
 */
export function applySocialBalanceFactor(
	baseScore: number,
	sharedGroupsCount: number = 0
): number {
	if (sharedGroupsCount === 0) {
		return baseScore;
	}

	// Reduce score by 10% for each shared group (up to 3 groups)
	const penalty = Math.min(sharedGroupsCount * MATCHING_WEIGHTS.SOCIAL_BALANCE_PENALTY, 0.3);
	const adjustedScore = baseScore * (1 - penalty);

	return Math.round(adjustedScore * 10) / 10;
}

/**
 * Calculate overall compatibility score
 * Combines all dimensions with weighted scoring
 */
export function calculateCompatibilityScore(
	courseSimilarity: number,
	timeOverlap: number,
	skillSimilarity: number,
	sharedGroupsCount: number = 0
): number {
	// Weighted sum of all components
	const weightedScore = 
		(courseSimilarity * MATCHING_WEIGHTS.COURSE_WEIGHT) +
		(timeOverlap * MATCHING_WEIGHTS.TIME_WEIGHT) +
		(skillSimilarity * MATCHING_WEIGHTS.SKILL_WEIGHT);

	// Apply social balance factor
	const finalScore = applySocialBalanceFactor(weightedScore, sharedGroupsCount);

	return Math.round(finalScore * 10) / 10;
}

/**
 * Generate human-readable match reasons
 */
export function generateMatchReasons(
	courseSimilarity: number,
	timeOverlap: number,
	skillSimilarity: number,
	userCourses: string[],
	candidateCourses: string[]
): string[] {
	const reasons: string[] = [];

	// Course matches
	if (courseSimilarity > 0) {
		const commonCourses = userCourses.filter(c => 
			candidateCourses.some(cc => cc.toLowerCase() === c.toLowerCase())
		);
		if (commonCourses.length > 0) {
			reasons.push(`Shared ${commonCourses.length} course(s): ${commonCourses.slice(0, 3).join(", ")}`);
		}
	}

	// Time availability
	if (timeOverlap > 50) {
		reasons.push(`High time availability overlap (${timeOverlap}%)`);
	} else if (timeOverlap > 0) {
		reasons.push(`Some overlapping study times (${timeOverlap}%)`);
	}

	// Skill matches
	if (skillSimilarity > 50) {
		reasons.push(`Strong skill compatibility (${skillSimilarity}%)`);
	} else if (skillSimilarity > 0) {
		reasons.push(`Complementary skills (${skillSimilarity}%)`);
	}

	// Add default reason if no specific matches
	if (reasons.length === 0) {
		reasons.push("Active user in the platform");
	}

	return reasons;
}

/**
 * Main matching function
 * Takes a user's data and a list of candidates, returns ranked matches
 */
export function calculateMatches(
	currentUser: UserMatchData,
	candidates: UserMatchData[]
): MatchResultType[] {
	const matches: MatchResultType[] = [];

	for (const candidate of candidates) {
		// Skip the current user
		if (candidate.id === currentUser.id) {
			continue;
		}

		// Calculate individual scores
		const courseSimilarity = calculateCourseSimilarity(
			currentUser.courses,
			candidate.courses
		);

		const timeOverlap = calculateTimeOverlap(
			currentUser.availability,
			candidate.availability
		);

		const skillSimilarity = calculateSkillSimilarity(
			currentUser.skills,
			candidate.skills
		);

		// Calculate overall compatibility
		const compatibilityScore = calculateCompatibilityScore(
			courseSimilarity,
			timeOverlap,
			skillSimilarity,
			candidate.shared_groups_count || 0
		);

		// Generate reasons
		const matchReasons = generateMatchReasons(
			courseSimilarity,
			timeOverlap,
			skillSimilarity,
			currentUser.courses,
			candidate.courses
		);

		// Create match result
		matches.push({
			user_id: candidate.id,
			username: candidate.username,
			email: candidate.email,
			goals: candidate.goals,
			study_preference: candidate.study_preference,
			compatibility_score: compatibilityScore,
			match_reasons: matchReasons,
			course_similarity: courseSimilarity,
			time_overlap: timeOverlap,
			skill_similarity: skillSimilarity,
			created_at: candidate.created_at,
		});
	}

	// Sort by compatibility score (descending)
	matches.sort((a, b) => b.compatibility_score - a.compatibility_score);

	return matches;
}
