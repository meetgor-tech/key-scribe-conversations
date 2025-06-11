
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
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function ChatInterface({ selectedModel, selectedProvider }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mock API key status - in real app this would come from your API key store
  const hasApiKey = true; // This should be determined by checking if user has API key for selectedProvider
  const apiKeyName = hasApiKey ? `${selectedProvider}-prod-key` : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!hasApiKey) {
      toast({ 
        title: "API Key Required", 
        description: `Please add an API key for ${selectedProvider} to continue.`,
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

    // Simulate streaming response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Simulate streaming text
    const responseText = `I understand you're asking about "${userMessage.content}". This is a simulated response using ${selectedModel} from ${selectedProvider}. In a real implementation, this would connect to your Python backend API that handles the actual AI model requests using your stored API keys.

This interface supports streaming responses, so you'd see the text appear character by character as it's generated. The clean, minimal design ensures a distraction-free conversation experience.`;

    let currentText = "";
    for (let i = 0; i < responseText.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 20));
      currentText += responseText[i];
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: currentText }
          : msg
      ));
    }

    setMessages(prev => prev.map(msg => 
      msg.id === assistantMessage.id 
        ? { ...msg, isStreaming: false }
        : msg
    ));
    
    setIsLoading(false);
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
              {hasApiKey && apiKeyName ? (
                <Badge variant="outline" className="text-xs border-green-600 text-green-400 bg-green-950/30">
                  <Key className="w-3 h-3 mr-1" />
                  {apiKeyName}
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
                {!hasApiKey && (
                  <div className="flex items-center gap-2 text-amber-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Add an API key for {selectedProvider} to get started</span>
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
            placeholder={hasApiKey ? "Type your message... (Press Enter to send, Shift+Enter for new line)" : `Add an API key for ${selectedProvider} to start chatting`}
            className="w-full min-h-[60px] max-h-[120px] resize-none bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
            disabled={isLoading || !hasApiKey}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isLoading || !hasApiKey}
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
          {hasApiKey ? (
            <>Using {selectedModel} from {selectedProvider} • API Key: {apiKeyName}</>
          ) : (
            <>Configure your API keys to start using {selectedModel} from {selectedProvider}</>
          )}
        </div>
      </div>
    </div>
  );
}
