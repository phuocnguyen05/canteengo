import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Search, 
  MessageSquare, 
  CheckCheck, 
  User as UserIcon, 
  Clock, 
  Bot, 
  Sparkles, 
  Phone, 
  Filter, 
  ShieldCheck, 
  AlertCircle,
  Zap,
  CheckCircle2,
  Users
} from 'lucide-react';
import { ChatMessage, User } from '../types';
import { formatTime24h } from '../utils/orderTimeHelper';

interface StaffChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatMessages: ChatMessage[];
  currentUser: User | null;
  onSendStaffMessage: (conversationId: string, messageText: string, staffUser: User) => void;
  onMarkAsReadByStaff?: (conversationId: string) => void;
}

const QUICK_STAFF_REPLIES = [
  'Dạ đơn hàng của bạn đã làm xong rồi ạ! Mời bạn ghé Quầy nhận món nhé! 🍱',
  'Dạ bếp đã ghi nhận ghi chú thêm gia vị / ít ớt của bạn rồi ạ! ✨',
  'Dạ món này bếp đang ra lò nóng hổi, bạn vui lòng đợi 3-5 phút giúp bếp nha! ⏳',
  'Dạ món này hôm nay canteen tạm hết hàng, bạn có muốn đổi sang món khác không ạ? 🙏',
  'Dạ tài khoản ví C-Pay của bạn đã nạp tiền thành công rồi nha! 💳'
];

