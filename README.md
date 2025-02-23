# 🎶 GROUPIE TRACKER 🌟

## 📖 Description
**Groupie Tracker** is a web-based application built with Go that allows users to explore the world of artists, their music, and upcoming concert dates. Fetching data from an API, it dynamically visualizes artists in fun and engaging ways through blocks, cards, and lists. It's all about bringing artists and their journeys to life, making it easy for users to track their tour dates, concerts, and other fun facts!

With interactive modals, smooth animations, and a responsive design, **Groupie Tracker** ensures an engaging and smooth experience.

---

## 🧑‍🤝‍🧑 Authors

- **Georgia (gmarouli)**: The creative force behind the design, Georgia blends artistic vision with technical expertise to make Groupie Tracker both visually stunning and highly functional. When not coding, you can find her attending concerts or dreaming up new features! 👩🎨🎶

- **Dilhan (daslamac)**: The backend wizard who makes everything run seamlessly. Dilhan’s efficient clean code and problem-solving skills keep the app ticking. Outside of coding, she’s probably jamming out to some music! 🧑‍💻🎧

---

## 🎮 Usage: How to Run
### 1. Clone the Repository to Your Local Machine:
```bash
git clone https://platform.zone01.gr/git/gmarouli/groupie-tracker.git
cd groupie-tracker 
```

### 2. Set Up the Go Backend
Make sure you have Go installed on your machine.

In the project directory, run the Go server:
```bash
go run server.go
OR
go run .
```
This will start the server on http://localhost:8080.

### 3. Open the Application
Once the Go server is running, open your web browser and navigate to:  
http://localhost:8080  

---

### 🗂️ Folder Structure
```
groupie-tracker/
│  main.go
│  README.md
│  go.mod
├── handlers/
│ └── artist.go
├── models/
│ └── models.go
├── static/
│   ├─ aboutus.css
│   ├─ console.js
│   ├─ error.css
│   ├─ error.js
│   ├─ modal.js
│   ├─ styles.css
├── templates/
│   ├─ 400.html
│   ├─ 500.html
│   ├─ aboutus.html
│   └─ index.html
├── utils/
│   ├─ fetch.go
│   └─join.go

```
---

## 🌐 How It Works
- The backend (written in Go) listens on http://localhost:8080 and serves all pages and static files.
-  On visiting the homepage, the server fetches artist data from an API and dynamically renders it on the page.
- Clicking on any artist will open a modal with more details: members, creation date, first album, locations, and concert dates.
- The app provides custom error handling. If something goes wrong, a friendly error page is shown to the user.
- The About Us page explains the team and the inspiration behind the project.

### 🛑 Status Codes
- **200 OK**: Successfully processed the request.
- **404 Not Found**: Resource or page does not exist.
- **500 Internal Server Error**: Something went wrong on the server.

---

## 🟢🌍 Find Groupie Tracker Basic Version in Railway!
Visit: [Railway](https://groupie-tracker-basic-production.up.railway.app/)

## 🔒 License
This project is intended for internal or private use only and can be used for training and development.

## 📨 Contact
For questions or issues, please contact us:
[Georgia Marouli](https://discordapp.com/users/1277216244910522371) - [Dilhan Aslamaci](https://discordapp.com/users/1277217326256881736).

## 🎉 Get Started and Have Fun!
Our mission is to allow users to easily access information about their favorite artists, see where they’ll be performing, and discover new music. <br>
🌟🖌️ The Groupie Tracker will be the go-to tool for anyone interested in exploring the vibrant world of music artists and their journeys. 😄
