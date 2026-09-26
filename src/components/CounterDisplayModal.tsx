import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  X, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  Sparkles, 
  BellRing,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Award
} from 'lucide-react';
import { Order } from '../types';
import { formatTime24h, normalizeTimeString24h } from '../utils/orderTimeHelper';

interface CounterDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export const CounterDisplayModal: React.FC<CounterDisplayModalProps> = ({
  isOpen,
  onClose,
  orders
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('ALL');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [lastAnnouncedOrder, setLastAnnouncedOrder] = useState<string>('');

  // Clock interval
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(formatTime24h(now, true));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders - memoized to prevent recreation on every render
  const preparingOrders = React.useMemo(
    () => orders.filter((o) => o.status === 'PROCESSING' || o.status === 'PENDING'),
    [orders]
  );
  const readyOrders = React.useMemo(
    () => orders.filter((o) => o.status === 'READY'),
    [orders]
  );

  // Trigger audio announcement when a new order becomes READY
  useEffect(() => {
    if (!isOpen || readyOrders.length === 0) return;
    const latestReady = readyOrders[0];
    if (latestReady && latestReady.orderCode !== lastAnnouncedOrder) {
      setLastAnnouncedOrder(latestReady.orderCode);
      if (soundEnabled) {
        playChime();
      }
      if (speechEnabled && 'speechSynthesis' in window) {
        speakText(`Mời đơn hàng ${latestReady.orderCode} đến ${latestReady.pickupArea} nhận món`);
      }
    }
  }, [readyOrders, isOpen, soundEnabled, speechEnabled, lastAnnouncedOrder]);

  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5

      osc2.frequency.setValueAtTime(261.63, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(329.63, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.85);
      osc2.stop(ctx.currentTime + 0.85);
    } catch (e) {
      console.warn('Audio chime fallback', e);
    }
  };

  const speakText = (text: string) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col font-sans overflow-hidden animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <header className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8B84B] text-black flex items-center justify-center shadow-lg shadow-[#E8B84B]/20 ring-2 ring-[#E8B84B]/40 animate-pulse font-bold">
            <Tv className="w-7 h-7 text-black fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight uppercase font-serif">Màn Hình Hiển Thị Gọi Món Tại Quầy</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Broadcast
              </span>
            </div>
            <p className="text-xs text-text-secondary">Bảng theo dõi trạng thái món ăn thời gian thực dành cho khách nhận tại quầy Canteen</p>
          </div>
        </div>

        {/* Controls & Clock */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-card border border-border-base text-[#E8B84B] font-mono font-bold text-lg">
            <Clock className="w-5 h-5 text-[#E8B84B] animate-spin" style={{ animationDuration: '10s' }} />
            <span>{currentTime}</span>
          </div>

          <div className="flex items-center gap-2 bg-bg-primary border border-border-base p-1.5 rounded-xl">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                soundEnabled ? 'bg-[#E8B84B] text-black shadow-sm font-extrabold' : 'bg-bg-card text-text-secondary hover:text-text-primary'
              }`}
              title="Bật/Tắt chuông báo"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Chuông On' : 'Chuông Off'}</span>
            </button>

            <button
              onClick={() => {
                setSpeechEnabled(!speechEnabled);
                if (!speechEnabled) speakText("Đã bật loa đọc mã đơn tự động");
              }}
              className={`p-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                speechEnabled ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Bật/Tắt giọng đọc mã đơn"
            >
              <BellRing className="w-4 h-4" />
              <span className="hidden sm:inline">{speechEnabled ? 'Đọc Loa On' : 'Đọc Loa Off'}</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Toàn màn hình TV"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 transition-colors cursor-pointer ml-1"
              title="Thoát màn hình"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Screen Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-hidden">
        
        {/* LEFT COLUMN: PREPARING / COOKING */}
        <div className="bg-slate-900/60 border border-amber-500/30 rounded-3xl p-6 flex flex-col shadow-2xl relative overflow-hidden backdrop-blur-xs">
          <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                <ChefHat className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-amber-400 tracking-tight uppercase flex items-center gap-2">
                  ĐANG CHẾ BIẾN
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    {preparingOrders.length} đơn
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Bếp đang chuẩn bị khẩn trương, vui lòng chờ trong giây lát</p>
              </div>
            </div>
            <Flame className="w-8 h-8 text-amber-500/40 animate-pulse" />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-8 border-2 border-dashed border-slate-800 rounded-2xl">
                <ChefHat className="w-16 h-16 text-slate-700 mb-3" />
                <p className="text-base font-bold text-slate-400">Hiện không có đơn nào đang nấu</p>
                <p className="text-xs text-slate-600 mt-1">Đơn hàng mới từ khách sẽ lập tức xuất hiện tại đây</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {preparingOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-slate-800/80 border border-amber-500/30 hover:border-amber-400/60 rounded-2xl p-4 shadow-lg flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-2xl font-black text-amber-300 tracking-wider">
                          #{order.orderCode}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Đang nấu
                        </span>
                      </div>

                      <div className="text-sm font-bold text-white mb-1">
                        Khách: {order.receiverName}
                      </div>

                      <div className="text-xs text-slate-300 space-y-1 mb-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-slate-300">
                            <span className="truncate max-w-[180px]">• {item.itemName}</span>
                            <span className="font-bold text-amber-400">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Vị trí: <strong className="text-white">{order.pickupArea}</strong></span>
                      <span className="font-mono text-amber-400/80">Nhận lúc: {normalizeTimeString24h(order.pickupTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: READY FOR PICKUP */}
        <div className="bg-slate-900/60 border border-emerald-500/40 rounded-3xl p-6 flex flex-col shadow-2xl relative overflow-hidden backdrop-blur-xs ring-4 ring-emerald-500/10">
          <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 animate-pulse text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-emerald-400 tracking-tight uppercase flex items-center gap-2">
                  MỜI NHẬN MÓN (READY)
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 animate-pulse">
                    {readyOrders.length} đơn sẵn sàng
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Quý khách có mã đơn tương ứng vui lòng tiến tới đúng quầy để nhận món</p>
              </div>
            </div>
            <Sparkles className="w-8 h-8 text-emerald-400/40 animate-spin" style={{ animationDuration: '8s' }} />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-8 border-2 border-dashed border-slate-800 rounded-2xl">
                <CheckCircle2 className="w-16 h-16 text-slate-700 mb-3" />
                <p className="text-base font-bold text-slate-400">Chưa có đơn hàng nào chờ nhận món</p>
                <p className="text-xs text-slate-600 mt-1">Khi bếp bấm hoàn tất, mã đơn sẽ phát sáng tại đây</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {readyOrders.map((order, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div 
                      key={order.id}
                      className={`rounded-3xl p-5 shadow-2xl flex flex-col justify-between transition-all transform duration-300 relative overflow-hidden ${
                        isLatest 
                          ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 border-2 border-emerald-400 shadow-emerald-500/30 scale-[1.02] ring-4 ring-emerald-500/20 animate-pulse' 
                          : 'bg-slate-800/90 border border-emerald-500/40 hover:border-emerald-400'
                      }`}
                    >
                      {isLatest && (
                        <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-3xl font-black text-emerald-400 tracking-wider flex items-center gap-2">
                            #{order.orderCode}
                            {isLatest && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                                Vừa xong
                              </span>
                            )}
                          </span>
                          <span className="text-xs font-black px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 uppercase shadow-md">
                            {order.pickupArea}
                          </span>
                        </div>

                        <div className="text-base font-bold text-white mb-2">
                          Khách: <span className="text-emerald-300">{order.receiverName}</span>
                        </div>

                        <div className="bg-slate-950/60 rounded-xl p-3 border border-emerald-500/20 text-xs text-slate-200 mb-3 space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <span className="font-medium text-slate-300 truncate max-w-[180px]">{item.itemName}</span>
                              <span className="font-black text-emerald-400">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Giờ hoàn thành món:</span>
                        <span className="font-mono font-bold text-emerald-400">{normalizeTimeString24h(order.completedAt || order.pickupTime)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Info Bar */}
      <footer className="px-6 py-3 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>Đang chế biến: <strong className="text-amber-400">{preparingOrders.length}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Sẵn sàng nhận: <strong className="text-emerald-400">{readyOrders.length}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <Award className="w-4 h-4 text-orange-400" />
          <span>Hệ thống điều phối đơn hàng thông minh CanteenGo Live System</span>
        </div>
      </footer>

    </div>
  );
};
