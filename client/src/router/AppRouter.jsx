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
import MarketplaceLanding from '../pages/marketplace/MarketplaceLanding';
import MarketplaceItemDetails from '../pages/marketplace/MarketplaceItemDetails';
import PublicVendorProfile from '../pages/marketplace/PublicVendorProfile';
import CartPage from '../pages/marketplace/CartPage';
// New separate marketplace pages
import FoodMarketplace from '../pages/marketplace/FoodMarketplace';
import ShopsMarketplace from '../pages/marketplace/ShopsMarketplace';
import PreownedMarketplace from '../pages/marketplace/PreownedMarketplace';
import FoodItemDetails from '../pages/marketplace/FoodItemDetails';
import ShopItemDetails from '../pages/marketplace/ShopItemDetails';
import PreownedItemDetails from '../pages/marketplace/PreownedItemDetails';
import NewsBoxHome from '../pages/newsbox/NewsBoxHome';
import NewsManagement from '../pages/newsbox/NewsManagement';
import NoticeFeed from '../pages/notices/NoticeFeed';
// Chat pages
import ChatListPage from '../pages/chat/ChatListPage';
import ChatRoom from '../pages/chat/ChatRoom';
import IssueFeed from '../pages/issues/IssueFeed';
import ReportIssue from '../pages/issues/ReportIssue';
import IssueDetails from '../pages/issues/IssueDetails';
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
import VendorChats from '../pages/vendor/VendorChats';
import MyOrders from '../pages/orders/MyOrders';
// Admin pages
import AdminUsers from '../pages/admin/AdminUsers';
import AdminVendors from '../pages/admin/AdminVendors';
import AdminNewsManager from '../pages/admin/AdminNewsManager';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminIssues from '../pages/admin/AdminIssues';
import AdminRentals from '../pages/admin/AdminRentals';
import AdminActivityLog from '../pages/admin/AdminActivityLog';

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
        element: <Layout />,
        children: [
            {
                path: '/admin-dashboard',
                element: <AdminDashboard />,
            },
            {
                path: '/vendor-dashboard',
                element: <VendorDashboard />,
            },
            {
                path: '/dashboard',
                element: <Home />,
            },
            {
                path: '/my-orders',
                element: <MyOrders />,
            },
            // Main marketplace landing page
            {
                path: '/marketplace',
                element: <MarketplaceLanding />,
            },
            // Food Marketplace routes
            {
                path: '/marketplace/foods',
                element: <FoodMarketplace />,
            },
            {
                path: '/marketplace/foods/:id',
                element: <FoodItemDetails />,
            },
            {
                path: '/marketplace/foods/cart',
                element: <CartPage section="foods" />,
            },
            // Pre-owned Marketplace routes
            {
                path: '/marketplace/pre-owned',
                element: <PreownedMarketplace />,
            },
            {
                path: '/marketplace/pre-owned/:id',
                element: <PreownedItemDetails />,
            },
            // Shops Marketplace routes
            {
                path: '/marketplace/shops',
                element: <ShopsMarketplace />,
            },
            {
                path: '/marketplace/shops/:id',
                element: <ShopItemDetails />,
            },
            {
                path: '/marketplace/shops/cart',
                element: <CartPage section="shops" />,
            },
            // Legacy routes for backward compatibility
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
            // Chat Routes (User personal chats)
            {
                path: '/chat',
                element: <ChatListPage />,
            },
            {
                path: '/chat/:conversationId',
                element: <ChatListPage />,
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
                path: '/issues/:id',
                element: <IssueDetails />,
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
            // Vendor Chat Routes (Customer messages to vendor)
            { path: '/vendor/chats', element: <VendorChats /> },
            { path: '/vendor/chats/:conversationId', element: <VendorChats /> },

            // Admin Routes
            { path: '/admin/users', element: <AdminUsers /> },
            { path: '/admin/vendors', element: <AdminVendors /> },
            { path: '/admin/rentals', element: <AdminRentals /> },
            { path: '/admin/newsManager', element: <AdminNewsManager /> },
            { path: '/admin/analytics', element: <AdminAnalytics /> },
            { path: '/admin/issues', element: <AdminIssues /> },
            { path: '/admin/activities', element: <AdminActivityLog /> },
        ],
    },
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
