-- Add ADMIN role to an existing user for testing
-- Replace 'your.email@uiu.edu' with your actual email address

-- Option 1: Add ADMIN to existing user (if you know their email)
UPDATE users 
SET 
    roles = ARRAY['STUDENT', 'ADMIN'],
    active_role = 'ADMIN'
WHERE email = 'your.email@uiu.edu';

-- Option 2: Check current user roles first
SELECT id, email, roles, active_role, created_at
FROM users
WHERE email = 'your.email@uiu.edu';

-- Option 3: Add ADMIN to first user in database
UPDATE users 
SET 
    roles = ARRAY['STUDENT', 'ADMIN'],
    active_role = 'ADMIN'
WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);

-- Verify the update
SELECT id, email, roles, active_role 
FROM users 
WHERE 'ADMIN' = ANY(roles);
