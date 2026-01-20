import React from 'react';
import { FileText, Download, Share2, Printer, BarChart3, PieChart, TrendingUp } from 'lucide-react';

export const Reports = () => {
  const reports = [
    { title: 'Monthly Efficiency Analysis', date: 'Jan 2026', size: '2.4 MB', type: 'PDF' },
    { title: 'Degradation Forecast Model', date: 'Jan 2026', size: '15.1 MB', type: 'CSV' },
    { title: 'Maintenance & Cleaning Schedule', date: 'Dec 2025', size: '1.2 MB', type: 'PDF' },
    { title: 'ROI Projection 2026-2030', date: 'Dec 2025', size: '3.8 MB', type: 'XLSX' },
  ];

  return (
    <div className="p-8 min-h-full bg-slate-950 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Generated Reports</h1>
          <p className="text-slate-400 mt-1">AI-driven insights and system performance documents</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-900/20">
          <FileText className="w-5 h-5" />
          Generate New Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Reports List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Recent Documents</h3>
          {reports.map((report, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-slate-900 border border-slate-800 rounded-2xl group hover:border-blue-500/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                  <FileText className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 group-hover:text-white">{report.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>{report.date}</span>
                    <span>•</span>
                    <span className="uppercase">{report.type}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white" title="Download">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white" title="Share">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Side Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-500/20 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Efficiency Forecast
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="text-sm text-slate-400">Current</div>
                <div className="text-2xl font-bold text-white">94.2%</div>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-[94%] bg-blue-500 rounded-full" />
              </div>
              <div className="flex justify-between items-end mt-2">
                <div className="text-sm text-slate-400">Predicted (1 Yr)</div>
                <div className="text-2xl font-bold text-slate-300">92.8%</div>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-[92%] bg-slate-500 rounded-full" />
              </div>
              <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                Deep learning model predicts a 1.4% degradation based on current environmental factors and cleaning frequency.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4">Export Options</h3>
            <div className="grid grid-cols-2 gap-3">
               <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors text-center">
                 Download All
               </button>
               <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors text-center">
                 Print Summary
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
