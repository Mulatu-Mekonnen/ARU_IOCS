# 🚀 ARU IOCS - Setup & Run Guide

## ✅ What Was Fixed

### 1. **Port Forwarding Issues**
- ✅ Updated `APP_URL` to use `0.0.0.0:8000`
- ✅ Fixed Vite dev server configuration (disabled HMR)
- ✅ Configured Vite to use `127.0.0.1` for dev environment

### 2. **Database Configuration**
- ✅ Enabled SQLite database (available in dev container)
- ✅ Future: MySQL/Aiven credentials are in `.env` (commented)
- ✅ Migrated all database tables successfully

### 3. **Server Errors Fixed**
- ✅ Laravel 500 error → Database now setup
- ✅ Vite 404 error → Dev server now properly configured
- ✅ Connection refused → Servers configured for dev container

---

## 🏃 **Quick Start (Choose One)**

### **Option A: Automated Script (Recommended)**

```bash
/workspaces/ARU---IOCS/run-dev.sh
```

This will:
- ✅ Clean up any existing servers
- ✅ Setup SQLite database
- ✅ Start Laravel server on port 8000
- ✅ Start Vite dev server
- ✅ Display running status

### **Option B: Manual Terminal Commands**

**Terminal 1 - Laravel Server:**
```bash
cd /workspaces/ARU---IOCS/laravel-migration
php artisan serve --host=127.0.0.1 --port=8000
```

**Terminal 2 - Vite Dev Server:**
```bash
cd /workspaces/ARU---IOCS/laravel-migration
npm run dev
```

---

## 🌐 **Access Your Application**

Once servers are running:

```
🔗 http://localhost:8000
```

**Default Test Credentials:**
- Email: `admin@example.com`
- Password: `password`

---

## 🗄️ **Database Setup**

### Current Status: ✅ SQLite (Working)
- Database file: `/laravel-migration/database/database.sqlite`
- Auto-created and migrated on first run

### Future: MySQL with Aiven
When you want to use Aiven MySQL instead:

1. **Uncomment in `.env`:**
```env
DB_CONNECTION=mysql
DB_HOST=aru-iocs-mulatumekonnen514-b81c.e.aivencloud.com
DB_PORT=21685
DB_DATABASE=defaultdb
DB_USERNAME=avnadmin
DB_PASSWORD=YOUR_PASSWORD
```

2. **Install MySQL PHP driver:**
```bash
sudo apt-get update
sudo apt-get install php-mysql
```

3. **Run migrations:**
```bash
php artisan migrate --force
```

---

## 🛠️ **Common Issues & Solutions**

### Port Already in Use
```bash
# Kill existing processes
pkill -f "php artisan serve"
pkill -f "vite"

# Then start again
```

### Database Migrations Failed
```bash
# Reset and re-migrate
rm database/database.sqlite
php artisan migrate --force
```

### Vite/React Not Updating
```bash
# Clear caches and restart
php artisan config:clear
npm run dev
```

### Laravel Shows 500 Error
```bash
# Check logs
tail -20 storage/logs/laravel.log

# Clear cache
php artisan config:clear
php artisan cache:clear
```

---

## 📊 **Project Structure**

```
laravel-migration/
├── app/
│   ├── Http/Controllers/      # All dashboard controllers
│   └── Models/                # Database models
├── resources/
│   ├── js/Pages/Dashboard/    # React Inertia pages
│   │   ├── Admin/
│   │   ├── Head/
│   │   ├── Staff/
│   │   ├── Viewer/
│   │   └── Login.jsx
│   └── css/
├── routes/
│   └── web.php                # All routes
├── database/
│   ├── migrations/
│   └── database.sqlite        # SQLite database
├── .env                       # Configuration (with Aiven credentials)
├── vite.config.js            # Vite configuration
└── package.json
```

---

## 🔐 **Environment File (.env)**

Key variables currently set:

```env
APP_NAME=Laravel
APP_ENV=local
APP_DEBUG=true
APP_URL=http://0.0.0.0:8000

DB_CONNECTION=sqlite

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# Aiven MySQL (commented out - uncomment when ready)
# DB_CONNECTION=mysql
# DB_HOST=aru-iocs-mulatumekonnen514-b81c.e.aivencloud.com
# DB_PORT=21685
```

---

## 📝 **User Roles**

The system has 4 user roles with different dashboards:

1. **Admin** - Full system control
2. **Head** - Office management  
3. **Staff** - Create and submit agendas
4. **Viewer** - Read-only access

Each role has:
- ✅ Custom dashboard
- ✅ Role-specific pages
- ✅ Proper middleware guards
- ✅ Exact UI matching original Next.js design

---

## 🎯 **Next Steps**

1. ✅ Run the application
2. ✅ Test login functionality
3. ✅ Verify all 4 panel dashboards work
4. ✅ Test agenda creation (Staff role)
5. ✅ Test approval workflows (Head/Admin roles)
6. ✅ When ready: Switch to Aiven MySQL

---

## 📞 **Need Help?**

Check the logs:
```bash
tail -f storage/logs/laravel.log
```

Check database:
```bash
sqlite3 database/database.sqlite ".schema"
```

---

**Happy coding! 🎉**
