import React, { useState } from 'react';
import { 
  Award, 
  X, 
  Sparkles, 
  Gift, 
  ChevronRight, 
  Check, 
  ShieldCheck, 
  Wallet, 
  Ticket, 
  TrendingUp, 
  Zap, 
  Star,
  Info
} from 'lucide-react';
import { User, VipTier, Voucher } from '../types';

interface LoyaltyPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onRedeemToWallet: (pointsNeeded: number, bonusVndAmount: number) => void;
  onRedeemVoucher: (pointsNeeded: number, voucherCode: string, discountPct: number) => void;
}

export const LoyaltyPointsModal: React.FC<LoyaltyPointsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRedeemToWallet,
  onRedeemVoucher
}) => {
  const [activeTab, setActiveTab] = useState<'CARD' | 'REDEEM' | 'TIERS'>('CARD');

  if (!isOpen || !currentUser) return null;

  const points = currentUser.rewardPoints || 0;
  const currentTier: VipTier = currentUser.vipTier || (
    points >= 700 ? 'DIAMOND' : points >= 300 ? 'GOLD' : points >= 100 ? 'SILVER' : 'BRONZE'
  );

  const getTierInfo = (tier: VipTier) => {
    switch (tier) {
      case 'DIAMOND':
        return {
          name: 'Hạng Kim Cương',
          badge: '💎 Kim Cương',
          color: 'from-cyan-500 via-blue-600 to-indigo-700',
          textColor: 'text-cyan-400',
          borderColor: 'border-cyan-400/50',
          bgLight: 'bg-cyan-50 border-cyan-200',
          discountPct: 8,
          minPoints: 700,
          nextPoints: 1000,
          perks: ['Giảm 8% tự động cho mọi đơn hàng', 'Miễn phí 1 Đồ uống/ngày', 'Tích 1.5x C-Points', 'Ưu tiên chế biến tại Bếp']
        };
      case 'GOLD':
        return {
          name: 'Hạng Vàng VIP',
          badge: '🥇 Hạng Vàng',
          color: 'from-amber-400 via-yellow-500 to-amber-600',
          textColor: 'text-amber-500',
          borderColor: 'border-amber-400/50',
          bgLight: 'bg-amber-50 border-amber-200',
          discountPct: 5,
          minPoints: 300,
          nextPoints: 700,
          perks: ['Giảm 5% tự động cho mọi đơn hàng', 'Tặng 1 Topping miễn phí', 'Tích 1.2x C-Points', 'Hỗ trợ CSKH ưu tiên']
        };
      case 'SILVER':
        return {
          name: 'Hạng Bạc',
          badge: '🥈 Hạng Bạc',
          color: 'from-slate-300 via-slate-400 to-slate-500',
          textColor: 'text-slate-600',
          borderColor: 'border-slate-300',
          bgLight: 'bg-slate-50 border-slate-200',
          discountPct: 3,
          minPoints: 100,
          nextPoints: 300,
          perks: ['Giảm 3% tự động cho mọi đơn hàng', 'Tích điểm 10k = 1 C-Point', 'Nhận voucher sinh nhật']
        };
      default:
        return {
          name: 'Hạng Đồng',
          badge: '🥉 Hạng Đồng',
          color: 'from-amber-700 via-amber-800 to-yellow-900',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-700/40',
          bgLight: 'bg-orange-50 border-orange-200',
          discountPct: 0,
          minPoints: 0,
          nextPoints: 100,
          perks: ['Tích điểm 10k = 1 C-Point', 'Tham gia các sự kiện khuyến mãi Canteen']
        };
    }
  };

  const info = getTierInfo(currentTier);
  const progressPct = Math.min(100, Math.max(0, ((points - info.minPoints) / (info.nextPoints - info.minPoints)) * 100));

  const redeemWalletOptions = [
    { points: 50, Vnd: 5000, title: 'Đổi +5.000₫ vào Ví C-Pay', desc: '50 C-Points ➔ 5k tiền mặt ví' },
    { points: 100, Vnd: 12000, title: 'Đổi +12.000₫ vào Ví C-Pay', desc: '100 C-Points ➔ 12k (Thêm 2k thưởng VIP)' },
    { points: 200, Vnd: 26000, title: 'Đổi +26.000₫ vào Ví C-Pay', desc: '200 C-Points ➔ 26k (Thêm 6k thưởng VIP)' },
  ];

  const redeemVoucherOptions = [
    { points: 30, code: 'CPOINT10K', pct: 15, title: 'Voucher Giảm 15% Đơn Trưa', desc: 'Yêu cầu 30 C-Points' },
    { points: 60, code: 'CPOINTVIP20', pct: 20, title: 'Voucher VIP Giảm 20% Tất Cả', desc: 'Yêu cầu 60 C-Points' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-bg-card rounded-3xl shadow-2xl border border-border-base overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-bg-primary text-text-primary flex items-center justify-between border-b border-border-base">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8B84B]/20 border border-[#E8B84B]/30 flex items-center justify-center text-[#E8B84B] shadow-lg">
              <Award className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-[#E8B84B] font-serif tracking-tight">Kho Điểm Thưởng & Hạng VIP</h3>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#E8B84B] text-black uppercase">
                  C-Club
                </span>
              </div>
              <p className="text-xs text-text-secondary">Tích điểm nhận ưu đãi chiết khấu trực tiếp trên mỗi đơn cơm</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-bg-input hover:bg-bg-elevated text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border-base bg-bg-primary px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('CARD')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'CARD'
                ? 'bg-bg-card text-[#E8B84B] border-t-2 border-[#E8B84B] shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Award className="w-4 h-4" />
            Thẻ VIP Của Tôi
          </button>

          <button
            onClick={() => setActiveTab('REDEEM')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'REDEEM'
                ? 'bg-bg-card text-[#E8B84B] border-t-2 border-[#E8B84B] shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Gift className="w-4 h-4 text-[#E8B84B]" />
            Đổi Quà & Tiền Ví
          </button>

          <button
            onClick={() => setActiveTab('TIERS')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'TIERS'
                ? 'bg-bg-card text-[#E8B84B] border-t-2 border-[#E8B84B] shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#E8B84B]" />
            Đặc Quyền Hạng
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* TAB 1: VIP CARD */}
          {activeTab === 'CARD' && (
            <div className="space-y-6">
              
              {/* Metallic VIP Card */}
              <div className="rounded-3xl p-6 bg-gradient-to-tr from-bg-input via-bg-card to-bg-primary text-text-primary shadow-2xl relative overflow-hidden border border-[#E8B84B]/40 transform transition-transform hover:scale-[1.01]">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-[#E8B84B]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-40 h-40 bg-black/40 rounded-full blur-2xl pointer-events-none" />

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs uppercase font-bold text-[#E8B84B] tracking-widest block mb-1">
                      CanteenGo VIP Club Card
                    </span>
                    <h4 className="text-2xl font-black text-text-primary font-serif tracking-tight">{currentUser.fullName}</h4>
                    <span className="text-xs text-text-secondary font-mono">{currentUser.phone || currentUser.email}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-[#E8B84B]/20 border border-[#E8B84B]/40 text-[#E8B84B] font-black text-xs uppercase shadow-xs">
                    {info.badge}
                  </div>
                </div>

                <div className="pt-4 border-t border-border-base flex items-end justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-text-secondary block">Điểm tích lũy hiện có</span>
                    <div className="text-3xl font-black text-[#E8B84B] font-mono flex items-center gap-1.5">
                      <Zap className="w-6 h-6 fill-[#E8B84B] text-[#E8B84B] animate-bounce" />
                      {points} <span className="text-sm font-bold text-text-secondary">C-Points</span>
                    </div>
                  </div>

                  {info.discountPct > 0 ? (
                    <div className="text-right bg-bg-primary/60 px-3 py-1.5 rounded-2xl backdrop-blur-xs border border-[#E8B84B]/30">
                      <span className="text-[10px] text-text-secondary uppercase font-bold block">Ưu đãi cố định</span>
                      <span className="text-sm font-black text-[#E8B84B]">Giảm -{info.discountPct}% Đơn</span>
                    </div>
                  ) : (
                    <span className="text-xs text-text-secondary italic">Tích thêm điểm để nhận giảm %</span>
                  )}
                </div>
              </div>

              {/* Tier Progress Bar */}
              <div className="bg-bg-card border border-border-base rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2 text-xs font-bold text-text-primary">
                  <span className="flex items-center gap-1 text-[#E8B84B]">
                    <TrendingUp className="w-4 h-4 text-[#E8B84B]" />
                    Tiến trình thăng hạng
                  </span>
                  <span className="text-[#E8B84B]">{points} / {info.nextPoints} C-Points</span>
                </div>

                <div className="w-full bg-bg-primary h-3 rounded-full overflow-hidden mb-2 p-0.5 border border-border-base">
                  <div 
                    className="bg-gradient-to-r from-[#E8B84B] to-[#F4C95D] h-full rounded-full transition-all duration-500 shadow-xs" 
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <p className="text-[11px] text-text-secondary flex items-center justify-between">
                  <span>Còn thiếu <strong className="text-[#E8B84B]">{Math.max(0, info.nextPoints - points)} C-Points</strong> nữa để thăng hạng</span>
                  <span className="font-bold text-text-primary">{info.name}</span>
                </p>
              </div>

              {/* Perks List */}
              <div className="space-y-3">
                <h5 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#E8B84B]" />
                  Đặc quyền đang có của {info.name}:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {info.perks.map((perk, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-bg-card border border-border-base flex items-center gap-2.5 text-xs font-semibold text-text-secondary">
                      <div className="w-5 h-5 rounded-full bg-[#E8B84B]/20 text-[#E8B84B] flex items-center justify-center shrink-0 border border-[#E8B84B]/30">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: REDEEM STORE */}
          {activeTab === 'REDEEM' && (
            <div className="space-y-6">
              
              {/* Header Points Badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-bg-input to-bg-primary border border-[#E8B84B]/40 text-text-primary flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-[#E8B84B] fill-[#E8B84B] animate-pulse" />
                  <div>
                    <span className="text-xs text-text-secondary font-bold uppercase block">Số điểm khả dụng</span>
                    <span className="text-2xl font-black font-mono text-[#E8B84B]">{points} C-Points</span>
                  </div>
                </div>
                <span className="text-xs bg-[#E8B84B]/20 border border-[#E8B84B]/30 text-[#E8B84B] px-3 py-1.5 rounded-xl font-bold">
                  10.000₫ = +1 C-Point
                </span>
              </div>

              {/* Redeem to Wallet Cash */}
              <div className="space-y-3">
                <h5 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#E8B84B]" />
                  Đổi Điểm Sang Tiền Nạp Ví C-Pay:
                </h5>
                <div className="space-y-2.5">
                  {redeemWalletOptions.map((opt, idx) => {
                    const canAfford = points >= opt.points;
                    return (
                      <div 
                        key={idx}
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                          canAfford ? 'bg-bg-card border-[#E8B84B]/30 hover:border-[#E8B84B] shadow-xs' : 'bg-bg-primary border-border-base opacity-60'
                        }`}
                      >
                        <div>
                          <h6 className="font-bold text-sm text-text-primary">{opt.title}</h6>
                          <p className="text-xs text-text-secondary">{opt.desc}</p>
                        </div>
                        <button
                          disabled={!canAfford}
                          onClick={() => onRedeemToWallet(opt.points, opt.Vnd)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            canAfford 
                              ? 'bg-[#E8B84B] hover:bg-[#F4C95D] text-black cursor-pointer active:scale-95 font-extrabold' 
                              : 'bg-bg-elevated text-text-secondary cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Đổi Ngay' : `Thiếu ${opt.points - points}p`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Redeem Vouchers */}
              <div className="space-y-3 pt-2">
                <h5 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[#E8B84B]" />
                  Đổi Điểm Nhận Mã Ưu Đãi:
                </h5>
                <div className="space-y-2.5">
                  {redeemVoucherOptions.map((opt, idx) => {
                    const canAfford = points >= opt.points;
                    return (
                      <div 
                        key={idx}
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                          canAfford ? 'bg-bg-card border-[#E8B84B]/30 hover:border-[#E8B84B] shadow-xs' : 'bg-bg-primary border-border-base opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h6 className="font-bold text-sm text-text-primary">{opt.title}</h6>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8B84B]/20 text-[#E8B84B] border border-[#E8B84B]/30 font-bold">
                              {opt.code}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary">{opt.desc}</p>
                        </div>
                        <button
                          disabled={!canAfford}
                          onClick={() => onRedeemVoucher(opt.points, opt.code, opt.pct)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            canAfford 
                              ? 'bg-[#E8B84B] hover:bg-[#F4C95D] text-black cursor-pointer active:scale-95 font-extrabold' 
                              : 'bg-bg-elevated text-text-secondary cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Nhận Mã' : `Thiếu ${opt.points - points}p`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: TIERS OVERVIEW */}
          {activeTab === 'TIERS' && (
            <div className="space-y-4">
              <p className="text-xs text-text-secondary">Bảng chi tiết điều kiện thăng hạng và chiết khấu ưu đãi dành cho tất cả thành viên CanteenGo:</p>

              {(['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'] as VipTier[]).map((t) => {
                const tInfo = getTierInfo(t);
                const isCurrent = t === currentTier;
                return (
                  <div 
                    key={t}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent 
                        ? 'bg-bg-elevated border-[#E8B84B] shadow-sm' 
                        : 'bg-bg-card border-border-base'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-text-primary">{tInfo.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E8B84B] text-black">
                            Hạng hiện tại
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-[#E8B84B]">
                        {tInfo.minPoints} C-Points+
                      </span>
                    </div>

                    <div className="text-xs text-text-secondary mb-2">
                      Chiết khấu tự động: <strong className="text-[#E8B84B]">-{tInfo.discountPct}% tất cả đơn hàng</strong>
                    </div>

                    <ul className="text-xs text-text-secondary space-y-1">
                      {tInfo.perks.map((p, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#E8B84B] shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer Note */}
        <div className="p-4 bg-bg-primary border-t border-border-base text-[11px] text-text-secondary flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#E8B84B]" />
            <span>Mỗi 10.000₫ thanh toán đơn thành công = +1 C-Point</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-bg-elevated hover:bg-bg-hover text-text-primary font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
