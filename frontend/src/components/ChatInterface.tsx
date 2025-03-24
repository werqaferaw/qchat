'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Send, Settings, Menu, User, File, Moon, Sun } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('Gemini');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [reasoning, setReasoning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const models = ['OpenAI', 'Gemini', 'Anthropic', 'DeepSeek', 'Mistral'];

  const modelInfo = {
    OpenAI: 'Uses gpt-3.5-turbo. Get key at platform.openai.com/api-keys',
    Gemini: 'Uses gemini-pro. Get key at aistudio.google.com/app/apikey',
    Anthropic: 'Uses claude-2.0. Get key at console.anthropic.com/settings/keys',
    DeepSeek: 'Uses deepseek-chat. Get key at platform.deepseek.com/api-key',
    Mistral: 'Uses mistral-medium. Get key at console.mistral.ai/api-keys/'
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.className = newTheme;
  };

  // Initialize theme
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Check if backend is running
  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Use environment variable if available, otherwise default to localhost
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        await axios.get(`${backendUrl}/`);
        setBackendStatus('online');
      } catch (err) {
        setBackendStatus('offline');
        setError('Backend server is not responding. Please make sure it is running.');
      }
    };
    
    checkBackend();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !apiKey.trim()) return;

    setIsLoading(true);
    setError('');

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');

    try {
      console.log(`Sending request to ${model} with message: ${currentInput.substring(0, 50)}...`);
      
      // Use environment variable if available, otherwise default to localhost
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.post(`${backendUrl}/chat`, {
        model,
        message: currentInput,
        apiKey,
      });

      console.log('Response received:', response.data);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.reply,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error details:', err);
      
      let errorMsg = 'An unknown error occurred';
      
      if (err.response) {
        console.error('Response error data:', err.response.data);
        console.error('Response status:', err.response.status);
        
        if (err.response.data && err.response.data.detail) {
          errorMsg = `API Error: ${err.response.data.detail}`;
        } else {
          errorMsg = `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
        errorMsg = 'No response from server. Is the backend running?';
      } else {
        console.error('Request setup error:', err.message);
        errorMsg = `Request failed: ${err.message}`;
      }
      
      setError(errorMsg);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `Error: ${errorMsg}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const showApiKeyWarning = !apiKey.trim() && backendStatus === 'online';

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Settings</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">API Key</label>
                <Input
                  type="password"
                  placeholder="Enter API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required for model access. Your API key stays in your browser.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {modelInfo[model as keyof typeof modelInfo]}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Theme</label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleTheme}
                  className="ml-auto"
                >
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  {theme === 'light' ? ' Dark Mode' : ' Light Mode'}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={reasoning} 
                  onChange={() => setReasoning(!reasoning)} 
                  id="reasoning"
                />
                <label htmlFor="reasoning" className="text-sm font-medium">
                  Enhanced Reasoning
                </label>
                <div className="text-xs text-gray-500 ml-auto">
                  May improve response quality
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button onClick={() => setShowSettings(false)} className="w-full">
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 bg-white p-4 shadow-lg flex flex-col h-screen">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 relative">
              <Image src="/logo.svg" alt="QChat Logo" fill sizes="100%" className="object-contain" />
            </div>
            <span className="text-lg font-semibold">QChat</span>
          </div>
          
          <h3 className="text-sm font-semibold mb-2">Recent Chats</h3>
          <ul className="space-y-1 mb-auto overflow-y-auto">
            {[1, 2, 3].map(i => (
              <li key={i} className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-sm">
                Chat {i}
              </li>
            ))}
          </ul>
          
          <div className="mt-auto pt-4 border-t">
            <div className="text-xs text-gray-500 mb-2">
              Current Model: <span className="font-medium">{model}</span>
            </div>
            {!apiKey && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSettings(true)}
                className="w-full text-sm"
              >
                Add API Key
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Main Chat UI */}
      <div className="flex flex-col flex-1">
        {backendStatus === 'offline' && (
          <div className="bg-red-500 text-white p-2 text-center text-sm">
            Backend server is not responding. Please start the backend server.
          </div>
        )}
        
        <div className="flex-1 flex flex-col items-center p-4">
          <div className="w-full flex justify-between items-center mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          
          <Card className="w-full max-w-lg shadow-lg rounded-2xl bg-white">
            <CardContent className="p-4 space-y-4">
              <div 
                ref={chatContainerRef}
                className="h-[60vh] overflow-y-auto p-2 rounded-lg bg-gray-50"
              >
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 mb-4 relative">
                      <Image src="/logo.svg" alt="QChat Logo" fill sizes="100%" className="object-contain" />
                    </div>
                    <h2 className="text-lg font-medium mb-2">Welcome to QChat</h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Multi-model chat interface with {models.join(", ")} support
                    </p>
                    {showApiKeyWarning && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowSettings(true)}
                      >
                        Add API Key to Get Started
                      </Button>
                    )}
                  </div>
                )}

                {messages.map((msg, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-3 ${msg.role === 'user' ? 'flex justify-end' : ''}`}
                  >
                    <div className={`p-3 rounded-lg max-w-[80%] ${
                      msg.role === 'user' 
                        ? 'ml-auto bg-blue-500 text-white' 
                        : msg.role === 'system'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {msg.content.split('\n').map((text, i) => (
                        <p key={i} className="mb-1 last:mb-0">{text}</p>
                      ))}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex"
                  >
                    <div className="p-3 rounded-lg bg-gray-200 text-gray-800">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef}></div>
              </div>
              
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..." 
                  disabled={isLoading || backendStatus === 'offline' || !apiKey.trim()}
                  className="flex-1"
                />
                <Button 
                  type="submit"
                  disabled={isLoading || !input.trim() || !apiKey.trim() || backendStatus === 'offline'}
                  className="p-2"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Model Switch, Add File, and Reasoning Toggle */}
          <div className="flex gap-4 mt-4 items-center">
            <Button variant="outline" size="icon" className="p-2">
              <File className="w-5 h-5" />
            </Button>
            
            <select 
              value={model} 
              onChange={(e) => setModel(e.target.value)} 
              className="border rounded-lg p-2 text-sm"
            >
              {models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={reasoning} 
                onChange={() => setReasoning(!reasoning)} 
              />
              Enhanced Reasoning
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 