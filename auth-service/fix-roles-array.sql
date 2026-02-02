-- Fix roles array to remove duplicate lowercase entries
-- This script cleans up the roles array to only contain uppercase role names

-- Remove any lowercase 'student' from roles array and keep only 'STUDENT'
UPDATE users 
SET roles = ARRAY['STUDENT'],
    active_role = 'STUDENT'
WHERE 'student' = ANY(roles) 
  AND 'STUDENT' = ANY(roles)
  AND array_length(roles, 1) > 1;

-- Fix any users with only lowercase 'student' role
UPDATE users 
SET roles = ARRAY['STUDENT'],
    active_role = 'STUDENT'
WHERE roles = ARRAY['student'];

-- Fix any users with lowercase 'vendor' role  
UPDATE users 
SET roles = array_replace(roles, 'vendor', 'VENDOR')
WHERE 'vendor' = ANY(roles);

-- Fix any users with lowercase 'admin' role
UPDATE users 
SET roles = array_replace(roles, 'admin', 'ADMIN')
WHERE 'admin' = ANY(roles);

-- Fix active_role to be uppercase
UPDATE users 
SET active_role = UPPER(active_role)
WHERE active_role IS NOT NULL;

-- Verify the changes
SELECT id, email, roles, active_role 
FROM users 
WHERE email = 'mkhan223754@bscse.uiu.ac.bd';

-- Check all users to ensure roles are correct
SELECT id, email, roles, active_role, role as deprecated_role
FROM users 
ORDER BY email;
