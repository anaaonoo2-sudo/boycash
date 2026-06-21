/* Developed & Owned by Bouchibat - bouchibattauomi@gmail.com - 2026 */
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Earn from "./pages/Earn";
import Wallet from "./pages/Wallet";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Assistant from "./pages/Assistant";
import AdminDashboard from "./pages/AdminDashboard";
import Support from "./pages/Support";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import SplashScreen from "./components/SplashScreen";
import "./lib/i18n";

StatusBar.setStyle({ style: Style.Dark });
StatusBar.setBackgroundColor({ color: "#00000000" });
StatusBar.setOverlaysWebView({ overlay: true });

export default function App() {
  const [splash, setSplash] = useState(true);
  return (
    <>
      {splash && <SplashScreen onDone={() => setSplash(false)} />}
      <AuthProvider>
        <AppProvider>
          <Router>
            <Toaster position="top-center" reverseOrder={false} />
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/earn" element={<Earn />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/assistant" element={<Assistant />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/support" element={<Support />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
              </Routes>
            </Layout>
          </Router>
        </AppProvider>
      </AuthProvider>
    </>
  );
}
