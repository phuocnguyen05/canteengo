import React, { useState } from 'react';
import { 
  Rocket, 
  CheckCircle2, 
  Circle, 
  Terminal, 
  ExternalLink, 
  Copy, 
  Check, 
  Laptop, 
  Globe, 
  Code2, 
  FolderDown, 
  Cloud, 
  ShieldCheck,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const DeploymentGuideView: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    vscode: false,
    nodejs: false,
    git: false,
    github: false,
    vercel: false,
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleCheck = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs w-fit text-xs font-semibold mb-3">
          <Rocket className="w-3.5 h-3.5 text-amber-300" />
          <span>Hướng dẫn thực hành từ A - Z</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Cài đặt VS Code & Triển khai web link <span className="text-amber-300 font-mono">.app</span> Miễn Phí
        </h1>
        <p className="text-white/90 text-sm max-w-2xl leading-relaxed">
          Giải đáp chi tiết: Những ứng dụng cần cài trên máy tính của bạn, cách mở code trong Visual Studio Code, và 3 bước đưa website lên Vercel / Cloud Run hoàn toàn miễn phí.
        </p>
      </div>

      {/* SECTION 1: CÁC ỨNG DỤNG CẦN CÀI TRÊN MÁY TÍNH */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
            1
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Danh sách ứng dụng cần cài trên máy tính của bạn
            </h2>
            <p className="text-xs text-slate-500">
              Bạn kiểm tra máy mình đã có chưa, nếu chưa có thì tải theo link dưới đây nhé:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          
          {/* Item 1: VS Code */}
          <div 
            onClick={() => toggleCheck('vscode')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              checkedItems.vscode 
                ? 'border-emerald-300 bg-emerald-50/30' 
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            {checkedItems.vscode ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900">Visual Studio Code (VS Code)</h3>
                <a 
                  href="https://code.visualstudio.com/" 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
                >
                  Tải về <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Trình soạn thảo mã nguồn nhẹ, mạnh mẽ và phổ biến nhất hiện nay.
              </p>
              <div className="mt-2 text-[10px] text-slate-600 bg-slate-100 p-1.5 rounded">
                <strong>Gợi ý extension:</strong> <em>Tailwind CSS IntelliSense</em>, <em>Prettier</em>, <em>ES7+ React snippets</em>.
              </div>
            </div>
          </div>

          {/* Item 2: Node.js */}
          <div 
            onClick={() => toggleCheck('nodejs')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              checkedItems.nodejs 
                ? 'border-emerald-300 bg-emerald-50/30' 
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            {checkedItems.nodejs ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900">Node.js (Bản LTS khuyên dùng)</h3>
                <a 
                  href="https://nodejs.org/" 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
                >
                  Tải về <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Môi trường chạy JavaScript/TypeScript trên máy tính để dùng lệnh <code>npm install</code> và chạy server phát triển.
              </p>
              <div className="mt-2 text-[10px] text-slate-600 bg-slate-100 p-1.5 rounded">
                Cài đặt phiên bản <strong>LTS (v20 hoặc v22)</strong> là tốt nhất.
              </div>
            </div>
          </div>

          {/* Item 3: Git */}
          <div 
            onClick={() => toggleCheck('git')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              checkedItems.git 
                ? 'border-emerald-300 bg-emerald-50/30' 
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            {checkedItems.git ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900">Git (Quản lý phiên bản)</h3>
                <a 
                  href="https://git-scm.com/downloads" 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
                >
                  Tải về <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Dùng để đồng bộ mã nguồn, tải dự án về máy và đẩy lên GitHub.
              </p>
            </div>
          </div>

          {/* Item 4: Tài khoản GitHub & Vercel */}
          <div 
            onClick={() => toggleCheck('vercel')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              checkedItems.vercel 
                ? 'border-emerald-300 bg-emerald-50/30' 
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            {checkedItems.vercel ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900">Tài khoản Vercel & GitHub</h3>
                <a 
                  href="https://vercel.com/signup" 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
                >
                  Đăng ký Free <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Miễn phí 100%, cho phép bạn sở hữu ngay website có đuôi <strong>.vercel.app</strong> với chứng chỉ bảo mật HTTPS.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: CÁCH MỞ CODE TRÊN VSCODE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
            2
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Cách tải mã nguồn và mở trong VS Code
            </h2>
            <p className="text-xs text-slate-500">Chỉ 3 lệnh đơn giản trong Terminal để chạy thử trên máy tính của bạn</p>
          </div>
        </div>

        <div className="space-y-3 pt-1 text-xs">
          
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">A</span>
              <span>Bước 1: Tải mã nguồn về máy tính</span>
            </div>
            <p className="text-slate-600 pl-7">
              Tại giao diện Google AI Studio đang mở, bạn nhìn lên góc trên bên phải, bấm vào <strong>Menu Settings / Export</strong> chọn <strong>Download ZIP</strong> hoặc <strong>Push to GitHub</strong>.
              Sau đó giải nén thư mục ra màn hình máy tính (ví dụ thư mục tên là <code>canteengo</code>).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">B</span>
              <span>Bước 2: Mở thư mục trong VS Code</span>
            </div>
            <p className="text-slate-600 pl-7">
              Mở <strong>VS Code</strong> → Chọn <strong>File</strong> → <strong>Open Folder...</strong> → Chọn thư mục <code>canteengo</code> bạn vừa giải nén.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">C</span>
              <span>Bước 3: Mở Terminal và chạy lệnh</span>
            </div>
            <p className="text-slate-600 pl-7 mb-2">
              Bấm tổ hợp phím <code>Ctrl + `</code> (hoặc vào menu <strong>Terminal → New Terminal</strong>) và dán các lệnh sau:
            </p>

            <div className="pl-7 space-y-2">
              <div className="relative bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px]">
                <div className="text-slate-400"># 1. Cài đặt các thư viện cần thiết</div>
                <div>npm install</div>
                <button
                  onClick={() => handleCopy('npm install', 'install')}
                  className="absolute right-2 top-2 text-xs text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                  title="Sao chép"
                >
                  {copiedKey === 'install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="relative bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px]">
                <div className="text-slate-400"># 2. Khởi động server xem website chạy trực tiếp</div>
                <div>npm run dev</div>
                <button
                  onClick={() => handleCopy('npm run dev', 'dev')}
                  className="absolute right-2 top-2 text-xs text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                  title="Sao chép"
                >
                  {copiedKey === 'dev' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-slate-500 text-[11px]">
                Mở trình duyệt gõ: <strong>http://localhost:3000</strong> để xem web! Khi bạn sửa code trong VS Code, trang web sẽ tự động cập nhật.
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* SECTION 3: CÁCH TRIỂN KHAI LINK .APP HOÀN TOÀN FREE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
            3
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Các cách lấy link web đuôi <span className="font-mono text-purple-600">.app</span> Miễn Phí
            </h2>
            <p className="text-xs text-slate-500">
              Có 3 nền tảng miễn phí tốt nhất để ai cũng có thể vào web của bạn bằng điện thoại hoặc máy tính:
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          
          {/* Option 1: Vercel */}
          <div className="border border-purple-200 bg-purple-50/20 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Cách 1: Triển khai qua Vercel (Khuyên dùng nhất)</h3>
              </div>
              <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                Miễn phí trọn đời
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Vercel tự động cấp cho bạn tên miền con dạng: <code>https://canteengo.vercel.app</code>
            </p>

            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] space-y-1.5 relative">
              <div className="text-slate-400"># Cách nhanh nhất: Dùng lệnh Vercel CLI ngay trong terminal VS Code:</div>
              <div>npx vercel</div>
              <div className="text-slate-400"># Bấm Enter để chọn mặc định, Vercel sẽ tự build và trả về link web .app ngay lập tức!</div>
              <button
                onClick={() => handleCopy('npx vercel', 'vercel_cli')}
                className="absolute right-2 top-2 text-xs text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                title="Sao chép"
              >
                {copiedKey === 'vercel_cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Option 2: Google Cloud Run */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2.5 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Cách 2: Google Cloud Run (Có sẵn ngay tại đây!)</h3>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Đang trực tiếp
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ứng dụng CanteenGo bạn đang xem hiện tại <strong>đã được lưu trữ trực tiếp trên Google Cloud Run</strong> với đuôi miền <code>.run.app</code>!
            </p>
            <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
              Bạn có thể nhấn nút <strong>Deploy</strong> hoặc <strong>Share</strong> ở góc trên giao diện AI Studio để gửi link cho bạn bè, giáo viên hoặc đối tác xem ngay lập tức.
            </div>
          </div>

          {/* Option 3: Fly.io */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-700" />
                <h3 className="font-extrabold text-sm text-slate-900">Cách 3: Fly.io (Nếu muốn chạy Docker)</h3>
              </div>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                Miễn phí Free Tier
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Cài đặt <code>flyctl</code> và gõ <code>fly launch</code>, website của bạn sẽ nhận được địa chỉ <code>https://canteengo.fly.dev</code>.
            </p>
          </div>

        </div>
      </div>

      {/* SECTION 4: TÊN MIỀN RIÊNG .APP */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
        <div className="font-bold flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>Nếu bạn muốn tên miền đuôi chính xác là .app (Ví dụ: canteengo.app):</span>
        </div>
        <p className="leading-relaxed">
          Đuôi <code>.app</code> là miền cấp cao (TLD) do Google quản lý với tiêu chuẩn bảo mật bắt buộc HTTPS 100%. Bạn có thể mua tên miền này (khoảng 250k - 300k/năm) tại Namecheap, Google Domains hoặc Cloudflare, sau đó chỉ cần vào trang cài đặt của Vercel thêm vào mục <strong>Domains</strong> là website của bạn sẽ chạy trên tên miền riêng này!
        </p>
      </div>

    </div>
  );
};
