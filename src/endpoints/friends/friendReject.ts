import { OpenAPIRoute, Str } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { verifyAuth } from '../../middlewares/auth';

export class FriendReject extends OpenAPIRoute {
  schema = {
    tags: ['Friends'],
    summary: 'Reject a friend request',
    request: {
      params: z.object({
        id: Str({ description: 'Friend request ID' }),
      }),
    },
    responses: {
      '200': {
        description: 'Friend request rejected',
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

    // Delete the request (or could update status to 'rejected')
    const result = await db
      .prepare('DELETE FROM friendships WHERE id = ?')
      .bind(id)
      .run();

    if (!result.success) {
      return c.json(
        { success: false, message: 'Failed to reject friend request' },
        500
      );
    }

    return c.json({
      success: true,
      message: 'Friend request rejected',
    });
  }
}
