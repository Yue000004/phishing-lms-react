import React, { useEffect, useState } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import { MdAnalytics, MdOutlineLightbulb, MdRefresh, MdArrowBack } from 'react-icons/md';
import axios from 'axios';

const Dashboard = ({ userId, onBack }) => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    avgStayDuration: '0.0',
    urlCheckRate: 0,
    totalAttempts: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/phishing/stats/${userId}`);
      if (response.data.success) {
        setData(response.data.data);
        if (response.data.summary) {
          setSummary(response.data.summary);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const getAnalysisText = () => {
    if (loading) return '分析中...';
    const sorted = [...data].sort((a, b) => b.A - a.A);
    if (sorted.length === 0 || summary.totalAttempts === 0) return '尚無足夠數據進行分析。請嘗試進行幾次模擬演練！';
    
    const topWeakness = sorted[0];
    switch (topWeakness.subject) {
      case '貪婪度': return '您容易被「優惠、退款、中獎」等利誘訊息吸引，請務必確認官網活動。';
      case '恐懼感': return '面對「帳號被盜、扣款失敗」等警急訊息，您容易感到慌亂，請先冷靜聯繫客服。';
      case '粗心度': return '您在閱讀信件時速度極快，且較少檢查寄件者與 URL，容易掉入像素級偽裝的陷阱。';
      case '急迫感': return '攻擊者利用限時壓力對您非常奏效，請記住：真正的銀行不會要求您在 5 分鐘內處理完畢。';
      default: return '您的資安意識表現穩定，請繼續保持警覺，多留意細微的 URL 差異。';
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg">
              <MdAnalytics size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">資安心理弱點分析</h1>
              <p className="text-sm text-gray-500">根據您的模擬演練行為生成的數據報告 (ID: {userId})</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchStats}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600 bg-white shadow-sm border border-gray-100"
              title="重新整理"
            >
              <MdRefresh size={24} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={onBack}
              className="flex items-center gap-1 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
            >
              <MdArrowBack /> 返回收件匣
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">
          
          {/* Radar Chart Section */}
          <div className="p-8 border-r border-gray-50 bg-gradient-to-br from-white to-blue-50/30 flex items-center justify-center min-h-[400px]">
            {loading ? (
              <div className="animate-pulse text-blue-600 font-bold">分析數據計算中...</div>
            ) : data.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="心理維度"
                    dataKey="A"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm text-center">
                <MdAnalytics size={48} className="mx-auto mb-4 opacity-20" />
                尚無演練數據，去點擊一些信件吧！
              </div>
            )}
          </div>

          {/* Analysis Section */}
          <div className="p-10 flex flex-col justify-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-yellow-100">
                <MdOutlineLightbulb />
                核心弱點診斷
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4 leading-tight italic">
                {data.length > 0 ? [...data].sort((a, b) => b.A - a.A)[0].subject : '準備分析'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {getAnalysisText()}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-500">
                  <span className="font-bold text-gray-700 mr-1">建議動作：</span>
                  在點擊任何來自知名服務的連結前，請先透過官方 App 或自行輸入網址進入官網檢查。
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-500">
                  <span className="font-bold text-gray-700 mr-1">心理戰術：</span>
                  詐騙集團常利用「微小的利益」誘使您忽略「巨大的 URL 異常」。
                </p>
              </div>
            </div>

            <button 
              onClick={onBack}
              className="mt-10 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-gray-200 active:scale-95 text-center"
            >
              再次挑戰，提升警覺性
            </button>
          </div>
        </div>

        {/* Footer Metrics - NOW DYNAMIC */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">平均猶豫時間</p>
            <p className="text-xl font-black text-green-600">{summary.avgStayDuration} 秒</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">URL 檢查率</p>
            <p className="text-xl font-black text-orange-600">{summary.urlCheckRate}%</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">演練完成次數</p>
            <p className="text-xl font-black text-blue-600">{summary.totalAttempts} 次</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
