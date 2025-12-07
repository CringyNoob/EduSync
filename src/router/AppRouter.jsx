import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyEmail from '../pages/auth/VerifyEmail';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Home from '../pages/dashboard/Home';
import MarketplaceHome from '../pages/marketplace/MarketplaceHome';
import MarketplaceItemDetails from '../pages/marketplace/MarketplaceItemDetails';
import ForumHome from '../pages/forum/ForumHome';
import NoticeFeed from '../pages/notices/NoticeFeed';
import ChatList from '../pages/chat/ChatList';
import IssueFeed from '../pages/issues/IssueFeed';
import Profile from '../pages/profile/Profile';

const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/verify-email',
        element: <VerifyEmail />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />,
    },
    {
        element: <Layout />,
        children: [
            {
                path: '/dashboard',
                element: <Home />,
            },
            {
                path: '/marketplace',
                element: <MarketplaceHome />,
            },
            {
                path: '/marketplace/:id',
                element: <MarketplaceItemDetails />,
            },
            {
                path: '/forum',
                element: <ForumHome />,
            },
            {
                path: '/notices',
                element: <NoticeFeed />,
            },
            {
                path: '/chat',
                element: <ChatList />,
            },
            {
                path: '/issues',
                element: <IssueFeed />,
            },
            {
                path: '/profile/:id',
                element: <Profile />,
            },
        ],
    },
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
