import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { ReelAudioEngine } from '../utils/reelAudioEngine';
import { UXStatePhoneMockups, UXStateNumber } from '../components/ux-reel/UXStatePhoneMockups';
import designerPortraitImg from '../assets/images/ux_reel_designer_opening_1795275449343.jpg';

interface ReelSceneMeta {
  id: string;
  kind: 'opening' | 'state' | 'ending';
  stateNum?: UXStateNumber;
  indexLabel: string;
  title: string;
  screenLabel: string;
  durationSec: number;
  doPrinciple: string;
  isConcept?: boolean;
}

const REEL_SCENES: ReelSceneMeta[] = [
  {
    id: 'opening',
    kind: 'opening',
    indexLabel: 'INTRO',
    title: 'Opening Scene',
    screenLabel: 'Web Designer Studio · Brand Hook',
    durationSec: 5.0,
    doPrinciple:
      'Establish store trust immediately and frame why edge UX states protect every sale.',
  },
  {
    id: 'state-01',
    kind: 'state',
    stateNum: 1,
    indexLabel: '01/10',
    title: 'Empty State',
    screenLabel: 'Wishlist Page',
    durationSec: 4.0,
    doPrinciple: 'Explain why the wishlist is empty and give customers one clear next step.',
  },
  {
    id: 'state-02',
    kind: 'state',
    stateNum: 2,
    indexLabel: '02/10',
    title: 'Loading State',
    screenLabel: 'Homepage Skeleton',
    durationSec: 4.0,
    doPrinciple: 'Show the shape of upcoming content instead of relying on a spinning loader.',
  },
  {
    id: 'state-03',
    kind: 'state',
    stateNum: 3,
    indexLabel: '03/10',
    title: 'Payment Error State',
    screenLabel: 'Checkout Page',
    durationSec: 4.2,
    doPrinciple:
      'Clearly explain the problem, avoid blaming the customer, and provide an alternative way to complete the purchase.',
    isConcept: true,
  },
  {
    id: 'state-04',
    kind: 'state',
    stateNum: 4,
    indexLabel: '04/10',
    title: 'No Internet State',
    screenLabel: 'Product Listing / Homepage',
    durationSec: 4.0,
    doPrinciple: 'Keep cached products visible and explain what customers can still access while offline.',
  },
  {
    id: 'state-05',
    kind: 'state',
    stateNum: 5,
    indexLabel: '05/10',
    title: 'Slow Network State',
    screenLabel: "Women's Collection Page",
    durationSec: 4.6,
    doPrinciple:
      'Provide meaningful loading feedback and a lighter browsing experience for customers with slow internet.',
    isConcept: true,
  },
  {
    id: 'state-06',
    kind: 'state',
    stateNum: 6,
    indexLabel: '06/10',
    title: 'No Search Results',
    screenLabel: 'Website Search Page',
    durationSec: 4.0,
    doPrinciple: 'Help customers correct spelling mistakes and discover relevant products.',
  },
  {
    id: 'state-07',
    kind: 'state',
    stateNum: 7,
    indexLabel: '07/10',
    title: 'Permission Denied',
    screenLabel: 'Camera Enquiry / Receipt Upload',
    durationSec: 4.2,
    doPrinciple:
      'Explain why permission is needed and provide an alternative without forcing the customer to grant access.',
    isConcept: true,
  },
  {
    id: 'state-08',
    kind: 'state',
    stateNum: 8,
    indexLabel: '08/10',
    title: 'Session Expired',
    screenLabel: 'Shopping Cart',
    durationSec: 4.2,
    doPrinciple: "Preserve the customer's cart and shopping progress before requesting another login.",
    isConcept: true,
  },
  {
    id: 'state-09',
    kind: 'state',
    stateNum: 9,
    indexLabel: '09/10',
    title: 'Form Validation',
    screenLabel: 'Create Account / Registration',
    durationSec: 4.2,
    doPrinciple: 'Highlight the exact field containing the error and explain how to correct it.',
    isConcept: true,
  },
  {
    id: 'state-10',
    kind: 'state',
    stateNum: 10,
    indexLabel: '10/10',
    title: 'Success State',
    screenLabel: 'Order Confirmation Page',
    durationSec: 4.6,
    doPrinciple: 'Confirm the order, reassure the customer, and clearly explain what happens next.',
    isConcept: true,
  },
  {
    id: 'ending',
    kind: 'ending',
    indexLabel: 'OUTRO',
    title: 'Closing Brand Reveal',
    screenLabel: 'Niaz Cloth House Homepage',
    durationSec: 5.0,
    doPrinciple: 'Close with brand heritage and a direct path into the unstitched fabric collection.',
  },
];

