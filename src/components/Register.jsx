import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { MdSecurity, MdPerson, MdWork, MdFavorite, MdEmail, MdLock, MdWc } from 'react-icons/md';

const Register = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: '',
    occupation: '',
    interests: []
  });

  const occupations = ['學生', '教師', '工程師', '公務員', '業務', '醫護人員', '自由工作者', '財會人員', '行銷人員'];
  const interestsList = ['遊戲', '購物', '投資理財', '科技產品', '旅遊', '影音娛樂', '教育學習', '社群媒體'];

  const handleInterestChange = (interest) => {
    setFormData(prev => {
      const isSelected = prev.interests.includes(interest);
      if (isSelected) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.gender || !formData.occupation || formData.interests.length === 0) {
      alert('請完整填寫註冊資訊，並至少選擇一項興趣');
      return;
    }
    
    // Simulate auth and save profile
    login(formData);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center text-blue-600 mb-4 animate-pulse">
          <MdSecurity size={64} />
        </div>
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">建立新帳號</h2>
        <p className="mt-2 text-sm text-gray-600 font-medium">
          填寫資料以生成您的個性化演練信件
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-10 px-6 shadow-2xl rounded-3xl border border-gray-100 sm:px-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <MdPerson className="text-blue-500" /> 姓名
              </label>
              <input
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="如何稱呼您？"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <MdEmail className="text-blue-500" /> 電子郵件
              </label>
              <input
                type="email"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <MdLock className="text-blue-500" /> 密碼
              </label>
              <input
                type="password"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gender */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <MdWc className="text-blue-500" /> 性別
                </label>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                  {['男', '女', '其他'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({...formData, gender: g})}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                        formData.gender === g ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <MdWork className="text-blue-500" /> 職業
                </label>
                <select
                  required
                  className="block w-full px-4 py-2 text-sm border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl transition-all font-medium"
                  value={formData.occupation}
                  onChange={e => setFormData({...formData, occupation: e.target.value})}
                >
                  <option value="" disabled>請選擇您的職業</option>
                  {occupations.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <MdFavorite className="text-blue-500" /> 興趣特徵 (將影響 AI 生成內容)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {interestsList.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestChange(interest)}
                    className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                      formData.interests.includes(interest)
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-lg font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform active:scale-95 transition-all"
              >
                立即註冊
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              已經有帳號了？{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                點此登入
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
