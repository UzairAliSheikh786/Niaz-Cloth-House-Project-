import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Car, 
  Footprints, 
  Clock, 
  Phone, 
  ExternalLink, 
  Search, 
  Compass, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2,
  Building
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { navigationAgent, RouteDetail } from '../core/maps/GoogleMapsNavigationAgent';

interface InteractiveStoreMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_ORIGINS = [
  { label: 'Islamabad Airport (ISB)', query: 'Islamabad International Airport' },
  { label: 'Saddar Rawalpindi', query: 'Saddar Rawalpindi Cantt' },
  { label: 'Blue Area Islamabad', query: 'Blue Area, Islamabad' },
  { label: 'Committee Chowk Metro', query: 'Committee Chowk Metro Bus Station Rawalpindi' },
  { label: 'Faizabad Interchange', query: 'Faizabad Rawalpindi' },
];

export const InteractiveStoreMapModal: React.FC<InteractiveStoreMapModalProps> = ({
  isOpen,
  onClose,
}) => {
  const storeDetails = navigationAgent.getStorePlaceDetails();
  const [selectedOrigin, setSelectedOrigin] = useState('Committee Chowk Metro Bus Station Rawalpindi');
  const [customOrigin, setCustomOrigin] = useState('');
  const [travelMode, setTravelMode] = useState<'Driving' | 'Metro Bus' | 'Walking'>('Driving');
  const [routeInfo, setRouteInfo] = useState<RouteDetail | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Fallback map key from env or demo key
  const mapsApiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  // Listen to Google Maps quota exceeded event (Tier 1 defense per GMP skill)
  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Compute route on initial open or origin change
  useEffect(() => {
    if (isOpen) {
      calculateActiveRoute(selectedOrigin, travelMode);
    }
  }, [isOpen]);

  const calculateActiveRoute = async (origin: string, mode: 'Driving' | 'Metro Bus' | 'Walking') => {
    setIsCalculating(true);
    try {
      const result = await navigationAgent.calculateRoute(origin, mode);
      setRouteInfo(result);
    } catch {
      // Handled inside agent
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customOrigin.trim()) return;
    setSelectedOrigin(customOrigin.trim());
    calculateActiveRoute(customOrigin.trim(), travelMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-5xl bg-white border border-[#E2E8F0] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-agent-title"
      >
        {/* Quota Defense Banner as mandated by google-maps-platform skill */}
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs text-center sticky top-0 z-50">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#0F172A] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#38BDF8]">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="map-agent-title" className="font-serif text-lg font-bold tracking-wide">
                  Atelier Navigation &amp; Real-Time Route Agent
                </h2>
                <span className="px-2 py-0.5 bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-mono uppercase tracking-wider font-semibold">
                  Google Maps Connected
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time directions, metro connections, and verified parking for Shop #170 Paris Bazaar Rawalpindi.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors rounded-sm"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Map & Agent Panel */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* Left Column: Interactive Map View (7 cols) */}
          <div className="lg:col-span-7 h-[340px] sm:h-[420px] lg:h-full relative min-h-[340px] bg-slate-100 flex flex-col border-b lg:border-b-0 lg:border-r border-[#E2E8F0]">
            <APIProvider apiKey={mapsApiKey}>
              <div className="w-full h-full relative" style={{ minHeight: '340px', height: '100%' }}>
                <Map
                  defaultCenter={storeDetails.coordinates}
                  defaultZoom={16}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  className="w-full h-full"
                  style={{ width: '100%', height: '100%' }}
                >
                  {/* Advanced Marker for Niaz Cloth House */}
                  <AdvancedMarker position={storeDetails.coordinates} title={storeDetails.placeName}>
                    <Pin background="#0F172A" borderColor="#38BDF8" glyphColor="#38BDF8" scale={1.2} />
                  </AdvancedMarker>
                </Map>

                {/* Floating Map Overlay Card */}
                <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-xs p-3.5 border border-slate-200 shadow-md text-xs pointer-events-auto">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-serif font-bold text-slate-900 text-sm">{storeDetails.placeName}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                        Shop # 170 / # 166-C, Paris Bazaar, Moti Bazar, Committee Chowk, Rawalpindi
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-600" /> 10 AM – 9 PM
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-sky-600" /> 0334-6565636
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Google Maps External Link */}
                <div className="absolute bottom-3 right-3">
                  <a
                    href="https://maps.google.com/?q=Shop+170+Paris+Bazaar+Rawalpindi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 hover:text-sky-700 text-xs font-semibold shadow-md border border-slate-300 transition-colors"
                  >
                    <span>Open in Google Maps App</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </div>
              </div>
            </APIProvider>
          </div>

          {/* Right Column: Intelligent Directions & Route Agent (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-5 bg-white">
            {/* Origin Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                1. Select or Enter Your Departure Point:
              </label>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {PRESET_ORIGINS.map((preset) => {
                  const isSelected = selectedOrigin === preset.query;
                  return (
                    <button
                      key={preset.query}
                      type="button"
                      onClick={() => {
                        setSelectedOrigin(preset.query);
                        setCustomOrigin('');
                        calculateActiveRoute(preset.query, travelMode);
                      }}
                      className={`text-left px-2.5 py-2 text-xs border transition-all ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/70 text-sky-950 font-semibold'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Location Search */}
              <form onSubmit={handleCustomSearch} className="flex gap-2 pt-1">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customOrigin}
                    onChange={(e) => setCustomOrigin(e.target.value)}
                    placeholder="Or type custom address/city..."
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  disabled={!customOrigin.trim() || isCalculating}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
                >
                  Calculate
                </button>
              </form>
            </div>

            {/* Travel Mode Toggle */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                2. Travel Mode:
              </label>
              <div className="flex gap-2">
                {(['Driving', 'Metro Bus', 'Walking'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setTravelMode(mode);
                      calculateActiveRoute(selectedOrigin, mode);
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                      travelMode === mode
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {mode === 'Driving' && <Car className="w-3.5 h-3.5" />}
                    {mode === 'Metro Bus' && <Building className="w-3.5 h-3.5" />}
                    {mode === 'Walking' && <Footprints className="w-3.5 h-3.5" />}
                    <span>{mode}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Route Detail Box */}
            <div className="flex-1 border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              {isCalculating ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500">
                  <Sparkles className="w-5 h-5 text-sky-600 animate-spin" />
                  <span className="text-xs font-medium">Pulling live Google Maps directions...</span>
                </div>
              ) : routeInfo ? (
                <>
                  {/* Route Summary Metrics */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">Estimated Travel Time</div>
                      <div className="text-base font-serif font-bold text-slate-900">
                        {routeInfo.estimatedDuration}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Distance</div>
                      <div className="text-base font-serif font-bold text-slate-900">
                        {routeInfo.distanceKm}
                      </div>
                    </div>
                  </div>

                  {/* Turn-by-Turn Steps */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-sky-600" /> Route Guidance:
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {routeInfo.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Parking Advice */}
                  <div className="pt-2 border-t border-slate-200 flex items-start gap-2 text-xs text-emerald-900 bg-emerald-50/70 p-2.5 border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Parking &amp; Arrival Tip:</span>
                      <span className="text-[11px] leading-tight text-emerald-800">{routeInfo.parkingAdvice}</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Direct Action Link */}
            {routeInfo && (
              <a
                href={routeInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Navigation className="w-4 h-4" />
                <span>Start Turn-by-Turn Navigation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
