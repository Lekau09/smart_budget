# Backend (XAMPP) Setup — SmartBudget

1. Start XAMPP: run Apache and MySQL.

2. Create database & tables:
   - Open phpMyAdmin (http://localhost/phpmyadmin) and run:

```sql
CREATE DATABASE smart_budget CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_budget;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(10,2),
  category VARCHAR(100),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

3. Copy the `backend` folder from this project to your XAMPP htdocs folder:
   - Source: `.../Project-smart-budget/Project-smart-budget/backend`
   - Destination: `C:\xampp\htdocs\smart_budget`

4. Visit endpoints to test:
   - Signup: POST http://localhost/smart_budget/api/signup.php
   - Login:  POST http://localhost/smart_budget/api/login.php
   - User:   GET  http://localhost/smart_budget/api/user.php?id=1

5. Update React app:
   - The React auth hook uses `http://localhost/smart_budget/api` by default. Ensure Apache serves backend at that path.

6. Security:
   - For production, implement JWT tokens, HTTPS, prepared statements (already used), and don't allow wide CORS origins.
