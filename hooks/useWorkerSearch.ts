
import { useState, useEffect, useRef } from 'react';
import { createWorker } from '../utils/searchWorker';
import { Chat, Message, User } from '../types';

interface UseWorkerChatSearchProps {
    chats: Chat[];
    users: Record<string, User>;
    searchQuery: string;
    activeFilter: string;
}

interface UseWorkerMessageSearchProps {
    messages: Message[];
    searchQuery: string;
}

export const useWorkerChatSearch = ({ chats, users, searchQuery, activeFilter }: UseWorkerChatSearchProps) => {
    const [sortedChats, setSortedChats] = useState<Chat[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        workerRef.current = createWorker();
        workerRef.current.onmessage = (e) => {
            if (e.data.type === 'FILTER_CHATS_RESULT') {
                setSortedChats(e.data.result);
                setIsSearching(false);
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    useEffect(() => {
        if (workerRef.current) {
            setIsSearching(true);
            workerRef.current.postMessage({
                type: 'FILTER_CHATS',
                payload: { chats, users, query: searchQuery, activeFilter }
            });
        }
    }, [chats, users, searchQuery, activeFilter]);

    return { sortedChats, isSearching };
};

export const useWorkerMessageSearch = ({ messages, searchQuery }: UseWorkerMessageSearchProps) => {
    const [filteredMessages, setFilteredMessages] = useState<Message[]>(messages);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        workerRef.current = createWorker();
        workerRef.current.onmessage = (e) => {
            if (e.data.type === 'FILTER_MESSAGES_RESULT') {
                setFilteredMessages(e.data.result);
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    useEffect(() => {
        if (workerRef.current) {
            workerRef.current.postMessage({
                type: 'FILTER_MESSAGES',
                payload: { messages, query: searchQuery }
            });
        }
    }, [messages, searchQuery]);

    return { filteredMessages };
};
