# 🎓 PlacePro - Placement Preparation Portal

A full-stack placement preparation platform with aptitude tests, coding challenges, leaderboard, progress tracking, and more.

## 🚀 Features

| Feature | Description |
|---|---|
| 🧠 Aptitude Tests | Quantitative, Logical, Verbal, Technical — with timer, navigator, review |
| 💻 Coding Editor | In-browser code editor with multi-language support |
| 🏆 Leaderboard | Overall, Coding, Aptitude, Streak, Weekly, College boards |
| 📊 Progress Tracking | Heatmap, category breakdown, submission history |
| ⚡ Daily Challenge | Fresh problem every day |
| 🎯 Interview Experiences | Real placement stories with like/share |
| 📝 Notes | Colorful sticky-note style personal notes |
| 👤 Profile | Full profile with badges, stats, skills |
| 🔐 Auth | JWT-based register/login with streak tracking |

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router 6, Axios, React Toastify
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT + bcryptjs
- **Docker**: Docker Compose for easy deployment

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone / Extract the project
```bash
cd placement-portal
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET

npm install

# Seed the database with sample data
npm run seed
# OR: node seed.js

# Start the backend
npm run dev      # development (with nodemon)
# OR
npm start        # production
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm start
```

### 4. Open in browser
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

### 🔑 Demo Credentials
| Role | Email | Password |
|---|---|---|
| Student | student@demo.com | demo123 |
| Admin | admin@demo.com | admin123 |

---

## 🐳 Docker Setup (Easiest)

```bash
# From root directory
docker-compose up --build

# Then seed the database
docker exec placement_portal_backend node seed.js
```

Access at: http://localhost:3000

---

## 📁 Project Structure

```
placement-portal/
├── backend/
│   ├── models/
│   │   ├── User.js              # User with stats, badges, streak
│   │   ├── AptitudeQuestion.js  # MCQ questions
│   │   ├── AptitudeTest.js      # Test sessions
│   │   ├── CodingQuestion.js    # Coding problems
│   │   ├── Submission.js        # Code submissions
│   │   ├── Note.js              # Personal notes
│   │   └── Interview.js         # Interview experiences
│   ├── routes/
│   │   ├── auth.js              # Register, login, profile
│   │   ├── aptitude.js          # Tests, questions, results
│   │   ├── coding.js            # Problems, submit, bookmarks
│   │   ├── leaderboard.js       # Global, weekly, college
│   │   ├── progress.js          # Analytics, heatmap
│   │   ├── notes.js             # CRUD notes
│   │   ├── interviews.js        # Experiences, likes
│   │   └── users.js             # User profiles
│   ├── middleware/
│   │   └── auth.js              # JWT middleware
│   ├── seed.js                  # Sample data seeder
│   ├── server.js                # Express app
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js   # Global auth state
│   │   ├── components/
│   │   │   └── Layout.js        # Sidebar + shell
│   │   ├── pages/
│   │   │   ├── Dashboard.js     # Home with stats
│   │   │   ├── AptitudeList.js  # Test configuration
│   │   │   ├── AptitudeTest.js  # Live test with timer
│   │   │   ├── AptitudeResult.js # Score + review
│   │   │   ├── CodingList.js    # Problem list
│   │   │   ├── CodingEditor.js  # Code editor
│   │   │   ├── Leaderboard.js   # Rankings
│   │   │   ├── Progress.js      # Analytics
│   │   │   ├── InterviewExp.js  # Stories
│   │   │   ├── Notes.js         # Personal notes
│   │   │   ├── Profile.js       # User profile
│   │   │   ├── DailyChallenge.js
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── App.js               # Routes
│   │   └── index.css            # Global dark theme
│   └── public/
│       └── index.html
└── docker-compose.yml
```

---

## 🔧 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/placement_portal
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Aptitude
- `GET /api/aptitude/questions` - List questions
- `POST /api/aptitude/start-test` - Start test
- `POST /api/aptitude/submit-test/:id` - Submit test
- `GET /api/aptitude/history` - Test history
- `POST /api/aptitude/questions` - Add question (admin)
- `POST /api/aptitude/questions/bulk` - Bulk add (admin)

### Coding
- `GET /api/coding/questions` - List problems
- `GET /api/coding/questions/:id` - Get problem
- `POST /api/coding/submit/:id` - Submit solution
- `GET /api/coding/submissions` - User submissions
- `POST /api/coding/bookmark/:id` - Toggle bookmark
- `GET /api/coding/daily-challenge` - Daily problem

### Leaderboard
- `GET /api/leaderboard` - Global leaderboard
- `GET /api/leaderboard/weekly` - Weekly board
- `GET /api/leaderboard/college` - College board

### Progress
- `GET /api/progress` - Full progress data
- `GET /api/progress/solved` - Solved questions

### Notes
- `GET /api/notes` - User's notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Interviews
- `GET /api/interviews` - All experiences
- `POST /api/interviews` - Share experience
- `POST /api/interviews/:id/like` - Like/unlike

---

## 🎯 Adding Questions (Admin)

Use the API to bulk-add questions:

```bash
# Add aptitude questions
curl -X POST http://localhost:5000/api/aptitude/questions/bulk \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"questions": [...]}'

# Add coding question
curl -X POST http://localhost:5000/api/coding/questions \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License — free to use and modify for educational purposes.
