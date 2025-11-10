import { OpenAPIRoute, Str } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { verifyAuth } from '../../middlewares/auth';

export class FriendAccept extends OpenAPIRoute {
  schema = {
    tags: ['Friends'],
    summary: 'Accept a friend request',
    request: {
      params: z.object({
        id: Str({ description: 'Friend request ID' }),
      }),
    },
    responses: {
      '200': {
        description: 'Friend request accepted',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              message: z.string(),
              data: z.object({
                id: z.number(),
                user_id: z.number(),
                friend_id: z.number(),
                status: z.string(),
                responded_at: z.string().nullable(),
              }),
            }),
          },
        },
      },
      '401': {
        description: 'Unauthorized',
      },
      '404': {
        description: 'Friend request not found',
      },
    },
    security: [{ bearerAuth: [] }],
  };

  async handle(c: Context) {
    const authResult = await verifyAuth(c);
    if (!authResult.valid || !authResult.userId) {
      return c.json({ success: false, message: 'Unauthorized' }, 401);
    }

    const data = await this.getValidatedData<typeof this.schema>();
    const { id } = data.params;
    const userId = authResult.userId;
    const db = c.env.DB;

    // Get friend request
    const friendship = await db
      .prepare(
        `SELECT * FROM friendships 
         WHERE id = ? AND friend_id = ? AND status = 'pending'`
      )
      .bind(id, userId)
      .first();

    if (!friendship) {
      return c.json(
        { success: false, message: 'Friend request not found' },
        404
      );
    }

    // Accept request
    const result = await db
      .prepare(
        `UPDATE friendships 
         SET status = 'accepted', responded_at = CURRENT_TIMESTAMP 
         WHERE id = ?`
      )
      .bind(id)
      .run();

    if (!result.success) {
      return c.json(
        { success: false, message: 'Failed to accept friend request' },
        500
      );
    }

    const updated = await db
      .prepare('SELECT * FROM friendships WHERE id = ?')
      .bind(id)
      .first();

    return c.json({
      success: true,
      message: 'Friend request accepted',
      data: updated,
    });
  }
}
