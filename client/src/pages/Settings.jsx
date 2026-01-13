import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database, Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [settings, setSettings] = useState({
        profile: {
            name: 'Admin User',
            email: 'admin@ethara.ai',
            role: 'Super Admin'
        },
        notifications: {
            emailNotifications: true,
            pushNotifications: true,
            leaveAlerts: true,
            attendanceAlerts: true
        },
        appearance: {
            theme: 'light',
            language: 'en'
        }
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (section) => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(`${section} settings saved successfully`);
        setIsSaving(false);
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-3"
            >
                <div className="p-3 bg-blue-100 rounded-xl">
                    <SettingsIcon size={28} className="text-blue-600" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800">Settings</h2>
                    <p className="text-slate-500 text-sm">Manage your account and preferences</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1"
                >
                    <div className="bg-white rounded-2xl shadow-xl p-4 space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <motion.button
                                    key={tab.id}
                                    whileHover={{ x: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <Icon size={20} />
                                    <span>{tab.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-3"
                >
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-800 flex items-center space-x-2">
                                    <User size={28} className="text-blue-600" />
                                    <span>Profile Settings</span>
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={settings.profile.name}
                                            onChange={e => setSettings({
                                                ...settings,
                                                profile: { ...settings.profile, name: e.target.value }
                                            })}
                                            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={settings.profile.email}
                                            onChange={e => setSettings({
                                                ...settings,
                                                profile: { ...settings.profile, email: e.target.value }
                                            })}
                                            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                                        <input
                                            type="text"
                                            value={settings.profile.role}
                                            disabled
                                            className="w-full p-3 bg-slate-100 border-2 border-slate-200 rounded-xl font-medium text-slate-500"
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSave('Profile')}
                                        disabled={isSaving}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        <Save size={20} />
                                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                                    </motion.button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-800 flex items-center space-x-2">
                                    <Bell size={28} className="text-blue-600" />
                                    <span>Notification Preferences</span>
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                                        { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive browser push notifications' },
                                        { key: 'leaveAlerts', label: 'Leave Alerts', desc: 'Get notified about leave requests' },
                                        { key: 'attendanceAlerts', label: 'Attendance Alerts', desc: 'Get notified about attendance updates' },
                                    ].map((notif) => (
                                        <motion.div
                                            key={notif.key}
                                            whileHover={{ x: 5 }}
                                            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border-2 border-slate-200"
                                        >
                                            <div>
                                                <p className="font-bold text-slate-800">{notif.label}</p>
                                                <p className="text-sm text-slate-500">{notif.desc}</p>
                                            </div>
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setSettings({
                                                    ...settings,
                                                    notifications: {
                                                        ...settings.notifications,
                                                        [notif.key]: !settings.notifications[notif.key]
                                                    }
                                                })}
                                                className={`relative w-14 h-8 rounded-full transition-colors ${
                                                    settings.notifications[notif.key] ? 'bg-blue-600' : 'bg-slate-300'
                                                }`}
                                            >
                                                <motion.div
                                                    animate={{
                                                        x: settings.notifications[notif.key] ? 24 : 4
                                                    }}
                                                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg"
                                                />
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSave('Notification')}
                                        disabled={isSaving}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        <Save size={20} />
                                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                                    </motion.button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-800 flex items-center space-x-2">
                                    <Palette size={28} className="text-blue-600" />
                                    <span>Appearance Settings</span>
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Theme</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['light', 'dark'].map(theme => (
                                                <motion.button
                                                    key={theme}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setSettings({
                                                        ...settings,
                                                        appearance: { ...settings.appearance, theme }
                                                    })}
                                                    className={`p-4 rounded-xl border-2 font-bold ${
                                                        settings.appearance.theme === theme
                                                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                                                            : 'border-slate-200 bg-white text-slate-600'
                                                    }`}
                                                >
                                                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Language</label>
                                        <select
                                            value={settings.appearance.language}
                                            onChange={e => setSettings({
                                                ...settings,
                                                appearance: { ...settings.appearance, language: e.target.value }
                                            })}
                                            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-medium"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                        </select>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSave('Appearance')}
                                        disabled={isSaving}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        <Save size={20} />
                                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                                    </motion.button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-800 flex items-center space-x-2">
                                    <Shield size={28} className="text-blue-600" />
                                    <span>Security Settings</span>
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-medium"
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-medium"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-medium"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSave('Security')}
                                        disabled={isSaving}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        <Save size={20} />
                                        <span>{isSaving ? 'Updating...' : 'Update Password'}</span>
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;
