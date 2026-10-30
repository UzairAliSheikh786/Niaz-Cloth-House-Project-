import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  RotateCcw, 
  Bot, 
  User, 
  ChevronDown, 
  Clock, 
  Zap, 
  Crown, 
  HelpCircle,
  Scissors
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  fromCache?: boolean;
}

const QUICK_PROMPTS = [
  "How much fabric cut do I need for 5'10\" height?",
  "Difference between 8-pound and 10-pound Boski",
  "How to properly pre-shrink (Tarr-Karna) Latha?",
  "Which fabric is best for winter wedding guest?",
];

export const GeminiChatbot: React.FC = () => {
  const { isCheckoutOpen } = useShop();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'>('gemini-3.8-flash');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        text: 'Assalam-o-Alaikum! Welcome to Niaz Cloth House (Shop 170 Paris Bazaar, Rawalpindi). I am your fabric assistant. Ask me anything about fabric cut length for your height, the difference between 6lb, 8lb, and 10lb Boski silk, or how to soak (Tarr-Karna) Cotton and Latha before giving it to your tailor.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.8-flash',
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (isCheckoutOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send conversation history to backend Gemini endpoint
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          modelName: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      const data = await response.json();

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.text || 'Thank you for your inquiry. Our Paris Bazaar store experts are always at your service.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
        fromCache: data.fromCache,
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: 'Our shop assistant is currently busy helping customers at our Paris Bazaar store. Please ask any question about our pure 8-pound Boski silk, Egyptian Latha cotton, or WhatsApp our shop team directly at 0334-6565636.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: 'Chat history cleared. How can I help you with our fabrics today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      },
    ]);
  };

  return (
    <>
      {/* Floating Concierge Launcher Button */}
      <div className="fixed bottom-5 right-20 sm:bottom-6 sm:right-52 z-40 select-none print:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Fabric Assistant Chat"
          className="group flex items-center gap-2 bg-[#1C1917] hover:bg-[#2A2622] active:bg-[#151312] text-[#FAF8F5] p-3 sm:px-4 sm:py-3 rounded-full shadow-[0_10px_25px_-5px_rgba(28,25,23,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(28,25,23,0.7)] transition-all duration-300 border border-[#D4A373]/40 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8C4830]"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-[#D4A373] group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#D4A373]">
              Fabric Assistant
            </span>
            <span className="text-xs font-bold text-white tracking-wide">
              Ask Any Question
            </span>
          </div>
        </button>
      </div>

      {/* Slide-Up / Floating Chat Drawer Window */}
      {isOpen && (
        <div 
          role="dialog"
          aria-label="Niaz Fabric Assistant Chat"
          className="fixed bottom-20 right-4 sm:bottom-22 sm:right-6 w-[92vw] sm:w-[420px] max-h-[80vh] sm:max-h-[640px] bg-white border border-[#E7E0D8] shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="bg-[#1C1917] text-[#FAF8F5] p-3.5 sm:p-4 border-b border-[#38332E] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#8C4830]/30 border border-[#D4A373]/50 flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4 text-[#D4A373]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif text-sm font-bold text-white">Niaz Fabric Assistant</h3>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-[#8C4830] text-white">AI</span>
                </div>
                <p className="text-[10px] text-white/60">Paris Bazaar Rawalpindi · Since 1970</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset conversation"
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Model Selection Selector */}
          <div className="bg-[#F5EFEB] px-3 py-2 border-b border-[#E7E0D8] flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-1.5 text-[#1C1917]/70 font-semibold text-[11px]">
              <Zap className="w-3.5 h-3.5 text-[#8C4830]" />
              <span>Speed & Detail:</span>
            </div>

            <div className="flex items-center gap-1 bg-white p-0.5 border border-[#E7E0D8]">
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.8-flash')}
                className={`px-2 py-0.5 text-[10px] font-semibold transition-all ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'text-[#1C1917]/70 hover:text-[#1C1917]'
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                className={`px-2 py-0.5 text-[10px] font-semibold transition-all ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'text-[#1C1917]/70 hover:text-[#1C1917]'
                }`}
              >
                Fast
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-4-argon')}
                className={`px-2 py-0.5 text-[10px] font-semibold transition-all ${
                  selectedModel === 'gemini-4-argon'
                    ? 'bg-[#8C4830] text-white shadow-xs'
                    : 'text-[#1C1917]/70 hover:text-[#1C1917]'
                }`}
              >
                Detailed Advice
              </button>
            </div>
          </div>

          {/* Messages Scrollable Thread */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-[#FAF8F5]">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-[#4A5D4E] text-white'
                        : 'bg-[#1C1917] text-[#D4A373] border border-[#D4A373]/30'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className={`max-w-[82%] space-y-1 ${isUser ? 'items-end text-right' : 'items-start text-left'}`}>
                    <div
                      className={`p-3 text-xs leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-[#4A5D4E] text-white rounded-tl-xl rounded-bl-xl rounded-tr-sm'
                          : 'bg-white border border-[#E7E0D8] text-[#1C1917] rounded-tr-xl rounded-br-xl rounded-tl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] text-[#1C1917]/50 font-mono px-1">
                      <span>{msg.timestamp}</span>
                      {msg.modelUsed && !isUser && (
                        <span>· {msg.modelUsed.replace('gemini-', '')}</span>
                      )}
                      {msg.fromCache && !isUser && (
                        <span className="text-emerald-700 font-semibold">· Cached</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#1C1917] text-[#D4A373] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-[#E7E0D8] p-3 text-xs text-[#1C1917]/70 rounded-tr-xl rounded-br-xl rounded-tl-sm flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C4830] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C4830] animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C4830] animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-[11px] font-sans">Checking fabric details...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="p-2.5 bg-white border-t border-[#E7E0D8] shrink-0">
            <div className="text-[10px] text-[#1C1917]/60 font-semibold mb-1.5 flex items-center gap-1">
              <Scissors className="w-3 h-3 text-[#8C4830]" />
              <span>Common Questions:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[10px] bg-[#FAF8F5] hover:bg-[#F2EDE7] text-[#1C1917]/80 hover:text-[#1C1917] px-2 py-1 border border-[#E7E0D8] rounded-xs transition-colors truncate max-w-full disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-[#E7E0D8] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about fabric length, Boski, Cotton, or Khaddar..."
                disabled={isLoading}
                className="flex-1 text-xs py-2 px-3 bg-[#FAF8F5] border border-[#E7E0D8] text-[#1C1917] placeholder:text-[#1C1917]/40 focus:outline-none focus:border-[#8C4830] transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2 bg-[#8C4830] hover:bg-[#703623] active:bg-[#5C2B1B] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
