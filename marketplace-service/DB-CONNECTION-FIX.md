# Database Connection Troubleshooting Guide

## 🔴 Error: "remaining connection slots are reserved for roles with the SUPERUSER attribute"

### What This Means:
Your PostgreSQL database has run out of available connections. This happens when:
1. Too many services are connecting to the same database
2. Connections are not being properly closed
3. Connection pool limits exceed database capacity

---

## ✅ Solutions Applied

### 1. Updated Connection Pool Settings
File: `src/config/db.js`

**Changes:**
- ✅ Added `max: 10` - Limits maximum connections to 10
- ✅ Added `min: 2` - Keeps 2 connections ready
- ✅ Added `idleTimeoutMillis: 30000` - Closes idle connections after 30s
- ✅ Added `connectionTimeoutMillis: 5000` - Faster timeout for failed connections
- ✅ Added `allowExitOnIdle: true` - Allows pool to exit when idle
- ✅ Added graceful shutdown handlers (SIGINT, SIGTERM)

---

## 🔧 Immediate Actions to Take

### Step 1: Restart Marketplace Service
```powershell
# Stop the current running service (Ctrl+C)
# Then restart:
cd C:\EduSync\EduSync\marketplace-service
npm start
```

### Step 2: Check Active Connections
Run this SQL query to see all active connections:

```sql
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query,
    state_change
FROM pg_stat_activity
WHERE datname = 'your_database_name'
ORDER BY state_change DESC;
```

### Step 3: Kill Hanging Connections (If Needed)
If you see idle connections, you can terminate them:

```sql
-- See idle connections
SELECT pid, usename, application_name, state 
FROM pg_stat_activity 
WHERE state = 'idle' AND datname = 'your_database_name';

-- Kill specific connection
SELECT pg_terminate_backend(12345); -- Replace 12345 with actual PID
```

### Step 4: Close All Node.js Services and Restart
```powershell
# Close all terminal windows running Node services
# Then start them one by one:

# 1. Gateway
cd C:\EduSync\EduSync\gateway
npm start

# 2. Marketplace Service (in new terminal)
cd C:\EduSync\EduSync\marketplace-service
npm start

# 3. Auth Service (in new terminal)
cd C:\EduSync\EduSync\auth-service
npm start
```

---

## 🛡️ Prevention Tips

### 1. Always Close Services Properly
- Use `Ctrl+C` instead of closing terminal windows
- This triggers graceful shutdown handlers

### 2. Restart Services Periodically
If you're doing lots of testing/development:
```powershell
# Every few hours, restart the service
Ctrl+C  # Stop
npm start  # Restart
```

### 3. Check PostgreSQL Max Connections
Your database might have a low connection limit. Check with:

```sql
SHOW max_connections;
```

If it's low (like 20), you'll need to:
- Reduce pool sizes in all services
- Contact your database admin to increase limit

### 4. Connection Math
If you have:
- Auth Service (max: 20 connections)
- Marketplace Service (max: 10 connections)
- Total needed: **30 connections**

Your PostgreSQL `max_connections` should be **at least 35-40** to have buffer.

---

## 🔍 Monitoring Connection Health

### Create a Test Endpoint
Add this to `marketplace-service/server.js`:

```javascript
app.get('/health/db', async (req, res) => {
    try {
        const result = await require('./src/config/db').query('SELECT NOW()');
        const poolStatus = require('./src/config/db').pool;
        
        res.json({
            status: 'healthy',
            time: result.rows[0].now,
            pool: {
                total: poolStatus.totalCount,
                idle: poolStatus.idleCount,
                waiting: poolStatus.waitingCount
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});
```

Test it: `http://localhost:3002/health/db`

---

## 🚨 Emergency: Reset All Connections

If nothing works, run this SQL to kill ALL connections to your database:

```sql
-- ⚠️ WARNING: This will disconnect EVERYONE from the database
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'your_database_name'
  AND pid <> pg_backend_pid();
```

Then restart all your services.

---

## 📊 Recommended Pool Settings

For development with multiple services:

| Service | Max Connections | Reasoning |
|---------|----------------|-----------|
| Auth Service | 5-10 | Low traffic in dev |
| Marketplace Service | 5-10 | Low traffic in dev |
| Gateway | 0 | Doesn't connect to DB |
| Chat Service | 5-10 | Low traffic in dev |

**Total: 15-30 connections max**

For production: Scale based on actual load testing.

---

## ✅ Checklist

- [ ] Updated `marketplace-service/src/config/db.js` with pool settings
- [ ] Restarted marketplace service
- [ ] Verified no error messages in terminal
- [ ] Tested marketplace API endpoints
- [ ] Frontend loads data successfully
- [ ] No more connection errors in logs

---

## 🆘 Still Having Issues?

1. **Check .env file exists** in marketplace-service folder
2. **Verify DB credentials** are correct
3. **Test connection manually** with `psql` or pgAdmin
4. **Check firewall/network** - can you reach the database?
5. **Review PostgreSQL logs** for more details

---

💡 **Quick Test:**
```powershell
cd C:\EduSync\EduSync\marketplace-service
node -e "require('./src/config/db').query('SELECT 1').then(() => console.log('✅ Connected')).catch(e => console.error('❌ Error:', e.message))"
```

This should print `✅ Connected` if everything is working.
