# JuaCloud AI

_Your AI Tutor for Microsoft AZ-900, on WhatsApp._

JuaCloud makes cloud certification affordable and accessible for youth in Western Kenya through multilingual AI tutoring in English, Swahili, and Sheng.

### Problem

- AZ-900 bootcamps cost Ksh 10,000+ and are only in Nairobi
- Learning resources are in complex English, not relatable to Kenyan students
- Students in Kakamega, MMUST, and rural colleges have no affordable path to global cloud jobs
- 78% of interested students drop out due to cost and language barrier

### Solution

JuaCloud AI is a WhatsApp-based AI tutor built specifically for the Microsoft AZ-900 exam.

- Chat in English, Swahili, or Sheng
- Learn with Kenyan analogies: matatu, shamba, M-Pesa, and cloud
- Get instant explanations + auto quizzes to track readiness
- No app to install, works on any phone with WhatsApp

### Key Features

- Multilingual AI Tutor: Understands English, Swahili, Sheng
- AZ-900 Focused Content Library: Cloud concepts, services, pricing, governance
- Smart Quizzes: Personalized revision based on weak areas
- Progress Dashboard: For learners and for schools
- Low Data Mode: Built for WhatsApp, not heavy web apps

### How It Works

1. Student joins via WhatsApp Group or DM
2. Asks question: "Explain Azure pricing"
3. JuaCloud explains in simple language with local example
4. Student takes 3-question quiz
5. System updates progress and recommends next topic

### Tech Stack

- Frontend: WhatsApp API + Mobile Web Dashboard
- Backend: Python, FastAPI
- AI: LLM fine-tuned with retrieval on AZ-900 official syllabus
- Database: PostgreSQL for user progress and quiz tracking
- Hosting: Cloud VPS + WhatsApp Business API

### Project Structure

/juacloud
/backend - API and AI logic
/frontend - Student and teacher dashboard
/content - AZ-900 curriculum and Kenyan analogy dataset
/docs - Pitch deck and user guide
