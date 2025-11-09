-- Seed data for development and testing
-- Run this after migrations to populate the database with test data

-- Insert test users (if not exists)
-- Password for all test users is: password
INSERT OR IGNORE INTO users (id, username, email, password_hash, goals, study_preference, created_at)
VALUES 
    (1, 'alice', 'alice@example.com', '$2a$10$kqJk7XLWqVVz9XPVJpXhduJYFLnXLVy0PqW9KYFjy8X8pnK0qR5Eu', '提升算法能力，掌握动态规划和图论', 'both', '2024-01-01 10:00:00'),
    (2, 'bob', 'bob@example.com', '$2a$10$kqJk7XLWqVVz9XPVJpXhduJYFLnXLVy0PqW9KYFjy8X8pnK0qR5Eu', '深入学习React和Vue框架', 'group', '2024-01-02 10:00:00'),
    (3, 'charlie', 'charlie@example.com', '$2a$10$kqJk7XLWqVVz9XPVJpXhduJYFLnXLVy0PqW9KYFjy8X8pnK0qR5Eu', '专注机器学习和深度学习研究', 'one-on-one', '2024-01-03 10:00:00'),
    (4, 'diana', 'diana@example.com', '$2a$10$kqJk7XLWqVVz9XPVJpXhduJYFLnXLVy0PqW9KYFjy8X8pnK0qR5Eu', '成为全栈开发高手', 'both', '2024-01-04 10:00:00'),
    (5, 'eve', 'eve@example.com', '$2a$10$kqJk7XLWqVVz9XPVJpXhduJYFLnXLVy0PqW9KYFjy8X8pnK0qR5Eu', '提升UI/UX设计能力', 'group', '2024-01-05 10:00:00');

-- Insert test study groups
INSERT OR IGNORE INTO study_groups (id, name, description, created_by_user_id, is_private, created_at)
VALUES 
    (1, '算法刷题小组', '每天一起刷LeetCode，互相讨论解题思路，提升算法能力', 1, 0, '2024-01-10 09:00:00'),
    (2, 'React学习小组', '学习React 18新特性，包括Hooks、并发模式、Suspense等', 2, 0, '2024-01-11 10:00:00'),
    (3, '机器学习研讨会', '深入学习机器学习算法，实践Kaggle竞赛项目', 3, 1, '2024-01-12 11:00:00'),
    (4, '全栈开发训练营', '从前端到后端，从数据库到部署，全栈技能提升', 4, 0, '2024-01-13 12:00:00'),
    (5, 'UI设计工作坊', '学习Figma、设计系统、用户体验设计最佳实践', 5, 0, '2024-01-14 13:00:00'),
    (6, 'Python进阶', 'Python高级特性、性能优化、异步编程深度学习', 1, 0, '2024-01-15 14:00:00'),
    (7, 'Vue3实战项目', '使用Vue3+TypeScript开发真实项目，学习组合式API', 2, 0, '2024-01-16 15:00:00'),
    (8, '数据结构与算法', '系统学习数据结构，掌握常见算法的实现和应用', 1, 0, '2024-01-17 16:00:00');

-- Insert group members (including creators as admins)
INSERT OR IGNORE INTO group_members (group_id, user_id, role, status, joined_at)
VALUES 
    -- Group 1: 算法刷题小组 (5 members)
    (1, 1, 'admin', 'active', '2024-01-10 09:00:00'),
    (1, 2, 'member', 'active', '2024-01-10 10:00:00'),
    (1, 3, 'member', 'active', '2024-01-10 11:00:00'),
    (1, 4, 'member', 'active', '2024-01-10 12:00:00'),
    (1, 5, 'member', 'active', '2024-01-10 13:00:00'),
    
    -- Group 2: React学习小组 (4 members)
    (2, 2, 'admin', 'active', '2024-01-11 10:00:00'),
    (2, 1, 'member', 'active', '2024-01-11 11:00:00'),
    (2, 4, 'member', 'active', '2024-01-11 12:00:00'),
    (2, 5, 'member', 'active', '2024-01-11 13:00:00'),
    
    -- Group 3: 机器学习研讨会 (3 members, private)
    (3, 3, 'admin', 'active', '2024-01-12 11:00:00'),
    (3, 1, 'member', 'active', '2024-01-12 12:00:00'),
    (3, 4, 'member', 'active', '2024-01-12 13:00:00'),
    
    -- Group 4: 全栈开发训练营 (5 members)
    (4, 4, 'admin', 'active', '2024-01-13 12:00:00'),
    (4, 1, 'member', 'active', '2024-01-13 13:00:00'),
    (4, 2, 'member', 'active', '2024-01-13 14:00:00'),
    (4, 3, 'member', 'active', '2024-01-13 15:00:00'),
    (4, 5, 'member', 'active', '2024-01-13 16:00:00'),
    
    -- Group 5: UI设计工作坊 (3 members)
    (5, 5, 'admin', 'active', '2024-01-14 13:00:00'),
    (5, 2, 'member', 'active', '2024-01-14 14:00:00'),
    (5, 4, 'member', 'active', '2024-01-14 15:00:00'),
    
    -- Group 6: Python进阶 (4 members)
    (6, 1, 'admin', 'active', '2024-01-15 14:00:00'),
    (6, 3, 'member', 'active', '2024-01-15 15:00:00'),
    (6, 4, 'member', 'active', '2024-01-15 16:00:00'),
    (6, 5, 'member', 'active', '2024-01-15 17:00:00'),
    
    -- Group 7: Vue3实战项目 (3 members)
    (7, 2, 'admin', 'active', '2024-01-16 15:00:00'),
    (7, 1, 'member', 'active', '2024-01-16 16:00:00'),
    (7, 5, 'member', 'active', '2024-01-16 17:00:00'),
    
    -- Group 8: 数据结构与算法 (4 members)
    (8, 1, 'admin', 'active', '2024-01-17 16:00:00'),
    (8, 2, 'member', 'active', '2024-01-17 17:00:00'),
    (8, 3, 'member', 'active', '2024-01-17 18:00:00'),
    (8, 4, 'member', 'active', '2024-01-17 19:00:00');

-- Verify the data
SELECT 'Users created:' as info, COUNT(*) as count FROM users;
SELECT 'Study groups created:' as info, COUNT(*) as count FROM study_groups;
SELECT 'Group memberships created:' as info, COUNT(*) as count FROM group_members;

-- Show groups with member counts
SELECT 
    sg.id,
    sg.name,
    sg.is_private,
    COUNT(gm.id) as member_count,
    u.username as created_by
FROM study_groups sg
LEFT JOIN group_members gm ON sg.id = gm.group_id AND gm.status = 'active'
LEFT JOIN users u ON sg.created_by_user_id = u.id
GROUP BY sg.id
ORDER BY sg.id;
