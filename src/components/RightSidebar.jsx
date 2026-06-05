import React from 'react';
import { SiGooglecalendar, SiGooglekeep } from 'react-icons/si';
import { MdTaskAlt, MdPerson, MdAdd } from 'react-icons/md';

const RightSidebar = () => {
  const apps = [
    { icon: <SiGooglecalendar className="text-blue-600" size={20} />, label: '日曆' },
    { icon: <SiGooglekeep className="text-yellow-500" size={20} />, label: 'Keep' },
    { icon: <MdTaskAlt className="text-blue-500" size={22} />, label: 'Tasks' },
    { icon: <MdPerson className="text-blue-500" size={22} />, label: '聯絡人' },
  ];

  return (
    <div className="w-[56px] border-l border-gray-100 bg-white flex flex-col items-center py-4 gap-4 flex-shrink-0 hidden md:flex">
      {apps.map((app) => (
        <div 
          key={app.label}
          className="p-2.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
          title={app.label}
        >
          {app.icon}
        </div>
      ))}
      <div className="w-5 h-[1px] bg-gray-200 my-2"></div>
      <div className="p-2.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors" title="取得外掛程式">
        <MdAdd size={22} className="text-gray-600" />
      </div>
    </div>
  );
};

export default RightSidebar;
