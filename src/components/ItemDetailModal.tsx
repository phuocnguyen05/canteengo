import React, { useState } from 'react';
import { 
  X, 
  Flame, 
  Leaf, 
  ShoppingBag, 
  Plus, 
  Minus, 
  AlertCircle,
  Clock,
  Sparkles,
  Check,
  Star,
  MessageSquare,
  Heart,
  Zap
} from 'lucide-react';
import { MenuItem, ItemReview, CartItem } from '../types';

interface ItemDetailModalProps {
  item: MenuItem | null;
  isFlashSale?: boolean;
  cartItems?: CartItem[];
  reviews?: ItemReview[];
  favoriteItemIds?: number[];
  onToggleFavorite?: (itemId: number) => void;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, note?: string, isFlashSale?: boolean) => boolean | void;
  onOpenReviews?: (item: MenuItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isFlashSale = false,
  cartItems = [],
  reviews = [],
  favoriteItemIds = [],
  onToggleFavorite,
  onClose,
  onAddToCart,
  onOpenReviews,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset note and state whenever the selected item changes
  React.useEffect(() => {
    if (item) {
      setQuantity(1);
      setNote('');
      setAdded(false);
      setErrorMsg(null);
    }
  }, [item?.id]);

  const handleClose = () => {
    setNote('');
    setErrorMsg(null);
    setQuantity(1);
    onClose();
  };

  if (!item) return null;

  const totalFlash = item.flashSaleTotalQty ?? 20;
  const soldFlash = item.flashSaleSoldCount ?? 0;
  const remainingFlash = Math.max(0, totalFlash - soldFlash);
  const currentInCart = isFlashSale 
    ? (cartItems.find(ci => !ci.isCombo && ci.menuItem?.id === item.id && ci.isFlashSale)?.quantity || 0)
    : (cartItems.find(ci => !ci.isCombo && ci.menuItem?.id === item.id && !ci.isFlashSale)?.quantity || 0);

  const availableStock = isFlashSale ? remainingFlash : item.stock;
  const isOutOfStock = isFlashSale 
    ? (remainingFlash <= 0 || item.stock <= 0)
    : (item.stock <= 0);
  const isLowStock = !isFlashSale && item.stock > 0 && item.stock <= 5;
  const isFavorite = favoriteItemIds.includes(item.id);

  const displayPrice = isFlashSale ? (item.flashPrice || item.price) : item.price;

  const handleIncrease = () => {
    setErrorMsg(null);
    if (isFlashSale) {
      if (quantity + currentInCart >= remainingFlash) {
        setErrorMsg('Số lượng món giảm giá không đủ');
        return;
      }
    } else {
      if (quantity + currentInCart >= item.stock) {
        setErrorMsg('Món ăn đã hết');
        return;
      }
    }
    setQuantity(q => q + 1);
  };

  const handleDecrease = () => {
    setErrorMsg(null);
    setQuantity(q => Math.max(1, q - 1));
  };

  const handleAdd = () => {
    if (isOutOfStock) {
      setErrorMsg(isFlashSale ? 'Số lượng món giảm giá không đủ' : 'Món ăn đã hết');
      return;
    }

    if (isFlashSale && quantity + currentInCart > remainingFlash) {
      setErrorMsg('Số lượng món giảm giá không đủ');
      return;
    }

    if (!isFlashSale && quantity + currentInCart > item.stock) {
      setErrorMsg('Món ăn đã hết');
      return;
    }

    const success = onAddToCart(item, quantity, note.trim() || undefined, isFlashSale);
    if (success === false) {
      setErrorMsg(isFlashSale ? 'Số lượng món giảm giá không đủ' : 'Món ăn đã hết');
      return;
    }

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setNote('');
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border-base overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Image Banner */}
        <div className="relative h-60 w-full bg-bg-primary">
          <img
            src={item.imageUrl}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />

          <div className="absolute top-3 right-3 flex items-center gap-2">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(item.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                  isFavorite 
                    ? 'bg-rose-600 text-white shadow-rose-600/40 ring-2 ring-white/80' 
                    : 'bg-bg-primary/80 hover:bg-bg-primary text-white'
                }`}
                title={isFavorite ? 'Bỏ khỏi danh sách yêu thích' : 'Thêm vào món ăn yêu thích'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-bg-primary/80 hover:bg-bg-primary text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-bg-primary/80 backdrop-blur-xs text-[#E8B84B] border border-[#E8B84B]/30 text-xs font-semibold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#E8B84B]" />
              <span>{item.calories} kcal</span>
            </div>
            {item.isVegan && (
              <div className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5" />
                <span>Món thuần chay</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Info */}
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-text-primary font-serif leading-snug">{item.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xl font-extrabold text-[#E8B84B]">
                  {displayPrice.toLocaleString('vi-VN')}₫
                </span>
                {isFlashSale && item.flashPrice && (
                  <span className="text-xs text-text-secondary line-through font-semibold">
                    {item.price.toLocaleString('vi-VN')}₫
                  </span>
                )}
                {isFlashSale && (
                  <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-500/40 font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
                    <Zap className="w-3 h-3 fill-red-400" /> Flash Sale
                  </span>
                )}
                <span className="text-border-base">•</span>
                <span className="text-xs text-text-secondary">
                  {isFlashSale ? (
                    <span>Đã bán: <strong className="text-red-400">{soldFlash}/{totalFlash}</strong> (Còn <strong className="text-[#E8B84B]">{remainingFlash} suất</strong>)</span>
                  ) : (
                    <span>Còn lại trong bếp: <strong className="text-text-primary">{item.stock} suất</strong></span>
                  )}
                </span>
              </div>

              {errorMsg && (
                <div className="mt-2 text-xs text-red-400 bg-red-950/50 border border-red-500/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Reviews preview in item details */}
              {(() => {
                const itemRevs = reviews.filter((r) => r.itemId === item.id);
                const avg = itemRevs.length
                  ? (itemRevs.reduce((s, r) => s + r.rating, 0) / itemRevs.length).toFixed(1)
                  : null;

                return (
                  <div className="flex items-center gap-2 mt-2">
                    {avg ? (
                      <span className="flex items-center gap-1 font-bold text-[#E8B84B] text-xs bg-[#E8B84B]/10 border border-[#E8B84B]/20 px-2 py-0.5 rounded-md">
                        <Star className="w-3.5 h-3.5 fill-[#E8B84B] text-[#E8B84B]" />
                        <span>{avg} / 5 ({itemRevs.length} nhận xét)</span>
                      </span>
                    ) : (
                      <span className="text-xs text-text-secondary">Chưa có nhận xét</span>
                    )}

                    {onOpenReviews && (
                      <button
                        type="button"
                        onClick={() => onOpenReviews(item)}
                        className="text-xs font-semibold text-[#E8B84B] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Đánh giá / Viết nhận xét</span>
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>

            {isLowStock && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
                Sắp hết
              </span>
            )}
          </div>

          <div className="bg-bg-input p-3 rounded-xl border border-border-base space-y-1 text-xs">
            <span className="font-bold text-[#E8B84B] block">Thành phần & Nguyên liệu:</span>
            <p className="text-text-secondary leading-relaxed">{item.ingredients}</p>
          </div>

          {/* Custom Note for Chef */}
          <div>
            <label className="text-xs font-bold text-text-secondary block mb-1">
              Ghi chú riêng cho đầu bếp:
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Không lấy hành, xin thêm nước sốt, ít cơm..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-border-base bg-bg-input text-text-primary focus:outline-none focus:border-[#E8B84B]"
            />
          </div>

          {/* Quantity & Add Action */}
          <div className="flex items-center justify-between pt-3 border-t border-border-base">
            <div className="flex items-center gap-2 bg-bg-primary rounded-xl p-1 border border-border-base">
              <button
                onClick={handleDecrease}
                className="w-7 h-7 rounded-lg bg-bg-input text-text-secondary hover:text-text-primary hover:bg-bg-elevated flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-extrabold text-[#E8B84B] w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="w-7 h-7 rounded-lg bg-bg-input text-text-secondary hover:text-text-primary hover:bg-bg-elevated flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              disabled={isOutOfStock}
              onClick={handleAdd}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-bg-elevated text-text-secondary cursor-not-allowed'
                  : added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#E8B84B] hover:bg-[#F4C95D] text-black shadow-[#E8B84B]/20'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã thêm vào giỏ!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Thêm • {(displayPrice * quantity).toLocaleString('vi-VN')}₫</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
