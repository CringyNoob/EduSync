import React, { useState } from 'react';
import {
    User, Bell, Shield, Moon, Globe,
    Camera, Save, Lock, Mail, CreditCard,
    ChevronRight, CheckCircle, AlertCircle
} from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

    // Image Upload State & Handlers
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const fileInputRef = React.useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File size must be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Mock Form State
    const [profileData, setProfileData] = useState({
        name: user?.name || 'Alex Johnson',
        email: user?.email || 'alex@university.edu',
        studentId: '0112330055',
        department: 'Computer Science & Engineering',
        bio: 'Tech enthusiast, coder, and coffee lover.',
        phone: '+880 1700-000000'
    });

    const [notifications, setNotifications] = useState({
        emailMessages: true,
        pushMentions: true,
        emailUpdates: false,
        marketing: false
    });

    const handleSave = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        }, 1500);
    };

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User, desc: 'Manage your personal info' },
        { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Customize your alerts' },
        { id: 'security', label: 'Security & Login', icon: Shield, desc: 'Password and 2FA' },
        { id: 'appearance', label: 'Appearance', icon: Moon, desc: 'Theme preferences' },
    ];

    return (
        <div className="min-h-screen p-6 font-sans animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Settings</h1>
                <p className="text-lg text-gray-500 font-medium">Manage your account preferences and settings.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-80 space-y-2 shrink-0">
                    <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 sticky top-6">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group text-left ${activeTab === tab.id
                                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                                    : 'hover:bg-gray-50 text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-white/10' : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'
                                    }`}>
                                    <tab.icon size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{tab.label}</p>
                                    <p className={`text-[10px] font-medium ${activeTab === tab.id ? 'text-white/60' : 'text-gray-400'}`}>
                                        {tab.desc}
                                    </p>
                                </div>
                                {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-md shadow-gray-100/50 border border-gray-100 relative overflow-hidden min-h-[600px]">

                        {/* Decorative Gradient */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-in slide-in-from-right duration-300">

                                {/* Avatar Section */}
                                <div className="flex items-center gap-6 pb-8 border-b border-gray-100">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/gif"
                                        onChange={handleImageChange}
                                    />
                                    <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                                        <div className="h-24 w-24 rounded-full bg-indigo-100 border-4 border-white shadow-xl flex items-center justify-center text-3xl font-black text-indigo-600 overflow-hidden">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                                            ) : (
                                                <span>AJ</span>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="text-white" size={24} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Profile Photo</h3>
                                        <p className="text-sm text-gray-500 mb-3">Accepts JPG, PNG or GIF (Max 2MB)</p>
                                        <div className="flex gap-3">
                                            <Button variant="outline" className="h-9 text-xs" onClick={triggerFileInput}>Upload New</Button>
                                            <button
                                                className="text-xs font-bold text-red-500 hover:text-red-600"
                                                onClick={() => setAvatarPreview(null)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Student ID (Read Only)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={profileData.studentId}
                                                readOnly
                                                className="w-full p-4 rounded-xl bg-gray-50/50 border border-gray-100 font-mono font-bold text-gray-500 cursor-not-allowed"
                                            />
                                            <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                readOnly
                                                className="w-full p-4 pl-12 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-bold text-gray-900"
                                            />
                                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bio / About</label>
                                        <textarea
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-bold text-gray-900 h-32 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-8 animate-in slide-in-from-right duration-300">
                                <h2 className="text-2xl font-black text-gray-900">Updates & Alerts</h2>
                                <div className="space-y-4">
                                    {[
                                        { id: 'emailMessages', label: 'Email Messages', desc: 'Receive emails about new messages and mentions' },
                                        { id: 'pushMentions', label: 'Push Notifications', desc: 'Get push alerts on your desktop' },
                                        { id: 'emailUpdates', label: 'News & Updates', desc: 'Stay up to date with platform news' },
                                        { id: 'marketing', label: 'Marketing', desc: 'Receive special offers and promos' },
                                    ].map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{item.label}</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={notifications[item.id]}
                                                    onChange={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-in slide-in-from-right duration-300">
                                <h2 className="text-2xl font-black text-gray-900">Security</h2>
                                <div className="space-y-6">
                                    <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100">
                                        <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                                            <AlertCircle size={18} /> Two-Factor Authentication (2FA)
                                        </h3>
                                        <p className="text-sm text-orange-700/80 mb-4">
                                            Protect your account by adding an extra layer of security.
                                        </p>
                                        <Button className="bg-orange-600 text-white hover:bg-orange-700 h-9 text-xs">Enable 2FA</Button>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900">Change Password</h3>
                                        <div className="space-y-3 max-w-md">
                                            <input type="password" placeholder="Current Password" className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200" />
                                            <input type="password" placeholder="New Password" className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200" />
                                            <input type="password" placeholder="Confirm New Password" className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Appearance Tab (New) */}
                        {activeTab === 'appearance' && (
                            <div className="space-y-8 animate-in slide-in-from-right duration-300">
                                <h2 className="text-2xl font-black text-gray-900">Appearance</h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button className="p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50 flex flex-col items-center gap-2 transition-all">
                                        <div className="h-20 w-full bg-white rounded-lg border-2 border-indigo-100 shadow-sm flex items-center justify-center">
                                            <span className="text-2xl">☀️</span>
                                        </div>
                                        <span className="font-bold text-indigo-900">Light Mode</span>
                                        <span className="text-xs font-semibold text-indigo-600">Active</span>
                                    </button>
                                    <button className="p-4 rounded-2xl border-2 border-transparent hover:bg-gray-50 flex flex-col items-center gap-2 transition-all group opacity-50">
                                        <div className="h-20 w-full bg-gray-900 rounded-lg border border-gray-700 shadow-sm flex items-center justify-center">
                                            <span className="text-2xl">🌙</span>
                                        </div>
                                        <span className="font-bold text-gray-500 group-hover:text-gray-900">Dark Mode</span>
                                        <span className="text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100">Coming Soon</span>
                                    </button>
                                    <button className="p-4 rounded-2xl border-2 border-transparent hover:bg-gray-50 flex flex-col items-center gap-2 transition-all group">
                                        <div className="h-20 w-full bg-gray-100 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
                                            <span className="text-2xl">💻</span>
                                        </div>
                                        <span className="font-bold text-gray-500 group-hover:text-gray-900">System</span>
                                    </button>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-100">
                                    <h3 className="font-bold text-gray-900">Accessibility</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <div>
                                                <h4 className="font-bold text-gray-900">Reduced Motion</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">Minimize animations across the app</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer Action */}
                        <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-400 font-bold">
                                {saveStatus === 'success' ? (
                                    <span className="text-green-500 flex items-center gap-1"><CheckCircle size={14} /> Saved Successfully</span>
                                ) : 'Last saved: Just now'}
                            </p>
                            <Button
                                onClick={handleSave}
                                className={`px-8 transition-all ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
