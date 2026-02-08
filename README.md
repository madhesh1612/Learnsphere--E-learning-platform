##📘 LearnSphere — eLearning LMS Platform

A full-stack role-based Learning Management System (LMS) built for hackathon demonstration.
LearnSphere enables instructors to create courses and learners to enroll, learn, and track progress with quizzes, points, and reviews.

##🚀 Project Overview

LearnSphere is a responsive eLearning platform with two major sides:

##👨‍💼 Instructor/Admin (Backoffice)

Create and manage courses

Add lessons and quizzes

Publish courses

Track learner progress

Manage enrollments

##🎓 Learner (Frontend)

Browse courses

Enroll and learn

Attempt quizzes

Track progress

Earn points & badges

Give ratings and reviews

This project demonstrates a real-world LMS workflow:

Course Creation → Publish → Enrollment → Learning → Quiz → Completion → Reviews → Reporting

##🧩 Core Features
✅ Authentication

Supabase email/password login

Forgot password flow

Session persistence

##👨‍💼 Admin Features

Manage courses

Publish/unpublish courses

Invite learners

View platform data

Monitor course usage

##👨‍🏫 Instructor Features

Create courses

Add lessons (Video/Document/Image/Quiz)

Edit/Delete lessons

Build quizzes

View enrolled learners

##🎓 Learner Features

Browse published courses

Enroll in courses

Lesson viewer

Quiz attempts

Progress tracking

Ratings & reviews

##📝 Quiz System

Multiple choice questions

Score calculation

Attempt tracking

Points system

##📊 Progress Tracking

Lesson completion tracking

Course completion %

Enrollment records

##⭐ Ratings & Reviews

Star rating system

Course feedback

Average rating display

##🏆 Gamification

Points from quizzes

Badge levels:

Newbie

Explorer

Achiever

Specialist

Expert

Master

##🛠 Tech Stack
Frontend

React.js

TypeScript

Tailwind CSS

React Router

Backend / BaaS

Supabase

Authentication

Database

Storage

##🗄 Database Design (Supabase)

Main Tables:

profiles

courses

lessons

quizzes

questions

enrollments

reviews

lesson_progress

quiz_attempts

points

##🔄 Application Flow
Instructor Flow

Login

Create Course

Add Lessons & Quizzes

Publish Course

Learner Flow

Signup/Login

Browse Courses

Enroll

Learn Lessons

Attempt Quiz

Earn Points

Review Course

##⚙️ Setup Instructions
1️⃣ Clone Repo
git clone <repo-url>
cd learnsphere

2️⃣ Install Dependencies
npm install

3️⃣ Setup Environment Variables

Create .env file:

VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key

##4️⃣ Run Project
npm run dev

##🔐 Role Access
Role	Access
Admin	Full control
Instructor	Manage courses
Learner	Learn & enroll
##🎯 Hackathon Focus

This project focuses on:

Real LMS logic

Role-based access

Dynamic Supabase data

Clean UI/UX

Practical workflows

##📌 Future Improvements

Payment integration

Certificates

Live classes

Advanced analytics

Notifications

AI recommendations

##🤝 Contributors

Developer: Muthu Madhesh
Hackathon Team: The Innovators

📜 License

This project is built for educational and hackathon purposes.
