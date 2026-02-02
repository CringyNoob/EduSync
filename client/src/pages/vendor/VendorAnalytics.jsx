import React, { useState, useEffect } from 'react';
import {
    TrendingUp, TrendingDown, DollarSign, Calendar,
    ArrowUpRight, ArrowDownRight, CreditCard, Activity,
    PieChart, BarChart2, ShoppingBag, Users, Clock,
    Download, ChevronDown, AlertCircle, X
} from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';

const VendorAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('THIS_WEEK');
    
    // Analytics data from API
    const [stats, setStats] = useState({
        totalRevenue: 0,
        revenueGrowth: 0,
        totalOrders: 0,
        ordersGrowth: 0,
        avgOrderValue: 0,
        avgOrderGrowth: 0,
        visitors: 0,
        visitorsGrowth: 0,
    });
    
    const [dailyRevenue, setDailyRevenue] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);
    const [insights, setInsights] = useState(null);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await marketplaceService.getMyAnalytics(timeRange);
            
            if (response.success) {
                const data = response.analytics;
                
                // Set stats
                setStats({
                    totalRevenue: data.totalRevenue || 0,
                    revenueGrowth: data.revenueGrowth || 0,
                    totalOrders: data.totalOrders || 0,
                    ordersGrowth: data.ordersGrowth || 0,
                    avgOrderValue: data.avgOrderValue || 0,
                    avgOrderGrowth: data.avgOrderGrowth || 0,
                    visitors: data.visitors || 0,
                    visitorsGrowth: data.visitorsGrowth || 0,
                });
                
                // Set daily revenue with calculated heights
                if (data.dailyRevenue && data.dailyRevenue.length > 0) {
                    const maxValue = Math.max(...data.dailyRevenue.map(d => d.value || 0));
                    setDailyRevenue(data.dailyRevenue.map(d => ({
                        ...d,
                        height: maxValue > 0 ? `${Math.round((d.value / maxValue) * 95)}%` : '0%'
                    })));
                } else {
                    // Default empty data for the week
                    setDailyRevenue([
                        { day: 'Mon', value: 0, height: '0%' },
                        { day: 'Tue', value: 0, height: '0%' },
                        { day: 'Wed', value: 0, height: '0%' },
                        { day: 'Thu', value: 0, height: '0%' },
                        { day: 'Fri', value: 0, height: '0%' },
                        { day: 'Sat', value: 0, height: '0%' },
                        { day: 'Sun', value: 0, height: '0%' },
                    ]);
                }
                
                // Set top products
                setTopProducts(data.topProducts || []);
                
                // Set category breakdown
                setCategoryBreakdown(data.categoryBreakdown || []);
                
                // Set insights and alerts
                setInsights(data.insights || null);
                setAlerts(data.alerts || []);
            } else {
                setError(response.error || 'Failed to load analytics');
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load analytics. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 space-y-8 font-sans animate-in fade-in duration-700 pb-24 relative selection:bg-indigo-100 selection:text-indigo-900">
            {/* Ambient Background */}
            <div className="fixed inset-0 -z-30 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[10%] w-[800px] h-[800px] bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 rounded-full blur-[120px] mix-blend-multiply"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-tl from-indigo-500/5 to-purple-500/5 rounded-full blur-[100px] mix-blend-multiply"></div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span className="font-medium">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Analytics
                        <span className="bg-indigo-50 text-indigo-600 text-sm px-3 py-1 rounded-xl font-bold border border-indigo-100">
                            Pro
                        </span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-2 text-lg">Insights to grow your business</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                    {['THIS_WEEK', 'THIS_MONTH', 'ALL_TIME'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${timeRange === range
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {range.replace('_', ' ')}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-gray-200 mx-1"></div>
                    <button className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                        <Calendar size={18} />
                    </button>
                    <button className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Revenue"
                    value={`৳${stats.totalRevenue.toLocaleString()}`}
                    trend={stats.revenueGrowth}
                    icon={DollarSign}
                    color="emerald"
                />
                <MetricCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    trend={stats.ordersGrowth}
                    icon={ShoppingBag}
                    color="blue"
                />
                <MetricCard
                    title="Avg. Order Value"
                    value={`৳${stats.avgOrderValue}`}
                    trend={stats.avgOrderGrowth}
                    icon={CreditCard}
                    color="violet"
                />
                <MetricCard
                    title="Store Visitors"
                    value={stats.visitors.toLocaleString()}
                    trend={stats.visitorsGrowth}
                    icon={Users}
                    color="orange"
                />
            </div>

            {/* Main Charts Section */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <BarChart2 size={20} className="text-gray-400" /> Revenue Overview
                            </h3>
                            <p className="text-sm font-medium text-gray-400 mt-1">Daily earnings for the selected period</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-gray-900">৳{stats.totalRevenue.toLocaleString()}</p>
                            <p className={`text-xs font-bold uppercase flex items-center justify-end gap-1 ${stats.revenueGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stats.revenueGrowth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} 
                                {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}% vs last period
                            </p>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-4 px-2">
                        {dailyRevenue.map((item, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
                                <div className="relative w-full flex items-end justify-center h-full">
                                    <div
                                        className="w-full max-w-[60px] bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t-2xl opacity-80 group-hover:opacity-100 transition-all duration-300 relative group-hover:scale-y-105 origin-bottom"
                                        style={{ height: item.height }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            ৳{item.value}
                                        </div>
                                    </div>
                                    {/* Background Track */}
                                    <div className="absolute bottom-0 w-full max-w-[60px] h-full bg-gray-50 rounded-t-2xl -z-10"></div>
                                </div>
                                <span className="text-xs font-bold text-gray-400 group-hover:text-indigo-600 transition-colors uppercase">{item.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sales Breakdown */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-6">
                        <PieChart size={20} className="text-gray-400" /> Sales by Category
                    </h3>

                    <div className="flex-1 flex flex-col justify-center space-y-6">
                        {/* Custom Progress Bars */}
                        {categoryBreakdown.length > 0 ? (
                            categoryBreakdown.map((category, idx) => (
                                <CategoryProgress 
                                    key={idx}
                                    label={category.label} 
                                    value={category.value} 
                                    color={['bg-emerald-500', 'bg-blue-500', 'bg-orange-500', 'bg-violet-500'][idx % 4]} 
                                    amount={`৳${category.amount?.toLocaleString() || 0}`} 
                                />
                            ))
                        ) : (
                            <>
                                <CategoryProgress label="No Data" value={0} color="bg-gray-300" amount="৳0" />
                            </>
                        )}

                        {insights && (
                            <div className="pt-6 border-t border-gray-100 mt-4">
                                <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-2xl">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-indigo-900">{insights.title || 'Analytics Insight'}</p>
                                        <p className="text-xs font-medium text-indigo-600/80">{insights.description || 'Keep track of your performance!'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Top Products */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-gray-900">Top Performing Items</h3>
                        <button className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                            View Report
                        </button>
                    </div>

                    <div className="space-y-4">
                        {topProducts.length > 0 ? (
                            topProducts.map((product, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-black text-gray-300 text-lg group-hover:text-indigo-500 group-hover:border-indigo-100 transition-colors">
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{product.name}</h4>
                                            <p className="text-xs font-semibold text-gray-400">{product.sales} Sales</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-gray-900">৳{product.revenue?.toLocaleString() || 0}</p>
                                        <p className={`text-xs font-bold flex items-center justify-end gap-0.5 ${product.growth?.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {product.growth || '0%'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No product data yet</p>
                                <p className="text-sm">Start selling to see your top performers!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Insights & Alerts */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    <Activity size={20} />
                                </div>
                                <h3 className="text-xl font-black">Smart Insights</h3>
                            </div>
                            <p className="text-indigo-100 font-medium leading-relaxed mb-6">
                                {insights?.message || (
                                    <>Your shop analytics will appear here once you start making sales. Track your performance and grow your business!</>
                                )}
                            </p>
                            <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                                View Detailed Analysis
                            </button>
                        </div>
                    </div>

                    <div className="bg-orange-50 rounded-[2.5rem] border border-orange-100 p-8">
                        <h3 className="text-xl font-black text-orange-900 mb-4 flex items-center gap-2">
                            Alerts
                        </h3>
                        <div className="space-y-4">
                            {alerts.length > 0 ? (
                                alerts.map((alert, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0"></div>
                                        <p className="text-orange-800 font-medium text-sm">
                                            <span className="font-bold">{alert.title}:</span> {alert.message}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-orange-700 font-medium text-sm">No alerts at this time. Keep up the great work!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const MetricCard = ({ title, value, trend, icon: Icon, color }) => {
    const isPositive = trend >= 0;

    // Color maps
    const colors = {
        emerald: 'text-emerald-500 bg-emerald-50 group-hover:bg-emerald-100',
        blue: 'text-blue-500 bg-blue-50 group-hover:bg-blue-100',
        violet: 'text-violet-500 bg-violet-50 group-hover:bg-violet-100',
        orange: 'text-orange-500 bg-orange-50 group-hover:bg-orange-100',
    };

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${colors[color]}`}>
                    <Icon size={24} />
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(trend)}%
                </span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
        </div>
    );
};

const CategoryProgress = ({ label, value, color, amount }) => (
    <div>
        <div className="flex justify-between text-sm font-bold mb-2">
            <span className="text-gray-700">{label}</span>
            <span className="text-gray-900">{amount}</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
                className={`h-full ${color} rounded-full transition-all duration-1000`}
                style={{ width: `${value}%` }}
            ></div>
        </div>
    </div>
);

export default VendorAnalytics;
