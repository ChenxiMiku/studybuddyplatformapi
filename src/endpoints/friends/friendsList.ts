import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { verifyAuth } from '../../middlewares/auth';

export class FriendsList extends OpenAPIRoute {
  schema = {
    tags: ['Friends'],
    summary: 'Get list of friends',
    responses: {
      '200': {
        description: 'List of friends',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.array(
                z.object({
                  id: z.number(),
                  username: z.string(),
                  email: z.string(),
                  bio: z.string().nullable(),
                  friendship_id: z.number(),
                  friends_since: z.string(),
                })
              ),
            }),
          },
        },
      },
      '401': {
        description: 'Unauthorized',
      },
    },
    security: [{ bearerAuth: [] }],
  };

  async handle(c: Context) {
    const authResult = await verifyAuth(c);
    if (!authResult.valid || !authResult.userId) {
      return c.json({ success: false, message: 'Unauthorized' }, 401);
    }

    const userId = authResult.userId;
    const db = c.env.DB;

    // Get friends (where user is either sender or receiver)
    const friends = await db
      .prepare(
        `SELECT 
          u.id,
          u.username,
          u.email,
          u.bio,
          f.id as friendship_id,
          f.responded_at as friends_since
         FROM friendships f
         JOIN users u ON (
           CASE 
             WHEN f.user_id = ? THEN u.id = f.friend_id
             ELSE u.id = f.user_id
           END
         )
         WHERE (f.user_id = ? OR f.friend_id = ?)
         AND f.status = 'accepted'
         ORDER BY f.responded_at DESC`
      )
      .bind(userId, userId, userId)
      .all();

    return c.json({
      success: true,
      data: friends.results || [],
    });
  }
}
