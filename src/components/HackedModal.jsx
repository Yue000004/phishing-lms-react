import React from 'react';

const HackedModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-red-700 flex flex-col items-center justify-center text-white p-4 text-center animate-pulse">
      <div className="max-w-2xl border-8 border-black p-10 bg-red-600 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter uppercase italic">
          ⚠️ WARNING!
        </h1>
        <p className="text-3xl md:text-4xl font-bold mb-10 leading-tight">
          你已點擊惡意連結，<br />
          <span className="text-black bg-white px-2">系統遭到入侵！</span>
        </p>
        <div className="space-y-4">
          <p className="text-xl font-mono">
            [DANGER] EXFILTRATING SENSITIVE DATA... 100%<br />
            [DANGER] PASSWORD HASHES COMPROMISED<br />
            [DANGER] WEBCAM ACCESS GRANTED
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-12 bg-black hover:bg-white hover:text-black text-white font-black py-4 px-8 text-2xl transition-all duration-300 transform hover:scale-110 border-4 border-black"
        >
          查看我的資安弱點
        </button>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse {
          animation: pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default HackedModal;
