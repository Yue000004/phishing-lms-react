import React, { useEffect, useState } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts';
import { 
  MdAnalytics, MdOutlineLightbulb, MdRefresh, MdArrowBack, 
  MdError, MdCheckCircle, MdTimeline, MdHistory 
} from 'react-icons/md';
import axios from 'axios';

const Dashboard = ({ userId, onBack }) => {
    console.log(
    '[Dashboard UserId]',
    userId
  );
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    avgStayDuration: '0.0',
    urlCheckRate: 0,
    totalAttempts: 0,
    totalRiskScore: 0,
    riskLevel: '低風險',
    identificationRate: 0,
    typeStats: { financial: 0, investment: 0, shopping: 0 },
    recentActions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/dashboard/summary?userId=${userId}`);
      if (response && response.data && response.data.success) {
        const summaryData = response.data.summary || response.data; 
        const rawData = response.data.data;
        setData(Array.isArray(rawData) ? rawData : []);
        if (summaryData && typeof summaryData === 'object') {
          setSummary(prev => ({ ...prev, ...summaryData }));
        }
      } else {
        throw new Error('API Success Flag False');
      }
    } catch (error) {
      console.warn('[P1 API Fallback] 無法從伺服器取得真實數據，切換至本地模擬模式。', error.message);
      // P1 Fallback Data
      setData([
        { subject: '貪婪度', A: 65, fullMark: 100 },
        { subject: '恐懼感', A: 40, fullMark: 100 },
        { subject: '粗心度', A: 85, fullMark: 100 },
        { subject: '急迫感', A: 70, fullMark: 100 }
      ]);
      setSummary(prev => ({
        ...prev,
        totalRiskScore: 75,
        riskLevel: '中風險',
        identificationRate: 60,
        totalAttempts: 5,
        recentActions: [
           { timestamp: new Date(), emailSubject: '本地模擬演練', action: '系統演示', score: 0 }
        ]
      }));
      setError('目前處於離線演示模式，數據僅供參考。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const typeChartData = [
    { name: '金融', count: summary?.typeStats?.financial || 0 },
    { name: '投資', count: summary?.typeStats?.investment || 0 },
    { name: '購物', count: summary?.typeStats?.shopping || 0 },
  ];

  const getAnalysisText = () => {
    if (loading) return '正在進行大數據安全分析...';
    if (error) return '數據載入失敗。';
    
    const safeData = Array.isArray(data) ? [...data] : [];
    const sorted = safeData.sort((a, b) => (b.A || 0) - (a.A || 0));
    if (sorted.length === 0 || (summary?.totalAttempts || 0) === 0) return '尚無足夠數據進行分析。請嘗試進行幾次模擬演練！';
    
    const topWeakness = sorted[0];
    switch (topWeakness?.subject) {
      case '貪婪度': return '您容易被「優惠、退款、中獎」等利誘訊息吸引，請務必確認官網活動。';
      case '恐懼感': return '面對「帳號被盜、扣款失敗」等警急訊息，您容易感到慌亂，請先冷靜聯繫客服。';
      case '粗心度': return '您在閱讀信件時速度極快，且較少檢查寄件者與 URL，容易掉入像素級偽裝的陷阱。';
      case '急迫感': return '攻擊者利用限時壓力對您非常奏效，請記住：真正的銀行不會要求您在 5 分鐘內處理完畢。';
      default: return '您的資安意識表現穩定，請繼續保持警覺，多留意細微的 URL 差異。';
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-4 md:p-10 overflow-y-auto text-slate-800 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg">
              <MdAnalytics size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">資安意識健檢報告</h1>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-0.5">Report ID: {userId?.substring(0, 12)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchStats}
              disabled={loading}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all text-gray-600 bg-white shadow-sm border border-gray-100 active:scale-95 disabled:opacity-50"
            >
              <MdRefresh size={24} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={onBack}
              className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-black hover:bg-black transition-all shadow-md active:scale-95 text-xs uppercase tracking-widest"
            >
              <MdArrowBack size={18} /> 返回收件匣
            </button>
          </div>
        </div>

        {/* Top Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Risk Score Card */}
          <div className="md:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Security Risk Assessment</p>
              <h2 className={`text-6xl font-black mb-2 tracking-tighter ${
                summary.riskLevel === '高風險' ? 'text-red-600' : summary.riskLevel === '中風險' ? 'text-orange-500' : 'text-green-600'
              }`}>
                {summary.riskLevel}
              </h2>
              <div className="flex items-center gap-2 mt-6">
                <div className="bg-gray-100 px-4 py-1.5 rounded-full text-[11px] font-black text-gray-600 border border-gray-200">
                  正確辨識率: <span className={summary.identificationRate < 60 ? 'text-red-500' : 'text-green-600'}>{summary.identificationRate}%</span>
                </div>
                <div className="bg-gray-100 px-4 py-1.5 rounded-full text-[11px] font-black text-gray-600 border border-gray-200">
                  演練次數: {summary.totalAttempts}
                </div>
              </div>
            </div>
            <div className="text-center relative z-10">
              <div className={`w-36 h-32 rounded-3xl border-4 flex flex-col items-center justify-center transition-all duration-700 shadow-2xl bg-white ${
                summary.riskLevel === '高風險' ? 'border-red-500 text-red-600' : 
                summary.riskLevel === '中風險' ? 'border-orange-400 text-orange-600' : 
                'border-green-500 text-green-600'
              }`}>
                <span className="text-5xl font-black leading-none">{summary.totalRiskScore}</span>
                <span className="text-[10px] font-black mt-2 uppercase tracking-widest">Points</span>
              </div>
              <p className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-[0.3em]">Risk Score</p>
            </div>
            <div className={`absolute -right-20 -bottom-20 w-64 h-64 rounded-full opacity-[0.05] blur-3xl ${
              summary.riskLevel === '高風險' ? 'bg-red-600' : 'bg-green-600'
            }`}></div>
          </div>

          {/* Expert Diagnostic */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col justify-center bg-gradient-to-br from-white to-blue-50/20">
            <div className="flex items-center gap-2 mb-4 text-blue-600">
              <MdOutlineLightbulb size={24} />
              <span className="font-black text-[10px] uppercase tracking-widest">Diagnostic Report</span>
            </div>
            <p className="text-sm font-bold text-gray-800 leading-relaxed italic border-l-4 border-blue-500 pl-4">
              「{getAnalysisText()}」
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Radar Chart (Psychological Dimensions) */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
             <div className="flex items-center gap-2 mb-8">
                <MdTimeline className="text-blue-500" size={20} />
                <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em]">心理防禦維度分析</h3>
             </div>
             <div className="h-[320px] flex items-center justify-center">
               {loading ? (
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black text-blue-600 uppercase">Calculating...</span>
                 </div>
               ) : data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#f1f5f9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: '900' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="意識評分"
                      dataKey="A"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fill="#3b82f6"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
               ) : (
                 <p className="text-gray-400 text-xs font-bold italic">尚無足夠行為數據</p>
               )}
             </div>
          </div>

          {/* Bar Chart (Phishing Types) */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
             <div className="flex items-center gap-2 mb-8">
                <MdError className="text-orange-500" size={20} />
                <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em]">受騙類型統計 (累計)</h3>
             </div>
             <div className="h-[320px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={typeChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: '900' }} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                   <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                   <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={45} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Behavioral History Table (P2 Requirement) */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-2">
              <MdHistory className="text-gray-400" size={20} />
              <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em]">最近演練行為歷程</h3>
            </div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step-by-step Log</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <th className="px-8 py-5">發生時間</th>
                  <th className="px-8 py-5">情境主旨</th>
                  <th className="px-8 py-5">最終行為</th>
                  <th className="px-8 py-5 text-right">風險加成</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {summary.recentActions?.length > 0 ? summary.recentActions.map((log, i) => (
                  <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 text-xs text-gray-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('zh-TW', { hour12: false })}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-700 max-w-[280px] truncate group-hover:text-blue-600 transition-colors">
                      {log.emailSubject}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                        log.action.includes('成功') || log.action === 'safe' || log.action === 'phishing' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {log.action.includes('成功') ? <MdCheckCircle size={12} /> : log.action.includes('input') ? <MdError size={12} /> : null}
                        {log.action}
                      </span>
                    </td>
                    <td className={`px-8 py-5 text-sm font-black text-right ${log.score >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {log.score > 0 ? '+' : ''}{log.score}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                       <MdHistory size={48} className="mx-auto mb-4 opacity-10" />
                       <p className="text-gray-400 text-sm font-bold italic">目前尚無行動紀錄</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50/50 p-6 flex items-center justify-center gap-10 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] border-t border-gray-50">
             <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> 閱讀分析</div>
             <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> 連結點擊</div>
             <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> 資產外洩</div>
             <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 安全抵禦</div>
          </div>
        </div>

        {/* Footer Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-20">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center group hover:border-blue-200 transition-colors">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-blue-500 transition-colors">平均猶豫時間</p>
            <p className="text-3xl font-black text-blue-600">{summary.avgStayDuration || '0.0'} <span className="text-xs uppercase ml-1">sec</span></p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center group hover:border-orange-200 transition-colors">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-orange-500 transition-colors">URL 檢查意識</p>
            <p className="text-3xl font-black text-orange-600">{summary.urlCheckRate || 0} <span className="text-xs uppercase ml-1">%</span></p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center group hover:border-indigo-200 transition-colors">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors">資安靈敏度</p>
            <p className="text-3xl font-black text-indigo-600">{summary.identificationRate}%</p>
          </div>
        </div>

        {/* Error Handling UI Overlay */}
        {error && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce z-50">
             <MdError size={24} />
             <span className="font-bold text-sm">{error}</span>
             <button onClick={fetchStats} className="bg-white text-red-600 px-4 py-1.5 rounded-lg font-black text-xs uppercase shadow-sm">Retry</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
