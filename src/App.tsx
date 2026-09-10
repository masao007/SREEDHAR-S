import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import InteractiveMap from './components/InteractiveMap';
import FeaturedJobs from './components/FeaturedJobs';
import EarningsTracker from './components/EarningsTracker';
import HowItWorks from './components/HowItWorks';
import JobCategories from './components/JobCategories';
import EmployerSection from './components/EmployerSection';
import ReviewsSection from './components/ReviewsSection';
import PricingSection from './components/PricingSection';
import Footer from './components/Footer';

import ApplicationModal from './components/ApplicationModal';
import PostJobModal from './components/PostJobModal';
import UserProfileModal from './components/UserProfileModal';
import AIMatchingModal from './components/AIMatchingModal';
import ArchitectureDocsModal from './components/ArchitectureDocsModal';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';

import { Job, UserProfile, Notification, EarningsSummary } from './types';
import {
  INITIAL_JOBS,
  INITIAL_WORKER,
  INITIAL_NOTIFICATIONS,
  INITIAL_EARNINGS_SUMMARY,
} from './data/mockData';
import { Layers, Sparkles } from 'lucide-react';

function MoneyMakerApp() {
  const { profile, updateProfileData, toggleRole, openAuthModal, firebaseUser } = useAuth();
  
  // Use profile from Auth context if available, otherwise fallback
  const user = profile || INITIAL_WORKER;
  
  // State
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary>(INITIAL_EARNINGS_SUMMARY);

  // Search & Geolocation Filters
  const [currentCity, setCurrentCity] = useState('Chennai, TN');
  const [userLat, setUserLat] = useState(13.0827);
  const [userLng, setUserLng] = useState(80.2707);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [radiusKm, setRadiusKm] = useState(10);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  // Modals
  const [isAIMatcherOpen, setIsAIMatcherOpen] = useState(false);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);

  // Fetch Nearby Jobs from Backend API
  const fetchNearbyJobs = useCallback(async () => {
    setIsLoadingJobs(true);
    try {
      const params = new URLSearchParams({
        lat: userLat.toString(),
        lng: userLng.toString(),
        radius_km: radiusKm.toString(),
        category: selectedCategory,
        search: searchQuery,
      });

      const res = await fetch(`/api/jobs/nearby?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
        }
      }
    } catch (err) {
      console.warn('API fetch fallback to local state:', err);
    } finally {
      setIsLoadingJobs(false);
    }
  }, [userLat, userLng, radiusKm, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchNearbyJobs();
  }, [fetchNearbyJobs]);

  // Fetch Earnings Summary
  useEffect(() => {
    fetch('/api/earnings/summary')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.summary) setEarningsSummary(data.summary);
      })
      .catch((e) => console.warn(e));
  }, []);

  // Handlers
  const handleCityChange = (city: string, lat: number, lng: number) => {
    setCurrentCity(city);
    setUserLat(lat);
    setUserLng(lng);
  };

  const handleRoleToggle = () => {
    toggleRole();
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleApplyJob = (job: Job) => {
    setSelectedJobForApply(job);
  };

  const handleSubmitApplication = async (jobId: string, message: string) => {
    try {
      const res = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          workerId: user.id,
          workerName: user.name,
          workerPhone: user.phone,
          message,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.notification) {
          setNotifications((prev) => [data.notification, ...prev]);
        }
      } else {
        // Fallback local notification
        const targetJob = jobs.find((j) => j.id === jobId);
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            title: `Application Sent: ${targetJob?.title || 'Job'}`,
            message: `Your profile was shared with ${targetJob?.employer_name || 'Employer'}. Expect a call shortly!`,
            time: 'Just now',
            read: false,
            type: 'job_alert',
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJobCreated = async (newJobData: any) => {
    try {
      const res = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newJobData,
          employer_id: user.id,
          employer_name: user.name,
        }),
      });

      const data = await res.json();
      if (data.job) {
        setJobs((prev) => [data.job, ...prev]);
        if (data.notification) {
          setNotifications((prev) => [data.notification, ...prev]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestPayout = async (amount: number, upiId: string) => {
    const res = await fetch('/api/payments/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: user.id,
        amount,
        upiId,
      }),
    });

    const data = await res.json();
    if (data.notification) {
      setNotifications((prev) => [data.notification, ...prev]);
    }

    setEarningsSummary((prev) => ({
      ...prev,
      currentMonthEarned: Math.max(0, prev.currentMonthEarned - amount),
    }));
  };

  const handleUpdateUserSkills = (skills: string[], availability: UserProfile['availability']) => {
    updateProfileData({
      skills,
      availability,
    });
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    await updateProfileData(updated);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#f2f2f2] selection:bg-[#35be35] selection:text-[#080808] font-sans antialiased overflow-x-hidden">
      {/* Navigation Header */}
      <Navbar
        user={user}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onRoleToggle={handleRoleToggle}
        onOpenAIMatcher={() => setIsAIMatcherOpen(true)}
        onOpenPostJob={() => setIsPostJobOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenArchitectureDocs={() => setIsDocsOpen(true)}
      />

      {/* Main Content */}
      <main>
        {/* 1. Hero & Location Search */}
        <HeroSection
          currentCity={currentCity}
          onCityChange={handleCityChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={fetchNearbyJobs}
          onOpenAIMatcher={() => setIsAIMatcherOpen(true)}
          onOpenPostJob={() => setIsPostJobOpen(true)}
          jobsCount={jobs.length}
        />

        {/* 2. Interactive Dark-Mode Radar Map (Leaflet) */}
        <InteractiveMap
          jobs={jobs}
          userLat={userLat}
          userLng={userLng}
          currentCity={currentCity}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          radiusKm={radiusKm}
          onRadiusChange={setRadiusKm}
          onQuickApply={handleApplyJob}
          onCityChange={handleCityChange}
        />

        {/* 3. Featured Verified Openings & AI Recommendation Card */}
        <FeaturedJobs
          jobs={jobs}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          radiusKm={radiusKm}
          onRadiusChange={setRadiusKm}
          onApplyJob={handleApplyJob}
          onOpenAIMatcher={() => setIsAIMatcherOpen(true)}
        />

        {/* 4. Dynamic Earnings Analytics Chart (Recharts) */}
        <EarningsTracker
          summary={earningsSummary}
          onRequestPayout={handleRequestPayout}
        />

        {/* 5. How It Works */}
        <HowItWorks />

        {/* 6. Explore Job Categories */}
        <JobCategories onSelectCategory={setSelectedCategory} />

        {/* 7. For Employers & Local Businesses */}
        <EmployerSection onOpenPostJob={() => setIsPostJobOpen(true)} />

        {/* 8. Worker & Business Testimonials */}
        <ReviewsSection />

        {/* 9. Transparent Pricing */}
        <PricingSection
          onOpenPostJob={() => setIsPostJobOpen(true)}
          onOpenAIMatcher={() => setIsAIMatcherOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenArchitectureDocs={() => setIsDocsOpen(true)}
        onOpenAIMatcher={() => setIsAIMatcherOpen(true)}
        onOpenPostJob={() => setIsPostJobOpen(true)}
      />

      {/* Floating Blueprint Quick-Action */}
      <button
        onClick={() => setIsDocsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#161616] hover:bg-[#202020] text-[#5cd65c] border border-[#35be35]/40 hover:border-[#35be35] px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-bold transition-all cursor-pointer hover:scale-105"
      >
        <Layers className="w-4 h-4 text-[#35be35]" />
        <span>Architecture & SQL Blueprint</span>
      </button>

      {/* Modals & Drawers */}
      <AuthModal />

      <AIMatchingModal
        isOpen={isAIMatcherOpen}
        onClose={() => setIsAIMatcherOpen(false)}
        user={user}
        jobs={jobs}
        onApplyJob={handleApplyJob}
        onUpdateUserSkills={handleUpdateUserSkills}
      />

      <ApplicationModal
        job={selectedJobForApply}
        user={user}
        isOpen={!!selectedJobForApply}
        onClose={() => setSelectedJobForApply(null)}
        onSubmitApplication={handleSubmitApplication}
      />

      <PostJobModal
        isOpen={isPostJobOpen}
        onClose={() => setIsPostJobOpen(false)}
        onJobCreated={handleJobCreated}
        userCity={currentCity}
        userLat={userLat}
        userLng={userLng}
      />

      <UserProfileModal
        user={user}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onUpdateProfile={handleUpdateProfile}
      />

      <ArchitectureDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MoneyMakerApp />
    </AuthProvider>
  );
}

