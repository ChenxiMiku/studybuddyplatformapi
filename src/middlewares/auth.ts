import { Context, Next } from "hono";
import { verifyToken, extractToken } from "../utils/jwt";
import { Env } from "../types";

export interface AuthContext {
	userId: number;
	email: string;
}

/**
 * JWT Authentication Middleware
 * Verifies the JWT token in the Authorization header
 * Adds user info to context if valid
 */
export async function jwtAuth(c: Context<{ Bindings: Env }>, next: Next) {
	const authHeader = c.req.header("Authorization") || null;
	const token = extractToken(authHeader);

	if (!token) {
		return c.json(
			{
				success: false,
				errors: [{ code: 4010, message: "Missing authorization token" }],
			},
			401
		);
	}

	const payload = await verifyToken(token, c.env.JWT_SECRET, "access");

	if (!payload) {
		return c.json(
			{
				success: false,
				errors: [{ code: 4011, message: "Invalid or expired token" }],
			},
			401
		);
	}

	// Add user info to context (note: Hono doesn't support typed context.set in all scenarios)
	// In production, consider using a proper context extension pattern
	(c as any).auth = {
		userId: payload.userId,
		email: payload.email,
	};

	await next();
}

/**
 * Optional JWT Authentication Middleware
 * If token is present and valid, adds user info to context
 * If token is missing or invalid, continues without user info
 */
export async function optionalJwtAuth(c: Context<{ Bindings: Env }>, next: Next) {
	const authHeader = c.req.header("Authorization") || null;
	const token = extractToken(authHeader);

	if (token) {
		const payload = await verifyToken(token, c.env.JWT_SECRET, "access");
		if (payload) {
			(c as any).auth = {
				userId: payload.userId,
				email: payload.email,
			};
		}
	}

	await next();
}

/**
 * Verify JWT token for OpenAPI routes
 * Returns validation result with user info
 */
export async function verifyAuth(c: Context<{ Bindings: Env }>) {
	const authHeader = c.req.header("Authorization") || null;
	const token = extractToken(authHeader);

	if (!token) {
		return {
			valid: false,
			errors: [{ code: 4010, message: "Missing authorization token" }],
			userId: null,
			email: null,
		};
	}

	const payload = await verifyToken(token, c.env.JWT_SECRET, "access");

	if (!payload) {
		return {
			valid: false,
			errors: [{ code: 4011, message: "Invalid or expired token" }],
			userId: null,
			email: null,
		};
	}

	return {
		valid: true,
		errors: [],
		userId: payload.userId,
		email: payload.email,
	};
}
