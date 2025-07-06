# 🔥 Reddit Profile Roaster

**An AI-powered Reddit profile analyzer that creates personalized roasts based on user's comment history and behavior patterns.**

*Hackathon Project - Comprehensive Implementation of Advanced Features*

---

## 🏆 **Hackathon Features Implemented**

### 🎯 **Easy Challenges (2 points each)**

#### ✅ **1. Creative 404/Error Handling**
- **Custom Error Pages**: Thoughtfully designed error states with engaging visuals
- **API Failure Handling**: Graceful degradation when Reddit API or backend services fail
- **User-Friendly Messages**: Clear, actionable error messages with retry options
- **Context-Aware Errors**: Different error states for various failure scenarios (user not found, network issues, etc.)

#### ✅ **2. Custom Loading States** 
- **Multi-Stage Loading**: Progressive loading with behavioral pattern analysis simulation
- **Real-time Progress Tracking**: Live counters showing "79,032 behavioral patterns analyzed"
- **Contextual Loading Messages**: Reddit-specific loading text and animations
- **Visual Progress Bars**: Animated progress indicators with completion percentages
- **Engaging Wait Experience**: Story-driven loading sequence to keep users engaged

#### ✅ **3. Multilingual Support**
- **Full i18n Implementation**: Complete internationalization using react-i18next
- **Dynamic Language Switching**: Real-time language switching without page reload
- **Multiple Language Support**: English, Spanish, French, German, and more
- **Persistent Language Preference**: User's language choice saved across sessions
- **Responsive Language Switcher**: Elegant UI component for language selection

### 🎯 **Medium Challenges (4 points each)**

#### ✅ **4. The Story Mode**
- **Narrative-Driven Interface**: Chat-style interaction that guides users through the roasting process
- **Character-Based Dialogue**: AI persona that reacts and responds to user inputs
- **Progressive Revelation**: Step-by-step unveiling of analysis results
- **Interactive Q&A Sequence**: Yes/No questions that shape the final roast
- **Immersive Experience**: Typewriter effects and realistic conversation flow

#### ✅ **5. Dynamic Theming Based on API Data**
- **Reddit Data-Driven Themes**: UI adapts based on user's most active subreddits
- **Real-time Visual Adjustments**: Color schemes and elements change based on user personality analysis
- **Behavioral Pattern Visualization**: Visual indicators that reflect user's Reddit behavior
- **Contextual UI Elements**: Interface elements that respond to analysis results

### 🎯 **Hard Challenges (6 points each)**

#### ✅ **6. Parallel Interaction Mode**
- **Shared URL Sessions**: Multiple users can access the same roast session via shared URLs
- **Real-time Synchronization**: Live updates when multiple users interact with the same profile
- **Collaborative Roasting**: Users can view and react to roasts together
- **Session Management**: Sophisticated handling of multiple concurrent users
- **Cross-Device Compatibility**: Seamless experience across different devices and browsers

---

## 🛠 **Technical Stack**

### **Frontend**
- **Next.js 14** - React framework with App Router
- **React 18** - Component library with modern hooks
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **react-i18next** - Internationalization framework
- **Lucide React** - Modern icon library
- **Sonner** - Toast notifications

### **Backend**
- **Hono.js** - Lightweight web framework
- **Node.js** - JavaScript runtime
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.io** - Real-time communication (for parallel features)

### **External APIs Used**
- **Reddit API** - Comment and profile data extraction
- **OpenAI GPT-4** - AI-powered roast generation
- **Custom JSONP Implementation** - Cross-origin Reddit data fetching

---

## ✨ **Key Features**

### 🎭 **AI-Powered Analysis**
- Extracts and analyzes Reddit comment history
- Identifies behavioral patterns and personality traits
- Generates personalized roasts based on user activity
- Creates detailed breakdowns of strengths, weaknesses, love life, and life purpose

### 🎨 **Advanced UI/UX**
- Smooth animations and transitions
- Responsive design for all devices
- Dark/light theme adaptation
- Particle effects and visual enhancements
- Loading states that tell a story

### 🌐 **Global Accessibility**
- Multi-language support with easy switching
- Accessible design principles
- SEO optimized
- Cross-browser compatibility

### 🔄 **Real-time Features**
- Live progress tracking during analysis
- Real-time error handling and recovery
- Session persistence and sharing
- Collaborative viewing capabilities

---

## 📁 **Project Structure**

```
reddit-profile-roaster/
├── app/                          # Next.js App Router
│   ├── page.jsx                  # Main landing page with story mode
│   ├── roast/page.jsx           # Results page with chat interface
│   ├── layout.jsx               # Root layout with metadata
│   └── globals.css              # Global styles
├── components/                   # Reusable React components
│   ├── UsernameForm.jsx         # Reddit username input form
│   ├── ClientLayout.jsx         # Client-side layout wrapper
│   ├── Footer.jsx               # Site footer
│   ├── LanguageSwitcher.jsx     # Multilingual support component
│   ├── magicui/                 # Custom UI components
│   │   ├── particles.jsx        # Particle animation effects
│   │   └── confetti.jsx         # Success animations
│   └── ui/                      # Base UI components
├── Backend/                      # Server-side implementation
│   ├── server.js               # Main Hono.js server
│   ├── routes/                 # API route handlers
│   │   ├── response.js         # Comment processing endpoints
│   │   └── roast.js           # Roast generation endpoints
│   └── models/                 # Database schemas
├── public/                      # Static assets
│   ├── locales/               # Translation files
│   │   ├── en/common.json     # English translations
│   │   ├── es/common.json     # Spanish translations
│   │   └── ...                # Additional languages
│   └── images/                # Image assets
└── package.json               # Dependencies and scripts
```

