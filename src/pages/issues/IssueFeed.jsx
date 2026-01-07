import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '../../components/Cards/Card';
import Button from '../../components/Button';

const IssueFeed = () => {
    const navigate = useNavigate();
    const issues = [
        {
            id: 1,
            title: "Broken Projector in Room 301",
            location: "Science Building, 3rd Floor",
            status: "Open",
            date: "2 hours ago",
            description: "The projector won't turn on during lectures."
        },
        {
            id: 2,
            title: "Water Leak in Hallway",
            location: "Dormitory Block B",
            status: "In Progress",
            date: "1 day ago",
            description: "Water is dripping from the ceiling near the elevator."
        },
        {
            id: 3,
            title: "Wifi Connectivity Issues",
            location: "Library",
            status: "Resolved",
            date: "3 days ago",
            description: "Cannot connect to EduRoam in the quiet study area."
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'text-red-600 bg-red-50';
            case 'In Progress': return 'text-orange-600 bg-orange-50';
            case 'Resolved': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Issue Reporting</h1>
                    <p className="text-gray-500 font-medium">Track and report maintenance issues on campus.</p>
                </div>
                <Button
                    onClick={() => navigate('/issues/new')}
                    className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30"
                >
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Report Issue
                </Button>
            </div>

            <div className="grid gap-4">
                {issues.map((issue) => (
                    <Card key={issue.id} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-gray-900">{issue.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(issue.status)}`}>
                                            {issue.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-base leading-relaxed">{issue.description}</p>
                                    <div className="flex items-center gap-6 text-sm text-gray-400 font-medium pt-1">
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            {issue.location}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            {issue.date}
                                        </span>
                                    </div>
                                </div>
                                {issue.status === 'Open' && (
                                    <Button variant="outline" size="sm" className="rounded-lg text-xs font-bold shrink-0">
                                        <CheckCircle2 className="mr-1 h-3 w-3" /> Mark Resolved
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default IssueFeed;
