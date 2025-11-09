import { OpenAPIRoute, Str } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { verifyAuth } from '../../middlewares/auth';

export class FriendDelete extends OpenAPIRoute {
  schema = {
    tags: ['Friends'],
    summary: 'Remove a friend',
    request: {
      params: z.object({
        id: Str({ description: 'Friend user ID' }),
      }),
    },
    responses: {
      '200': {
        description: 'Friend removed',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              message: z.string(),
            }),
          },
        },
      },
      '401': {
        description: 'Unauthorized',
      },
      '404': {
        description: 'Friendship not found',
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
    const friendId = parseInt(id);
    const userId = authResult.userId;
    const db = c.env.DB;

    // Delete friendship (in either direction)
    const result = await db
      .prepare(
        `DELETE FROM friendships 
         WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
         AND status = 'accepted'`
      )
      .bind(userId, friendId, friendId, userId)
      .run();

    if (!result.success || result.meta.changes === 0) {
      return c.json(
        { success: false, message: 'Friendship not found' },
        404
      );
    }

    return c.json({
      success: true,
      message: 'Friend removed',
    });
  }
}
