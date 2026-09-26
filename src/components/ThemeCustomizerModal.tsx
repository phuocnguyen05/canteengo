import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Image as ImageIcon, 
  Sun, 
  Moon, 
  X, 
  Check, 
  RotateCcw,
  Sliders,
  Eye,
  Link as LinkIcon
} from 'lucide-react';
import { ThemeConfig } from '../types';
import { ThemeMode, applyTheme, getSavedTheme } from '../utils/theme';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeConfig: ThemeConfig;
  onUpdateTheme: (newConfig: ThemeConfig) => void;
  onResetTheme: () => void;
}

export const PRESET_WALLPAPERS = [
  {
    id: 'canteen1',
    name: 'Không gian Canteen hiện đại',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=70',
    thumb: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=70'
  },
  {
    id: 'kitchen2',
    name: 'Bếp Canteen Ấm Cúng',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=70',
    thumb: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=70'
  },
  {
    id: 'food3',
    name: 'Ẩm thực Tươi ngon',
    url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=70',
    thumb: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300&q=70'
  },
  {
    id: 'cafe4',
    name: 'Quầy Nước & Cà phê',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=70',
    thumb: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=70'
  },
  {
    id: 'dining5',
    name: 'Nhà hàng & Ánh đèn',
    url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=70',
    thumb: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=300&q=70'
  }
];

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  themeConfig,
  onUpdateTheme,
  onResetTheme,
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getSavedTheme());
  const [customInputUrl, setCustomInputUrl] = useState(themeConfig.bgCustomUrl || '');

  useEffect(() => {
    if (isOpen) {
      setThemeMode(getSavedTheme());
      setCustomInputUrl(themeConfig.bgCustomUrl || '');
    }
  }, [isOpen, themeConfig.bgCustomUrl]);

  useEffect(() => {
    // Preload preset wallpaper images for instant switching without lag
    PRESET_WALLPAPERS.forEach((wp) => {
      const img = new Image();
      img.src = wp.url;
    });
  }, []);

  if (!isOpen) return null;

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    applyTheme(mode);
    onUpdateTheme({
      ...themeConfig,
      mode,
    });
  };

  const handleResetDefault = () => {
    setThemeMode('dark');
    applyTheme('dark');
    try {
      localStorage.removeItem('themeMode');
      localStorage.removeItem('accentColor');
    } catch (e) {}
    onResetTheme();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-bg-card text-text-primary rounded-3xl shadow-2xl border border-border-base max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto transition-colors duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-border-base flex items-center justify-between bg-bg-elevated">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8B84B]/10 border border-[#E8B84B]/30 flex items-center justify-center text-[#E8B84B] shadow-inner">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-text-primary">Tùy Chỉnh Giao Diện & Hình Nền</h2>
              <p className="text-xs text-text-secondary">
                Thay đổi chế độ nền sáng/tối và ảnh nền cá nhân hóa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-bg-card text-text-primary">

          {/* 1. Theme Mode (Sáng Tinh Tế / Đêm Twilight) */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-[#E8B84B] flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#E8B84B]" />
              <span>Chế độ hiển thị màn hình</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-2xl text-left transition-all flex flex-col justify-between h-24 cursor-pointer ${
                  themeMode === 'light'
                    ? 'border-2 border-[#E8B84B] bg-[#E8B84B]/10 ring-2 ring-[#E8B84B]/20 shadow-sm'
                    : 'border border-border-base bg-bg-input hover:bg-bg-hover'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sun className="w-5 h-5 text-[#E8B84B]" />
                  {themeMode === 'light' && (
                    <span className="w-5 h-5 rounded-full bg-[#E8B84B] text-black flex items-center justify-center font-black">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-text-primary">☀️ Sáng Tinh Tế</div>
                  <div className="text-[11px] text-text-secondary">Nền trắng sạch sẽ</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-2xl text-left transition-all flex flex-col justify-between h-24 cursor-pointer ${
                  themeMode === 'dark'
                    ? 'border-2 border-[#E8B84B] bg-[#E8B84B]/10 ring-2 ring-[#E8B84B]/20 shadow-sm'
                    : 'border border-border-base bg-bg-input hover:bg-bg-hover'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Moon className="w-5 h-5 text-[#E8B84B]" />
                  {themeMode === 'dark' && (
                    <span className="w-5 h-5 rounded-full bg-[#E8B84B] text-black flex items-center justify-center font-black">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-text-primary">🌙 Đêm Twilight</div>
                  <div className="text-[11px] text-text-secondary">Giao diện tối huyền bí</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Wallpaper Background Image */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-[#E8B84B] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#E8B84B]" />
              <span>Hình nền ứng dụng (App Background Wallpaper)</span>
            </label>

            {/* Type tabs */}
            <div className="grid grid-cols-3 gap-2 bg-bg-input p-1 rounded-xl border border-border-base">
              <button
                type="button"
                onClick={() => onUpdateTheme({ ...themeConfig, bgType: 'none' })}
                className={`py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  themeConfig.bgType === 'none'
                    ? 'bg-bg-card text-text-primary shadow-xs border border-border-base'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Nền phẳng mặc định
              </button>
              <button
                type="button"
                onClick={() => onUpdateTheme({ ...themeConfig, bgType: 'preset', bgPresetUrl: themeConfig.bgPresetUrl || PRESET_WALLPAPERS[0].url })}
                className={`py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  themeConfig.bgType === 'preset'
                    ? 'bg-bg-card text-text-primary shadow-xs border border-border-base'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Kho ảnh Canteen
              </button>
              <button
                type="button"
                onClick={() => onUpdateTheme({ ...themeConfig, bgType: 'custom' })}
                className={`py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  themeConfig.bgType === 'custom'
                    ? 'bg-bg-card text-text-primary shadow-xs border border-border-base'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Tải ảnh tùy chỉnh
              </button>
            </div>

            {/* Preset selector */}
            {themeConfig.bgType === 'preset' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {PRESET_WALLPAPERS.map((wp) => {
                  const isSelected = themeConfig.bgPresetUrl === wp.url;
                  return (
                    <button
                      key={wp.id}
                      type="button"
                      onClick={() => onUpdateTheme({ ...themeConfig, bgPresetUrl: wp.url })}
                      className={`relative rounded-xl overflow-hidden border-2 text-left h-24 transition-all group cursor-pointer ${
                        isSelected ? 'border-[#E8B84B] ring-2 ring-[#E8B84B]/40' : 'border-border-base opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={wp.thumb} alt={wp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2 flex flex-col justify-end">
                        <span className="text-[10px] font-extrabold text-white leading-tight drop-shadow-xs">
                          {wp.name}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#E8B84B] rounded-full text-black flex items-center justify-center shadow-md font-black">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Custom URL input */}
            {themeConfig.bgType === 'custom' && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={customInputUrl}
                      onChange={(e) => {
                        setCustomInputUrl(e.target.value);
                        onUpdateTheme({ ...themeConfig, bgCustomUrl: e.target.value });
                      }}
                      placeholder="Dán đường dẫn ảnh nền (Link URL image https://...)"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border-base focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B] bg-bg-input text-text-primary placeholder:text-text-secondary"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-text-secondary">
                  Mẹo: Bạn có thể dán link hình ảnh bất kỳ từ Google, Unsplash hay Pinterest để làm ảnh nền cho Canteen.
                </p>
              </div>
            )}

            {/* Opacity & Blur sliders */}
            {themeConfig.bgType !== 'none' && (
              <div className="p-4 rounded-2xl bg-bg-input border border-border-base space-y-4 mt-3">
                <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-text-secondary" />
                    <span>Độ mờ đục ảnh nền (Opacity): {themeConfig.bgOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={themeConfig.bgOpacity}
                    onChange={(e) => onUpdateTheme({ ...themeConfig, bgOpacity: Number(e.target.value) })}
                    className="w-32 accent-[#E8B84B] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-text-secondary" />
                    <span>Độ làm mờ hậu cảnh (Blur): {themeConfig.bgBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    value={themeConfig.bgBlur}
                    onChange={(e) => onUpdateTheme({ ...themeConfig, bgBlur: Number(e.target.value) })}
                    className="w-32 accent-[#E8B84B] cursor-pointer"
                  />
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-base bg-bg-elevated flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-3.5 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-border-base font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#E8B84B] hover:bg-[#d4a338] text-black font-extrabold text-xs shadow-md shadow-[#E8B84B]/20 transition-all cursor-pointer"
          >
            Hoàn tất
          </button>
        </div>

      </div>
    </div>
  );
};
