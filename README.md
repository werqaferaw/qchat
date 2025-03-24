# QChat - Multi-Model Chat Interface

QChat is a modern chat interface that supports multiple AI models including OpenAI, Gemini, Anthropic, DeepSeek, and Mistral.

## Project Structure

- `/frontend` - Next.js frontend application
- `/backend` - FastAPI backend application

## Deployment Instructions

### Frontend Deployment to Vercel

1. Sign up or log in to [Vercel](https://vercel.com/)

2. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

3. Log in to Vercel:
   ```
   vercel login
   ```

4. From the project root, deploy:
   ```
   vercel
   ```
   
5. Follow the prompts. When asked about the project settings:
   - Use your project settings or create a new project
   - Set the output directory to `frontend/.next`
   - Override the build command to `cd frontend && npm install && npm run build`

6. Once deployed, you'll get a URL for your frontend.

### Backend Deployment Options

#### Option 1: Render (Recommended)

1. Sign up at [Render](https://render.com/)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the build command: `pip install -r backend/requirements.txt`
5. Set the start command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables if needed

#### Option 2: Railway

1. Sign up at [Railway](https://railway.app/)
2. Create a new project
3. Add a Python service
4. Connect your GitHub repository
5. Set the start command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

### Connecting Frontend to Backend

1. After deploying the backend, get the API URL
2. In your frontend code (ChatInterface.tsx), update the API URL:
   ```javascript
   // Change
   await axios.post('http://localhost:8000/chat', {...})
   
   // To
   await axios.post('https://your-backend-url.com/chat', {...})
   ```

3. Redeploy the frontend with the updated backend URL

## Local Development

### Frontend

```
cd frontend
npm install
npm run build
npm run start
```

### Backend

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
``` 
