import { fromHono } from 'chanfana';
import { FriendRequest } from './friendRequest';
import { FriendAccept } from './friendAccept';
import { FriendReject } from './friendReject';
import { FriendDelete } from './friendDelete';
import { FriendsList } from './friendsList';
import { FriendsRequests } from './friendsRequests';

export function setupFriendsRoutes(router: ReturnType<typeof fromHono>) {
  // Send friend request
  router.post('/api/friends/request', FriendRequest);
  
  // Accept friend request
  router.post('/api/friends/:id/accept', FriendAccept);
  
  // Reject friend request
  router.post('/api/friends/:id/reject', FriendReject);
  
  // Remove friend
  router.delete('/api/friends/:id', FriendDelete);
  
  // Get friends list
  router.get('/api/friends', FriendsList);
  
  // Get pending requests
  router.get('/api/friends/requests', FriendsRequests);
}
