# 🔥 Reddit Profile Roaster

**An AI-powered Reddit profile analyzer that creates personalized roasts based on user's comment history and behavior patterns.**

---

## ✨ **Features**

### 🎭 **AI-Powered Analysis**
- Extracts and analyzes Reddit comment history
- Identifies behavioral patterns and personality traits
- Generates personalized roasts based on user activity
- Creates detailed breakdowns of strengths, weaknesses, love life, and life purpose

### 🎨 **Interactive Experience**
- Chat-style interface with typewriter effects
- Progressive story-mode interactions
- Yes/No question sequences that shape the final roast
- Smooth animations and transitions

### 🌐 **Multi-language Support**
- Complete internationalization with react-i18next
- Dynamic language switching without page reload
- Persistent language preferences

### 📱 **Responsive Design**
- Works seamlessly across all devices
- Optimized for both desktop and mobile
- Clean, modern UI with custom animations

---

## 🛠 **Tech Stack**

### **Frontend**
- **Next.js 14** - React framework with App Router
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **react-i18next** - Internationalization

### **Backend**
- **Hono.js** - Lightweight web framework
- **Node.js** - JavaScript runtime
- **MongoDB** - Database with Mongoose ODM

### **APIs**
- **Reddit API** - Comment and profile data extraction
- **Google Gemini AI** - AI-powered content generation

---

## 📁 **Project Structure**

```
reddit-profile-roaster/
├── app/                          # Next.js App Router
│   ├── page.jsx                  # Main landing page
│   ├── roast/page.jsx           # Results page
│   └── layout.jsx               # Root layout
├── components/                   # React components
│   ├── UsernameForm.jsx         # Username input form
│   ├── Footer.jsx               # Site footer
│   ├── LanguageSwitcher.jsx     # Language selector
│   └── magicui/                 # Custom UI components
├── Backend/                      # Server-side code
│   ├── server.js               # Main server
│   ├── routes/                 # API routes
│   │   ├── response.js         # User processing
│   │   └── roast.js           # Roast retrieval
│   └── models/                 # Database schemas
├── public/                      # Static assets
│   └── locales/               # Translation files
├── config.json                 # API configuration
└── package.json               # Dependencies
```

---

## 🚀 **Setup & Installation**

### **Prerequisites**
- Node.js 18+
- MongoDB database
- Google Gemini API keys

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reddit-profile-roaster
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd Backend
   npm install
   ```

3. **Environment setup**
   
   Create `.env` in the Backend directory:
   ```env
   DATABASE_URL=your_mongodb_connection_string
   GEMINI_API_KEY_1=your_gemini_api_key_1
   GEMINI_API_KEY_2=your_gemini_api_key_2
   # Add more API keys as needed
   ```

4. **Configure API endpoints**
   
   Update `config.json` in the root directory:
   ```json
   {
     "url": "http://localhost:3003"
   }
   ```

5. **Start the application**
   
   **Backend (Terminal 1):**
   ```bash
   cd Backend
   npm start
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3003

---

## 🎮 **Usage**

1. **Enter a Reddit username** in the input field
2. **Wait for analysis** - The system fetches and analyzes the user's comment history
3. **Interactive chat** - Answer questions about the analysis
4. **View results** - Get a comprehensive roast with different categories

### **API Endpoints**

- `POST /api/responses` - Submit username for analysis
- `GET /api/roast/:username` - Retrieve roast data
- `POST /api/roast/:username/seen` - Mark questions as viewed

---

## 🔧 **Configuration**

### **Adding Languages**
1. Create translation file in `public/locales/[language-code]/common.json`
2. Update the language switcher component
3. Test translations across the application

### **Database Schema**
The application uses MongoDB with the following main schema:
```javascript
{
  username: String,
  avatar: String,
  subreddits: Array,
  questions: String,
  roast: String,
  strength: String,
  weakness: String,
  loveLife: String,
  lifePurpose: String,
  questionsSeen: Boolean,
  updatedAt: Date
}
```

### **API Rate Limiting**
- 200 requests per 15-minute window
- Multiple Gemini API keys for load balancing
- Automatic fallback between API keys

---

## 🛡️ **Error Handling**

- **User not found** - Clear error messages with retry options
- **API failures** - Graceful degradation with fallback responses
- **Network issues** - Automatic retry logic with exponential backoff
- **Invalid data** - Input validation and sanitization

---

## 📊 **Performance**

- **Caching** - Database caching for repeat users
- **Optimization** - Efficient Reddit API usage
- **Loading states** - Engaging progress indicators
- **Responsive** - Fast loading across all devices

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 **License**

This project is licensed under the MIT License.

---