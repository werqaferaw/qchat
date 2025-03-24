import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const models = ["OpenAI", "Gemini", "Anthropic", "DeepSeek", "Mistral"];

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("OpenAI");
  const [apiKey, setApiKey] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessage = { role: "user", content: input };
    setMessages([...messages, newMessage]);
    setInput("");
    
    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: selectedModel, message: input, apiKey })
    });
    
    const data = await response.json();
    setMessages([...messages, newMessage, { role: "assistant", content: data.reply }]);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Input placeholder="Enter API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
      <Select onValueChange={setSelectedModel} defaultValue={selectedModel}>
        {models.map((model) => (
          <SelectItem key={model} value={model}>{model}</SelectItem>
        ))}
      </Select>
      <Card className="h-96 overflow-y-auto p-2">
        <CardContent>
          {messages.map((msg, i) => (
            <div key={i} className={`my-2 p-2 rounded ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
              {msg.content}
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}

