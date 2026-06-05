import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import mockEmails from './data/mockData.json';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import RightSidebar from './components/RightSidebar';
import TeachableModal from './components/TeachableModal';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ToastNotification from './components/ToastNotification';
import PaymentGateway from './components/PaymentGateway';
import OTPVerification from './components/OTPVerification';
import VirtualPhone from './components/VirtualPhone';
import RecoveryDrill from './components/RecoveryDrill';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import HoverStatusBar from './components/HoverStatusBar';
import { UserProvider, useUser } from './context/UserContext';
import { recordUserBehavior } from './services/api';

const MainApp = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  
  // View states: 'list' | 'detail' | 'payment' | 'otp' | 'recovery' | 'analytics'
  const [view, setView] = useState('list'); 
  const [activeTab, setActiveTab] = useState('inbox');
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '' });
  const [showScare, setShowScare] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hoveredHref, setHoveredUrl] = useState(null);
  
  // Tracking Metrics
  const hoverCheckedRef = useRef(false);
  const [userStats, setUserStats] = useState({
    mouseMovementCount: 0,
    startTime: null
  });

  const currentOtpCode = useMemo(() => Math.floor(100000 + Math.random() * 900000).toString(), [view]);

  /**
   * Task 7: 實作信件「無限滾動/自動補充」機制
   */
  const fetchNewEmails = async (count = 2) => {
    if (isLoading) return;
    setIsLoading(true);
    console.log(`[Task 7] 背景補充 ${count} 封個人化演練信件...`);
    
    try {
      const requests = Array.from({ length: count }).map(() => 
        fetch('http://localhost:5000/api/phishing/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            scenario: '隨機演練情境', 
            difficulty: '高',
            occupation: user?.occupation,
            interests: user?.interests,
            userId: user?.userId
          })
        }).then(res => res.ok ? res.json() : null)
      );

      const results = await Promise.all(requests);
      const newBatch = results.filter(Boolean).map(data => ({
        id: data.id || 'ai-' + Math.random(),
        senderName: data.senderName,
        senderEmail: data.senderEmail,
        subject: data.subject,
        bodyMarkdown: data.bodyMarkdown,
        content: data.bodyHtml,
        isPhishing: data.isPhishing,
        explanation: data.redFlags ? data.redFlags.join('、') : 'AI 生成的誘餌信件。',
        suspiciousElements: data.redFlags || [],
        timestamp: new Date()
      }));

      setEmails(prev => [...prev, ...newBatch]);
    } catch (error) {
      console.error('Auto replenishment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始載入
  useEffect(() => {
    if (emails.length === 0 && user) {
      fetchNewEmails(3);
    }
  }, [user]);

  // Task 7: 監聽 length，自動補充
  useEffect(() => {
    if (emails.length <= 1 && !isLoading && user) {
      fetchNewEmails(2);
    }
  }, [emails.length, isLoading, user]);

  // Track Mouse Movements
  useEffect(() => {
    const handleMouseMove = () => {
      setUserStats(prev => ({ ...prev, mouseMovementCount: prev.mouseMovementCount + 1 }));
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Track Stay Duration
  useEffect(() => {
    if (view === 'detail' && selectedEmail) {
      hoverCheckedRef.current = false; 
      setUserStats(prev => ({ ...prev, startTime: Date.now() }));
    }
  }, [view, selectedEmail]);

  const triggerMistakeSequence = async (type) => {
    setShowScare(true);
    
    const duration = Math.floor((Date.now() - userStats.startTime) / 1000);
    recordUserBehavior({
      userId: user?.userId,
      emailId: selectedEmail?.subject || selectedEmail?.id,
      action: 'failed_phishing_test',
      mouseMovementCount: userStats.mouseMovementCount,
      stayDuration: duration,
      hoverChecked: hoverCheckedRef.current,
      score: 0
    });

    setTimeout(() => {
      setShowScare(false);
      if (type === 'click') {
        setView('recovery');
      } else {
        setModalConfig({ isOpen: true, type });
        setView('detail');
      }
    }, 2500);
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    setView('detail');
    setIsSidebarOpen(false);
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedEmail(null);
  };

  const handleAction = async (actionType) => {
    const isCorrect = (actionType === 'phishing' && selectedEmail?.isPhishing) || 
                      (actionType === 'safe' && !selectedEmail?.isPhishing);
    
    const duration = Math.floor((Date.now() - userStats.startTime) / 1000);
    recordUserBehavior({
      userId: user?.userId,
      emailId: selectedEmail?.subject || selectedEmail?.id,
      action: actionType,
      mouseMovementCount: userStats.mouseMovementCount,
      stayDuration: duration,
      hoverChecked: hoverCheckedRef.current,
      score: isCorrect ? 100 : 0
    });

    if (!isCorrect) {
      triggerMistakeSequence('wrong_answer');
    } else {
      setModalConfig({ isOpen: true, type: 'correct_answer' });
      // 完成一封後從清單移除
      setEmails(prev => prev.filter(e => e.id !== selectedEmail.id));
      handleBackToList();
    }
  };

  const handleReportPhishing = () => {
    recordUserBehavior({
      userId: user?.userId,
      emailId: selectedEmail?.subject || 'dynamic_payment_page',
      action: '成功防禦：回報釣魚',
      score: 100,
      hoverChecked: hoverCheckedRef.current
    });
    setModalConfig({ isOpen: true, type: 'correct_answer' });
    setEmails(prev => prev.filter(e => e.id !== selectedEmail?.id));
    handleBackToList();
  };

  const handleLinkClick = (url) => {
    console.log('🚨 Link clicked:', url);
    const duration = Math.floor((Date.now() - userStats.startTime) / 1000);
    recordUserBehavior({
      userId: user?.userId,
      emailId: selectedEmail?.subject || 'dynamic_gen_email',
      action: '點擊連結',
      score: -10,
      mouseMovementCount: userStats.mouseMovementCount,
      stayDuration: duration,
      hoverChecked: hoverCheckedRef.current
    });

    setView('payment');
  };

  const handleHoverTrack = (url, isHovering) => {
    if (isHovering) {
      setHoveredUrl(url);
      if (!hoverCheckedRef.current) {
        hoverCheckedRef.current = true;
      }
    } else {
      setHoveredUrl(null);
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); 
    if (tabId === 'inbox') {
      handleBackToList();
    } else if (tabId === 'analytics') {
      setView('analytics');
    }
  };

  const handleOTPVerify = (code) => {
    if (selectedEmail?.isPhishing) {
      triggerMistakeSequence('click');
    } else {
      setModalConfig({ isOpen: true, type: 'correct_answer' });
      setEmails(prev => prev.filter(e => e.id !== selectedEmail?.id));
      handleBackToList();
    }
  };

  const handleRecoveryComplete = (status, reason) => {
    recordUserBehavior({
      userId: user?.userId,
      emailId: selectedEmail?.subject || selectedEmail?.id,
      event: 'recovery_drill_completed',
      status,
      reason
    });
    setModalConfig({ isOpen: true, type: status === 'success' ? 'recovery_success' : 'recovery_fail' });
    setEmails(prev => prev.filter(e => e.id !== selectedEmail?.id));
    handleBackToList();
  };

  const renderMainContent = () => {
    switch (view) {
      case 'payment': return <PaymentGateway amount="2,990" onNext={() => setView('otp')} onReport={handleReportPhishing} />;
      case 'otp': return <OTPVerification onVerify={handleOTPVerify} expectedOtp={currentOtpCode} onReport={handleReportPhishing} />;
      case 'recovery': return <RecoveryDrill onComplete={handleRecoveryComplete} />;
      case 'analytics': return <Dashboard userId={user?.userId} onBack={handleBackToList} />;
      case 'detail': return <EmailDetail email={selectedEmail} onBack={handleBackToList} onAction={handleAction} onLinkClick={handleLinkClick} onHoverTrack={handleHoverTrack} />;
      case 'list':
      default: return (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <EmailList emails={emails} onEmailClick={handleEmailClick} />
          {/* Loading Animation for Infinite Stream */}
          {isLoading && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-blue-100 flex items-center gap-2 text-xs font-bold text-blue-600 animate-fade-in z-20">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              正在接收新郵件...
            </div>
          )}
        </div>
      );
    }
  };

  const isStandardView = view === 'list' || view === 'detail' || view === 'analytics';

  return (
    <div className="flex flex-col h-screen bg-white relative font-sans overflow-hidden text-slate-700">
      {isStandardView && <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />}
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Task 2: RWD Sidebar */}
        {isStandardView && (
          <div className={`
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 transition-transform duration-300 ease-in-out
            fixed md:relative z-40 bg-white h-full shadow-2xl md:shadow-none border-r border-gray-100 w-64
          `}>
            <Sidebar activeTab={activeTab} onTabClick={handleTabClick} />
          </div>
        )}
        
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        <main className={`flex-1 flex flex-col bg-white overflow-hidden relative ${isStandardView ? 'border-t border-gray-100' : ''}`}>
          {/* Mobile view logic: hide list when detail is open */}
          <div className={`flex-1 flex flex-col h-full ${view === 'detail' && 'fixed inset-0 z-50 md:relative md:z-0'} bg-white`}>
            {renderMainContent()}
          </div>
        </main>

        {(isStandardView && view !== 'analytics') && <div className="hidden lg:block"><RightSidebar /></div>}
      </div>

      <VirtualPhone show={view === 'otp'} otpCode={currentOtpCode} />
      <HoverStatusBar url={hoveredHref} />

      {showScare && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center animate-hacker-glitch bg-black/80 backdrop-blur-md pointer-events-none">
          <div className="text-center p-4">
            <h1 className="text-4xl md:text-8xl font-black text-red-600 tracking-tighter uppercase bg-black px-4 md:px-10 py-6 rounded-xl border-4 md:border-8 border-red-600 shadow-[0_0_100px_rgba(220,38,38,0.8)] mb-4 font-mono">
              ALERT: FUND BREACH
            </h1>
            <p className="text-xl md:text-4xl text-white font-black animate-pulse">- NT$ 150,000.00</p>
          </div>
        </div>
      )}

      <TeachableModal isOpen={modalConfig.isOpen} triggerType={modalConfig.type} email={selectedEmail} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} />
      <ToastNotification />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user } = useUser();
  return user ? children : <Navigate to="/login" replace />;
};

export default App;
