# 🚨 AI-Powered Incident Response Training Platform

**A fully functional MVP that teaches cybersecurity incident response through interactive AI-powered training scenarios.**

## 🎯 What This Application Does

This is a **training simulator** that helps you learn how to respond to cybersecurity incidents (like malware attacks, data breaches, etc.) by:
- Presenting you with realistic incident scenarios
- Providing an AI assistant to guide you through the response process
- Tracking your progress and performance
- Offering voice interaction for hands-free training

## 🚀 Quick Start - Get Running in 5 Minutes

### Step 1: Prerequisites
Make sure you have these installed on your computer:
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)

### Step 2: Download and Setup
```bash
# 1. Clone this repository
git clone https://github.com/abdulrahman1121/ai-incident-response-trainer.git
cd ai-incident-response-trainer

# 2. Install dependencies (this might take a few minutes)
npm install
cd src/pages
npm install
cd ../..
```

### Step 3: Run the Application
```bash
# Start the development server
cd src/pages
npm run dev
```

**That's it!** 🎉 
- Open your browser and go to: `http://localhost:3002`
- You should see the application running!

## 📱 How to Use the Application

### Navigation Overview
The app has 5 main pages accessible through the top navigation:

1. **🏠 Home** - Welcome page and overview
2. **💬 Chat** - AI training interface (where the magic happens)
3. **📚 Training** - Browse and start training scenarios
4. **📊 Dashboard** - View your progress and statistics
5. **👤 Profile** - User settings and preferences

### Complete Training Workflow

#### Step 1: Start a Training Session
1. Click **"Training"** in the navigation
2. You'll see a list of incident scenarios (like "Malware Detection", "Phishing Response", etc.)
3. Click **"Start Training"** on any scenario
4. You'll be automatically taken to the Chat page

#### Step 2: Complete the Training
1. On the **Chat page**, you'll see the AI assistant ready to help
2. The AI will present you with the incident scenario
3. **Type your responses** in the chat input at the bottom
4. The AI will guide you through each step of the incident response process
5. Follow the AI's instructions and answer its questions

#### Step 3: Track Your Progress
1. Click **"Dashboard"** to see your training statistics
2. View your completion rate, time spent, and recent sessions
3. See how you're improving over time

### Example Training Session

**AI:** "Welcome! You're responding to a malware incident. A user reports their computer is running slowly and showing strange pop-ups. What's your first step?"

**You:** "I would isolate the affected computer from the network to prevent spread."

**AI:** "Excellent! That's the correct first step. Now, what would you do next to assess the situation?"

**You:** "I would check the system logs and run a malware scan."

**AI:** "Good approach! Let's proceed with the malware scan..."

*[Training continues with more steps]*

## 🎮 Features You Can Use Right Now

### ✅ Working Features
- **Interactive Training Scenarios** - 5 different incident types
- **AI Chat Interface** - Real-time guidance and feedback
- **Progress Tracking** - See your training history and stats
- **Voice Interface** - Click the microphone to use voice commands
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Persistent Progress** - Your training data is saved locally

### 🎯 Training Scenarios Available
1. **Malware Detection** - Learn to identify and respond to malware
2. **Phishing Response** - Handle email-based social engineering attacks
3. **DDoS Mitigation** - Respond to distributed denial of service attacks
4. **Data Breach** - Manage unauthorized access to sensitive data
5. **Network Intrusion** - Detect and respond to network security breaches

## 🔧 Troubleshooting

### Common Issues and Solutions

**Problem:** "Application won't start"
- **Solution:** Make sure you're in the correct directory (`src/pages`) and run `npm run dev`

**Problem:** "Page shows blank or errors"
- **Solution:** Check the browser console (F12) for errors and refresh the page

**Problem:** "Training doesn't start"
- **Solution:** Make sure you click "Start Training" from the Training page, then navigate to Chat

**Problem:** "Voice doesn't work"
- **Solution:** Make sure your browser supports Web Speech API (Chrome/Edge work best)

### Getting Help
- Check the browser console (F12) for any error messages
- Make sure all dependencies are installed: `npm install` in both root and `src/pages` directories
- Try refreshing the page if something seems stuck

## 🏗️ Technical Details (For Developers)

### What's Under the Hood
- **Frontend:** React + TypeScript + Tailwind CSS
- **State Management:** Zustand for local state
- **AI Service:** Mock AI service for MVP (easily replaceable with real AI)
- **Storage:** Local browser storage for training data
- **Build Tool:** Vite for fast development

### Project Structure
```
├── src/
│   ├── pages/           # Frontend React application
│   │   ├── src/
│   │   │   ├── pages/   # Main application pages
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── stores/  # State management
│   │   │   └── services/ # API and utility services
│   │   └── package.json # Frontend dependencies
│   └── workers/         # Cloudflare Workers (for future deployment)
├── package.json         # Root dependencies
└── wrangler.toml        # Cloudflare configuration
```

## 🚀 Next Steps (Future Enhancements)

This is a **fully functional MVP**. Future improvements could include:
- Real AI integration (currently uses mock responses)
- Cloud deployment to Cloudflare Pages
- More training scenarios
- Multi-user support
- Advanced analytics
- Mobile app version

## 📞 Support

If you encounter any issues:
1. Check this README for solutions
2. Look at the browser console for error messages
3. Make sure you followed the setup steps correctly
4. Try refreshing the page or restarting the development server

**Happy Training!** 🎯

