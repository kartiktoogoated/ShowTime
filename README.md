🎬 ShowTime - Movie Booking System
==================================

**ShowTime** is a full-featured movie ticket booking platform with a sleek UI, smart backend, and an AI-powered recommendation chatbot that suggests movies based on your mood! 🤖🍿

* * * * *

📌 Overview
-----------

**🎨 Frontend (Client)**\
🛠 Built with **React (Vite)** and **TypeScript**\
🖼 User-friendly UI for browsing movies and booking tickets\
🧠 Mood-based movie recommendations via chatbot\
📱 Responsive for all screen sizes

**🧠 Backend (Server)**\
🚀 Built with **Node.js**, **Express**, and **TypeScript**\
🗃 Uses **Prisma ORM** with a PostgreSQL database\
📤 Sends real-time email & SMS notifications (Nodemailer, Twilio)\
🧠 Integrates sentiment analysis for mood detection\
🔐 REST API with scalable architecture

* * * * *

✨ Features
----------

-   🎥 Movie listings with filtering and details

-   🪑 Seat selection & ticket booking

-   📧 Email & 📱 SMS notifications for confirmation

-   🤖 AI-powered mood-based movie recommendations

-   📊 Trending movies suggestions

-   🔒 User authentication (JWT/session)

-   ⚙️ Docker support for deployment

-   📈 Admin panel for managing movies (coming soon!)

* * * * *

📂 Folder Structure
-------------------
![image](https://github.com/user-attachments/assets/fe9c3c18-1667-45d8-bfed-8f58892f7316)

* * * * *

🚀 Upcoming Enhancements
------------------------

-   💳 Payment gateway integration (Razorpay / Stripe)

-   📱 Mobile app (React Native / Flutter)

-   👤 Admin & role-based access control

-   🌃 Dark mode support

-   ⭐ User ratings & reviews

* * * * *

☁️ Deployment
-------------

-   🧑‍💻 Frontend: AWS S3

-   🌐 Backend: AWS EC2 (Dockerized)

-   🗄️ Database: PostgreSQL on Railway/Supabase/RDS

* * * * *

🧪 How to Run Locally
---------------------

1.  🔁 **Clone the repo**\
    `git clone https://github.com/kartiktoogoated/ShowTime`

2.  📦 **Install dependencies**

    -   `cd client && npm install`

    -   `cd ../server && npm install`

3.  🧱 **Set up database**\
    `npx prisma generate && npx prisma migrate dev`

4.  🔥 **Run both servers**

    -   Frontend: `npm run dev` inside `client`

    -   Backend: `npm run dev` inside `server`

* * * * *

🤝 Contributing
---------------

Pull requests are welcome! Feel free to suggest features, report bugs, or open issues 💡
