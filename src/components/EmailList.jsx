import React from 'react';
import { 
  MdCheckBoxOutlineBlank, 
  MdStarBorder, 
  MdRefresh, 
  MdMoreVert, 
  MdArchive, 
  MdDelete, 
  MdMarkAsUnread, 
  MdAccessTime,
  MdArrowDropDown
} from 'react-icons/md';

const EmailList = ({ emails, onEmailClick }) => {
  return (
    <div className="flex-1 bg-white overflow-y-auto">
      {/* 列表頂部工具列 */}
      <div className="h-12 border-b flex items-center px-4 gap-4 text-gray-600 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-0 hover:bg-gray-100 p-1 rounded cursor-pointer transition-colors">
          <MdCheckBoxOutlineBlank size={20} className="text-gray-400" />
          <MdArrowDropDown size={18} />
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
          <MdRefresh size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
          <MdMoreVert size={20} />
        </button>
      </div>

      {/* 信件列表項目 */}
      <div className="flex flex-col">
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <MdMarkAsUnread size={64} className="mb-4 opacity-20" />
             <p className="font-bold">收件匣目前空空如也</p>
             <p className="text-xs mt-1">AI 正在為您準備個性化的演練信件...</p>
          </div>
        ) : (
          emails.map((email) => (
            <div 
              key={email.id}
              onClick={() => onEmailClick(email)}
              className="group flex flex-col sm:flex-row sm:items-center px-4 py-3 sm:py-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50 hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)] relative z-0 hover:z-10 transition-shadow"
            >
              {/* Top row on mobile, Left side on desktop */}
              <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto mb-1 sm:mb-0">
                <div className="flex items-center gap-3 sm:mr-4 flex-shrink-0">
                  <MdCheckBoxOutlineBlank size={20} className="hidden sm:block text-gray-300 group-hover:text-gray-400" />
                  <MdStarBorder size={20} className="text-gray-300 hover:text-yellow-400" />
                  {/* 寄件者 */}
                  <div className={`w-[150px] sm:w-[200px] flex-shrink-0 truncate text-sm ${email?.isPhishing ? 'font-bold' : 'text-gray-700'}`}>
                    {email?.senderName}
                  </div>
                </div>
                
                {/* 時間 (Mobile only) */}
                <div className="sm:hidden text-xs text-gray-500 font-medium">
                  {(email?.timestamp ? new Date(email.timestamp) : new Date()).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
              </div>

              {/* 主旨與摘要 */}
              <div className="flex-1 min-w-0 flex items-center text-sm overflow-hidden whitespace-nowrap sm:mr-8 ml-8 sm:ml-0">
                <span className="font-bold text-gray-900 flex-shrink-0 mr-1 truncate max-w-[60%] sm:max-w-none">{email?.subject}</span>
                <span className="text-gray-500 truncate hidden sm:inline">- {(email?.content || email?.bodyMarkdown || '').replace(/<[^>]*>?/gm, '')}</span>
              </div>

              {/* 右側：時間或快速操作 (Desktop) */}
              <div className="hidden sm:block flex-shrink-0 text-xs font-medium text-gray-700 w-16 text-right group-hover:hidden">
                {(email?.timestamp ? new Date(email.timestamp) : new Date()).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>

              {/* Hover 時出現的快速操作 Icon */}
              <div className="hidden sm:group-hover:flex items-center gap-1 text-gray-600 flex-shrink-0 bg-transparent px-2 absolute right-2 top-1/2 -translate-y-1/2">
                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors" title="封存">
                  <MdArchive size={20} />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors" title="刪除">
                  <MdDelete size={20} />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors" title="標示為未讀">
                  <MdMarkAsUnread size={20} />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors" title="延後">
                  <MdAccessTime size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmailList;
