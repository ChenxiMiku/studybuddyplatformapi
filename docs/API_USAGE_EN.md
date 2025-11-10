# Study Buddy Platform API - Usage Guide

## Overview

Based on your requirements, a complete database schema and RESTful API endpoints have been implemented.

## Database Schema

### 1. Users Table
Stores basic user information:
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email
- `password_hash`: Securely stored password hash
- `goals`: Learning goals (free text)
- `study_preference`: Learning preference ('group', 'one-on-one', 'both')
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

### 2. Courses Table
Courses freely entered by each user:
- `id`: Primary key
- `user_id`: User ID (foreign key)
- `course_name`: Course name
- `created_at`: Creation timestamp

### 3. Skills Table
Preset skill tags list (supports structured recommendations):
- `id`: Primary key
- `skill_name`: Unique skill name
- `created_at`: Creation timestamp

Preset skills include: JavaScript, TypeScript, Python, Java, C++, React, Node.js, Database Design, Machine Learning, Data Structures, Algorithms, Web Development, Mobile Development, Cloud Computing, DevOps

### 4. User_Skills Table
Many-to-many relationship between users and skills:
- `id`: Primary key
- `user_id`: User ID (foreign key)
- `skill_id`: Skill ID (foreign key)
- `proficiency_level`: Proficiency level ('beginner', 'intermediate', 'advanced')
- `created_at`: Creation timestamp

### 5. Availability Table
User's weekly available time slots (supports time matching):
- `id`: Primary key
- `user_id`: User ID (foreign key)
- `weekday`: Day of the week (0=Sunday, 6=Saturday)
- `time_slot`: Time slot (e.g., "09:00-11:00")
- `created_at`: Creation timestamp

## API Endpoints

All endpoints support standard CRUD operations:

### Users API
- `GET /users` - Retrieve user list
- `POST /users` - Create a new user
- `GET /users/:id` - Retrieve individual user information
- `PUT /users/:id` - Update user information
- `DELETE /users/:id` - Delete user

### Courses API
- `GET /courses` - Retrieve course list
- `POST /courses` - Create a new course
- `GET /courses/:id` - Retrieve individual course
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

### Skills API
- `GET /skills` - Retrieve skill list
- `POST /skills` - Create a new skill
- `GET /skills/:id` - Retrieve individual skill
- `PUT /skills/:id` - Update skill
- `DELETE /skills/:id` - Delete skill

### User Skills API
- `GET /user-skills` - Retrieve user-skill relationships list
- `POST /user-skills` - Add skill to user
- `GET /user-skills/:id` - Retrieve individual user-skill relationship
- `PUT /user-skills/:id` - Update user skill proficiency level
- `DELETE /user-skills/:id` - Delete user-skill relationship

### Availability API
- `GET /availability` - Retrieve availability list
- `POST /availability` - Add availability
- `GET /availability/:id` - Retrieve individual availability
- `PUT /availability/:id` - Update availability
- `DELETE /availability/:id` - Delete availability

## API Features

### Search Functionality
- Users: Search by username, email, goals
- Courses: Search by course_name
- Skills: Search by skill_name

### Sorting
- Users: Default by id descending
- Courses: Default by id descending
- Skills: Default by skill_name ascending
- User Skills: Default by id descending
- Availability: Default by weekday, time_slot ascending

### Pagination
All list endpoints support pagination parameters

## Example Requests

### Create User
```json
POST /users
{
  "username": "john_doe",
  "email": "john@example.com",
  "password_hash": "hashed_password_here",
  "goals": "Learn full-stack development",
  "study_preference": "group"
}
```

### Add Course
```json
POST /courses
{
  "user_id": 1,
  "course_name": "Introduction to Computer Science"
}
```

### Add User Skill
```json
POST /user-skills
{
  "user_id": 1,
  "skill_id": 1,
  "proficiency_level": "intermediate"
}
```

### Add Availability
```json
POST /availability
{
  "user_id": 1,
  "weekday": 1,
  "time_slot": "14:00-16:00"
}
```

## Database Migration

Database migration files are located at:
- `migrations/0002_add_users_and_related_tables.sql`

Run migrations to create all necessary tables and indexes.

## Security Considerations

1. **Password Security**: Store hashed passwords in the `password_hash` field
2. **Foreign Key Constraints**: All related tables use foreign key constraints, supporting cascading deletes
3. **Unique Constraints**: Fields like username, email, skill_name have unique constraints
4. **Index Optimization**: Added indexes for frequently queried fields

## Scalability

- Decoupled table structure supports multiple users, courses, skills, and time slots
- Many-to-many relationship tables (user_skills) support complex skill matching
- Availability table supports flexible time slot matching
- Preset skill list can be easily expanded

## OpenAPI Documentation

After starting the server, visit the root path `/` to view the complete OpenAPI documentation.