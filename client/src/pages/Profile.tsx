import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/features/auth/hooks/useAuth';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import { 
  LogOut, User as UserIcon, GraduationCap, Mail, Phone, BookOpen, Calendar,
  Edit3, Camera, X, Check, FileText
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout, activeRole, updateProfile, isLoading } = useAuth();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(user?.bio || '');
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState(user?.phone || '');
  const [emailVisible, setEmailVisible] = useState(user?.emailVisible ?? true);
  const [phoneVisible, setPhoneVisible] = useState(user?.phoneVisible ?? true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBioSave = async () => {
    try {
      await updateProfile({ bio: bioText });
      setIsEditingBio(false);
    } catch (error) {
      console.error('Failed to update bio:', error);
    }
  };

  const handlePhoneSave = async () => {
    try {
      await updateProfile({ phone: phoneValue });
      setIsEditingPhone(false);
    } catch (error) {
      console.error('Failed to update phone:', error);
    }
  };

  const handlePrivacyToggle = async (field: 'email' | 'phone', value: boolean) => {
    try {
      if (field === 'email') {
        await updateProfile({ emailVisible: value });
        setEmailVisible(value);
      } else {
        await updateProfile({ phoneVisible: value });
        setPhoneVisible(value);
      }
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Compress image before preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Max dimensions
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression (0.7 quality for JPEG)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setPhotoPreview(compressedBase64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoSave = async () => {
    if (photoPreview) {
      try {
        await updateProfile({ profilePhoto: photoPreview });
        setIsEditingPhoto(false);
        setPhotoPreview(null);
      } catch (error) {
        console.error('Failed to update photo:', error);
      }
    }
  };

  const handlePhotoCancel = () => {
    setIsEditingPhoto(false);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return 'U';
  };

  const profileSections = [
    {
      label: 'Email',
      value: user?.email,
      icon: <Mail className="w-5 h-5 text-cyan-500" />,
      hasPrivacy: true,
      isVisible: emailVisible,
    },
    {
      label: 'Student ID',
      value: user?.studentId,
      icon: <UserIcon className="w-5 h-5 text-purple-500" />,
    },
    {
      label: 'Department',
      value: user?.department,
      icon: <GraduationCap className="w-5 h-5 text-indigo-500" />,
    },
    {
      label: 'Batch Year',
      value: user?.batch,
      icon: <Calendar className="w-5 h-5 text-blue-500" />,
    },
    {
      label: 'Current Trimester',
      value: user?.semester || 'N/A',
      icon: <BookOpen className="w-5 h-5 text-amber-500" />,
    },
    {
      label: 'Phone',
      value: user?.phone || 'Not set',
      icon: <Phone className="w-5 h-5 text-green-500" />,
      editable: true,
      hasPrivacy: true,
      isVisible: phoneVisible,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto p-6 flex justify-between items-center">
          <Logo size="md" />
          <Button 
            variant="secondary" 
            onClick={logout}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Header with Photo */}
          <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-2xl p-8 mb-8 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Photo */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/50 bg-slate-800 flex items-center justify-center">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : user?.profilePhoto ? (
                    <img 
                      src={user.profilePhoto} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-purple-400">
                      {getInitials()}
                    </span>
                  )}
                </div>
                
                {/* Photo Edit Overlay */}
                {!isEditingPhoto && (
                  <button
                    onClick={() => {
                      setIsEditingPhoto(true);
                      fileInputRef.current?.click();
                    }}
                    className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                {/* Photo Edit Actions */}
                <AnimatePresence>
                  {isEditingPhoto && photoPreview && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2"
                    >
                      <button
                        onClick={handlePhotoSave}
                        disabled={isLoading}
                        className="p-2 bg-green-600 rounded-full text-white hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handlePhotoCancel}
                        className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-lg text-slate-300 mb-1">
                  {user?.studentId}
                </p>
                <p className="text-sm text-slate-400 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">
                    <span className="capitalize">{activeRole}</span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-cyan-500" />
                <h3 className="text-lg font-semibold text-white">Bio</h3>
              </div>
              {!isEditingBio && (
                <button
                  onClick={() => {
                    setBioText(user?.bio || '');
                    setIsEditingBio(true);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isEditingBio ? (
                <motion.div
                  key="editing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <textarea
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full h-32 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      {bioText.length}/500 characters
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsEditingBio(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleBioSave}
                        isLoading={isLoading}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.p
                  key="display"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-slate-300"
                >
                  {user?.bio || (
                    <span className="text-slate-500 italic">
                      No bio yet. Click edit to add one!
                    </span>
                  )}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Profile Information Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {profileSections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="group bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 hover:border-purple-500/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                        {section.label}
                      </p>
                      {section.hasPrivacy && (
                        <button
                          onClick={() => handlePrivacyToggle(
                            section.label === 'Email' ? 'email' : 'phone',
                            !section.isVisible
                          )}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            section.isVisible
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-slate-600/50 text-slate-400 hover:bg-slate-600/70'
                          }`}
                        >
                          {section.isVisible ? '👁️ Visible' : '🔒 Hidden'}
                        </button>
                      )}
                    </div>
                    
                    {section.editable && section.label === 'Phone' && isEditingPhone ? (
                      <div className="space-y-3">
                        <input
                          type="tel"
                          value={phoneValue}
                          onChange={(e) => setPhoneValue(e.target.value)}
                          placeholder="Enter phone number"
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handlePhoneSave}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            <Check className="w-4 h-4 inline mr-1" />
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingPhone(false);
                              setPhoneValue(user?.phone || '');
                            }}
                            className="px-3 py-1.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                          >
                            <X className="w-4 h-4 inline mr-1" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-white break-words">
                          {section.value || 'N/A'}
                        </p>
                        {section.editable && section.label === 'Phone' && !isEditingPhone && (
                          <button
                            onClick={() => {
                              setPhoneValue(user?.phone || '');
                              setIsEditingPhone(true);
                            }}
                            className="ml-2 p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 p-3 rounded-lg bg-slate-700/50 group-hover:bg-slate-700/80 transition-colors">
                    {section.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm"
          >
            <p className="text-blue-300">
              <span className="font-semibold">ℹ️ Welcome to EduSync!</span> Your profile has been successfully created. You can edit your bio and profile photo anytime by clicking the edit icons.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
