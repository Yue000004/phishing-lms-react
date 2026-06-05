import React from 'react';
import { MdSettingsSuggest, MdFlashOn, MdOutlinePsychology } from 'react-icons/md';

const ScenarioSelector = ({ onSelect, isLoading }) => {
  const scenarios = [
    { id: 'netflix', label: 'Netflix 催繳', icon: <MdFlashOn className="text-red-500" /> },
    { id: 'bank', label: '銀行帳戶更新', icon: <MdSettingsSuggest className="text-blue-500" /> },
    { id: 'spotify', label: 'Spotify 續約失敗', icon: <MdOutlinePsychology className="text-green-500" /> },
    { id: 'system', label: '系統安全性通知', icon: <MdSettingsSuggest className="text-gray-600" /> },
  ];

  return (
    <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-4">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex-shrink-0">演練情境：</span>
      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full no-scrollbar">
        {scenarios.map((s) => (
          <button
            key={s.id}
            disabled={isLoading}
            onClick={() => onSelect(s.id)}
            className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>
      {isLoading && (
        <div className="ml-auto flex items-center gap-2 text-xs text-blue-600 font-bold animate-pulse">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          Gemini 正在生成信件...
        </div>
      )}
    </div>
  );
};

export default ScenarioSelector;
