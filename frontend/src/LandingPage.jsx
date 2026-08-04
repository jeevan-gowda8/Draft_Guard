import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ChevronRight, 
  FileCheck, 
  Settings2, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  X, 
  Layers, 
  Zap, 
  Lock, 
  CheckSquare, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  ChevronDown, 
  AlertTriangle, 
  Building2, 
  Factory, 
  Plane, 
  Car,
  Cpu,
  FileCode,
  Sliders,
  Check,
  Menu
} from 'lucide-react';

export default function LandingPage({ 
  onOpenAuth, 
  apiOnline, 
  handleScrollToSection, 
  showAuthModal, 
  setShowAuthModal, 
  authMode, 
  setAuthMode, 
  authUsername, 
  setAuthUsername, 
  authPassword, 
  setAuthPassword, 
  authError, 
  setAuthError, 
  authLoading, 
  handleAuthSubmit 
}) {
  // Live Demo Interactive Playground State
  const [activeSampleIndex, setActiveSampleIndex] = useState(0);
  const [demoViewMode, setDemoViewMode] = useState('audit'); // 'audit' or 'raw'
  const [selectedDemoField, setSelectedDemoField] = useState(null);

  // FAQ Accordion Open State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Hero CAD Interactive State
  const [heroViewMode, setHeroViewMode] = useState('audit'); // 'audit' or 'raw'

  // Mobile Navigation Menu Open State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sample Drawing Data for Interactive Playground
  const samples = [
    {
      id: 'sample-1',
      title: 'A3-1049: Turbine Front Cover Plate',
      subtitle: 'Multi-stage Centrifugal Pump Assembly',
      completeness: 65,
      status: 'incomplete',
      criticalCount: 5,
      totalFields: 22,
      filledFields: 14,
      incompleteFields: 8,
      fields: [
        { name: 'DWG NO.', value: null, status: 'incomplete', criticality: 'critical', note: 'Document ID missing' },
        { name: 'TITLE', value: null, status: 'incomplete', criticality: 'critical', note: 'Drawing title required' },
        { name: 'DRAWN', value: 'J. Miller', status: 'filled', criticality: 'high', note: 'Filled by technician' },
        { name: 'DRAWN SIG', value: null, status: 'incomplete', criticality: 'high', note: 'Signature missing' },
        { name: 'CHK\'D SIG', value: null, status: 'incomplete', criticality: 'high', note: 'QA Checker signature missing' },
        { name: 'APPV\'D SIG', value: null, status: 'incomplete', criticality: 'medium', note: 'Engineering Manager approval missing' },
        { name: 'MATERIAL', value: null, status: 'incomplete', criticality: 'critical', note: 'Material callout missing (e.g. SS 316L)' },
        { name: 'WEIGHT', value: '14.2 kg', status: 'filled', criticality: 'low', note: 'Estimated CAD mass' },
        { name: 'REVISION', value: 'Rev B', status: 'filled', criticality: 'medium', note: 'Current active revision' },
        { name: 'SCALE', value: '1:2', status: 'filled', criticality: 'medium', note: 'View scale ratio' },
        { name: 'FINISH', value: null, status: 'incomplete', criticality: 'high', note: 'Ra 0.8 µm surface spec missing' },
      ],
      recommendations: [
        'Fill in DWG NO. — Primary key required for ERP indexing',
        'Provide DRAWN & CHK\'D technician signatures',
        'Specify MATERIAL grade (e.g. SS 316L / AISI 4140)',
        'Add FINISH surface roughness specification'
      ]
    },
    {
      id: 'sample-2',
      title: 'FL-2090: High-Pressure Flange Adapter',
      subtitle: 'Hydraulic System Connection Interface',
      completeness: 82,
      status: 'incomplete',
      criticalCount: 2,
      totalFields: 22,
      filledFields: 18,
      incompleteFields: 4,
      fields: [
        { name: 'DWG NO.', value: 'DWG-FL-2090-B', status: 'filled', criticality: 'critical', note: 'Verified against database' },
        { name: 'TITLE', value: 'FLANGE ADAPTER A3', status: 'filled', criticality: 'critical', note: 'Title confirmed' },
        { name: 'DRAWN', value: 'A. Chen', status: 'filled', criticality: 'high', note: 'Technician assigned' },
        { name: 'DRAWN SIG', value: '✔ Signed', status: 'filled', criticality: 'high', note: 'Electronic sign-off verified' },
        { name: 'CHK\'D SIG', value: null, status: 'incomplete', criticality: 'high', note: 'Pending Lead Checker sign-off' },
        { name: 'APPV\'D SIG', value: null, status: 'incomplete', criticality: 'medium', note: 'Pending Plant Manager sign-off' },
        { name: 'MATERIAL', value: 'Alloy Steel 4340', status: 'filled', criticality: 'critical', note: 'Heat-treated specification' },
        { name: 'WEIGHT', value: '8.7 kg', status: 'filled', criticality: 'low', note: 'Calculated mass' },
        { name: 'REVISION', value: 'Rev A', status: 'filled', criticality: 'medium', note: 'Initial release' },
        { name: 'SCALE', value: '1:1', status: 'filled', criticality: 'medium', note: 'Full scale print' },
      ],
      recommendations: [
        'Obtain CHK\'D technician signature for manufacturing sign-off',
        'Obtain APPV\'D manager signature before releasing ECO'
      ]
    },
    {
      id: 'sample-3',
      title: 'GH-8812: Dual-Stage Gearbox Housing',
      subtitle: 'Heavy Equipment Transmission Casing',
      completeness: 100,
      status: 'complete',
      criticalCount: 0,
      totalFields: 22,
      filledFields: 22,
      incompleteFields: 0,
      fields: [
        { name: 'DWG NO.', value: 'DWG-GH-8812-REV4', status: 'filled', criticality: 'critical', note: 'Verified against PLM' },
        { name: 'TITLE', value: 'GEARBOX HOUSING', status: 'filled', criticality: 'critical', note: 'Title confirmed' },
        { name: 'DRAWN', value: 'R. Davis', status: 'filled', criticality: 'high', note: 'Verified' },
        { name: 'DRAWN SIG', value: '✔ Signed', status: 'filled', criticality: 'high', note: 'Verified' },
        { name: 'CHK\'D SIG', value: '✔ Signed', status: 'filled', criticality: 'high', note: 'Verified' },
        { name: 'APPV\'D SIG', value: '✔ Signed', status: 'filled', criticality: 'medium', note: 'Verified' },
        { name: 'MATERIAL', value: 'Ductile Iron GGG-40', status: 'filled', criticality: 'critical', note: 'Material callout complete' },
        { name: 'WEIGHT', value: '34.5 kg', status: 'filled', criticality: 'low', note: 'Verified' },
        { name: 'REVISION', value: 'Rev D', status: 'filled', criticality: 'medium', note: 'ECO-9482 approved' },
        { name: 'SCALE', value: '1:5', status: 'filled', criticality: 'medium', note: 'Scaled view' },
      ],
      recommendations: [
        '100% Compliant — Drawing is ready for manufacturing release & ERP routing!'
      ]
    }
  ];

  const currentSample = samples[activeSampleIndex];

  // FAQ Accordion Content
  const faqs = [
    {
      q: 'What types of engineering drawing formats does DraftGuard support?',
      a: 'DraftGuard handles born-digital vector PDFs (exported directly from SolidWorks, AutoCAD, CATIA, Creo, or Inventor), scanned raster paper prints, DXF/DWF CAD files, and 2D STEP files. Vector geometry and text nodes are extracted directly for 100% parsing accuracy.'
    },
    {
      q: 'How does vector geometry parsing differ from traditional OCR?',
      a: 'Traditional OCR converts drawings into flat pixel grids, which often fails on stylized CAD fonts, technical line intersections, and faint title block borders. DraftGuard reconstructs the vector grid geometry directly from PDF stream objects, identifying exact table cells, bounding boxes, and metadata strings without optical distortion.'
    },
    {
      q: 'Can we define custom title block templates for our proprietary company standards?',
      a: 'Yes! DraftGuard includes a template engine pre-loaded with standard ISO 7200, ANSI Y14.1, and DIN 6771 layouts. You can easily define custom cell bounding box maps, field alias aliases (e.g., "DRAWN BY" vs "DESIGNED"), and criticality rules tailored to your company drawings.'
    },
    {
      q: 'Is our confidential engineering drawing data uploaded to external cloud servers?',
      a: 'No. DraftGuard is designed for strict enterprise privacy. All PDF parsing, vector extraction, and local database storage run on your local machine or private enterprise server infrastructure. Your IP and proprietary CAD prints never leave your control.'
    },
    {
      q: 'Can DraftGuard integrate with our PLM / ERP software like Siemens Teamcenter or SAP?',
      a: 'Absolutely. DraftGuard features a RESTful API and exports standardized JSON compliance manifests, enabling seamless integration into your PLM (Teamcenter, Windchill, ENOVIA) pre-release gates and ERP (SAP, Oracle) manufacturing order workflows.'
    }
  ];

  return (
    <div className="auth-page-wrapper select-none bg-slate-50 relative overflow-x-hidden min-h-screen flex flex-col font-sans">
      
      {/* Smooth Animated Background Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/12 blur-[150px] pointer-events-none animate-ambient-glow-1 z-0" />
      <div className="absolute bottom-[10%] right-[-10%] w-[650px] h-[650px] rounded-full bg-indigo-500/12 blur-[160px] pointer-events-none animate-ambient-glow-2 z-0" />

      {/* Fixed High-Tech CAD Background Grid Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-multiply z-0 animate-bg-image"
        style={{ backgroundImage: `url('/landing_hero_bg.png')` }}
      />

      {/* Header / Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md transition-all shadow-sm">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-1 sm:p-1.5 bg-white rounded-xl shadow-md shadow-blue-500/10 border border-slate-100 flex items-center justify-center">
            <img src="/logo.png" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" alt="DraftGuard Logo" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-slate-900 via-blue-950 to-slate-800 bg-clip-text text-transparent tracking-tight">
                DraftGuard
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100">
                PRO QA
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wide hidden sm:block">Engineering Drawing Inspection Suite</p>
          </div>
        </div>
        
        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600">
          <a href="#live-demo" onClick={(e) => handleScrollToSection(e, 'live-demo')} className="hover:text-blue-600 transition flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            Interactive Demo
          </a>
          <a href="#features" onClick={(e) => handleScrollToSection(e, 'features')} className="hover:text-blue-600 transition">
            Features
          </a>
          <a href="#standards" onClick={(e) => handleScrollToSection(e, 'standards')} className="hover:text-blue-600 transition">
            Standards & Formats
          </a>
          <a href="#how-it-works" onClick={(e) => handleScrollToSection(e, 'how-it-works')} className="hover:text-blue-600 transition">
            Workflow
          </a>
          <a href="#stats" onClick={(e) => handleScrollToSection(e, 'stats')} className="hover:text-blue-600 transition">
            Metrics & Impact
          </a>
          <a href="#faq" onClick={(e) => handleScrollToSection(e, 'faq')} className="hover:text-blue-600 transition">
            FAQ
          </a>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-bold transition-all duration-150 shadow-sm cursor-pointer hover:border-slate-300"
          >
            Sign In
          </button>
          <button
            onClick={() => onOpenAuth('register')}
            className="hidden xs:flex px-3.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-200 cursor-pointer items-center gap-1"
          >
            <span>Get Started</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Toggle Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu Panel */}
      {mobileMenuOpen && (
        <div className="fixed top-[65px] left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 p-5 shadow-xl lg:hidden animate-fade-in font-sans space-y-4">
          <div className="flex flex-col space-y-3 text-sm font-extrabold text-slate-700">
            <a 
              href="#live-demo" 
              onClick={(e) => { handleScrollToSection(e, 'live-demo'); setMobileMenuOpen(false); }} 
              className="p-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-blue-500" />
              <span>Interactive Demo</span>
            </a>
            <a 
              href="#features" 
              onClick={(e) => { handleScrollToSection(e, 'features'); setMobileMenuOpen(false); }} 
              className="p-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition"
            >
              Features
            </a>
            <a 
              href="#standards" 
              onClick={(e) => { handleScrollToSection(e, 'standards'); setMobileMenuOpen(false); }} 
              className="p-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition"
            >
              Standards & Formats
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => { handleScrollToSection(e, 'how-it-works'); setMobileMenuOpen(false); }} 
              className="p-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition"
            >
              Workflow
            </a>
            <a 
              href="#stats" 
              onClick={(e) => { handleScrollToSection(e, 'stats'); setMobileMenuOpen(false); }} 
              className="p-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition"
            >
              Metrics & Impact
            </a>
            <a 
              href="#faq" 
              onClick={(e) => { handleScrollToSection(e, 'faq'); setMobileMenuOpen(false); }} 
              className="p-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition"
            >
              FAQ
            </a>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 text-center"
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}

      {/* Main Landing Content Container */}
      <main className="flex-1 pt-[76px] relative z-10">

        {/* ---------------------------------------------------- */}
        {/* HERO SECTION */}
        {/* ---------------------------------------------------- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Hero Headline & Value Props */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200/70 text-blue-700 rounded-full text-xs font-extrabold shadow-sm animate-fade-in">
                <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>Next-Gen Engineering Drawing QA Engine</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Verify Technical Drawing Completeness & Eliminate <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">ECO Errors</span>
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                DraftGuard automatically parses title block metadata, flags unverified technician signatures, validates material callouts, measures geometric scale ratios, and prevents costly manufacturing release failures.
              </p>

              {/* Feature Highlights Pills */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Title Block Signature Auditing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>2D CAD Scale Ratio Checker</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>ISO 7200 & ANSI Compliant</span>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <span>Start Free Drawing Inspection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <a
                  href="#live-demo"
                  onClick={(e) => handleScrollToSection(e, 'live-demo')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-extrabold text-sm rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Interactive Live Demo</span>
                </a>
              </div>

              {/* Enterprise Security Note */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 text-[11px] text-slate-500 font-semibold">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>100% Encrypted Local Processing — Zero Third-Party Cloud Leaks</span>
              </div>
            </div>

            {/* Right Column: Interactive Hero CAD Inspection Mockup Card */}
            <div className="lg:col-span-6 animate-float-hero">
              <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-3.5 sm:p-6 shadow-2xl relative group overflow-hidden">
                
                {/* Visualizer Card Header */}
                <div className="flex flex-row items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500"></div>
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500"></div>
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500"></div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-500 truncate max-w-[110px] xs:max-w-[160px] sm:max-w-none">
                      A3_CAD_DRAWING_AUDIT.PDF
                    </span>
                  </div>
                  
                  {/* Mode Toggle */}
                  <div className="flex items-center p-0.5 sm:p-1 bg-slate-100 rounded-xl text-[10px] sm:text-[11px] font-extrabold flex-shrink-0">
                    <button 
                      onClick={() => setHeroViewMode('audit')}
                      className={`px-2 sm:px-3 py-1 rounded-lg transition whitespace-nowrap ${heroViewMode === 'audit' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      AI Audit View
                    </button>
                    <button 
                      onClick={() => setHeroViewMode('raw')}
                      className={`px-2 sm:px-3 py-1 rounded-lg transition whitespace-nowrap ${heroViewMode === 'raw' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Raw PDF
                    </button>
                  </div>
                </div>

                {/* Blueprint Interactive Display Area (Light Mode Paper Grid - Fully Mobile Responsive) */}
                <div className="relative aspect-auto sm:aspect-[1.4] min-h-[260px] sm:min-h-[320px] bg-slate-50 rounded-2xl border-2 border-slate-300/80 overflow-hidden font-mono p-3 sm:p-4 flex flex-col justify-between select-none shadow-inner">
                  
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:16px_16px] sm:bg-[size:20px_20px] opacity-70"></div>

                  {/* Top Status Flags in Audit Mode (Clean Non-Overlapping Layout) */}
                  {heroViewMode === 'audit' && (
                    <div className="relative z-20 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-1.5 mb-2">
                      {/* Floating Issue Badge */}
                      <div className="px-2.5 py-1 bg-rose-500 text-white rounded-lg text-[9px] sm:text-[10px] font-extrabold shadow-sm border border-rose-400 flex items-center justify-center gap-1 animate-pulse whitespace-nowrap">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        <span>2 CRITICAL FIELDS MISSING</span>
                      </div>

                      {/* Floating Accuracy Badge */}
                      <div className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[9px] sm:text-[10px] font-extrabold shadow-sm border border-emerald-500 flex items-center justify-center gap-1 whitespace-nowrap">
                        <CheckCircle className="w-3 h-3 flex-shrink-0" />
                        <span>ISO 7200 BORDER VERIFIED</span>
                      </div>
                    </div>
                  )}

                  {/* CAD Geometry Graphics (2D Part Outline in Light Mode) */}
                  <div className="relative z-10 flex-1 flex items-center justify-center my-3 sm:my-0">
                    <div className="relative w-48 xs:w-56 sm:w-64 h-24 sm:h-32 border-2 border-slate-800 rounded-xl flex items-center justify-center bg-white shadow-sm">
                      {/* Center Bore Hole */}
                      <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full border-2 border-dashed border-blue-600 bg-blue-50/60 flex items-center justify-center">
                        <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-blue-500/80 animate-ping"></div>
                        <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-blue-600"></div>
                      </div>
                      
                      {/* Dimension Indicators */}
                      <span className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9.5px] text-slate-900 font-extrabold bg-white px-1.5 sm:px-2 py-0.5 rounded border border-slate-400 shadow-xs whitespace-nowrap">
                        Ø 140.00 mm ± 0.05
                      </span>
                      <span className="absolute -left-6 sm:-left-7 top-1/2 -translate-y-1/2 text-[8px] sm:text-[9.5px] text-slate-900 font-extrabold bg-white px-1 py-0.5 rounded border border-slate-400 shadow-xs -rotate-90 whitespace-nowrap">
                        80.00 mm
                      </span>
                    </div>
                  </div>

                  {/* Title Block Box Mockup at Bottom (Responsive Light Mode Table) */}
                  <div className="relative z-10 w-full bg-white/95 border-2 border-slate-400 rounded-xl p-1.5 sm:p-2 text-[9px] sm:text-[10px] shadow-sm text-slate-800 font-mono mt-2 sm:mt-0">
                    <div className="grid grid-cols-12 gap-1 text-center">
                      
                      {/* DWG NO */}
                      <div className={`col-span-4 p-1 sm:p-1.5 rounded border ${heroViewMode === 'audit' ? 'bg-rose-50 border border-rose-500 text-rose-700 animate-pulse font-extrabold' : 'bg-slate-50 border-slate-300'}`}>
                        <div className="text-[6.5px] sm:text-[7.5px] text-slate-500 font-bold truncate">DWG NO.</div>
                        <div className="text-[8px] sm:text-[10px] truncate">{heroViewMode === 'audit' ? '⚠️ MISSING' : '-----------'}</div>
                      </div>

                      {/* REVISION */}
                      <div className="col-span-2 p-1 sm:p-1.5 rounded border border-slate-300 bg-slate-50">
                        <div className="text-[6.5px] sm:text-[7.5px] text-slate-500 font-bold truncate">REV</div>
                        <div className="text-[8px] sm:text-[10px] font-extrabold text-blue-700 truncate">Rev C</div>
                      </div>

                      {/* DRAWN SIG */}
                      <div className={`col-span-3 p-1 sm:p-1.5 rounded border ${heroViewMode === 'audit' ? 'bg-rose-50 border border-rose-500 text-rose-700 animate-pulse font-extrabold' : 'bg-slate-50 border-slate-300'}`}>
                        <div className="text-[6.5px] sm:text-[7.5px] text-slate-500 font-bold truncate">DRAWN SIG</div>
                        <div className="text-[8px] sm:text-[10px] truncate">{heroViewMode === 'audit' ? '⚠️ REQUIRED' : '-----------'}</div>
                      </div>

                      {/* CHK'D */}
                      <div className="col-span-3 p-1 sm:p-1.5 rounded border border-emerald-300 bg-emerald-50 font-extrabold text-emerald-800">
                        <div className="text-[6.5px] sm:text-[7.5px] text-emerald-600 font-bold truncate">CHK'D</div>
                        <div className="text-[8px] sm:text-[10px] truncate">✔ Signed</div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Card Footer Live Stats */}
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 text-[10.5px] sm:text-xs font-semibold text-slate-600 px-1">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Inspection Engine Speed: <strong>1.4s</strong></span>
                  </div>
                  <div className="text-slate-500">Confidence Score: <strong className="text-emerald-600">98.6%</strong></div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* ENGINEERING STANDARDS & FORMAT TICKER BAR */}
        {/* ---------------------------------------------------- */}
        <section id="standards" className="border-y border-slate-200/80 bg-white/80 backdrop-blur-md py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                Universal Support for Engineering Standards & CAD File Exports
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-center justify-center">
              
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col items-center gap-1.5 hover:border-blue-300 hover:bg-blue-50/40 transition">
                <FileCode className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-extrabold text-slate-800">ISO 7200</span>
                <span className="text-[10px] text-slate-500 font-medium">Title Block Specs</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col items-center gap-1.5 hover:border-blue-300 hover:bg-blue-50/40 transition">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-extrabold text-slate-800">ANSI Y14.1</span>
                <span className="text-[10px] text-slate-500 font-medium">Drawing Sheet Sizes</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col items-center gap-1.5 hover:border-blue-300 hover:bg-blue-50/40 transition">
                <CheckSquare className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-extrabold text-slate-800">DIN 6771</span>
                <span className="text-[10px] text-slate-500 font-medium">Technical Border Standard</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col items-center gap-1.5 hover:border-blue-300 hover:bg-blue-50/40 transition">
                <Layers className="w-5 h-5 text-cyan-600" />
                <span className="text-xs font-extrabold text-slate-800">Vector PDF</span>
                <span className="text-[10px] text-slate-500 font-medium">Born-Digital Prints</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col items-center gap-1.5 hover:border-blue-300 hover:bg-blue-50/40 transition">
                <Cpu className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-extrabold text-slate-800">DXF / DWF CAD</span>
                <span className="text-[10px] text-slate-500 font-medium">AutoCAD & SolidWorks</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col items-center gap-1.5 hover:border-blue-300 hover:bg-blue-50/40 transition">
                <ShieldCheck className="w-5 h-5 text-rose-600" />
                <span className="text-xs font-extrabold text-slate-800">AS9100 QA</span>
                <span className="text-[10px] text-slate-500 font-medium">Aerospace Compliance</span>
              </div>

            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* INTERACTIVE LIVE DEMO PLAYGROUND SECTION */}
        {/* ---------------------------------------------------- */}
        <section id="live-demo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-extrabold border border-indigo-100">
              <Eye className="w-3.5 h-3.5" />
              <span>Interactive Inspection Playground</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Test DraftGuard CAD Inspection Live
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Click between sample engineering drawings below to see how DraftGuard automatically isolates incomplete fields, unverified signatures, and material specifications.
            </p>
          </div>

          {/* Sample Drawing Tab Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {samples.map((sample, idx) => (
              <button
                key={sample.id}
                onClick={() => { setActiveSampleIndex(idx); setSelectedDemoField(null); }}
                className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2.5 cursor-pointer shadow-sm border ${
                  activeSampleIndex === idx 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <span>{sample.title.split(':')[0]}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  sample.status === 'complete' 
                    ? (activeSampleIndex === idx ? 'bg-emerald-400 text-slate-950 font-black' : 'bg-emerald-100 text-emerald-800')
                    : (activeSampleIndex === idx ? 'bg-rose-400 text-slate-950 font-black' : 'bg-rose-100 text-rose-800')
                }`}>
                  {sample.completeness}%
                </span>
              </button>
            ))}
          </div>

          {/* Interactive Playground Main Container */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Interactive Title Block Grid Preview */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>{currentSample.title}</span>
                </div>
                <span className="text-slate-400 text-[11px] font-medium">{currentSample.subtitle}</span>
              </div>

              {/* Title Block Interactive Cell Grid */}
              <div className="space-y-3">
                <p className="text-[11px] text-slate-500 font-semibold font-sans">
                  💡 Click on any field cell below to inspect audit details:
                </p>

                <div className="grid grid-cols-12 gap-2 text-xs">
                  {currentSample.fields.map((field, fIdx) => {
                    const isSelected = selectedDemoField?.name === field.name;
                    const isIncomplete = field.status === 'incomplete';
                    return (
                      <div
                        key={fIdx}
                        onClick={() => setSelectedDemoField(field)}
                        className={`col-span-6 sm:col-span-4 p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isIncomplete 
                            ? 'bg-rose-50/90 border-rose-300 text-rose-900 hover:bg-rose-100 hover:border-rose-400' 
                            : 'bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:bg-blue-50/30'
                        } ${isSelected ? 'ring-2 ring-blue-600 shadow-md font-bold' : ''}`}
                      >
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                          <span>{field.name}</span>
                          {isIncomplete ? (
                            <span className="text-rose-600 font-black text-[8px] uppercase">⚠️ MISSING</span>
                          ) : (
                            <span className="text-emerald-600 font-black text-[8px]">✓ OK</span>
                          )}
                        </div>
                        <div className="mt-1.5 text-[11px] font-extrabold truncate">
                          {field.value ? field.value : <span className="text-rose-600 italic">[NOT FILLED]</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Field Inspector Banner (Light Mode) */}
              {selectedDemoField && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200/90 text-slate-800 rounded-xl text-xs animate-fade-in flex items-start gap-3 shadow-sm">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-extrabold text-blue-900">
                      Field Inspector: {selectedDemoField.name} ({selectedDemoField.criticality.toUpperCase()} CRITICALITY)
                    </div>
                    <div className="text-slate-700 mt-1 font-medium">{selectedDemoField.note}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Audit Summary & Recommendations */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Completeness Score Card (Light Mode) */}
              <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-md space-y-4 text-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Completeness Score</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    currentSample.status === 'complete' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {currentSample.status === 'complete' ? 'PASSED QA' : 'ACTION REQUIRED'}
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900">{currentSample.completeness}%</span>
                  <span className="text-xs text-slate-500 font-semibold">({currentSample.filledFields} of {currentSample.totalFields} fields verified)</span>
                </div>

                {/* Progress Meter Bar */}
                <div className="w-full h-3 bg-slate-100 border border-slate-200 rounded-full overflow-hidden p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      currentSample.completeness === 100 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                        : 'bg-gradient-to-r from-rose-500 via-amber-500 to-blue-600'
                    }`}
                    style={{ width: `${currentSample.completeness}%` }}
                  ></div>
                </div>
              </div>

              {/* Actionable Recommendations Checklist */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span>Automated Quality Checklist</span>
                </h3>

                <div className="space-y-2">
                  {currentSample.recommendations.map((rec, rIdx) => (
                    <div key={rIdx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 flex items-start gap-2.5">
                      {currentSample.status === 'complete' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      )}
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => onOpenAuth('register')}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-xs shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Upload Your Own PDF Drawings To Inspect</span>
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>

          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* ADVANCED CAPABILITIES & FEATURES GRID */}
        {/* ---------------------------------------------------- */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/80 relative">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-extrabold border border-blue-100">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Core Platform Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Advanced Drafting Quality Control Capabilities
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Purpose-built tools for engineering managers, quality inspectors, and CAD designers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Title Block Metadata Auditing
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Automatically extracts and validates drawing numbers, titles, revision letters, scale ratios, sheet sizes, and tolerance specifications across ISO/ANSI frames.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-extrabold text-blue-600 flex items-center gap-1">
                <span>Auto-Flags Blank Cells</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Sign-Off & Signature Verification
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Detects missing technician signatures in DRAWN, CHECKED, APPROVED, MFG, and QA sign-off blocks to enforce strict engineering governance before release.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-extrabold text-indigo-600 flex items-center gap-1">
                <span>Multi-Role Signatures</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100 group-hover:scale-110 transition-transform">
                  <Settings2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">
                  2D CAD Ratio & Scale Comparator
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Compares 2D PDF prints directly against DXF/DWF source models, measures geometry ratios, and alerts when print scales deviate from actual dimensions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-extrabold text-purple-600 flex items-center gap-1">
                <span>Scale Discrepancy Alerts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Custom Title Block Template Builder
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Configure custom title block bounding boxes for proprietary company templates, mapping unique field keys to your internal engineering schema.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-extrabold text-emerald-600 flex items-center gap-1">
                <span>Enterprise Template Engine</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-cyan-300 transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center border border-cyan-100 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-cyan-600 transition-colors">
                  ISO 9001 Compliance Package Export
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Generate standardized audit logs in JSON and PDF format, ready for quality compliance filing, ECO records, or direct integration with PLM software.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-extrabold text-cyan-600 flex items-center gap-1">
                <span>Instant JSON & PDF Reports</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-rose-300 transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100 group-hover:scale-110 transition-transform">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors">
                  100% Encrypted Local Security
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Runs entirely within your local environment or private cloud. Sensitive defense, aerospace, or industrial designs remain strictly confidential.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-extrabold text-rose-600 flex items-center gap-1">
                <span>Zero Cloud Leak Risk</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* WORKFLOW / HOW IT WORKS SECTION */}
        {/* ---------------------------------------------------- */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/80 relative">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-extrabold border border-purple-100">
              <Layers className="w-3.5 h-3.5" />
              <span>Simple 4-Step Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Automated Drawing QA Workflow
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              From raw PDF upload to ISO-compliant ECO release in less than two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                01
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Upload Drawings</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Drag-and-drop vector PDFs, scanned engineering prints, or DXF CAD exports into the analyzer.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
                02
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Run AI Analysis</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Vector grid extraction isolates title blocks, compares text intersections, and verifies signatures.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-purple-500/20">
                03
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Inspect Discrepancies</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Review highlighted red warning boxes on the interactive canvas and inspect missing field callouts.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-emerald-500/20">
                04
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Export Report</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Download structured JSON compliance reports to attach to PLM pre-release quality records.
              </p>
            </div>

          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* METRICS, IMPACT & COMPARISON SECTION (Light Mode) */}
        {/* ---------------------------------------------------- */}
        <section id="stats" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/80 relative">
          <div className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 text-slate-900 border border-slate-200/90 rounded-3xl p-8 sm:p-14 shadow-xl space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Proven Engineering Productivity & Quality Impact
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Drastically reduce engineering change order rework and eliminate manufacturing delays caused by missing title block specs.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
              <div className="space-y-2 pt-4 md:pt-0">
                <div className="text-4xl sm:text-5xl font-black text-blue-600">99.4%</div>
                <div className="text-xs font-extrabold text-slate-800">Field Detection Accuracy</div>
                <div className="text-[10px] text-slate-500 font-medium">Title block metadata & signatures</div>
              </div>

              <div className="space-y-2 pt-4 md:pt-0">
                <div className="text-4xl sm:text-5xl font-black text-emerald-600">&lt; 1.8s</div>
                <div className="text-xs font-extrabold text-slate-800">Sheet Parsing Speed</div>
                <div className="text-[10px] text-slate-500 font-medium">Instant vector grid parsing</div>
              </div>

              <div className="space-y-2 pt-4 md:pt-0">
                <div className="text-4xl sm:text-5xl font-black text-indigo-600">85%</div>
                <div className="text-xs font-extrabold text-slate-800">ECO Delay Reduction</div>
                <div className="text-[10px] text-slate-500 font-medium">Fewer drawing rejection loops</div>
              </div>

              <div className="space-y-2 pt-4 md:pt-0">
                <div className="text-4xl sm:text-5xl font-black text-purple-600">100%</div>
                <div className="text-xs font-extrabold text-slate-800">Local Security</div>
                <div className="text-[10px] text-slate-500 font-medium">Zero cloud upload risks</div>
              </div>
            </div>

            {/* Comparison Table Card */}
            <div className="bg-white/80 border border-slate-200/90 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center shadow-sm">
              <div className="p-5 bg-rose-50/80 border border-rose-200 text-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-extrabold text-sm">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Traditional Manual QA Review</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">❌ 15–30 minutes per drawing sheet</li>
                  <li className="flex items-center gap-2">❌ High human fatigue & missed signatures</li>
                  <li className="flex items-center gap-2">❌ Expensive shop floor manufacturing halts</li>
                </ul>
              </div>

              <div className="p-5 bg-emerald-50/80 border border-emerald-200 text-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>DraftGuard Automated Engine</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">✓ Instant multi-sheet analysis in &lt; 2 seconds</li>
                  <li className="flex items-center gap-2">✓ 100% sign-off & material completeness check</li>
                  <li className="flex items-center gap-2">✓ Direct ISO compliance export for PLM release</li>
                </ul>
              </div>
            </div>

          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* TARGET INDUSTRIES SECTION */}
        {/* ---------------------------------------------------- */}
        <section id="use-cases" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/80 relative">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-extrabold border border-emerald-100">
              <Building2 className="w-3.5 h-3.5" />
              <span>Built for High-Precision Engineering</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tailored for Critical Manufacturing Workflows
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Supporting quality compliance across demanding engineering sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-lg transition space-y-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Plane className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Aerospace & Defense</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                AS9100 material traceability checks and strict multi-stage sign-off audit trails for flight components.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-lg transition space-y-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Automotive & Powertrain</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                High-throughput ECO drawing updates and multi-sheet assembly title block checks across Tier-1 suppliers.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-lg transition space-y-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <Factory className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Industrial Machinery</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                ISO 7200 border validation, dimensional tolerance callouts, and heavy gear casing specifications.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-lg transition space-y-3">
              <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Precision Tooling</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Title block verification for CNC machining contracts, surface finish specs, and sheet scale validation.
              </p>
            </div>

          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* FREQUENTLY ASKED QUESTIONS (FAQ) SECTION */}
        {/* ---------------------------------------------------- */}
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/80 relative">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Everything you need to know about DraftGuard technical drawing auditing.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full px-6 py-5 text-left font-extrabold text-sm sm:text-base text-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* FINAL CONVERSION CALL TO ACTION BANNER */}
        {/* ---------------------------------------------------- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 sm:p-14 text-white text-center shadow-2xl relative overflow-hidden space-y-6">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Ready to Secure Your Engineering Drawing Quality?
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
                Join engineering teams accelerating drawing approvals and eliminating ECO errors with DraftGuard.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-blue-900 hover:bg-blue-50 font-black text-sm rounded-2xl shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Get Started Free</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="w-full sm:w-auto px-6 py-4 bg-blue-700/80 hover:bg-blue-800 text-white border border-blue-400/40 font-extrabold text-sm rounded-2xl transition cursor-pointer"
                >
                  Sign In to Account
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200/80 text-center bg-white/60 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="w-5 h-5 object-contain" alt="" />
            <span className="font-extrabold text-slate-800">DraftGuard Systems</span>
            <span>© {new Date().getFullYear()} — All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#live-demo" onClick={(e) => handleScrollToSection(e, 'live-demo')} className="hover:text-blue-600 transition">Interactive Demo</a>
            <a href="#features" onClick={(e) => handleScrollToSection(e, 'features')} className="hover:text-blue-600 transition">Features</a>
            <a href="#standards" onClick={(e) => handleScrollToSection(e, 'standards')} className="hover:text-blue-600 transition">Standards</a>
            <a href="#faq" onClick={(e) => handleScrollToSection(e, 'faq')} className="hover:text-blue-600 transition">FAQ</a>
          </div>
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md">
            
            {/* Close button */}
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Login/Register Card Container */}
            <div className="auth-card-container">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100/50">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  {authMode === 'login' ? 'Sign in to access drawing QA tools' : 'Register to start analyzing technical drawings'}
                </p>
              </div>

              {authError && (
                <div className="mb-6 p-4 bg-red-50/70 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-5 animate-fade-in">
                <div>
                  <label htmlFor="auth-username" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                  <input 
                    id="auth-username"
                    name="username"
                    type="text" 
                    required
                    placeholder="Enter your username"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium shadow-inner"
                  />
                </div>

                <div>
                  <label htmlFor="auth-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                  <input 
                    id="auth-password"
                    name="password"
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium shadow-inner"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={authLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:bg-blue-400 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {authLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    authMode === 'login' ? 'Sign In' : 'Sign Up'
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <button 
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError('');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold transition-all"
                >
                  {authMode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
