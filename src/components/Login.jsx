import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { MdSecurity, MdEmail, MdLock } from 'react-icons/md';
import apiClient from '../services/api';

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert('請輸入帳號密碼');
      return;
    }
    try {
      const response = await apiClient.post('/auth/login', formData);

      const data = response.data;

      if (!data.success) {
        alert(data.error);
        return;
      }

      login(data.user);

      localStorage.setItem(
        'phishing_lms_user',
        JSON.stringify(data.user)
      );

      navigate('/');

    } catch (error) {
      console.error(error);
      alert('登入失敗');
    } 
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center text-blue-600 mb-4 animate-bounce">
          <MdSecurity size={64} />
        </div>
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">登入系統</h2>
        <p className="mt-2 text-sm text-gray-600 font-medium">
          歡迎回來，進入您的防護沙盒
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-2xl rounded-3xl border border-gray-100 sm:px-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
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

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-lg font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform active:scale-95 transition-all"
              >
                立即登入
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              還沒有帳號？{' '}
              <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                點此註冊
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
