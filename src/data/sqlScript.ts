export const SQL_SCHEMA_SCRIPT = `-- ==========================================================
-- CanteenGo Database Schema (MySQL 8.0 / MariaDB)
-- 8 Bảng tiêu chuẩn theo đặc tả kiến trúc MVC
-- ==========================================================

CREATE DATABASE IF NOT EXISTS canteengo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE canteengo_db;

-- 1. Bảng users (Người dùng & Phân quyền)
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- 3. Bảng menu_items (Món ăn, đồ uống)
CREATE TABLE IF NOT EXISTS menu_items (
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

-- 4. Bảng orders (Đơn hàng)
CREATE TABLE IF NOT EXISTS orders (
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

-- 5. Bảng order_items (Chi tiết món trong đơn hàng)
CREATE TABLE IF NOT EXISTS order_items (
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

-- 6. Bảng payments (Giao dịch thanh toán)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    method ENUM('COD', 'TRANSFER') NOT NULL,
    status ENUM('PENDING', 'PAID') DEFAULT 'PENDING',
    paid_at DATETIME NULL,
    amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Bảng order_logs (Nhật ký xử lý đơn hàng bởi Staff)
CREATE TABLE IF NOT EXISTS order_logs (
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

-- 8. Bảng vouchers (Mã giảm giá khuyến mãi)
CREATE TABLE IF NOT EXISTS vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_pct FLOAT NOT NULL,
    min_order DECIMAL(10, 2) DEFAULT 0,
    description VARCHAR(255) NULL,
    expired_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- Dữ liệu mẫu khởi tạo (Seed Data)
INSERT INTO categories (id, name, description, is_active) VALUES
(1, 'Món chính cơm', 'Cơm nóng hổi kèm đạm thơm ngon', 1),
(2, 'Món chay thanh tịnh', 'Thuần chay 100% giàu chất xơ và đạm thực vật', 1),
(3, 'Món phụ & Canh', 'Canh nóng và món xào ăn kèm', 1),
(4, 'Đồ uống & Trà', 'Nước ép thanh mát, trà thảo mộc ít đường', 1),
(5, 'Tráng miệng', 'Chè, sữa chua, hoa quả tráng miệng', 1);

INSERT INTO vouchers (code, discount_pct, min_order, description, expired_at, is_active) VALUES
('CANTEEN10', 10, 50000, 'Giảm 10% đơn từ 50k', '2026-12-31 23:59:59', 1),
('COMBOYEU', 15, 60000, 'Giảm 15% tối đa cho Combo trưa', '2026-12-31 23:59:59', 1),
('STUDENT20', 20, 80000, 'Ưu đãi sinh viên giảm 20%', '2026-12-31 23:59:59', 1);
`;
