# AI-Powered Debate Practice Platform

**Repository:** [GitHub Repo](https://github.com/ParamSingh24/IDL-Hackathon-)  
**Live Demo:** [https://techheroesidlhackathondebatepro.vercel.app](https://techheroesidlhackathondebatepro.vercel.app)

## 🚀 Overview

This web app empowers debate lovers at all levels to simulate and practice debates with AI opponents, receive instant judge-grade feedback, and grow through gamified, accessible learning. The platform features multiple debate formats and modes, plus cutting-edge AI for debate generation, analysis, and interactive learning.

## 🌟 Key Features

- **Multi-Mode Debate Practice**
  - **Practice Mode**: Step-by-step AI coaching and live hints to build core skills.
  - **Challenge Mode**: Compete against an advanced AI debater; full round, scoring, and realistic POIs.
  - **Learning Mode**: Focused drills for specific skills (e.g., rebuttals, POI handling, speech structure).
  - **Quick Debate**: Start instant debates for fast, casual practice.
- **Comprehensive AI Integration**
  - **Debate AI**: Acts as your sparring partner or judge, generates structured speeches, raises/answers POIs.
  - **Chatbot AI**: 24/7 debate help for rules, formats, or instant tips.
  - **Live Feedback**: Immediate, judge-style feedback and breakdowns after each speech.
- **User Customization**
  - Choose your debate topic, skill level, preferred mode, and format (BP, AP, WSDC) each session.
- **Gamification & Progression**
  - Earn badges, points, practice streaks, and move up leaderboards as you improve.
- **Debate Results & Analytics**
  - Post-session reports show strengths, improvement areas, “manner, matter, method” scores, and skill trends.
- **Website Translation & Accessibility**
  - Instant UI translation (via Google Translate) for any language.
  - Voice navigation and read-aloud for a hands-free, accessible experience.
- **Firebase Integration**
  - Secure user authentication, real-time session backup, and personal history tracking.

## 🏛️ Supported Debate Formats

- **British Parliamentary (BP)**: Four teams, eight speakers, detailed roles and turns.
- **Asian Parliamentary (AP)**: Simplified team structure for beginner-friendly practice.
- **World Schools Debating Championship (WSDC):** 3v3 format, highly relevant for school/college tournaments.

## 👣 User Journey & How to Use

1. **Sign Up/Login**  
   Secure your profile via Firebase authentication.

2. **Set Your Preferences**  
   Select your debate format (BP, AP, WSDC), practice mode, topic, language, and skill level.

3. **Start a Debate Session**  
   - Enter the Debate Room: Engage with your AI opponent(s) according to chosen mode.
   - Use **Voice Navigation**: Activate hands-free navigation or command "read aloud" for any interface text or AI feedback.
   - Try the **Functions Chatbot**: Open the chat panel for instant tips, rules, or format clarifications while you debate or prepare.

4. **Debate, Practice, and Receive Feedback**
   - **Practice Mode**: Get guided prompts and supportive feedback at each step.
   - **Challenge Mode**: Debate the AI like a tournament round—AI delivers speeches, POIs, and after-speech judge feedback.
   - **Learning Mode**: Drill targeted debate skills; receive skill-specific tips after each exercise.
   - **Quick Debate**: One-click start for rapid sessions with concise feedback.

5. **Experience Additional Features**
   - **Backup Voice / Read Aloud**: All debate content and AI-generated analysis can be read aloud for accessibility (click voice/read button on any text block or feedback panel).
   - **Debate Analysis**: Immediate, judge-style feedback available after every speech and round.
   - **Results & Analytics**: View detailed analysis in your dashboard—track progress by skill, badge achievements, and debate history.

6. **Language Support**
   - Instantly translate the website into any language via the Google Translate option in the header for a fully localized experience.

7. **Logout / Session Backup**
   - All progress, history, and results are saved to your Firebase account.

## 🛠️ Local Setup (Quickstart)

**Prerequisites**: Node.js & npm, Firebase account, Sarvam AI API key, modern browser.

1. **Clone the Repo**  
   ```bash
   git clone https://github.com/ParamSingh24/IDL-Hackathon-.git
   cd IDL-Hackathon-
   ```
2. **Install Dependencies**  
   ```bash
   npm install
   ```
3. **Environment Setup**  
   Create `.env.local` in the root:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_SARVAM_API_KEY=your_sarvam_key
   ```
   Update `src/firebase.js` and Sarvam AI config files with your details.
4. **Run Locally**  
   ```bash
   npm start
   ```
   Visit [http://localhost:3000](http://localhost:3000)

## 🧭 Feature Testing Guide

- **Chatbot:** Click “Help” or Chat icon; ask about formats, points, or debate best practices.
- **Voice Navigation:** Press mic icon or use browser voice commands to go hands-free; try "Start Debate", "Show Analytics", "Next Feedback", or "Logout".
- **Read Aloud & Backup Voice:** On any debate text, feedback, or navigation menu, press the voice/speaker icon for instant text-to-speech playback.
- **Debate AI:** Select any practice mode and format—AI will fill roles, generate speeches, raise POIs, and act as your judge or trainer per session.
- **Challenge Mode:** Engage in a realistic, competitive debate with timer, POIs, and judge feedback after each turn.
- **Learning Mode:** Enter drills for rebuttal, POI, or structuring; AI focuses feedback on selected skills.
- **Analysis:** Post-speech, review skill breakdowns and improvement tips in the feedback panel or results dashboard.

## 🌐 Demo Link

**Live Platform:**  
[https://techheroesidlhackathondebatepro.vercel.app](https://techheroesidlhackathondebatepro.vercel.app)

## 📖 Additional Tips

- For best performance, use Chrome or Edge with mic access enabled for all voice features.
- Analytics, badges, and language translation are available in both mobile and desktop views.
- User data and sessions are auto-backed-up to your Firebase account for peace of mind.

This platform is built to maximize accessibility, personalized learning, and authentic debate practice—blending cutting-edge AI, multi-mode exercises, and user-friendly design to help all debate learners reach their full potential.
