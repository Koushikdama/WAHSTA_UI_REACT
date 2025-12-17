
import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, User as UserIcon, Bell, Database, HelpCircle, Heart, Moon, Sun, Edit2, Check, X, Camera, Globe, Sparkles, MessageCircle, ArrowLeft, Palette, Type, Lock, Shield, FileText, Image as ImageIcon, Video, Mic, BarChart2, Upload, Trash2, Ban, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

const LOGO_EFFECTS = [
    { id: 'none', label: 'None' },
    { id: 'shine', label: 'Shine' },
    { id: 'wave', label: 'Wave' }
];

const BlockedContactsScreen = ({ onClose }: { onClose: () => void }) => {
    const { users } = useApp();
    // Simulate blocked users with local state for UI demonstration
    const [blockedIds, setBlockedIds] = useState<string[]>(['u12', 'u14', 'u4']); // Liam, Noah, Diana

    const handleUnblock = (id: string) => {
        setBlockedIds(prev => prev.filter(uid => uid !== id));
    };

    return (
        <div className="absolute inset-0 z-20 bg-white dark:bg-wa-dark-bg flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="h-[60px] bg-wa-teal dark:bg-wa-dark-header flex items-center px-4 shrink-0 shadow-sm text-white">
                <button onClick={onClose} className="mr-3 p-1 rounded-full active:bg-white/10">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-medium">Restricted Accounts</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="text-sm text-[#667781] dark:text-gray-400 mb-4 px-2">
                    Blocked contacts will no longer be able to call you or send you messages.
                </div>

                <div className="bg-white dark:bg-wa-dark-paper rounded-lg shadow-sm border border-wa-border dark:border-gray-700 overflow-hidden">
                    {blockedIds.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            No restricted accounts.
                        </div>
                    ) : (
                        blockedIds.map(id => {
                            const user = users[id];
                            if (!user) return null;
                            return (
                                <div key={id} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover grayscale opacity-70" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[#111b21] dark:text-gray-100 font-medium truncate">{user.name}</h3>
                                        <p className="text-xs text-[#667781] dark:text-gray-500 truncate">{user.phone}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleUnblock(id)}
                                        className="text-xs font-medium text-red-500 border border-red-200 dark:border-red-900/30 px-3 py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        Unblock
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
                
                <div className="mt-6 flex items-center gap-4 px-4 py-3 text-[#111b21] dark:text-gray-200 cursor-pointer hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover rounded-lg transition-colors border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="w-6 flex justify-center"><Plus size={20} className="text-[#667781] dark:text-gray-400" /></div>
                    <span className="text-sm font-medium">Add to restricted list...</span>
                </div>
            </div>
        </div>
    );
};

const PasswordSettingsScreen = ({ onClose }: { onClose: () => void }) => {
    const { securitySettings, updateSecuritySettings } = useApp();
    const [editingType, setEditingType] = useState<'daily' | 'chat' | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSave = () => {
        if (newPassword.length < 4) {
            setMessage('Password must be at least 4 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        if (editingType === 'daily') {
            updateSecuritySettings({ dailyLockPassword: newPassword });
            setMessage('App Lock Password updated!');
        } else if (editingType === 'chat') {
            updateSecuritySettings({ chatLockPassword: newPassword });
            setMessage('Chat Lock Password updated!');
        }

        setTimeout(() => {
            setEditingType(null);
            setNewPassword('');
            setConfirmPassword('');
            setMessage('');
        }, 1000);
    };

    return (
        <div className="absolute inset-0 z-20 bg-white dark:bg-wa-dark-bg flex flex-col animate-in slide-in-from-right duration-200">
             {/* Header */}
            <div className="h-[60px] bg-wa-teal dark:bg-wa-dark-header flex items-center px-4 shrink-0 shadow-sm text-white">
                <button onClick={onClose} className="mr-3 p-1 rounded-full active:bg-white/10">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-medium">Manage Passwords</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {editingType ? (
                    <div className="bg-white dark:bg-wa-dark-paper p-6 rounded-lg shadow-sm border border-wa-border dark:border-gray-700">
                        <h3 className="text-lg font-medium text-[#111b21] dark:text-gray-100 mb-6">
                            Set {editingType === 'daily' ? 'App Lock' : 'Chat Lock'} Password
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-[#54656f] dark:text-gray-400 mb-1">New Password</label>
                                <input 
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-3 bg-wa-grayBg dark:bg-wa-dark-input rounded-lg outline-none text-[#111b21] dark:text-gray-100 border border-transparent focus:border-wa-teal transition-colors"
                                    placeholder="Enter new PIN"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[#54656f] dark:text-gray-400 mb-1">Confirm Password</label>
                                <input 
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-3 bg-wa-grayBg dark:bg-wa-dark-input rounded-lg outline-none text-[#111b21] dark:text-gray-100 border border-transparent focus:border-wa-teal transition-colors"
                                    placeholder="Confirm new PIN"
                                />
                            </div>
                        </div>

                        {message && <p className={`mt-3 text-sm font-medium ${message.includes('updated') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}

                        <div className="flex gap-3 mt-8">
                             <button 
                                onClick={() => { setEditingType(null); setMessage(''); setNewPassword(''); setConfirmPassword(''); }}
                                className="flex-1 py-2.5 text-wa-teal font-medium hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover rounded-full transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="flex-1 py-2.5 bg-wa-teal text-white font-medium rounded-full shadow-sm hover:shadow-md transition-all"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Daily Lock Card */}
                        <div className="bg-white dark:bg-wa-dark-paper rounded-lg shadow-sm border border-wa-border dark:border-gray-700 overflow-hidden">
                            <div className="p-4 flex items-center gap-4 border-b border-gray-100 dark:border-gray-700">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                                    <Shield size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-medium text-[#111b21] dark:text-gray-100">App Lock (Daily)</h3>
                                    <p className="text-xs text-[#667781] dark:text-gray-500">Passcode required to open WhatsApp</p>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-white/5 flex justify-between items-center">
                                <div className="text-sm text-[#111b21] dark:text-gray-300">
                                    Status: <span className="font-medium text-wa-teal">{securitySettings.dailyLockPassword ? 'Set' : 'Not Set'}</span>
                                </div>
                                <button 
                                    onClick={() => setEditingType('daily')}
                                    className="text-sm font-medium text-wa-teal hover:underline"
                                >
                                    Change
                                </button>
                            </div>
                        </div>

                        {/* Chat Lock Card */}
                        <div className="bg-white dark:bg-wa-dark-paper rounded-lg shadow-sm border border-wa-border dark:border-gray-700 overflow-hidden">
                            <div className="p-4 flex items-center gap-4 border-b border-gray-100 dark:border-gray-700">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500">
                                    <Lock size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-medium text-[#111b21] dark:text-gray-100">Chat Lock</h3>
                                    <p className="text-xs text-[#667781] dark:text-gray-500">Passcode to access locked chats</p>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-white/5 flex justify-between items-center">
                                <div className="text-sm text-[#111b21] dark:text-gray-300">
                                    Status: <span className="font-medium text-wa-teal">{securitySettings.chatLockPassword ? 'Set' : 'Not Set'}</span>
                                </div>
                                <button 
                                    onClick={() => setEditingType('chat')}
                                    className="text-sm font-medium text-wa-teal hover:underline"
                                >
                                    Change
                                </button>
                            </div>
                        </div>
                        
                        <div className="text-center p-4">
                            <p className="text-xs text-[#667781] dark:text-gray-500">
                                These passwords are saved locally on your device for this demo.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ChatSettingsScreen = ({ onClose }: { onClose: () => void }) => {
    const { chatSettings, updateChatSettings, appConfig } = useApp();
    const chatListBgInputRef = useRef<HTMLInputElement>(null);
    const contactInfoBgInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const getFontSizeClass = () => {
        switch(chatSettings.fontSize) {
            case 'small': return 'text-[13px]';
            case 'large': return 'text-[17px]';
            default: return 'text-[15px]';
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'chatList' | 'contactInfo') => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (e.g., 800KB max for localStorage safety)
            if (file.size > 800 * 1024) {
                setError("Image is too large. Please select an image under 800KB.");
                return;
            }
            
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                try {
                    if (type === 'chatList') {
                        updateChatSettings({ chatListBackgroundImage: reader.result as string });
                    } else {
                        updateChatSettings({ contactInfoBackgroundImage: reader.result as string });
                    }
                } catch (e) {
                    setError("Storage quota exceeded. Try a smaller image.");
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = ''; // Reset input
    };

    const APP_COLORS = appConfig?.appColors || ['#008069'];
    const BUBBLE_COLORS = appConfig?.bubbleColors || ['#D9FDD3', '#FFFFFF'];

    return (
        <div className="absolute inset-0 z-20 bg-white dark:bg-wa-dark-bg flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="h-[60px] bg-wa-teal dark:bg-wa-dark-header flex items-center px-4 shrink-0 shadow-sm text-white">
                <button onClick={onClose} className="mr-3 p-1 rounded-full active:bg-white/10">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-medium">Chat Settings</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {/* Preview Section */}
                <div className="mb-8">
                    <h3 className="text-sm font-medium text-wa-teal mb-3 uppercase px-2">Preview</h3>
                    <div 
                        className="rounded-lg shadow-md overflow-hidden bg-wa-bg relative h-64 border border-wa-border dark:border-gray-700 flex flex-col p-4"
                        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat', backgroundSize: '400px' }}
                    >
                        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 pointer-events-none"></div>
                        
                        {/* Fake Messages */}
                        <div className="relative z-10 flex flex-col gap-3 justify-end h-full">
                            <div className={`self-start max-w-[80%] p-2 rounded-lg rounded-tl-none shadow-sm ${getFontSizeClass()}`}
                                 style={{ backgroundColor: chatSettings.incomingBubbleColor, color: '#111b21' }}>
                                Hi there! How does this look?
                                <span className="text-[10px] text-gray-500 block text-right mt-1">10:00 AM</span>
                            </div>
                            <div className={`self-end max-w-[80%] p-2 rounded-lg rounded-tr-none shadow-sm ${getFontSizeClass()}`}
                                 style={{ backgroundColor: chatSettings.outgoingBubbleColor, color: '#111b21' }}>
                                This customization is amazing! 🔥
                                <span className="text-[10px] text-gray-500 block text-right mt-1 flex justify-end gap-1 items-center">10:01 AM <Check size={14} className="text-blue-500" /></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Font Size */}
                <div className="mb-8 px-2">
                    <div className="flex items-center gap-2 mb-3">
                         <Type size={20} className="text-wa-gray" />
                         <h3 className="text-base font-medium text-[#111b21] dark:text-gray-100">Font Size</h3>
                    </div>
                    <div className="flex bg-wa-grayBg dark:bg-wa-dark-header rounded-lg p-1">
                        {['small', 'medium', 'large'].map((size) => (
                            <button
                                key={size}
                                onClick={() => updateChatSettings({ fontSize: size as any })}
                                className={`flex-1 py-2 rounded-md text-sm capitalize transition-all ${chatSettings.fontSize === size ? 'bg-white dark:bg-wa-dark-paper shadow-sm text-wa-teal font-medium' : 'text-gray-500'}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* App Color */}
                <div className="mb-8 px-2">
                    <div className="flex items-center gap-2 mb-3">
                         <Palette size={20} className="text-wa-gray" />
                         <h3 className="text-base font-medium text-[#111b21] dark:text-gray-100">App Color</h3>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {APP_COLORS.map(color => (
                            <button
                                key={color}
                                onClick={() => updateChatSettings({ appColor: color })}
                                className={`w-10 h-10 rounded-full shrink-0 border-2 transition-transform hover:scale-110 ${chatSettings.appColor === color ? 'border-black dark:border-white' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>

                 {/* Bubble Colors */}
                 <div className="mb-8 px-2">
                    <h3 className="text-base font-medium text-[#111b21] dark:text-gray-100 mb-3">Incoming Bubble Color</h3>
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar mb-6">
                        {BUBBLE_COLORS.map(color => (
                            <button
                                key={color}
                                onClick={() => updateChatSettings({ incomingBubbleColor: color })}
                                className={`w-10 h-10 rounded-full shrink-0 border-2 transition-transform hover:scale-110 shadow-sm ${chatSettings.incomingBubbleColor === color ? 'border-wa-teal' : 'border-gray-200 dark:border-gray-600'}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>

                    <h3 className="text-base font-medium text-[#111b21] dark:text-gray-100 mb-3">Outgoing Bubble Color</h3>
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {BUBBLE_COLORS.map(color => (
                            <button
                                key={color}
                                onClick={() => updateChatSettings({ outgoingBubbleColor: color })}
                                className={`w-10 h-10 rounded-full shrink-0 border-2 transition-transform hover:scale-110 shadow-sm ${chatSettings.outgoingBubbleColor === color ? 'border-wa-teal' : 'border-gray-200 dark:border-gray-600'}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>

                {/* Background Images */}
                <div className="mb-8 px-2">
                    <div className="flex items-center gap-2 mb-3">
                         <ImageIcon size={20} className="text-wa-gray" />
                         <h3 className="text-base font-medium text-[#111b21] dark:text-gray-100">Custom Backgrounds</h3>
                    </div>
                    
                    {error && (
                        <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                            <X size={16} /> {error}
                        </div>
                    )}
                    
                    {/* Chat List Background */}
                    <div className="mb-4">
                        <label className="text-sm text-[#54656f] dark:text-gray-400 mb-2 block">Chat List Background</label>
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-white/5 overflow-hidden flex items-center justify-center relative group">
                                {chatSettings.chatListBackgroundImage ? (
                                    <img src={chatSettings.chatListBackgroundImage} alt="Chat List Bg" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-gray-400">None</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={chatListBgInputRef}
                                    onChange={(e) => handleFileChange(e, 'chatList')}
                                />
                                <button 
                                    onClick={() => chatListBgInputRef.current?.click()}
                                    className="px-4 py-1.5 bg-wa-teal text-white text-xs rounded-full shadow-sm hover:brightness-110 flex items-center gap-2"
                                >
                                    <Upload size={14} /> Upload
                                </button>
                                {chatSettings.chatListBackgroundImage && (
                                    <button 
                                        onClick={() => updateChatSettings({ chatListBackgroundImage: null })}
                                        className="px-4 py-1.5 bg-red-100 text-red-600 text-xs rounded-full hover:bg-red-200 flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Info Background */}
                    <div>
                        <label className="text-sm text-[#54656f] dark:text-gray-400 mb-2 block">Contact Info Background</label>
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-white/5 overflow-hidden flex items-center justify-center relative group">
                                {chatSettings.contactInfoBackgroundImage ? (
                                    <img src={chatSettings.contactInfoBackgroundImage} alt="Contact Info Bg" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-gray-400">None</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={contactInfoBgInputRef}
                                    onChange={(e) => handleFileChange(e, 'contactInfo')}
                                />
                                <button 
                                    onClick={() => contactInfoBgInputRef.current?.click()}
                                    className="px-4 py-1.5 bg-wa-teal text-white text-xs rounded-full shadow-sm hover:brightness-110 flex items-center gap-2"
                                >
                                    <Upload size={14} /> Upload
                                </button>
                                {chatSettings.contactInfoBackgroundImage && (
                                    <button 
                                        onClick={() => updateChatSettings({ contactInfoBackgroundImage: null })}
                                        className="px-4 py-1.5 bg-red-100 text-red-600 text-xs rounded-full hover:bg-red-200 flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StorageSettingsScreen = ({ onClose }: { onClose: () => void }) => {
    const { chats, messages, users, chatDocuments } = useApp();
    const [filter, setFilter] = useState<'all' | 'media' | 'files'>('all');

    // Helper to calculate size
    const calculateSize = (type: string, count: number) => {
        switch(type) {
            case 'image': return count * 1.2; // 1.2 MB avg
            case 'video': return count * 12;  // 12 MB avg
            case 'voice': return count * 0.5; // 0.5 MB avg
            case 'text': return count * 0.001; // 1 KB avg
            case 'doc': return count * 2.5;   // 2.5 MB avg
            default: return 0;
        }
    };

    const stats = useMemo(() => {
        let mediaSize = 0;
        let fileSize = 0;
        let audioSize = 0;
        let otherSize = 0;

        const chatSizes: Record<string, number> = {};

        Object.keys(messages).forEach(chatId => {
            let currentChatSize = 0;
            messages[chatId].forEach(msg => {
                if (msg.isDeleted) return;
                
                let size = 0;
                if (msg.type === 'image') size = calculateSize('image', 1);
                else if (msg.type === 'video') size = calculateSize('video', 1);
                else if (msg.type === 'voice') size = calculateSize('voice', 1);
                else if (msg.type === 'text') size = calculateSize('text', 1);

                if (msg.type === 'image' || msg.type === 'video') mediaSize += size;
                else if (msg.type === 'voice') audioSize += size;
                else otherSize += size;

                currentChatSize += size;
            });

            // Add documents if any
            if (chatDocuments[chatId]) {
                const docTotal = calculateSize('doc', chatDocuments[chatId].length);
                fileSize += docTotal;
                currentChatSize += docTotal;
            }

            chatSizes[chatId] = currentChatSize;
        });

        const total = mediaSize + fileSize + audioSize + otherSize;

        // Prepare sorted chat list based on filter
        const sortedChats = chats
            .map(chat => {
                let size = chatSizes[chat.id] || 0;
                // Adjust size based on filter for the list view
                if (filter === 'media') {
                    // Recalculate just media for this chat
                    const msgs = messages[chat.id] || [];
                    const imgs = msgs.filter(m => m.type === 'image').length;
                    const vids = msgs.filter(m => m.type === 'video').length;
                    size = calculateSize('image', imgs) + calculateSize('video', vids);
                } else if (filter === 'files') {
                    // Recalculate just files
                    const docs = chatDocuments[chat.id] || [];
                    size = calculateSize('doc', docs.length);
                }
                return { ...chat, size };
            })
            .sort((a, b) => b.size - a.size);

        return {
            media: mediaSize,
            files: fileSize,
            audio: audioSize,
            other: otherSize,
            total,
            sortedChats
        };
    }, [messages, chats, chatDocuments, filter]);

    const chartData = [
        { label: 'Media', value: stats.media, color: '#008069' },
        { label: 'Files', value: stats.files, color: '#34B7F1' },
        { label: 'Audio', value: stats.audio, color: '#FFB347' },
        { label: 'Other', value: stats.other, color: '#8696a0' }
    ];

    const R = 36;
    const C = 2 * Math.PI * R;
    let currentOffset = 0;

    return (
        <div className="absolute inset-0 z-20 bg-white dark:bg-wa-dark-bg flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="h-[60px] bg-wa-teal dark:bg-wa-dark-header flex items-center px-4 shrink-0 shadow-sm text-white">
                <button onClick={onClose} className="mr-3 p-1 rounded-full active:bg-white/10">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-medium">Storage and Data</h2>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-wa-dark-bg">
                {/* Visual Chart Section */}
                <div className="bg-white dark:bg-wa-dark-paper p-6 mb-2 shadow-sm flex flex-col items-center">
                    <div className="relative w-48 h-48 mb-6">
                        <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                            <circle cx="50" cy="50" r={R} stroke="#e9edef" strokeWidth="12" fill="none" className="dark:stroke-gray-700" />
                            {stats.total > 0 && chartData.map((item) => {
                                const percent = item.value / stats.total;
                                const dashArray = `${percent * C} ${C}`;
                                const dashOffset = -currentOffset;
                                currentOffset += percent * C;
                                return (
                                    <circle 
                                        key={item.label}
                                        cx="50" cy="50" r={R}
                                        fill="none"
                                        stroke={item.color}
                                        strokeWidth="12"
                                        strokeDasharray={dashArray}
                                        strokeDashoffset={dashOffset}
                                        className="transition-all duration-500 ease-out"
                                    />
                                );
                            })}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-light text-[#111b21] dark:text-gray-100">
                                {stats.total.toFixed(1)} <span className="text-sm font-medium">MB</span>
                            </span>
                            <span className="text-xs text-[#667781] dark:text-gray-500 uppercase font-medium">Used</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full max-w-xs">
                        {chartData.map(item => (
                            <div key={item.label} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-[#111b21] dark:text-gray-200">{item.label}</span>
                                    <span className="text-xs text-[#667781] dark:text-gray-500">{item.value.toFixed(1)} MB</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white dark:bg-wa-dark-paper mb-2 shadow-sm p-2 sticky top-0 z-10 border-b border-wa-border dark:border-gray-700">
                    <div className="flex gap-2">
                        {(['all', 'media', 'files'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors capitalize
                                    ${filter === f 
                                        ? 'bg-wa-teal text-white shadow-sm' 
                                        : 'bg-gray-100 dark:bg-wa-dark-hover text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                                    }
                                `}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chats List */}
                <div className="bg-white dark:bg-wa-dark-paper shadow-sm">
                    <h3 className="px-4 py-3 text-sm font-bold text-[#54656f] dark:text-gray-400 uppercase tracking-wide">
                        {filter === 'all' ? 'Manage Storage' : `Largest ${filter}`}
                    </h3>
                    
                    {stats.sortedChats.map(chat => {
                        const user = users[chat.contactId];
                        const name = chat.isGroup ? chat.groupName : user?.name;
                        const avatar = chat.isGroup ? 'https://picsum.photos/300' : user?.avatar;
                        
                        if (chat.size < 0.1) return null; // Hide empty chats

                        return (
                            <div key={chat.id} className="flex items-center gap-4 px-4 py-3 hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
                                <img src={avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[#111b21] dark:text-gray-100 font-medium truncate">{name}</h4>
                                    <p className="text-xs text-[#667781] dark:text-gray-500">
                                        {chat.isGroup ? `${chat.groupParticipants?.length} participants` : 'Contact'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-wa-teal dark:text-wa-teal font-bold text-sm block">
                                        {chat.size.toFixed(1)} MB
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                    
                    {stats.sortedChats.every(c => c.size < 0.1) && (
                        <div className="py-8 text-center text-gray-500 text-sm">
                            No significant data found for this filter.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SettingsTab = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, currentUser, updateUserProfile, language, setLanguage, logoEffect, setLogoEffect, appConfig, chatSettings, updateChatSettings } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editAbout, setEditAbout] = useState(currentUser.about);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showTransLangModal, setShowTransLangModal] = useState(false);
  const [showEffectModal, setShowEffectModal] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [showPasswordSettings, setShowPasswordSettings] = useState(false);
  const [showStorageSettings, setShowStorageSettings] = useState(false);
  const [showBlockedSettings, setShowBlockedSettings] = useState(false);

  const LANGUAGES = appConfig?.languages || ['English'];

  const handleSaveProfile = () => {
    if (editName.trim()) {
        updateUserProfile(editName, editAbout, editAvatar);
        setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(currentUser.name);
    setEditAbout(currentUser.about);
    setEditAvatar(currentUser.avatar);
    setIsEditing(false);
  };

  const SettingItem = ({ icon, label, sub, action, onClick }: { icon: React.ReactNode, label: string, sub?: string, action?: React.ReactNode, onClick?: () => void }) => (
      <div onClick={onClick} className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover active:bg-[#e9edef] dark:active:bg-wa-dark-paper transition-colors">
          <div className="text-[#667781] dark:text-gray-400">{icon}</div>
          <div className="flex-1">
              <h3 className="text-[16px] text-[#111b21] dark:text-gray-200">{label}</h3>
              {sub && <p className="text-[13px] text-[#667781] dark:text-gray-500">{sub}</p>}
          </div>
          {action && <div>{action}</div>}
      </div>
  );

  if (showChatSettings) {
      return <ChatSettingsScreen onClose={() => setShowChatSettings(false)} />;
  }

  if (showPasswordSettings) {
      return <PasswordSettingsScreen onClose={() => setShowPasswordSettings(false)} />;
  }

  if (showStorageSettings) {
      return <StorageSettingsScreen onClose={() => setShowStorageSettings(false)} />;
  }

  if (showBlockedSettings) {
      return <BlockedContactsScreen onClose={() => setShowBlockedSettings(false)} />;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-wa-dark-bg pb-20 overflow-y-auto transition-colors relative">
        
        {/* Desktop Header with Back Button - Only visible on md+ screens */}
        <div className="hidden md:flex h-[60px] bg-wa-grayBg dark:bg-wa-dark-header items-center gap-3 px-4 shrink-0 border-b border-wa-border dark:border-wa-dark-border text-[#111b21] dark:text-gray-100 transition-colors sticky top-0 z-10">
            <button onClick={() => navigate('/chats')} className="p-2 -ml-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-medium md:text-lg">Settings</h2>
        </div>

        {/* Language Modal */}
        {showLangModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-wa-dark-paper rounded-lg shadow-xl w-full max-w-sm flex flex-col max-h-[80vh]">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-[#111b21] dark:text-gray-100">App Language</h3>
                        <button onClick={() => setShowLangModal(false)}>
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>
                    <div className="overflow-y-auto p-2">
                        {LANGUAGES.map(lang => (
                            <div 
                                key={lang} 
                                onClick={() => { setLanguage(lang); setShowLangModal(false); }}
                                className="flex items-center justify-between p-3 hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover rounded-lg cursor-pointer"
                            >
                                <span className="text-[#111b21] dark:text-gray-100">{lang}</span>
                                {language === lang && <Check size={20} className="text-wa-teal" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Translation Language Modal */}
        {showTransLangModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-wa-dark-paper rounded-lg shadow-xl w-full max-w-sm flex flex-col max-h-[80vh]">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-[#111b21] dark:text-gray-100">Translation Target Language</h3>
                        <button onClick={() => setShowTransLangModal(false)}>
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>
                    <div className="overflow-y-auto p-2">
                        {LANGUAGES.map(lang => (
                            <div 
                                key={lang} 
                                onClick={() => { updateChatSettings({ translationLanguage: lang }); setShowTransLangModal(false); }}
                                className="flex items-center justify-between p-3 hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover rounded-lg cursor-pointer"
                            >
                                <span className="text-[#111b21] dark:text-gray-100">{lang}</span>
                                {chatSettings.translationLanguage === lang && <Check size={20} className="text-wa-teal" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Logo Effect Modal */}
        {showEffectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-wa-dark-paper rounded-lg shadow-xl w-full max-w-sm flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-[#111b21] dark:text-gray-100">Logo Effects</h3>
                        <button onClick={() => setShowEffectModal(false)}>
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>
                    <div className="p-2">
                        {LOGO_EFFECTS.map(effect => (
                            <div 
                                key={effect.id} 
                                onClick={() => { setLogoEffect(effect.id as any); setShowEffectModal(false); }}
                                className="flex items-center justify-between p-3 hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover rounded-lg cursor-pointer"
                            >
                                <span className="text-[#111b21] dark:text-gray-100">{effect.label}</span>
                                {logoEffect === effect.id && <Check size={20} className="text-wa-teal" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Profile Card */}
        <div className="flex gap-4 px-4 py-6 border-b border-wa-border dark:border-wa-dark-border hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover transition-colors items-start">
            <div className="relative shrink-0 mt-1">
                <img 
                    src={isEditing ? editAvatar : currentUser.avatar} 
                    alt="Me" 
                    className="w-16 h-16 rounded-full object-cover transition-all" 
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/200' }}
                />
                {isEditing && (
                     <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                         <Camera size={20} className="text-white opacity-80" />
                     </div>
                )}
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="absolute bottom-0 right-0 bg-wa-teal rounded-full p-1 text-white border-2 border-white dark:border-wa-dark-bg shadow-sm">
                        <Edit2 size={12} />
                    </button>
                )}
            </div>
            
            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <div className="flex flex-col gap-4 w-full animate-in fade-in duration-200">
                         {/* Name Field */}
                         <div className="flex flex-col gap-1">
                             <label className="text-[11px] font-bold text-wa-teal dark:text-wa-teal uppercase tracking-wider">Name</label>
                             <input 
                                type="text" 
                                value={editName} 
                                onChange={(e) => setEditName(e.target.value)} 
                                placeholder="Your Name"
                                className="bg-transparent border-b-2 border-wa-teal py-1 text-[#111b21] dark:text-gray-100 outline-none w-full text-base"
                            />
                         </div>

                         {/* About Field */}
                         <div className="flex flex-col gap-1">
                             <label className="text-[11px] font-bold text-wa-teal dark:text-wa-teal uppercase tracking-wider">About</label>
                             <input 
                                type="text" 
                                value={editAbout} 
                                onChange={(e) => setEditAbout(e.target.value)} 
                                placeholder="About"
                                className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-wa-teal py-1 text-sm text-[#111b21] dark:text-gray-100 outline-none w-full transition-colors"
                            />
                         </div>

                         {/* Avatar URL Field */}
                         <div className="flex flex-col gap-1">
                             <label className="text-[11px] font-bold text-wa-teal dark:text-wa-teal uppercase tracking-wider">Avatar URL</label>
                             <input 
                                type="text" 
                                value={editAvatar} 
                                onChange={(e) => setEditAvatar(e.target.value)} 
                                placeholder="https://..."
                                className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-wa-teal py-1 text-xs text-gray-500 dark:text-gray-400 outline-none w-full font-mono transition-colors"
                            />
                         </div>
                         
                        <div className="flex gap-3 mt-1 justify-end">
                            <button onClick={handleCancelEdit} className="text-sm text-wa-teal hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover px-4 py-2 rounded-full transition-colors font-medium">
                                Cancel
                            </button>
                            <button onClick={handleSaveProfile} className="text-sm bg-wa-teal text-white px-5 py-2 rounded-full shadow-sm hover:shadow-md hover:brightness-110 transition-all font-medium">
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col justify-center h-16">
                        <h2 className="text-xl text-[#111b21] dark:text-gray-100 font-medium truncate">{currentUser.name}</h2>
                        <p className="text-[#667781] dark:text-gray-400 truncate text-sm">{currentUser.about}</p>
                    </div>
                )}
            </div>
        </div>

        <div className="py-2">
            <SettingItem 
                onClick={toggleTheme}
                icon={theme === 'dark' ? <Moon size={24}/> : <Sun size={24}/>} 
                label="Appearance" 
                sub={`Theme: ${theme === 'dark' ? 'Dark' : 'Light'}`} 
            />
            
            <SettingItem 
                onClick={() => setShowLangModal(true)}
                icon={<Globe size={24}/>} 
                label="App Language" 
                sub={language} 
            />

            <SettingItem 
                onClick={() => setShowTransLangModal(true)}
                icon={<LanguagesIcon />} 
                label="Translation Language" 
                sub={chatSettings.translationLanguage || 'Select language'} 
            />

            <SettingItem 
                onClick={() => setShowEffectModal(true)}
                icon={<Sparkles size={24}/>} 
                label="Logo Effects" 
                sub={logoEffect === 'none' ? 'None' : logoEffect === 'shine' ? 'Shine Effect' : 'Wave Effect'} 
            />

            <SettingItem 
                onClick={() => setShowChatSettings(true)}
                icon={<MessageCircle size={24}/>} 
                label="Chats" 
                sub="Theme, wallpapers, colors, font size" 
            />

             <SettingItem 
                onClick={() => setShowPasswordSettings(true)}
                icon={<Key size={24}/>} 
                label="Security" 
                sub="Manage Passwords" 
            />

            <SettingItem 
                onClick={() => setShowBlockedSettings(true)}
                icon={<Ban size={24}/>} 
                label="Restricted Accounts" 
                sub="Manage blocked contacts" 
            />
            
            <SettingItem icon={<UserIcon size={24}/>} label="Privacy" sub="Block contacts, disappearing messages" />
            <SettingItem icon={<Bell size={24}/>} label="Notifications" sub="Message, group & call tones" />
            <SettingItem 
                onClick={() => setShowStorageSettings(true)}
                icon={<Database size={24}/>} 
                label="Storage and data" 
                sub="Network usage, auto-download" 
            />
            <SettingItem icon={<HelpCircle size={24}/>} label="Help" sub="Help center, contact us, privacy policy" />
        </div>
        
        <div className="mt-8 flex flex-col items-center text-[#667781] dark:text-gray-500 text-xs gap-1">
            <span>from</span>
            <span className="font-bold text-black dark:text-white text-sm">Meta</span>
        </div>
    </div>
  );
};

// Simple Icon Component for reuse
const LanguagesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 8 6 6" />
        <path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
        <path d="m22 22-5-10-5 10" />
        <path d="M14 18h6" />
    </svg>
);

export default SettingsTab;
