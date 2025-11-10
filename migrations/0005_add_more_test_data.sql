-- Add comprehensive test data for courses, user_skills, and availability
-- This complements the existing user and study_groups data

-- Insert courses for users
INSERT OR IGNORE INTO courses (user_id, course_name, created_at) VALUES
    -- Alice's courses
    (1, '数据结构与算法', '2024-01-01 10:30:00'),
    (1, '操作系统原理', '2024-01-01 10:31:00'),
    (1, '计算机网络', '2024-01-01 10:32:00'),
    
    -- Bob's courses
    (2, 'React完全指南', '2024-01-02 10:30:00'),
    (2, 'Vue3实战开发', '2024-01-02 10:31:00'),
    (2, 'TypeScript高级编程', '2024-01-02 10:32:00'),
    (2, 'Node.js后端开发', '2024-01-02 10:33:00'),
    
    -- Charlie's courses
    (3, '机器学习基础', '2024-01-03 10:30:00'),
    (3, '深度学习与神经网络', '2024-01-03 10:31:00'),
    (3, 'Python数据分析', '2024-01-03 10:32:00'),
    
    -- Diana's courses
    (4, '全栈Web开发', '2024-01-04 10:30:00'),
    (4, '数据库设计与优化', '2024-01-04 10:31:00'),
    (4, 'Docker容器技术', '2024-01-04 10:32:00'),
    (4, 'AWS云服务实践', '2024-01-04 10:33:00'),
    
    -- Eve's courses
    (5, 'UI/UX设计原理', '2024-01-05 10:30:00'),
    (5, 'Figma设计工具', '2024-01-05 10:31:00'),
    (5, '用户体验研究', '2024-01-05 10:32:00');

-- Insert user_skills (linking users to preset skills with proficiency levels)
INSERT OR IGNORE INTO user_skills (user_id, skill_id, proficiency_level, created_at) VALUES
    -- Alice's skills (Algorithm focused)
    (1, 1, 'advanced', '2024-01-01 11:00:00'),      -- JavaScript
    (1, 2, 'advanced', '2024-01-01 11:01:00'),      -- TypeScript
    (1, 3, 'intermediate', '2024-01-01 11:02:00'),  -- Python
    (1, 10, 'advanced', '2024-01-01 11:03:00'),     -- Data Structures
    (1, 11, 'advanced', '2024-01-01 11:04:00'),     -- Algorithms
    
    -- Bob's skills (Frontend focused)
    (2, 1, 'advanced', '2024-01-02 11:00:00'),      -- JavaScript
    (2, 2, 'advanced', '2024-01-02 11:01:00'),      -- TypeScript
    (2, 6, 'advanced', '2024-01-02 11:02:00'),      -- React
    (2, 7, 'intermediate', '2024-01-02 11:03:00'),  -- Node.js
    (2, 12, 'advanced', '2024-01-02 11:04:00'),     -- Web Development
    
    -- Charlie's skills (ML/AI focused)
    (3, 3, 'advanced', '2024-01-03 11:00:00'),      -- Python
    (3, 9, 'advanced', '2024-01-03 11:01:00'),      -- Machine Learning
    (3, 10, 'intermediate', '2024-01-03 11:02:00'), -- Data Structures
    (3, 11, 'intermediate', '2024-01-03 11:03:00'), -- Algorithms
    
    -- Diana's skills (Full-stack focused)
    (4, 1, 'advanced', '2024-01-04 11:00:00'),      -- JavaScript
    (4, 2, 'advanced', '2024-01-04 11:01:00'),      -- TypeScript
    (4, 6, 'advanced', '2024-01-04 11:02:00'),      -- React
    (4, 7, 'advanced', '2024-01-04 11:03:00'),      -- Node.js
    (4, 8, 'advanced', '2024-01-04 11:04:00'),      -- Database Design
    (4, 14, 'intermediate', '2024-01-04 11:05:00'), -- Cloud Computing
    (4, 15, 'intermediate', '2024-01-04 11:06:00'), -- DevOps
    
    -- Eve's skills (Design focused)
    (5, 1, 'intermediate', '2024-01-05 11:00:00'),  -- JavaScript
    (5, 6, 'intermediate', '2024-01-05 11:01:00'),  -- React
    (5, 12, 'advanced', '2024-01-05 11:02:00');     -- Web Development

