
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCall } from '../context/CallContext';
import { useGame } from '../context/GameContext';
import { useWorkerMessageSearch } from './useWorkerSearch';
import { Message, PollData } from '../types';

export const useChatWindowController = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    
    // Global Context Access (Model)
    const { 
        chats, messages, users, currentUser, addMessage, deleteMessages, 
        togglePinMessage, addReaction, currentUserId, chatSettings, 
        toggleDateLock, securitySettings, drafts, setDraft, votePoll
    } = useApp();
    const { startCall } = useCall();
    const { openGameInvite } = useGame();

    // Local State (View State)
    const [inputText, setInputText] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
    const [translatedMessages, setTranslatedMessages] = useState<Set<string>>(new Set());
    
    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const recordingTimerRef = useRef<any>(null);

    // Search & UI State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [messageSearchQuery, setMessageSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [dateLockTarget, setDateLockTarget] = useState<string | null>(null);
    const [lockPin, setLockPin] = useState('');
    const [lockError, setLockError] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Computed Data
    const chat = chats.find(c => c.id === chatId);
    const rawChatMessages = (chatId && messages[chatId]) ? messages[chatId] : [];
    const contact = chat ? (chat.isGroup ? null : users[chat.contactId]) : null;

    // Use Worker for Message Filtering
    const { filteredMessages: chatMessages } = useWorkerMessageSearch({
        messages: rawChatMessages,
        searchQuery: messageSearchQuery
    });

    // --- Draft Logic ---
    useEffect(() => {
        // Restore draft when chat changes
        if (chatId) {
            setInputText(drafts[chatId] || '');
        }
    }, [chatId]); // Only when ID changes

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setInputText(text);
        if (chatId) {
            setDraft(chatId, text);
        }
    };

    // Effects
    useEffect(() => {
        if (messagesEndRef.current && !messageSearchQuery) {
             messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [chatMessages.length, chatId, messageSearchQuery]);

    // Logic Handlers
    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!chatId || !inputText.trim()) return;
        addMessage(chatId, inputText, 'text', replyTo?.id);
        setInputText('');
        setDraft(chatId, ''); // Clear draft
        setReplyTo(null);
        setShowAttachMenu(false); // Close menu on send
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Recording Logic
    const startRecording = () => {
        setIsRecording(true);
        setRecordingSeconds(0);
        recordingTimerRef.current = setInterval(() => {
            setRecordingSeconds(prev => prev + 1);
        }, 1000);
    };

    const cancelRecording = () => {
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        setIsRecording(false);
        setRecordingSeconds(0);
    };

    const finishRecording = () => {
        if (!chatId) return;
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        const mins = Math.floor(recordingSeconds / 60);
        const secs = recordingSeconds % 60;
        const duration = `${mins}:${secs.toString().padStart(2, '0')}`;
        
        addMessage(chatId, "🎤 Voice Message", 'voice', undefined, undefined, duration);
        setIsRecording(false);
        setRecordingSeconds(0);
    };

    // Selection & Message Action Logic
    const handleReply = (msg: Message) => {
        setReplyTo(msg);
        setActiveMessageId(null);
    };

    const handleTranslate = (msgId: string) => {
        const newSet = new Set(translatedMessages);
        if (newSet.has(msgId)) newSet.delete(msgId);
        else newSet.add(msgId);
        setTranslatedMessages(newSet);
        setActiveMessageId(null);
    };
    
    const toggleSelection = (msgId: string) => {
        const newSet = new Set(selectedMessages);
        if (newSet.has(msgId)) {
            newSet.delete(msgId);
            if (newSet.size === 0) setIsSelectionMode(false);
        } else {
            newSet.add(msgId);
            setIsSelectionMode(true);
        }
        setSelectedMessages(newSet);
        setActiveMessageId(null);
    };

    const handleDeleteSelected = () => {
        if (chatId) {
            deleteMessages(chatId, Array.from(selectedMessages), true);
            setSelectedMessages(new Set());
            setIsSelectionMode(false);
        }
    };

    const handleSendPoll = (data: PollData) => {
        if (!chatId) return;
        addMessage(chatId, "Poll", 'poll', undefined, undefined, undefined, data);
        setShowAttachMenu(false);
    };

    const handleVote = (msgId: string, optionIds: string[]) => {
        if (chatId) votePoll(chatId, msgId, optionIds);
    };

    // Date Lock Logic
    const handleLockVerify = (e: React.FormEvent) => {
        e.preventDefault();
        const correctPin = securitySettings.dailyLockPassword || '1234';
        if (lockPin === correctPin) {
            if (chatId && dateLockTarget) toggleDateLock(chatId, dateLockTarget);
            setDateLockTarget(null);
        } else {
            setLockError('Incorrect PIN');
            setLockPin('');
        }
    };

    const navigateToChats = useCallback(() => navigate('/chats'), [navigate]);
    const navigateToInfo = useCallback(() => navigate(`/chat/${chatId}/info`), [navigate, chatId]);

    return {
        // Data
        chatId,
        chat,
        contact,
        chatMessages, // Now returned from worker hook
        users,
        currentUser,
        currentUserId,
        chatSettings,
        
        // State
        inputText, setInputText: handleInputChange, // Use the draft-aware handler
        showPicker, setShowPicker,
        showAttachMenu, setShowAttachMenu,
        activeMessageId, setActiveMessageId,
        replyTo, setReplyTo,
        isSelectionMode, setIsSelectionMode,
        selectedMessages, setSelectedMessages,
        translatedMessages,
        isRecording,
        recordingSeconds,
        isSearchOpen, setIsSearchOpen,
        messageSearchQuery, setMessageSearchQuery,
        isMenuOpen, setIsMenuOpen,
        dateLockTarget, setDateLockTarget,
        lockPin, setLockPin,
        lockError, setLockError,
        
        // Refs
        messagesEndRef,
        chatContainerRef,

        // Actions
        handleSendMessage,
        handleKeyDown,
        startRecording,
        cancelRecording,
        finishRecording,
        handleReply,
        handleTranslate,
        toggleSelection,
        handleDeleteSelected,
        handleLockVerify,
        addMessage,
        handleSendPoll,
        handleVote,
        
        // Navigation / External
        navigateToChats,
        navigateToInfo,
        startCall,
        openGameInvite,
        deleteMessages,
        togglePinMessage,
        addReaction,
        securitySettings
    };
};
