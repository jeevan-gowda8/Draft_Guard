import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, TrendingUp, FileText, Download, Settings, Menu, X } from 'lucide-react';

export default function IncompleteFormDetector() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef(null);

  const mockAnalyzeFile = async (file) => {
    setAnalyzing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults = {
      fileName: file.name,
      completeness: 72,
      status: 'incomplete',
      timestamp: new Date().toLocaleString(),
      titleBlock: {
        totalFields: 23,
        filledFields: 16,
        incompleteFields: 7,
        criticalFields: ['DRAWN-NAME', 'DRAWN-DATE', 'CHK\'D-SIGNATURE', 'MATERIAL', 'FINISH', 'TITLE', 'DWG NO.']
      },
      detectionMethod: 'Vector Geometry + Text Intersection Analysis',
      confidenceScore: 94.2,
      fields: [
        { name: 'DWG NO.', status: 'incomplete', criticality: 'critical', value: null },
        { name: 'TITLE', status: 'incomplete', criticality: 'critical', value: null },
        { name: 'DRAWN - NAME', status: 'incomplete', criticality: 'high', value: null },
        { name: 'DRAWN - SIGNATURE', status: 'incomplete', criticality: 'high', value: null },
        { name: 'DRAWN - DATE', status: 'incomplete', criticality: 'high', value: null },
        { name: 'CHK\'D - NAME', status: 'complete', criticality: 'high', value: 'J. Smith' },
        { name: 'CHK\'D - SIGNATURE', status: 'incomplete', criticality: 'high', value: null },
        { name: 'CHK\'D - DATE', status: 'complete', criticality: 'high', value: '2024-01-15' },
        { name: 'APPV\'D - NAME', status: 'complete', criticality: 'medium', value: 'M. Johnson' },
        { name: 'APPV\'D - SIGNATURE', status: 'complete', criticality: 'medium', value: '[Present]' },
        { name: 'APPV\'D - DATE', status: 'complete', criticality: 'medium', value: '2024-01-16' },
        { name: 'MFG - NAME', status: 'complete', criticality: 'low', value: 'T. Brown' },
        { name: 'MFG - SIGNATURE', status: 'complete', criticality: 'low', value: '[Present]' },
        { name: 'MFG - DATE', status: 'complete', criticality: 'low', value: '2024-01-17' },
        { name: 'Q.A - NAME', status: 'complete', criticality: 'low', value: 'S. Wilson' },
        { name: 'Q.A - SIGNATURE', status: 'complete', criticality: 'low', value: '[Present]' },
        { name: 'Q.A - DATE', status: 'complete', criticality: 'low', value: '2024-01-18' },
        { name: 'MATERIAL', status: 'incomplete', criticality: 'critical', value: null },
        { name: 'FINISH', status: 'incomplete', criticality: 'high', value: null },
        { name: 'WEIGHT', status: 'complete', criticality: 'medium', value: '250 g' },
        { name: 'REVISION', status: 'complete', criticality: 'medium', value: 'A' },
        { name: 'SCALE', status: 'complete', criticality: 'low', value: '1:2' },
        { name: 'SHEET', status: 'complete', criticality: 'low', value: '1 OF 1' }
      ],
      detectionDetails: {
        vectorGridExtraction: true,
        cellReconstruction: 'successful',
        textIntersectionAnalysis: true,
        ocrValidation: false,
        aiCrosscheck: false
      },
      recommendations: [
        'Fill in DWG NO. - Critical field required for document identification',
        'Add MATERIAL specification - Required for manufacturing',
        'Provide TITLE for drawing context',
        'Obtain DRAWN technician signature and name',
        'Complete FINISH specification',
        'Obtain CHK\'D technician signature'
      ]
    };

    setResults(mockResults);
    setAnalyzing(false);
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      mockAnalyzeFile(uploadedFile);
    }
  };

  const downloadReport = () => {
    if (!results) return;
    const jsonReport = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonReport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${results.fileName.replace('.pdf', '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const FieldRow = ({ field }) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          {field.status === 'complete' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <div>
            <p className="font-medium text-gray-900">{field.name}</p>
            <p className="text-sm text-gray-500">
              Criticality: <span className="font-medium capitalize">{field.criticality}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="text-right">
        {field.value ? (
          <p className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded">{field.value}</p>
        ) : (
          <p className="text-sm text-red-600 font-medium">Missing</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Form Completeness Detector</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 bg-white border-r border-gray-200 p-6 space-y-6`}>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Navigation</h2>
            <nav className="space-y-2">
              {['overview', 'details', 'settings'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    activeTab === tab
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {results && (
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Document Info</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">File</p>
                  <p className="font-medium text-gray-900 truncate">{results.fileName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Detection Method</p>
                  <p className="font-medium text-gray-900 text-xs">{results.detectionMethod}</p>
                </div>
                <div>
                  <p className="text-gray-600">Confidence</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-green-600 h-full" style={{ width: `${results.confidenceScore}%` }}></div>
                    </div>
                    <p className="font-medium text-gray-900">{results.confidenceScore}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {!results ? (
            // Upload Section
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Upload Area */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-12 text-center cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-6">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload PDF Drawing</h2>
                  <p className="text-gray-600 mb-4">Drag and drop your engineering drawing PDF or click to browse</p>
                  <p className="text-sm text-gray-500">Supports CAD-exported, born-digital, and scanned PDFs</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-6 px-8 py-8 bg-gray-50 border-t border-gray-200">
                  {[
                    { icon: TrendingUp, title: 'Vector Analysis', desc: 'Geometry-based detection' },
                    { icon: AlertCircle, title: 'Smart Detection', desc: 'AI-powered validation' },
                    { icon: Download, title: 'Export Reports', desc: 'JSON/PDF formats' }
                  ].map((feature, i) => (
                    <div key={i} className="text-center">
                      <feature.icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium text-gray-900">{feature.title}</p>
                      <p className="text-xs text-gray-500">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3">Detection Methods</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ Vector geometry reconstruction</li>
                    <li>✓ Text intersection analysis</li>
                    <li>✓ Raster/OCR processing</li>
                    <li>✓ Template matching</li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3">Supported Formats</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ AcroForm fillable PDFs</li>
                    <li>✓ CAD-exported drawings</li>
                    <li>✓ Scanned documents</li>
                    <li>✓ Mixed content PDFs</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            // Results Section
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Status Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                  <div className="p-6 border-r border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Completeness Score</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold text-gray-900">{results.completeness}%</span>
                      <p className="text-sm text-gray-500 mb-1">{results.status}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
                      <div 
                        className={`h-full transition-all ${results.completeness >= 80 ? 'bg-green-600' : results.completeness >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${results.completeness}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="p-6 border-r border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Title Block Summary</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Fields:</span>
                        <span className="font-medium text-gray-900">{results.titleBlock.totalFields}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Filled:</span>
                        <span className="font-medium text-green-600">{results.titleBlock.filledFields}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Incomplete:</span>
                        <span className="font-medium text-red-600">{results.titleBlock.incompleteFields}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <button
                      onClick={downloadReport}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Report
                    </button>
                    <button
                      onClick={() => { setResults(null); setFile(null); setSidebarOpen(true); }}
                      className="w-full mt-2 bg-gray-100 text-gray-900 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                    >
                      Analyze Another
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200">
                  {['overview', 'details', 'settings'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                        activeTab === tab
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Critical Issues</h3>
                        <div className="space-y-2">
                          {results.recommendations.map((rec, i) => (
                            <div key={i} className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-red-800">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'details' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Field Analysis</h3>
                      {results.fields.map((field, i) => (
                        <FieldRow key={i} field={field} />
                      ))}
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Detection Parameters</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">Vector Grid Extraction</span>
                          <div className="w-12 h-7 bg-green-500 rounded-full flex items-center pl-1">
                            <div className="w-6 h-6 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">Text Intersection Analysis</span>
                          <div className="w-12 h-7 bg-green-500 rounded-full flex items-center pl-1">
                            <div className="w-6 h-6 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">OCR Validation</span>
                          <div className="w-12 h-7 bg-gray-300 rounded-full flex items-center justify-end pr-1">
                            <div className="w-6 h-6 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">AI Cross-Check</span>
                          <div className="w-12 h-7 bg-gray-300 rounded-full flex items-center justify-end pr-1">
                            <div className="w-6 h-6 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        Detection Method: <span className="font-medium">{results.detectionMethod}</span>
                      </p>
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
