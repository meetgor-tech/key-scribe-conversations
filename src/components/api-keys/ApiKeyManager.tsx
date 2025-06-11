
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Key, Eye, EyeOff, Trash2, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  provider: string;
  name: string;
  key: string;
  status: 'active' | 'inactive' | 'error';
  createdAt: Date;
  lastUsed?: Date;
}

const providers = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    color: 'bg-green-500',
    description: 'GPT-4, GPT-3.5-turbo, and other OpenAI models'
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    color: 'bg-orange-500',
    description: 'Claude 3 Opus, Sonnet, and Haiku models'
  },
  { 
    id: 'google', 
    name: 'Google', 
    color: 'bg-blue-500',
    description: 'Gemini Pro and Gemini Pro Vision'
  },
  { 
    id: 'cohere', 
    name: 'Cohere', 
    color: 'bg-purple-500',
    description: 'Command and Command Light models'
  },
];

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      provider: 'openai',
      name: 'Main OpenAI Key',
      key: 'sk-1234567890abcdef...',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date('2024-01-20'),
    },
    {
      id: '2',
      provider: 'anthropic',
      name: 'Claude API Key',
      key: 'sk-ant-api03-...',
      status: 'active',
      createdAt: new Date('2024-01-10'),
      lastUsed: new Date('2024-01-19'),
    },
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [keyName, setKeyName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleAddKey = () => {
    if (!selectedProvider || !keyName || !apiKey) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newKey: ApiKey = {
      id: Date.now().toString(),
      provider: selectedProvider,
      name: keyName,
      key: apiKey,
      status: 'active',
      createdAt: new Date(),
    };

    setApiKeys(prev => [...prev, newKey]);
    setShowForm(false);
    setSelectedProvider('');
    setKeyName('');
    setApiKey('');
    
    toast({
      title: "API key added",
      description: "Your API key has been securely stored",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const deleteKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
    toast({
      title: "API key deleted",
      description: "The API key has been removed",
    });
  };

  const maskKey = (key: string) => {
    if (key.length < 8) return key;
    return key.slice(0, 8) + '...' + key.slice(-4);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 bg-slate-900/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">API Key Management</h2>
            <p className="text-slate-400 mt-1">Securely manage your AI provider API keys</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add API Key
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {/* Add Key Form */}
          {showForm && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Add New API Key</CardTitle>
                <CardDescription className="text-slate-400">
                  Add an API key for one of the supported providers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="provider" className="text-slate-300">Provider</Label>
                  <select
                    id="provider"
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a provider...</option>
                    {providers.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="keyName" className="text-slate-300">Key Name</Label>
                  <Input
                    id="keyName"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g., Main API Key"
                    className="mt-1 bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <Label htmlFor="apiKey" className="text-slate-300">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste your API key here..."
                    className="mt-1 bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleAddKey} className="bg-blue-600 hover:bg-blue-700">
                    <Key className="w-4 h-4 mr-2" />
                    Add Key
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Providers Overview */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Supported Providers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providers.map(provider => {
                const providerKeys = apiKeys.filter(key => key.provider === provider.id);
                return (
                  <Card key={provider.id} className="bg-slate-800/30 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${provider.color}`} />
                        <h4 className="font-medium text-white">{provider.name}</h4>
                        <Badge variant="secondary" className="ml-auto bg-slate-700 text-slate-300">
                          {providerKeys.length} key{providerKeys.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400">{provider.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* API Keys List */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Your API Keys</h3>
            <div className="space-y-3">
              {apiKeys.map(key => {
                const provider = providers.find(p => p.id === key.provider);
                const isVisible = visibleKeys.has(key.id);
                
                return (
                  <Card key={key.id} className="bg-slate-800/30 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${provider?.color}`} />
                          <div>
                            <h4 className="font-medium text-white">{key.name}</h4>
                            <p className="text-sm text-slate-400">{provider?.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={key.status === 'active' ? 'default' : 'destructive'}
                            className={
                              key.status === 'active' 
                                ? "bg-green-600 text-white" 
                                : "bg-red-600 text-white"
                            }
                          >
                            {key.status === 'active' && <Check className="w-3 h-3 mr-1" />}
                            {key.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {key.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <code className="text-sm bg-slate-900/50 px-3 py-1 rounded text-slate-300 font-mono">
                          {isVisible ? key.key : maskKey(key.key)}
                        </code>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="text-slate-400 hover:text-white"
                          >
                            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteKey(key.id)}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {key.lastUsed && (
                        <p className="text-xs text-slate-500 mt-2">
                          Last used: {key.lastUsed.toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              
              {apiKeys.length === 0 && (
                <Card className="bg-slate-800/30 border-slate-700 border-dashed">
                  <CardContent className="p-8 text-center">
                    <Key className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h4 className="font-medium text-slate-300 mb-2">No API keys yet</h4>
                    <p className="text-slate-500 mb-4">Add your first API key to start using BYOK Chat</p>
                    <Button 
                      onClick={() => setShowForm(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Key
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
