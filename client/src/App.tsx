import React, { useState } from 'react';
import { MapPin, Search, Accessibility, ChevronRight, Clock, Scale, Sparkles, ShieldCheck } from 'lucide-react';
import MapView from './components/MapView';

function App() {
  const [activeAnalysis, setActiveAnalysis] = useState('Overview');

  return (
    <div className="flex h-screen w-full bg-[#f4f7fa] overflow-hidden text-[#2d3748]">
      <div className="relative flex-1 bg-[#e2e8f0]">
        <div className="absolute top-8 left-8 z-10 w-[440px] space-y-4">
          <div className="bg-white p-2.5 rounded-[2rem] shadow-lg shadow-indigo-900/5 border border-white flex items-center gap-2">
            <div className="relative flex items-center flex-1"> 
              <Search className="absolute left-4 h-5 w-5 text-indigo-400" />
              <input 
                type="text" 
                placeholder="Search by address or APN..." 
                className="w-full pl-12 pr-4 py-2.5 rounded-full border-none bg-transparent focus:ring-0 outline-none text-sm text-indigo-950 placeholder:text-slate-400"
              />
            </div>
            <button className="px-6 py-2.5 rounded-full bg-[#4b3e99] text-white text-sm font-medium hover:bg-[#3a2e7a] transition-all shadow-md shadow-indigo-900/20">
              Search
            </button>
          </div>
          
          <div className="flex gap-2 pl-2">
            {['Zoning', 'Terrain', 'Market'].map((filter) => (
              <button key={filter} className="px-5 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-white/50 shadow-sm text-xs font-medium text-indigo-800 hover:bg-white transition-all hover:text-cyan-600">
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-full w-full">
          <MapView />
        </div>
      </div>

      <div className="w-[500px] bg-white flex flex-col shadow-2xl z-20 rounded-l-[2rem] border-l border-white overflow-hidden">
        <header className="px-10 pt-10 pb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-400 to-cyan-500 p-2.5 rounded-2xl shadow-lg shadow-cyan-200">
                <MapPin className="text-white h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-[#2d255e]">Plotwise</h1>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full">
              <Sparkles className="h-3.5 w-3.5" /> AI Assistant
            </span>
          </div>
          <p className="text-[#718096] text-sm mt-3">Simplifying property due diligence and zoning insights.</p>
        </header>

        <nav className="px-10 flex gap-6 border-b border-gray-100">
          {['Overview', 'Zoning (ADU)', 'Inclusivity'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveAnalysis(tab)}
              className={`pb-4 text-sm font-medium transition-all relative ${activeAnalysis === tab ? 'text-[#4b3e99]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab}
              {activeAnalysis === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#4b3e99] rounded-t-full" />}
            </button>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto p-10 space-y-8">
          <section className="relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br from-[#4b3e99] to-[#2d255e] text-white shadow-xl shadow-indigo-900/10">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                  <Accessibility className="h-5 w-5 text-cyan-300" />
                </div>
                <span className="text-sm font-medium text-indigo-200">Selected Property</span>
              </div>
              <h2 className="text-3xl font-semibold mb-1">123 Maple Street</h2>
              <p className="text-indigo-200 text-sm mb-8">Irvine, CA 92612 • Residential Single-Family</p>
              
              <div className="flex flex-col gap-5">
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs font-medium text-indigo-100">Inclusivity Score</p>
                    <p className="text-base font-bold text-cyan-300">94/100</p>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-2">
                    <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs font-medium text-indigo-100">Development Potential</p>
                    <p className="text-base font-bold text-pink-300">High</p>
                  </div>
                  <div className="flex gap-1.5 h-2">
                    <div className="flex-1 bg-pink-400 rounded-full"></div>
                    <div className="flex-1 bg-pink-400 rounded-full"></div>
                    <div className="flex-1 bg-pink-400 rounded-full"></div>
                    <div className="flex-1 bg-black/20 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl"></div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="group p-6 rounded-[1.5rem] border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-lg hover:shadow-indigo-900/5 transition-all cursor-pointer">
              <Clock className="h-6 w-6 text-indigo-300 mb-3 group-hover:text-[#4b3e99] transition-colors" />
              <h3 className="text-xs font-medium text-gray-500 mb-1">Last Updated</h3>
              <p className="font-semibold text-[#2d255e]">Feb 27, 2026</p>
            </div>
            <div className="group p-6 rounded-[1.5rem] border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-lg hover:shadow-indigo-900/5 transition-all cursor-pointer">
              <Scale className="h-6 w-6 text-indigo-300 mb-3 group-hover:text-[#4b3e99] transition-colors" />
              <h3 className="text-xs font-medium text-gray-500 mb-1">Zoning Code</h3>
              <p className="font-semibold text-[#2d255e]">R-1-C (Modified)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-3 pl-1">
              <h3 className="text-sm font-semibold text-[#2d255e]">Suggested Actions</h3>
              <ShieldCheck className="h-4 w-4 text-cyan-500" />
            </div>
            {[
              "Analyze ADU Feasibility",
              "Review ADA Compliance Paths",
              "Title & Lien Risk Assessment"
            ].map((action) => (
              <button key={action} className="w-full p-4 bg-white border border-gray-100 rounded-[1.5rem] text-left hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between group">
                <span className="text-sm font-medium text-gray-700 group-hover:text-[#4b3e99]">{action}</span>
                <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-[#4b3e99] transition-colors">
                  <ChevronRight className="h-4 w-4 text-indigo-400 group-hover:text-white" />
                </div>
              </button>
            ))}
          </div>
        </main>

        <footer className="p-8 bg-white flex items-center justify-between mt-auto">
          <span className="text-xs font-medium text-gray-400">Powered by First American</span>
        </footer>
      </div>
    </div>
  );
}

export default App;