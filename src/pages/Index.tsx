
import { useState } from "react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Sidebar } from "@/components/layout/Sidebar";
import { ApiKeyManager } from "@/components/api-keys/ApiKeyManager";
import { SidebarProvider } from "@/components/ui/sidebar";

const Index = () => {
  const [activeView, setActiveView] = useState<'chat' | 'api-keys'>('chat');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [selectedProvider, setSelectedProvider] = useState('openai');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Sidebar 
          activeView={activeView}
          onViewChange={setActiveView}
          selectedModel={selectedModel}
          selectedProvider={selectedProvider}
          onModelChange={setSelectedModel}
          onProviderChange={setSelectedProvider}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeView === 'chat' ? (
            <ChatInterface 
              selectedModel={selectedModel}
              selectedProvider={selectedProvider}
            />
          ) : (
            <ApiKeyManager />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
