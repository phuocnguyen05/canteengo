import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  Clock, 
  ChevronDown, 
  ShieldCheck, 
  Smile, 
  CheckCheck,
  Utensils
} from 'lucide-react';
import { ChatMessage, User } from '../types';
import { formatTime24h } from '../utils/orderTimeHelper';

interface CustomerChatWidgetProps {
  chatMessages: ChatMessage[];
  currentUser: User | null;
  onSendMessage: (conversationId: string, messageText: string, customerName: string, customerPhone?: string) => void;
  onOpenLogin?: () => void;
  onMarkMessagesAsRead?: (conversationId: string) => void;
  hasFloatingCart?: boolean;
  showScrollTop?: boolean;
}

const QUICK_SUGGESTIONS = [
  '👋 Canteen ơi, cho em hỏi đơn hàng của em khoảng bao lâu nữa có ạ?',
  '🍚 Cơm tấm hôm nay sườn nướng hay bì chả còn nóng không ạ?',
  '🥤 Cho em đổi món nước sang ít đường / ít đá được không ạ?',
  '🥡 Cho em xin thêm 1 hũ nước mắm ngọt và dưa chua nha!'
];

export const CustomerChatWidget: React.FC<CustomerChatWidgetProps> = ({
  chatMessages,
  currentUser,
  onSendMessage,
  onOpenLogin,
  onMarkMessagesAsRead,
  hasFloatingCart = false,
  showScrollTop = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const conversationId = currentUser ? `user-${currentUser.id}` : 'guest-session';
  const customerName = currentUser ? currentUser.fullName : guestName || 'Khách hàng';
  const customerPhone = currentUser ? currentUser.phone : undefined;

  // Filter messages for current user
  const myMessages = chatMessages.filter(
    (m) => m.conversationId === conversationId || (currentUser && m.senderId === currentUser.id)
  );

  // Count unread messages from staff to customer
  const unreadCount = myMessages.filter(
    (m) => (m.senderRole === 'STAFF' || m.senderRole === 'ADMIN') && !m.isReadByCustomer
  ).length;

  const scrollToBottom = (instant = false) => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
      messagesEndRef.current?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
    }, 60);
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(true);
    }
  }, [isOpen, myMessages.length]);

  const handleOpenWidget = () => {
    if (!currentUser) {
      setIsOpen(false);
      if (onOpenLogin) {
        onOpenLogin();
      }
      return;
    }
    setIsOpen(true);
    if (onMarkMessagesAsRead && conversationId) {
      onMarkMessagesAsRead(conversationId);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    onSendMessage(conversationId, inputMessage.trim(), customerName, customerPhone);
    setInputMessage('');
    scrollToBottom();
  };

  const handleQuickClick = (text: string) => {
    onSendMessage(conversationId, text, customerName, customerPhone);
    scrollToBottom();
  };

  return (
    <>
      {/* Floating Chat Launcher Button (Bottom Right - Fixed permanently at default position) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={!currentUser ? handleOpenWidget : (isOpen ? () => setIsOpen(false) : handleOpenWidget)}
          className="relative h-14 px-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-xl shadow-orange-500/30 flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-white"
          title="Chat trực tiếp với Nhân viên & Bếp Canteen"
        >
          <div className="relative flex items-center justify-center">
            <MessageCircle className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white"></span>
          </div>
          <span className="hidden sm:inline font-black text-sm tracking-tight">Chat với Canteen</span>
          {unreadCount > 0 && (
            <span className="min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white font-black text-[11px] flex items-center justify-center animate-bounce shadow-md">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Floating Chat Modal Box */}
      {isOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[520px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black shadow-md">
                <Utensils className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight flex items-center gap-1.5">
                  CanteenGo CSKH
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </h3>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Nhân viên & Bếp trực tuyến
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60">
            {/* Notice Card */}
            <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 text-xs text-amber-900 space-y-1 shadow-2xs">
              <div className="font-extrabold flex items-center gap-1.5 text-amber-950">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Trực tiếp hỗ trợ quý khách!</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                Tất cả các tài khoản Nhân viên & Admin CanteenGo đều nhận được tin nhắn này và sẽ phản hồi quý khách nhanh nhất!
              </p>
            </div>

            {/* Initial Welcome Message */}
            <div className="flex gap-2 items-start">
              <div className="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                CG
              </div>
              <div className="max-w-[82%] bg-white border border-slate-200/90 p-3 rounded-2xl rounded-tl-xs shadow-2xs text-xs text-slate-800">
                <p className="font-bold text-slate-900 mb-0.5">Dạ chào {customerName}! 👋</p>
                <p className="leading-relaxed">
                  CanteenGo có thể hỗ trợ gì cho bữa ăn hôm nay của bạn? Vui lòng gửi yêu cầu hoặc chọn câu hỏi bên dưới nha!
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">Vừa xong</span>
              </div>
            </div>

            {/* Quick Suggestions Chips */}
            {myMessages.length === 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Gợi ý nhanh:</span>
                {QUICK_SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickClick(sug)}
                    className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-orange-50/80 border border-slate-200/80 hover:border-orange-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs active:scale-98"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Message History */}
            {myMessages.map((msg) => {
              const isMe = !msg.isStaffReply && (msg.senderRole === 'CUSTOMER' || msg.senderRole === 'GUEST');

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 items-start ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-[11px] shrink-0 shadow-xs ${
                    isMe
                      ? 'bg-slate-900 text-white'
                      : 'bg-orange-500 text-white'
                  }`}>
                    {isMe ? <UserIcon className="w-3.5 h-3.5" /> : 'CG'}
                  </div>

                  <div className={`max-w-[82%] p-3 rounded-2xl text-xs shadow-2xs space-y-0.5 ${
                    isMe
                      ? 'bg-slate-900 text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                  }`}>
                    {!isMe && (
                      <span className="text-[10px] font-extrabold text-orange-600 block">
                        {msg.senderName} ({msg.senderRole === 'ADMIN' ? 'Admin' : 'Nhân viên'})
                      </span>
                    )}

                    <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                    <div className={`text-[10px] flex items-center gap-1 ${isMe ? 'text-slate-400 justify-end' : 'text-slate-400'}`}>
                      <span>
                        {formatTime24h(msg.createdAt, false)}
                      </span>
                      {isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 space-y-2">
            {!currentUser && (
              <div className="flex items-center justify-between text-[11px] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                <span className="text-orange-900 font-medium">Đang nhắn dưới dạng Khách vô danh</span>
                {onOpenLogin && (
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="font-extrabold text-orange-600 hover:underline cursor-pointer"
                  >
                    Đăng nhập
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập tin nhắn nhắn gửi Nhân viên..."
                className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="h-9 px-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>
      )}
    </>
  );
};
