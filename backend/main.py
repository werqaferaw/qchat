from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware with more flexible configuration
# This will allow requests from your Vercel deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change this to your specific Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API endpoints for each LLM
MODEL_API_URLS = {
    "OpenAI": "https://api.openai.com/v1/chat/completions",
    "Gemini": "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    "Anthropic": "https://api.anthropic.com/v1/messages",
    "DeepSeek": "https://api.deepseek.com/v1/chat/completions",
    "Mistral": "https://api.mistral.ai/v1/chat/completions"
}

# Model names for each service
MODEL_NAMES = {
    "OpenAI": "gpt-3.5-turbo",  # Default OpenAI model
    "DeepSeek": "deepseek-chat",
    "Mistral": "mistral-medium"
}

class ChatRequest(BaseModel):
    model: str
    message: str
    apiKey: str

@app.get("/")
async def root():
    return {"message": "QChat API is running"}

@app.post("/chat")
async def chat(request: ChatRequest):
    logger.info(f"Received request for model: {request.model}")
    
    if not request.apiKey:
        raise HTTPException(status_code=400, detail="API key is required")
    
    if request.model not in MODEL_API_URLS:
        raise HTTPException(status_code=400, detail=f"Invalid model. Available models: {', '.join(MODEL_API_URLS.keys())}")
    
    api_url = MODEL_API_URLS[request.model]
    
    # Different header format for different APIs
    if request.model == "Gemini":
        headers = {"Content-Type": "application/json"}
        api_url = f"{api_url}?key={request.apiKey}"
    else:
        headers = {"Authorization": f"Bearer {request.apiKey}", "Content-Type": "application/json"}
    
    # Model-specific payload formatting
    if request.model == "Gemini":
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": request.message}]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 2048
            }
        }
    elif request.model == "Anthropic":
        payload = {
            "model": "claude-2.0",
            "messages": [
                {"role": "user", "content": request.message}
            ],
            "max_tokens": 1000
        }
    else:
        # For OpenAI, DeepSeek, and Mistral
        model_name = MODEL_NAMES.get(request.model, request.model.lower())
        payload = {
            "messages": [{"role": "user", "content": request.message}],
            "model": model_name
        }
    
    logger.info(f"Sending request to {api_url}")
    logger.info(f"Headers: {json.dumps({k: '***' if k == 'Authorization' else v for k, v in headers.items()})}")
    logger.info(f"Payload: {json.dumps(payload)}")
    
    try:
        response = requests.post(api_url, json=payload, headers=headers)
        
        logger.info(f"Response status: {response.status_code}")
        
        # Log partial response content for debugging
        try:
            response_json = response.json()
            logger.info(f"Response preview: {json.dumps(response_json)[:500]}...")
        except Exception as json_err:
            logger.error(f"Error parsing response as JSON: {str(json_err)}")
            logger.info(f"Response text preview: {response.text[:500]}...")
        
        response.raise_for_status()
        
        # Model-specific response parsing
        if request.model == "Gemini":
            try:
                candidate = response.json().get("candidates", [{}])[0]
                content = candidate.get("content", {})
                parts = content.get("parts", [{}])
                reply = parts[0].get("text", "No response") if parts else "Empty response"
            except (KeyError, IndexError) as e:
                logger.error(f"Error parsing Gemini response: {str(e)}")
                logger.error(f"Response JSON: {json.dumps(response.json())}")
                reply = "Error parsing Gemini response"
        elif request.model == "Anthropic":
            reply = response.json().get("content", [{}])[0].get("text", "No response")
        else:
            reply = response.json().get("choices", [{}])[0].get("message", {}).get("content", "No response")
        
        return {"reply": reply}
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {str(e)}")
        
        error_message = str(e)
        status_code = 500
        
        if hasattr(e, 'response') and e.response:
            status_code = e.response.status_code
            logger.error(f"Response status code: {status_code}")
            logger.error(f"Response text: {e.response.text[:1000]}")
            
            try:
                error_json = e.response.json()
                error_detail = error_json.get('error', {})
                if isinstance(error_detail, dict):
                    error_message = error_detail.get('message', str(e))
                else:
                    error_message = str(error_detail)
                logger.error(f"Parsed error: {error_message}")
            except Exception as json_err:
                logger.error(f"Failed to parse error response: {str(json_err)}")
                error_message = e.response.text
        
        raise HTTPException(status_code=status_code, detail=error_message)
