# ARU-IOCS (Inter Office Communication System)

Laravel + Inertia + React system for inter-office communications.

## 1) Tech Stack and Versions Used

This project is configured with:

- PHP: `^8.2`
- Laravel Framework: `^10.0`
- Inertia Laravel: `^1.0`
- Ziggy: `^2.6`
- Node.js: recommended `18.x` or `20.x` LTS
- npm: recommended `9+`
- React: `^18.2.0`
- Vite: `^4.0.0`
- Database: MySQL (XAMPP)

## 2) Requirements Before Running

Install these first:

- [XAMPP](https://www.apachefriends.org/index.html) (Apache + MySQL + PHP)
- [Composer](https://getcomposer.org/)
- [Node.js LTS](https://nodejs.org/)
- [Git](https://git-scm.com/)

Make sure these commands work in terminal:

- `php -v`
- `composer -V`
- `node -v`
- `npm -v`

## 3) Clone Project

```bash
git clone <your-repository-url>
cd ARU---IOCS
```

## 4) Create Database in XAMPP (phpMyAdmin)

1. Open XAMPP Control Panel.
2. Start `Apache` and `MySQL`.
3. Open browser: [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
4. Click **New**.
5. Create database with this name:
   - `aru_iocs`
6. Use collation `utf8mb4_general_ci` (or default utf8mb4).

## 5) Environment Setup

Copy env file:

```bash
copy .env.example .env
```

Open `.env` and confirm DB settings:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aru_iocs
DB_USERNAME=root
DB_PASSWORD=
```

> If your MySQL root has a password, set `DB_PASSWORD` accordingly.

## 6) Install Dependencies

Install PHP dependencies:

```bash
composer install
```

Install Node dependencies:

```bash
npm install
```

## 7) Generate App Key

```bash
php artisan key:generate
```

## 8) Run Database Migrations

```bash
php artisan migrate
```

If you want to reset and re-run all migrations:

```bash
php artisan migrate:fresh
```

## 9) Run the System

### Option A (recommended in this project)
Run everything with one command:

```bash
composer run dev
```

This starts:
- Laravel server
- Queue listener
- Laravel logs tail
- Vite dev server

### Option B (manual, separate terminals)

Terminal 1:
```bash
php artisan serve
```

Terminal 2:
```bash
npm run dev
```

Open app in browser:
- Laravel URL: [http://127.0.0.1:8000](http://127.0.0.1:8000)

## 10) Build for Production

```bash
npm run build
```

## 11) Useful Commands

- Clear caches:
  ```bash
  php artisan optimize:clear
  ```
- Run tests:
  ```bash
  php artisan test
  ```

## 12) Common Troubleshooting

- **SQLSTATE / DB connection errors**
  - Check XAMPP MySQL is running.
  - Check `.env` DB credentials and DB name.
  - Re-run: `php artisan config:clear`

- **Frontend not updating / blank page**
  - Make sure `npm run dev` is running.
  - Hard refresh browser (`Ctrl + F5`).

- **Class not found / route errors**
  - Run:
    ```bash
    composer dump-autoload
    php artisan optimize:clear
    ```

## 13) First-Time Setup Quick Commands (Copy-Paste)

```bash
git clone <your-repository-url>
cd ARU---IOCS
copy .env.example .env
composer install
npm install
php artisan key:generate
php artisan migrate
composer run dev
```

