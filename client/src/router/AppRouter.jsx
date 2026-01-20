import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
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
import PublicVendorProfile from '../pages/marketplace/PublicVendorProfile';
import CartPage from '../pages/marketplace/CartPage';
import NewsBoxHome from '../pages/newsbox/NewsBoxHome';
import NewsManagement from '../pages/newsbox/NewsManagement';
import NoticeFeed from '../pages/notices/NoticeFeed';
import ChatList from '../pages/chat/ChatList';
import IssueFeed from '../pages/issues/IssueFeed';
import ReportIssue from '../pages/issues/ReportIssue';
import Profile from '../pages/profile/Profile';
import RentHubHome from '../pages/renthub/RentHubHome';
import RentHubItemDetails from '../pages/renthub/RentHubItemDetails';
import RentHubNewListing from '../pages/renthub/RentHubNewListing';
import RentHubDashboard from '../pages/renthub/RentHubDashboard';
import VendorRegistration from '../pages/vendor/VendorRegistration';
import VendorPayment from '../pages/vendor/VendorPayment';
import VendorShop from '../pages/vendor/VendorShop';
import VendorOrders from '../pages/vendor/VendorOrders';
import VendorProducts from '../pages/vendor/VendorProducts';
import VendorAnalytics from '../pages/vendor/VendorAnalytics';

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
        path: '/admin-dashboard',
        element: <AdminDashboard />,
    },
    {
        element: <Layout />,
        children: [
            {
                path: '/vendor-dashboard',
                element: <VendorDashboard />,
            },
            {
                path: '/dashboard',
                element: <Home />,
            },
            {
                path: '/marketplace',
                element: <MarketplaceHome />,
            },
            {
                path: '/marketplace/foods',
                element: <MarketplaceHome />,
            },
            {
                path: '/marketplace/pre-owned',
                element: <MarketplaceHome />,
            },
            {
                path: '/marketplace/shops',
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
                path: '/marketplace/vendor/:vendorId',
                element: <PublicVendorProfile />,
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
                element: <RentHubNewListing />,
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
                path: '/newsbox',
                element: <NewsBoxHome />,
            },
            {
                path: '/newsbox/manage',
                element: <NewsManagement />,
            },
            {
                path: '/newsbox/new',
                element: <PlaceholderPage title="Create News Post" />,
            },
            {
                path: '/newsbox/:id',
                element: <PlaceholderPage title="News Details" />,
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
            { path: '/vendor/register', element: <VendorRegistration /> },
            { path: '/vendor/payment', element: <VendorPayment /> },
            { path: '/vendor/shop', element: <VendorShop /> },
            { path: '/vendor/orders', element: <VendorOrders /> },
            { path: '/vendor/products', element: <VendorProducts /> },
            { path: '/vendor/analytics', element: <VendorAnalytics /> },

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
