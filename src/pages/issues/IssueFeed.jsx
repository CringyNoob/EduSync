import React from 'react';
import { AlertCircle, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '../../components/Cards/Card';
import Button from '../../components/Button';

const IssueFeed = () => {
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Issue Reporting</h1>
                <Button>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Report Issue
                </Button>
            </div>

            <div className="grid gap-4">
                {issues.map((issue) => (
                    <Card key={issue.id}>
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                                            {issue.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm">{issue.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {issue.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {issue.date}
                                        </span>
                                    </div>
                                </div>
                                {issue.status === 'Open' && (
                                    <Button variant="outline" size="sm">Mark as Resolved</Button>
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
