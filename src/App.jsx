import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import apiClient, { recordUserBehavior } from './services/api';
import { MdReportGmailerrorred } from 'react-icons/md';
import axios from 'axios';

const MainApp = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  // View states derived from URL
  const view = useMemo(() => {
    const path = location.pathname;
    if (path === '/payment') return 'payment';
    if (path === '/otp') return 'otp';
    if (path === '/recovery') return 'recovery';
    if (path === '/analytics') return 'analytics';
    if (path.startsWith('/email/')) return 'detail';
    return 'list';
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState('inbox');
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(() => {
    // P0: Fallback to localStorage if state is missing
    try {
      const stored = localStorage.getItem('current_phishing_scenario');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '' });
  const [showScare, setShowScare] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hoveredHref, setHoveredUrl] = useState(null);
  const hasStartedFetching = useRef(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Tracking Metrics
  const hoverCheckedRef = useRef(false);
  const [userStats, setUserStats] = useState({
    mouseMovementCount: 0,
    startTime: null
  });

  const currentOtpCode = useMemo(() => Math.floor(100000 + Math.random() * 900000).toString(), [location.pathname]);

  // Sync selectedEmail with URL if in detail view
  useEffect(() => {
    if (view === 'detail') {
      const emailId = location.pathname.split('/email/')[1];
      if (emailId) {
        const email = emails.find(e => e.id === emailId);
        if (email) {
          setSelectedEmail(email);
          localStorage.setItem('current_phishing_scenario', JSON.stringify(email));
        } else if (emails.length > 0 && isInitialized) {
          // If not found in memory but we have emails, check localStorage or fallback
          const stored = localStorage.getItem('current_phishing_scenario');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.id === emailId) {
              setSelectedEmail(parsed);
              return;
            }
          }
          navigate('/', { replace: true });
        }
      }
    } else if (view === 'list') {
      // Don't clear selectedEmail here, might be needed for sub-pages like /payment
    }
  }, [view, location.pathname, emails, isInitialized]);

  /**
   * Task 7: 實作信件「無限滾動/自動補充」機制
   */


  const fetchNewEmails = async (count = 10) => {
    if (isGenerating || hasStartedFetching.current) return;
    setIsGenerating(true);
    hasStartedFetching.current = true;
    setApiError(null);
    console.log(`[P1] 背景補充 ${count} 封混合演練信件 (20% 釣魚, 80% 安全)...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000); // 4 mins timeout for AI

    try {
      const results = [];

      for (let i = 0; i < count; i++) {
        const type = Math.random() < 0.2 ? 'phishing' : 'safe';

        try {
          const response = await apiClient.post(
            '/phishing/generate',
            {
              scenario:
                type === 'phishing'
                  ? '隨機金融詐騙'
                  : '日常行政通知',
              difficulty: '高',
              occupation: user?.occupation,
              interests: user?.interests,
              userId: user?.userId,
              type
            },
            { signal: controller.signal }
          );

          if (response.data) {
            results.push(response.data);
            console.log(`✅ 已生成 ${i + 1}/${count} 封`);
          }
        } catch (err) {
          console.warn(
            `⚠️ 第 ${i + 1} 封生成失敗`,
            err.message
          );
        }
      }

      clearTimeout(timeoutId);


      const filteredResults = results.filter(Boolean);

      let finalBatch = [];

      if (filteredResults.length > 0) {
        finalBatch = filteredResults.map(data => ({
          id: data.id || 'ai-' + Math.random(),
          senderName: data.senderName || 'Unknown',
          senderEmail: data.senderEmail || '',
          subject: data.subject || '(無主旨)',
          bodyMarkdown: data.bodyMarkdown || '',
          content: data.bodyHtml || data.bodyMarkdown || '',
          isPhishing: !!data.isPhishing,
          explanation: data.isPhishing ? (data.redFlags ? data.redFlags.join('、') : 'AI 生成的誘餌信件。') : '這是一封正常的電子郵件。',
          suspiciousElements: data.redFlags || [],
          timestamp: new Date()
        }));
      } else {
        // P1 Fallback: Use mockData if API returned nothing
        console.warn('⚠️ AI 生成全數失敗或逾時，切換至本地 Mock 備援資料');
        const randomMocks = [...mockEmails].sort(() => 0.5 - Math.random()).slice(0, count);
        finalBatch = randomMocks.map(m => ({ ...m, id: 'mock-' + Math.random() }));
      }

      if (finalBatch.length > 0) {
        setEmails(prev => [...prev, ...finalBatch]);
      }
    } catch (error) {
      console.error(
        '🚨 Auto replenishment failed',
        error.response?.data || error.message
      );
      // P1 Fallback: Use mockData on error
      const fallbackMocks = [...mockEmails].sort(() => 0.5 - Math.random()).slice(0, count);
      setEmails(prev => [...prev, ...fallbackMocks.map(m => ({ ...m, id: crypto.randomUUID() }))]);
    } finally {
      setIsGenerating(false);
      hasStartedFetching.current = false;
      clearTimeout(timeoutId);
    }
  };

  // 初始載入歷史信件與補齊機制
  useEffect(() => {
    const loadInitialEmails = async () => {
      if (!user || isInitialized) return;
      
      setIsLoading(true);
      setApiError(null);

      try {
        console.log('[App] 讀取歷史信件...');
        const res = await apiClient.get(`/phishing/emails/${user.userId}`);
        
        let historyEmails = [];
        // 修正：使用 res.data.data 並確保 emails 是 array
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          historyEmails = res.data.data.map(e => ({
            id: e.id,
            senderName: e.senderName || 'Unknown',
            senderEmail: e.senderEmail || '',
            subject: e.subject || '(無主旨)',
            bodyMarkdown: e.bodyMarkdown || '',
            content: e.bodyHtml || e.bodyMarkdown || '', 
            isPhishing: e.isPhishing !== undefined ? e.isPhishing : true,
            explanation: e.redFlags ? e.redFlags.join('、') : 'AI 生成的客製化誘餌信件。',
            suspiciousElements: e.redFlags || [],
            timestamp: e.generatedAt ? new Date(e.generatedAt) : new Date()
          }));
        }

        setEmails(Array.isArray(historyEmails) ? historyEmails : []);
        setIsInitialized(true);

        if (historyEmails.length < 3) {
          await fetchNewEmails(10 - historyEmails.length);
        }
      } catch (error) {
        console.error('Failed to load history:', error);
        setApiError(error.code === 'ECONNABORTED' ? '連線逾時，正在嘗試重新建立連線...' : '無法連線至後端伺服器，請確認後端服務已啟動。');
        setIsInitialized(true);
        setEmails([]); // 確保初始化為空陣列以防崩潰
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialEmails();
  }, [user, isInitialized]);

  // Task 7: 監聽 length，自動補充 (確保已初始化)
  useEffect(() => {
    if (isInitialized && emails.length <= 1 && user && !hasStartedFetching.current && !isGenerating && !isLoading) {
      fetchNewEmails(2);
    }
  }, [emails.length, user, isGenerating, isLoading, isInitialized]);

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
    try {
      recordUserBehavior({
        userId: user?.userId,
        emailId: selectedEmail?.id,
        emailSubject: selectedEmail?.subject,
        action: 'failed_phishing_test',
        correct: false,
        isPhishing: selectedEmail?.isPhishing,
        mouseMovementCount: userStats.mouseMovementCount,
        stayDuration: duration,
        hoverChecked: hoverCheckedRef.current,
        score: 0
      });
    } catch (e) {
      console.warn('Failed to record behavior:', e);
    }

    setTimeout(() => {
      setShowScare(false);
      if (type === 'click') {
        navigate('/recovery');
      } else {
        setModalConfig({ isOpen: true, type });
        navigate('/');
      }
    }, 2500);
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    localStorage.setItem('current_phishing_scenario', JSON.stringify(email));
    
    // Track open event
    try {
      recordUserBehavior({
        userId: user?.userId,
        emailId: email.id,
        emailSubject: email.subject,
        action: 'open_email',
        correct: true,
        isPhishing: email.isPhishing,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Failed to record open event:', e);
    }

    navigate(`/email/${email.id}`);
    setIsSidebarOpen(false);
  };

  const handleBackToList = () => {
    navigate('/');
    // setSelectedEmail(null); // Keep it for a bit to avoid flashes
  };

  const handleAction = async (actionType) => {
    const isCorrect = (actionType === 'phishing' && selectedEmail?.isPhishing) || 
                      (actionType === 'safe' && !selectedEmail?.isPhishing);
    
    // Map actionType to standardized action string
    let standardAction = actionType;
    if (actionType === 'phishing') standardAction = 'report_phishing';
    if (actionType === 'safe') standardAction = 'mark_safe';

    const duration = Math.floor((Date.now() - userStats.startTime) / 1000);
    try {
      recordUserBehavior({
        userId: user?.userId,
        emailId: selectedEmail?.id,
        emailSubject: selectedEmail?.subject,

        action: standardAction,

        correct: isCorrect,
        isPhishing: selectedEmail?.isPhishing,

        mouseMovementCount: userStats.mouseMovementCount,
        stayDuration: duration,
        hoverChecked: hoverCheckedRef.current,

        score: isCorrect ? 100 : 0
      });
    } catch (e) {
      console.warn('Failed to record behavior:', e);
    }

    if (!isCorrect) {
      triggerMistakeSequence('wrong_answer');
    } else {
      setModalConfig({ isOpen: true, type: 'correct_answer' });
      setEmails(prev => prev.map(e => 
        e.id === selectedEmail?.id ? { ...e, isResolved: true, isReported: true } : e
      ));
      handleBackToList();
    }
  };

  const handleReportPhishing = () => {
      handleAction('phishing');
  };

  const handleLinkClick = (url) => {
    console.log('🚨 Link clicked:', url);
    const duration = Math.floor((Date.now() - userStats.startTime) / 1000);
    try {
      recordUserBehavior({
        userId: user?.userId,
        emailId: selectedEmail?.id || null,
        emailSubject: selectedEmail?.subject,
        action: 'click_link',
        correct: !selectedEmail?.isPhishing,
        isPhishing: selectedEmail?.isPhishing,
        score: selectedEmail?.isPhishing ? -10 : 0,
        mouseMovementCount: userStats.mouseMovementCount,
        stayDuration: duration,
        hoverChecked: hoverCheckedRef.current
      });
    } catch (e) {
      console.warn('Failed to record behavior:', e);
    }

    localStorage.setItem('current_phishing_scenario', JSON.stringify(selectedEmail));
    navigate('/payment');
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
      navigate('/analytics');
    }
  };

  const handlePaymentNext = () => {
    try {
      recordUserBehavior({
        userId: user?.userId,
        emailId: selectedEmail?.id || null,
        emailSubject: selectedEmail?.subject,
        action: 'input_credit_card',
        correct: !selectedEmail?.isPhishing,
        isPhishing: selectedEmail?.isPhishing,
        score: selectedEmail?.isPhishing ? -20 : 0,
        mouseMovementCount: userStats.mouseMovementCount,
        stayDuration: Math.floor((Date.now() - userStats.startTime) / 1000),
        hoverChecked: hoverCheckedRef.current
      });
    } catch (e) {
      console.warn('Failed to record behavior:', e);
    }
    navigate('/otp');
  };

  const handleOTPVerify = (code) => {
    try {
      recordUserBehavior({
        userId: user?.userId,
        emailId: selectedEmail?.id || null,
        emailSubject: selectedEmail?.subject,
        action: 'input_otp',
        correct: !selectedEmail?.isPhishing,
        isPhishing: selectedEmail?.isPhishing,
        score: selectedEmail?.isPhishing ? -50 : 0,
        mouseMovementCount: userStats.mouseMovementCount,
        stayDuration: Math.floor((Date.now() - userStats.startTime) / 1000),
        hoverChecked: hoverCheckedRef.current
      });
    } catch (e) {
      console.warn('Failed to record behavior:', e);
    }

    if (selectedEmail?.isPhishing) {
      triggerMistakeSequence('click');
    } else {
      setModalConfig({
        isOpen: true,
        type: 'safe_completed'
      });

      setEmails(prev =>
        prev.map(e =>
          e.id === selectedEmail?.id
            ? { ...e, isResolved: true }
            : e
        )
      );
    }
  };

  const handleRecoveryComplete = (status, reason) => {
    try {
      recordUserBehavior({
        userId: user?.userId,
        emailId: selectedEmail?.id,
        emailSubject: selectedEmail?.subject,
        action: status === 'success' ? 'recovery_success' : 'recovery_fail',
        correct: status === 'success',
        isPhishing: true,
        reason: reason,
        score: status === 'success' ? 50 : -30
      });
    } catch (e) {
      console.warn('Failed to record behavior:', e);
    }
    // Form the education loop: Show feedback modal after recovery
    setModalConfig({ isOpen: true, type: status === 'success' ? 'recovery_success' : 'recovery_fail' });
    setEmails(prev => prev.map(e => 
      e.id === selectedEmail?.id ? { ...e, isResolved: true, isReported: true } : e
    ));
    handleBackToList();
  };
  const handleModalClose = () => {
    const currentType = modalConfig.type;

    setModalConfig(prev => ({
      ...prev,
      isOpen: false
    }));

    if (
      currentType === 'safe_completed' ||
      currentType === 'correct_answer' ||
      currentType === 'recovery_success' ||
      currentType === 'recovery_fail'
    ) {
      handleBackToList();
    }
  };

  const renderMainContent = () => {
    if (apiError && view === 'list' && emails.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
          <div className="bg-red-50 p-6 rounded-3xl border border-red-100 max-w-sm">
            <MdReportGmailerrorred size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">後端服務連線失敗</h3>
            <p className="text-sm text-gray-500 mb-6">{apiError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-black transition-all"
            >
              重新整理
            </button>
          </div>
        </div>
      );
    }
  
    switch (view) {
      case 'payment': 
        return selectedEmail ? <PaymentGateway amount="2,990" onNext={handlePaymentNext} onReport={handleReportPhishing} /> : <Navigate to="/" replace />;
      case 'otp': 
        return selectedEmail ? <OTPVerification onVerify={handleOTPVerify} expectedOtp={currentOtpCode} onReport={handleReportPhishing} /> : <Navigate to="/" replace />;
      case 'recovery': 
        return <RecoveryDrill onComplete={handleRecoveryComplete} />;
      case 'analytics': 
        return <Dashboard userId={user?.userId} onBack={handleBackToList} />;
      case 'detail': 
        return selectedEmail ? <EmailDetail email={selectedEmail} onBack={handleBackToList} onAction={handleAction} onLinkClick={handleLinkClick} onHoverTrack={handleHoverTrack} /> : <div className="flex-1 flex items-center justify-center">載入中...</div>;
      case 'list':
      default: 
        if (isLoading && emails.length === 0) {
          return (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-400 animate-pulse">正在安全加密連線中...</p>
              </div>
            </div>
          );
        }
        return (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <EmailList emails={emails} onEmailClick={handleEmailClick} />
            {isGenerating && (
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
    <div className={`flex flex-col min-h-screen bg-white relative font-sans text-slate-700 ${isStandardView ? 'h-screen overflow-hidden' : 'overflow-y-auto'}`}>
      {isStandardView && <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />}
      
      <div className={`flex-1 flex ${isStandardView ? 'overflow-hidden' : ''} relative`}>
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

        <main className={`flex-1 flex flex-col bg-white relative ${isStandardView ? 'overflow-hidden border-t border-gray-100' : ''}`}>
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

      <TeachableModal isOpen={modalConfig.isOpen} triggerType={modalConfig.type} email={selectedEmail} onClose={handleModalClose} />
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
        <Route path="/payment" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        <Route path="/otp" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        <Route path="/recovery" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        <Route path="/email/:id" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
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
