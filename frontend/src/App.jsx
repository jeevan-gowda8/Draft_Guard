import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  FileText, 
  Download, 
  Settings, 
  Menu, 
  X, 
  Server, 
  RefreshCw, 
  Info,
  HelpCircle,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  Settings2,
  Sun,
  Moon
} from 'lucide-react';
import Compare2DView from './Compare2DView';

export default function App() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [useRealApi, setUseRealApi] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // Authentication states
  const [token, setToken] = useState(localStorage.getItem('draftguard_token') || null);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Settings
  const [vectorGrid, setVectorGrid] = useState(true);
  const [textIntersection, setTextIntersection] = useState(true);
  const [ocrValidation, setOcrValidation] = useState(false);
  const [aiCrosscheck, setAiCrosscheck] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('ATS-A3-Standard');
  const [templates, setTemplates] = useState(['ATS-A3-Standard']);

  const fileInputRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Check API health on load
  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${apiUrl}/health`);
      if (response.ok) {
        setApiOnline(true);
        setUseRealApi(true); // Automatically switch to API mode if online
      } else {
        setApiOnline(false);
        setUseRealApi(false);
      }
    } catch (error) {
      setApiOnline(false);
      setUseRealApi(false);
    }
  };

  const fetchUser = async (tokenVal) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${tokenVal}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('draftguard_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      localStorage.removeItem('draftguard_token');
      setToken(null);
      setUser(null);
    }
  };

  const fetchTemplates = async () => {
    if (!token) return;
    try {
      const tRes = await fetch(`${apiUrl}/api/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (tRes.ok) {
        const tData = await tRes.json();
        if (tData.templates && tData.templates.length > 0) {
          setTemplates(tData.templates);
          setSelectedTemplate(tData.templates[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to load templates from API:', err);
    }
  };

  useEffect(() => {
    checkApiHealth();
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser(token);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: authUsername,
          password: authPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      localStorage.setItem('draftguard_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      setAuthUsername('');
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('draftguard_token');
    setToken(null);
    setUser(null);
    setResults(null);
    setFile(null);
  };

  const mockAnalyzeFile = async (file) => {
    setAnalyzing(true);
    setErrorMessage('');
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    const page1Fields = [
      { name: 'DWG NO.', status: 'incomplete', criticality: 'critical', value: null },
      { name: 'TITLE', status: 'incomplete', criticality: 'critical', value: null },
      { name: 'DRAWN - NAME', status: 'incomplete', criticality: 'high', value: null },
      { name: 'DRAWN - SIGNATURE', status: 'incomplete', criticality: 'high', value: null },
      { name: 'DRAWN - DATE', status: 'incomplete', criticality: 'high', value: null },
      { name: 'CHK\'D - NAME', status: 'incomplete', criticality: 'high', value: null },
      { name: 'CHK\'D - SIGNATURE', status: 'incomplete', criticality: 'high', value: null },
      { name: 'CHK\'D - DATE', status: 'incomplete', criticality: 'high', value: null },
      { name: 'APPV\'D - NAME', status: 'incomplete', criticality: 'medium', value: null },
      { name: 'APPV\'D - SIGNATURE', status: 'incomplete', criticality: 'medium', value: null },
      { name: 'APPV\'D - DATE', status: 'incomplete', criticality: 'medium', value: null },
      { name: 'MFG - NAME', status: 'incomplete', criticality: 'low', value: null },
      { name: 'MFG - SIGNATURE', status: 'incomplete', criticality: 'low', value: null },
      { name: 'MFG - DATE', status: 'incomplete', criticality: 'low', value: null },
      { name: 'Q.A - NAME', status: 'incomplete', criticality: 'low', value: null },
      { name: 'Q.A - SIGNATURE', status: 'incomplete', criticality: 'low', value: null },
      { name: 'Q.A - DATE', status: 'incomplete', criticality: 'low', value: null },
      { name: 'MATERIAL', status: 'incomplete', criticality: 'critical', value: null },
      { name: 'FINISH', status: 'incomplete', criticality: 'high', value: null },
      { name: 'WEIGHT', status: 'incomplete', criticality: 'medium', value: null },
      { name: 'REVISION', status: 'incomplete', criticality: 'medium', value: null },
      { name: 'UNLESS OTHERWISE SPECIFIED', status: 'incomplete', criticality: 'low', value: null }
    ];

    const page2Fields = [
      { name: 'DWG NO.', status: 'incomplete', criticality: 'critical', value: null },
      { name: 'TITLE', status: 'incomplete', criticality: 'critical', value: null },
      { name: 'DRAWN - NAME', status: 'incomplete', criticality: 'high', value: null },
      { name: 'DRAWN - SIGNATURE', status: 'incomplete', criticality: 'high', value: null },
      { name: 'DRAWN - DATE', status: 'incomplete', criticality: 'high', value: null },
      { name: 'CHK\'D - NAME', status: 'incomplete', criticality: 'high', value: null },
      { name: 'CHK\'D - SIGNATURE', status: 'incomplete', criticality: 'high', value: null },
      { name: 'CHK\'D - DATE', status: 'incomplete', criticality: 'high', value: null },
      { name: 'APPV\'D - NAME', status: 'incomplete', criticality: 'medium', value: null },
      { name: 'APPV\'D - SIGNATURE', status: 'incomplete', criticality: 'medium', value: null },
      { name: 'APPV\'D - DATE', status: 'incomplete', criticality: 'medium', value: null },
      { name: 'MFG - NAME', status: 'incomplete', criticality: 'low', value: null },
      { name: 'MFG - SIGNATURE', status: 'incomplete', criticality: 'low', value: null },
      { name: 'MFG - DATE', status: 'incomplete', criticality: 'low', value: null },
      { name: 'Q.A - NAME', status: 'incomplete', criticality: 'low', value: null },
      { name: 'Q.A - SIGNATURE', status: 'incomplete', criticality: 'low', value: null },
      { name: 'Q.A - DATE', status: 'incomplete', criticality: 'low', value: null },
      { name: 'MATERIAL', status: 'incomplete', criticality: 'critical', value: null },
      { name: 'FINISH', status: 'incomplete', criticality: 'high', value: null },
      { name: 'WEIGHT', status: 'incomplete', criticality: 'medium', value: null },
      { name: 'REVISION', status: 'incomplete', criticality: 'medium', value: null },
      { name: 'UNLESS OTHERWISE SPECIFIED', status: 'incomplete', criticality: 'low', value: null }
    ];

    const mockResults = {
      fileName: file.name,
      completeness: 65,
      status: 'incomplete',
      timestamp: new Date().toLocaleString(),
      titleBlock: {
        totalFields: 44,
        filledFields: 29,
        incompleteFields: 15,
        criticalFields: ['TITLE', 'DRAWN - SIGNATURE', 'MATERIAL', 'FINISH', 'UNLESS OTHERWISE SPECIFIED', 'DWG NO.', 'CHK\'D - SIGNATURE', 'APPV\'D - SIGNATURE']
      },
      detectionMethod: 'Vector Geometry + Text Intersection Analysis',
      confidenceScore: 94.2,
      fields: page1Fields,
      pages: [
        {
          pageIndex: 0,
          pageName: 'Page 1: Front Cover Plate',
          completeness: 45,
          status: 'incomplete',
          titleBlock: {
            totalFields: 22,
            filledFields: 10,
            incompleteFields: 12,
            criticalFields: ['TITLE', 'DRAWN - SIGNATURE', 'MATERIAL', 'FINISH', 'UNLESS OTHERWISE SPECIFIED']
          },
          recommendations: [
            'Fill in TITLE - Critical drawing metadata required',
            'Obtain DRAWN technician signature',
            'Add MATERIAL specification - Required for manufacturing',
            'Add FINISH specification - High priority surface finishes',
            'Fill in UNLESS OTHERWISE SPECIFIED tolerances'
          ],
          fields: page1Fields
        },
        {
          pageIndex: 1,
          pageName: 'Page 2: Flange Adapter',
          completeness: 86,
          status: 'incomplete',
          titleBlock: {
            totalFields: 22,
            filledFields: 19,
            incompleteFields: 3,
            criticalFields: ['DWG NO.', 'CHK\'D - SIGNATURE', 'APPV\'D - SIGNATURE']
          },
          recommendations: [
            'Fill in DWG NO. - Critical field required for document identification',
            'Obtain CHK\'D technician signature',
            'Obtain APPV\'D manager signature'
          ],
          fields: page2Fields
        }
      ],
      detectionDetails: {
        vectorGridExtraction: vectorGrid,
        cellReconstruction: 'successful',
        textIntersectionAnalysis: textIntersection,
        ocrValidation: ocrValidation,
        aiCrosscheck: aiCrosscheck
      },
      recommendations: [
        'Page 1: Fill in TITLE - Critical drawing metadata required',
        'Page 1: Obtain DRAWN technician signature',
        'Page 1: Add MATERIAL specification - Required for manufacturing',
        'Page 1: Add FINISH specification - High priority surface finishes',
        'Page 1: Fill in UNLESS OTHERWISE SPECIFIED tolerances',
        'Page 2: Fill in DWG NO. - Critical field required for document identification',
        'Page 2: Obtain CHK\'D technician signature',
        'Page 2: Obtain APPV\'D manager signature'
      ]
    };

    setResults(mockResults);
    setCurrentPageIndex(0);
    setActiveTab('visualizer');
    setAnalyzing(false);
  };

  const realAnalyzeFile = async (file) => {
    setAnalyzing(true);
    setErrorMessage('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `API responded with status code ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      setActiveTab('visualizer');
    } catch (err) {
      console.error('API Error:', err);
      setErrorMessage(err.message || 'Failed to connect to the backend analysis server.');
      // Auto fallback to mock so they can still see it work
      setErrorMessage(prev => prev + ' Falling back to simulated demo analysis.');
      setTimeout(() => {
        mockAnalyzeFile(file);
      }, 1000);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      if (useRealApi) {
        realAnalyzeFile(uploadedFile);
      } else {
        mockAnalyzeFile(uploadedFile);
      }
    }
  };

  const triggerAnalyzeAgain = () => {
    if (file) {
      if (useRealApi) {
        realAnalyzeFile(file);
      } else {
        mockAnalyzeFile(file);
      }
    }
  };

  const downloadReport = () => {
    if (!results) return;
    const jsonReport = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonReport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `completeness-report-${results.fileName.replace('.pdf', '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCriticalityColor = (crit) => {
    switch (crit?.toLowerCase()) {
      case 'critical':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'high':
        return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'medium':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };
  const hasPages = results && results.pages && results.pages.length > 0;
  const activeCompleteness = hasPages ? results.pages[currentPageIndex].completeness : (results ? results.completeness : 0);
  const activeStatus = hasPages ? results.pages[currentPageIndex].status : (results ? results.status : 'incomplete');
  const activeTitleBlock = hasPages ? results.pages[currentPageIndex].titleBlock : (results ? results.titleBlock : { totalFields: 0, filledFields: 0, incompleteFields: 0 });
  const activeFields = hasPages ? results.pages[currentPageIndex].fields : (results ? results.fields : []);
  const activeRecommendations = hasPages ? results.pages[currentPageIndex].recommendations : (results ? results.recommendations : []);

  const handleScrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!user) {
    return (
      <div className="auth-page-wrapper select-none bg-slate-50 relative overflow-hidden">
        
        {/* Smooth Animated Background Glow Orbs */}
        <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] rounded-full bg-blue-400/15 blur-[140px] pointer-events-none animate-ambient-glow-1" />
        <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/15 blur-[150px] pointer-events-none animate-ambient-glow-2" />

        {/* Animated High-Tech CAD Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-multiply animate-bg-image z-0"
          style={{ backgroundImage: `url('/landing_hero_bg.png')` }}
        />

        {/* Header / Navbar */}
        <header className="fixed top-0 left-0 right-0 z-40 px-8 py-5 flex items-center justify-between border-b border-slate-200/40 bg-white/30 backdrop-blur-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white rounded-xl shadow-md border border-slate-100 flex items-center justify-center">
              <img src="/logo.png" className="w-8 h-8 object-contain" alt="DraftGuard Logo" />
            </div>
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
                DraftGuard
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">Engineering Document QA Suite</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 mr-2">
              <a href="#features" onClick={(e) => handleScrollToSection(e, 'features')} className="hover:text-slate-900 transition">Features</a>
              <a href="#how-it-works" onClick={(e) => handleScrollToSection(e, 'how-it-works')} className="hover:text-slate-900 transition">Workflow</a>
              <a href="#stats" onClick={(e) => handleScrollToSection(e, 'stats')} className="hover:text-slate-900 transition">Metrics</a>
            </div>
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); setShowAuthModal(true); }}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(''); setShowAuthModal(true); }}
              className="hidden sm:inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </header>

        {/* Landing Page Content */}
        <div className="flex-1 pt-[89px]">
          {/* Hero Section */}
          <section className="max-w-6xl mx-auto px-6 pt-16 lg:pt-24 pb-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-28 items-center">
              
              {/* Left Column: Floating Blueprint Card Graphic */}
              <div className="lg:col-span-7 order-2 lg:order-1 select-none w-full animate-float-hero">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl relative">
                  <div className="aspect-[1.5] bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between font-mono">
                    <div className="w-full h-full border border-slate-300 rounded p-6 relative flex flex-col justify-between">
                      {/* Schematic Geometry */}
                      <div className="flex-1 flex items-center justify-center relative">
                        <div className="w-64 h-24 border-2 border-slate-700 rounded-lg flex items-center justify-center bg-white">
                          <div className="w-14 h-14 rounded-full border border-slate-400 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="absolute bottom-3 left-3 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[10px] font-bold text-left">
                        ⚠️ Missing DWG NO.
                      </div>
                      <div className="absolute bottom-3 right-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold text-left">
                        ✓ ISO Compliant
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero copy and CTAs */}
              <div className="lg:col-span-5 order-1 lg:order-2 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-6 border border-blue-100">
                  <span>✨</span> Automated Drafting QA Engine
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Verify Technical Drawing Completeness Instantly
                </h1>
                <p className="text-sm sm:text-base text-slate-500 font-medium mt-6 leading-relaxed">
                  DraftGuard parses title block metadata, compares PDF 2D prints against DXF/DWF CAD models, measures geometric ratios, and flags missing fields.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <button
                    onClick={() => { setAuthMode('register'); setAuthError(''); setShowAuthModal(true); }}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    Start Analyzing Drawings
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <a
                    href="#features"
                    onClick={(e) => handleScrollToSection(e, 'features')}
                    className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm rounded-2xl transition cursor-pointer flex items-center justify-center"
                  >
                    Explore Features
                  </a>
                </div>
              </div>

            </div>
          </section>

          {/* Updated Features Grid */}
          <section id="features" className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-200/60 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Advanced Drafting Verification Features
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Comprehensive quality inspection suite for engineering production prints and CAD source files.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1: 2D Design Ratio Comparator */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 text-left hover:border-blue-300 hover:shadow-md transition">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">2D Design Ratio Comparator</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Compares 2D PDF drawings against DXF/DWF CAD models, measures geometric features, and verifies scale ratio fidelity with instant discrepancy alerts.
                </p>
              </div>

              {/* Feature 2: Title Block Auditing */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 text-left hover:border-blue-300 hover:shadow-md transition">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Title Block Completeness</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Automatically parses title block metadata like revisions, drawing numbers, materials, scales, signatures, dates, and sheet sizes.
                </p>
              </div>

              {/* Feature 3: Interactive Canvas & Ruler */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 text-left hover:border-blue-300 hover:shadow-md transition">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
                  <Settings2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Interactive Canvas & Point Ruler</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Renders side-by-side or overlaid 2D designs in high-DPI Light Mode with point-to-point live measurement tools.
                </p>
              </div>

              {/* Feature 4: Local Security & Storage */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 text-left hover:border-blue-300 hover:shadow-md transition">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Encrypted Local Security</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Stores accounts and drawing audit stats securely in a local database file, guaranteeing enterprise privacy and data isolation.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works Workflow */}
          <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-200/60 text-center relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-12">
              Three-Step Quality Checklist
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-4xl mx-auto">
              <div className="flex-1 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center text-lg font-bold">1</div>
                <h3 className="text-sm font-bold text-slate-800">Upload PDF</h3>
                <p className="text-xs text-slate-400 font-medium">Drag-and-drop your born-digital or scanned engineering sheet.</p>
              </div>
              <div className="hidden md:block text-slate-300">→</div>
              <div className="flex-1 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center text-lg font-bold">2</div>
                <h3 className="text-sm font-bold text-slate-800">Run Engine Analysis</h3>
                <p className="text-xs text-slate-400 font-medium">Auto-crosscheck cells, dates, signatures, and ISO borders.</p>
              </div>
              <div className="hidden md:block text-slate-300">→</div>
              <div className="flex-1 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center text-lg font-bold">3</div>
                <h3 className="text-sm font-bold text-slate-800">Download Reports</h3>
                <p className="text-xs text-slate-400 font-medium">Export standardized JSON compliance reports instantly.</p>
              </div>
            </div>
          </section>

          {/* Stats section */}
          <section id="stats" className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-200/60 text-center relative z-10 mb-12 animate-fade-in">
            <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-8">Ready to secure your drafting pipelines?</h2>
              <button
                onClick={() => { setAuthMode('register'); setAuthError(''); setShowAuthModal(true); }}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
              >
                Get Started Free
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="py-6 border-t border-slate-200/50 text-center bg-white/30 backdrop-blur-md z-10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            DraftGuard Systems © {new Date().getFullYear()} — Secure Drafting Quality Assurance
          </p>
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
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-4"
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

  return (
    <div className="app-container selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Header navbar */}
      <header className="header-bar">
        <div className="header-content">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white rounded-xl shadow-md shadow-blue-100 border border-slate-100 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" className="w-9 h-9 object-contain" alt="DraftGuard Logo" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
                DraftGuard
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden md:block">Engineering Document QA Suite</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mode Switcher */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setUseRealApi(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  !useRealApi 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Simulated Demo
              </button>
              <button
                onClick={() => {
                  if (apiOnline) {
                    setUseRealApi(true);
                  } else {
                    alert("Backend server (localhost:8000) appears offline. Start it to use live analysis!");
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  useRealApi 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                Live API
              </button>
            </div>

            {/* Health Badge */}
            <div className="flex items-center gap-2">
              <button 
                onClick={checkApiHealth} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
                title="Refresh connection status"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                apiOnline 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                <span className="hidden sm:inline">{apiOnline ? 'Backend Online' : 'Backend Offline'}</span>
              </div>
            </div>

            {user && (
              <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 shadow-sm uppercase">
                  {user.username.substring(0, 2)}
                </div>
                <div className="hidden md:flex flex-col text-left font-sans">
                  <span className="text-xs font-bold text-slate-800 leading-none">{user.username}</span>
                  <span className="text-[9px] font-medium text-slate-400 capitalize">{user.role}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Layout */}
      <div className="main-layout">
        
        {/* Sidebar */}
        <aside className={`sidebar-aside ${sidebarOpen ? 'open' : 'closed'}`}>
          
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Navigation</h2>
            <nav className="space-y-1">
              {[
                { id: 'compare2d', label: '2D Design Ratio' },
                { id: 'overview', label: 'Overview Metrics' },
                { id: 'details', label: 'Field Details' },
                { id: 'settings', label: 'Parameters & Rules' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { 
                    setActiveTab(tab.id); 
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-between ${
                    activeTab === tab.id
                      ? 'bg-blue-50/80 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? 'rotate-90 text-blue-500' : 'text-slate-400'}`} />
                </button>
              ))}
            </nav>
          </div>

          {results && (
            <div className="pt-6 border-t border-slate-200 space-y-6">
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Document Info</h2>
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                    <p className="text-slate-400 mb-1">Target Filename</p>
                    <p className="font-semibold text-slate-800 truncate" title={results.fileName}>{results.fileName}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                    <p className="text-slate-400 mb-1">Processing Mode</p>
                    <p className="font-semibold text-slate-800">{results.pdfType ? results.pdfType.toUpperCase() : 'VECTOR'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                    <p className="text-slate-400 mb-1">Method Applied</p>
                    <p className="font-semibold text-slate-800 text-[10px] leading-relaxed">{results.detectionMethod}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                    <p className="text-slate-400 mb-2">Confidence Level</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all" 
                          style={{ width: `${results.confidenceScore}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-800">{results.confidenceScore}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">2D Layout Simulator</h2>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3">
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Interactive drawing sheet layout. Red cells indicate missing/incomplete fillings.
                  </p>
                  
                  {/* 2D sheet preview */}
                  <div className="border border-slate-300 bg-white rounded-lg p-2 shadow-sm relative aspect-[1.5] flex flex-col justify-end bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:8px_8px]">
                    {/* Border lines */}
                    <div className="absolute inset-1.5 border border-slate-400 pointer-events-none"></div>
                    
                    {/* Drawing sheet content outline */}
                    <div className="absolute inset-4 border border-dashed border-slate-300 flex items-center justify-center pointer-events-none">
                      <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">2D Engineering Sheet</span>
                    </div>

                    {/* Title Block Grid */}
                    <div className="absolute bottom-2.5 right-2.5 w-36 bg-white border border-slate-400 p-0.5 shadow flex flex-col z-10 pointer-events-auto">
                      <div className="text-[5px] font-bold text-slate-500 bg-slate-50 border-b border-slate-300 px-1 py-0.5 text-center truncate">
                        {results.fileName.substring(0, 15)} - P{currentPageIndex + 1}
                      </div>
                      <div className="grid grid-cols-4 gap-0.5 p-0.5 bg-slate-100">
                        {activeFields.map((field, idx) => {
                          const isInc = field.status === 'incomplete';
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setActiveTab('details');
                              }}
                              className={`h-3.5 text-[5px] font-bold flex items-center justify-center border rounded-sm transition-all cursor-pointer ${
                                isInc 
                                  ? 'bg-red-500 border-red-700 text-white animate-pulse hover:bg-red-600' 
                                  : 'bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-600'
                              }`}
                              title={`${field.name}: ${field.status === 'complete' ? field.value || 'Filled' : 'Missing'}`}
                            >
                              {field.name.includes('-') 
                                ? field.name.split('-')[1].trim().substring(0, 3) 
                                : field.name.substring(0, 4)
                              }
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Legend indicator */}
                  <div className="flex gap-3 text-[10px] font-semibold text-slate-500 justify-center">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded border border-emerald-600 inline-block"></span>
                      <span>Complete</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded border border-red-600 inline-block animate-pulse"></span>
                      <span>Incomplete</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Support info */}
          <div className="pt-6 border-t border-slate-200 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Complies with ISO 128 standards</span>
            </div>
          </div>

          {/* Mobile Profile & Logout Section */}
          {user && (
            <div className="pt-6 border-t border-slate-200 lg:hidden flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-sm font-bold text-blue-700 shadow-sm uppercase">
                  {user.username.substring(0, 2)}
                </div>
                <div className="flex flex-col text-left font-sans">
                  <span className="text-sm font-bold text-slate-800 leading-none">{user.username}</span>
                  <span className="text-[10px] font-medium text-slate-400 capitalize mt-1">{user.role}</span>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full py-2.5 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Logout
              </button>
            </div>
          )}
        </aside>

        {/* Main Content Pane */}
        <main className="dashboard-pane relative">
          {/* Animated Dashboard CAD Background Texture Layer */}
          <div 
            className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-15 mix-blend-multiply animate-dashboard-bg z-0"
            style={{ backgroundImage: `url('/dashboard_bg.png')` }}
          />
          
          {errorMessage && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-800 shadow-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
              <div className="text-sm font-medium">{errorMessage}</div>
            </div>
          )}

          {activeTab === 'compare2d' ? (
            <Compare2DView apiUrl={apiUrl} />
          ) : !results && !analyzing ? (
            // Upload UI
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Inspect Engineering Drawings</h2>
                <p className="text-slate-500 max-w-lg mx-auto">
                  Automatically verify title block cells, signatures, dates, materials, and other critical metadata regions for completeness.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-200/80 overflow-hidden">
                {/* Upload drag drop */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-12 sm:p-16 text-center cursor-pointer hover:bg-slate-50/50 transition-all border-2 border-dashed border-slate-200 hover:border-blue-400 m-4 rounded-xl flex flex-col items-center group"
                >
                  <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center mb-6 transition-colors shadow-sm">
                    <Upload className="w-8 h-8 text-blue-600 group-hover:scale-105 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Upload PDF Drawing</h3>
                  <p className="text-sm text-slate-500 mb-4">Drag and drop your engineering PDF here, or click to browse</p>
                  <div className="flex gap-2">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">Born-Digital CAD</span>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">Scanned PDF</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 bg-slate-50/60 border-t border-slate-200/80 text-center">
                  {[
                    { icon: TrendingUp, title: 'Geometry Extraction', desc: 'Parses raw CAD lines directly' },
                    { icon: AlertCircle, title: 'Missing-Cell Alerter', desc: 'Flags empty title block regions' },
                    { icon: ShieldCheck, title: 'Strict Validation', desc: 'Ensures format compliance check' }
                  ].map((feat, i) => (
                    <div key={i} className="space-y-1">
                      <feat.icon className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="font-semibold text-slate-800 text-xs">{feat.title}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guide Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Supported Inputs
                  </h4>
                  <ul className="text-xs text-slate-500 space-y-2 leading-relaxed">
                    <li>• standard ISO/ANSI layout title boxes</li>
                    <li>• Multi-page engineering packages</li>
                    <li>• Hand-signed and ink-stamped drawings</li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Core Technologies
                  </h4>
                  <ul className="text-xs text-slate-500 space-y-2 leading-relaxed">
                    <li>• PyMuPDF table geometry parsing</li>
                    <li>• OpenCV morphological line detection</li>
                    <li>• OCR pattern verification (Tesseract)</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : analyzing ? (
            // Analyzing Loading Screen
            <div className="max-w-xl mx-auto text-center py-20 space-y-6">
              <div className="relative inline-flex">
                <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-blue-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Analyzing Document</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  {useRealApi 
                    ? 'Extracting geometry grids, verifying text intersections, and analyzing density...' 
                    : 'Running local mock pipeline simulation...'}
                </p>
              </div>
              <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-2xl inline-block text-xs font-semibold text-blue-700 animate-pulse">
                Please wait a few seconds
              </div>
            </div>
          ) : (
            // Results UI
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              
              {/* Top Banner Stats */}
              <div className="stats-grid">
                
                {/* Completeness Score */}
                <div className="stats-card">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Completeness Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold text-slate-900">{activeCompleteness}%</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
                        activeStatus === 'complete' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {activeStatus}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 mt-4 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        activeCompleteness >= 85 
                          ? 'bg-emerald-500' 
                          : activeCompleteness >= 60 
                          ? 'bg-amber-500' 
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${activeCompleteness}%` }}
                    ></div>
                  </div>
                </div>

                {/* Title Block Stats */}
                <div className="stats-card">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Field Completeness Summary</p>
                  <div className="space-y-2 text-sm font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Title Fields</span>
                      <span className="text-slate-800 font-bold">{activeTitleBlock.totalFields}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Correctly Filled</span>
                      <span className="text-emerald-600 font-bold">{activeTitleBlock.filledFields}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Missing/Empty</span>
                      <span className="text-rose-600 font-bold">{activeTitleBlock.incompleteFields}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="stats-card" style={{ gap: '0.5rem' }}>
                  <button
                    onClick={downloadReport}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl shadow-md shadow-blue-200 transition text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Download className="w-4.5 h-4.5" />
                    Export JSON Report
                  </button>
                  <button
                    onClick={() => { setResults(null); setFile(null); }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl transition text-sm font-bold flex items-center justify-center gap-2"
                  >
                    Analyze New File
                  </button>
                </div>
              </div>

              {/* Multipage Selector */}
              {results.pages && results.pages.length > 1 && (
                <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Drawing Page:</span>
                    <div className="flex flex-wrap gap-2">
                      {results.pages.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPageIndex(idx)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                            currentPageIndex === idx
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/50'
                          }`}
                        >
                          <span>{p.pageName || `Page ${idx + 1}`}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'complete' ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'}`}></span>
                          <span className="text-[10px] opacity-75">({p.completeness}%)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-lg">
                    Showing Page {currentPageIndex + 1} of {results.pages.length}
                  </div>
                </div>
              )}

              {/* Tabs Section */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                
                {/* Mobile Dropdown Tab Selector */}
                <div className="md:hidden p-4 bg-slate-50 border-b border-slate-200">
                  <label htmlFor="mobile-tab-selector" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select View</label>
                  <select
                    id="mobile-tab-selector"
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="visualizer">2D Drawing Visualizer</option>
                    <option value="overview">Analysis Recommendations</option>
                    <option value="details">Field list detailed audit</option>
                    <option value="settings">Active Parameters</option>
                  </select>
                </div>

                {/* Desktop Tabs Header navbar */}
                <div className="hidden md:flex border-b border-slate-200 bg-slate-50/50 overflow-x-auto">
                  {[
                    { id: 'visualizer', label: '2D Drawing Visualizer' },
                    { id: 'overview', label: 'Analysis Recommendations' },
                    { id: 'details', label: 'Field list detailed audit' },
                    { id: 'settings', label: 'Active Parameters' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-4 px-6 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600 font-extrabold'
                          : 'border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {/* Visualizer tab */}
                  {activeTab === 'visualizer' && (
                    <DrawingVisualizer results={results} currentPageIndex={currentPageIndex} onSelectField={() => setActiveTab('details')} file={file} />
                  )}

                  {/* Overview tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Required Actions & Recommendations</h3>
                        <div className="space-y-3">
                          {activeRecommendations.map((rec, i) => (
                             <div key={i} className="flex gap-3.5 p-4 bg-rose-50/60 border border-rose-100 rounded-xl">
                               <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                               <p className="text-sm text-rose-900 font-medium leading-relaxed">{rec}</p>
                             </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Details tab */}
                  {activeTab === 'details' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Field Audit Log</h3>
                        <span className="text-xs text-slate-400 font-semibold">{activeFields.length} fields detected</span>
                      </div>
                      
                      <div className="divide-y divide-slate-100">
                        {activeFields.map((field, i) => (
                          <div key={i} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 hover:bg-slate-50/30 transition-colors px-1">
                            <div className="flex items-center gap-3">
                              {field.status === 'complete' ? (
                                <div className="p-1 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                                  <CheckCircle className="w-4.5 h-4.5" />
                                </div>
                              ) : (
                                <div className="p-1 bg-rose-50 rounded-lg text-rose-600 border border-rose-100">
                                  <AlertCircle className="w-4.5 h-4.5" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-slate-800 text-sm">{field.name}</p>
                                <span className={`inline-block text-[10px] px-2 py-0.5 rounded border font-bold capitalize mt-0.5 ${getCriticalityColor(field.criticality)}`}>
                                  {field.criticality || 'low'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {field.value ? (
                                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200/50">
                                  {field.value}
                                </span>
                              ) : (
                                <span className="text-xs text-rose-600 font-bold">Missing</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Settings tab */}
                  {activeTab === 'settings' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Detection Parameters</h3>
                        <button
                          onClick={triggerAnalyzeAgain}
                          className="text-xs bg-slate-100 text-slate-700 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-200 transition font-bold"
                        >
                          Re-run Detection
                        </button>
                      </div>

                      <div className="settings-grid">
                        
                        <label 
                          htmlFor="settings-vector-grid"
                          className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">Vector Grid Extraction</span>
                            <span className="text-[11px] text-slate-400">Uses PyMuPDF cell boundary lookup</span>
                          </div>
                          <input 
                            id="settings-vector-grid"
                            name="vectorGrid"
                            type="checkbox" 
                            checked={vectorGrid} 
                            onChange={(e) => setVectorGrid(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer" 
                          />
                        </label>

                        <label 
                          htmlFor="settings-text-intersection"
                          className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">Text Intersection Analysis</span>
                            <span className="text-[11px] text-slate-400">Maps words to geometric bounding boxes</span>
                          </div>
                          <input 
                            id="settings-text-intersection"
                            name="textIntersection"
                            type="checkbox" 
                            checked={textIntersection} 
                            onChange={(e) => setTextIntersection(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer" 
                          />
                        </label>

                        <label 
                          htmlFor="settings-ocr-validation"
                          className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">OCR Text Validation</span>
                            <span className="text-[11px] text-slate-400">Applies optical recognition on cells</span>
                          </div>
                          <input 
                            id="settings-ocr-validation"
                            name="ocrValidation"
                            type="checkbox" 
                            checked={ocrValidation} 
                            onChange={(e) => setOcrValidation(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer" 
                          />
                        </label>

                        <label 
                          htmlFor="settings-ai-crosscheck"
                          className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">AI Cross-Check</span>
                            <span className="text-[11px] text-slate-400">Claude Vision validation check</span>
                          </div>
                          <input 
                            id="settings-ai-crosscheck"
                            name="aiCrosscheck"
                            type="checkbox" 
                            checked={aiCrosscheck} 
                            onChange={(e) => setAiCrosscheck(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer" 
                          />
                        </label>

                        {/* Template selector */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <label htmlFor="settings-select-template" className="cursor-pointer">
                            <span className="font-bold text-slate-800 text-sm block">Select Bounding Template</span>
                            <span className="text-[11px] text-slate-400">Target specific drawing standard grid definitions</span>
                          </label>
                          <select 
                            id="settings-select-template"
                            name="selectedTemplate"
                            value={selectedTemplate} 
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            className="text-xs font-semibold border-slate-200 rounded-lg p-2 bg-white cursor-pointer focus:outline-none focus:border-blue-500"
                          >
                            {templates.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-start gap-2.5">
                        <Info className="w-4.5 h-4.5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold mb-0.5">Custom layout models</p>
                          <p className="leading-relaxed">To define rules for custom title block dimensions, add the template coordinates to your <code className="font-mono bg-blue-100 px-1 py-0.5 rounded text-blue-900">templates.json</code> config file on the backend.</p>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}

// 2D Engineering Drawing blueprint visualizer component
function DrawingVisualizer({ results, currentPageIndex, onSelectField, file }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const canvasRef = useRef(null);
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPdfUrl(null);
    }
  }, [file]);

  useEffect(() => {
    if (!pdfUrl) return;
    
    let active = true;
    const renderPdfCanvas = async () => {
      try {
        setRenderError(false);
        if (!window.pdfjsLib) {
          console.warn("pdfjsLib is not loaded yet");
          return;
        }

        const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        if (!active) return;

        const page = await pdf.getPage(currentPageIndex + 1);
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Render at a high-resolution scale scaled by the device pixel density (HiDPI/Retina mobile support)
        const dpr = window.devicePixelRatio || 1;
        const scale = 2.5 * dpr;
        const viewport = page.getViewport({ scale: scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        await page.render(renderContext).promise;
      } catch (err) {
        console.error("PDF canvas render error:", err);
        setRenderError(true);
      }
    };

    // Delay slightly to ensure script is loaded
    const timeout = setTimeout(renderPdfCanvas, 100);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [pdfUrl, currentPageIndex]);

  // Constant light theme colors
  const strokeColor = '#0f172a'; // slate-900 for geometries and main features
  const accentColor = '#1e3a8a'; // blue-900 for dimensions and texts
  const gridColor = '#94a3b8'; // slate-400 for background drafting grid lines

  // Safe field lookup helper
  const getField = (name) => {
    const fieldsSource = results && results.pages ? results.pages[currentPageIndex].fields : (results ? results.fields : null);
    if (!fieldsSource) return { status: 'incomplete', value: null };
    return fieldsSource.find(f => f.name.toUpperCase().includes(name.toUpperCase())) || { status: 'incomplete', value: null };
  };

  const dwgNo = getField('DWG NO.');
  const title = getField('TITLE');
  const material = getField('MATERIAL');
  const finish = getField('FINISH');
  const weight = getField('WEIGHT');
  const rev = getField('REVISION') || { value: '' };
  const scale = getField('SCALE') || { value: '' };
  const sheet = getField('SHEET') || { value: '' };
  
  // Drawn by info
  const drawnName = getField('DRAWN - NAME') || getField('DRAWN BY');
  const drawnSig = getField('DRAWN - SIGNATURE') || getField('DRAWN BY - SIGN');
  const drawnDate = getField('DRAWN - DATE') || getField('DRAWN BY - DATE');
  
  // Checked by info
  const chkdName = getField('CHK\'D - NAME') || getField('CHECKED BY');
  const chkdSig = getField('CHK\'D - SIGNATURE') || getField('CHECKED BY - SIGN');
  const chkdDate = getField('CHK\'D - DATE') || getField('CHECKED BY - DATE');

  // Approved by info
  const appvdName = getField('APPV\'D - NAME') || getField('APPROVED BY');
  const appvdSig = getField('APPV\'D - SIGNATURE') || getField('APPROVED BY - SIGN');
  const appvdDate = getField('APPV\'D - DATE') || getField('APPROVED BY - DATE');

  // Mfg info
  const mfgName = getField('MFG - NAME') || getField('MFG BY');
  const mfgSig = getField('MFG - SIGNATURE') || getField('MFG BY - SIGN');
  const mfgDate = getField('MFG - DATE') || getField('MFG BY - DATE');
  
  // QA info
  const qaName = getField('Q.A - NAME') || getField('Q.A BY') || getField('QA - NAME');
  const qaSig = getField('Q.A - SIGNATURE') || getField('Q.A BY - SIGN') || getField('QA - SIGNATURE');
  const qaDate = getField('Q.A - DATE') || getField('Q.A BY - DATE') || getField('QA - DATE');

  return (
    <div className="flex flex-col gap-4">
      {/* Blueprint background container */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 sm:p-6 relative shadow-2xl overflow-x-auto">
        <div className="min-w-[850px] aspect-[1.414] bg-white border-slate-800/40 text-slate-800 shadow-[inset_0_0_40px_rgba(15,23,42,0.02)] bg-[linear-gradient(to_right,rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.03)_1px,transparent_1px)] border-2 p-4 relative font-mono select-none [background-size:20px_20px]">
          
          {/* Engineering Sheet Outer Margin coordinate indices */}
          <div className="absolute inset-1 border border-slate-800/10 pointer-events-none"></div>
          {/* Top & Bottom coordinate labels */}
          <div className="absolute top-1 left-0 right-0 flex justify-around text-[9px] text-slate-800/40 pointer-events-none">
            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span>
          </div>
          <div className="absolute bottom-1 left-0 right-0 flex justify-around text-[9px] text-slate-800/40 pointer-events-none">
            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span>
          </div>
          {/* Left & Right coordinate labels */}
          <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-around text-[9px] text-slate-800/40 pointer-events-none">
            <span>A</span><span>B</span><span>C</span><span>D</span>
          </div>
          <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-around text-[9px] text-slate-800/40 pointer-events-none">
            <span>A</span><span>B</span><span>C</span><span>D</span>
          </div>

          {/* Inner Drawing Border */}
          <div className="absolute inset-4 border-2 border-slate-800/60 pointer-events-none"></div>

          {/* Blueprint Drawing Content - 2D CAD SVG or Real PDF Drawing */}
          <div className="absolute inset-8 bottom-48 flex items-center justify-center pointer-events-none">
            {pdfUrl ? (
              !renderError ? (
                <canvas 
                  ref={canvasRef} 
                  className="max-w-full max-h-full object-contain pointer-events-auto shadow-sm rounded-lg"
                />
              ) : (
                <iframe 
                  src={`${pdfUrl}#page=${currentPageIndex + 1}&toolbar=0&navpanes=0&statusbar=0&messages=0&view=Fit`} 
                  className="w-full h-full border-none rounded-lg pointer-events-auto shadow-sm"
                  title="PDF Drawing Viewer"
                />
              )
            ) : currentPageIndex === 0 ? (
              /* Page 1: Rectangular plate drawing matching user's image */
              <svg className="w-full h-full max-h-[300px] opacity-75" viewBox="0 0 580 260" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Grid coordinates for drafting sheet */}
                <g stroke={gridColor} strokeWidth="0.5" opacity="0.4">
                  {/* Page borders */}
                  <rect x="5" y="5" width="570" height="250" stroke={gridColor} strokeWidth="1" />
                  <rect x="15" y="15" width="550" height="230" stroke={gridColor} strokeWidth="1.5" />
                  
                  {/* Grid tick lines */}
                  <line x1="83" y1="5" x2="83" y2="15" />
                  <line x1="152" y1="5" x2="152" y2="15" />
                  <line x1="221" y1="5" x2="221" y2="15" />
                  <line x1="290" y1="5" x2="290" y2="15" />
                  <line x1="359" y1="5" x2="359" y2="15" />
                  <line x1="428" y1="5" x2="428" y2="15" />
                  <line x1="497" y1="5" x2="497" y2="15" />
                  
                  <line x1="83" y1="235" x2="83" y2="245" />
                  <line x1="152" y1="235" x2="152" y2="245" />
                  <line x1="221" y1="235" x2="221" y2="245" />
                  <line x1="290" y1="235" x2="290" y2="245" />
                  <line x1="359" y1="235" x2="359" y2="245" />
                  <line x1="428" y1="235" x2="428" y2="245" />
                  <line x1="497" y1="235" x2="497" y2="245" />
                  
                  {/* Horizontal ticks */}
                  <line x1="5" y1="53" x2="15" y2="53" />
                  <line x1="5" y1="91" x2="15" y2="91" />
                  <line x1="5" y1="129" x2="15" y2="129" />
                  <line x1="5" y1="167" x2="15" y2="167" />
                  <line x1="5" y1="205" x2="15" y2="205" />
                  
                  <line x1="565" y1="53" x2="575" y2="53" />
                  <line x1="565" y1="91" x2="575" y2="91" />
                  <line x1="565" y1="129" x2="575" y2="129" />
                  <line x1="565" y1="167" x2="575" y2="167" />
                  <line x1="565" y1="205" x2="575" y2="205" />
                </g>

                {/* Part Geometry: Rectangular plate */}
                <rect x="50" y="55" width="280" height="136" stroke={strokeColor} strokeWidth="2" />
                
                {/* Centerlines for holes */}
                <g stroke={strokeColor} strokeWidth="0.8" strokeDasharray="12 3 3 3" opacity="0.6">
                  <line x1="40" y1="65" x2="340" y2="65" />
                  <line x1="40" y1="181" x2="340" y2="181" />
                  <line x1="62" y1="45" x2="62" y2="195" />
                  <line x1="190" y1="45" x2="190" y2="195" />
                  <line x1="318" y1="45" x2="318" y2="195" />
                </g>

                {/* 6 Bolt holes */}
                <g stroke={strokeColor} strokeWidth="1.5">
                  <circle cx="62" cy="65" r="4.5" />
                  <circle cx="62" cy="65" r="8" strokeDasharray="3 1" strokeWidth="0.8" />
                  <circle cx="190" cy="65" r="4.5" />
                  <circle cx="190" cy="65" r="8" strokeDasharray="3 1" strokeWidth="0.8" />
                  <circle cx="318" cy="65" r="4.5" />
                  <circle cx="318" cy="65" r="8" strokeDasharray="3 1" strokeWidth="0.8" />
                  <circle cx="62" cy="181" r="4.5" />
                  <circle cx="62" cy="181" r="8" strokeDasharray="3 1" strokeWidth="0.8" />
                  <circle cx="190" cy="181" r="4.5" />
                  <circle cx="190" cy="181" r="8" strokeDasharray="3 1" strokeWidth="0.8" />
                  <circle cx="318" cy="181" r="4.5" />
                  <circle cx="318" cy="181" r="8" strokeDasharray="3 1" strokeWidth="0.8" />
                </g>

                {/* Main dimensions */}
                <g stroke={accentColor} strokeWidth="0.8" fill={accentColor} fontSize="7" fontFamily="monospace">
                  {/* Width dimension 400.00 */}
                  <line x1="50" y1="45" x2="50" y2="52" />
                  <line x1="330" y1="45" x2="330" y2="52" />
                  <line x1="50" y1="47" x2="330" y2="47" />
                  <polygon points="50,47 54,45 54,49" />
                  <polygon points="330,47 326,45 326,49" />
                  <text x="190" y="43" textAnchor="middle" stroke="none" fontSize="8" fontWeight="bold">400.00</text>

                  {/* Height dimension 195.00 */}
                  <line x1="333" y1="55" x2="340" y2="55" />
                  <line x1="333" y1="191" x2="340" y2="191" />
                  <line x1="338" y1="55" x2="338" y2="191" />
                  <polygon points="338,55 336,60 340,60" />
                  <polygon points="338,191 336,186 340,186" />
                  <text x="343" y="125" stroke="none" fontSize="8" fontWeight="bold" transform="rotate(90 343 125)" textAnchor="middle">195.00</text>

                  {/* Vertical hole coordinates 172.50 */}
                  <line x1="42" y1="65" x2="48" y2="65" />
                  <line x1="42" y1="181" x2="48" y2="181" />
                  <line x1="42" y1="191" x2="48" y2="191" />
                  <line x1="44" y1="65" x2="44" y2="191" />
                  <polygon points="44,65 42,70 46,70" />
                  <text x="38" y="125" stroke="none" textAnchor="middle" transform="rotate(-90 38 125)">172.50</text>
                  <line x1="44" y1="181" x2="44" y2="191" />
                  <polygon points="44,181 42,186 46,186" />
                  <text x="32" y="188" stroke="none" fontSize="6">22.50</text>
                  <text x="32" y="194" stroke="none" fontSize="6">0</text>

                  {/* Horizontal coordinates at bottom */}
                  <line x1="50" y1="193" x2="50" y2="199" />
                  <line x1="62" y1="193" x2="62" y2="199" />
                  <line x1="190" y1="193" x2="190" y2="199" />
                  <line x1="318" y1="193" x2="318" y2="199" />
                  
                  <text x="50" y="206" stroke="none" textAnchor="middle">0</text>
                  <text x="62" y="206" stroke="none" textAnchor="middle">22.50</text>
                  <text x="190" y="206" stroke="none" textAnchor="middle">200.00</text>
                  <text x="318" y="206" stroke="none" textAnchor="middle">377.50</text>

                  {/* Leader line callout for holes */}
                  <path d="M 318 181 L 340 205 L 390 205" stroke={accentColor} fill="none" />
                  <polygon points="318,181 322,185 320,180" />
                  <text x="393" y="202" stroke="none" textAnchor="start" fontSize="7" fontWeight="bold">6 x Ø 6.60 THRU ALL</text>
                  <text x="393" y="210" stroke="none" textAnchor="start" fontSize="7" fontWeight="bold">⌴ Ø 12.60 x 90°</text>
                </g>

                {/* SIDE VIEW (Thickness: 5.00) */}
                <g stroke={strokeColor}>
                  <rect x="375" y="55" width="6" height="136" strokeWidth="2" />
                  <line x1="375" y1="45" x2="375" y2="52" strokeWidth="0.8" />
                  <line x1="381" y1="45" x2="381" y2="52" strokeWidth="0.8" />
                  <line x1="369" y1="47" x2="387" y2="47" strokeWidth="0.8" />
                  <polygon points="375,47 372,45 372,49" fill={accentColor} />
                  <polygon points="381,47 384,45 384,49" fill={accentColor} />
                  <text x="378" y="42" fill={accentColor} stroke="none" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">5.00</text>
                </g>

                {/* 3D ISOMETRIC VIEW in top-right */}
                <g stroke={strokeColor} strokeWidth="1" opacity="0.85">
                  <polygon points="440,45 530,75 530,135 440,105" strokeWidth="1.5" />
                  <polygon points="530,75 535,72 535,132 530,135" />
                  <polygon points="440,45 445,42 535,72 530,75" />
                  <line x1="440" y1="105" x2="445" y2="102" />
                  <line x1="445" y1="42" x2="445" y2="102" />
                  <line x1="445" y1="102" x2="535" y2="132" />
                  
                  <ellipse cx="455" cy="59" rx="2.5" ry="1.5" transform="rotate(10 455 59)" />
                  <ellipse cx="490" cy="71" rx="2.5" ry="1.5" transform="rotate(10 490 71)" />
                  <ellipse cx="520" cy="81" rx="2.5" ry="1.5" transform="rotate(10 520 81)" />
                  <ellipse cx="455" cy="91" rx="2.5" ry="1.5" transform="rotate(10 455 91)" />
                  <ellipse cx="490" cy="103" rx="2.5" ry="1.5" transform="rotate(10 490 103)" />
                  <ellipse cx="520" cy="113" rx="2.5" ry="1.5" transform="rotate(10 520 113)" />
                </g>

                <text x="25" y="25" fill={accentColor} fontSize="7" fontFamily="monospace" opacity="0.5">SHEET FORMAT: ISO A3</text>
                <text x="25" y="34" fill={accentColor} fontSize="7" fontFamily="monospace" opacity="0.5">THIRD ANGLE PROJECTION</text>
              </svg>
            ) : (
              /* Page 2: Circular flange geometry */
              <svg className="w-full h-full max-h-[300px] opacity-75" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Part geometry: Hub flange */}
                <circle cx="200" cy="100" r="60" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="6 2 2 2" />
                <circle cx="200" cy="100" r="45" stroke={strokeColor} strokeWidth="2" />
                <circle cx="200" cy="100" r="25" stroke={strokeColor} strokeWidth="1.5" />
                <circle cx="200" cy="100" r="10" stroke={strokeColor} strokeWidth="1.5" />
                
                {/* Flange bolt holes */}
                <circle cx="200" cy="145" r="5" stroke={strokeColor} strokeWidth="1.5" />
                <circle cx="200" cy="55" r="5" stroke={strokeColor} strokeWidth="1.5" />
                <circle cx="245" cy="100" r="5" stroke={strokeColor} strokeWidth="1.5" />
                <circle cx="155" cy="100" r="5" stroke={strokeColor} strokeWidth="1.5" />

                {/* Horizontal / Vertical Center Lines */}
                <line x1="120" y1="100" x2="280" y2="100" stroke={strokeColor} strokeWidth="1" strokeDasharray="20 4 4 4" opacity="0.6" />
                <line x1="200" y1="30" x2="200" y2="170" stroke={strokeColor} strokeWidth="1" strokeDasharray="20 4 4 4" opacity="0.6" />

                {/* Dimension lines & symbols */}
                <line x1="200" y1="20" x2="200" y2="35" stroke={accentColor} strokeWidth="1" />
                <line x1="200" y1="165" x2="200" y2="180" stroke={accentColor} strokeWidth="1" />
                
                <path d="M 270 40 L 290 20 L 330 20" stroke={accentColor} strokeWidth="1" />
                <polygon points="270,40 274,36 271,43" fill={accentColor} />
                <text x="295" y="15" fill={accentColor} fontSize="8" fontFamily="monospace">4x Ø10.0 THRU</text>

                <path d="M 215 110 L 230 125 L 260 125" stroke={accentColor} strokeWidth="1" />
                <polygon points="215,110 219,114 216,107" fill={accentColor} />
                <text x="232" y="120" fill={accentColor} fontSize="8" fontFamily="monospace">Ø25.0 +0.02/-0.01</text>
                
                <line x1="70" y1="55" x2="70" y2="145" stroke={accentColor} strokeWidth="1" />
                <polygon points="70,55 67,61 73,61" fill={accentColor} />
                <polygon points="70,145 67,139 73,139" fill={accentColor} />
                <line x1="65" y1="55" x2="75" y2="55" stroke={accentColor} strokeWidth="1" />
                <line x1="65" y1="145" x2="75" y2="145" stroke={accentColor} strokeWidth="1" />
                <text x="45" y="103" fill={accentColor} fontSize="8" fontFamily="monospace" transform="rotate(-90 45 103)">PCD Ø90</text>

                <text x="15" y="25" fill={accentColor} fontSize="8" fontFamily="monospace" opacity="0.5">PROJECTION: THIRD ANGLE</text>
                <text x="15" y="38" fill={accentColor} fontSize="8" fontFamily="monospace" opacity="0.5">UNIT: MM [INCHES]</text>
                <text x="15" y="51" fill={accentColor} fontSize="8" fontFamily="monospace" opacity="0.5">TOLERANCES UNLESS SPECIFIED:</text>
                <text x="15" y="62" fill={accentColor} fontSize="8" fontFamily="monospace" opacity="0.5">X.X ±0.1  /  X.XX ±0.05</text>
              </svg>
            )}
          </div>

          {/* Interactive Title Block Container (Styled exactly like user's image) */}
          <div className="absolute bottom-4 right-4 w-[780px] z-20 bg-white border border-slate-400 text-slate-800 text-[8px] font-sans shadow-md flex flex-row pointer-events-auto select-text">
            
            {/* LEFT MAIN COLUMN */}
            <div className="w-[58%] flex flex-col border-r border-slate-400">
              
              {/* Top Row: Dimensions, Finish, Deburr */}
              <div className="w-full border-b border-slate-400 flex divide-x divide-slate-400 h-[48px]">
                
                {/* UNLESS SPECIFIED */}
                <div 
                  onClick={() => onSelectField('UNLESS OTHERWISE SPECIFIED')}
                  className={`w-[45%] p-1 flex flex-col justify-between text-[5.5px] leading-tight font-semibold cursor-pointer transition ${
                    getField('UNLESS OTHERWISE SPECIFIED').status === 'incomplete'
                      ? 'bg-red-50 hover:bg-red-100 border border-dashed border-red-500/60 animate-pulse text-red-600'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>UNLESS OTHERWISE SPECIFIED:</span>
                    {getField('UNLESS OTHERWISE SPECIFIED').status === 'incomplete' && <span className="text-red-500 font-bold">⚠️</span>}
                  </div>
                  <div>DIMENSIONS ARE IN MILLIMETERS</div>
                  <div className="flex justify-between">
                    <span>SURFACE FINISH:</span>
                    <span>TOLERANCES:</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LINEAR: {getField('UNLESS OTHERWISE SPECIFIED').value ? getField('UNLESS OTHERWISE SPECIFIED').value.split(',')[0].replace('LINEAR:', '').trim() : 'MISSING'}</span>
                    <span>ANGULAR: {getField('UNLESS OTHERWISE SPECIFIED').value ? getField('UNLESS OTHERWISE SPECIFIED').value.split(',')[1]?.replace('ANGULAR:', '').trim() || 'MISSING' : 'MISSING'}</span>
                  </div>
                </div>
                
                {/* FINISH Cell */}
                <div 
                  onClick={() => onSelectField('FINISH')}
                  className={`w-[25%] p-1.5 flex flex-col justify-between cursor-pointer transition ${
                    finish.status === 'incomplete' 
                      ? 'bg-red-50 hover:bg-red-100 border border-dashed border-red-500/60 animate-pulse' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[5.5px] text-slate-400 font-bold">FINISH:</span>
                  <span className={`font-bold text-[8px] tracking-wide ${finish.status === 'incomplete' ? 'text-red-600' : 'text-slate-800'}`}>
                    {finish.status === 'incomplete' ? 'MISSING' : finish.value || 'N/A'}
                  </span>
                </div>

                {/* DEBURR AND BREAK */}
                <div className="w-[30%] p-1 flex flex-col justify-center text-[5.5px] text-slate-400 font-bold leading-tight">
                  <div>DEBURR AND</div>
                  <div>BREAK SHARP</div>
                  <div>EDGES</div>
                </div>
              </div>

              {/* Bottom Section: Table + Material/Weight */}
              <div className="w-full flex-1 flex h-[90px]">
                
                {/* Table part (Headers, Drawn, Checked, Approved, Mfg, QA) */}
                <div className="w-[72%] flex flex-col divide-y divide-slate-400 border-r border-slate-400 h-full">
                  
                  {/* Table Header */}
                  <div className="w-full flex divide-x divide-slate-400 bg-slate-50 text-[5.5px] font-bold text-slate-400 text-center py-0.5">
                    <div className="w-[18%]"></div>
                    <div className="w-[32%]">NAME</div>
                    <div className="w-[32%]">SIGNATURE</div>
                    <div className="w-[18%]">DATE</div>
                  </div>

                  {/* DRAWN Row */}
                  <div className="w-full flex-1 flex divide-x divide-slate-400 items-center text-center text-[7.5px]">
                    <div className="w-[18%] font-bold text-left px-1 text-[6px] text-slate-400">DRAWN</div>
                    
                    {/* Drawn Name */}
                    <div 
                      onClick={() => onSelectField('DRAWN')}
                      className={`w-[32%] h-full flex items-center justify-center cursor-pointer font-bold ${
                        drawnName.status === 'incomplete' ? 'bg-red-50 text-red-600 font-bold' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {drawnName.status === 'incomplete' ? '⚠️' : drawnName.value}
                    </div>

                    {/* Drawn Signature */}
                    <div 
                      onClick={() => onSelectField('DRAWN')}
                      className={`w-[32%] h-full flex items-center justify-center cursor-pointer ${
                        drawnSig.status === 'incomplete' 
                          ? 'bg-red-50 text-red-600 font-bold animate-pulse text-[6.5px]' 
                          : 'hover:bg-slate-50 italic font-semibold text-blue-900'
                      }`}
                    >
                      {drawnSig.status === 'incomplete' ? 'MISSING' : drawnSig.value || '✔ Signed'}
                    </div>

                    {/* Drawn Date */}
                    <div 
                      onClick={() => onSelectField('DRAWN')}
                      className={`w-[18%] h-full flex items-center justify-center cursor-pointer ${
                        drawnDate.status === 'incomplete' ? 'bg-red-50 text-red-600 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {drawnDate.status === 'incomplete' ? '⚠️' : drawnDate.value}
                    </div>
                  </div>

                  {/* CHK'D Row */}
                  <div className="w-full flex-1 flex divide-x divide-slate-400 items-center text-center text-[7.5px]">
                    <div className="w-[18%] font-bold text-left px-1 text-[6px] text-slate-400">CHK'D</div>
                    
                    {/* Checked Name */}
                    <div 
                      onClick={() => onSelectField('CHK\'D')}
                      className={`w-[32%] h-full flex items-center justify-center cursor-pointer font-bold ${
                        chkdName.status === 'incomplete' ? 'bg-red-50 text-red-600 font-bold' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {chkdName.status === 'incomplete' ? '⚠️' : chkdName.value}
                    </div>

                    {/* Checked Signature */}
                    <div 
                      onClick={() => onSelectField('CHK\'D')}
                      className={`w-[32%] h-full flex items-center justify-center cursor-pointer ${
                        chkdSig.status === 'incomplete' 
                          ? 'bg-red-50 text-red-600 font-bold animate-pulse text-[6.5px]' 
                          : 'hover:bg-slate-50 italic font-semibold text-blue-900'
                      }`}
                    >
                      {chkdSig.status === 'incomplete' ? 'MISSING' : chkdSig.value || '✔ Signed'}
                    </div>

                    {/* Checked Date */}
                    <div 
                      onClick={() => onSelectField('CHK\'D')}
                      className={`w-[18%] h-full flex items-center justify-center cursor-pointer ${
                        chkdDate.status === 'incomplete' ? 'bg-red-50 text-red-600' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {chkdDate.status === 'incomplete' ? '⚠️' : chkdDate.value}
                    </div>
                  </div>

                  {/* APPV'D Row */}
                  <div className="w-full flex-1 flex divide-x divide-slate-400 items-center text-center text-[7.5px]">
                    <div className="w-[18%] font-bold text-left px-1 text-[6px] text-slate-400">APPV'D</div>
                    
                    {/* Approved Name */}
                    <div 
                      onClick={() => onSelectField('APPV\'D')}
                      className={`w-[32%] h-full flex items-center justify-center cursor-pointer font-bold ${
                        appvdName.status === 'incomplete' ? 'bg-red-50 text-red-600 font-bold' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {appvdName.status === 'incomplete' ? '⚠️' : appvdName.value}
                    </div>

                    {/* Approved Signature */}
                    <div 
                      onClick={() => onSelectField('APPV\'D')}
                      className={`w-[32%] h-full flex items-center justify-center cursor-pointer ${
                        appvdSig.status === 'incomplete' 
                          ? 'bg-red-50 text-red-600 font-bold animate-pulse text-[6.5px]' 
                          : 'hover:bg-slate-50 italic font-semibold text-blue-900'
                      }`}
                    >
                      {appvdSig.status === 'incomplete' ? 'MISSING' : appvdSig.value || '✔ Signed'}
                    </div>

                    {/* Approved Date */}
                    <div 
                      onClick={() => onSelectField('APPV\'D')}
                      className={`w-[18%] h-full flex items-center justify-center cursor-pointer ${
                        appvdDate.status === 'incomplete' ? 'bg-red-50 text-red-600' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {appvdDate.status === 'incomplete' ? '⚠️' : appvdDate.value}
                    </div>
                  </div>

                  {/* MFG Row */}
                  <div className="w-full flex-1 flex divide-x divide-slate-400 items-center text-center text-[7.5px]">
                    <div className="w-[18%] font-bold text-left px-1 text-[6px] text-slate-400">MFG</div>
                    
                    {/* MFG Name */}
                    <div 
                      onClick={() => onSelectField('MFG')}
                      className={`w-[32%] h-full flex items-center justify-center cursor-pointer font-bold ${
                        mfgName.status === 'incomplete' ? 'bg-red-50 text-red-600 font-bold' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {mfgName.status === 'incomplete' ? '⚠️' : mfgName.value}
                    </div>

                    {/* MFG Signature */}
                    <div 
                      onClick={() => onSelectField('MFG')}
                      className={`w-[32%] h-full flex items-center justify-center cursor-pointer ${
                        mfgSig.status === 'incomplete' 
                          ? 'bg-red-50 text-red-600 font-bold animate-pulse text-[6.5px]' 
                          : 'hover:bg-slate-50 italic font-semibold text-blue-900'
                      }`}
                    >
                      {mfgSig.status === 'incomplete' ? 'MISSING' : mfgSig.value || '✔ Signed'}
                    </div>

                    {/* MFG Date */}
                    <div 
                      onClick={() => onSelectField('MFG')}
                      className={`w-[18%] h-full flex items-center justify-center cursor-pointer ${
                        mfgDate.status === 'incomplete' ? 'bg-red-50 text-red-600 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {mfgDate.status === 'incomplete' ? '⚠️' : mfgDate.value}
                    </div>
                  </div>

                  {/* Q.A Row */}
                  <div className="w-full flex-1 flex divide-x divide-slate-400 items-center text-center text-[7.5px]">
                    <div className="w-[18%] font-bold text-left px-1 text-[6px] text-slate-400">Q.A</div>
                    
                    {/* Q.A Name */}
                    <div 
                      onClick={() => onSelectField('Q.A')}
                      className={`w-[32%] h-full flex items-center justify-center cursor-pointer font-bold ${
                        qaName.status === 'incomplete' ? 'bg-red-50 text-red-600 font-bold' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {qaName.status === 'incomplete' ? '⚠️' : qaName.value}
                    </div>

                    {/* Q.A Signature */}
                    <div 
                      onClick={() => onSelectField('Q.A')}
                      className={`w-[32%] h-full flex items-center justify-center cursor-pointer ${
                        qaSig.status === 'incomplete' 
                          ? 'bg-red-50 text-red-600 font-bold animate-pulse text-[6.5px]' 
                          : 'hover:bg-slate-50 italic font-semibold text-blue-900'
                      }`}
                    >
                      {qaSig.status === 'incomplete' ? 'MISSING' : qaSig.value || '✔ Signed'}
                    </div>

                    {/* Q.A Date */}
                    <div 
                      onClick={() => onSelectField('Q.A')}
                      className={`w-[18%] h-full flex items-center justify-center cursor-pointer ${
                        qaDate.status === 'incomplete' ? 'bg-red-50 text-red-600 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {qaDate.status === 'incomplete' ? '⚠️' : qaDate.value}
                    </div>
                  </div>

                </div>

                {/* Material & Weight section (Aligned next to MFG and Q.A rows) */}
                <div className="w-[28%] flex flex-col divide-y divide-slate-400 h-full bg-white font-semibold">
                  {/* MATERIAL Block */}
                  <div 
                    onClick={() => onSelectField('MATERIAL')}
                    className={`flex-1 p-1.5 flex flex-col justify-between cursor-pointer transition ${
                      material.status === 'incomplete' 
                        ? 'bg-red-50 hover:bg-red-100 border border-dashed border-red-500/60 animate-pulse text-red-600' 
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className="text-[5.5px] text-slate-400 font-bold">MATERIAL:</span>
                    <span className="font-bold text-[7.5px] tracking-wide">
                      {material.status === 'incomplete' ? 'MISSING' : material.value || 'N/A'}
                    </span>
                  </div>

                  {/* WEIGHT Block */}
                  <div 
                    onClick={() => onSelectField('WEIGHT')}
                    className={`flex-1 p-1.5 flex flex-col justify-between cursor-pointer transition ${
                      weight.status === 'incomplete' 
                        ? 'bg-red-50 hover:bg-red-100 border border-dashed border-red-500/60 text-red-600' 
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className="text-[5.5px] text-slate-400 font-bold">WEIGHT:</span>
                    <span className="font-bold text-[7.5px] tracking-wide">
                      {weight.status === 'incomplete' ? 'MISSING' : weight.value || 'N/A'}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT MAIN COLUMN */}
            <div className="w-[42%] flex flex-col">
              
              {/* Row 1: DO NOT SCALE and REVISION */}
              <div className="w-full border-b border-slate-400 flex divide-x divide-slate-400 h-[18px] items-center">
                <div className="w-[70%] text-center text-[6.5px] font-bold text-slate-400 tracking-wider">
                  DO NOT SCALE DRAWING
                </div>
                <div className="w-[30%] h-full p-1 flex flex-col justify-center text-left">
                  <span className="text-[4.5px] text-slate-400 leading-none font-bold">REVISION</span>
                  <span className="font-bold text-[7.5px] leading-tight text-slate-800">{rev.value || 'A'}</span>
                </div>
              </div>

              {/* Row 2: Empty space / Branding */}
              <div className="w-full border-b border-slate-400 h-[30px] flex items-center justify-between px-3 bg-slate-50/50">
                <span className="text-[6.5px] text-slate-400 font-extrabold uppercase tracking-widest">DRAFTGUARD SYSTEMS</span>
                <div className="w-3 h-3 bg-slate-300 rounded-full border border-slate-400 flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" className="w-full h-full object-contain" alt="" />
                </div>
              </div>

              {/* Row 3: TITLE: */}
              <div 
                onClick={() => onSelectField('TITLE')}
                className={`w-full border-b border-slate-400 h-[45px] p-1.5 flex flex-col justify-between cursor-pointer transition ${
                  title.status === 'incomplete' 
                    ? 'bg-red-50 hover:bg-red-100 border border-dashed border-red-500/60 animate-pulse' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center text-[5.5px]">
                  <span className="text-slate-400 font-bold">TITLE:</span>
                  {title.status === 'incomplete' && <span className="text-red-500 font-extrabold uppercase text-[5.5px]">⚠️ MISSING</span>}
                </div>
                <div className="h-6 flex items-center">
                  {title.status === 'incomplete' ? (
                    <span className="text-red-500 font-bold text-[7.5px] uppercase">
                      [REQUIRED] ENTER TITLE
                    </span>
                  ) : (
                    <span className="font-bold text-[9.5px] text-slate-800 tracking-wide uppercase truncate">
                      {title.value}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 4: DWG NO. */}
              <div 
                onClick={() => onSelectField('DWG NO.')}
                className={`w-full border-b border-slate-400 h-[45px] p-1.5 flex flex-col justify-between cursor-pointer transition relative ${
                  dwgNo.status === 'incomplete' 
                    ? 'bg-red-50 hover:bg-red-100 border border-dashed border-red-500/60 animate-pulse' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center text-[5.5px]">
                  <span className="text-slate-400 font-bold">DWG NO.</span>
                  {dwgNo.status === 'incomplete' && <span className="text-red-500 font-extrabold uppercase text-[5.5px]">⚠️ MISSING</span>}
                </div>
                <span className="absolute top-1 right-2 text-[9px] font-bold text-slate-400">A3</span>
                <div className="h-6 flex items-center">
                  {dwgNo.status === 'incomplete' ? (
                    <span className="text-red-500 font-bold text-[7.5px] uppercase">
                      [REQUIRED] ENTER DRAWING NO
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-[14px] text-slate-900 tracking-wide">
                      {dwgNo.value}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 5: SCALE and SHEET */}
              <div className="w-full flex divide-x divide-slate-400 h-[18px] items-center">
                <div className="w-[50%] h-full p-1 flex items-center text-left hover:bg-slate-50 cursor-pointer text-[6px] text-slate-400 font-bold uppercase">
                  <span>SCALE: {scale.value || '1:2'}</span>
                </div>
                <div className="w-[50%] h-full p-1 flex items-center text-left hover:bg-slate-50 cursor-pointer text-[6px] text-slate-400 font-bold uppercase">
                  <span>SHEET: {sheet.value || '1 OF 1'}</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
      
      {/* Visualizer Help Footer */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-slate-600 font-medium">Click on any <strong className="text-red-600">highlighted block</strong> in the title block to view details or fix the missing data.</span>
        </div>
      </div>
    </div>
  );
}
