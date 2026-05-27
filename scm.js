import React, { useState, useEffect } from 'react';
import {
  Upload, FileText, Database, Calendar,
  ShoppingCart, Layers, Map, ArrowRight,
  CheckSquare, Filter, Download, AlertTriangle,
  Package, Truck, ClipboardList, Globe,
  RefreshCw, Server, CheckCircle, AlertOctagon,
  CloudDownload, FileSpreadsheet, Search,
  Play, Brain, List, RotateCcw
} from 'lucide-react';

// --- Mock Data ---

// Data: SIMPA Products with Prediction
const forecastTableData = [
  { sku: 'SKU-1001', name: 'SIMPA Stainless Steel Built-in Hob HZB62M1', historyAvg: 110, prediction: 450, stock: 120, gap: -330, recommend: 380},
  { sku: 'SKU-1002', name: 'SIMPA Double Burner Built-in Hob WZB62G', historyAvg: 280, prediction: 320, stock: 300, gap: -20, recommend: 60},
  { sku: 'SKU-1003', name: 'SIMPA Double Burner Built-in Hob HZB32G1', historyAvg: 600, prediction: 500, stock: 800, gap: +300, recommend: 0},
  { sku: 'SKU-1004', name: 'SIMPA Built-in Hob HZB31G1', historyAvg: 50, prediction: 200, stock: 50, gap: -150, recommend: 180},
  { sku: 'SKU-1005', name: 'SIMPA Double Burner Built-in Hob SRDB62S', historyAvg: 140, prediction: 160, stock: 150, gap: -10, recommend: 30},
];

// Data: Layout Optimization
const layoutTableData = [
  { id: 'MV-881', sku: 'SKU-1001', name: 'SIMPA Stainless Steel Built-in Hob HZB62M1', abc: 'Class A', current: 'Zone D (Reserve)', target: 'Zone A (Picking)', type: 'Relocation' },
  { id: 'MV-882', sku: 'SKU-1004', name: 'SIMPA Built-in Hob HZB31G1', abc: 'Class A', current: 'Zone C (Reserve)', target: 'Zone A (Picking)', type: 'Replenishment' },
  { id: 'MV-883', sku: 'SKU-1003', name: 'SIMPA Double Burner Built-in Hob HZB32G1', abc: 'Class C', current: 'Zone A (Picking)', target: 'Zone B (Slow)', type: 'Consolidation' },
];

// Data: Picking Path
const pickingTableData = [
  { seq: 1, loc: 'A-01-02', sku: 'SKU-1001', name: 'SIMPA Stainless Steel Built-in Hob HZB62M1', qty: 2, orderId: 'ORD-991' },
  { seq: 2, loc: 'A-02-05', sku: 'SKU-1004', name: 'SIMPA Built-in Hob HZB31G1', qty: 1, orderId: 'ORD-991' },
  { seq: 3, loc: 'B-05-01', sku: 'SKU-1002', name: 'SIMPA Double Burner Built-in Hob WZB62G', qty: 1, orderId: 'ORD-992' },
  { seq: 4, loc: 'C-12-04', sku: 'SKU-1003', name: 'SIMPA Double Burner Built-in Hob HZB32G1', qty: 3, orderId: 'ORD-991' },
];

// Data Management Status
const dataSources = [
  { id: 1, title: "Product Information", type: "Master Data", status: "Synced", lastUpdate: "10 mins ago", icon: Package },
  { id: 2, title: "Sales History", type: "Transaction", status: "Outdated", lastUpdate: "2 days ago", icon: ShoppingCart },
  { id: 3, title: "Inventory & PO", type: "Stock Level", status: "Synced", lastUpdate: "1 hour ago", icon: Truck },
  { id: 4, title: "Promotion Plan", type: "Marketing", status: "Synced", lastUpdate: "1 hour ago", icon: Calendar },
];

