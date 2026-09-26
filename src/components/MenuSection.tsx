import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Flame, 
  Leaf, 
  Plus, 
  AlertCircle, 
  Layers, 
  Sparkles, 
  SlidersHorizontal,
  Check,
  Star,
  MessageSquare,
  Heart,
  LayoutGrid,
  List
} from 'lucide-react';
import { Category, MenuItem, CartItem, ItemReview, ThemeColor } from '../types';
import { FlashSaleSection } from './FlashSaleSection';

interface MenuSectionProps {
  categories: Category[];
  menuItems: MenuItem[];
  cartItems?: CartItem[];
  reviews?: ItemReview[];
  themeColor?: ThemeColor;
  favoriteItemIds?: number[];
  onToggleFavorite?: (itemId: number) => void;
  onAddToCart: (item: MenuItem, quantity?: number, note?: string, isFlashSale?: boolean, flySource?: { x: number; y: number }) => boolean | void;
  onOpenComboModal: () => void;
  onViewItemDetail: (item: MenuItem, isFlashSale?: boolean) => void;
  onOpenReviews?: (item: MenuItem) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  categories,
  menuItems,
  cartItems = [],
  reviews = [],
  themeColor = 'orange',
  favoriteItemIds = [],
  onToggleFavorite,
  onAddToCart,
  onOpenComboModal,
  onViewItemDetail,
  onOpenReviews,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVegan, setOnlyVegan] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [calorieFilter, setCalorieFilter] = useState<'ALL' | 'LIGHT' | 'STANDARD'>('ALL');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'BEST_SELLER' | 'RATING_DESC' | 'PRICE_ASC' | 'PRICE_DESC' | 'CALORIES_ASC'>('POPULAR');
  const [justAddedId, setJustAddedId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Favorite filter
      if (onlyFavorites && !favoriteItemIds.includes(item.id)) {
        return false;
      }
      // Category filter
      if (selectedCategoryId !== null && item.categoryId !== selectedCategoryId) {
        return false;
      }
      // Vegan filter
      if (onlyVegan && !item.isVegan) {
        return false;
      }
      // Calorie filter
      if (calorieFilter === 'LIGHT' && item.calories > 350) {
        return false;
      }
      if (calorieFilter === 'STANDARD' && (item.calories < 350 || item.calories > 650)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesIngredients = item.ingredients.toLowerCase().includes(query);
        if (!matchesName && !matchesIngredients) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'BEST_SELLER') {
        const soldA = a.soldCount || (a.badge === 'Bán chạy nhất' ? 350 : (a.id * 37 + 50));
        const soldB = b.soldCount || (b.badge === 'Bán chạy nhất' ? 350 : (b.id * 37 + 50));
        return soldB - soldA;
      }
      if (sortBy === 'RATING_DESC') {
        const getAvgRating = (item: MenuItem) => {
          const itemRevs = reviews.filter((r) => r.itemId === item.id);
          if (itemRevs.length > 0) {
            return itemRevs.reduce((s, r) => s + r.rating, 0) / itemRevs.length;
          }
          return item.rating || 4.7;
        };
        return getAvgRating(b) - getAvgRating(a);
      }
      if (sortBy === 'PRICE_ASC') return a.price - b.price;
      if (sortBy === 'PRICE_DESC') return b.price - a.price;
      if (sortBy === 'CALORIES_ASC') return a.calories - b.calories;
      return 0; // POPULAR
    });
  }, [menuItems, selectedCategoryId, searchQuery, onlyVegan, onlyFavorites, favoriteItemIds, calorieFilter, sortBy, reviews]);

  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const flySource = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    const added = onAddToCart(item, 1, undefined, false, flySource);
    if (added !== false) {
      setJustAddedId(item.id);
      setTimeout(() => setJustAddedId(null), 1200);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* 2. BANNER MIX COMBO - Dark Luxury Style */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#E8B84B]/20 via-bg-card to-bg-primary border border-[#E8B84B]/40 text-text-primary shadow-2xl p-6 sm:p-9 transition-all duration-300">
        {/* Ambient background glows */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#E8B84B]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-bg-primary/50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-bg-input text-[11px] font-extrabold uppercase tracking-wider text-[#E8B84B] border border-[#E8B84B]/30 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#E8B84B] animate-pulse" />
              <span>C-Health • Chuẩn Dinh Dưỡng</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8B84B] text-black text-[11px] font-extrabold shadow-xs">
              Giảm 10% gói Combo
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight mb-2.5 text-[#E8B84B]">
            Tự Mix Combo Canteen Chuẩn Calo
          </h1>
          <p className="text-text-primary/90 text-xs sm:text-sm mb-5 max-w-xl leading-relaxed font-medium">
            Tự chọn 4 món theo sở thích: Món chính + Canh / Món phụ + Nước ép + Tráng miệng. Tự động kiểm soát calo khoa học, đảm bảo không vượt quá 1,200 kcal mỗi bữa.
          </p>

          {/* 4 Bước Mix Combo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mb-6 max-w-2xl">
            <div className="p-2.5 rounded-2xl bg-bg-input border border-border-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#E8B84B] text-black font-extrabold text-xs flex items-center justify-center">1</span>
              <div className="text-[11px] leading-tight">
                <span className="block font-bold text-text-primary">Món chính</span>
                <span className="text-[10px] text-text-secondary">Đậm đà, năng lượng</span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-bg-input border border-border-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#E8B84B] text-black font-extrabold text-xs flex items-center justify-center">2</span>
              <div className="text-[11px] leading-tight">
                <span className="block font-bold text-text-primary">Món phụ / Canh</span>
                <span className="text-[10px] text-text-secondary">Chất xơ, thanh mát</span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-bg-input border border-border-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#E8B84B] text-black font-extrabold text-xs flex items-center justify-center">3</span>
              <div className="text-[11px] leading-tight">
                <span className="block font-bold text-text-primary">Đồ uống</span>
                <span className="text-[10px] text-text-secondary">Trà, nước ép tươi</span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-bg-input border border-border-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#E8B84B] text-black font-extrabold text-xs flex items-center justify-center">4</span>
              <div className="text-[11px] leading-tight">
                <span className="block font-bold text-text-primary">Tráng miệng</span>
                <span className="text-[10px] text-text-secondary">Chè, sữa chua</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenComboModal}
              className="px-6 py-3 rounded-2xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold text-sm shadow-[0_0_20px_rgba(232,184,75,0.3)] transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer active:scale-95"
            >
              <Layers className="w-4 h-4 text-black" />
              <span>Bắt đầu tự Mix Combo ngay</span>
            </button>
            <div className="flex items-center gap-2 text-xs text-text-secondary font-semibold bg-bg-card px-3 py-2 rounded-xl border border-border-base">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trừ tồn kho tức thì & Cân bằng calo tự động</span>
            </div>
          </div>
        </div>

        {/* Background icon */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:flex items-center justify-center">
          <Layers className="w-96 h-96 text-[#E8B84B] -mr-16" />
        </div>
      </div>

      {/* 1. BANNER FLASH SALE SECTION */}
      <FlashSaleSection 
        menuItems={menuItems} 
        cartItems={cartItems} 
        onAddToCart={onAddToCart} 
        onViewItemDetail={onViewItemDetail} 
      />

      {/* 3. SECTION DANH MỤC & SEARCH & QUICK FILTERS */}
      <div className="bg-bg-card rounded-2xl border border-border-base p-4 sm:p-5 shadow-xl space-y-4">
        
        {/* Prominent Full-Width Search Box */}
        <div className="relative w-full">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-bg-input text-[#E8B84B] flex items-center justify-center pointer-events-none border border-border-base">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm món ăn, nguyên liệu, hương vị... (ví dụ: cơm sườn, bún chả, trà sữa, chay...)"
            className="w-full pl-14 pr-16 py-3.5 text-sm sm:text-base rounded-2xl border border-border-base bg-bg-primary focus:outline-none focus:border-[#E8B84B] focus:ring-4 focus:ring-[#E8B84B]/10 text-text-primary placeholder:text-text-secondary font-medium transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary hover:text-text-primary bg-bg-input hover:bg-bg-elevated px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-border-base"
            >
              Xóa tìm
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Favorites toggle */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3.5 py-2 rounded-xl border flex items-center gap-1.5 transition-all font-bold cursor-pointer ${
                onlyFavorites
                  ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 shadow-md ring-2 ring-rose-500/20'
                  : 'border-border-base text-text-secondary hover:bg-bg-input bg-bg-primary'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-rose-500 text-rose-500' : 'text-rose-500'}`} />
              <span>Yêu thích ({favoriteItemIds.length})</span>
            </button>

            {/* Vegan toggle */}
            <button
              onClick={() => setOnlyVegan(!onlyVegan)}
              className={`px-3.5 py-2 rounded-xl border flex items-center gap-1.5 transition-all font-bold cursor-pointer ${
                onlyVegan
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-border-base text-text-secondary hover:bg-bg-input bg-bg-primary'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ăn chay thuần (Vegan)</span>
            </button>

            {/* Calorie filter */}
            <select
              value={calorieFilter}
              onChange={(e) => setCalorieFilter(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl border border-border-base bg-bg-primary text-text-primary text-xs font-semibold focus:outline-none focus:border-[#E8B84B] cursor-pointer shadow-2xs"
            >
              <option value="ALL">🥗 Tất cả lượng Calo</option>
              <option value="LIGHT">🌿 Dưới 350 kcal (Ít calo)</option>
              <option value="STANDARD">⚡ 350 - 650 kcal (Chuẩn)</option>
            </select>

            {/* Sort by */}
            <div className="flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-text-secondary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3.5 py-2 rounded-xl border border-border-base bg-bg-primary text-text-primary text-xs font-semibold focus:outline-none focus:border-[#E8B84B] cursor-pointer shadow-2xs"
              >
                <option value="POPULAR">✨ Món nổi bật</option>
                <option value="BEST_SELLER">🔥 Bán chạy nhất</option>
                <option value="RATING_DESC">⭐ Đánh giá cao nhất</option>
                <option value="PRICE_ASC">💵 Giá tăng dần</option>
                <option value="PRICE_DESC">💰 Giá giảm dần</option>
                <option value="CALORIES_ASC">🌿 Calo thấp nhất</option>
              </select>
            </div>

          </div>
        </div>

        {/* Category Pill Tabs (Section Danh Mục) */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 text-xs no-scrollbar">
          <button
            onClick={() => {
              setSelectedCategoryId(null);
              setOnlyFavorites(false);
            }}
            className={`px-4 py-2 rounded-xl whitespace-nowrap font-extrabold transition-all cursor-pointer ${
              selectedCategoryId === null && !onlyFavorites && sortBy !== 'BEST_SELLER' && sortBy !== 'RATING_DESC'
                ? 'bg-[#E8B84B] text-black shadow-md ring-2 ring-[#E8B84B]/30'
                : 'bg-bg-input text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-border-base'
            }`}
          >
            Tất cả ({menuItems.length})
          </button>

          {/* Categories from DB */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategoryId(cat.id);
                setOnlyFavorites(false);
              }}
              className={`px-4 py-2 rounded-xl whitespace-nowrap font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategoryId === cat.id
                  ? 'bg-[#E8B84B] text-black shadow-md ring-2 ring-[#E8B84B]/30'
                  : 'bg-bg-input text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-border-base'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

      </div>

      {/* 4. MAIN DISHES LIST & CARD MÓN ĂN */}
      <div>
        <div className="bg-bg-card rounded-2xl border border-border-base p-4 shadow-sm mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-bg-input border border-[#E8B84B]/40 text-[#E8B84B] flex items-center justify-center shadow-md font-black text-sm flex-shrink-0 transition-colors`}>
              {onlyFavorites ? (
                <Heart className="w-5 h-5 text-rose-500 fill-current animate-pulse" />
              ) : (
                <Flame className="w-5 h-5 text-[#E8B84B] animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-black text-text-primary tracking-tight">
                  {onlyFavorites
                    ? 'Món Ăn Yêu Thích Của Bạn'
                    : selectedCategoryId !== null 
                    ? categories.find(c => c.id === selectedCategoryId)?.name 
                    : 'Tất cả món ăn hôm nay'}
                </h2>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#E8B84B]/20 text-[#E8B84B] border border-[#E8B84B]/40">
                  {filteredItems.length} món sẵn sàng
                </span>
              </div>
              <p className="text-xs font-medium text-text-secondary mt-0.5">
                {onlyFavorites
                  ? 'Danh sách các món bạn đã thả tim lưu lại'
                  : 'Thực đơn chế biến nóng hổi & kiểm soát dinh dưỡng'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Grid vs List */}
            <div className="flex items-center bg-bg-primary p-1 rounded-xl border border-border-base">
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'GRID'
                    ? 'bg-[#E8B84B] text-black shadow-xs font-extrabold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title="Hiển thị dạng thẻ ảnh lớn"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lưới</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'LIST'
                    ? 'bg-[#E8B84B] text-black shadow-xs font-extrabold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title="Hiển thị dạng danh sách gọn"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Danh sách</span>
              </button>
            </div>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-bg-card rounded-2xl border border-dashed border-border-base p-8">
            <AlertCircle className="w-10 h-10 text-text-secondary mx-auto mb-2" />
            <p className="text-sm font-semibold text-text-primary">Không tìm thấy món phù hợp</p>
            <p className="text-xs text-text-secondary mt-1">
              Thử tìm kiếm với từ khóa khác hoặc đặt lại các bộ lọc.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setOnlyVegan(false);
                setOnlyFavorites(false);
                setSelectedCategoryId(null);
                setCalorieFilter('ALL');
              }}
              className="mt-3 px-3 py-1.5 rounded-lg bg-[#E8B84B] text-black text-xs font-extrabold hover:bg-[#F4C95D] cursor-pointer"
            >
              Đặt lại tất cả bộ lọc
            </button>
          </div>
        ) : viewMode === 'GRID' ? (
          /* GRID VIEW - CARD MÓN ĂN DARK LUXURY */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const inCartItem = cartItems.find(ci => !ci.isCombo && ci.menuItem?.id === item.id && !ci.isFlashSale);
              const inCartQty = inCartItem ? inCartItem.quantity : 0;
              const isOutOfStock = item.stock <= 0;
              const isCartFull = !isOutOfStock && inCartQty >= item.stock;
              const isLowStock = !isOutOfStock && !isCartFull && item.stock > 0 && item.stock <= 5;
              const isFavorite = favoriteItemIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => onViewItemDetail(item)}
                  className="group bg-bg-card rounded-2xl border border-border-base hover:border-[#E8B84B] hover:shadow-[0_12px_30px_rgba(232,184,75,0.2)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer overflow-hidden"
                >
                  {/* Item Image */}
                  <div className="relative h-52 w-full bg-bg-input overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    />

                    {/* Gradient scrim at bottom for text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/30 to-transparent pointer-events-none" />

                    {/* Heart Favorite Button */}
                    {onToggleFavorite && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.id);
                        }}
                        className={`absolute top-3 right-3 z-20 w-8.5 h-8.5 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer ${
                          isFavorite 
                            ? 'bg-rose-600 text-white shadow-rose-600/50' 
                            : 'bg-bg-primary/80 backdrop-blur-md text-text-secondary hover:text-rose-500 hover:bg-rose-950/60'
                        }`}
                        title={isFavorite ? 'Bỏ khỏi danh sách yêu thích' : 'Thêm vào món ăn yêu thích'}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    )}

                    {/* Badges on image */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      {item.badge && (
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider ${
                          item.badge === 'Bán chạy nhất' 
                            ? 'bg-rose-900/90 text-rose-200 border border-rose-500/50' 
                            : 'bg-[#E8B84B] text-black font-extrabold'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {item.isVegan && (
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-emerald-900/90 text-emerald-200 border border-emerald-500/50 flex items-center gap-1 uppercase tracking-wider">
                          <Leaf className="w-3 h-3" />
                          <span>Chay Healthy</span>
                        </span>
                      )}
                    </div>

                    {/* Stock Alert badge */}
                    {isLowStock && (
                      <div className="absolute top-3 right-13 px-2.5 py-1 rounded-xl text-[10px] font-black bg-rose-600 text-white shadow-md flex items-center gap-1 z-10 animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        <span>SẮP HẾT: {item.stock}</span>
                      </div>
                    )}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-bg-primary/85 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <span className="px-4 py-2 rounded-xl text-xs font-extrabold bg-rose-900/90 text-rose-200 border border-rose-500/50 tracking-wider uppercase">
                          MÓN ĂN ĐÃ HẾT
                        </span>
                      </div>
                    )}

                    {/* Calorie pill */}
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-bg-primary/80 backdrop-blur-md text-text-secondary text-[11px] font-bold flex items-center gap-1 border border-border-base">
                      <Flame className="w-3.5 h-3.5 text-[#E8B84B]" />
                      <span>{item.calories} kcal</span>
                    </div>

                    {/* Slot Type indicator */}
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-[#E8B84B] text-black text-[10px] font-black uppercase tracking-wider">
                      {item.slotType === 'MAIN' ? 'Món chính' : item.slotType === 'SIDE' ? 'Canh / Phụ' : item.slotType === 'DRINK' ? 'Đồ uống' : 'Tráng miệng'}
                    </div>
                  </div>

                  {/* Item Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <h3 className="font-sans font-bold text-base text-text-primary line-clamp-1 group-hover:text-[#E8B84B] transition-colors flex-1">
                          {item.name}
                        </h3>
                        {(() => {
                          const itemRevs = reviews.filter((r) => r.itemId === item.id);
                          const avg = itemRevs.length > 0
                            ? (itemRevs.reduce((s, r) => s + r.rating, 0) / itemRevs.length).toFixed(1)
                            : (item.rating || 4.7).toFixed(1);

                          return (
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#E8B84B] bg-bg-input border border-border-base px-2 py-0.5 rounded-lg">
                                <Star className="w-3 h-3 fill-[#E8B84B] text-[#E8B84B]" />
                                <span>{avg}</span>
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-text-secondary font-medium line-clamp-2 mt-1.5 leading-relaxed">
                        {item.ingredients}
                      </p>

                      <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-text-secondary">
                        {onOpenReviews && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenReviews(item);
                            }}
                            className="hover:text-[#E8B84B] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3 text-[#E8B84B]" />
                            <span>
                              {reviews.filter((r) => r.itemId === item.id).length} đánh giá
                            </span>
                          </button>
                        )}
                        <span className="text-[10px] font-bold text-[#E8B84B] bg-bg-input border border-border-base px-2 py-0.5 rounded-lg">
                          🔥 Đã bán {item.soldCount || (item.badge === 'Bán chạy nhất' ? 350 : (item.id * 37 + 50))}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3.5 mt-3.5 border-t border-border-base flex items-center justify-between">
                      <div>
                        <div className="text-lg sm:text-xl font-extrabold text-[#E8B84B] leading-tight font-mono tracking-tight">
                          {item.price.toLocaleString('vi-VN')}₫
                        </div>
                        <div className="text-[11px] text-text-secondary font-medium mt-0.5">
                          {item.stock <= 0 ? (
                            <span className="font-extrabold text-rose-400">Hết suất hôm nay</span>
                          ) : (
                            <>
                              Còn lại: <span className="font-extrabold text-text-primary">{item.stock}</span>
                              {inCartQty > 0 && (
                                <span className="text-[#E8B84B] ml-1 font-bold">(đã chọn: {inCartQty})</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Quick Add Button */}
                      <button
                        onClick={(e) => {
                          handleQuickAdd(item, e);
                        }}
                        disabled={isOutOfStock || isCartFull}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer ${
                          isOutOfStock || isCartFull
                            ? 'bg-bg-input text-text-secondary/40 cursor-not-allowed border border-border-base'
                            : justAddedId === item.id
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-[#E8B84B] hover:bg-[#F4C95D] text-black shadow-md shadow-[#E8B84B]/20'
                        }`}
                        title={isOutOfStock ? 'Món ăn đã hết' : isCartFull ? 'Món ăn đã hết' : 'Thêm món vào giỏ'}
                      >
                        {isOutOfStock ? (
                          <span>Đã hết</span>
                        ) : isCartFull ? (
                          <span>Đã đủ</span>
                        ) : justAddedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Đã thêm</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Thêm món</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* COMPACT LIST VIEW */
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const inCartItem = cartItems.find(ci => !ci.isCombo && ci.menuItem?.id === item.id && !ci.isFlashSale);
              const inCartQty = inCartItem ? inCartItem.quantity : 0;
              const isOutOfStock = item.stock <= 0;
              const isCartFull = !isOutOfStock && inCartQty >= item.stock;
              const isFavorite = favoriteItemIds.includes(item.id);
              const itemRevs = reviews.filter((r) => r.itemId === item.id);
              const avg = itemRevs.length > 0
                ? (itemRevs.reduce((s, r) => s + r.rating, 0) / itemRevs.length).toFixed(1)
                : (item.rating || 4.7).toFixed(1);

              return (
                <div
                  key={item.id}
                  onClick={() => onViewItemDetail(item)}
                  className="group bg-bg-card rounded-2xl border border-border-base hover:border-[#E8B84B] p-3.5 sm:p-4 transition-all duration-200 flex items-center gap-3.5 sm:gap-5 cursor-pointer"
                >
                  <div className="relative w-22 h-22 sm:w-26 sm:h-26 rounded-xl bg-bg-input overflow-hidden shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                    />
                    {item.badge && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-[#E8B84B] text-black font-extrabold text-[9px] uppercase">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-sans font-bold text-sm sm:text-base text-text-primary group-hover:text-[#E8B84B] transition-colors truncate">
                        {item.name}
                      </h3>
                      <span className="flex items-center gap-0.5 text-[11px] font-extrabold text-[#E8B84B] bg-bg-input border border-border-base px-1.5 py-0.2 rounded-md">
                        <Star className="w-3 h-3 fill-[#E8B84B] text-[#E8B84B]" />
                        <span>{avg}</span>
                      </span>
                      <span className="text-[11px] font-bold text-text-secondary font-mono">
                        🔥 {item.calories} kcal
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-1 mt-1 font-medium">
                      {item.ingredients}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px]">
                      <span className="font-bold text-text-secondary">
                        {isOutOfStock ? (
                          <span className="text-rose-400 font-extrabold uppercase">Hết món</span>
                        ) : (
                          <span>Còn lại: <strong className="text-text-primary">{item.stock}</strong></span>
                        )}
                      </span>
                      {inCartQty > 0 && (
                        <span className="text-[#E8B84B] font-bold bg-bg-input px-2 py-0.5 rounded-lg border border-border-base">
                          Đã chọn: {inCartQty}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
                    <div className="text-right">
                      <div className="text-base sm:text-xl font-extrabold text-[#E8B84B] font-mono tracking-tight">
                        {item.price.toLocaleString('vi-VN')}₫
                      </div>
                    </div>

                    {onToggleFavorite && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.id);
                        }}
                        className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isFavorite
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                            : 'bg-bg-input text-text-secondary hover:text-rose-500 border border-border-base'
                        }`}
                        title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích món này'}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleQuickAdd(item, e)}
                      disabled={isOutOfStock || isCartFull}
                      className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer ${
                        isOutOfStock || isCartFull
                          ? 'bg-bg-input text-text-secondary/40 cursor-not-allowed border border-border-base'
                          : justAddedId === item.id
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-[#E8B84B] hover:bg-[#F4C95D] text-black shadow-md'
                      }`}
                    >
                      {isOutOfStock ? (
                        <span>Hết</span>
                      ) : isCartFull ? (
                        <span>Đủ {item.stock}</span>
                      ) : justAddedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Đã thêm</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Thêm</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
