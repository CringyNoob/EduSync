import React from 'react';
import { MessageSquare, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Cards/Card';
import Button from '../../components/Button';

const ForumHome = () => {
    const discussions = [
        {
            id: 1,
            title: "Best places to study on campus?",
            author: "Sarah J.",
            category: "General",
            likes: 24,
            comments: 12,
            time: "2 hours ago"
        },
        {
            id: 2,
            title: "CS101 Final Exam Tips",
            author: "Mike T.",
            category: "Academics",
            likes: 56,
            comments: 34,
            time: "5 hours ago"
        },
        {
            id: 3,
            title: "Looking for roommates - Fall 2025",
            author: "Alex R.",
            category: "Housing",
            likes: 8,
            comments: 5,
            time: "1 day ago"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Student Forum</h1>
                <Button>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Start Discussion
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    {discussions.map((post) => (
                        <Card key={post.id} className="hover:border-blue-200 transition-colors cursor-pointer">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 mb-2">
                                            {post.category}
                                        </span>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{post.title}</h3>
                                        <p className="text-sm text-gray-500">Posted by {post.author} • {post.time}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-4 text-gray-500">
                                    <button className="flex items-center gap-1 hover:text-blue-600 text-sm">
                                        <ThumbsUp className="h-4 w-4" />
                                        {post.likes}
                                    </button>
                                    <button className="flex items-center gap-1 hover:text-blue-600 text-sm">
                                        <MessageCircle className="h-4 w-4" />
                                        {post.comments}
                                    </button>
                                    <button className="flex items-center gap-1 hover:text-blue-600 text-sm ml-auto">
                                        <Share2 className="h-4 w-4" />
                                        Share
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Popular Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {['General', 'Academics', 'Housing', 'Events', 'Career'].map((cat) => (
                                    <div key={cat} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                        <span className="text-gray-700">{cat}</span>
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">120+</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ForumHome;
