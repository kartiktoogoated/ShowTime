# ShowTime

This is the **backend** for a movie reservation system where users can browse movies, reserve seats, and manage their bookings.

## 🚀 Features
✅ **User Authentication & Role-Based Access**  
✅ **Admin Panel to Add Movies & Showtimes**  
✅ **Secure Seat Reservations with Availability Check**  
✅ **Cancel Reservations & View Booking History**  
✅ **Admin Dashboard with Revenue & Booking Reports**  

## 🛠️ Tech Stack
- **Node.js**
- **Express.js**
- **MongoDB & Mongoose**
- **JWT Authentication**
- **Multer for File Uploads**

## 📌 Installation Guide
```bash
1️⃣ **Clone the Repository**
git clone https://github.com/your-username/movie-reservation-backend.git
cd movie-reservation-backend

2️⃣ Install Dependencies

npm install

3️⃣ Setup Environment Variables Create a .env file:

PORT=3000
MONGO_URI=mongodb+srv://your-db-url
JWT_SECRET=your-secret-key

4️⃣ Start the Server

npm start
```
🎯 API Endpoints
🔹 Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	User login & token generation

🔹 Movies & Showtimes
Method	Endpoint	Description
POST	/api/movies/add	Add a new movie (Admin)
GET	/api/movies	Get all movies
GET	/api/movies/:date	Get movies with showtimes for a date

🔹 Reservations
Method	Endpoint	Description
POST	/api/reservations/reserve	Reserve seats for a showtime
GET	/api/reservations	Get user reservations
DELETE	/api/reservations/cancel/:id	Cancel a reservation
GET	/api/reservations/admin/reservations	Admin report of all reservations

🛠️ Future Improvements
✅ Online Payment Integration
✅ User Notifications via Email
✅ Advanced Filtering & Search for Movies
✅ Automated Seat Selection Based on Availability
