'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  ShieldCheck, 
  Lock, 
  Video, 
  Mic, 
  Check, 
  Save, 
  Key, 
  Eye, 
  EyeOff, 
  Smartphone,
  Sparkles,
  Palette
} from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'account' | 'theme' | 'notifications' | 'privacy' | 'security' | 'media'>('account');
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [currentBgTheme, setCurrentBgTheme] = useState('cyber-midnight');

  // Form states
  const [accountForm, setAccountForm] = useState({
    fullName: '',
    email: '',
    title: '',
    bio: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    chatSounds: true,
    requestNotifications: true,
    marketingUpdates: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    showOnlineStatus: true,
    allowDirectMessages: true,
  });

  const [mediaSettings, setMediaSettings] = useState({
    defaultMicOn: true,
    defaultCamOn: true,
    hdVideoEnabled: true,
    noiseSuppression: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedBg = localStorage.getItem('sep_bg_theme') || 'cyber-midnight';
    setCurrentBgTheme(savedBg);

    const stored = localStorage.getItem('sep_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setAccountForm({
        fullName: parsed.fullName || parsed.name || '',
        email: parsed.email || '',
        title: parsed.title || 'Skill Exchanger',
        bio: parsed.bio || 'Passionate learner and mentor.',
      });
    }

    const savedSettings = localStorage.getItem('sep_user_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.notifications) setNotificationSettings(parsed.notifications);
        if (parsed.privacy) setPrivacySettings(parsed.privacy);
        if (parsed.media) setMediaSettings(parsed.media);
        if (parsed.twoFactor) setTwoFactorEnabled(parsed.twoFactor);
      } catch (e) {
        console.error('Error parsing stored settings', e);
      }
    }
  }, []);

  const triggerSaveNotification = (msg: string) => {
    setSavedSuccess(msg);
    setTimeout(() => {
      setSavedSuccess(null);
    }, 3500);
  };

  const handleSelectBgTheme = (themeId: string) => {
    setCurrentBgTheme(themeId);
    localStorage.setItem('sep_bg_theme', themeId);
    document.documentElement.setAttribute('data-bg-theme', themeId);
    triggerSaveNotification(`Background theme updated to ${themeId.replace('-', ' ').toUpperCase()}!`);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updatedUser = { ...user, fullName: accountForm.fullName, title: accountForm.title, bio: accountForm.bio };
      setUser(updatedUser);
      localStorage.setItem('sep_user', JSON.stringify(updatedUser));
    }
    triggerSaveNotification('Account profile information updated successfully!');
  };

  const handleSavePreferences = () => {
    const allSettings = {
      notifications: notificationSettings,
      privacy: privacySettings,
      media: mediaSettings,
      twoFactor: twoFactorEnabled,
    };
    localStorage.setItem('sep_user_settings', JSON.stringify(allSettings));
    triggerSaveNotification('Your preferences and configuration have been saved!');
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      alert('Please fill out password fields');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    triggerSaveNotification('Password updated successfully!');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Control Panel</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-outfit">
            Account Settings & Preferences
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your account security, background themes, notification alerts, and hardware.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold animate-pulse">
            <Check className="w-4 h-4 text-emerald-400" />
            {savedSuccess}
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
        {[
          { id: 'account', label: 'Account Profile', icon: User },
          { id: 'theme', label: 'Background Themes', icon: Palette },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'privacy', label: 'Privacy & Visibility', icon: ShieldCheck },
          { id: 'security', label: 'Security & 2FA', icon: Lock },
          { id: 'media', label: 'Audio & Video', icon: Video },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Account */}
      {activeTab === 'account' && (
        <div className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              Personal Profile Details
            </h3>
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full uppercase">
              {user?.role || 'Member'} Account
            </span>
          </div>

          <form onSubmit={handleSaveAccount} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={accountForm.fullName}
                  onChange={(e) => setAccountForm({ ...accountForm, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={accountForm.email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-400 dark:text-slate-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Primary login email cannot be changed.</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Headline / Title
                </label>
                <input
                  type="text"
                  value={accountForm.title}
                  onChange={(e) => setAccountForm({ ...accountForm, title: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Bio / About Me
                </label>
                <textarea
                  rows={3}
                  value={accountForm.bio}
                  onChange={(e) => setAccountForm({ ...accountForm, bio: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
              >
                <Save className="w-4 h-4" />
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT: Theme */}
      {activeTab === 'theme' && (
        <div className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-500" />
              Website Background Themes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your preferred ambient background color scheme across the application.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 'cyber-midnight', name: 'Cyber Midnight', desc: 'Sleek Dark Slate & Subtle Indigo Glow', bg: 'bg-[#0B0F19]', border: 'border-indigo-500' },
              { id: 'obsidian-space', name: 'Obsidian Space', desc: 'Ultra Deep Obsidian & Cosmic Indigo', bg: 'bg-[#04060E]', border: 'border-indigo-400' },
              { id: 'emerald-nebula', name: 'Emerald Nebula', desc: 'Dark Emerald Teal & Mint Highlights', bg: 'bg-[#03120E]', border: 'border-emerald-500' },
              { id: 'amethyst-violet', name: 'Amethyst Violet', desc: 'Royal Deep Violet & Purple Amethyst', bg: 'bg-[#0C0719]', border: 'border-purple-500' },
              { id: 'clean-light', name: 'Clean Light Mode', desc: 'Minimalist Bright Slate Aesthetic', bg: 'bg-[#F8FAFC]', border: 'border-slate-300' },
            ].map((theme) => {
              const isSelected = currentBgTheme === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelectBgTheme(theme.id)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between h-40 relative overflow-hidden ${
                    isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-[1.02]' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/50'
                  }`}
                >
                  <div className={`absolute inset-0 ${theme.bg} opacity-90 -z-10`} />
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-white font-outfit">{theme.name}</h4>
                      {isSelected && (
                        <span className="px-2.5 py-0.5 bg-indigo-500 text-white rounded-full text-[10px] font-extrabold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{theme.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Preview:</span>
                    <div className={`w-4 h-4 rounded-full ${theme.bg} border border-white/20`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-500" />
              Notification Alerts & Sound Preferences
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Choose how and when you receive real-time skill requests and session updates.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                id: 'emailAlerts',
                title: 'Email Notifications',
                desc: 'Receive email alerts when someone sends you a skill exchange request.',
                state: notificationSettings.emailAlerts,
                toggle: () => setNotificationSettings({ ...notificationSettings, emailAlerts: !notificationSettings.emailAlerts }),
              },
              {
                id: 'chatSounds',
                title: 'Real-time Chat Sounds',
                desc: 'Play subtle sound notifications when incoming messages arrive during active chats.',
                state: notificationSettings.chatSounds,
                toggle: () => setNotificationSettings({ ...notificationSettings, chatSounds: !notificationSettings.chatSounds }),
              },
              {
                id: 'requestNotifications',
                title: 'Session Call Reminders',
                desc: 'Get immediate browser ring alerts for incoming peer video sessions.',
                state: notificationSettings.requestNotifications,
                toggle: () => setNotificationSettings({ ...notificationSettings, requestNotifications: !notificationSettings.requestNotifications }),
              },
              {
                id: 'marketingUpdates',
                title: 'Platform News & Features',
                desc: 'Receive occasional digest emails regarding platform feature updates and new skills.',
                state: notificationSettings.marketingUpdates,
                toggle: () => setNotificationSettings({ ...notificationSettings, marketingUpdates: !notificationSettings.marketingUpdates }),
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={item.toggle}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    item.state ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-md"></span>
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSavePreferences}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              Save Notification Rules
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Privacy */}
      {activeTab === 'privacy' && (
        <div className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              Privacy & Discovery Control
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Control your public visibility across community skill discovery search listings.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                id: 'publicProfile',
                title: 'Public Profile Visibility',
                desc: 'Allow other registered community members to view your taught & desired skills in Explore search.',
                state: privacySettings.publicProfile,
                toggle: () => setPrivacySettings({ ...privacySettings, publicProfile: !privacySettings.publicProfile }),
              },
              {
                id: 'showOnlineStatus',
                title: 'Show Real-time Online Indicator',
                desc: 'Display an online green status dot when active on the platform.',
                state: privacySettings.showOnlineStatus,
                toggle: () => setPrivacySettings({ ...privacySettings, showOnlineStatus: !privacySettings.showOnlineStatus }),
              },
              {
                id: 'allowDirectMessages',
                title: 'Allow Direct Peer Messages',
                desc: 'Permit users with accepted skill swaps to send real-time instant messages.',
                state: privacySettings.allowDirectMessages,
                toggle: () => setPrivacySettings({ ...privacySettings, allowDirectMessages: !privacySettings.allowDirectMessages }),
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={item.toggle}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    item.state ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-md"></span>
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSavePreferences}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              Save Privacy Settings
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Security */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-500" />
                Change Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Ensure your account uses a long, random password to stay secure.
              </p>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                >
                  <Key className="w-4 h-4" />
                  Update Account Password
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 mt-1">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                  Add an additional layer of security to your SkillSwap account using an authenticator app.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setTwoFactorEnabled(!twoFactorEnabled);
                handleSavePreferences();
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                twoFactorEnabled
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-600/20 hover:scale-[1.02]'
              }`}
            >
              {twoFactorEnabled ? '2FA Enabled' : 'Enable 2FA'}
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Media */}
      {activeTab === 'media' && (
        <div className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-500" />
              WebRTC Audio & Video Session Defaults
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure initial camera and microphone states when joining live mentorship sessions.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                id: 'defaultMicOn',
                title: 'Join Sessions with Mic Unmuted',
                desc: 'Automatically start your microphone when entering video call sessions.',
                icon: Mic,
                state: mediaSettings.defaultMicOn,
                toggle: () => setMediaSettings({ ...mediaSettings, defaultMicOn: !mediaSettings.defaultMicOn }),
              },
              {
                id: 'defaultCamOn',
                title: 'Join Sessions with Video Enabled',
                desc: 'Automatically start camera video stream when entering peer sessions.',
                icon: Video,
                state: mediaSettings.defaultCamOn,
                toggle: () => setMediaSettings({ ...mediaSettings, defaultCamOn: !mediaSettings.defaultCamOn }),
              },
              {
                id: 'hdVideoEnabled',
                title: 'Enable HD 720p/1080p Stream Quality',
                desc: 'Use higher definition video resolution when bandwidth permits.',
                icon: Sparkles,
                state: mediaSettings.hdVideoEnabled,
                toggle: () => setMediaSettings({ ...mediaSettings, hdVideoEnabled: !mediaSettings.hdVideoEnabled }),
              },
              {
                id: 'noiseSuppression',
                title: 'AI Background Noise Suppression',
                desc: 'Filter out background environmental noise during audio communication.',
                icon: ShieldCheck,
                state: mediaSettings.noiseSuppression,
                toggle: () => setMediaSettings({ ...mediaSettings, noiseSuppression: !mediaSettings.noiseSuppression }),
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={item.toggle}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                      item.state ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 bg-white rounded-full shadow-md"></span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSavePreferences}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              Save Hardware Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
