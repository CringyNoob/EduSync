import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import Input from '../../components/Form/Input';
import Button from '../../components/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/Cards/Card';

const ForgotPassword = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                            <GraduationCap size={32} />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
                    <p className="text-sm text-gray-500">No worries, we'll send you reset instructions.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input label="Email" type="email" placeholder="student@university.edu" />
                    <Button className="w-full">Reset Password</Button>
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

export default ForgotPassword;
