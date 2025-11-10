# Study Buddy Platform API - Usage Examples

## Complete Usage Flow Examples

### 1. Create User

```bash
# Create the first user
curl -X POST http://localhost:8787/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice_chen",
    "email": "alice@example.com",
    "password_hash": "$2a$10$...",
    "goals": "Master web development and build a portfolio project",
    "study_preference": "group"
  }'

# Response
{
  "success": true,
  "result": {
    "id": 1,
    "username": "alice_chen",
    "email": "alice@example.com",
    "goals": "Master web development and build a portfolio project",
    "study_preference": "group",
    "created_at": "2025-11-09T10:00:00.000Z",
    "updated_at": "2025-11-09T10:00:00.000Z"
  }
}
```

### 2. Add Courses for User

```bash
# Add a course
curl -X POST http://localhost:8787/courses \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "course_name": "CS50 - Introduction to Computer Science"
  }'

curl -X POST http://localhost:8787/courses \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "course_name": "Full Stack Web Development Bootcamp"
  }'

# Response
{
  "success": true,
  "result": {
    "id": 1,
    "user_id": 1,
    "course_name": "CS50 - Introduction to Computer Science",
    "created_at": "2025-11-09T10:05:00.000Z"
  }
}
```

### 3. View All Preset Skills

```bash
# Retrieve skill list
curl http://localhost:8787/skills

# Response
{
  "success": true,
  "result": [
    { "id": 1, "skill_name": "JavaScript" },
    { "id": 2, "skill_name": "TypeScript" },
    { "id": 3, "skill_name": "Python" },
    { "id": 6, "skill_name": "React" },
    ...
  ]
}
```

### 4. Add Skills for User

```bash
# Add JavaScript skill (intermediate level)
curl -X POST http://localhost:8787/user-skills \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "skill_id": 1,
    "proficiency_level": "intermediate"
  }'

# Add React skill (beginner level)
curl -X POST http://localhost:8787/user-skills \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "skill_id": 6,
    "proficiency_level": "beginner"
  }'

# Response
{
  "success": true,
  "result": {
    "id": 1,
    "user_id": 1,
    "skill_id": 1,
    "proficiency_level": "intermediate",
    "created_at": "2025-11-09T10:10:00.000Z"
  }
}
```

### 5. Set User Availability

```bash
# Monday 14:00-16:00
curl -X POST http://localhost:8787/availability \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "weekday": 1,
    "time_slot": "14:00-16:00"
  }'

# Wednesday 10:00-12:00
curl -X POST http://localhost:8787/availability \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "weekday": 3,
    "time_slot": "10:00-12:00"
  }'

# Friday 19:00-21:00
curl -X POST http://localhost:8787/availability \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "weekday": 5,
    "time_slot": "19:00-21:00"
  }'

# Response
{
  "success": true,
  "result": {
    "id": 1,
    "user_id": 1,
    "weekday": 1,
    "time_slot": "14:00-16:00",
    "created_at": "2025-11-09T10:15:00.000Z"
  }
}
```

### 6. Query User Information

```bash
# Retrieve user details
curl http://localhost:8787/users/1

# Response includes complete user information
{
  "success": true,
  "result": {
    "id": 1,
    "username": "alice_chen",
    "email": "alice@example.com",
    "goals": "Master web development and build a portfolio project",
    "study_preference": "group",
    "created_at": "2025-11-09T10:00:00.000Z",
    "updated_at": "2025-11-09T10:00:00.000Z"
  }
}
```

### 7. Query User's Courses

```bash
# Filter courses by user_id (using query parameters)
curl "http://localhost:8787/courses?user_id=1"

# Response
{
  "success": true,
  "result": [
    {
      "id": 1,
      "user_id": 1,
      "course_name": "CS50 - Introduction to Computer Science",
      "created_at": "2025-11-09T10:05:00.000Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "course_name": "Full Stack Web Development Bootcamp",
      "created_at": "2025-11-09T10:06:00.000Z"
    }
  ]
}
```

### 8. Query User's Skills

```bash
# Filter user skills by user_id
curl "http://localhost:8787/user-skills?user_id=1"

# Response
{
  "success": true,
  "result": [
    {
      "id": 1,
      "user_id": 1,
      "skill_id": 1,
      "proficiency_level": "intermediate",
      "created_at": "2025-11-09T10:10:00.000Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "skill_id": 6,
      "proficiency_level": "beginner",
      "created_at": "2025-11-09T10:11:00.000Z"
    }
  ]
}
```

