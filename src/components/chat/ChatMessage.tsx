
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ThumbsUp, ThumbsDown, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: Message;
  onCopy: () => void;
  onFeedback: (type: 'up' | 'down') => void;
}

export function ChatMessage({ message, onCopy, onFeedback }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "flex gap-4 group",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser 
          ? "bg-blue-600" 
          : "bg-gradient-to-br from-emerald-500 to-teal-600"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 space-y-2",
        isUser ? "max-w-[80%]" : "max-w-full"
      )}>
        <div className={cn(
          "rounded-lg px-4 py-3 break-words",
          isUser 
            ? "bg-blue-600 text-white ml-auto" 
            : "bg-slate-800/50 text-slate-100"
        )}>
          <div className="whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-5 bg-current animate-pulse ml-1" />
            )}
          </div>
        </div>

        {/* Message Actions */}
        {!isUser && !message.isStreaming && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopy}
              className="h-7 px-2 text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback('up')}
              className="h-7 px-2 text-slate-400 hover:text-green-400 hover:bg-slate-700/50"
            >
              <ThumbsUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback('down')}
              className="h-7 px-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50"
            >
              <ThumbsDown className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Timestamp */}
        <div className={cn(
          "text-xs text-slate-500",
          isUser ? "text-right" : "text-left"
        )}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