export const StaffChatModal: React.FC<StaffChatModalProps> = ({
  isOpen,
  onClose,
  chatMessages,
  currentUser,
  onSendStaffMessage,
  onMarkAsReadByStaff
}) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNREAD'>('ALL');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Group messages by conversationId
  const conversations = useMemo(() => {
    const map = new Map<string, {
      conversationId: string;
      customerName: string;
      customerPhone?: string;
      lastMessage: ChatMessage;
      unreadCount: number;
      messages: ChatMessage[];
    }>();

    chatMessages.forEach((msg) => {
      const existing = map.get(msg.conversationId);
      const isCustomerSender = !msg.isStaffReply && (msg.senderRole === 'CUSTOMER' || msg.senderRole === 'GUEST');
      const isUnread = isCustomerSender && !msg.isReadByStaff;

      if (!existing) {
        map.set(msg.conversationId, {
          conversationId: msg.conversationId,
          customerName: msg.customerName || 'Khách hàng',
          customerPhone: msg.customerPhone,
          lastMessage: msg,
          unreadCount: isUnread ? 1 : 0,
          messages: [msg]
        });
      } else {
        existing.messages.push(msg);
        if (new Date(msg.createdAt).getTime() >= new Date(existing.lastMessage.createdAt).getTime()) {
          existing.lastMessage = msg;
        }
        if (isUnread) {
          existing.unreadCount += 1;
        }
        if (isCustomerSender && msg.customerName && msg.customerName !== 'Khách hàng') {
          existing.customerName = msg.customerName;
        }
        if (msg.customerPhone) {
          existing.customerPhone = msg.customerPhone;
        }
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }, [chatMessages]);

  // Filter conversations based on search & tab
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchesSearch =
        c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.conversationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.customerPhone && c.customerPhone.includes(searchQuery));
      
      const matchesTab = filterTab === 'ALL' || c.unreadCount > 0;

      return matchesSearch && matchesTab;
    });
  }, [conversations, searchQuery, filterTab]);

  // Select first conversation on load if none selected
  useEffect(() => {
    if (isOpen && conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].conversationId);
    }
  }, [isOpen, conversations]);

  // Current active conversation
  const currentConv = conversations.find((c) => c.conversationId === selectedConversationId);

  // Active messages sorted chronologically
  const activeMessages = useMemo(() => {
    if (!currentConv) return [];
    return [...currentConv.messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [currentConv]);

  const scrollToBottom = (instant = false) => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
      messagesEndRef.current?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
    }, 60);
  };

  // Scroll to bottom whenever active conversation or messages change
  useEffect(() => {
    if (isOpen && selectedConversationId) {
      scrollToBottom(true);
    }
  }, [isOpen, selectedConversationId, activeMessages.length]);

  // Mark as read when selecting conversation
  useEffect(() => {
    if (selectedConversationId && onMarkAsReadByStaff) {
      onMarkAsReadByStaff(selectedConversationId);
    }
  }, [selectedConversationId]);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !selectedConversationId || !currentUser) return;

    onSendStaffMessage(selectedConversationId, inputMessage.trim(), currentUser);
    setInputMessage('');
    scrollToBottom();
  };

  const handleQuickSend = (presetText: string) => {
    if (!selectedConversationId || !currentUser) return;
    onSendStaffMessage(selectedConversationId, presetText, currentUser);
    scrollToBottom();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-5xl h-[620px] max-h-[88vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base tracking-tight">Hộp Thư CSKH & Trả Lời Khách Hàng</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Dành cho Nhân viên & Admin</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                <span>Bất kỳ tài khoản Nhân viên nào cũng có thể xem & phản hồi câu hỏi của khách hàng</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Split Body */}
        <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
          
          {/* Left Column: Conversations List */}
          <div className="w-64 sm:w-72 md:w-80 shrink-0 border-r border-slate-200 bg-slate-50/70 flex flex-col min-h-0">
            
            {/* Search & Tabs */}
            <div className="p-3 border-b border-slate-200 space-y-2 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm theo tên khách hoặc SĐT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl">
                <button
                  onClick={() => setFilterTab('ALL')}
                  className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                    filterTab === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({conversations.length})
                </button>
                <button
                  onClick={() => setFilterTab('UNREAD')}
                  className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    filterTab === 'UNREAD'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Chưa đọc</span>
                  {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-black">
                      {conversations.filter(c => c.unreadCount > 0).length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* List items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-0">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="font-bold">Không có tin nhắn nào</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = conv.conversationId === selectedConversationId;

                  return (
                    <button
                      key={conv.conversationId}
                      onClick={() => {
                        setSelectedConversationId(conv.conversationId);
                        if (onMarkAsReadByStaff) {
                          onMarkAsReadByStaff(conv.conversationId);
                        }
                      }}
                      className={`w-full p-3.5 text-left transition-all cursor-pointer flex items-start gap-3 relative border-l-4 ${
                        isSelected
                          ? 'bg-white border-l-orange-500 shadow-2xs'
                          : 'hover:bg-slate-100/70 border-l-transparent'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {conv.customerName.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-xs text-slate-900 truncate">
                            {conv.customerName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">
                            {formatTime24h(conv.lastMessage.createdAt, false)}
                          </span>
                        </div>

                        {conv.customerPhone && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            📞 {conv.customerPhone}
                          </span>
                        )}

                        <p className={`text-[11px] truncate ${
                          conv.unreadCount > 0 ? 'font-black text-slate-900' : 'text-slate-500 font-medium'
                        }`}>
                          {conv.lastMessage.isStaffReply || conv.lastMessage.senderRole === 'STAFF' || conv.lastMessage.senderRole === 'ADMIN' ? (
                            <span className="text-orange-600 font-bold">Bạn: </span>
                          ) : null}
                          {conv.lastMessage.message}
                        </p>
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-xs">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Chat Stream */}
          <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-white overflow-hidden">
            {currentConv ? (
              <>
                {/* Active Chat Header */}
                <div className="p-3.5 px-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-2xl bg-orange-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {currentConv.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-sm text-slate-900 flex items-center gap-2 truncate">
                        <span className="truncate">{currentConv.customerName}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-extrabold text-[10px] shrink-0">
                          {currentConv.conversationId}
                        </span>
                      </h3>
                      {currentConv.customerPhone && (
                        <p className="text-[11px] text-slate-500 font-medium truncate">
                          Số điện thoại: <span className="font-mono font-bold text-slate-800">{currentConv.customerPhone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Sẵn sàng phản hồi</span>
                    </span>
                  </div>
                </div>

                {/* Stream Messages */}
                <div ref={chatContainerRef} className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-50/40 min-h-0">
                  {activeMessages.map((msg) => {
                    const isStaff = msg.isStaffReply === true || msg.senderRole === 'STAFF' || msg.senderRole === 'ADMIN';

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 items-start ${isStaff ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                          isStaff ? 'bg-orange-500 text-white' : 'bg-slate-900 text-white'
                        }`}>
                          {isStaff ? 'NV' : <UserIcon className="w-4 h-4" />}
                        </div>

                        <div className={`max-w-[78%] p-3.5 rounded-2xl text-xs shadow-2xs space-y-1 ${
                          isStaff
                            ? 'bg-orange-500 text-white rounded-tr-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                        }`}>
                          <div className={`flex items-center justify-between gap-3 text-[10px] border-b pb-1 mb-1 ${
                            isStaff ? 'border-orange-400/50 text-orange-100' : 'border-slate-100 text-slate-400'
                          }`}>
                            <span className="font-extrabold">
                              {isStaff ? `💬 ${msg.senderName}` : (msg.customerName || 'Khách hàng')}
                            </span>
                            <span>
                              {formatTime24h(msg.createdAt, false)}
                            </span>
                          </div>

                          <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Presets Bar */}
                <div className="p-2.5 px-4 bg-slate-50 border-t border-slate-200 space-y-1 shrink-0">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span>Mẫu trả lời nhanh của Nhân viên:</span>
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none min-w-0">
                    {QUICK_STAFF_REPLIES.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickSend(preset)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-900 border border-slate-200 hover:border-orange-300 text-[11px] font-bold whitespace-nowrap transition-all shadow-2xs cursor-pointer shrink-0 active:scale-98"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-3 px-4 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
                  <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl shrink-0 border border-slate-200 hidden sm:block">
                    Phản hồi dưới tên: <span className="text-orange-600 font-extrabold">{currentUser?.fullName}</span>
                  </div>

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Nhập nội dung tin nhắn trả lời khách hàng..."
                    className="flex-1 min-w-0 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                  />

                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20 cursor-pointer shrink-0"
                  >
                    <span>Gửi</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 text-center">
                <MessageSquare className="w-12 h-12 mb-3 text-slate-300" />
                <h3 className="font-extrabold text-slate-700 text-sm">Chọn một cuộc trò chuyện từ danh sách bên trái</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Tất cả tin nhắn từ khách hàng gửi đến CanteenGo sẽ hiển thị tại đây để bất kỳ nhân viên nào cũng có thể hỗ trợ ngay.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
