import { OpenAPIRoute, Str } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { verifyAuth } from '../../middlewares/auth';

export class FriendRequest extends OpenAPIRoute {
  schema = {
    tags: ['Friends'],
    summary: 'Send a friend request',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              friend_id: z.number().int().positive(),
            }),
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Friend request sent',
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
                requested_at: z.string(),
              }),
            }),
          },
        },
      },
      '400': {
        description: 'Bad request',
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

    const data = await this.getValidatedData<typeof this.schema>();
    const { friend_id } = data.body;
    const userId = authResult.userId;

    // Cannot add yourself as friend
    if (userId === friend_id) {
      return c.json(
        { success: false, message: 'Cannot add yourself as friend' },
        400
      );
    }

    const db = c.env.DB;

    // Check if friend exists
    const friendExists = await db
      .prepare('SELECT id FROM users WHERE id = ?')
      .bind(friend_id)
      .first();

    if (!friendExists) {
      return c.json({ success: false, message: 'User not found' }, 404);
    }

    // Check if friendship already exists (in either direction)
    const existingFriendship = await db
      .prepare(
        `SELECT id, status, user_id, friend_id 
         FROM friendships 
         WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`
      )
      .bind(userId, friend_id, friend_id, userId)
      .first();

    if (existingFriendship) {
      const { status, user_id, friend_id: existing_friend_id } = existingFriendship as any;
      
      if (status === 'accepted') {
        return c.json(
          { success: false, message: 'Already friends' },
          400
        );
      } else if (status === 'pending') {
        // If the other person sent a request, auto-accept it
        if (user_id === friend_id && existing_friend_id === userId) {
          await db
            .prepare(
              `UPDATE friendships 
               SET status = 'accepted', responded_at = CURRENT_TIMESTAMP 
               WHERE id = ?`
            )
            .bind(existingFriendship.id)
            .run();

          const updated = await db
            .prepare('SELECT * FROM friendships WHERE id = ?')
            .bind(existingFriendship.id)
            .first();

          return c.json({
            success: true,
            message: 'Friend request accepted (mutual)',
            data: updated,
          });
        }
        
        return c.json(
          { success: false, message: 'Friend request already sent' },
          400
        );
      } else if (status === 'blocked') {
        return c.json(
          { success: false, message: 'Cannot send friend request' },
          403
        );
      }
    }

    // Create friend request
    const result = await db
      .prepare(
        `INSERT INTO friendships (user_id, friend_id, status) 
         VALUES (?, ?, 'pending')`
      )
      .bind(userId, friend_id)
      .run();

    if (!result.success) {
      return c.json(
        { success: false, message: 'Failed to send friend request' },
        500
      );
    }

    const friendship = await db
      .prepare('SELECT * FROM friendships WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first();

    return c.json({
      success: true,
      message: 'Friend request sent',
      data: friendship,
    });
  }
}
