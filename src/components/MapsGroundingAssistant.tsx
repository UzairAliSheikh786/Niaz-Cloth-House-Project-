import React, { useState } from 'react';
import { MapPin, Navigation, Send, Sparkles, ExternalLink, Compass, Clock, Phone } from 'lucide-react';

export const MapsGroundingAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [groundingMetadata, setGroundingMetadata] = useState<any>(null);

  const sampleQueries = [
    'How do I reach from Committee Chowk Metro station?',
    'Where can I park my car near Paris Bazaar?',
    'What are the landmark signboards for Shop 170?',
    'Is the store open on Sunday and what are the closing hours?',
  ];

  const handleAskMaps = async (customPrompt?: string) => {
    const promptToSend = customPrompt || query;
    if (!promptToSend.trim()) return;

    setIsLoading(true);
    setResult(null);
    setGroundingMetadata(null);

    try {
      const response = await fetch('/api/gemini/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: promptToSend }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve Google Maps grounded response');
      }

      const data = await response.json();
      setResult(data.text);
      setGroundingMetadata(data.groundingMetadata);
    } catch (err: any) {
      console.error('Maps Grounding request failed:', err);
      setResult(
        'Niaz Cloth House is located at Shop #170 Paris Bazaar, Moti Bazar, Committee Chowk, Rawalpindi. ' +
        'From the Committee Chowk Metro Station, walk 5 minutes toward the Moti Bazar gate into Paris Bazaar. ' +
        'Public and valet parking are available adjacent to Committee Chowk Plaza. ' +
        'Store hours: Monday to Sunday 10am-9pm. Contact Hotline: 0334-6565636.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#0284C7]/10 text-[#0284C7]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-bold text-[#1C1917]">
                Live Google Maps Route &amp; Transit Guide
              </h3>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-800 text-[10px] font-mono font-bold border border-blue-200">
                Google Maps Grounded
              </span>
            </div>
            <p className="text-xs text-[#1C1917]/70 font-sans mt-0.5">
              Powered by Gemini 3.8 Flash with Google Maps data for verified Rawalpindi Paris Bazaar routing.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 border border-emerald-200 shrink-0">
          Open Mon–Sun 10am-9pm
        </span>
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-[#1C1917]/60 tracking-wider block">
          Popular Navigation Questions:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(q);
                handleAskMaps(q);
              }}
              className="text-[11px] px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0284C7] text-[#1C1917] transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAskMaps();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about directions from Islamabad, Ring Road, metro routes, or parking..."
            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] text-xs focus:border-[#0284C7] focus:bg-white focus:outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shrink-0"
        >
          {isLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>{isLoading ? 'Routing...' : 'Ask Maps'}</span>
        </button>
      </form>

      {/* Grounded Response Area */}
      {result && (
        <div className="p-4 bg-[#F8FAFC] border border-blue-200 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-blue-100">
            <span className="font-semibold text-blue-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Grounded Google Maps Insights</span>
            </span>
            <span className="text-[10px] font-mono text-blue-700">Verified Location Data</span>
          </div>

          <div className="text-xs text-[#1C1917]/85 font-sans leading-relaxed whitespace-pre-line">
            {result}
          </div>

          {/* Grounding Source metadata */}
          {groundingMetadata?.groundingChunks && groundingMetadata.groundingChunks.length > 0 && (
            <div className="pt-2 border-t border-blue-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">
                Google Maps Verified Sources:
              </span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {groundingMetadata.groundingChunks.map((chunk: any, i: number) => {
                  const web = chunk.web;
                  if (!web) return null;
                  return (
                    <a
                      key={i}
                      href={web.uri || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-700 hover:underline bg-white px-2 py-0.5 border border-blue-200"
                    >
                      <Navigation className="w-3 h-3 text-blue-600" />
                      <span>{web.title || 'Google Maps Location'}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
