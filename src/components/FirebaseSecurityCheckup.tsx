import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertTriangle, 
  Terminal, 
  ExternalLink, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Lock,
  Layers,
  FileCode2,
  Database
} from 'lucide-react';

interface SecurityStep {
  id: number;
  title: string;
  badge: string;
  badgeColor: 'rose' | 'amber' | 'emerald' | 'cyan';
  description: string;
  codeSnippet?: string;
  note?: string;
  recommendation?: string;
}

const SECURITY_STEPS: SecurityStep[] = [
  {
    id: 1,
    title: 'Look for open rules',
    badge: 'Critical Vulnerability',
    badgeColor: 'rose',
    description:
      'Navigate to Firebase console > Firestore > Rules. If you see "if true", anyone on the internet can read and manipulate your entire database. A test-mode date like request.time < timestamp.date(...) is also completely open to the public until that date passes.',
    recommendation: 'Replace all wildcard "allow read, write: if true;" with strict authenticated ownership checks immediately.',
  },
  {
    id: 2,
    title: '"request.auth != null" is not enough',
    badge: 'Common Misconception',
    badgeColor: 'amber',
    description:
      'It only means "signed in". Anyone can create a free account in one minute and read or delete every other user\'s private data, customer profiles, and transaction records.',
    recommendation: 'Always enforce UID verification: request.auth.uid == userId to isolate tenant data.',
  },
  {
    id: 3,
    title: 'Lock it to the owner',
    badge: 'Firestore Rules',
    badgeColor: 'emerald',
    description:
      'Rules do not automatically cascade or protect subcollections. Add an explicit rule for each collection and subcollection path.',
    codeSnippet: `match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}`,
    note: 'Remember to apply matching rules to subcollections like /users/{userId}/orders/{orderId}.',
  },
  {
    id: 4,
    title: 'Check Storage & Realtime Database too',
    badge: 'Storage & RTDB',
    badgeColor: 'cyan',
    description:
      'Firebase Storage and Realtime Database have their own separate, independent security rules. Your Firestore rules do not protect uploaded images, invoices, or RTDB nodes.',
    codeSnippet: `match /user/{userId}/{allPaths=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}`,
    note: 'Also enforce upload size limits and content-type restrictions (e.g. request.resource.size < 5 * 1024 * 1024 && request.resource.contentType.matches("image/.*")).',
  },
  {
    id: 5,
    title: 'Test before you publish',
    badge: 'Verification',
    badgeColor: 'emerald',
    description:
      'Use the Rules Playground directly in the Firebase Console or the local Firebase Emulator Suite. Simulate simulated requests as an unauthenticated visitor and as a different user. If user B can read user A\'s document, fix it before deploying.',
    recommendation: 'Run continuous security assertions with the @firebase/rules-unit-testing library before production deployment.',
  },
];

