import jwt from "@tsndr/cloudflare-worker-jwt";

export interface TokenPayload {
	userId: number;
	email: string;
	type: "access" | "refresh";
}

export interface TokenPair {
	accessToken: string;
	refreshToken: string;
	expiresIn: number; // seconds
}

/**
 * Parse expiration string (e.g., "15m", "7d", "1h") to seconds
 */
function parseExpiration(exp: string): number {
	const match = exp.match(/^(\d+)([smhd])$/);
	if (!match) {
		throw new Error(`Invalid expiration format: ${exp}`);
	}

	const value = parseInt(match[1], 10);
	const unit = match[2];

	const multipliers: Record<string, number> = {
		s: 1,
		m: 60,
		h: 3600,
		d: 86400,
	};

	return value * multipliers[unit];
}

/**
 * Generate access and refresh token pair
 */
export async function generateTokenPair(
	payload: Omit<TokenPayload, "type">,
	secret: string,
	accessExp: string,
	refreshExp: string
): Promise<TokenPair> {
	const accessExpiresIn = parseExpiration(accessExp);
	const refreshExpiresIn = parseExpiration(refreshExp);

	const now = Math.floor(Date.now() / 1000);

	const accessToken = await jwt.sign(
		{
			...payload,
			type: "access",
			iat: now,
			exp: now + accessExpiresIn,
		},
		secret
	);

	const refreshToken = await jwt.sign(
		{
			...payload,
			type: "refresh",
			iat: now,
			exp: now + refreshExpiresIn,
		},
		secret
	);

	return {
		accessToken,
		refreshToken,
		expiresIn: accessExpiresIn,
	};
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(
	token: string,
	secret: string,
	expectedType?: "access" | "refresh"
): Promise<TokenPayload | null> {
	try {
		const isValid = await jwt.verify(token, secret);
		if (!isValid) {
			return null;
		}

		const decoded = jwt.decode(token);
		if (!decoded || !decoded.payload) {
			return null;
		}

		const payload = decoded.payload as TokenPayload;

		// Check token type if specified
		if (expectedType && payload.type !== expectedType) {
			return null;
		}

		return payload;
	} catch (error) {
		console.error("JWT verification error:", error);
		return null;
	}
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | null): string | null {
	if (!authHeader) {
		return null;
	}

	const parts = authHeader.split(" ");
	if (parts.length !== 2 || parts[0] !== "Bearer") {
		return null;
	}

	return parts[1];
}
