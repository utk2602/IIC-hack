import React from 'react';
import { 
  Activity, 
  Zap, 
  Battery, 
  AlertTriangle, 
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2
} from 'lucide-react';

export const Dashboard = () => {
  const stats = [
    { label: 'Total Energy Generation', value: '1.2 MWh', change: '+12.5%', trend: 'up', icon: Zap, color: 'blue' },
    { label: 'System Efficiency', value: '94.2%', change: '-0.8%', trend: 'down', icon: Activity, color: 'green' },
    { label: 'Active Panels', value: '48/48', change: '100%', trend: 'neutral', icon: CheckCircle2, color: 'indigo' },
    { label: 'Battery Status', value: '87%', change: '+45 min', trend: 'up', icon: Battery, color: 'amber' },
  ];

  return (
    <div className="p-8 space-y-8 min-h-full bg-slate-950 text-white overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Dashboard</h1>
          <p className="text-slate-400 mt-1">Real-time performance monitoring and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-green-400">System Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-500/10`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-400' : stat.trend === 'down' ? 'text-red-400' : 'text-slate-400'
              }`}>
                {stat.change}
                {stat.trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
                {stat.trend === 'down' && <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-slate-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart Placeholder */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Energy Production</h3>
            <select className="bg-slate-800 border-none text-sm rounded-lg px-3 py-1 text-slate-300 focus:ring-2 focus:ring-blue-500">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
            <p className="text-slate-500">Interactive Chart Component Placeholder</p>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6">System Alerts</h3>
          <div className="space-y-4">
            {[
              { title: 'Efficiency Drop Detected', desc: 'Panel group B2 showing 5% deviation', type: 'warning', time: '2h ago' },
              { title: 'Cleaning Scheduled', desc: 'Automated cleaning sequence initiating', type: 'info', time: '5h ago' },
              { title: 'Inverter Sync', desc: 'Main inverter synchronized with grid', type: 'success', time: '12h ago' },
            ].map((alert, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className={`mt-1 h-2 w-2 rounded-full ${
                  alert.type === 'warning' ? 'bg-amber-500' : 
                  alert.type === 'info' ? 'bg-blue-500' : 'bg-green-500'
                }`} />
                <div>
                  <h4 className="font-medium text-slate-200">{alert.title}</h4>
                  <p className="text-sm text-slate-400 mt-1">{alert.desc}</p>
                  <span className="text-xs text-slate-500 mt-2 block">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