### 9. Query User's Availability

```bash
# Filter availability by user_id
curl "http://localhost:8787/availability?user_id=1"

# Response
{
  "success": true,
  "result": [
    {
      "id": 1,
      "user_id": 1,
      "weekday": 1,
      "time_slot": "14:00-16:00",
      "created_at": "2025-11-09T10:15:00.000Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "weekday": 3,
      "time_slot": "10:00-12:00",
      "created_at": "2025-11-09T10:16:00.000Z"
    },
    {
      "id": 3,
      "user_id": 1,
      "weekday": 5,
      "time_slot": "19:00-21:00",
      "created_at": "2025-11-09T10:17:00.000Z"
    }
  ]
}
```

### 10. Update User Information

```bash
# Update learning goals and preferences
curl -X PUT http://localhost:8787/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "goals": "Build a full-stack e-commerce application and find a tech job",
    "study_preference": "both"
  }'

# Response
{
  "success": true,
  "result": {
    "id": 1,
    "username": "alice_chen",
    "email": "alice@example.com",
    "goals": "Build a full-stack e-commerce application and find a tech job",
    "study_preference": "both",
    "updated_at": "2025-11-09T11:00:00.000Z"
  }
}
```

### 11. Update Skill Proficiency

```bash
# Upgrade React skill from beginner to intermediate
curl -X PUT http://localhost:8787/user-skills/2 \
  -H "Content-Type: application/json" \
  -d '{
    "proficiency_level": "intermediate"
  }'

# Response
{
  "success": true,
  "result": {
    "id": 2,
    "user_id": 1,
    "skill_id": 6,
    "proficiency_level": "intermediate",
    "created_at": "2025-11-09T10:11:00.000Z"
  }
}
```

### 12. Search Functionality

```bash
# Search for courses containing "web"
curl "http://localhost:8787/courses?search=web"

# Search for skills containing "Script"
curl "http://localhost:8787/skills?search=Script"

# Search for users (by username or email)
curl "http://localhost:8787/users?search=alice"
```

### 13. Pagination Queries

```bash
# Retrieve first page (10 items per page)
curl "http://localhost:8787/users?page=1&per_page=10"

# Retrieve second page
curl "http://localhost:8787/users?page=2&per_page=10"
```

### 14. Delete Operations

```bash
# Delete course
curl -X DELETE http://localhost:8787/courses/1

# Delete user skill relationship
curl -X DELETE http://localhost:8787/user-skills/1

# Delete availability
curl -X DELETE http://localhost:8787/availability/1

# Delete user (cascades to related courses, skills, availability)
curl -X DELETE http://localhost:8787/users/1
```

## Matching Recommendation Scenario Examples

### Scenario 1: Find Study Buddies with Common Courses

```sql
-- This query is implemented in the backend
SELECT u2.* FROM users u1
JOIN courses c1 ON u1.id = c1.user_id
JOIN courses c2 ON c1.course_name = c2.course_name
JOIN users u2 ON c2.user_id = u2.id
WHERE u1.id = 1 AND u2.id != 1
```

### Scenario 2: Find Users with Common Skills

```sql
-- Find other users with common skills as user 1
SELECT DISTINCT u2.* FROM users u1
JOIN user_skills us1 ON u1.id = us1.user_id
JOIN user_skills us2 ON us1.skill_id = us2.skill_id
JOIN users u2 ON us2.user_id = u2.id
WHERE u1.id = 1 AND u2.id != 1
```

### Scenario 3: Find Users Available at the Same Time

```sql
-- Find users available on Monday 14:00-16:00
SELECT DISTINCT u.* FROM users u
JOIN availability a ON u.id = a.user_id
WHERE a.weekday = 1 AND a.time_slot = '14:00-16:00'
AND u.id != 1
```

## WebSocket / Real-Time Recommendation Expansion

Future expandable features:
- Real-time matching notifications
- Online status display
- Instant messaging functionality
- Study group creation and management

## Data Validation Rules

- `username`: 3-50 characters
- `email`: Must be a valid email format
- `study_preference`: Must be 'group', 'one-on-one', or 'both'
- `proficiency_level`: Must be 'beginner', 'intermediate', or 'advanced'
- `weekday`: Integer between 0-6 (0=Sunday, 6=Saturday)
- `time_slot`: String format, recommended "HH:MM-HH:MM"