# QChat - Multi-Model Chat Interface

QChat is a modern chat interface that supports multiple AI models including OpenAI, Gemini, Anthropic, DeepSeek, and Mistral.

## Project Structure

- `/frontend` - Next.js frontend application
- `/backend` - FastAPI backend application

## Deployment Instructions

### Frontend Deployment to Vercel

#### Option 1: Deploy with GitHub

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/) and create a new project
3. Import your GitHub repository
4. Use these deployment settings:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. Add environment variables:
   - `NEXT_PUBLIC_BACKEND_URL`: Your backend API URL

#### Option 2: Deploy with Vercel CLI

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. From the project root, create a `vercel.json` file with:
   ```json
   {
     "version": 2,
     "buildCommand": "cd frontend && npm install && npm run build",
     "installCommand": "cd frontend && npm install",
     "outputDirectory": "frontend/.next",
     "framework": "nextjs",
     "rootDirectory": "frontend"
   }
   ```

4. Deploy:
   ```
   vercel
   ```

### Backend Deployment Options

#### Option 1: Render

1. Sign up at [Render](https://render.com/)
2. Create a new Web Service
3. Connect your GitHub repository
4. Use these settings:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### Option 2: Railway

1. Sign up at [Railway](https://railway.app/)
2. Create a new project
3. Add a Python service
4. Connect your GitHub repository
5. Set the Root Directory to `backend`
6. Set the Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### After Deployment

1. Once your backend is deployed, get the API URL
2. Go to your Vercel project settings
3. Add an environment variable:
   - Name: `NEXT_PUBLIC_BACKEND_URL`
   - Value: Your backend URL (e.g., `https://qchat-backend.onrender.com`)
4. Redeploy your frontend

## Local Development

### Frontend

```
cd frontend
npm install
npm run dev
```

### Backend

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
``` 