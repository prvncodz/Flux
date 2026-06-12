# Flux

> A social media platform built for tech enthusiasts.


![Flux Interface](./client/src/components/assets/interface.png)

---

## What is Flux?

Flux is a full-stack MERN social platform where tech people share ideas, post content, and engage with a community — think Twitter meets a tech blog. Built end-to-end with a deep focus on understanding the full MERN stack.

---

## Features

- Auth — register, login, JWT-based sessions
- Posts — create, like, comment (Twitter-style)
- Profiles — customizable user profiles
- Playlists — organize and save content
- Dashboard — personal activity overview
- Watch History & Liked Videos

---

## Tech Stack

| Layer    | Tech                              |
|----------|-----------------------------------|
| Frontend |React, TailwindCSS, Zustand, Motion|
| Backend  | Node.js, Express                  |
| Database | MongoDB (Mongoose)                |

---

## Project Structure

```
Flux/
├── src/        # Express backend
└── client/     # React frontend
```

---

## Getting Started

### 1. Clone & install backend

```bash
git clone https://github.com/Prvncodz/Flux.git
cd Flux
npm install
```

### 2. Setup environment

```bash
cp .env.sample .env
# Fill in your values
```

```env
PORT=8000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NODE_ENV=development
```

### 3. Install & run frontend

```bash
cd client
npm install
npm run dev
```

### 4. Run backend

```bash
# From root
npm run dev
```

---

## Scripts

```bash
# Backend
npm run dev       # Development
npm start         # Production

# Frontend (inside /client)
npm run dev       # Development
npm run build     # Production build
```

---

## License

MIT
