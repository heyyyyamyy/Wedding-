import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, ArrowUpRight, Github, Code, Check, Copy, HelpCircle, ExternalLink } from 'lucide-react';

export default function VercelDeploy() {
  const [repoUrl, setRepoUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Generate Vercel One-Click Deploy URL based on user's repo or default general import
  const getDeployUrl = () => {
    if (repoUrl.trim()) {
      return `https://vercel.com/new/clone?repository-url=${encodeURIComponent(repoUrl.trim())}`;
    }
    return 'https://vercel.com/new';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      id: 1,
      title: 'Download Project ZIP',
      description: 'Click the Settings or Export menu in the Google AI Studio UI and choose "Download ZIP", or sync with your GitHub account directly.',
      tip: 'This packages all customized React, Tailwind v4 and countdown components into a clean, ready-to-use bundle.'
    },
    {
      id: 2,
      title: 'Create GitHub Repository',
      description: 'Create a new repository on GitHub and upload your extracted project files. Make sure to commit the files to the main branch.',
      tip: 'Vercel connects directly to GitHub to enable automatic builds whenever you update your wedding details.'
    },
    {
      id: 3,
      title: 'Generate Deploy Button',
      description: 'Paste your GitHub repository URL below to generate a custom "One-Click Deploy" link or press Deploy to import directly.',
      tip: 'Once configured, any future changes you commit on GitHub will update your wedding website instantly!'
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-white border border-gold-200/50 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden"
      >
        {/* Soft elegant linear background shimmer */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] tracking-[0.25em] font-sans uppercase font-bold text-gold-600 block mb-1">
              Publish Your Invitation
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-emerald-950 font-bold tracking-wide">
              One-Click Vercel Deploy
            </h3>
            <p className="text-xs text-emerald-900/60 mt-1">
              Host your wedding website for free on Vercel with absolute ease.
            </p>
          </div>
          <div className="self-start sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-sans font-bold bg-emerald-50 border border-emerald-100 text-emerald-800">
              <Cloud className="w-3.5 h-3.5" /> Production Ready
            </span>
          </div>
        </div>

        {/* Step Progression Indicators */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`text-left p-3 rounded-2xl border transition-all duration-300 relative cursor-pointer ${
                activeStep === step.id
                  ? 'bg-gold-50/50 border-gold-400 shadow-sm'
                  : 'bg-transparent border-transparent hover:bg-gold-50/20'
              }`}
            >
              <span className={`block text-xs font-sans font-bold mb-1 ${
                activeStep === step.id ? 'text-gold-600' : 'text-emerald-900/40'
              }`}>
                Step 0{step.id}
              </span>
              <span className={`block text-xs sm:text-sm font-serif font-medium truncate ${
                activeStep === step.id ? 'text-emerald-950' : 'text-emerald-950/60'
              }`}>
                {step.title}
              </span>
            </button>
          ))}
        </div>

        {/* Step Contents */}
        <div className="bg-gold-50/30 border border-gold-200/40 rounded-2xl p-5 mb-8 min-h-[140px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="font-serif text-base font-semibold text-emerald-950 mb-2">
                {steps[activeStep - 1].title}
              </h4>
              <p className="text-xs sm:text-sm text-emerald-900/80 leading-relaxed mb-4">
                {steps[activeStep - 1].description}
              </p>
              <div className="flex items-start gap-2 text-[11px] text-gold-700 font-sans italic bg-white/80 p-3 rounded-xl border border-gold-100">
                <HelpCircle className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <span><strong>Pro Tip:</strong> {steps[activeStep - 1].tip}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Deploy Link Generator */}
        <div className="space-y-4 border-t border-gold-100 pt-6">
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest font-sans font-semibold text-emerald-950">
              Customize Deploy Link (Optional)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gold-600">
                  <Github className="w-4 h-4" />
                </span>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/yourusername/wedding-invitation"
                  className="w-full bg-emerald-50/10 border border-gold-200 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 rounded-xl py-3 pl-11 pr-4 text-emerald-950 text-xs sm:text-sm placeholder-emerald-900/30 transition-all duration-300"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const url = getDeployUrl();
                  copyToClipboard(url);
                }}
                className="py-3 px-4 rounded-xl border border-gold-300 bg-white hover:bg-gold-50 text-gold-700 text-xs font-sans uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 transition-all duration-300 shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 animate-scale" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Deploy Link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Large Action Trigger */}
          <div className="pt-2">
            <a
              href={getDeployUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 bg-emerald-950 hover:bg-emerald-900 border border-gold-400/30 text-gold-100 font-sans text-xs uppercase tracking-widest font-bold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer text-center group"
            >
              {/* Custom SVG Vercel logo inside button */}
              <svg
                viewBox="0 0 115 115"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 fill-white group-hover:scale-110 transition-transform duration-300"
              >
                <path d="M57.5 0L115 100H0L57.5 0Z" />
              </svg>
              One-Click Deploy to Vercel
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </a>
            <span className="block text-center text-[10px] text-emerald-900/40 mt-2.5 font-sans">
              No server configuration or terminal coding required. Static assets builds instantly in 30 seconds.
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
