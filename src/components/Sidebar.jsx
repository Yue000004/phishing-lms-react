import React from 'react';
import { 
  MdEdit, MdInbox, MdStarOutline, MdAccessTime, 
  MdSend, MdInsertDriveFile, MdDeleteOutline, 
  MdAnalytics, MdScience 
} from 'react-icons/md';

const Sidebar = ({ activeTab = 'inbox', onTabClick, unreadCount = 0 }) => {
  const menuItems = [
    { id: 'practice', icon: <MdScience size={20} className="text-green-600" />, label: '🔰 新手練習模式' },
    { id: 'challenge', icon: <MdInbox size={20} className="text-red-500" />, label: '😈 魔王挑戰模式', count: unreadCount },
    { id: 'starred', icon: <MdStarOutline size={20} />, label: '已加星號' },
    { id: 'snoozed', icon: <MdAccessTime size={20} />, label: '延後處理' },
    { id: 'sent', icon: <MdSend size={20} />, label: '已傳送' },
    { id: 'drafts', icon: <MdInsertDriveFile size={20} />, label: '草稿' },
    { id: 'trash', icon: <MdDeleteOutline size={20} />, label: '垃圾桶' },
    { id: 'separator', type: 'separator' },
    { id: 'analytics', icon: <MdAnalytics size={20} className="text-blue-600" />, label: '行為分析報告', highlight: true },
  ];

  return (
    <div className="w-64 flex flex-col py-2 pr-4 bg-white h-[calc(100vh-64px)] overflow-y-auto border-r border-gray-50">
      {/* Compose Button */}
      <div className="px-2 mb-4">
        <button className="bg-[#ea4335] hover:bg-[#d93025] hover:shadow-md transition-shadow flex items-center gap-3 px-6 py-4 rounded-2xl text-white font-medium ml-2 shadow-sm">
          <MdEdit size={24} />
          <span>撰寫</span>
        </button>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1">
        {menuItems.map((item, idx) => (
          item.type === 'separator' ? (
            <div key={`sep-${idx}`} className="my-2 border-t border-gray-100 ml-6"></div>
          ) : (
            <div 
              key={item.id}
              onClick={() => onTabClick && onTabClick(item.id)}
              className={`flex items-center justify-between px-6 py-2.5 rounded-r-full cursor-pointer transition-colors group ${
                activeTab === item.id 
                  ? 'bg-[#d3e3fd] font-bold text-[#001d35]' 
                  : 'hover:bg-gray-100 text-gray-700'
              } ${item.highlight ? 'mt-1' : ''}`}
            >
              <div className="flex items-center gap-4">
                <span className={`${activeTab === item.id ? 'text-[#001d35]' : 'text-gray-600 group-hover:text-gray-900'}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </div>
              {item.count > 0 && (
                <span className={`text-xs ${activeTab === item.id ? 'text-[#001d35]' : 'text-gray-600 font-medium'}`}>
                  {item.count}
                </span>
              )}
            </div>
          )
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
