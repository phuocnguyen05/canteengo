import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  Download, 
  Table, 
  Key, 
  Link, 
  Code,
  Layers,
  FileText
} from 'lucide-react';
import { SQL_SCHEMA_SCRIPT } from '../data/sqlScript';

export const DatabaseSchemaView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'TABLES' | 'SQL'>('TABLES');

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSQL = () => {
    const blob = new Blob([SQL_SCHEMA_SCRIPT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'canteengo_db.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tables = [
    {
      name: 'users',
      desc: 'Tài khoản người dùng & phân quyền (Customer, Staff, Admin)',
      cols: [
        { name: 'id', type: 'INT', key: 'PK AI' },
        { name: 'email', type: 'VARCHAR(191)', key: 'UNIQUE' },
        { name: 'phone', type: 'VARCHAR(20)', key: '' },
        { name: 'password_hash', type: 'VARCHAR(255)', key: '' },
        { name: 'full_name', type: 'VARCHAR(100)', key: '' },
        { name: 'role', type: "ENUM('CUSTOMER', 'STAFF', 'ADMIN')", key: '' },
        { name: 'area', type: 'VARCHAR(150)', key: '' },
        { name: 'created_at', type: 'DATETIME', key: '' },
      ]
    },
    {
      name: 'categories',
      desc: 'Danh mục thực đơn (Cơm, Món chay, Canh, Nước ép...)',
      cols: [
        { name: 'id', type: 'INT', key: 'PK AI' },
        { name: 'name', type: 'VARCHAR(100)', key: '' },
        { name: 'description', type: 'TEXT', key: '' },
        { name: 'is_active', type: 'BOOLEAN', key: '' },
      ]
    },
    {
      name: 'menu_items',
      desc: 'Món ăn, nguyên liệu, calo, tồn kho, cờ món chay',
      cols: [
        { name: 'id', type: 'INT', key: 'PK AI' },
        { name: 'category_id', type: 'INT', key: 'FK' },
        { name: 'name', type: 'VARCHAR(150)', key: '' },
        { name: 'price', type: 'DECIMAL(10,2)', key: '' },
        { name: 'stock', type: 'INT', key: '' },
        { name: 'calories', type: 'FLOAT', key: '' },
        { name: 'is_vegan', type: 'BOOLEAN', key: '' },
        { name: 'image_url', type: 'VARCHAR(500)', key: '' },
        { name: 'ingredients', type: 'TEXT', key: '' },
        { name: 'is_available', type: 'BOOLEAN', key: '' },
      ]
    },
    {
      name: 'orders',
      desc: 'Thông tin đơn hàng, khách nhận, khu vực & giờ lấy món',
      cols: [
        { name: 'id', type: 'INT', key: 'PK AI' },
        { name: 'order_code', type: 'VARCHAR(50)', key: 'UNIQUE' },
        { name: 'user_id', type: 'INT', key: 'FK' },
        { name: 'receiver_name', type: 'VARCHAR(100)', key: '' },
        { name: 'phone', type: 'VARCHAR(20)', key: '' },
        { name: 'pickup_area', type: 'VARCHAR(150)', key: '' },
        { name: 'pickup_time', type: 'TIME', key: '' },
        { name: 'status', type: "ENUM('PENDING','PROCESSING','READY','DELIVERED','CANCELLED')", key: '' },
        { name: 'total_amount', type: 'DECIMAL(10,2)', key: '' },
        { name: 'final_amount', type: 'DECIMAL(10,2)', key: '' },
        { name: 'payment_method', type: "ENUM('COD','TRANSFER')", key: '' },
      ]
    },
    {
      name: 'order_items',
      desc: 'Chi tiết từng món hoặc gói combo trong đơn',
      cols: [
        { name: 'id', type: 'INT', key: 'PK AI' },
        { name: 'order_id', type: 'INT', key: 'FK' },
        { name: 'item_id', type: 'INT', key: 'FK' },
        { name: 'item_name', type: 'VARCHAR(150)', key: '' },
        { name: 'quantity', type: 'INT', key: '' },
        { name: 'unit_price', type: 'DECIMAL(10,2)', key: '' },
        { name: 'note', type: 'TEXT', key: '' },
        { name: 'is_combo', type: 'BOOLEAN', key: '' },
        { name: 'combo_details', type: 'TEXT', key: '' },
      ]
    },
    {
      name: 'payments',
      desc: 'Lưu log giao dịch thanh toán COD hoặc Chuyển khoản QR',
      cols: [
        { name: 'id', type: 'INT', key: 'PK AI' },
        { name: 'order_id', type: 'INT', key: 'FK UNIQUE' },
        { name: 'method', type: "ENUM('COD','TRANSFER')", key: '' },
        { name: 'status', type: "ENUM('PENDING','PAID')", key: '' },
        { name: 'paid_at', type: 'DATETIME', key: '' },
        { name: 'amount', type: 'DECIMAL(10,2)', key: '' },
      ]
    },
    {
      name: 'order_logs',
      desc: 'Nhật ký chuyển trạng thái đơn hàng của nhân viên bếp',
      cols: [
        { name: 'id', type: 'INT', key: 'PK AI' },
        { name: 'order_id', type: 'INT', key: 'FK' },
        { name: 'staff_id', type: 'INT', key: 'FK' },
        { name: 'old_status', type: 'VARCHAR(50)', key: '' },
        { name: 'new_status', type: 'VARCHAR(50)', key: '' },
        { name: 'note', type: 'TEXT', key: '' },
        { name: 'changed_at', type: 'DATETIME', key: '' },
      ]
    },
    {
      name: 'vouchers',
      desc: 'Mã giảm giá khuyến mãi (CANTEEN10, COMBOYEU...)',
      cols: [
        { name: 'id', type: 'INT', key: 'PK AI' },
        { name: 'code', type: 'VARCHAR(50)', key: 'UNIQUE' },
        { name: 'discount_pct', type: 'FLOAT', key: '' },
        { name: 'min_order', type: 'DECIMAL(10,2)', key: '' },
        { name: 'description', type: 'VARCHAR(255)', key: '' },
        { name: 'expired_at', type: 'DATETIME', key: '' },
        { name: 'is_active', type: 'BOOLEAN', key: '' },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Cơ Sở Dữ Liệu CanteenGo (8 Bảng)</h1>
            <p className="text-xs text-slate-500">Mô hình dữ liệu quan hệ chuẩn hóa MySQL 8.0 / PostgreSQL theo kiến trúc MVC</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySQL}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép SQL!' : 'Sao chép db.sql'}</span>
          </button>

          <button
            onClick={handleDownloadSQL}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file .sql</span>
          </button>
        </div>
      </div>

      {/* Switch Mode - High Contrast Card Container */}
      <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('TABLES')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'TABLES'
              ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20'
              : 'bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-950 border border-slate-300/80'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Sơ đồ 8 bảng CSDL (ERD View)</span>
        </button>
        <button
          onClick={() => setActiveTab('SQL')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'SQL'
              ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20'
              : 'bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-950 border border-slate-300/80'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-500" />
          <span>Mã nguồn SQL Script đầy đủ (db.sql)</span>
        </button>
      </div>

      {/* TAB 1: 8 Tables Grid */}
      {activeTab === 'TABLES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tables.map((table, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col"
            >
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-orange-500" />
                  <span className="font-mono text-xs font-bold text-slate-800">{table.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{table.cols.length} cột</span>
              </div>

              <div className="px-3 py-1.5 bg-slate-100/50 text-[10px] text-slate-500 line-clamp-1 border-b border-slate-200/60">
                {table.desc}
              </div>

              <div className="p-2 space-y-1 divide-y divide-slate-100 flex-1 text-[11px]">
                {table.cols.map((col, cidx) => (
                  <div key={cidx} className="pt-1 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 truncate">
                      {col.key.includes('PK') && <Key className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />}
                      {col.key.includes('FK') && <Link className="w-2.5 h-2.5 text-blue-500 flex-shrink-0" />}
                      <span className={`font-mono ${col.key.includes('PK') ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                        {col.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="font-mono text-[9px] text-slate-400">{col.type}</span>
                      {col.key && (
                        <span className={`text-[9px] font-bold px-1 rounded ${
                          col.key.includes('PK') ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {col.key}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Raw SQL Script */}
      {activeTab === 'SQL' && (
        <div className="relative bg-slate-950 text-slate-200 rounded-2xl p-4 sm:p-5 font-mono text-xs overflow-x-auto shadow-lg border border-slate-800">
          <button
            onClick={handleCopySQL}
            className="absolute right-4 top-4 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-sans font-bold flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép tất cả'}</span>
          </button>
          <pre className="pt-4 leading-relaxed whitespace-pre-wrap">{SQL_SCHEMA_SCRIPT}</pre>
        </div>
      )}

    </div>
  );
};
