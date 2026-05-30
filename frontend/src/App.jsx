import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BrandProfiles from './pages/BrandProfiles';
import ProductInputs from './pages/ProductInputs';
import Offers from './pages/Offers';
import FrameworkTemplates from './pages/FrameworkTemplates';
import Campaigns from './pages/Campaigns';
import CampaignNew from './pages/CampaignNew';
import CampaignDetail from './pages/CampaignDetail';
import SharePublic from './pages/SharePublic';
import ShareLinks from './pages/ShareLinks';
import ExportBundles from './pages/ExportBundles';
import Variants from './pages/Variants';
import VideoAssets from './pages/VideoAssets';
import Jobs from './pages/Jobs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/share/:token" element={<SharePublic />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/brand-vault"
          element={
            <ProtectedRoute>
              <BrandProfiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductInputs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/offers"
          element={
            <ProtectedRoute>
              <Offers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/frameworks"
          element={
            <ProtectedRoute>
              <FrameworkTemplates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaigns"
          element={
            <ProtectedRoute>
              <Campaigns />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaigns/new"
          element={
            <ProtectedRoute>
              <CampaignNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaigns/:id"
          element={
            <ProtectedRoute>
              <CampaignDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/share-links"
          element={
            <ProtectedRoute>
              <ShareLinks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exports"
          element={
            <ProtectedRoute>
              <ExportBundles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/variants"
          element={
            <ProtectedRoute>
              <Variants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video-assets"
          element={
            <ProtectedRoute>
              <VideoAssets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