-- Insert availability for all users (weekly schedule)
INSERT OR IGNORE INTO availability (user_id, weekday, time_slot, created_at) VALUES
    -- Alice's availability (Monday to Friday, mornings and evenings)
    (1, 0, '09:00-12:00', '2024-01-01 12:00:00'),  -- Monday morning
    (1, 0, '19:00-22:00', '2024-01-01 12:01:00'),  -- Monday evening
    (1, 1, '09:00-12:00', '2024-01-01 12:02:00'),  -- Tuesday morning
    (1, 2, '19:00-22:00', '2024-01-01 12:03:00'),  -- Wednesday evening
    (1, 3, '09:00-12:00', '2024-01-01 12:04:00'),  -- Thursday morning
    (1, 4, '19:00-22:00', '2024-01-01 12:05:00'),  -- Friday evening
    (1, 5, '14:00-18:00', '2024-01-01 12:06:00'),  -- Saturday afternoon
    
    -- Bob's availability (Flexible schedule)
    (2, 0, '14:00-18:00', '2024-01-02 12:00:00'),  -- Monday afternoon
    (2, 1, '14:00-18:00', '2024-01-02 12:01:00'),  -- Tuesday afternoon
    (2, 2, '14:00-18:00', '2024-01-02 12:02:00'),  -- Wednesday afternoon
    (2, 3, '14:00-18:00', '2024-01-02 12:03:00'),  -- Thursday afternoon
    (2, 4, '14:00-18:00', '2024-01-02 12:04:00'),  -- Friday afternoon
    (2, 6, '10:00-16:00', '2024-01-02 12:05:00'),  -- Sunday
    
    -- Charlie's availability (Evening study time)
    (3, 0, '19:00-23:00', '2024-01-03 12:00:00'),  -- Monday evening
    (3, 1, '19:00-23:00', '2024-01-03 12:01:00'),  -- Tuesday evening
    (3, 2, '19:00-23:00', '2024-01-03 12:02:00'),  -- Wednesday evening
    (3, 3, '19:00-23:00', '2024-01-03 12:03:00'),  -- Thursday evening
    (3, 5, '09:00-17:00', '2024-01-03 12:04:00'),  -- Saturday full day
    
    -- Diana's availability (Morning person)
    (4, 0, '06:00-09:00', '2024-01-04 12:00:00'),  -- Monday early morning
    (4, 1, '06:00-09:00', '2024-01-04 12:01:00'),  -- Tuesday early morning
    (4, 2, '06:00-09:00', '2024-01-04 12:02:00'),  -- Wednesday early morning
    (4, 3, '06:00-09:00', '2024-01-04 12:03:00'),  -- Thursday early morning
    (4, 4, '06:00-09:00', '2024-01-04 12:04:00'),  -- Friday early morning
    (4, 5, '08:00-12:00', '2024-01-04 12:05:00'),  -- Saturday morning
    (4, 6, '08:00-12:00', '2024-01-04 12:06:00'),  -- Sunday morning
    
    -- Eve's availability (Balanced schedule)
    (5, 1, '10:00-14:00', '2024-01-05 12:00:00'),  -- Tuesday midday
    (5, 2, '10:00-14:00', '2024-01-05 12:01:00'),  -- Wednesday midday
    (5, 3, '10:00-14:00', '2024-01-05 12:02:00'),  -- Thursday midday
    (5, 4, '15:00-19:00', '2024-01-05 12:03:00'),  -- Friday afternoon
    (5, 5, '10:00-18:00', '2024-01-05 12:04:00'),  -- Saturday
    (5, 6, '13:00-17:00', '2024-01-05 12:05:00');  -- Sunday afternoon

-- Verify the inserted data
SELECT 'Courses added:' as info, COUNT(*) as count FROM courses;
SELECT 'User skills added:' as info, COUNT(*) as count FROM user_skills;
SELECT 'Availability slots added:' as info, COUNT(*) as count FROM availability;