---

## 🚀 **Setup and Installation**

### **Prerequisites**
- Node.js 18+ 
- MongoDB database
- OpenAI API key
- Git

### **Installation Steps**

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd reddit-profile-roaster
   ```

2. **Install Dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd Backend
   npm install
   cd ..
   ```

3. **Environment Configuration**
   
   Create `.env.local` in root directory:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Database
   DATABASE_URL=mongodb://localhost:27017/reddit-roaster
   
   # API Configuration
   API_BASE_URL=https://api.goonchan.org/reddit
   ```

   Create `.env` in Backend directory:
   ```env
   # Database
   DATABASE_URL=mongodb://localhost:27017/reddit-roaster
   
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Server
   PORT=3003
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if running locally)
   mongod
   
   # Database will be automatically initialized on first run
   ```

5. **Start Development Servers**
   
   **Terminal 1 - Frontend:**
   ```bash
   npm run dev
   # Runs on http://localhost:3000
   ```
   
   **Terminal 2 - Backend:**
   ```bash
   cd Backend
   npm start
   # Runs on http://localhost:3003
   ```

---

## 🧪 **Testing Instructions**

### **Basic Functionality Testing**

1. **Profile Analysis Test**
   ```bash
   # Navigate to http://localhost:3000
   # Enter a Reddit username (e.g., "spez", "gallowboob")
   # Verify loading sequence works
   # Check if roast generates successfully
   ```

2. **Multilingual Support Test**
   ```bash
   # Click language switcher in top-left
   # Switch between different languages
   # Verify all text translates correctly
   # Check persistence across page reloads
   ```

3. **Error Handling Test**
   ```bash
   # Enter non-existent username
   # Test with invalid characters
   # Disconnect internet during analysis
   # Verify graceful error messages appear
   ```

### **Advanced Feature Testing**

4. **Story Mode Test**
   ```bash
   # Complete full user journey
   # Verify chat-style interaction
   # Test Yes/No question sequence
   # Check typewriter animation effects
   ```

5. **Parallel Interaction Test**
   ```bash
   # Open same roast URL in multiple browsers
   # Test simultaneous viewing
   # Verify real-time synchronization
   # Check cross-device compatibility
   ```

6. **Loading States Test**
   ```bash
   # Monitor loading progression
   # Verify 79,032 pattern counter
   # Test progress bar animations
   # Check contextual loading messages
   ```

### **Performance Testing**

7. **Stress Testing**
   ```bash
   # Test with users having 1000+ comments
   # Verify memory usage stays reasonable
   # Check response times under load
   # Monitor API rate limiting
   ```

---

## 📱 **Usage Guide**

### **For Users**

1. **Getting Started**
   - Visit the application URL
   - Select your preferred language
   - Enter a Reddit username in the format shown

2. **The Analysis Process**
   - Watch the story-mode loading sequence
   - Observe real-time progress indicators
   - Experience the narrative-driven interface

3. **Interactive Chat**
   - Answer Yes/No questions about the analysis
   - Watch AI reactions and responses
   - Progress through the personalized story

4. **Viewing Results**
   - Read your comprehensive roast
   - Explore different analysis categories
   - Share results with friends via URL

### **For Developers**

1. **Adding New Languages**
   ```bash
   # Create new translation file
   mkdir public/locales/[language-code]
   cp public/locales/en/common.json public/locales/[language-code]/
   
   # Translate content and update language switcher
   ```

2. **Customizing Roast Categories**
   ```javascript
   // Modify in Backend/routes/roast.js
   const categories = {
     detailedRoast: "Main roast content",
     strengthAnalysis: "User strengths",
     weaknessAnalysis: "User weaknesses",
     // Add new categories here
   };
   ```

3. **Extending Story Mode**
   ```javascript
   // Add new conversation paths in app/roast/page.jsx
   const newQuestionPath = {
     question: "Your new question",
     yes_response: "Response for yes",
     no_response: "Response for no"
   };
   ```

---

## 🎨 **Design Philosophy**

### **User Experience**
- **Progressive Disclosure**: Information revealed step-by-step to avoid overwhelming users
- **Narrative Flow**: Every interaction feels like part of a cohesive story
- **Emotional Engagement**: Humor and personality throughout the experience
- **Accessibility First**: Design that works for all users regardless of ability

### **Technical Architecture**
- **Modular Components**: Reusable, maintainable code structure
- **Scalable Backend**: Designed to handle high traffic and concurrent users
- **Error Resilience**: Graceful handling of all failure scenarios
- **Performance Optimized**: Fast loading and smooth animations

---

## 🤝 **Contributing**

This project was developed as part of a hackathon challenge. The codebase demonstrates advanced React patterns, modern web development practices, and creative problem-solving approaches.

### **Key Learning Outcomes**
- Advanced React state management and hooks
- Real-time web application development
- API integration and error handling
- Internationalization implementation
- Creative UI/UX design principles
- Performance optimization techniques

---

## 📄 **License**

This project is part of a hackathon submission and showcases various advanced web development techniques and creative solutions to complex challenges.

---

*Built with ❤️ and lots of ☕ during the hackathon*
