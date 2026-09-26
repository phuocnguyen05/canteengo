import React, { useState, useMemo } from 'react';
import { 
  X, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Share2, 
  ShoppingBag, 
  Leaf, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { MenuItem, ComboSelection } from '../types';

interface ComboBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onAddComboToCart: (combo: {
    items: MenuItem[];
    name: string;
    totalPrice: number;
    totalCalories: number;
    discountedPrice: number;
  }) => void;
}

export const ComboBuilderModal: React.FC<ComboBuilderModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  onAddComboToCart,
}) => {
  const [activeSlot, setActiveSlot] = useState<'MAIN' | 'SIDE' | 'DRINK' | 'DESSERT'>('MAIN');
  const [selection, setSelection] = useState<ComboSelection>({});
  const [comboName, setComboName] = useState('Combo Năng Lượng Canteen');
  const [isVeganOnly, setIsVeganOnly] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Group items by slot type
  const availableMains = useMemo(() => menuItems.filter(i => i.slotType === 'MAIN' && (!isVeganOnly || i.isVegan)), [menuItems, isVeganOnly]);
  const availableSides = useMemo(() => menuItems.filter(i => i.slotType === 'SIDE' && (!isVeganOnly || i.isVegan)), [menuItems, isVeganOnly]);
  const availableDrinks = useMemo(() => menuItems.filter(i => i.slotType === 'DRINK' && (!isVeganOnly || i.isVegan)), [menuItems, isVeganOnly]);
  const availableDesserts = useMemo(() => menuItems.filter(i => i.slotType === 'DESSERT' && (!isVeganOnly || i.isVegan)), [menuItems, isVeganOnly]);

  const currentSlotItems = useMemo(() => {
    switch (activeSlot) {
      case 'MAIN': return availableMains;
      case 'SIDE': return availableSides;
      case 'DRINK': return availableDrinks;
      case 'DESSERT': return availableDesserts;
    }
  }, [activeSlot, availableMains, availableSides, availableDrinks, availableDesserts]);

  // Selected items array
  const selectedList = useMemo(() => {
    const list: MenuItem[] = [];
    if (selection.main) list.push(selection.main);
    if (selection.side) list.push(selection.side);
    if (selection.drink) list.push(selection.drink);
    if (selection.dessert) list.push(selection.dessert);
    return list;
  }, [selection]);

  // Total raw price & total calories (US14)
  const rawTotalPrice = useMemo(() => {
    return selectedList.reduce((sum, item) => sum + item.price, 0);
  }, [selectedList]);

  const totalCalories = useMemo(() => {
    return selectedList.reduce((sum, item) => sum + item.calories, 0);
  }, [selectedList]);

  // 10% Combo bundle discount
  const comboDiscount = Math.round(rawTotalPrice * 0.1);
  const finalComboPrice = rawTotalPrice - comboDiscount;

  // Calorie check alert (US14): > 1200 kcal warning
  const isHighCalorieWarning = totalCalories > 1200;

  // Vegan conflict check (US13)
  const hasVeganConflict = useMemo(() => {
    if (selectedList.length <= 1) return false;
    const hasVegan = selectedList.some(i => i.isVegan);
    const hasNonVegan = selectedList.some(i => !i.isVegan);
    return hasVegan && hasNonVegan;
  }, [selectedList]);

  // Check if complete 4 slots
  const isCompleteCombo = selection.main && selection.side && selection.drink && selection.dessert;

  const handleSelectItem = (item: MenuItem) => {
    if (item.stock <= 0) return;
    setSelection(prev => {
      const updated = { ...prev };
      switch (activeSlot) {
        case 'MAIN': updated.main = item; break;
        case 'SIDE': updated.side = item; break;
        case 'DRINK': updated.drink = item; break;
        case 'DESSERT': updated.dessert = item; break;
      }
      return updated;
    });

    // Auto advance to next empty slot
    if (activeSlot === 'MAIN' && !selection.side) setActiveSlot('SIDE');
    else if (activeSlot === 'SIDE' && !selection.drink) setActiveSlot('DRINK');
    else if (activeSlot === 'DRINK' && !selection.dessert) setActiveSlot('DESSERT');
  };

  const handleClearSelection = () => {
    setSelection({});
    setActiveSlot('MAIN');
  };

  const handleAddCombo = () => {
    if (selectedList.length === 0) return;
    onAddComboToCart({
      items: selectedList,
      name: comboName || 'Combo Tùy Chọn 4 Món',
      totalPrice: rawTotalPrice,
      totalCalories,
      discountedPrice: finalComboPrice,
    });
    onClose();
  };

  const handleCopyShareLink = () => {
    const summary = `CanteenGo Combo [${comboName}]: ${selectedList.map(i => i.name).join(' + ')} (${totalCalories} kcal, ${finalComboPrice.toLocaleString()}đ)`;
    navigator.clipboard.writeText(summary);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-bg-card w-full max-w-4xl rounded-3xl shadow-2xl border border-border-base overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border-base flex items-center justify-between bg-gradient-to-r from-bg-card via-bg-input to-bg-card">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#E8B84B] text-black flex items-center justify-center shadow-md font-bold">
              <Sparkles className="w-5 h-5 fill-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-text-primary font-serif">Tạo Combo Tùy Chỉnh</h2>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-[#E8B84B]/20 border border-[#E8B84B]/40 text-[#E8B84B]">
                  Tiết kiệm 10%
                </span>
              </div>
              <p className="text-xs text-text-secondary">Tự do chọn 4 khay món - Tự động cân bằng calo theo nhu cầu</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-input flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Top Bar: Combo Name & Vegan Switch (US13) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-input p-3.5 rounded-2xl border border-border-base">
            <div className="flex-1">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-1">
                Tên gói Combo của bạn
              </label>
              <input
                type="text"
                value={comboName}
                onChange={(e) => setComboName(e.target.value)}
                placeholder="Đặt tên cho combo (vd: Bữa trưa EatClean, Combo tăng cơ...)"
                className="w-full text-sm font-semibold bg-bg-primary text-text-primary px-3 py-1.5 rounded-xl border border-border-base focus:outline-none focus:border-[#E8B84B]"
              />
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <button
                onClick={() => setIsVeganOnly(!isVeganOnly)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isVeganOnly
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                    : 'bg-bg-primary border-border-base text-text-secondary hover:text-text-primary hover:bg-bg-card'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                <span>Chỉ hiển thị món Chay</span>
              </button>

              <button
                onClick={handleClearSelection}
                className="text-xs text-text-secondary hover:text-rose-400 flex items-center gap-1 px-2 py-1.5 cursor-pointer"
                title="Làm mới khay combo"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chọn lại từ đầu</span>
              </button>
            </div>
          </div>

          {/* 4 Trays / Slots (US12) */}
          <div>
            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Khay 4 Slot món ăn
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              
              {/* Slot 1: MAIN */}
              <button
                onClick={() => setActiveSlot('MAIN')}
                className={`p-3 rounded-2xl border-2 text-left transition-all relative cursor-pointer ${
                  activeSlot === 'MAIN'
                    ? 'border-[#E8B84B] bg-[#E8B84B]/10 shadow-xs'
                    : selection.main
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-dashed border-border-base hover:border-[#E8B84B]/50 bg-bg-input'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Slot 1</span>
                  {selection.main && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="font-bold text-xs text-text-primary">1. Món chính</div>
                {selection.main ? (
                  <div className="mt-1.5">
                    <p className="text-xs font-semibold text-[#E8B84B] truncate">{selection.main.name}</p>
                    <p className="text-[11px] text-text-secondary">{selection.main.price.toLocaleString()}đ • {selection.main.calories} kcal</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-text-secondary/60 mt-1">Chưa chọn món chính</p>
                )}
              </button>

              {/* Slot 2: SIDE */}
              <button
                onClick={() => setActiveSlot('SIDE')}
                className={`p-3 rounded-2xl border-2 text-left transition-all relative cursor-pointer ${
                  activeSlot === 'SIDE'
                    ? 'border-[#E8B84B] bg-[#E8B84B]/10 shadow-xs'
                    : selection.side
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-dashed border-border-base hover:border-[#E8B84B]/50 bg-bg-input'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Slot 2</span>
                  {selection.side && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="font-bold text-xs text-text-primary">2. Món phụ / Canh</div>
                {selection.side ? (
                  <div className="mt-1.5">
                    <p className="text-xs font-semibold text-[#E8B84B] truncate">{selection.side.name}</p>
                    <p className="text-[11px] text-text-secondary">{selection.side.price.toLocaleString()}đ • {selection.side.calories} kcal</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-text-secondary/60 mt-1">Chưa chọn món phụ</p>
                )}
              </button>

              {/* Slot 3: DRINK */}
              <button
                onClick={() => setActiveSlot('DRINK')}
                className={`p-3 rounded-2xl border-2 text-left transition-all relative cursor-pointer ${
                  activeSlot === 'DRINK'
                    ? 'border-[#E8B84B] bg-[#E8B84B]/10 shadow-xs'
                    : selection.drink
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-dashed border-border-base hover:border-[#E8B84B]/50 bg-bg-input'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Slot 3</span>
                  {selection.drink && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="font-bold text-xs text-text-primary">3. Đồ uống</div>
                {selection.drink ? (
                  <div className="mt-1.5">
                    <p className="text-xs font-semibold text-[#E8B84B] truncate">{selection.drink.name}</p>
                    <p className="text-[11px] text-text-secondary">{selection.drink.price.toLocaleString()}đ • {selection.drink.calories} kcal</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-text-secondary/60 mt-1">Chưa chọn đồ uống</p>
                )}
              </button>

              {/* Slot 4: DESSERT */}
              <button
                onClick={() => setActiveSlot('DESSERT')}
                className={`p-3 rounded-2xl border-2 text-left transition-all relative cursor-pointer ${
                  activeSlot === 'DESSERT'
                    ? 'border-[#E8B84B] bg-[#E8B84B]/10 shadow-xs'
                    : selection.dessert
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-dashed border-border-base hover:border-[#E8B84B]/50 bg-bg-input'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Slot 4</span>
                  {selection.dessert && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="font-bold text-xs text-text-primary">4. Tráng miệng</div>
                {selection.dessert ? (
                  <div className="mt-1.5">
                    <p className="text-xs font-semibold text-[#E8B84B] truncate">{selection.dessert.name}</p>
                    <p className="text-[11px] text-text-secondary">{selection.dessert.price.toLocaleString()}đ • {selection.dessert.calories} kcal</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-text-secondary/60 mt-1">Chưa chọn tráng miệng</p>
                )}
              </button>

            </div>
          </div>

          {/* Calorie & Conflict Warning Meters (US13, US14) */}
          <div className="bg-bg-input rounded-2xl p-4 border border-border-base space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-text-primary">
                <Flame className={`w-4 h-4 ${isHighCalorieWarning ? 'text-rose-400 animate-pulse' : 'text-[#E8B84B]'}`} />
                <span>Tổng Calo: <strong className={isHighCalorieWarning ? 'text-rose-400' : 'text-[#E8B84B]'}>{totalCalories} kcal</strong></span>
              </div>
              <span className="text-text-secondary">Mức đề xuất bữa trưa: 500 - 800 kcal</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-bg-primary h-2.5 rounded-full overflow-hidden border border-border-base">
              <div 
                className={`h-full transition-all duration-300 ${
                  totalCalories > 1200 ? 'bg-rose-500' : totalCalories > 800 ? 'bg-[#E8B84B]' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (totalCalories / 1400) * 100)}%` }}
              />
            </div>

            {/* Warning Message if > 1200 kcal */}
            {isHighCalorieWarning && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-2 text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <strong>Cảnh báo Calo cao ({totalCalories} kcal):</strong> Bữa ăn này đã vượt ngưỡng 1,200 kcal cho người trưởng thành. Bạn có thể thay món tráng miệng hoặc đồ uống ít đường để cân đối dinh dưỡng hơn!
                </div>
              </div>
            )}

            {/* Warning if Vegan Conflict */}
            {hasVeganConflict && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2 text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <strong>Lưu ý ăn chay:</strong> Bạn đang chọn kết hợp cả món mặn và món chay trong cùng một khay combo.
                </div>
              </div>
            )}
          </div>

          {/* Active Slot Item Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Chọn cho: <span className="text-[#E8B84B] font-serif font-bold">{activeSlot === 'MAIN' ? 'Món chính' : activeSlot === 'SIDE' ? 'Món phụ / Canh' : activeSlot === 'DRINK' ? 'Đồ uống' : 'Tráng miệng'}</span>
              </h3>
              <span className="text-xs text-text-secondary/70">Bấm vào món để đưa vào khay</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {currentSlotItems.map((item) => {
                const isSelected = 
                  (activeSlot === 'MAIN' && selection.main?.id === item.id) ||
                  (activeSlot === 'SIDE' && selection.side?.id === item.id) ||
                  (activeSlot === 'DRINK' && selection.drink?.id === item.id) ||
                  (activeSlot === 'DESSERT' && selection.dessert?.id === item.id);
                const isOutOfStock = item.stock <= 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => !isOutOfStock && handleSelectItem(item)}
                    className={`p-2.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#E8B84B] bg-[#E8B84B]/10 shadow-xs'
                        : isOutOfStock
                        ? 'border-border-base bg-bg-primary opacity-50 cursor-not-allowed'
                        : 'border-border-base bg-bg-input hover:border-[#E8B84B]/40 hover:bg-bg-elevated'
                    }`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover bg-bg-primary flex-shrink-0 border border-border-base"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-bold text-text-primary truncate">{item.name}</p>
                        {item.isVegan && <Leaf className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] text-text-secondary truncate">{item.ingredients}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-extrabold text-[#E8B84B]">{item.price.toLocaleString()}đ</span>
                        <span className="text-[10px] text-text-secondary">{item.calories} kcal</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#E8B84B] text-black flex items-center justify-center flex-shrink-0 font-bold">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer: Price breakdown & Action buttons */}
        <div className="p-4 sm:p-5 border-t border-border-base bg-bg-input flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-[#E8B84B] font-serif">
                  {finalComboPrice.toLocaleString('vi-VN')}₫
                </span>
                {comboDiscount > 0 && (
                  <span className="text-xs text-text-secondary line-through">
                    {rawTotalPrice.toLocaleString('vi-VN')}₫
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-400 font-semibold">
                Tiết kiệm {comboDiscount.toLocaleString('vi-VN')}đ (Giảm 10% gói combo)
              </p>
            </div>

            {/* Share Combo Button (US16) */}
            <button
              onClick={handleCopyShareLink}
              disabled={selectedList.length === 0}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-base bg-bg-primary text-text-secondary hover:text-text-primary hover:bg-bg-card text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              title="Sao chép tóm tắt combo để gửi bạn bè"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Đã chép link!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-text-secondary" />
                  <span>Chia sẻ</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border-base text-text-secondary hover:text-text-primary hover:bg-bg-card text-xs font-bold transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={handleAddCombo}
              disabled={selectedList.length === 0}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] disabled:bg-bg-elevated disabled:text-text-secondary text-black font-extrabold text-sm shadow-md shadow-[#E8B84B]/20 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Thêm vào giỏ ({selectedList.length}/4 món)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
