
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Settings, 
  Plus, 
  Key,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: 'chat' | 'api-keys';
  onViewChange: (view: 'chat' | 'api-keys') => void;
  selectedModel: string;
  selectedProvider: string;
  onModelChange: (model: string) => void;
  onProviderChange: (provider: string) => void;
}

const providers = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
  { id: 'google', name: 'Google', models: ['gemini-pro', 'gemini-pro-vision'] },
  { id: 'cohere', name: 'Cohere', models: ['command', 'command-light'] },
];

export function Sidebar({ 
  activeView, 
  onViewChange, 
  selectedModel, 
  selectedProvider,
  onModelChange,
  onProviderChange 
}: SidebarProps) {
  const [conversations] = useState([
    { id: 1, title: "AI Assistant Help", timestamp: "2 min ago", model: "gpt-4" },
    { id: 2, title: "Code Review Discussion", timestamp: "1 hour ago", model: "claude-3-opus" },
    { id: 3, title: "Creative Writing", timestamp: "Yesterday", model: "gpt-4-turbo" },
  ]);

  return (
    <aside className="w-80 bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">BYOK Chat</h1>
        </div>
        
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
          onClick={() => console.log('New chat')}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
          <Button
            variant={activeView === 'chat' ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              "flex-1 text-xs",
              activeView === 'chat' 
                ? "bg-blue-600 text-white" 
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            )}
            onClick={() => onViewChange('chat')}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Chats
          </Button>
          <Button
            variant={activeView === 'api-keys' ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              "flex-1 text-xs",
              activeView === 'api-keys' 
                ? "bg-blue-600 text-white" 
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            )}
            onClick={() => onViewChange('api-keys')}
          >
            <Key className="w-3 h-3 mr-1" />
            API Keys
          </Button>
        </div>
      </div>

      {activeView === 'chat' && (
        <>
          {/* Model Selector */}
          <div className="p-4 border-b border-slate-700/50">
            <label className="text-xs font-medium text-slate-400 mb-2 block">
              Model Selection
            </label>
            <div className="space-y-2">
              <select 
                value={selectedProvider}
                onChange={(e) => {
                  onProviderChange(e.target.value);
                  const provider = providers.find(p => p.id === e.target.value);
                  if (provider) onModelChange(provider.models[0]);
                }}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
              <select 
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {providers.find(p => p.id === selectedProvider)?.models.map(model => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-hidden">
            <div className="p-4">
              <h3 className="text-xs font-medium text-slate-400 mb-3">Recent Conversations</h3>
            </div>
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-3 rounded-lg bg-slate-800/30 hover:bg-slate-700/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-medium text-white truncate flex-1">
                        {conv.title}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{conv.timestamp}</span>
                      <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-300">
                        {conv.model}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </aside>
  );
}
