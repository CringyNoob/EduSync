import React from 'react';
import { Bell, Calendar, Pin } from 'lucide-react';
import { Card, CardContent } from '../../components/Cards/Card';

const NoticeFeed = () => {
    const notices = [
        {
            id: 1,
            title: "University Library Hours Extended",
            content: "Starting next week, the main library will be open 24/7 for finals preparation.",
            date: "Dec 10, 2025",
            type: "General",
            pinned: true
        },
        {
            id: 2,
            title: "Campus Maintenance Scheduled",
            content: "Water supply will be interrupted in Block A on Saturday from 9 AM to 12 PM.",
            date: "Dec 08, 2025",
            type: "Maintenance",
            pinned: false
        },
        {
            id: 3,
            title: "Guest Lecture: AI in Healthcare",
            content: "Join us for a special lecture by Dr. Smith in the Main Auditorium.",
            date: "Dec 07, 2025",
            type: "Event",
            pinned: false
        }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>

            <div className="grid gap-4">
                {notices.map((notice) => (
                    <Card key={notice.id} className={`transition-all hover:shadow-md ${notice.pinned ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${notice.pinned ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {notice.pinned ? <Pin className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                                            {notice.pinned && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Pinned</span>}
                                        </div>
                                        <p className="text-gray-600 mb-3">{notice.content}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {notice.date}
                                            </span>
                                            <span className="bg-gray-100 px-2 py-0.5 rounded-full">{notice.type}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default NoticeFeed;
