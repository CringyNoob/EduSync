import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail } from 'lucide-react';
import Button from '../../components/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/Cards/Card';

const VerifyEmail = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                            <Mail size={32} />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                    <p className="text-sm text-gray-500">We sent a verification link to student@university.edu</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Click the link in the email to verify your account. If you don't see it, check your spam folder.
                    </p>
                    <Button className="w-full" variant="outline">Resend Email</Button>
                </CardContent>
                <CardFooter className="justify-center">
                    <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        Back to Sign in
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default VerifyEmail;
