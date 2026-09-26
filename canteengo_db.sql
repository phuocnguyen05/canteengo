-- ==========================================================
-- CanteenGo Database Schema (MySQL 8.0 / MariaDB / XAMPP)
-- 8 Bảng chuẩn hóa theo đặc tả hệ thống căng tin CanteenGo
-- Địa chỉ: 68 Nguyễn Chí Thanh, Hà Nội - Hotline: 098456789
-- ==========================================================

CREATE DATABASE IF NOT EXISTS canteengo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE canteengo_db;

-- 1. Bảng users (Tài khoản & Phân quyền RBAC)
DROP TABLE IF EXISTS order_logs;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS vouchers;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('CUSTOMER', 'STAFF', 'ADMIN') DEFAULT 'CUSTOMER',
    area VARCHAR(150) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Bảng categories (Danh mục thực đơn)
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- 3. Bảng menu_items (Món ăn, thức uống, calo & định lượng)
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    calories FLOAT DEFAULT 0,
    is_vegan BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500) NULL,
    ingredients TEXT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 4. Bảng orders (Đơn đặt cơm Canteen)
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NULL,
    receiver_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    pickup_area VARCHAR(150) NOT NULL,
    pickup_time TIME NOT NULL,
    status ENUM('PENDING', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('COD', 'TRANSFER') DEFAULT 'COD',
    payment_status ENUM('PENDING', 'PAID') DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Bảng order_items (Chi tiết từng món trong khay ăn)
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NULL,
    item_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    note TEXT NULL,
    is_combo BOOLEAN DEFAULT FALSE,
    combo_details TEXT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Bảng payments (Lịch sử thanh toán & Quét mã QR)
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    method ENUM('COD', 'TRANSFER') NOT NULL,
    status ENUM('PENDING', 'PAID') DEFAULT 'PENDING',
    paid_at DATETIME NULL,
    amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Bảng order_logs (Nhật ký xử lý đơn của Bếp)
CREATE TABLE order_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    staff_id INT NULL,
    old_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    note TEXT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. Bảng vouchers (Mã khuyến mãi & giảm giá)
CREATE TABLE vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_pct FLOAT NOT NULL,
    min_order DECIMAL(10, 2) DEFAULT 0,
    description VARCHAR(255) NULL,
    expired_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- ==========================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- ==========================================================

-- Thêm tài khoản mẫu
INSERT INTO users (id, email, phone, password_hash, full_name, role, area) VALUES
(1, 'khachhang@canteengo.vn', '0912345678', 'password123', 'Nguyễn Văn An', 'CUSTOMER', 'Tòa A - Tầng 3 (Phòng 302)'),
(2, 'bepvien@canteengo.vn', '0923456789', 'password123', 'Trần Thị Mai', 'STAFF', 'Khu Bếp Chính Tầng 1'),
(3, 'quanly@canteengo.vn', '098456789', 'password123', 'Lê Hoàng Admin', 'ADMIN', 'Phòng Quản trị Canteen');

-- Thêm danh mục món
INSERT INTO categories (id, name, description, is_active) VALUES
(1, 'Món chính cơm', 'Cơm nóng hổi kèm đạm thơm ngon mỗi ngày', 1),
(2, 'Món chay thanh tịnh', 'Thuần chay 100% giàu chất xơ và đạm thực vật', 1),
(3, 'Món phụ & Canh', 'Canh nóng và món xào tươi xanh ăn kèm', 1),
(4, 'Đồ uống & Trà', 'Nước ép hoa quả, trà thảo mộc ít đường', 1),
(5, 'Tráng miệng', 'Chè, sữa chua, hoa quả tráng miệng', 1);

-- Thêm món ăn mẫu
INSERT INTO menu_items (id, category_id, name, price, stock, calories, is_vegan, image_url, is_available) VALUES
(1, 1, 'Cơm Sườn Cốt Lết Nướng Mật Ong', 38000, 35, 580, 0, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', 1),
(2, 1, 'Cơm Gà Xối Mỡ Da Giòn Thượng Hạng', 40000, 28, 620, 0, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80', 1),
(3, 1, 'Cơm Bò Xào Cần Tỏi Tiêu Đen', 45000, 20, 540, 0, 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&auto=format&fit=crop&q=80', 1),
(4, 2, 'Cơm Đậu Hũ Sốt Nấm Đông Cô (Chay)', 32000, 25, 410, 1, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80', 1),
(5, 3, 'Canh Chua Cá Hồi Dọc Mùng', 15000, 40, 120, 0, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80', 1),
(6, 3, 'Rau Cải Ngọt Luộc Chấm Trứng', 10000, 50, 65, 1, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', 1),
(7, 4, 'Trà Đào Cam Sả Tươi Mát', 18000, 45, 95, 1, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80', 1),
(8, 5, 'Sữa Chua Hy Lạp Trộn Hạt Ngũ Cốc', 16000, 30, 140, 1, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80', 1);

-- Thêm voucher mẫu
INSERT INTO vouchers (code, discount_pct, min_order, description, expired_at, is_active) VALUES
('CANTEEN10', 10, 50000, 'Giảm 10% cho đơn hàng từ 50.000đ', '2026-12-31 23:59:59', 1),
('COMBOYEU', 15, 60000, 'Giảm 15% tối đa khi phối combo 4 món', '2026-12-31 23:59:59', 1),
('STUDENT20', 20, 80000, 'Ưu đãi sinh viên giảm 20% đơn từ 80k', '2026-12-31 23:59:59', 1);
