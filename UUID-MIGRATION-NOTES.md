# 🔄 UUID Schema Migration Update

## Changes Summary

Your auth_db actually uses **UUID primary keys** with **two separate tables** (users & profiles), not INTEGER IDs as previously assumed.

## New Schema Structure

### Users Table
- `id`: UUID (primary key)
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `password_hash`: TEXT NOT NULL  
- `role`: VARCHAR(20) DEFAULT 'STUDENT'
- `is_verified`: BOOLEAN DEFAULT false
- `created_at`, `updated_at`: TIMESTAMP WITH TIME ZONE

### Profiles Table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key → users.id)
- `full_name`: VARCHAR(100)
- `student_id`: VARCHAR(50)
- `department`: VARCHAR(50)
- `batch`: VARCHAR(20)
- `phone`: VARCHAR(20)
- `bio`: TEXT
- `avatar_url`: TEXT
- `email_visible`: BOOLEAN DEFAULT true
- `phone_visible`: BOOLEAN DEFAULT true  
- `created_at`, `updated_at`: TIMESTAMP WITH TIME ZONE

## Updated Files

### ✅ Completed:
1. **[auth-service/database-schema.sql](EduSync/auth-service/database-schema.sql)** - Updated to match PgAdmin4 schema
2. **[auth-service/populate-auth-data-NEW.sql](EduSync/auth-service/populate-auth-data-NEW.sql)** - New file with 50 users using UUIDs

### ⚠️ Needs Manual Update:
3. **marketplace-service/populate-marketplace-data.sql** - Replace integer owner_ids with UUIDs
4. **renthub-service/populate-renthub-data.sql** - Replace integer owner_ids/renter_ids with UUIDs

## UUID Mapping Reference

Use these UUIDs when referencing users from marketplace/renthub:

```
VENDORS (001-009):
00000001-0000-0000-0000-000000000001  john.smith@uiu.edu
00000002-0000-0000-0000-000000000002  sarah.johnson@uiu.edu
00000003-0000-0000-0000-000000000003  ahmed.khan@uiu.edu
00000004-0000-0000-0000-000000000004  maria.garcia@uiu.edu
00000005-0000-0000-0000-000000000005  david.chen@uiu.edu
00000006-0000-0000-0000-000000000006  emily.brown@uiu.edu
00000007-0000-0000-0000-000000000007  michael.lee@uiu.edu
00000008-0000-0000-0000-000000000008  lisa.wang@uiu.edu
00000009-0000-0000-0000-000000000009  james.wilson@uiu.edu

PREOWNED SELLERS (010-028):
00000010-0000-0000-0000-000000000010  sarah.rahman@uiu.edu
00000011-0000-0000-0000-000000000011  rafiq.islam@uiu.edu
... (continuing pattern through 028)

RENTAL OWNERS (029-046):
00000029-0000-0000-0000-000000000029  sarah.williams@uiu.edu
00000030-0000-0000-0000-000000000030  mike.chen@uiu.edu
... (continuing pattern through 046)

RENTERS (047-050):
00000047-0000-0000-0000-000000000047  jane.doe@uiu.edu
00000048-0000-0000-0000-000000000048  bob.wilson@uiu.edu
00000049-0000-0000-0000-000000000049  alice.cooper@uiu.edu
00000050-0000-0000-0000-000000000050  mark.johnson@uiu.edu
```

## Migration Steps

1. **Drop old populate-auth-data.sql** (uses wrong schema)
2. **Rename populate-auth-data-NEW.sql** → **populate-auth-data.sql**
3. **Update marketplace SQL**:
   - Change `owner_id` from '1' to '00000001-0000-0000-0000-000000000001'
   - Change `seller_id` from '10' to '00000010-0000-0000-0000-000000000010'
   - Continue pattern for all user references

4. **Update renthub SQL**:
   - Change `owner_id` from '29' to '00000029-0000-0000-0000-000000000029'
   - Change `renter_id` from '47' to '00000047-0000-0000-0000-000000000047'
   - Continue pattern for all user references

## Quick Fix Example

**Before (marketplace):**
```sql
INSERT INTO vendors (id, owner_id, name, type...) VALUES
('a1b2c3d4-1111...', '1', 'UIU Tech Hub', 'STARTUP'...);
```

**After (marketplace):**
```sql
INSERT INTO vendors (id, owner_id, name, type...) VALUES
('a1b2c3d4-1111...', '00000001-0000-0000-0000-000000000001', 'UIU Tech Hub', 'STARTUP'...);
```

## Database Population Order (Updated)

1. Run [auth-service/populate-auth-data-NEW.sql](EduSync/auth-service/populate-auth-data-NEW.sql) → auth_db
2. Run updated marketplace-service/populate-marketplace-data.sql → market_db
3. Run updated renthub-service/populate-renthub-data.sql → rent_db

---

**Status**: Auth file completed ✅  
**Next**: Update marketplace & renthub SQL files with UUID references
