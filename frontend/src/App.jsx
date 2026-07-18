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
  Settings2
} from 'lucide-react';

export default function App() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [useRealApi, setUseRealApi] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Settings
  const [vectorGrid, setVectorGrid] = useState(true);
  const [textIntersection, setTextIntersection] = useState(true);
  const [ocrValidation, setOcrValidation] = useState(false);
  const [aiCrosscheck, setAiCrosscheck] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('ATS-A3-Standard');
  const [templates, setTemplates] = useState(['ATS-A3-Standard']);

  const fileInputRef = useRef(null);
  const apiUrl = 'http://localhost:8000';

  // Check API health on load
  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${apiUrl}/health`);
      if (response.ok) {
        setApiOnline(true);
        setUseRealApi(true); // Automatically switch to API mode if online
        
        // Fetch available templates
        try {
          const tRes = await fetch(`${apiUrl}/api/templates`);
          const tData = await tRes.json();
          if (tData.templates && tData.templates.length > 0) {
            setTemplates(tData.templates);
            setSelectedTemplate(tData.templates[0]);
          }
        } catch (err) {
          console.warn('Failed to load templates from API:', err);
        }
      } else {
        setApiOnline(false);
        setUseRealApi(false);
      }
    } catch (error) {
      setApiOnline(false);
      setUseRealApi(false);
    }
  };

  useEffect(() => {
    checkApiHealth();
  }, []);

  const mockAnalyzeFile = async (file) => {
    setAnalyzing(true);
    setErrorMessage('');
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    const mockResults = {
      fileName: file.name,
      completeness: 73,
      status: 'incomplete',
      timestamp: new Date().toLocaleString(),
      titleBlock: {
        totalFields: 15,
        filledFields: 11,
        incompleteFields: 4,
        criticalFields: ['DWG NO.', 'TITLE', 'MATERIAL', 'DRAWN - SIGNATURE']
      },
      detectionMethod: 'Vector Geometry + Text Intersection Analysis',
      confidenceScore: 94.2,
      fields: [
        { name: 'DWG NO.', status: 'incomplete', criticality: 'critical', value: null },
        { name: 'TITLE', status: 'incomplete', criticality: 'critical', value: null },
        { name: 'DRAWN - NAME', status: 'complete', criticality: 'high', value: 'J. Doe' },
        { name: 'DRAWN - SIGNATURE', status: 'incomplete', criticality: 'high', value: null },
        { name: 'DRAWN - DATE', status: 'complete', criticality: 'high', value: '2026-07-16' },
        { name: 'CHK\'D - NAME', status: 'complete', criticality: 'high', value: 'J. Smith' },
        { name: 'CHK\'D - SIGNATURE', status: 'complete', criticality: 'high', value: '[Signed]' },
        { name: 'CHK\'D - DATE', status: 'complete', criticality: 'high', value: '2026-07-17' },
        { name: 'APPV\'D - NAME', status: 'complete', criticality: 'medium', value: 'M. Johnson' },
        { name: 'APPV\'D - SIGNATURE', status: 'complete', criticality: 'medium', value: '[Present]' },
        { name: 'APPV\'D - DATE', status: 'complete', criticality: 'medium', value: '2026-07-17' },
        { name: 'MATERIAL', status: 'incomplete', criticality: 'critical', value: null },
        { name: 'FINISH', status: 'complete', criticality: 'high', value: 'Anodized Black' },
        { name: 'WEIGHT', status: 'complete', criticality: 'medium', value: '250 g' },
        { name: 'REVISION', status: 'complete', criticality: 'medium', value: 'A' }
      ],
      detectionDetails: {
        vectorGridExtraction: vectorGrid,
        cellReconstruction: 'successful',
        textIntersectionAnalysis: textIntersection,
        ocrValidation: ocrValidation,
        aiCrosscheck: aiCrosscheck
      },
      recommendations: [
        'Fill in DWG NO. - Critical field required for document identification',
        'Add MATERIAL specification - Required for manufacturing',
        'Provide TITLE for drawing context',
        'Obtain DRAWN technician signature'
      ]
    };

    setResults(mockResults);
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
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `API responded with status code ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Header navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white rounded-xl shadow-md shadow-blue-100 border border-slate-100 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" className="w-9 h-9 object-contain" alt="DraftGuard Logo" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
                DraftGuard
              </h1>
              <p className="text-xs text-slate-500 font-medium">Engineering Document QA Suite</p>
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
                <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                {apiOnline ? 'Backend Online' : 'Backend Offline'}
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:static top-[73px] bottom-0 left-0 z-30 w-72 bg-white border-r border-slate-200 p-6 space-y-6 overflow-y-auto transition-transform duration-200 ease-in-out`}>
          
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Navigation</h2>
            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Overview Metrics' },
                { id: 'details', label: 'Field Details' },
                { id: 'settings', label: 'Parameters & Rules' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); }}
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
                        {results.fileName.substring(0, 20)}
                      </div>
                      <div className="grid grid-cols-4 gap-0.5 p-0.5 bg-slate-100">
                        {results.fields.map((field, idx) => {
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
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
          
          {errorMessage && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-800 shadow-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
              <div className="text-sm font-medium">{errorMessage}</div>
            </div>
          )}

          {!results && !analyzing ? (
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
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                  
                  {/* Completeness Score */}
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Completeness Score</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-extrabold text-slate-900">{results.completeness}%</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
                          results.status === 'complete' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {results.status}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 mt-4 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          results.completeness >= 85 
                            ? 'bg-emerald-500' 
                            : results.completeness >= 60 
                            ? 'bg-amber-500' 
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${results.completeness}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Title Block Stats */}
                  <div className="p-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Field Completeness Summary</p>
                    <div className="space-y-2 text-sm font-medium">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Title Fields</span>
                        <span className="text-slate-800 font-bold">{results.titleBlock.totalFields}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Correctly Filled</span>
                        <span className="text-emerald-600 font-bold">{results.titleBlock.filledFields}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Missing/Empty</span>
                        <span className="text-rose-600 font-bold">{results.titleBlock.incompleteFields}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="p-6 flex flex-col justify-center gap-2">
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
              </div>

              {/* Tabs Section */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                <div className="flex border-b border-slate-200 bg-slate-50/50">
                  {[
                    { id: 'overview', label: 'Analysis Recommendations' },
                    { id: 'details', label: 'Field list detailed audit' },
                    { id: 'settings', label: 'Active Parameters' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-4 px-6 text-sm font-bold transition-all border-b-2 ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {/* Overview tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Required Actions & Recommendations</h3>
                        <div className="space-y-3">
                          {results.recommendations.map((rec, i) => (
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
                        <span className="text-xs text-slate-400 font-semibold">{results.fields.length} fields detected</span>
                      </div>
                      
                      <div className="divide-y divide-slate-100">
                        {results.fields.map((field, i) => (
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">Vector Grid Extraction</p>
                            <p className="text-[11px] text-slate-400">Uses PyMuPDF cell boundary lookup</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={vectorGrid} 
                            onChange={(e) => setVectorGrid(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500" 
                          />
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">Text Intersection Analysis</p>
                            <p className="text-[11px] text-slate-400">Maps words to geometric bounding boxes</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={textIntersection} 
                            onChange={(e) => setTextIntersection(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500" 
                          />
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">OCR Text Validation</p>
                            <p className="text-[11px] text-slate-400">Applies optical recognition on cells</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={ocrValidation} 
                            onChange={(e) => setOcrValidation(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500" 
                          />
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">AI Cross-Check</p>
                            <p className="text-[11px] text-slate-400">Claude Vision validation check</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={aiCrosscheck} 
                            onChange={(e) => setAiCrosscheck(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500" 
                          />
                        </div>

                        {/* Template selector */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">Select Bounding Template</p>
                            <p className="text-[11px] text-slate-400">Target specific drawing standard grid definitions</p>
                          </div>
                          <select 
                            value={selectedTemplate} 
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            className="text-xs font-semibold border-slate-200 rounded-lg p-2 bg-white"
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
