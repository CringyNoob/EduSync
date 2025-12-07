import React from 'react';
import { Search, MoreVertical } from 'lucide-react';
import Input from '../../components/Form/Input';

const ChatList = () => {
    const chats = [
        { id: 1, name: "Study Group A", lastMessage: "See you at the library!", time: "10:30 AM", unread: 2, avatar: "bg-blue-200" },
        { id: 2, name: "John Doe", lastMessage: "Can you share the notes?", time: "Yesterday", unread: 0, avatar: "bg-green-200" },
        { id: 3, name: "Project Team", lastMessage: "Meeting rescheduled to 5 PM", time: "Yesterday", unread: 5, avatar: "bg-purple-200" },
    ];

    return (
        <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input placeholder="Search chats..." className="pl-10 bg-white" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map((chat) => (
                        <div key={chat.id} className="flex items-center gap-3 p-4 hover:bg-white cursor-pointer transition-colors border-b border-gray-100 last:border-0">
                            <div className={`h-10 w-10 rounded-full ${chat.avatar} flex items-center justify-center text-sm font-bold text-gray-700`}>
                                {chat.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                                    <span className="text-xs text-gray-500">{chat.time}</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                            </div>
                            {chat.unread > 0 && (
                                <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-medium">
                                    {chat.unread}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window Placeholder */}
            <div className="flex-1 flex flex-col items-center justify-center bg-white text-center p-8">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MoreVertical className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500 max-w-sm">Choose a chat from the list to start messaging your classmates or groups.</p>
            </div>
        </div>
    );
};

export default ChatList;
