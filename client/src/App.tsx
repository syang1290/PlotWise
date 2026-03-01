import React, { useState } from 'react';
import { MapPin, Search, Accessibility, ChevronRight, Clock, Scale, Sparkles, ShieldCheck, X, Home, Users, Loader2, MessageSquare, Send, Download, FileText, Info } from 'lucide-react';
import MapView from './components/MapView';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://plotwise.onrender.com'
  : 'http://localhost:8000';

function App() {
  const [activeAnalysis, setActiveAnalysis] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [coordinates, setCoordinates] = useState<{longitude: number, latitude: number} | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [actionDetails, setActionDetails] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    setPropertyData(null);
    setChatAnswer('');
    try {
      const geoRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}`);
      const geoData = await geoRes.json();
      if (geoData.features?.length > 0) {
        const [lng, lat] = geoData.features[0].center;
        setCoordinates({ longitude: lng, latitude: lat });
      }
      const res = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: searchQuery }),
      });
      if (res.ok) {
        const data = await res.json();
        setPropertyData(data);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleActionClick = async (action: string) => {
    setSelectedAction(action);
    setIsActionLoading(true);
    setActionDetails(null);
    try {
      const response = await fetch('http://localhost:8000/api/action-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: propertyData.address, action: action }),
      });
      if (response.ok) setActionDetails(await response.json());
    } catch (e) { console.error(e); } finally { setIsActionLoading(false); }
  };

  const handleChat = async () => {
    if (!chatMessage || !propertyData) return;
    setIsChatLoading(true);
    setChatAnswer(''); 
    setShowChat(true); 
    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: propertyData.address, 
          zoning_code: propertyData.zoning_code, 
          message: chatMessage 
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatAnswer(data.answer); 
        setChatMessage(''); 
      }
    } catch (e) { console.error(e); } finally { setIsChatLoading(false); }
  };

  const downloadPDF = async () => {
    const element = document.getElementById('full-report-template');
    if (!element || !propertyData || isLoading) return;
    setIsDownloading(true);
    try {
      element.style.display = 'block';
      element.style.position = 'fixed';
      element.style.left = '-9999px';
      const dataUrl = await toPng(element, { quality: 1, backgroundColor: '#ffffff', width: 800 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PlotWise_Analysis_${propertyData.address.replace(/\s+/g, '_')}.pdf`);
    } catch (error) { 
      console.error(error); 
      alert("Export failed. Please try again.");
    } finally { 
      element.style.display = 'none';
      setIsDownloading(false); 
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden antialiased text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');`}
      </style>
      <div className="relative flex-1 bg-slate-200">
        <div className="absolute top-6 left-6 z-10 w-[400px]">
          <div className="bg-white rounded-lg shadow-sm border border-slate-300 flex items-center p-1">
            <Search className="ml-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter Address..." 
              className="flex-1 bg-transparent outline-none px-3 py-2 text-sm font-medium"
            />
            <button 
              onClick={handleSearch} disabled={isLoading} 
              className="px-5 py-2 rounded-md bg-slate-900 text-white text-xs font-extrabold hover:bg-black transition-all uppercase tracking-tighter"
            >
              {isLoading ? '...' : 'Search'}
            </button>
          </div>
        </div>
        <div className="h-full w-full"><MapView coordinates={coordinates} /></div>
        {propertyData && (
          <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col items-center">
            {showChat && chatAnswer && (
              <div className="mb-4 w-full max-w-2xl bg-white p-6 rounded-xl border border-slate-200 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-[11px] font-extrabold uppercase tracking-widest">AI Intelligence Response</span>
                  </div>
                  <button onClick={() => setShowChat(false)}><X className="h-4 w-4 text-slate-400" /></button>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-semibold tracking-tight">{chatAnswer}</p>
              </div>
            )}
            <div className="w-full max-w-xl relative">
              <input 
                type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                placeholder="Ask technical parcel questions..."
                className="w-full py-5 pl-6 pr-14 rounded-xl bg-white shadow-2xl border border-slate-200 outline-none text-sm font-semibold tracking-tight"
              />
              <button onClick={handleChat} disabled={isChatLoading} className="absolute right-2.5 top-2.5 bottom-2.5 px-4 bg-slate-900 text-white rounded-lg hover:bg-black transition-colors">
                {isChatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-[480px] bg-white flex flex-col border-l border-slate-200 overflow-hidden shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.03)]">
        <header className="p-10 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <FileText className="text-slate-900 h-5 w-5" />
              <h1 className="text-2xl font-extrabold tracking-tighter text-slate-900 uppercase">PlotWise</h1>
            </div>
            <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-[0.25em]">Registry System v2.0</p>
          </div>
          {propertyData && (
            <button 
              onClick={downloadPDF} disabled={isDownloading}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 rounded-md text-[10px] font-extrabold text-white hover:bg-black transition-all tracking-widest"
            >
              {isDownloading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
              EXPORT
            </button>
          )}
        </header>

        <nav className="flex px-10 bg-white border-b border-slate-100">
          {['Overview', 'Zoning (ADU)', 'Inclusivity'].map(tab => (
            <button 
              key={tab} onClick={() => setActiveAnalysis(tab)} 
              className={`py-5 px-4 text-[11px] font-extrabold uppercase tracking-widest transition-all border-b-[3px] ${activeAnalysis === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-300 hover:text-slate-500'}`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <main id="report-content" className="flex-1 overflow-y-auto p-10 space-y-10 bg-white">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-5">
              <Loader2 className="h-7 w-7 text-slate-900 animate-spin" />
              <p className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest">Compiling Parcel Records</p>
            </div>
          ) : propertyData ? (
            <div className="animate-in fade-in duration-500 space-y-12">
              {activeAnalysis === 'Overview' && (
                <div className="space-y-8">
                  <div className="p-8 bg-slate-900 rounded-xl text-white shadow-xl">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Primary Target Address</p>
                    <h2 className="text-3xl font-extrabold mb-6 tracking-tighter leading-none">{propertyData.address}</h2>
                    <p className="text-[15px] text-slate-300 leading-relaxed font-semibold tracking-tight">{propertyData.summary}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">Zoning Designation</p>
                      <p className="text-xl font-extrabold text-slate-900 tracking-tighter">{propertyData.zoning_code}</p>
                    </div>
                    <div className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">Success Metric</p>
                      <p className="text-xl font-extrabold text-slate-900 tracking-tighter">{propertyData.development_potential}</p>
                    </div>
                  </div>
                  <div className="space-y-4 pt-4">
                    <p className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest mb-6">Strategic Feasibility Tasks</p>
                    {propertyData.suggested_actions?.map((action: string) => (
                      <button 
                        key={action} onClick={() => handleActionClick(action)}
                        className="w-full p-5 border border-slate-100 bg-slate-50 rounded-xl flex items-center justify-between hover:border-slate-900 transition-all group"
                      >
                        <span className="text-sm font-extrabold text-slate-700 tracking-tight">{action}</span>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {activeAnalysis === 'Zoning (ADU)' && (
                <div className="space-y-6">
                  <div className="p-8 border-2 border-slate-900 rounded-xl bg-white shadow-sm">
                    <h3 className="text-[11px] font-extrabold text-slate-900 mb-8 uppercase tracking-widest">Technical Constraints</h3>
                    <div className="grid grid-cols-2 gap-10">
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Max Elevation</p>
                        <p className="text-xl font-extrabold text-slate-900 tracking-tighter">{propertyData.zoning_details?.max_height || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Floor Area Ratio</p>
                        <p className="text-xl font-extrabold text-slate-900 tracking-tighter">{propertyData.zoning_details?.lot_coverage || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 border border-slate-100 bg-slate-50 rounded-xl">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Regulatory Narrative</p>
                    <p className="text-[15px] text-slate-700 leading-relaxed font-semibold tracking-tight">{propertyData.zoning_details?.adu_notes}</p>
                  </div>
                </div>
              )}
              {activeAnalysis === 'Inclusivity' && (
                <div className="space-y-8">
                  <div className="p-8 border border-slate-200 rounded-xl bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest">Mobility Quotient</h3>
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tighter">{propertyData.inclusivity_details?.walk_score || propertyData.inclusivity_score}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-slate-900 h-full" style={{ width: `${propertyData.inclusivity_score}%` }}></div>
                    </div>
                  </div>
                  <div className="p-8 border border-slate-100 bg-slate-50 rounded-xl">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Terrain Profile</p>
                    <p className="text-lg font-extrabold text-slate-900 tracking-tighter">{propertyData.inclusivity_details?.topography || 'Standard'}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <MapPin className="h-12 w-12 mb-5" />
              <p className="text-[11px] font-extrabold uppercase tracking-[0.3em]">Initialize Parcel Logic</p>
            </div>
          )}
        </main>

        <footer className="p-8 border-t border-slate-100 bg-white flex items-center justify-between">
          <span className="text-[9px] font-extrabold text-slate-300 uppercase tracking-[0.4em]">Official System Registry</span>
          <ShieldCheck className="h-4 w-4 text-slate-200" />
        </footer>

        {selectedAction && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-10">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-sm flex flex-col max-h-[75vh]">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-900">Execution Protocol</h3>
                <button onClick={() => setSelectedAction(null)}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <div className="overflow-y-auto p-8 space-y-5">
                {isActionLoading ? (
                   <div className="py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-900" /></div>
                ) : (
                  actionDetails?.steps.map((step: string, i: number) => (
                    <div key={i} className="flex gap-5 p-6 border border-slate-100 bg-slate-50 rounded-xl">
                      <span className="text-[11px] font-extrabold text-slate-400">{i+1}</span>
                      <p className="text-sm font-semibold text-slate-700 leading-normal tracking-tight">{step}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-8 border-t border-slate-100">
                <button onClick={() => setSelectedAction(null)} className="w-full py-4 bg-slate-900 text-white text-[11px] font-extrabold uppercase tracking-widest rounded-lg">Confirm Protocol</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {propertyData && (
        <div id="full-report-template" style={{ display: 'none', width: '800px', padding: '60px', backgroundColor: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div style={{ borderBottom: '4px solid #0f172a', paddingBottom: '40px', marginBottom: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '-1px' }}>Technical Analysis</h1>
              <p style={{ color: '#64748b', margin: 0, fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>Parcel Registry Data</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0', fontSize: '18px', letterSpacing: '-0.5px' }}>{propertyData.address}</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, fontWeight: '800', textTransform: 'uppercase' }}>Stamp: {propertyData.last_updated}</p>
            </div>
          </div>

          <section style={{ marginBottom: '50px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '20px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '2px' }}>Operational Summary</h2>
            <div style={{ border: '2px solid #f1f5f9', padding: '30px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
              <p style={{ fontSize: '15px', lineHeight: '1.8', color: '#334155', margin: 0, fontWeight: '600' }}>{propertyData.summary}</p>
            </div>
          </section>

          <section style={{ marginBottom: '50px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div style={{ border: '2px solid #f1f5f9', padding: '30px', borderRadius: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>Inclusivity Ranking</p>
                <p style={{ fontSize: '38px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-2px' }}>{propertyData.inclusivity_score}<span style={{ fontSize: '18px', color: '#cbd5e1' }}>%</span></p>
              </div>
              <div style={{ border: '2px solid #f1f5f9', padding: '30px', borderRadius: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>Feasibility Scale</p>
                <p style={{ fontSize: '38px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-2px' }}>{propertyData.development_potential}</p>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '50px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '20px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '2px' }}>Technical Specs</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '20px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#64748b', fontWeight: '700' }}>Zoning Code ID</td>
                  <td style={{ padding: '20px 0', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#0f172a', fontWeight: '800', textAlign: 'right' }}>{propertyData.zoning_code}</td>
                </tr>
                <tr>
                  <td style={{ padding: '20px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#64748b', fontWeight: '700' }}>Max Vertical Limit</td>
                  <td style={{ padding: '20px 0', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#0f172a', fontWeight: '800', textAlign: 'right' }}>{propertyData.zoning_details?.max_height}</td>
                </tr>
                <tr>
                  <td style={{ padding: '20px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#64748b', fontWeight: '700' }}>Parcel Coverage Cap</td>
                  <td style={{ padding: '20px 0', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#0f172a', fontWeight: '800', textAlign: 'right' }}>{propertyData.zoning_details?.lot_coverage}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <footer style={{ marginTop: '80px', borderTop: '2px solid #f1f5f9', paddingTop: '30px', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '4px' }}>Automated Analysis System • PlotWise</p>
          </footer>
        </div>
      )}
    </div>
  );
}

export default App;