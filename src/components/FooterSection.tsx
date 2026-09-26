import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  UtensilsCrossed, 
  HeartHandshake, 
  ExternalLink, 
  Flame, 
  Leaf, 
  Award,
  Database,
  Power,
  Sliders,
  Settings,
  Edit2
} from 'lucide-react';
import { User, CanteenStatusConfig } from '../types';

const canteenKitchenAvatar = '/canteen_kitchen_avatar.jpg';

interface FooterSectionProps {
  onNavigateTab: (tab: string) => void;
  currentUser: User | null;
  statusConfig?: CanteenStatusConfig;
  onToggleOpenStatus?: () => void;
  onOpenStatusSettings?: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  onNavigateTab,
  currentUser,
  statusConfig,
  onToggleOpenStatus,
  onOpenStatusSettings,
}) => {
  const isAdmin = currentUser?.role === 'ADMIN';

  const isOpen = statusConfig ? statusConfig.isOpen : true;
  const statusLabel = statusConfig?.statusText || (isOpen ? 'Đang mở cửa phục vụ' : 'Tạm đóng cửa / Nghỉ phục vụ');
  const lunchHours = statusConfig?.lunchHours || '10:30 – 13:30 (Thứ 2 – Thứ 7)';
  const breakfastHours = statusConfig?.breakfastHours || '06:30 – 08:30 & 16:00 – 18:30';

  return (
    <footer className="bg-bg-primary text-text-secondary pt-12 pb-8 mt-16 border-t-2 border-[#E8B84B]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* TOP ROW: Canteen Introduction & Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-border-base">
          
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-bg-card border border-border-base">
            <div className="w-10 h-10 rounded-xl bg-[#E8B84B]/20 text-[#E8B84B] flex items-center justify-center flex-shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-text-primary text-sm">Nguyên Liệu Tươi Sạch VietGAP</h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                100% rau củ quả và thịt cá được nhập mới mỗi sáng từ các nông trại uy tín, kiểm định an toàn vệ sinh thực phẩm nghiêm ngặt.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-bg-card border border-border-base">
            <div className="w-10 h-10 rounded-xl bg-[#E8B84B]/20 text-[#E8B84B] flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-text-primary text-sm">Cân Bằng Dinh Dưỡng Khoa Học</h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Mỗi món ăn và combo 4 khay đều được tính toán lượng calo chuẩn xác, hỗ trợ lối sống lành mạnh cho sinh viên & nhân viên.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-bg-card border border-border-base">
            <div className="w-10 h-10 rounded-xl bg-[#E8B84B]/20 text-[#E8B84B] flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-text-primary text-sm">Ra Khay Nóng Hổi Trong 5 Phút</h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Hệ thống điều phối bếp tự động thông minh giúp bạn nhận cơm đúng giờ hẹn, không lo chen chúc hay chờ đợi giờ cao điểm.
              </p>
            </div>
          </div>

        </div>

        {/* MIDDLE ROW: 3 Columns (About Canteen, Contact Info, Interactive Map) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Col 1: About CanteenGo (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden shadow-md border-2 border-[#E8B84B]">
                <img 
                  src={canteenKitchenAvatar} 
                  alt="Ảnh Bếp ăn Canteen" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-extrabold text-xl text-text-primary font-serif tracking-tight">
                Canteen<span className="text-[#E8B84B]">Go</span>
              </span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              CanteenGo là mô hình căng tin thông minh thế hệ mới, tiên phong ứng dụng công nghệ đặt món trước, tự phối combo cá nhân hóa theo calo và quản lý bếp ăn khép kín. Mang lại bữa ăn ngon, sạch, nhanh và giàu năng lượng mỗi ngày.
            </p>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center gap-2 text-text-secondary">
                <Clock className="w-4 h-4 text-[#E8B84B] flex-shrink-0" />
                <span>
                  <strong>Bữa trưa chính:</strong> {lunchHours}
                </span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Clock className="w-4 h-4 text-[#E8B84B] flex-shrink-0" />
                <span>
                  <strong>Bữa sáng & Bữa xế:</strong> {breakfastHours}
                </span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Award className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Chứng nhận VSATTP số: <strong>HN-2025/CT89</strong></span>
              </div>
            </div>

            {/* Operating Status Badge & Admin Quick Controls */}
            <div className="space-y-2 pt-2">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-xs transition-all ${
                    isOpen
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80 shadow-emerald-950/40'
                      : 'bg-rose-950/90 text-rose-300 border-rose-700/80 shadow-rose-950/40'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                    }`}
                  />
                  <span>{statusLabel}</span>
                </span>

                {/* Admin Quick Action Controls */}
                {isAdmin && (
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bg-elevated border border-border-base text-[11px]">
                    {onToggleOpenStatus && (
                      <button
                        type="button"
                        onClick={onToggleOpenStatus}
                        className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isOpen
                            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        }`}
                        title={isOpen ? 'Nhấn để tạm đóng cửa căng tin' : 'Nhấn để mở cửa căng tin'}
                      >
                        <Power className="w-3 h-3" />
                        <span>{isOpen ? 'Tạm đóng cửa' : 'Mở cửa ngay'}</span>
                      </button>
                    )}

                    {onOpenStatusSettings && (
                      <button
                        type="button"
                        onClick={onOpenStatusSettings}
                        className="px-2 py-0.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        title="Chỉnh sửa chi tiết giờ mở cửa và thông báo"
                      >
                        <Settings className="w-3 h-3 text-orange-400" />
                        <span>Chỉnh sửa</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Note when closed */}
              {!isOpen && statusConfig?.closedNote && (
                <p className="text-[11px] text-rose-300/90 italic bg-rose-950/30 border border-rose-900/40 p-2 rounded-xl leading-relaxed">
                  {statusConfig.closedNote}
                </p>
              )}
            </div>
          </div>

          {/* Col 2: Official Contact Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-text-primary border-l-2 border-[#E8B84B] pl-2.5">
              Thông Tin Liên Hệ & Vị Trí
            </h3>

            <div className="space-y-3 text-xs">
              
              {/* Address */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-card border border-border-base">
                <MapPin className="w-4 h-4 text-[#E8B84B] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-text-primary">Địa chỉ căng tin:</div>
                  <div className="text-text-secondary mt-0.5 font-medium leading-relaxed">
                    68 Nguyễn Chí Thanh, Láng Thượng, Đống Đa, Hà Nội
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    (Khuôn viên Canteen Tầng 1 - Cổng chính số 68)
                  </div>
                </div>
              </div>

              {/* Phone Hotline */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-card border border-border-base">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-text-primary">Hotline hỗ trợ & Đặt trước:</div>
                  <a 
                    href="tel:098456789" 
                    className="text-base font-extrabold text-[#E8B84B] hover:text-[#F4C95D] hover:underline inline-block mt-0.5 tracking-wide"
                  >
                    098456789
                  </a>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Hỗ trợ tiếp nhận đơn cơm đoàn, phản hồi chất lượng 24/7
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-card border border-border-base">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-text-primary">Email liên hệ:</div>
                  <a 
                    href="mailto:contact@canteengo.vn"
                    className="text-text-secondary hover:text-text-primary hover:underline mt-0.5 block font-mono"
                  >
                    contact@canteengo.vn
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Col 3: Interactive Google Map (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-text-primary border-l-2 border-[#E8B84B] pl-2.5">
                Bản Đồ Chỉ Đường
              </h3>
              <a
                href="https://www.google.com/maps/search/?api=1&query=68+Nguy%E1%BB%85n+Ch%C3%AD+Thanh,+H%C3%A0+N%E1%BB%99i"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-[#E8B84B] hover:text-[#F4C95D] flex items-center gap-1 hover:underline"
              >
                <span>Xem bản đồ lớn</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Embedded Google Map iframe */}
            <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-border-base shadow-md bg-bg-card">
              <iframe
                title="Bản đồ 68 Nguyễn Chí Thanh, Hà Nội"
                src="https://maps.google.com/maps?q=68+Nguy%E1%BB%85n+Ch%C3%AD+Thanh,+L%C3%A1ng+Th%C6%B0%E1%BB%A3ng,+%C4%90%E1%BB%91ng+%C4%90a,+H%C3%A0+N%E1%BB%99i&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full filter contrast-105"
              />

              {/* Map Floating Card Pin */}
              <div className="absolute bottom-2 left-2 right-2 bg-bg-card/90 backdrop-blur-xs p-2 rounded-xl border border-border-base flex items-center justify-between text-[11px] pointer-events-none">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#E8B84B] flex-shrink-0" />
                  <span className="font-semibold text-text-primary truncate">68 Nguyễn Chí Thanh, Hà Nội</span>
                </div>
                <span className="text-[10px] bg-[#E8B84B]/20 text-[#E8B84B] font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                  Canteen Tầng 1
                </span>
              </div>
            </div>

            <p className="text-[11px] text-text-muted italic">
              Vị trí thuận tiện đối diện Vincom Nguyễn Chí Thanh & gần các trường Đại học, có bãi đỗ xe máy miễn phí cho khách ăn tại chỗ.
            </p>
          </div>

        </div>

        {/* BOTTOM ROW: Quick Navigation Links & Copyright */}
        <div className="pt-6 border-t border-border-base flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div>
            © 2026 <strong className="text-text-secondary">CanteenGo System</strong>. 68 Nguyễn Chí Thanh, Đống Đa, Hà Nội. Hotline: <a href="tel:098456789" className="text-orange-400 font-semibold hover:underline">098456789</a>.
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => onNavigateTab('menu')} 
              className="hover:text-text-primary transition-colors"
            >
              Thực đơn
            </button>
            {isAdmin && (
              <button 
                onClick={() => onNavigateTab('database')} 
                className="hover:text-amber-400 text-amber-500 font-bold flex items-center gap-1 transition-colors"
              >
                <Database className="w-3 h-3" />
                <span>CSDL 8 Bảng (Admin)</span>
              </button>
            )}
            <a 
              href="tel:098456789" 
              className="hover:text-orange-400 text-orange-400 font-semibold"
            >
              Gọi hotline: 098456789
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
