
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Square, Key, AlertCircle } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { useToast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  selectedModel: string;
  selectedProvider: string;
  currentThreadId?: string;
  onThreadCreated?: (threadId: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const API_BASE_URL = "http://localhost:8000"; // Change this to your backend URL

export function ChatInterface({ selectedModel, selectedProvider, currentThreadId, onThreadCreated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>(currentThreadId);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get auth token from localStorage
  const getAuthToken = () => localStorage.getItem('authToken');

  // Check if user has API key for selected provider and model
  const currentApiKey = apiKeys.find(key => 
    key.provider === selectedProvider && key.model_name === selectedModel
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load API keys on mount
  useEffect(() => {
    loadApiKeys();
  }, []);

  // Load thread messages when threadId changes
  useEffect(() => {
    if (currentThreadId && currentThreadId !== threadId) {
      setThreadId(currentThreadId);
      loadThreadMessages(currentThreadId);
    }
  }, [currentThreadId]);

  const loadApiKeys = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api-keys`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const keys = await response.json();
        setApiKeys(keys);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const loadThreadMessages = async (id: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/threads/${id}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const threadMessages = await response.json();
        const formattedMessages = threadMessages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load thread messages:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const token = getAuthToken();
    if (!token) {
      toast({ 
        title: "Authentication Required", 
        description: "Please log in to continue.",
        variant: "destructive"
      });
      return;
    }

    if (!currentApiKey) {
      toast({ 
        title: "API Key Required", 
        description: `Please add an API key for ${selectedProvider} ${selectedModel} to continue.`,
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Create streaming assistant message
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          thread_id: threadId,
          provider: selectedProvider,
          model_name: selectedModel,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        let responseContent = "";
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.content) {
                  responseContent += data.content;
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: responseContent }
                      : msg
                  ));
                }
                
                if (data.done) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, isStreaming: false }
                      : msg
                  ));
                  
                  if (data.thread_id && !threadId) {
                    setThreadId(data.thread_id);
                    onThreadCreated?.(data.thread_id);
                  }
                }
                
                if (data.error) {
                  throw new Error(data.error);
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      
      // Remove the failed assistant message
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700/50 bg-slate-900/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">BYOK Chat</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                {selectedProvider}
              </Badge>
              <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                {selectedModel}
              </Badge>
              {currentApiKey ? (
                <Badge variant="outline" className="text-xs border-green-600 text-green-400 bg-green-950/30">
                  <Key className="w-3 h-3 mr-1" />
                  {currentApiKey.key_name}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs border-red-600 text-red-400 bg-red-950/30">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  No API Key
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area with proper scrolling */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                  <Send className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Start a conversation</h3>
                <p className="text-slate-400 max-w-md mb-4">
                  Ask me anything! I'm powered by your own API keys and can use any model you've configured.
                </p>
                {!currentApiKey && (
                  <div className="flex items-center gap-2 text-amber-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Add an API key for {selectedProvider} {selectedModel} to get started</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message}
                    onCopy={() => {
                      navigator.clipboard.writeText(message.content);
                      toast({ title: "Copied to clipboard" });
                    }}
                    onFeedback={(type) => {
                      toast({ title: `Feedback recorded: ${type}` });
                    }}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-slate-700/50 bg-slate-900/30 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentApiKey ? "Type your message... (Press Enter to send, Shift+Enter for new line)" : `Add an API key for ${selectedProvider} ${selectedModel} to start chatting`}
            className="w-full min-h-[60px] max-h-[120px] resize-none bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
            disabled={isLoading || !currentApiKey}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isLoading || !currentApiKey}
            className="absolute right-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {isLoading ? (
              <Square className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        
        <div className="mt-2 text-xs text-slate-500 text-center">
          {currentApiKey ? (
            <>Using {selectedModel} from {selectedProvider} • API Key: {currentApiKey.key_name}</>
          ) : (
            <>Configure your API keys to start using {selectedModel} from {selectedProvider}</>
          )}
        </div>
      </div>
    </div>
  );
}
