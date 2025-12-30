
import React, { useState, useRef, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { chatWithNeuralCore, generateHighchartsConfig } from '../services/geminiService';
import { AIChatMessage } from '../types';

// Safe module resolution for ESM
const H: any = (Highcharts as any).default || Highcharts;

const AIChatSidebar: React.FC = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    { role: 'model', text: 'Neural Interface Active. I can help you monitor the engine or design custom Highcharts visualizations for your data. Try asking: "Create a 3D bar chart of crypto volume peaks".' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [isDesignerMode, setIsDesignerMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    if (isDesignerMode) {
      const { text, config } = await generateHighchartsConfig(userMsg);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'model', text, chartConfig: config }]);
    } else {
      const { text, sources } = await chatWithNeuralCore(userMsg, useSearch);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'model', text, sources }]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 w-full max-w-sm shrink-0 shadow-2xl relative z-20">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl ${isDesignerMode ? 'bg-purple-600' : 'bg-blue-600'} flex items-center justify-center transition-colors shadow-lg`}>
              <i className={`fas ${isDesignerMode ? 'fa-chart-pie' : 'fa-brain'} text-white`}></i>
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">{isDesignerMode ? 'Chart Designer' : 'Neural Core AI'}</h2>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] text-slate-500 uppercase font-mono tracking-tighter">Uplink Active</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <button 
              onClick={() => setIsDesignerMode(!isDesignerMode)}
              className={`p-2 rounded-lg border text-[10px] transition-all ${
                isDesignerMode 
                  ? 'bg-purple-600 border-purple-400 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Chart GPT Mode"
            >
              <i className="fas fa-pen-nib"></i>
            </button>
            <button 
              onClick={() => setUseSearch(!useSearch)}
              disabled={isDesignerMode}
              className={`p-2 rounded-lg border text-[10px] transition-all ${
                useSearch 
                  ? 'bg-blue-600 border-blue-400 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
              } disabled:opacity-30`}
            >
              <i className="fab fa-google"></i>
            </button>
          </div>
        </div>

        {isDesignerMode && (
          <div className="px-3 py-1.5 bg-purple-600/10 border border-purple-500/20 rounded-lg">
             <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest leading-tight">
               <i className="fas fa-magic mr-1"></i> Visual Intelligence Active: Highcharts GPT specialized module.
             </p>
          </div>
        )}
      </div>

      {/* Message Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[95%] p-3 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-xl' 
                : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none backdrop-blur-sm'
            }`}>
              {/* Clean up the AI response text if it contains the json block we've already parsed */}
              <div className="whitespace-pre-wrap">
                {msg.text.split('```json')[0]}
              </div>
              
              {/* Render Chart Preview if config exists */}
              {msg.chartConfig && (
                <div className="mt-4 p-2 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-inner min-h-[200px]">
                  <HighchartsReact highcharts={H} options={msg.chartConfig} />
                  <div className="mt-2 text-[8px] text-slate-600 text-center uppercase tracking-[0.2em] font-mono">AI_GENERATED_COMPONENT</div>
                </div>
              )}

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Research Data:</p>
                  <div className="flex flex-col space-y-1">
                    {msg.sources.map((s, idx) => (
                      <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-400 hover:underline flex items-center truncate">
                        <i className="fas fa-link mr-1 opacity-50"></i> {s.title || s.uri}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 p-3 rounded-2xl rounded-tl-none border border-slate-700/30 flex space-x-1.5">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSend} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isDesignerMode ? "Describe a visualization..." : "Ask the neural core..."}
            className={`w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 px-5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 pr-12 transition-all placeholder:text-slate-600 ${isDesignerMode ? 'focus:ring-purple-500/50' : ''}`}
          />
          <button 
            type="submit"
            className={`absolute right-2 top-2 bottom-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDesignerMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'} shadow-lg`}
          >
            <i className={`fas ${isDesignerMode ? 'fa-wand-magic-sparkles' : 'fa-paper-plane'} text-white text-[10px]`}></i>
          </button>
        </form>
        <div className="mt-3 flex justify-between px-1">
           <span className="text-[8px] text-slate-600 font-mono uppercase tracking-widest italic">GPT-4-Turbo Optimized</span>
           <span className="text-[8px] text-slate-600 font-mono uppercase tracking-widest italic">Ready for Input</span>
        </div>
      </div>
    </div>
  );
};

export default AIChatSidebar;
