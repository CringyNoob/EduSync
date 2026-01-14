import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Shield, AlertTriangle, Activity, BarChart3, Database,
    Settings, Search, Bell, CheckCircle, XCircle, FileText
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [credentials, setCredentials] = useState({ id: '', key: '' });
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock validation
        if (credentials.id === 'admin' && credentials.key === 'admin') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Invalid Administrator Credentials');
        }
    };

    // Mock Data
    const stats = [
        { title: "Total Users", value: "2,543", change: "+12%", icon: Users, color: "bg-blue-500" },
        { title: "Active Reports", value: "18", change: "-5%", icon: AlertTriangle, color: "bg-red-500" },
        { title: "System Health", value: "98%", change: "+1%", icon: Activity, color: "bg-green-500" },
        { title: "Total Revenue", value: "$12,450", change: "+8%", icon: BarChart3, color: "bg-purple-500" },
    ];

    const recentReports = [
        { id: 1, type: "Forum", subject: "Inappropriate Content", reportedBy: "student_01", status: "Pending", time: "10m ago" },
        { id: 2, type: "Marketplace", subject: "Fake Product", reportedBy: "student_45", status: "Investigating", time: "1h ago" },
        { id: 3, type: "Chat", subject: "Harassment", reportedBy: "student_89", status: "Resolved", time: "5h ago" },
    ];

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 animate-in zoom-in-95 duration-500 bg-gray-50 dark:bg-gray-900 transition-colors">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 to-orange-600"></div>
                    <div className="text-center mb-10">
                        <div className="h-20 w-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-gray-700 shadow-lg">
                            <Shield size={32} className="text-red-500" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Admin Access</h1>
                        <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Authorized Personnel Only</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin ID</label>
                            <input
                                type="text"
                                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-red-500 focus:outline-none transition-all font-bold text-gray-900 dark:text-white"
                                placeholder="Enter Admin ID"
                                value={credentials.id}
                                onChange={e => setCredentials({ ...credentials, id: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Security Key</label>
                            <input
                                type="password"
                                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-red-500 focus:outline-none transition-all font-bold text-gray-900 dark:text-white"
                                placeholder="Enter Security Key"
                                value={credentials.key}
                                onChange={e => setCredentials({ ...credentials, key: e.target.value })}
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2 animate-pulse">
                                <AlertTriangle size={16} /> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                        >
                            Establish Secure Connection
                        </button>
                    </form>

                    <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-800 dark:via-gray-800/80 pointer-events-none"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 space-y-8 font-sans animate-in fade-in duration-500 text-gray-900 dark:text-white">
            {/* Background elements */}
            <div className="fixed inset-0 -z-30 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Overview & Moderation</p>
                </div>
                <div className="flex gap-3">
                    <button className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative">
                        <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                        <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
                    </button>
                    <button className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Settings size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${stat.color} bg-opacity-10 text-white`}>
                                <stat.icon size={24} className={`text-${stat.color.split('-')[1]}-600`} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.change.startsWith('+') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid lg:grid-cols-3 gap-8">

                {/* Recent Reports */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield size={20} className="text-red-500" />
                            Security & Moderation
                        </h2>
                        <button className="text-sm font-bold text-primary hover:underline">View All Reports</button>
                    </div>

                    <div className="space-y-4">
                        {recentReports.map(report => (
                            <div key={report.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${report.status === 'Pending' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' :
                                    report.status === 'Investigating' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                                        'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                    }`}>
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{report.subject}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        Type: {report.type} • Reported by: {report.reportedBy}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`block text-xs font-black uppercase tracking-wide ${report.status === 'Pending' ? 'text-orange-500' :
                                        report.status === 'Investigating' ? 'text-blue-500' :
                                            'text-green-500'
                                        }`}>{report.status}</span>
                                    <span className="text-[10px] text-gray-400 font-bold">{report.time}</span>
                                </div>
                                <div className="flex gap-2 ml-2">
                                    <button className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors text-green-600 dark:text-green-400"><CheckCircle size={18} /></button>
                                    <button className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors text-red-600 dark:text-red-400"><XCircle size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-8 text-white shadow-xl">
                        <h3 className="text-xl font-black mb-1">System Control</h3>
                        <p className="text-sm text-gray-400 mb-6 font-medium">Quick access tools</p>

                        <div className="space-y-3">
                            <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/5">
                                <Users size={20} />
                                <span className="font-bold text-sm">Manage Users</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/5">
                                <Database size={20} />
                                <span className="font-bold text-sm">Backup Database</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/5">
                                <FileText size={20} />
                                <span className="font-bold text-sm">View Audits</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
