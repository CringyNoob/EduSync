import React, { useState, useEffect } from 'react';
import {
    User, Bell, Shield, Moon, Globe,
    Camera, Save, Lock, Mail, Phone, Eye, EyeOff,
    ChevronRight, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import authService from '../../services/authService';


const SettingsPage = () => {
    const { user, updateUser } = useAuth();
    const { theme, setTheme, reducedMotion, toggleReducedMotion } = useTheme();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
    const [errorMessage, setErrorMessage] = useState('');

    // Image Upload State & Handlers
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const fileInputRef = React.useRef(null);

    // Profile Form State
    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        studentId: '',
        department: '',
        batch: '',
        phone: '',
        bio: '',
        phoneVisible: true
    });

    const [notifications, setNotifications] = useState({
        emailMessages: true,
        pushMentions: true,
        emailUpdates: false,
        marketing: false
    });

    // Fetch profile on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsFetching(true);
                const response = await authService.getProfile();
                if (response.success && response.profile) {
                    const profile = response.profile;
                    setProfileData({
                        fullName: profile.fullName || '',
                        email: profile.email || '',
                        studentId: profile.studentId || '',
                        department: profile.department || '',
                        batch: profile.batch || '',
                        phone: profile.phone || '',
                        bio: profile.bio || '',
                        phoneVisible: profile.phoneVisible !== false
                    });
                    if (profile.avatarUrl) {
                        setAvatarPreview(profile.avatarUrl);
                    }
                    
                    // Update auth context with fetched profile data (including avatar)
                    if (updateUser) {
                        updateUser({
                            ...user,
                            avatarUrl: profile.avatarUrl || null,
                            phone: profile.phone || null,
                            bio: profile.bio || null,
                            name: profile.fullName || user?.name
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setErrorMessage('Failed to load profile data');
            } finally {
                setIsFetching(false);
            }
        };

        fetchProfile();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File size must be less than 2MB");
                return;
            }
            setAvatarFile(file);
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

    const handleSave = async () => {
        setIsLoading(true);
        setErrorMessage('');
        setSaveStatus(null);

        try {
            // For now, we'll save the base64 avatar directly
            // In production, you'd upload to a cloud storage first
            const updateData = {
                phone: profileData.phone || null,
                bio: profileData.bio || null,
                phoneVisible: profileData.phoneVisible,
                avatarUrl: avatarPreview || null
            };

            const response = await authService.updateProfile(updateData);
            
            if (response.success) {
                setSaveStatus('success');
                // Update the auth context with new profile data
                if (updateUser) {
                    updateUser({
                        ...user,
                        avatarUrl: updateData.avatarUrl,
                        phone: updateData.phone,
                        bio: updateData.bio
                    });
                }
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                throw new Error(response.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setSaveStatus('error');
            setErrorMessage(error.message || 'Failed to save changes');
            setTimeout(() => setSaveStatus(null), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User, desc: 'Manage your personal info' },
        { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Customize your alerts' },
        { id: 'appearance', label: 'Appearance', icon: Moon, desc: 'Dark mode & accessibility' },
        { id: 'security', label: 'Security & Login', icon: Shield, desc: 'Password and 2FA' },
    ];

    if (isFetching) {
        return (
            <div className="min-h-screen p-6 font-sans flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-gray-500 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 font-sans animate-in fade-in duration-500 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Settings</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Manage your account preferences and settings.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-80 space-y-2 shrink-0">
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-4 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-6 transition-colors duration-300">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group text-left ${activeTab === tab.id
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg shadow-gray-200 dark:shadow-none'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-white/10 dark:bg-gray-900/10' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600 group-hover:shadow-sm'
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
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-md shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-gray-700 relative overflow-hidden min-h-[600px] transition-colors duration-300">

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
                                                <span>{getInitials(profileData.fullName)}</span>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="text-white" size={24} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Photo</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Accepts JPG, PNG or GIF (Max 2MB)</p>
                                        <div className="flex gap-3">
                                            <Button variant="outline" className="h-9 text-xs" onClick={triggerFileInput}>Upload New</Button>
                                            <button
                                                className="text-xs font-bold text-red-500 hover:text-red-600"
                                                onClick={() => {
                                                    setAvatarPreview(null);
                                                    setAvatarFile(null);
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Full Name - Read Only */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Full Name</label>
                                        <input
                                            type="text"
                                            value={profileData.fullName}
                                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-all font-bold text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    {/* Student ID - Read Only */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Student ID (Read Only)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={profileData.studentId}
                                                readOnly
                                                className="w-full p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 font-mono font-bold text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                            />
                                            <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Email - Read Only */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address (Read Only)</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                readOnly
                                                className="w-full p-4 pl-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 focus:outline-none transition-all font-bold text-gray-900 dark:text-white"
                                            />
                                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Department - Read Only */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Department (Read Only)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={profileData.department}
                                                readOnly
                                                className="w-full p-4 rounded-xl bg-gray-50/50 border border-gray-100 font-bold text-gray-500 cursor-not-allowed"
                                            />
                                            <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Phone Number - Editable with visibility toggle */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-all font-bold text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    {/* Batch - Read Only */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Batch (Read Only)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={profileData.batch}
                                                readOnly
                                                className="w-full p-4 rounded-xl bg-gray-50/50 border border-gray-100 font-bold text-gray-500 cursor-not-allowed"
                                            />
                                            <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Bio - Editable */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Bio / About</label>
                                        <textarea
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 focus:outline-none transition-all font-bold text-gray-900 dark:text-white h-32 resize-none"
                                        />
                                        <p className="text-xs text-gray-400 text-right">{profileData.bio.length}/500 characters</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-8 animate-in slide-in-from-right duration-300">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Updates & Alerts</h2>
                                <div className="space-y-4">
                                    {[
                                        { id: 'emailMessages', label: 'Email Messages', desc: 'Receive emails about new messages and mentions' },
                                        { id: 'pushMentions', label: 'Push Notifications', desc: 'Get push alerts on your desktop' },
                                        { id: 'emailUpdates', label: 'News & Updates', desc: 'Stay up to date with platform news' },
                                        { id: 'marketing', label: 'Marketing', desc: 'Receive special offers and promos' },
                                    ].map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white">{item.label}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
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
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Security</h2>
                                <div className="space-y-6">
                                    <div className="p-6 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                                        <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2">
                                            <AlertCircle size={18} /> Two-Factor Authentication (2FA)
                                        </h3>
                                        <p className="text-sm text-orange-700/80 dark:text-orange-300/80 mb-4">
                                            Protect your account by adding an extra layer of security.
                                        </p>
                                        <Button className="bg-orange-600 text-white hover:bg-orange-700 h-9 text-xs">Enable 2FA</Button>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 dark:text-white">Change Password</h3>
                                        <div className="space-y-3 max-w-md">
                                            <input type="password" placeholder="Current Password" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" />
                                            <input type="password" placeholder="New Password" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" />
                                            <input type="password" placeholder="Confirm New Password" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Digital ID Tab (New Creative Feature) */}


                        {/* Appearance Tab */}
                        {activeTab === 'appearance' && (
                            <div className="space-y-8 animate-in slide-in-from-right duration-300">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Appearance</h2>
                                <p className="text-gray-500 dark:text-gray-400">Customize how EduSync looks on your device.</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'light', label: 'Light Mode', icon: '☀️' },
                                        { id: 'dark', label: 'Dark Mode', icon: '🌙' },
                                        { id: 'system', label: 'System Default', icon: '💻' },
                                    ].map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => setTheme(mode.id)}
                                            className={`
                                                relative p-4 rounded-2xl border-2 text-left transition-all duration-300 group
                                                ${theme === mode.id
                                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                                    : 'border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 bg-white dark:bg-gray-800'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-2xl">{mode.icon}</span>
                                                {theme === mode.id && (
                                                    <div className="h-6 w-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                                        <CheckCircle size={14} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className={`font-bold ${theme === mode.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>
                                                {mode.label}
                                            </h3>
                                        </button>
                                    ))}
                                </div>

                                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">Reduced Motion</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Reduce animations for a simpler experience.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={reducedMotion}
                                                onChange={toggleReducedMotion}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Footer Action */}
                        <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <p className="text-xs text-gray-400 font-bold">
                                {saveStatus === 'success' ? (
                                    <span className="text-green-500 flex items-center gap-1"><CheckCircle size={14} /> Saved Successfully</span>
                                ) : saveStatus === 'error' ? (
                                    <span className="text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errorMessage || 'Failed to save'}</span>
                                ) : 'Changes will be saved when you click Save'}
                            </p>
                            <Button
                                onClick={handleSave}
                                disabled={isLoading}
                                className={`px-8 transition-all ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Save size={16} />
                                        Save Changes
                                    </span>
                                )}
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        </div >
    );
};

export default SettingsPage;
