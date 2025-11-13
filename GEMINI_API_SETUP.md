# Google Gemini API Setup Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Your Free API Key

1. **Visit Google AI Studio**

   - Go to: https://aistudio.google.com/app/apikey
   - Or: https://makersuite.google.com/app/apikey (alternative URL)

2. **Sign In**

   - Click "Sign in with Google"
   - Use your Google account (Gmail)

3. **Create API Key**

   - Click on "Get API Key" or "Create API Key" button
   - Select "Create API key in new project" (recommended)
   - Or choose an existing Google Cloud project if you have one

4. **Copy Your Key**
   - Your API key will look like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - Click the copy icon to copy it
   - **IMPORTANT**: Save it somewhere safe!

### Step 2: Configure in Your Project

You have **two options**:

#### Option A: Environment Variable (Recommended for Security)

1. Create a `.env` file in the `Frontend` folder:

   ```
   REACT_APP_GEMINI_API_KEY=YOUR_API_KEY_HERE
   ```

2. Replace `YOUR_API_KEY_HERE` with your actual API key

3. Restart the frontend server:
   ```bash
   npm start
   ```

#### Option B: Direct in Code (Quick but Less Secure)

1. Open `Frontend/src/services/aiService.js`

2. Find line 5:

   ```javascript
   const API_KEY =
     process.env.REACT_APP_GEMINI_API_KEY ||
     "AIzaSyC42s4QLmO2Dt8ACgj8v1fMHt9gsImqsgo";
   ```

3. Replace with your key:
   ```javascript
   const API_KEY = "YOUR_API_KEY_HERE";
   ```

### Step 3: Update Package (If Still Not Working)

If you still see the 404 error, update the Google AI package:

```bash
cd Frontend
npm install @google/generative-ai@latest
npm start
```

## 🔧 Troubleshooting

### Error: "models/gemini-1.5-flash-latest is not found"

**Solution 1**: Update to latest package version

```bash
npm install @google/generative-ai@latest --force
```

**Solution 2**: Try alternative model names (in `aiService.js` line 14):

```javascript
// Try these one by one until one works:
model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Try first
// or
model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// or
model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
// or
model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
```

### Error: "API key not valid"

1. Check if you copied the complete key (starts with `AIza`)
2. Make sure there are no extra spaces
3. Generate a new API key and try again
4. Check if API key restrictions are set in Google Cloud Console

### Error: "Quota exceeded"

**Free Tier Limits:**

- 60 requests per minute
- 1,500 requests per day

**Solutions:**

- Wait a minute and try again
- Check usage at: https://aistudio.google.com/app/apikey
- Consider upgrading to paid tier if needed

## ✅ Testing Your Setup

1. Start both backend and frontend:

   ```bash
   # Terminal 1 - Backend
   cd Backend
   npm start

   # Terminal 2 - Frontend
   cd Frontend
   npm start
   ```

2. Navigate to Reports page (http://localhost:3002/reports)

3. Click any "Generate AI Insights" button

4. **If working**: You'll see unique AI-generated analysis
5. **If not working**: You'll see template fallback messages

## 📊 What Models Are Available?

As of now (November 2025), these models work:

| Model Name                | Speed   | Quality       | Cost          |
| ------------------------- | ------- | ------------- | ------------- |
| `gemini-1.5-flash-latest` | Fast ⚡ | Good ✓        | Free          |
| `gemini-1.5-flash`        | Fast ⚡ | Good ✓        | Free          |
| `gemini-1.5-pro-latest`   | Slow 🐌 | Excellent ✓✓✓ | Paid          |
| `gemini-pro`              | Medium  | Good ✓        | Deprecated ⚠️ |

**Recommended**: Use `gemini-1.5-flash-latest` for free tier

## 🔐 Security Best Practices

### DO ✅

- Use environment variables (`.env` file)
- Add `.env` to `.gitignore`
- Rotate API keys periodically
- Set API key restrictions in Google Cloud Console

### DON'T ❌

- Commit API keys to GitHub
- Share API keys publicly
- Use the same key for multiple projects
- Hardcode keys in production code

## 📝 Example `.env` File

Create `Frontend/.env`:

```env
# Google Gemini AI API Key
REACT_APP_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Other environment variables
REACT_APP_API_URL=http://localhost:3000/api
```

## 🆘 Still Not Working?

1. **Check Console Logs**

   - Open browser DevTools (F12)
   - Look for errors in Console tab
   - Share error message for help

2. **Verify API Key is Active**

   - Visit: https://aistudio.google.com/app/apikey
   - Check if key shows as "Active"

3. **Try a New Key**

   - Sometimes keys take a few minutes to activate
   - Generate a fresh key and try again

4. **Check Network**
   - Make sure you have internet connection
   - Check if firewall is blocking Google APIs

## 📞 Support Resources

- **Google AI Studio**: https://aistudio.google.com
- **API Documentation**: https://ai.google.dev/docs
- **Community**: https://developers.google.com/community
- **Status Page**: https://status.cloud.google.com

## 🎉 Success Indicators

You'll know it's working when:

- ✅ No console errors
- ✅ AI Insights generate unique responses each time
- ✅ Responses are contextual to your inventory data
- ✅ Responses take 2-5 seconds to generate (real AI processing time)

---

**Last Updated**: November 6, 2025
**Tested With**: @google/generative-ai v0.24.1+
