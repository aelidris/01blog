# 01Blog — Social Blogging Platform

A fullstack social blogging platform built with **Spring Boot** (backend) and **Angular 17** (frontend).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2, Spring Security, JWT |
| Frontend | Angular 17, Angular Material |
| Database | PostgreSQL |
| Auth | JWT (stateless) |
| File Storage | Local filesystem (`/uploads`) |

---

## Project Structure

```
01blog/
├── backend/          # Spring Boot application
│   └── src/main/java/com/zerone/blog/
│       ├── config/        SecurityConfig, FileStorageConfig
│       ├── controller/    Auth, User, Post, Report, Admin
│       ├── dto/           Request/Response DTOs
│       ├── entity/        User, Post, Comment, Report, Notification
│       ├── enums/         Role, ReportStatus
│       ├── exception/     Global error handling
│       ├── repository/    Spring Data JPA repos
│       ├── security/      JwtUtil, JwtAuthFilter
│       └── service/       Business logic services
└── frontend/         # Angular application
    └── src/app/
        ├── core/          Models, Services, Guards, Interceptors
        ├── features/      Auth, Feed, Post, Profile, Admin, Notifications
        └── shared/        Navbar, ReportModal reusable components
```

---

## Prerequisites

- Java 17+
- Node.js 18+ & npm
- PostgreSQL 14+

---

## Running the Backend

### 1. Start the Database

Choose **one** of the methods below depending on how you run PostgreSQL:

* **Option A: Using Docker (Recommended if you don't have local root access)**
  Run this container command. It will automatically create the `blog01` database for you:
  ```bash
  docker run --name local-postgres \
    -e POSTGRES_DB=blog01 \
    -e POSTGRES_USER=aelidris \
    -e POSTGRES_PASSWORD=01blog_pass \
    -p 5432:5432 \
    -d postgres:15

* **Option B: Using a Native Local PostgreSQL Installation**
  Run your local PostgreSQL service, connect to your database shell, and create the database:
  ```sql
  CREATE DATABASE blog01;
  ```

### 3. Start the backend

```bash
cd backend
mvn wrapper:wrapper
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`.

> **First admin account:** Register normally via `/api/auth/register`, then manually set the role in the database:
> ```sql
> UPDATE users SET role = 'ADMIN' WHERE username = 'your_username';
> ```

### Default Admin Account
When the application starts for the first time, a default admin account is automatically created:
* **Username:** `admin`
* **Password:** `123456`


---

## Running the Frontend

```bash
cd frontend
npm install
npm start
```

The app will be available at `http://localhost:4200`.

---

## API Endpoints Summary

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Users
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/users/me` | Current user profile |
| PUT | `/api/users/me` | Update bio |
| POST | `/api/users/me/avatar` | Upload avatar |
| GET | `/api/users/{id}` | Get user by ID |
| GET | `/api/users/username/{username}/block` | Get public profile |
| POST | `/api/users/{id}/subscribe` | Subscribe |
| DELETE | `/api/users/{id}/subscribe` | Unsubscribe |
| GET | `/api/users/me/notifications` | Get notifications |
| POST | `/api/users/me/notifications/read` | Mark all read |

### Posts
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/posts/feed` | Feed (subscriptions) |
| GET | `/api/posts/user/{userId}` | User's posts |
| GET | `/api/posts/{id}` | Single post |
| POST | `/api/posts` | Create post (multipart) |
| PUT | `/api/posts/{id}` | Update post (multipart) |
| DELETE | `/api/posts/{id}` | Delete post |
| POST | `/api/posts/{id}/like` | Toggle like |
| POST | `/api/posts/{id}/comments` | Add comment |
| DELETE | `/api/posts/comments/{id}` | Delete comment |

### Reports
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/reports` | Submit a report |

### Admin (ADMIN role required)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/admin/users` | All users |
| POST | `/api/admin/users/{id}/ban` | Ban user |
| POST | `/api/admin/users/{id}/unban` | Unban user |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET | `/api/admin/posts` | All posts |
| POST | `/api/admin/posts/{id}/hide` | Hide post |
| POST | `/api/admin/posts/{id}/unhide` | Unhide post |
| DELETE | `/api/admin/posts/{id}` | Delete post |
| GET | `/api/admin/reports` | All reports |
| POST | `/api/admin/reports/{id}/resolve` | Resolve/dismiss report |

---

## Features Implemented

- ✅ User registration, login, JWT authentication
- ✅ Role-based access control (USER / ADMIN)
- ✅ User public profile pages ("blocks")
- ✅ Subscribe / unsubscribe to users
- ✅ New-post notifications for subscribers
- ✅ Create / edit / delete posts with image or video upload
- ✅ Like and comment on posts
- ✅ Report users for inappropriate content
- ✅ Notification bell with unread count
- ✅ Admin panel: manage users (ban/unban/delete)
- ✅ Admin panel: manage posts (hide/unhide/delete)
- ✅ Admin panel: handle reports (resolve/dismiss)
- ✅ Responsive UI with Angular Material


## Running with Docker

If you prefer running the application using Docker, make sure you have Docker and Docker Compose installed, then run:

```bash
docker compose up --build