export default function SupplyChainAdminPanel() {
  // Default to Forecast as it's the first operational step
  const [activeTab, setActiveTab] = useState('forecast');

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900 p-2 rounded text-white">
              <Package size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">SCM Operation Center</h1>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
            <NavButton
              id="forecast"
              label="Demand & Procurement"
              icon={ShoppingCart}
              active={activeTab}
              onClick={setActiveTab}
            />
            <NavButton
              id="layout"
              label="Layout Optimization"
              icon={Layers}
              active={activeTab}
              onClick={setActiveTab}
            />
            <NavButton
              id="picking"
              label="Picking Path"
              icon={Map}
              active={activeTab}
              onClick={setActiveTab}
            />
            <NavButton
              id="data-mgmt"
              label="Data Management"
              icon={Database}
              active={activeTab}
              onClick={setActiveTab}
            />
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'forecast' && <ForecastModule />}
        {activeTab === 'layout' && <LayoutModule />}
        {activeTab === 'picking' && <PickingModule />}
        {activeTab === 'data-mgmt' && <DataManagementModule />}
      </main>
    </div>
  );
}

// --- Shared Components ---

function NavButton({ id, label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
        active === id 
          ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function TableHeader({ children, align = 'left' }) {
  return (
    <th className={`px-6 py-3 text-${align} text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200`}>
      {children}
    </th>
  );
}

function TableCell({ children, className = "", align = 'left' }) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-b border-gray-100 text-${align} ${className}`}>
      {children}
    </td>
  );
}

function DateRangePicker({ start, end, setStart, setEnd }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-md border border-gray-200">
      <Calendar className="w-4 h-4 text-slate-500" />
      <span className="text-xs font-bold text-slate-500 uppercase">Period:</span>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="bg-white border border-gray-300 rounded text-xs px-2 py-1 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <span className="text-slate-400">-</span>
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="bg-white border border-gray-300 rounded text-xs px-2 py-1 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
    </div>
  );
}

// --- MODULE: Data Management ---

function DataManagementModule() {
  const [isCrawling, setIsCrawling] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [dateRange, setDateRange] = useState({ start: '2023-10-01', end: '2023-12-31' });

  const handleCrawl = () => {
    setIsCrawling(true);
    setCrawlProgress(0);
    const interval = setInterval(() => {
      setCrawlProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCrawling(false);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleFineTune = () => {
    setIsTraining(true);
    setTimeout(() => setIsTraining(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* 1. Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Data Integration Hub</h2>
          <p className="text-sm text-slate-500">Centralized data pipeline for SCM analysis.</p>
        </div>
        <DateRangePicker
          start={dateRange.start}
          end={dateRange.end}
          setStart={(v) => setDateRange({...dateRange, start: v})}
          setEnd={(v) => setDateRange({...dateRange, end: v})}
        />
      </div>

      {/* 2. Data Integration Cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Server size={16} />
          Core Data Sources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dataSources.map((source) => (
            <div key={source.id} className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                    <source.icon size={20} />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${source.status === 'Synced' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {source.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800">{source.title}</h4>
                <p className="text-xs text-slate-500 mt-1">Last updated: {source.lastUpdate}</p>
              </div>
              <div className="p-3 bg-gray-50 grid grid-cols-2 gap-2 mt-auto">
                <button className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white border border-gray-200 rounded text-xs font-medium text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors">
                  <CloudDownload size={14} />
                  API Sync
                </button>
                <button className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white border border-gray-200 rounded text-xs font-medium text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors">
                  <FileSpreadsheet size={14} />
                  Import CSV
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Web Crawler Section */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">E-Commerce Web Crawler</h3>
                <p className="text-xs text-slate-500">Enrich SKU Master (images, specs) from external sites.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-slate-700 text-sm font-medium rounded-md hover:bg-gray-50">
                <List size={16} />
                Import SKU List
              </button>
              <button
                onClick={handleCrawl}
                disabled={isCrawling}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white transition-all ${isCrawling ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {isCrawling ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                {isCrawling ? 'Crawling...' : 'Start Crawler'}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
              <span>Enrichment Progress</span>
              <span>{crawlProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${crawlProgress}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle size={14} className="text-green-500" />
                <span>Found 124 new images</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle size={14} className="text-green-500" />
                <span>Updated 45 descriptions</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Data Health & Fine-tune */}
        <div className="space-y-6">
          {/* Health Check */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                <CheckSquare size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Data Health Check</h3>
                <p className="text-xs text-slate-500">Validation for selected period.</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-md">
                <div className="flex items-center gap-2">
                  <Database size={14} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">Completeness</span>
                </div>
                <span className="text-sm font-bold text-green-700">98.5%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Incomplete Records</span>
                </div>
                <span className="text-sm font-bold text-amber-700">12 SKUs</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertOctagon size={14} className="text-red-600" />
                  <span className="text-sm font-medium text-red-800">Abnormalities</span>
                </div>
                <span className="text-sm font-bold text-red-700">3 Outliers</span>
              </div>
            </div>
          </div>

          {/* Fine-tune Model */}
          <div className="bg-purple-50 rounded-lg border border-purple-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white text-purple-600 rounded-md shadow-sm">
                <Brain size={20} />
              </div>
              <div>
                <h3 className="font-bold text-purple-900">AI Model Fine-tuning</h3>
                <p className="text-xs text-purple-600">Train on selected data.</p>
              </div>
            </div>
            <p className="text-xs text-purple-700 mb-4 leading-relaxed">
              Fine-tune the prediction model using verified data from <span className="font-bold">{dateRange.start}</span> to <span className="font-bold">{dateRange.end}</span>.
            </p>
            <button
              onClick={handleFineTune}
              disabled={isTraining}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {isTraining ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
              {isTraining ? 'Training Model...' : 'Start Fine-tuning'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Demand Forecasting & Procurement
function ForecastModule() {
  const [isRunning, setIsRunning] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-03-31' });

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <ShoppingCart size={24} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-slate-800">Demand Prediction</h2>
                  <p className="text-sm text-slate-500">Generate procurement plans based on historical data.</p>
               </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
               <div className="px-2 border-r border-gray-300">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Prediction Window</p>
                  <DateRangePicker
                    start={dateRange.start}
                    end={dateRange.end}
                    setStart={(v) => setDateRange({...dateRange, start: v})}
                    setEnd={(v) => setDateRange({...dateRange, end: v})}
                  />
               </div>
               <button
                onClick={handleRun}
                disabled={isRunning}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-all flex items-center gap-2"
               >
                  {isRunning ? <RefreshCw size={18} className="animate-spin"/> : <Play size={18} fill="currentColor" />}
                  {isRunning ? 'Running AI...' : 'Run Prediction'}
               </button>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Procurement Recommendation</h3>
            <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-xs font-medium rounded text-gray-700 hover:bg-gray-50">
              <Filter size={14}/> Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700">
              <Download size={14}/> Export POs
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <TableHeader>SKU Details</TableHeader>
                <TableHeader align="right">Hist. Avg (Wk)</TableHeader>
                <TableHeader align="right">AI Prediction</TableHeader>
                <TableHeader align="right">Current Stock</TableHeader>
                <TableHeader align="right">Gap</TableHeader>
                <TableHeader align="right">Procurement Rec.</TableHeader>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {forecastTableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="font-bold text-gray-900">{row.sku}</div>
                    <div className="text-gray-500 text-xs truncate max-w-[200px]" title={row.name}>{row.name}</div>
                  </TableCell>
                  <TableCell align="right" className="text-gray-400">{row.historyAvg}</TableCell>
                  <TableCell align="right">
                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                      {row.prediction}
                    </span>
                  </TableCell>
                  <TableCell align="right">{row.stock}</TableCell>
                  <TableCell align="right">
                    <span className={row.gap < 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                      {row.gap > 0 ? `+${row.gap}` : row.gap}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    {row.recommend > 0 ? (
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                        {row.recommend} Units
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Warehouse Layout Optimization
function LayoutModule() {
  const [isRunning, setIsRunning] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-03-31' });

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Layers size={24} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-slate-800">Layout Optimization</h2>
                  <p className="text-sm text-slate-500">Re-slotting logic based on sales velocity.</p>
               </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
               <div className="px-2 border-r border-gray-300">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Analysis Period</p>
                  <DateRangePicker
                    start={dateRange.start}
                    end={dateRange.end}
                    setStart={(v) => setDateRange({...dateRange, start: v})}
                    setEnd={(v) => setDateRange({...dateRange, end: v})}
                  />
               </div>
               <button
                onClick={handleRun}
                disabled={isRunning}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm transition-all flex items-center gap-2"
               >
                  {isRunning ? <RefreshCw size={18} className="animate-spin"/> : <Play size={18} fill="currentColor" />}
                  {isRunning ? 'Optimizing...' : 'Run Optimization'}
               </button>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Layout Tasks</h3>
            <p className="text-xs text-gray-500">Generated moves to optimize picking efficiency.</p>
          </div>
          <button className="px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded hover:bg-slate-700">
            Print Task List
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <TableHeader>Task ID</TableHeader>
                <TableHeader>SKU</TableHeader>
                <TableHeader>ABC Class</TableHeader>
                <TableHeader>Move From</TableHeader>
                <TableHeader>Move To</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader align="center">Action</TableHeader>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {layoutTableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <TableCell><span className="font-mono text-xs text-gray-400">{row.id}</span></TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900 truncate max-w-[200px]" title={row.name}>{row.name}</div>
                    <div className="text-gray-400 text-xs">{row.sku}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${row.abc === 'Class A' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {row.abc}
                    </span>
                  </TableCell>
                  <TableCell><span className="text-gray-600">{row.current}</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ArrowRight size={14} className="text-gray-300"/>
                      <span className="text-green-700 font-medium">{row.target}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded">{row.type}</span></TableCell>
                  <TableCell align="center">
                    <button className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors">
                      <CheckSquare size={18} />
                    </button>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Picking Path Optimization
function PickingModule() {
  // Start with 'done' to show the example table immediately
  const [step, setStep] = useState('done'); // idle -> retrieved -> optimizing -> done

  const handleRetrieve = () => {
    setStep('retrieving');
    setTimeout(() => setStep('retrieved'), 1000);
  };

  const handleOptimize = () => {
    setStep('optimizing');
    setTimeout(() => setStep('done'), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Map size={24} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-slate-800">Picking Path Optimization</h2>
                  <p className="text-sm text-slate-500">TSP Algorithm for minimum travel distance.</p>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <button
                onClick={handleRetrieve}
                disabled={step === 'retrieving' || step === 'optimizing'}
                className={`px-4 py-2 border border-gray-300 text-slate-700 font-medium rounded-md shadow-sm transition-all flex items-center gap-2 hover:bg-gray-50 ${step === 'retrieving' || step === 'optimizing' ? 'opacity-50 cursor-not-allowed' : ''}`}
               >
                  {step === 'retrieving' ? <RefreshCw size={16} className="animate-spin"/> : <RotateCcw size={16} />}
                  Retrieve Unpicked Orders
               </button>

               <div className="h-8 w-px bg-gray-300 mx-2"></div>

               <button
                onClick={handleOptimize}
                disabled={step !== 'retrieved'}
                className={`px-6 py-2 font-medium rounded-md shadow-sm transition-all flex items-center gap-2 ${step === 'retrieved' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
               >
                  {step === 'optimizing' ? <RefreshCw size={18} className="animate-spin"/> : <Play size={18} fill="currentColor" />}
                  Generate Picking Path
               </button>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Optimized Sequence</h3>
            <p className="text-xs text-gray-500">
              {step === 'done' ? 'Path optimized successfully.' : 'Waiting for optimization...'}
            </p>
          </div>
          {step === 'done' && (
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">Batch #2024-10-A</div>
              <div className="text-xs text-green-600">Optimization Score: 98%</div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <TableHeader align="center">Seq</TableHeader>
                <TableHeader>Bin Location</TableHeader>
                <TableHeader>SKU</TableHeader>
                <TableHeader align="right">Qty</TableHeader>
                <TableHeader>Order Ref</TableHeader>
                <TableHeader align="center">Check</TableHeader>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {step === 'done' ? (
                pickingTableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition-colors group">
                    <TableCell align="center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                        {row.seq}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-bold text-lg text-slate-800">{row.loc}</span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900 truncate max-w-[200px]" title={row.name}>{row.name}</div>
                      <div className="text-gray-400 text-xs">{row.sku}</div>
                    </TableCell>
                    <TableCell align="right">
                      <span className="font-bold text-gray-900">{row.qty}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{row.orderId}</span>
                    </TableCell>
                    <TableCell align="center">
                      <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </TableCell>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 bg-gray-50">
                    {step === 'idle' && "Click 'Retrieve Unpicked Orders' to start."}
                    {step === 'retrieving' && "Retrieving orders from database..."}
                    {step === 'retrieved' && "Orders retrieved. Click 'Generate Picking Path' to optimize."}
                    {step === 'optimizing' && "Calculating optimal route (TSP)..."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}