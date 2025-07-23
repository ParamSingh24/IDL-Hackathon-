# AI-Powered Debate Practice Platform

**Repository:** https://github.com/ParamSingh24/IDL-Hackathon-
**Live Demo:** https://techheroesidlhackathondebatepro

## Project Overview
A web application for debate enthusiasts of all skill levels, leveraging AI to simulate realistic debate rounds, provide instant feedback, and support multiple debate formats. The platform makes high-quality debate training accessible, interactive, and engaging.

## Key Features
- **Multi-Mode Debate Practice:**
  - *Practice Mode*: Step-by-step AI coaching and live guidance.
  - *Challenge Mode*: Simulated live rounds against AI with scoring.
  - *Learning Mode*: Focused skill drills (e.g., rebuttal, POI response).
  - *Quick Debate*: One-click rapid debates.
- **Comprehensive AI Integration:**
  - *Debate AI*: Sparring partner/judge, structured speeches, real-time POIs.
  - *Chatbot AI*: On-demand rules, format help, and debate tips.
  - *Live Feedback*: Instant, judge-style feedback, clash breakdowns, fallacy detection.
- **User Customization:**
  - Choose topic, skill level, mode, and format (BP, AP, WSDC) for a personalized experience.
- **Gamification & Progression:**
  - Badges, points, leaderboards, practice streaks, and level advancement.
- **Results & Analytics:**
  - Detailed reports, performance analytics, and secure progress tracking.
- **Language & Accessibility:**
  - Instant website translation (Google Translate).
  - Voice navigation and read-aloud for accessibility.
- **Firebase Integration:**
  - User authentication, real-time session storage, and progress backup.

## Supported Debate Formats
- **British Parliamentary (BP):** Four teams, eight speakers, complex real-time flow.
- **Asian Parliamentary (AP):** Two teams, beginner-friendly.
- **World Schools Debating Championship (WSDC):** 3v3, ideal for school/college.

## User Journey
1. **Sign Up/Login:** Secure authentication (Firebase).
2. **Set Preferences:** Choose format, mode, skill, and language.
3. **Debate Session:** Participate in structured rounds with AI.
4. **Receive Feedback:** Immediate, actionable feedback after each speech/session.
5. **Track Progress:** Analyze results and review suggestions.
6. **Community & Support:** Integrated chatbot, multi-language, and voice features.

## Accessibility & User Experience
- Fully responsive (web/mobile/tablet).
- Simple, intuitive UI.
- Real-time translation and speech features for global and accessible use.

## Technical Stack
- **Frontend:** React/Next.js
- **Backend:** Node.js/FastAPI
- **Database:** Firebase
- **AI/ML:** Sarvam AI APIs (STT, TTS, chat, translation)
- **Analytics:** Real-time and historical visualization
- **Deployment:** Vercel/Netlify

## Hackathon Alignment
- **Educational Value:** Learning progression, multi-level feedback, accurate simulation.
- **Gamification:** Points, achievements, visible progression.
- **User Experience:** Accessible, easy, supports all major formats/languages.
- **Technical Implementation:** Robust AI integration, scalable, secure.
- **Scalability & Adaptability:** Expandable for new formats, languages, and users.

## Project Process & Learnings
- **Ideation & Planning:** Vision for accessible, AI-powered debate for all levels.
- **Tech Stack Setup:** React/Next.js, Node.js/FastAPI, Firebase, Sarvam AI, Google Translate.
- **Core Feature Development:** Debate room UI, Sarvam AI APIs, Chatbot AI, analytics, gamification, translation, and voice navigation.
- **Testing & Deployment:** Real-time transcription, feedback, accessibility, bug fixes, and public deployment.
- **Key Learnings:**
  - Switched to streaming audio for fast STT.
  - Dynamic language switching and robust code-mixed input.
  - Preloaded TTS for natural feedback.
  - Moved API keys to backend for security.

## Local Setup
**Prerequisites:** Node.js, npm, Firebase account, Sarvam AI API key, modern browser.

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/ParamSingh24/IDL-Hackathon-.git
   cd IDL-Hackathon-
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Environment Setup:**
   - Create `.env.local` in the root:
     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
     NEXT_PUBLIC_SARVAM_API_KEY=your_sarvam_key
     ```
   - Update `src/firebase.js` and Sarvam AI config files with your credentials.
4. **Run the App Locally:**
   ```bash
   npm start
   ```
   Visit [http://localhost:3000](http://localhost:3000)

**Device Support:** Fully responsive; best voice features in Chrome/Edge.

## Demo
Try the deployed app: [https://techheroesidlhackathondebatepro](https://techheroesidlhackathondebatepro)