export const FirebaseSecurityCheckup: React.FC<{
  onClose?: () => void;
  isModal?: boolean;
}> = ({ onClose, isModal = false }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('firebase_security_audit_progress');
      return saved ? JSON.parse(saved) : [3];
    } catch {
      return [3];
    }
  });

  const [copiedSnippetId, setCopiedSnippetId] = useState<number | string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([1, 2, 3, 4, 5]);

  const toggleStep = (id: number) => {
    setCompletedSteps((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('firebase_security_audit_progress', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save audit state:', e);
      }
      return next;
    });
  };

  const toggleAccordion = (id: number) => {
    setExpandedSteps((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopy = (text: string, id: number | string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSnippetId(id);
      setTimeout(() => setCopiedSnippetId(null), 2200);
    }
  };

  const resetAudit = () => {
    setCompletedSteps([]);
    try {
      localStorage.removeItem('firebase_security_audit_progress');
    } catch (e) {
      console.error(e);
    }
  };

  const progressPercent = Math.round((completedSteps.length / SECURITY_STEPS.length) * 100);

  const containerContent = (
    <div className="w-full bg-[#0B0F17] text-slate-200 border border-slate-800/80 shadow-2xl overflow-hidden font-sans rounded-xl">
      {/* 1. Header with Glowing Developer Gradient Accent */}
      <div className="relative p-5 sm:p-7 border-b border-slate-800/90 bg-gradient-to-r from-[#0F172A] via-[#111827] to-[#0A0E17] overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>SECURITY AUDIT · DEV TOOLS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Firebase Rules Check: 5 steps, 5 minutes.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl font-normal leading-relaxed">
              Verify database rules, lock subcollections to document owners, protect Storage buckets, and eliminate open access loopholes.
            </p>
          </div>

          {/* Progress Tracker Pill & Reset */}
          <div className="flex flex-col items-start sm:items-end gap-2 bg-slate-900/80 p-3.5 border border-slate-800 rounded-lg shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">
                Audited: <strong className="text-white font-bold">{completedSteps.length}</strong> / {SECURITY_STEPS.length}
              </span>
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                progressPercent === 100 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {progressPercent}%
              </span>
              {completedSteps.length > 0 && (
                <button
                  onClick={resetAudit}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                  title="Reset audit checklist"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mini Progress Bar */}
            <div className="w-44 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Steps Card List */}
      <div className="p-4 sm:p-7 space-y-4 bg-[#0A0D14]">
        {SECURITY_STEPS.map((step) => {
          const isDone = completedSteps.includes(step.id);
          const isExpanded = expandedSteps.includes(step.id);

          return (
            <div
              key={step.id}
              className={`border transition-all duration-200 rounded-lg overflow-hidden ${
                isDone 
                  ? 'border-emerald-500/30 bg-emerald-950/10' 
                  : 'border-slate-800/90 bg-[#0F141F] hover:border-slate-700'
              }`}
            >
              {/* Step Header */}
              <div className="p-4 sm:p-4.5 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none">
                <div 
                  className="flex items-start sm:items-center gap-3 flex-1 min-w-0"
                  onClick={() => toggleAccordion(step.id)}
                >
                  {/* Step ID Avatar */}
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                    isDone 
                      ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/40' 
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : `0${step.id}`}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                        Step {step.id}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        step.badgeColor === 'rose'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : step.badgeColor === 'amber'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : step.badgeColor === 'cyan'
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {step.badge}
                      </span>
                    </div>

                    <h3 className={`text-sm sm:text-base font-bold tracking-tight mt-0.5 ${
                      isDone ? 'text-emerald-300 line-through decoration-emerald-500/50' : 'text-white'
                    }`}>
                      {step.title}
                    </h3>
                  </div>
                </div>

                {/* Checklist Action + Accordion Toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStep(step.id);
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Audited</span>
                      </>
                    ) : (
                      <span>Mark Verified</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleAccordion(step.id)}
                    className="p-1 text-slate-500 hover:text-slate-200 transition-colors"
                    aria-label="Toggle step details"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Step Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-1 space-y-3 border-t border-slate-800/60 text-xs sm:text-sm">
                  <p className="text-slate-300 font-normal leading-relaxed">
                    {step.description}
                  </p>

                  {step.recommendation && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-md flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-amber-200/90 text-xs leading-normal">
                        <strong>Action:</strong> {step.recommendation}
                      </span>
                    </div>
                  )}

                  {/* Code Snippet Box with 1-Click Copy */}
                  {step.codeSnippet && (
                    <div className="relative group rounded-md overflow-hidden border border-slate-700/80 bg-[#070A0F]">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <FileCode2 className="w-3.5 h-3.5" />
                          <span>firestore.rules</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(step.codeSnippet!, step.id)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          {copiedSnippetId === step.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Rule</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="p-3.5 overflow-x-auto text-xs font-mono text-emerald-300/95 leading-relaxed selection:bg-emerald-500/30">
                        <code>{step.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  {step.note && (
                    <p className="text-xs text-slate-400 italic">
                      *Note: {step.note}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* 3. PRO TIP / FOOTER TERMINAL BOX */}
        <div className="mt-6 p-4 sm:p-5 rounded-lg border border-slate-700/90 bg-gradient-to-br from-slate-900 to-[#0A0E17] space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-amber-400">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>PRO TIP · PRODUCTION HARDENING</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('allow read, write: if false;', 'protip')}
              className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {copiedSnippetId === 'protip' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 rounded bg-[#06080E] border border-slate-800 text-xs font-mono text-slate-200">
            <span className="text-slate-500">// Zero Trust Default Baseline</span>
            <div className="text-emerald-400 font-bold mt-1">
              Safe start: <code className="bg-slate-800/80 px-1.5 py-0.5 rounded text-amber-300">allow read, write: if false;</code>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Then open only what you need. Remember to change the path names to match your own app.
          </p>
        </div>
      </div>

      {/* Optional Modal Footer Close */}
      {isModal && onClose && (
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold uppercase tracking-wider transition-colors rounded"
          >
            Close Security Audit
          </button>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
        <div className="max-w-3xl w-full">{containerContent}</div>
      </div>
    );
  }

  return containerContent;
};
