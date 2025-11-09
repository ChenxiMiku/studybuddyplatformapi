-- Migration: Add messages table for real-time messaging system
-- Created: 2025-11-10

-- Messages table for both private and group chats
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER,  -- NULL for group messages
    group_id INTEGER,     -- NULL for private messages
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
    
    -- Ensure either receiver_id or group_id is set, but not both
    CHECK (
        (receiver_id IS NOT NULL AND group_id IS NULL) OR 
        (receiver_id IS NULL AND group_id IS NOT NULL)
    )
);

-- Index for efficient private message queries
CREATE INDEX IF NOT EXISTS idx_messages_private 
ON messages(sender_id, receiver_id, created_at DESC)
WHERE receiver_id IS NOT NULL;

-- Index for efficient group message queries
CREATE INDEX IF NOT EXISTS idx_messages_group 
ON messages(group_id, created_at DESC)
WHERE group_id IS NOT NULL;

-- Index for sender queries
CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON messages(sender_id, created_at DESC);
