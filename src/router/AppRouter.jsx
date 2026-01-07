import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PrivateRoute from '../components/PrivateRoute';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyEmail from '../pages/auth/VerifyEmail';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Home from '../pages/dashboard/Home';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import VendorDashboard from '../pages/dashboard/VendorDashboard';
import MarketplaceHome from '../pages/marketplace/MarketplaceHome';
import MarketplaceItemDetails from '../pages/marketplace/MarketplaceItemDetails';
import CartPage from '../pages/marketplace/CartPage';
import ForumHome from '../pages/forum/ForumHome';
import NoticeFeed from '../pages/notices/NoticeFeed';
import ChatList from '../pages/chat/ChatList';
import IssueFeed from '../pages/issues/IssueFeed';
import ReportIssue from '../pages/issues/ReportIssue';
import Profile from '../pages/profile/Profile';
import RentHubHome from '../pages/renthub/RentHubHome';
import RentHubItemDetails from '../pages/renthub/RentHubItemDetails';
import CreateRentalListing from '../pages/renthub/CreateRentalListing';
import RentHubDashboard from '../pages/renthub/RentHubDashboard';

import PlaceholderPage from '../pages/PlaceholderPage';
import SettingsPage from '../pages/settings/SettingsPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';

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
        element: (
            <PrivateRoute>
                <Layout />
            </PrivateRoute>
        ),
        children: [
            {
                path: '/dashboard',
                element: <Home />,
            },
            {
                path: '/admin-dashboard',
                element: <AdminDashboard />,
            },
            {
                path: '/vendor-dashboard',
                element: <VendorDashboard />,
            },
            {
                path: '/marketplace',
                element: <MarketplaceHome />,
            },
            {
                path: '/marketplace/new',
                element: <PlaceholderPage title="Create New Listing" />,
            },
            {
                path: '/marketplace/:id',
                element: <MarketplaceItemDetails />,
            },
            {
                path: '/marketplace/cart',
                element: <CartPage />,
            },
            {
                path: '/renthub',
                element: <RentHubHome />,
            },
            {
                path: '/renthub/new',
                element: <CreateRentalListing />,
            },
            {
                path: '/renthub/:id',
                element: <RentHubItemDetails />,
            },
            {
                path: '/renthub/my-rentals',
                element: <RentHubDashboard />,
            },
            {
                path: '/forum',
                element: <ForumHome />,
            },
            {
                path: '/forum/new',
                element: <PlaceholderPage title="Start New Discussion" />,
            },
            {
                path: '/forum/:id',
                element: <PlaceholderPage title="Discussion Details" />,
            },
            {
                path: '/notices',
                element: <NoticeFeed />,
            },
            {
                path: '/notices/:id',
                element: <PlaceholderPage title="Notice Details" />,
            },
            {
                path: '/chat',
                element: <ChatList />,
            },
            {
                path: '/chat/:id',
                element: <ChatList />,
            },
            {
                path: '/issues',
                element: <IssueFeed />,
            },
            {
                path: '/issues/new',
                element: <ReportIssue />,
            },
            {
                path: '/profile/:id',
                element: <Profile />,
            },
            // New Routes from Dashboard
            { path: '/saved', element: <PlaceholderPage title="Saved Items" /> },
            { path: '/schedule', element: <PlaceholderPage title="Class Schedule" /> },
            { path: '/notifications', element: <NotificationsPage /> },
            { path: '/settings', element: <SettingsPage /> },
            { path: '/groups/:id', element: <PlaceholderPage title="Study Group" /> },

            // Vendor Routes
            { path: '/vendor/shop', element: <PlaceholderPage title="My Shop Settings" /> },
            { path: '/vendor/orders', element: <PlaceholderPage title="Vendor Orders" /> },
            { path: '/vendor/products', element: <PlaceholderPage title="Product Management" /> },
            { path: '/vendor/analytics', element: <PlaceholderPage title="Sales Analytics" /> },

            // Admin Routes
            { path: '/admin/users', element: <PlaceholderPage title="User Management" /> },
            { path: '/admin/approvals', element: <PlaceholderPage title="Pending Approvals" /> },
            { path: '/admin/reports', element: <PlaceholderPage title="System Reports" /> },
        ],
    },
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
