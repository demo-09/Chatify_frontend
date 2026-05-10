import { useEffect } from "react";
import { Users, MessageSquare, Camera, CircleDashed, Activity, DollarSign, Zap, Loader2 } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { useAdminStore } from "../store/useAdminStore";

const DashboardHome = () => {
  const { stats, fetchStats, isLoadingStats } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoadingStats || !stats) {
    return (
      <div className="min-h-full flex items-center justify-center relative z-10">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const overviewStats = [
    { label: "Total Users", value: stats.totalUsers, change: "+14%", icon: Users, color: "from-blue-500 to-indigo-500" },
    { label: "Total Messages", value: stats.totalMessages, change: "+22%", icon: MessageSquare, color: "from-purple-500 to-accent" },
    { label: "Messages (24h)", value: stats.recentMessages, change: "+45%", icon: Zap, color: "from-pink-500 to-rose-500" },
    { label: "Story Uploads", value: stats.totalStories, change: "+12%", icon: CircleDashed, color: "from-amber-500 to-orange-500" },
  ];

  // Map backend aggregate _id (date) to "name", count to "revenue" (mocking revenue as activity volume)
  const growthData = stats.activityData?.length > 0 ? stats.activityData.map(item => ({
    name: new Date(item._id).toLocaleDateString(undefined, { weekday: 'short' }),
    users: item.count * 10, // Mock extrapolation
    revenue: item.count,
  })) : [
    { name: "Mon", users: 4000, revenue: 2400 },
    { name: "Tue", users: 3000, revenue: 1398 },
    { name: "Wed", users: 2000, revenue: 9800 },
    { name: "Thu", users: 2780, revenue: 3908 },
    { name: "Fri", users: 1890, revenue: 4800 },
    { name: "Sat", users: 2390, revenue: 3800 },
    { name: "Sun", users: 3490, revenue: 4300 },
  ];

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 animate-fade-in relative z-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-main tracking-tight mb-1">Overview</h1>
          <p className="text-muted text-sm">Real-time metrics and analytics for your platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-green-400">Server Health: 99.9%</span>
          </div>
          <button className="px-4 py-2 bg-card border border-app rounded-lg text-sm font-medium text-main hover:bg-white/5 transition-colors">
            Download Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {overviewStats.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5 relative overflow-hidden group">
            <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />
            
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-md">
                {stat.change}
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-display font-bold text-main mb-1">{stat.value?.toLocaleString()}</h3>
              <p className="text-sm text-muted font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-main">Activity Growth</h2>
            <select className="bg-card border border-app rounded-lg px-3 py-1.5 text-xs text-muted outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c6ff7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7c6ff7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#8b8da0" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8b8da0" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--c-card)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--c-text)' }}
                  itemStyle={{ color: 'var(--c-text)' }}
                />
                <Area type="monotone" dataKey="users" stroke="#7c6ff7" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart / Info */}
        <div className="glass rounded-2xl p-6 flex flex-col">
          <h2 className="font-semibold text-main mb-6">Messages Volume</h2>
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-6">
              <div className="text-4xl font-display font-bold text-accent2 mb-2">{stats.recentMessages?.toLocaleString()}</div>
              <div className="text-sm text-muted">Messages Sent Today</div>
            </div>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e879f9" />
                      <stop offset="100%" stopColor="#7c6ff7" />
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: 'var(--c-card)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="revenue" fill="url(#colorRev)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-main mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {stats.recentActivity?.length > 0 ? stats.recentActivity.map((item, i) => {
            const isUser = item.type === "user";
            const Icon = isUser ? Users : MessageSquare;
            const color = isUser ? "text-green-400" : "text-accent";
            const bg = isUser ? "bg-green-400/10" : "bg-accent/10";
            
            return (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-main"><span className="font-semibold">{item.user}</span> {item.action}</p>
                  <p className="text-xs text-muted">{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button className="text-xs font-semibold text-accent hover:text-main transition-colors">
                  View
                </button>
              </div>
            );
          }) : (
            <div className="text-center py-8 text-muted text-sm italic">No recent activity detected.</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default DashboardHome;
