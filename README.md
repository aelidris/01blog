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

### 1. Create the database

```sql
CREATE DATABASE blog01;
```

### 2. Configure credentials

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/blog01
spring.datasource.username=YOUR_PG_USER
spring.datasource.password=YOUR_PG_PASSWORD
```

### 3. Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`.

> **First admin account:** Register normally via `/api/auth/register`, then manually set the role in the database:
> ```sql
> UPDATE users SET role = 'ADMIN' WHERE username = 'your_username';
> ```

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


# Start with Docker
```
docker compose up --build
```