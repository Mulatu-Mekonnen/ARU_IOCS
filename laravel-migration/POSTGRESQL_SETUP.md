
# 🐘 **PostgreSQL (Neon) Deployment Guide**

## Current Database Setup

| Environment | Database | Status | File |
|-------------|----------|--------|------|
| **Local Development** | SQLite | ✅ Active | `.env` → `DB_CONNECTION=sqlite` |
| **Production** | PostgreSQL (Neon) | 📋 Ready | `.env` → Uncomment & change `DB_CONNECTION=pgsql` |

---

## 📌 **PostgreSQL Neon Credentials (from .env)**

```env
DATABASE_URL="postgresql://neondb_owner:npg_76ASlnCktFWo@ep-crimson-tree-amm21ceu-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Parsed credentials:
Host: ep-crimson-tree-amm21ceu-pooler.c-5.us-east-1.aws.neon.tech
Port: 5432
Database: neondb
Username: neondb_owner
Password: npg_76ASlnCktFWo
SSL Mode: require
```

---

## 🚀 **Deployment Steps for PostgreSQL**

### **Step 1: Update Environment File**

In `.env`, uncomment and activate PostgreSQL:

```env
# Change this:
DB_CONNECTION=sqlite

# To this:
DB_CONNECTION=pgsql
DATABASE_URL="postgresql://neondb_owner:npg_76ASlnCktFWo@ep-crimson-tree-amm21ceu-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DB_HOST=ep-crimson-tree-amm21ceu-pooler.c-5.us-east-1.aws.neon.tech
DB_PORT=5432
DB_DATABASE=neondb
DB_USERNAME=neondb_owner
DB_PASSWORD=npg_76ASlnCktFWo
DB_SSLMODE=require
```

### **Step 2: Ensure PHP PostgreSQL Extension**

Make sure your production server has PHP PostgreSQL support:

```bash
# For Ubuntu/Debian
apt-get install php-pgsql

# For Alpine
apk add php-pdo_pgsql

# Verify installation
php -m | grep pgsql
```

### **Step 3: Run Migrations**

```bash
cd /path/to/project
php artisan config:clear
php artisan migrate --force
```

### **Step 4: Verify Database Connection**

```bash
php artisan tinker
DB::connection('pgsql')->select('select 1');
```

Expected output: `true` ✅

---

## 🔧 **Database Configuration (config/database.php)**

PostgreSQL connection options:

```php
'pgsql' => [
    'driver' => 'pgsql',
    'url' => env('DATABASE_URL'),
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '5432'),
    'database' => env('DB_DATABASE', 'laravel'),
    'username' => env('DB_USERNAME', 'root'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => env('DB_CHARSET', 'utf8'),
    'prefix' => '',
    'prefix_indexes' => true,
    'search_path' => 'public',
    'sslmode' => env('DB_SSLMODE', 'prefer'),
],
```

---

## 🔄 **Switching Between Databases**

### **To use PostgreSQL:**
```env
DB_CONNECTION=pgsql
```

### **To use SQLite (local):**
```env
DB_CONNECTION=sqlite
```

### **To use MySQL:**
```env
DB_CONNECTION=mysql
```

---

## ✅ **Production Checklist**

Before deploying to production with PostgreSQL:

- [ ] Update `.env` with Neon credentials
- [ ] Install `php-pgsql` extension on server
- [ ] Run `php artisan migrate --force`
- [ ] Test database connection: `php artisan tinker`
- [ ] Verify SSL mode: `sslmode=require`
- [ ] Check Laravel logs for errors: `storage/logs/laravel.log`
- [ ] Test login functionality
- [ ] Backup Neon database if migrating from SQLite

---

## 🆘 **Troubleshooting**

### **Error: "could not find driver"**
```
Solution: Install PHP PostgreSQL extension
apt-get install php-pgsql
```

### **Error: "SSL connection error"**
```
Check DB_SSLMODE in .env
For Neon: DB_SSLMODE=require
```

### **Error: "could not translate host name"**
```
Verify hostname in DB_HOST
Ensure you can ping: ep-crimson-tree-amm21ceu-pooler.c-5.us-east-1.aws.neon.tech
```

### **Error: "authentication failed"**
```
Verify credentials in .env:
- DB_USERNAME
- DB_PASSWORD
```

---

## 📊 **Database Migration (SQLite → PostgreSQL)**

If you need to migrate data from SQLite to PostgreSQL:

### **Option 1: Using Laravel (Recommended)**

```bash
# Backup SQLite
cp database/database.sqlite database/database.sqlite.backup

# Switch to PostgreSQL
# Edit .env: DB_CONNECTION=pgsql

# Run migrations on PostgreSQL
php artisan migrate --force

# Seed demo data if needed
php artisan db:seed --class=DatabaseSeeder
```

### **Option 2: Using Database Tools**

If you have existing data in SQLite to migrate:

```bash
# Export from SQLite
sqlite3 database/database.sqlite .schema > schema.sql
sqlite3 database/database.sqlite .dump > data.sql

# Import to PostgreSQL (requires manual conversion)
# PostgreSQL dialect is slightly different than SQLite
```

---

## 🌐 **Neon Specific Features**

Your Neon setup includes:

- ✅ PostgreSQL 17 compatible
- ✅ SSL/TLS encrypted connections
- ✅ Connection pooling enabled
- ✅ Automatic daily backups
- ✅ High availability

### **Neon Console**

Access your database:
1. Go to https://console.neon.tech
2. Login with your credentials
3. Select project: `neondb`
4. Browse tables and data

---

## 📝 **Current Configuration Summary**

```
┌─────────────────────────────────────┐
│  LOCAL DEVELOPMENT (SQLite)         │
├─────────────────────────────────────┤
│ ✅ Database: database/database.sqlite
│ ✅ No driver needed
│ ✅ Auto-created on migration
│ ✅ Perfect for testing
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  PRODUCTION (PostgreSQL - Neon)     │
├─────────────────────────────────────┤
│ Host: ep-crimson-tree-amm21ceu-...
│ Database: neondb
│ User: neondb_owner
│ SSL: require
│ Pool: Enabled
│ Region: AWS us-east-1
└─────────────────────────────────────┘
```

---

## ✅ **Next Steps**

1. ✅ Keep SQLite for local development
2. 📋 When deploying: Uncomment PostgreSQL in `.env`
3. 📋 Install PHP PostgreSQL extension on production server
4. 📋 Run migrations: `php artisan migrate --force`
5. ✅ Test and deploy!

---

**Documentation**: 2026-03-26
