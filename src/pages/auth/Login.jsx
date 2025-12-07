import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import Input from '../../components/Form/Input';
import Button from '../../components/Button';

const Login = () => {
    const navigate = useNavigate();
    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side - Form */}
            <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-10">
                        <Link to="/" className="flex items-center text-sm font-medium text-gray-500 hover:text-brand-purple transition-colors mb-6">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-brand-purple-dark p-2 rounded-lg">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">EduSync</span>
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome back</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Input label="University Email" type="email" placeholder="student@university.edu" />
                            <Input label="Password" type="password" placeholder="••••••••" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
                                />
                                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-brand-purple hover:text-brand-purple-dark">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <Button
                                className="w-full h-11 bg-brand-purple-dark hover:bg-brand-purple text-white shadow-lg shadow-brand-purple/20"
                                onClick={() => navigate('/dashboard')}
                            >
                                Sign in
                            </Button>
                        </div>

                        <div className="relative mt-6">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">Don't have an account?</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                variant="outline"
                                className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
                                onClick={() => navigate('/register')}
                            >
                                Create an account
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Brand */}
            <div className="relative hidden w-0 flex-1 lg:block">
                <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-brand-purple-dark to-brand-purple">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80')] mix-blend-overlay opacity-20 bg-cover bg-center"></div>
                    <div className="flex h-full flex-col justify-center px-20 text-white">
                        <h2 className="text-4xl font-bold mb-6">Connect. Collaborate. Succeed.</h2>
                        <p className="text-lg text-blue-100 max-w-md">
                            Join the platform that empowers your academic journey. Access resources, connect with peers, and stay organized.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
