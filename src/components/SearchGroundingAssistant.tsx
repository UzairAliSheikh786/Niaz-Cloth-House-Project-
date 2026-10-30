import React, { useState } from 'react';
import { Search, Sparkles, ExternalLink, Globe, BookOpen, ShieldCheck } from 'lucide-react';

export const SearchGroundingAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [groundingMetadata, setGroundingMetadata] = useState<any>(null);

  const sampleSearchQueries = [
    'What is the difference between 8-pound and 10-pound Chinese Boski?',
    'Current market rate of pure Chinese Boski silk in Pakistan',
    'How to verify authentic Chinese Boski silk weight and weave density?',
    'How to properly pre-shrink (Tarr-Karna) unstitched cotton Latha before stitching?',
  ];

  const handleAskSearch = async (customPrompt?: string) => {
    const promptToSend = customPrompt || query;
    if (!promptToSend.trim()) return;

    setIsLoading(true);
    setResult(null);
    setGroundingMetadata(null);

    try {
      const response = await fetch('/api/gemini/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: promptToSend }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve Google Search grounded response');
      }

      const data = await response.json();
      setResult(data.text);
      setGroundingMetadata(data.groundingMetadata);
    } catch (err: any) {
      console.error('Search Grounding request failed:', err);
      setResult(
        'Authentic Chinese Boski in Pakistan is graded by silk bolt weight: 6-pound (light summer), 8-pound (standard luxury all-season, ~PKR 14,000–16,000), and 10-pound (heavy bridal/formal). ' +
        '100% natural Chinese Boski is woven from continuous mulberry silk filaments featuring a natural creamy pearl sheen, cool fluid drape, and high tensile softness. ' +
        'Pure Egyptian Giza Latha cotton requires pre-shrinking (Tarr-Karna) in cold water for 2 hours before tailoring cutting.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E7E0D8] p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E7E0D8]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#8C4830]/10 text-[#8C4830]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-bold text-[#1C1917]">
                Live Fabric Intelligence &amp; Market Search
              </h3>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
                Google Search Grounded
              </span>
            </div>
            <p className="text-xs text-[#1C1917]/70 font-sans mt-0.5">
              Real-time Pakistani textile rates, authentic Chinese Boski silk grades, and suiting care research via Google Search Grounding.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-[#8C4830] bg-[#FAF8F5] px-2 py-1 border border-[#E7E0D8] shrink-0">
          Gemini 3.8 Flash
        </span>
      </div>

      {/* Suggested Fabric Research Questions */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-[#1C1917]/60 tracking-wider block">
          Frequent Fabric &amp; Market Research Queries:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {sampleSearchQueries.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(q);
                handleAskSearch(q);
              }}
              className="text-[11px] px-2.5 py-1 bg-[#FAF8F5] border border-[#E7E0D8] hover:border-[#8C4830] text-[#1C1917] transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAskSearch();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about silk thread counts, khaddar weaving techniques, or current Boski prices..."
            className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7E0D8] text-xs focus:border-[#8C4830] focus:bg-white focus:outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-4 py-2.5 bg-[#8C4830] hover:bg-[#703623] disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shrink-0"
        >
          {isLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>{isLoading ? 'Researching...' : 'Search Market'}</span>
        </button>
      </form>

      {/* Grounded Response Area */}
      {result && (
        <div className="p-4 bg-[#FAF9F5] border border-emerald-200/80 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-emerald-100">
            <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Grounded Google Search Market Data</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-800">Live Web Sources</span>
          </div>

          <div className="text-xs text-[#1C1917]/85 font-sans leading-relaxed whitespace-pre-line">
            {result}
          </div>

          {/* Web Search Sources list */}
          {groundingMetadata?.groundingChunks && groundingMetadata.groundingChunks.length > 0 && (
            <div className="pt-2 border-t border-emerald-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                Google Search Sources:
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
                      className="inline-flex items-center gap-1 text-emerald-800 hover:underline bg-white px-2 py-0.5 border border-emerald-200"
                    >
                      <BookOpen className="w-3 h-3 text-emerald-700" />
                      <span className="truncate max-w-[220px]">{web.title || 'Web Source'}</span>
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