export const UXDesignReelPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.75 | 1 | 1.25>(1);
  const [sceneElapsedSec, setSceneElapsedSec] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [wipeTick, setWipeTick] = useState(0);

  const audioRef = useRef<ReelAudioEngine | null>(null);

  const currentScene = REEL_SCENES[sceneIndex];
  const totalDurationSec = useMemo(
    () => REEL_SCENES.reduce((sum, s) => sum + s.durationSec, 0),
    []
  );

  const totalElapsedSec = useMemo(() => {
    const prior = REEL_SCENES.slice(0, sceneIndex).reduce((sum, s) => sum + s.durationSec, 0);
    return Math.min(totalDurationSec, prior + sceneElapsedSec);
  }, [sceneIndex, sceneElapsedSec, totalDurationSec]);

  // Manage audio lifecycle
  useEffect(() => {
    const engine = new ReelAudioEngine();
    engine.setMuted(true);
    audioRef.current = engine;
    return () => {
      engine.dispose();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const engine = audioRef.current;
    if (!engine) return;
    engine.setMuted(isMuted);
    if (isPlaying && !isMuted) {
      engine.start();
    } else {
      engine.stop();
    }
  }, [isPlaying, isMuted]);

  // Timeline ticker
  useEffect(() => {
    if (!isPlaying) return;
    const tickMs = 100;
    const timer = setInterval(() => {
      setSceneElapsedSec((prev) => {
        const next = prev + (tickMs / 1000) * playbackSpeed;
        const target = REEL_SCENES[sceneIndex].durationSec;
        if (next >= target) {
          setSceneIndex((idx) => (idx + 1) % REEL_SCENES.length);
          setWipeTick((w) => w + 1);
          return 0;
        }
        return next;
      });
    }, tickMs);

    return () => clearInterval(timer);
  }, [isPlaying, sceneIndex, playbackSpeed]);

  const jumpToScene = (idx: number) => {
    const clamped = ((idx % REEL_SCENES.length) + REEL_SCENES.length) % REEL_SCENES.length;
    setSceneIndex(clamped);
    setSceneElapsedSec(0);
    setWipeTick((w) => w + 1);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next && !isMuted && audioRef.current) {
        audioRef.current.start();
      }
      return next;
    });
  };

  const toggleMusic = () => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (!nextMuted && audioRef.current) {
        audioRef.current.setMuted(false);
        if (isPlaying) audioRef.current.start();
      }
      return nextMuted;
    });
  };

  const formatTimer = (sec: number) => {
    const s = Math.max(0, Math.floor(sec));
    const mins = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const renderReelViewport = () => (
    <div
      className={`relative aspect-[9/16] w-full overflow-hidden bg-[#161619] border border-[#D4AF37]/45 shadow-[0_30px_80px_rgba(0,0,0,0.75)] flex flex-col justify-between select-none ${
        isTheaterMode ? 'max-h-[90vh] w-auto mx-auto' : 'max-w-[405px] mx-auto'
      }`}
    >
      {/* Segmented Top Story Progress Bars (12 chapters) */}
      <div className="relative z-30 px-3 pt-3 pb-2 bg-gradient-to-b from-black/75 via-black/40 to-transparent">
        <div className="grid grid-cols-12 gap-1 mb-2.5">
          {REEL_SCENES.map((scene, idx) => {
            const fillPct =
              idx < sceneIndex
                ? 100
                : idx > sceneIndex
                ? 0
                : Math.min(100, Math.round((sceneElapsedSec / scene.durationSec) * 100));
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => jumpToScene(idx)}
                aria-label={`Jump to ${scene.indexLabel}: ${scene.title}`}
                className="h-1 bg-white/25 overflow-hidden cursor-pointer focus:outline-none"
              >
                <div
                  className="h-full bg-[#D4AF37] transition-[width] duration-100"
                  style={{ width: `${fillPct}%` }}
                />
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 text-[10px] tracking-[0.18em] uppercase text-[#F7F4EE]">
          <span className="font-serif font-semibold text-[#D4AF37]">
            Niaz Cloth House · Est. 1970
          </span>
          <span className="font-mono text-[#E8D5A7]/85 tabular-nums">
            {currentScene.indexLabel}
          </span>
        </div>
      </div>

      {/* Gold Wipe Transition Overlay */}
      <div
        key={`wipe-${wipeTick}`}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-2/3 z-40 bg-gradient-to-r from-transparent via-[#D4AF37]/55 to-transparent animate-nch-gold-wipe"
      />

      {/* SCENE TYPE A: OPENING SCENE */}
      {currentScene.kind === 'opening' && (
        <div className="absolute inset-0 z-10 flex flex-col justify-between">
          <img
            src={designerPortraitImg}
            alt="Web designer in black shirt reviewing Niaz Cloth House website at studio desk"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-top animate-nch-camera"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-[#0D0D10]/45 to-[#0D0D10]/70" />

          {/* Top Brand Tag */}
          <div className="relative z-20 px-5 pt-14 text-center">
            <span className="text-[10px] uppercase tracking-[0.26em] text-[#E8D5A7] font-semibold block">
              Pakistani Heritage Fabrics · Est. 1970
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#D4AF37] tracking-[0.14em] uppercase mt-1">
              NIAZ CLOTH HOUSE
            </h2>
            <p className="text-[11px] italic font-serif text-[#F7F4EE]/85 mt-0.5">
              Dress To Impress
            </p>
          </div>

          {/* Center-Bottom Website Screen Card + Bold Gold Banner */}
          <div className="relative z-20 px-4 pb-6 space-y-3.5">
            {/* Floating Live Niaz Cloth House Website Screen Card */}
            <div className="bg-[#FAF8F4] text-[#1F1F1F] border border-[#D4AF37] p-2.5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#1F1F1F]/10 pb-1.5 mb-2">
                <span className="font-serif text-[10px] font-bold tracking-[0.14em] uppercase text-[#1F1F1F]">
                  Niaz Cloth House Storefront
                </span>
                <span className="text-[8px] uppercase tracking-widest text-[#8A6D1D] font-semibold">
                  Pre-Launch UX Audit
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <img
                  src="/images/shahi_hero_banner.jpg"
                  alt="Shahi Embroidered Collection"
                  referrerPolicy="no-referrer"
                  className="aspect-[4/3] w-full object-cover"
                />
                <img
                  src="/images/product_mens_pure_boski_1791569243386.jpg"
                  alt="Men's Pure Boski Suiting"
                  referrerPolicy="no-referrer"
                  className="aspect-[4/3] w-full object-cover"
                />
                <img
                  src="/images/gulistan_embroidered_suit.jpg"
                  alt="Women's Embroidered Suit"
                  referrerPolicy="no-referrer"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>

            {/* Required Bold Gold Banner */}
            <div className="bg-[#D4AF37] text-[#1F1F1F] px-4 py-3.5 shadow-2xl border border-[#F7F4EE]/40 text-center">
              <p
                className="font-sans text-[13px] sm:text-[14px] font-extrabold tracking-[0.06em] uppercase leading-snug"
                style={{ textWrap: 'balance' }}
              >
                DON&apos;T LAUNCH YOUR NIAZ CLOTH HOUSE WEBSITE BEFORE DESIGNING THESE 10 STATES
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SCENE TYPE B: 10 UX STATES */}
      {currentScene.kind === 'state' && currentScene.stateNum && (
        <div className="relative z-20 flex-1 flex flex-col justify-between px-4 pb-4 pt-1">
          {/* Top Numbering & State Heading */}
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[9.5px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold block">
                {currentScene.screenLabel}
                {currentScene.isConcept ? ' · UX Concept' : ''}
              </span>
              <h3 className="font-serif text-lg sm:text-xl text-[#F7F4EE] leading-tight">
                {currentScene.title}
              </h3>
            </div>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#D4AF37] tabular-nums leading-none shrink-0">
              {currentScene.indexLabel}
            </span>
          </div>

          {/* Center Realistic Smartphone Mockup */}
          <div className="my-auto py-1.5">
            <UXStatePhoneMockups
              stateNum={currentScene.stateNum}
              isPlaying={isPlaying}
              onExploreCollection={() => navigateTo('shop')}
            />
          </div>

          {/* Bottom UX Guideline ("Do:") Card */}
          <div className="bg-[#1F1F1F] border border-[#D4AF37]/45 px-3.5 py-2.5 shadow-lg">
            <p className="text-[10.5px] sm:text-[11px] text-[#F7F4EE] leading-snug">
              <strong className="text-[#D4AF37] uppercase tracking-wider mr-1.5">Do:</strong>
              {currentScene.doPrinciple}
            </p>
          </div>
        </div>
      )}

      {/* SCENE TYPE C: ENDING SCENE */}
      {currentScene.kind === 'ending' && (
        <div className="absolute inset-0 z-10 flex flex-col justify-between">
          <img
            src="/images/shahi_hero_banner.jpg"
            alt="Niaz Cloth House Heritage Collection"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover animate-nch-camera"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0D] via-[#0A0A0D]/75 to-[#0A0A0D]/80" />

          <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-8 space-y-5">
            <div className="w-12 h-px bg-[#D4AF37]" />

            <div className="space-y-1.5">
              <h2 className="font-serif text-3xl sm:text-4xl tracking-[0.14em] uppercase text-[#F7F4EE]">
                NIAZ CLOTH HOUSE
              </h2>
              <p className="text-xs tracking-[0.26em] uppercase text-[#D4AF37] font-semibold">
                DRESS TO IMPRESS — EST. 1970
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full max-w-[290px] pt-1">
              <img
                src="/images/gulistan_embroidered_suit.jpg"
                alt="Women's Embroidered Suit"
                referrerPolicy="no-referrer"
                className="aspect-[3/4] w-full object-cover border border-[#D4AF37]/40"
              />
              <img
                src="/images/product_mens_pure_boski_1791569243386.jpg"
                alt="Pure Chinese Boski"
                referrerPolicy="no-referrer"
                className="aspect-[3/4] w-full object-cover border border-[#D4AF37]/40"
              />
              <img
                src="/images/zari_chiffon_dress.jpg"
                alt="Zari Chiffon Dress"
                referrerPolicy="no-referrer"
                className="aspect-[3/4] w-full object-cover border border-[#D4AF37]/40"
              />
            </div>

            <p
              className="font-serif text-lg sm:text-xl italic text-[#F7F4EE] leading-snug max-w-[280px]"
              style={{ textWrap: 'balance' }}
            >
              &ldquo;Great Shopping Experiences Are Designed, Not Accidental.&rdquo;
            </p>

            <button
              type="button"
              onClick={() => navigateTo('shop')}
              className="w-full max-w-[270px] py-3.5 px-5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#1F1F1F] text-xs font-bold tracking-[0.18em] uppercase transition-colors flex items-center justify-center gap-2 shadow-2xl"
            >
              <span>DISCOVER THE COLLECTION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060608] text-[#F7F4EE] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-[#C5A059]/25">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#D4AF37] mb-1">
              Niaz Cloth House · UX Architecture Reel (9:16)
            </p>
            <h1
              className="font-serif text-2xl sm:text-4xl font-normal text-[#F7F4EE]"
              style={{ textWrap: 'balance' }}
            >
              10 Essential E-Commerce UX States
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleMusic}
              className={`px-3.5 py-2.5 text-xs font-semibold tracking-wider uppercase border transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
                !isMuted
                  ? 'bg-[#D4AF37] border-[#D4AF37] text-[#060608]'
                  : 'bg-[#111115] border-[#C5A059]/40 text-[#E8D5A7] hover:border-[#D4AF37]'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isMuted ? 'Enable Upbeat Music' : 'Music Playing'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTheaterMode(true)}
              className="px-3.5 py-2.5 text-xs font-semibold tracking-wider uppercase bg-[#111115] border border-[#C5A059]/40 hover:border-[#D4AF37] text-[#E8D5A7] transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Maximize2 className="w-4 h-4 text-[#D4AF37]" />
              <span>9:16 Theater Mode</span>
            </button>
          </div>
        </div>

        {/* Dual-Column Desktop Cinema Layout (Prevents Desert Island Collapse) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT: 9:16 Vertical Reel Stage */}
          <div className="lg:col-span-5 flex flex-col items-center space-y-4">
            {renderReelViewport()}

            {/* Transport Controls Bar */}
            <div className="w-full max-w-[405px] bg-[#111115] border border-[#C5A059]/30 p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => jumpToScene(sceneIndex - 1)}
                  aria-label="Previous state"
                  className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center border border-white/10 hover:border-[#D4AF37] text-[#E8D5A7] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause reel' : 'Play reel'}
                  className="px-4 py-2 min-h-[40px] bg-[#D4AF37] hover:bg-[#E5C158] text-[#060608] text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => jumpToScene(sceneIndex + 1)}
                  aria-label="Next state"
                  className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center border border-white/10 hover:border-[#D4AF37] text-[#E8D5A7] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    jumpToScene(0);
                    setIsPlaying(true);
                  }}
                  aria-label="Restart reel"
                  title="Restart Reel"
                  className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center border border-white/10 hover:border-[#D4AF37] text-[#E8D5A7] transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#E8D5A7]/80 tabular-nums">
                  {formatTimer(totalElapsedSec)} / {formatTimer(totalDurationSec)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPlaybackSpeed((s) => (s === 1 ? 1.25 : s === 1.25 ? 0.75 : 1))
                  }
                  className="px-2 py-1 text-[10px] font-mono font-semibold border border-white/15 hover:border-[#D4AF37] text-[#D4AF37]"
                  title="Cycle playback speed"
                >
                  {playbackSpeed}x
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Interactive Chapter Directory & UX Design Specification */}
          <div className="lg:col-span-7 space-y-6 min-w-0">
            <div className="bg-[#0D0D12] border border-[#C5A059]/25 p-5 sm:p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
                  Active Scene · {currentScene.indexLabel}
                </span>
                <span className="text-xs text-[#F7F4EE]/60 font-mono tabular-nums">
                  ~{Math.round(totalDurationSec)}s Vertical 9:16 Tutorial
                </span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl text-[#F7F4EE]">
                {currentScene.title} — {currentScene.screenLabel}
              </h2>

              <p className="text-sm text-[#E8D5A7]/90 leading-relaxed">
                <strong className="text-[#D4AF37] uppercase tracking-wider text-xs mr-2">
                  UX Rule (Do):
                </strong>
                {currentScene.doPrinciple}
              </p>

              <p className="text-xs text-[#F7F4EE]/55 leading-relaxed pt-1">
                Click any button inside the smartphone screen to test its micro-interaction, or jump directly to any of the 10 states below. Screens marked &ldquo;UX Concept&rdquo; showcase planned e-commerce patterns rather than live payment or account state.
              </p>
            </div>

            {/* 12-Chapter Interactive Index */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REEL_SCENES.map((scene, idx) => {
                const active = idx === sceneIndex;
                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => jumpToScene(idx)}
                    className={`text-left p-3.5 border transition-colors flex items-start gap-3 min-w-0 ${
                      active
                        ? 'bg-[#D4AF37]/12 border-[#D4AF37] text-[#F7F4EE]'
                        : 'bg-[#0D0D12] border-white/10 hover:border-[#C5A059]/45 text-[#F7F4EE]/80'
                    }`}
                  >
                    <span
                      className={`font-mono text-xs font-bold tabular-nums shrink-0 pt-0.5 ${
                        active ? 'text-[#D4AF37]' : 'text-[#C5A059]/75'
                      }`}
                    >
                      {scene.indexLabel}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#F7F4EE] truncate">
                          {scene.title}
                        </span>
                        {idx < sceneIndex && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-[#F7F4EE]/60 block truncate mt-0.5">
                        {scene.screenLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-[#E8D5A7]/80">
                <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Niaz Cloth House · Established 1970 · Paris Bazaar, Rawalpindi</span>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('shop')}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#060608] text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>Discover The Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen 9:16 Theater Presentation Modal */}
      {isTheaterMode && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="9:16 Fullscreen UX Reel"
        >
          <div className="w-full max-w-[420px] flex items-center justify-between gap-2 mb-3">
            <button
              type="button"
              onClick={togglePlay}
              className="px-3 py-1.5 bg-[#D4AF37] text-[#060608] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMusic}
                className="px-3 py-1.5 bg-[#18181D] border border-[#C5A059]/40 text-[#E8D5A7] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsTheaterMode(false)}
                className="p-2 bg-[#18181D] border border-white/20 text-white hover:border-[#D4AF37]"
                aria-label="Exit theater mode"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {renderReelViewport()}
        </div>
      )}
    </div>
  );
};
