import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { verifyAuth } from '../../middlewares/auth';

export class FriendsRequests extends OpenAPIRoute {
  schema = {
    tags: ['Friends'],
    summary: 'Get pending friend requests',
    responses: {
      '200': {
        description: 'List of pending friend requests',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                received: z.array(
                  z.object({
                    id: z.number(),
                    user_id: z.number(),
                    username: z.string(),
                    email: z.string(),
                    bio: z.string().nullable(),
                    requested_at: z.string(),
                  })
                ),
                sent: z.array(
                  z.object({
                    id: z.number(),
                    friend_id: z.number(),
                    username: z.string(),
                    email: z.string(),
                    bio: z.string().nullable(),
                    requested_at: z.string(),
                  })
                ),
              }),
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

    // Get received requests
    const received = await db
      .prepare(
        `SELECT 
          f.id,
          f.user_id,
          u.username,
          u.email,
          u.bio,
          f.requested_at
         FROM friendships f
         JOIN users u ON u.id = f.user_id
         WHERE f.friend_id = ? AND f.status = 'pending'
         ORDER BY f.requested_at DESC`
      )
      .bind(userId)
      .all();

    // Get sent requests
    const sent = await db
      .prepare(
        `SELECT 
          f.id,
          f.friend_id,
          u.username,
          u.email,
          u.bio,
          f.requested_at
         FROM friendships f
         JOIN users u ON u.id = f.friend_id
         WHERE f.user_id = ? AND f.status = 'pending'
         ORDER BY f.requested_at DESC`
      )
      .bind(userId)
      .all();

    return c.json({
      success: true,
      data: {
        received: received.results || [],
        sent: sent.results || [],
      },
    });
  }
}
