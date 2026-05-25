<div align="center">

# 📚 GoodReads — MERN Edition

### A full-stack book discovery platform with reviews, ratings, and personal reading lists. My deep-dive into the MERN stack at ITI.

<p>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white" />
</p>

</div>

---

## 🎯 What It Does

A GoodReads-inspired book platform built end-to-end with the MERN stack:

- 🔐 User authentication and personal profiles
- 📖 Browse books by title, author, or genre
- ⭐ Write, edit, and delete reviews
- 📚 Manage personal reading lists
- 📱 Responsive across devices

<!-- Add a screenshot or GIF here:  ![Screenshot](docs/screenshot.png) -->

## 🚀 Features

- **User Authentication** — Secure registration and login flows
- **Book Management** — Add, edit, and delete book entries
- **Review System** — Users write, edit, and delete reviews for books
- **Search** — Find books by title, author, or genre
- **Responsive Design** — Optimized for desktop, tablet, mobile

## 🛠️ Tech Stack

| Layer | Stack |
|---|---|
| **Frontend** | React 18 |
| **Backend** | Node.js · Express |
| **Database** | MongoDB |
| **Auth** | JSON Web Tokens (JWT) |

## 🧩 Database Design

The repo includes Entity-Relationship Diagrams (`Erd.drawio`, `Erd.svg`) documenting the data model — books, users, reviews, and reading lists with their relationships.

## 🧠 What I Learned

Building this end-to-end was my deep dive into the MERN stack at ITI:

- **MongoDB schema design** — modeling books, users, reviews, and reading lists with the right balance of references vs embedded documents
- **Express middleware patterns** — auth middleware, error handling, request validation
- **React state management** — keeping reviews and book lists in sync as users interact across pages
- **End-to-end auth flow** — registration, login, JWT issuance, protected routes on both frontend and backend
- **Separation of concerns** — keeping the `Front-End/` and `Back-End/` cleanly decoupled, communicating only through a documented REST API

## 🧑‍💻 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)

### Backend setup
```bash
cd Back-End
npm install
npm start
# Backend runs on port 5000
```

### Frontend setup
```bash
cd Front-End
npm install
npm run dev
```

Once both are running, open `http://localhost:5173` (or the printed Vite URL), register a new account, and start exploring.

## 📂 Project Structure

```
├── Back-End/      # Express + MongoDB API
├── Front-End/     # React frontend
├── Erd.drawio     # ERD source
├── Erd.svg        # ERD rendered
└── proj.sh        # Setup helper script
```

## 📄 License

MIT — ITI bootcamp project. See [LICENSE.md](LICENSE.md).

## 📫 Contact

Built by **Paula Magdy** — [GitHub](https://github.com/PaulaMagdi0) · [LinkedIn](https://www.linkedin.com/in/paula-magdy/) · [Portfolio](https://paulamagdy.framer.website/)
