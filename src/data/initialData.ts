import { Category, MenuItem, User, Voucher, Order, ItemReview, AppNotification } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Món chính cơm', description: 'Cơm nóng hổi kèm đạm thơm ngon', isActive: true, icon: 'Bowl' },
  { id: 6, name: 'Bún, Miến, Phở, Mì', description: 'Đặc sản Bún, Miến, Phở, Mì nước & xào đậm vị nóng hổi', isActive: true, icon: 'Utensils' },
  { id: 2, name: 'Món chay thanh tịnh', description: 'Thuần chay 100% giàu chất xơ và đạm thực vật', isActive: true, icon: 'Leaf' },
  { id: 3, name: 'Món phụ & Canh', description: 'Canh nóng và món xào ăn kèm', isActive: true, icon: 'Soup' },
  { id: 4, name: 'Đồ uống & Trà', description: 'Nước ép thanh mát, trà thảo mộc ít đường', isActive: true, icon: 'CupSoda' },
  { id: 5, name: 'Tráng miệng', description: 'Chè, sữa chua, hoa quả tráng miệng', isActive: true, icon: 'IceCream' },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 1,
    categoryId: 1,
    name: 'Cơm Tấm Sườn Bì Chả',
    price: 38000,
    stock: 24,
    calories: 680,
    isVegan: false,
    imageUrl: 'https://i-giadinh.vnecdn.net/2024/03/07/7Honthinthnhphm1-1709800144-8583-1709800424.jpg',
    ingredients: 'Gạo tấm, sườn nướng mật ong, chả trứng, bì thính, mỡ hành',
    isAvailable: true,
    slotType: 'MAIN',
    badge: 'Bán chạy nhất',
    isFlashSale: true,
    flashPrice: 25000,
    flashSaleEndTime: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    flashSaleTotalQty: 25,
    flashSaleSoldCount: 18
  },
  {
    id: 2,
    categoryId: 1,
    name: 'Cơm Gà Xối Mỡ Da Giòn',
    price: 40000,
    stock: 18,
    calories: 620,
    isVegan: false,
    imageUrl: 'https://file.hstatic.net/200000700229/article/lam-com-ga-chien-xoi-mo-thumb_c8de2119a0f242d197d352a53e0114fd.jpg',
    ingredients: 'Đùi gà xối mỡ, cơm nghệ hạt tơi, dưa leo, cà chua, sốt tỏi ớt',
    isAvailable: true,
    slotType: 'MAIN',
    badge: 'Đầu bếp khuyên dùng',
    isFlashSale: true,
    flashPrice: 28000,
    flashSaleEndTime: new Date(Date.now() + 1.5 * 3600 * 1000).toISOString(),
    flashSaleTotalQty: 20,
    flashSaleSoldCount: 15
  },
  {
    id: 3,
    categoryId: 1,
    name: 'Cơm Bò Xào Hành Cần',
    price: 42000,
    stock: 12,
    calories: 540,
    isVegan: false,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuv1tltkIBQ3Cf3WWwl6pTtEs3VsBQrCFIqa23b6uIluWTrGUvvXf2K09w&s=10',
    ingredients: 'Thịt bò phi lê ướp tiêu đen, cần tây, hành tây, cơm trắng ST25',
    isAvailable: true,
    slotType: 'MAIN'
  },
  {
    id: 4,
    categoryId: 2,
    name: 'Cơm Nấm Đùi Gà Kho Tiêu (Chay)',
    price: 35000,
    stock: 15,
    calories: 380,
    isVegan: true,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_dcqonTKdiNsdBM1MsfD3xPYoMBz3flOoU0rF4RARRIv8FOhp4v-b8PY&s=10',
    ingredients: 'Nấm đùi gà hữu cơ, nấm đông cô, nước tương cao cấp, tiêu xanh',
    isAvailable: true,
    slotType: 'MAIN',
    badge: 'Chay Healthy'
  },
  {
    id: 5,
    categoryId: 2,
    name: 'Đậu Hũ Tứ Xuyên Nấm Rơm (Chay)',
    price: 32000,
    stock: 4, // low stock test!
    calories: 340,
    isVegan: true,
    imageUrl: 'https://tieccaocap.vn/wp-content/uploads/2025/03/Dau-hu-sot-cay-Tu-Xuyen-chay-2.jpg',
    ingredients: 'Đậu non đậu nành nguyên chất, nấm rơm, sốt cay ngọt dầu mè',
    isAvailable: true,
    slotType: 'MAIN',
    badge: 'Sắp hết'
  },
  {
    id: 6,
    categoryId: 3,
    name: 'Canh Chua Tôm Nấu Thơm',
    price: 15000,
    stock: 25,
    calories: 120,
    isVegan: false,
    imageUrl: 'https://dhfoods.com.vn/upload/Food-Recipe/Canh-Chua-Tom/Bia-Canh-Chua-Tom.webp',
    ingredients: 'Tôm nõn tươi, bạc hà, dứa thơm, đậu bắp, ngò om, me chua',
    isAvailable: true,
    slotType: 'SIDE'
  },
  {
    id: 7,
    categoryId: 3,
    name: 'Rau Cải Thìa Xào Tỏi',
    price: 12000,
    stock: 30,
    calories: 90,
    isVegan: true,
    imageUrl: 'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/cai_thia_xao_toi_8312bf4d26.jpg',
    ingredients: 'Cải thìa tươi xanh, tỏi phi thơm lừng, dầu hào thực vật',
    isAvailable: true,
    slotType: 'SIDE'
  },
  {
    id: 8,
    categoryId: 3,
    name: 'Canh Rong Biển Hạt Sen (Chay)',
    price: 15000,
    stock: 3, // low stock
    calories: 85,
    isVegan: true,
    imageUrl: 'https://bizweb.dktcdn.net/100/489/006/files/canh-rong-bien-chay-1.jpg?v=1702278253605',
    ingredients: 'Rong biển Wakame, hạt sen Huế hầm nhừ, nấm bào ngư',
    isAvailable: true,
    slotType: 'SIDE',
    badge: 'Sắp hết'
  },
  {
    id: 9,
    categoryId: 4,
    name: 'Trà Chanh Dây Mật Ong',
    price: 16000,
    stock: 40,
    calories: 110,
    isVegan: true,
    imageUrl: 'https://lypham.vn/wp-content/uploads/2024/10/chanh-day-mat-ong-truyen-thong.jpg',
    ingredients: 'Chanh dây tươi Đà Lạt, mật ong hoa nhãn, trà lài ủ lạnh',
    isAvailable: true,
    slotType: 'DRINK'
  },
  {
    id: 10,
    categoryId: 4,
    name: 'Trà Sữa Oolong Nướng',
    price: 22000,
    stock: 20,
    calories: 260,
    isVegan: false,
    imageUrl: 'https://horecavn.com/wp-content/uploads/2024/05/tra-sua-oolong-kem-trung-nuong_20240527104523.jpg',
    ingredients: 'Trà Oolong nướng than củi, sữa tươi thanh trùng, trân châu đen dẻo',
    isAvailable: true,
    slotType: 'DRINK'
  },
  {
    id: 11,
    categoryId: 4,
    name: 'Nước Ép Ổi Hồng Tươi',
    price: 20000,
    stock: 4,
    calories: 95,
    isVegan: true,
    imageUrl: 'https://goodheart.vn/wp-content/uploads/2024/05/mut-oi-hong-2.jpg',
    ingredients: 'Ổi hồng ép chậm nguyên chất 100%, không đường hóa học',
    isAvailable: true,
    slotType: 'DRINK'
  },
  {
    id: 12,
    categoryId: 5,
    name: 'Sữa Chua Nếp Cẩm Mộc Châu',
    price: 16000,
    stock: 22,
    calories: 140,
    isVegan: false,
    imageUrl: 'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://toplist.vn/images/800px/trang-trai-hoa-lan-moc-chau-1349528.jpg',
    ingredients: 'Sữa chua lên men tự nhiên, nếp cẩm dẻo thơm, nước cốt dừa',
    isAvailable: true,
    slotType: 'DESSERT'
  },
  {
    id: 13,
    categoryId: 5,
    name: 'Chè Hạt Sen Nhãn Nhục',
    price: 18000,
    stock: 14,
    calories: 165,
    isVegan: true,
    imageUrl: 'https://dayphache.edu.vn/wp-content/uploads/2016/05/che-hat-sen-nhan-nhuc.jpg',
    ingredients: 'Hạt sen bùi béo, long nhãn Hưng Yên, nấm tuyết giòn sần sật',
    isAvailable: true,
    slotType: 'DESSERT'
  },
  {
    id: 14,
    categoryId: 1,
    name: 'Cơm Ba Chỉ Bò Sốt Tiêu Đen',
    price: 45000,
    stock: 16,
    calories: 590,
    isVegan: false,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQneQa-YSOLcH0S35ucmfEcZyLP3rcx6TAVgZDRA81xdQ&s=10',
    ingredients: 'Ba chỉ bò Mỹ thái mỏng, sốt tiêu đen đậm đà, ớt băm, cơm gạo ST25',
    isAvailable: true,
    slotType: 'MAIN',
    badge: 'Đặc sản hot'
  },
  {
    id: 15,
    categoryId: 1,
    name: 'Cơm Gà Sốt Nấm Đông Cô',
    price: 42000,
    stock: 20,
    calories: 550,
    isVegan: false,
    imageUrl: 'https://cdn.eva.vn/upload/1-2020/images/2020-02-11/cach-lam-com-ga-nam-nhanh-gon-nhung-van-ngon-tuyet-dam-bao-an-mot-muon-an-hai-1-1581398796-215-width640height426.jpg',
    ingredients: 'Thịt đùi gà rút xương om nấm đông cô tươi, sốt hắc xì dầu thượng hạng, cơm dẻo',
    isAvailable: true,
    slotType: 'MAIN',
    badge: 'Món mới'
  },
  {
    id: 16,
    categoryId: 2,
    name: 'Cơm Cà Rí Nấm Hạt Sen (Chay)',
    price: 36000,
    stock: 14,
    calories: 410,
    isVegan: true,
    imageUrl: 'https://cdn.hstatic.net/files/200000700229/article/cach-nau-ca-ri-chay-1_dc08428724b047b4abf90384ec589250.jpg',
    ingredients: 'Khoai tây, cà rốt, nấm đùi gà, hạt sen, nước cốt dừa thơm béo, cơm nghệ',
    isAvailable: true,
    slotType: 'MAIN',
    badge: 'Chay Healthy'
  },
  {
    id: 17,
    categoryId: 3,
    name: 'Trứng Chiên Thịt Băm Nấm Mèo',
    price: 14000,
    stock: 22,
    calories: 180,
    isVegan: false,
    imageUrl: 'https://file.hstatic.net/200000700229/article/cach-lam-mon-trung-hap-thit-bam_eacf3191cf7b4183b72b95006f7eb117.jpeg',
    ingredients: 'Trứng gà ta, thịt nạc dăm băm nhỏ, nấm mèo giòn sần sật, hành lá',
    isAvailable: true,
    slotType: 'SIDE'
  },
  {
    id: 18,
    categoryId: 3,
    name: 'Canh Khổ Qua Nhồi Thịt',
    price: 16000,
    stock: 15,
    calories: 130,
    isVegan: false,
    imageUrl: 'https://cdn.tgdd.vn/Files/2019/01/03/1142366/bi-quyet-nau-canh-kho-qua-don-thit-khong-bao-gio-bi-dang-202107301211370247.jpg',
    ingredients: 'Khổ qua tươi, nhân thịt nạc vai dăm băm, nước dùng gà thanh ngọt',
    isAvailable: true,
    slotType: 'SIDE'
  },
  {
    id: 19,
    categoryId: 4,
    name: 'Nước Ép Dưa Hấu Bạc Hà',
    price: 18000,
    stock: 25,
    calories: 80,
    isVegan: true,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTz2UVH4Qbx4kDxRzbm4ccRiNDyzPfQErJZulHooEV3cUdFJJxOdjrAN9eq&s=10',
    ingredients: 'Dưa hấu đỏ nguyên chất ép tươi, lá bạc hà, đường phèn mát lạnh',
    isAvailable: true,
    slotType: 'DRINK'
  },
  {
    id: 20,
    categoryId: 5,
    name: 'Bánh Flan Trà Xanh Matcha',
    price: 15000,
    stock: 18,
    calories: 150,
    isVegan: false,
    imageUrl: 'https://www.huongnghiepaau.com/wp-content/uploads/2019/03/banh-flan-tra-xanh.jpg',
    ingredients: 'Trứng gà ta, sữa tươi nguyên kem, bột matcha Uji Nhật Bản, đắng nhẹ caramen',
    isAvailable: true,
    slotType: 'DESSERT'
  },
  {
    id: 21,
    categoryId: 6,
    name: 'Bún Chả Hà Nội Nướng Than',
    price: 42000,
    stock: 22,
    calories: 560,
    isVegan: false,
    imageUrl: 'https://obuncha.vn/storage/photos/10/518341374_1197709369037427_3480366926743519901_n.jpg',
    ingredients: 'Bún lá tươi, chả miếng & chả viên nướng than hoa, nước mắm đu đủ tỏi ớt, rau sống tươi',
    isAvailable: true,
    slotType: 'MAIN',
    badge: 'Bán chạy nhất'
  },
  {
    id: 22,
    categoryId: 6,
    name: 'Miến Xào Cua Măng Tây',
    price: 39000,
    stock: 16,
    calories: 430,
    isVegan: false,
    imageUrl: 'https://monngonmoingay.com/wp-content/uploads/2026/08/mien-xao-cua-thap-cam-rau-cu-3.png',
    ingredients: 'Miến riềng dẻo ngon, thịt cua tươi xé nhỏ, măng tây, nấm mèo, hành phi thơm lừng',
    isAvailable: true,
    slotType: 'MAIN',
    badge: 'Thanh nhẹ'
  },
  {
    id: 23,
    categoryId: 6,
    name: 'Phở Bò Tái Nạm Hàng Đồng',
    price: 45000,
    stock: 25,
    calories: 520,
    isVegan: false,
    imageUrl: 'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/cach_nau_pho_bo_nam_dinh_0_1d94be153c.png',
    ingredients: 'Bánh phở tươi, thăn bò tái, nạm gầu giòn, nước dùng hầm xương ống 12h, hành ngò',
    isAvailable: true,
    slotType: 'MAIN',
    badge: 'Đặc sản Phở'
  },
  {
    id: 24,
    categoryId: 6,
    name: 'Mì Quảng Tôm Thịt Trứng Cút',
    price: 40000,
    stock: 18,
    calories: 490,
    isVegan: false,
    imageUrl: 'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2023_12_14_638381508655965296_cach-nau-mi-quang-tom-thit-13.jpg',
    ingredients: 'Sợi mì Quảng nghệ vàng dẻo, tôm sú rim đậm đà, thịt heo quay, trứng cút, bánh đa nướng',
    isAvailable: true,
    slotType: 'MAIN',
    badge: 'Đặc sản Miền Trung'
  }
];

export const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 1,
    code: 'CANTEEN10',
    discountPct: 10,
    minOrder: 50000,
    description: 'Giảm 10% cho đơn từ 50k (Áp dụng cả ngày)',
    expiredAt: '2026-12-31',
    isActive: true,
    timeRestricted: false
  },
  {
    id: 2,
    code: 'COMBOYEU',
    discountPct: 15,
    minOrder: 60000,
    description: 'Giảm 15% tối đa cho Combo trưa (Chỉ áp dụng từ 10:30 đến 13:30)',
    expiredAt: '2026-12-31',
    isActive: true,
    timeRestricted: true,
    validFromTime: '10:30',
    validToTime: '13:30'
  },
  {
    id: 3,
    code: 'SANGSOM15',
    discountPct: 15,
    minOrder: 30000,
    description: 'Ưu đãi ăn sáng bổ dưỡng (Chỉ áp dụng khung giờ 06:30 - 09:00)',
    expiredAt: '2026-12-31',
    isActive: true,
    timeRestricted: true,
    validFromTime: '06:30',
    validToTime: '09:00'
  },
  {
    id: 4,
    code: 'FLASHXIEU',
    discountPct: 25,
    minOrder: 40000,
    description: 'Giờ vàng xế chiều ăn vặt & trà sữa (14:00 - 16:30)',
    expiredAt: '2026-12-31',
    isActive: true,
    timeRestricted: true,
    validFromTime: '14:00',
    validToTime: '16:30'
  },
  {
    id: 5,
    code: 'STUDENT20',
    discountPct: 20,
    minOrder: 80000,
    description: 'Ưu đãi sinh viên giảm 20% đơn từ 80k',
    expiredAt: '2026-12-31',
    isActive: true,
    timeRestricted: false
  },
  {
    id: 6,
    code: 'HETHAN50',
    discountPct: 50,
    minOrder: 50000,
    description: 'Voucher thử nghiệm quá hạn (Thông báo Voucher không khả dụng)',
    expiredAt: '2026-01-01',
    isActive: true,
    timeRestricted: false
  }
];

export const INITIAL_USERS: Record<string, User> = {
  customer: {
    id: 101,
    email: 'khachhang@canteengo.vn',
    phone: '0901234567',
    fullName: 'Nguyễn Văn An (Khách vãng lai)',
    role: 'GUEST',
    schoolRole: 'GUEST',
    area: 'Tòa nhà A - Phòng 402',
    createdAt: '2026-03-01',
    password: 'password123',
    walletBalance: 250000, // 250k initial customer wallet
    walletTransactions: [
      { id: 'TX-901', type: 'DEPOSIT', amount: 300000, description: 'Nạp tiền Ví C-Pay qua VietQR Bank', createdAt: '2026-03-25 09:30', status: 'SUCCESS' },
      { id: 'TX-902', type: 'PAYMENT', amount: 50000, description: 'Thanh toán đơn hàng #CTG-8801', createdAt: '2026-03-28 12:15', status: 'SUCCESS' },
    ],
  },
  teacher: {
    id: 401,
    email: 'gv.nguyen@hpn.edu.vn',
    phone: '0933445566',
    fullName: 'ThS. Nguyễn Hoàng Nam',
    role: 'TEACHER',
    schoolRole: 'TEACHER',
    studentId: 'GV-CNTT01',
    faculty: 'Khoa Công Nghệ Thông Tin',
    area: 'Phòng Giảng viên 205 - Nhà A',
    createdAt: '2026-02-10',
    password: 'password123',
    walletBalance: 350000,
    walletTransactions: [
      { id: 'TX-910', type: 'DEPOSIT', amount: 350000, description: 'Nạp tiền thẻ Căn-tin Giảng viên', createdAt: '2026-03-15 08:00', status: 'SUCCESS' }
    ],
  },
  student: {
    id: 501,
    email: 'sv.le@hpn.edu.vn',
    phone: '0977889900',
    fullName: 'Lê Minh Quân',
    role: 'STUDENT',
    schoolRole: 'STUDENT',
    studentId: 'SV-2024HPN09',
    faculty: 'Khoa Kinh tế & Quản lý',
    area: 'Bàn tự học Căn-tin B',
    createdAt: '2026-02-15',
    password: 'password123',
    walletBalance: 120000,
    walletTransactions: [
      { id: 'TX-920', type: 'DEPOSIT', amount: 150000, description: 'Nạp tiền sinh viên', createdAt: '2026-03-18 10:30', status: 'SUCCESS' }
    ],
  },
  staff: {
    id: 201,
    email: 'bepvien@canteengo.vn',
    phone: '0912345678',
    fullName: 'Trần Thị Bích (Nhân viên Canteen)',
    role: 'STAFF',
    area: 'Quầy trung tâm Canteen số 1',
    createdAt: '2026-01-15',
    password: 'password123',
    walletBalance: 0,
  },
  admin: {
    id: 301,
    email: 'quanly@canteengo.vn',
    phone: '0988776655',
    fullName: 'Lê Hoàng Minh (Quản lý trưởng)',
    role: 'ADMIN',
    area: 'Văn phòng Điều hành Canteen',
    createdAt: '2025-10-01',
    password: 'password123',
    walletBalance: 500000,
  },
};

const getRelativeIsoDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 1001,
    orderCode: 'CTG-8921',
    userId: 999,
    receiverName: 'Khách vãng lai A',
    phone: '0909999999',
    pickupArea: 'Bàn A-12 (Tầng 1)',
    pickupTime: '11:30',
    status: 'PENDING',
    totalAmount: 66000,
    discountAmount: 6600,
    finalAmount: 59400,
    voucherCode: 'CANTEEN10',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    payment: {
      method: 'cash',
      status: 'pending_confirm'
    },
    createdAt: '11:12:00',
    orderDate: getRelativeIsoDate(0), // Hôm nay
    estimatedCompletionTime: '11:30',
    items: [
      { id: 1, orderId: 1001, itemName: 'Cơm Tấm Sườn Bì Chả', quantity: 1, unitPrice: 38000 },
      { id: 2, orderId: 1001, itemName: 'Canh Chua Tôm Nấu Thơm', quantity: 1, unitPrice: 15000 },
      { id: 3, orderId: 1001, itemName: 'Trà Chanh Dây Mật Ong', quantity: 1, unitPrice: 16000 },
    ]
  },
  {
    id: 1002,
    orderCode: 'CTG-8922',
    receiverName: 'Phạm Thu Trang',
    phone: '0933221100',
    pickupArea: 'Quầy nhận nhanh số 2',
    pickupTime: '11:45',
    status: 'PROCESSING',
    totalAmount: 82000,
    discountAmount: 12300,
    finalAmount: 69700,
    voucherCode: 'COMBOYEU',
    paymentMethod: 'TRANSFER',
    paymentStatus: 'PAID',
    payment: {
      method: 'qr',
      status: 'paid',
      confirmedAt: '11:19:00',
      confirmedByName: 'Thu ngân Quầy 1'
    },
    cookingAt: '11:21:30',
    createdAt: '11:18:20',
    orderDate: getRelativeIsoDate(0), // Hôm nay
    estimatedCompletionTime: '11:40',
    items: [
      { 
        id: 4, 
        orderId: 1002, 
        itemName: 'Combo Cơm Gà Xối Mỡ Đầy Đủ', 
        quantity: 1, 
        unitPrice: 82000, 
        isCombo: true, 
        comboDetails: ['Cơm Gà Xối Mỡ Da Giòn', 'Rau Cải Thìa Xào Tỏi', 'Nước Ép Ổi Hồng Tươi', 'Sữa Chua Nếp Cẩm Mộc Châu'] 
      }
    ]
  },
  {
    id: 1003,
    orderCode: 'CTG-8919',
    receiverName: 'Hoàng Quốc Bảo',
    phone: '0977889900',
    pickupArea: 'Phòng họp Tầng 3 - Block B',
    pickupTime: '11:15',
    status: 'READY',
    totalAmount: 70000,
    finalAmount: 70000,
    paymentMethod: 'TRANSFER',
    paymentStatus: 'PAID',
    payment: {
      method: 'qr',
      status: 'paid',
      confirmedAt: '10:56:00',
      confirmedByName: 'Thu ngân Quầy 1'
    },
    cookingAt: '10:58:00',
    readyAt: '11:10:00',
    completedAt: '11:10',
    createdAt: '10:55:10',
    orderDate: getRelativeIsoDate(1), // Hôm qua
    items: [
      { id: 5, orderId: 1003, itemName: 'Cơm Bò Xào Hành Cần', quantity: 1, unitPrice: 42000 },
      { id: 6, orderId: 1003, itemName: 'Trà Sữa Oolong Nướng', quantity: 1, unitPrice: 22000 },
    ]
  },
  {
    id: 1004,
    orderCode: 'CTG-8915',
    receiverName: 'Đặng Mai Linh',
    phone: '0911223344',
    pickupArea: 'Bàn B-04',
    pickupTime: '11:00',
    status: 'DELIVERED',
    totalAmount: 50000,
    finalAmount: 50000,
    paymentMethod: 'COD',
    paymentStatus: 'PAID',
    payment: {
      method: 'cash',
      status: 'paid',
      confirmedAt: '10:31:00',
      confirmedByName: 'Thu ngân Quầy 2'
    },
    cookingAt: '10:33:00',
    readyAt: '10:48:00',
    doneAt: '10:52:00',
    completedAt: '10:52',
    createdAt: '10:30:00',
    orderDate: getRelativeIsoDate(2), // 2 ngày trước
    items: [
      { id: 7, orderId: 1004, itemName: 'Cơm Nấm Đùi Gà Kho Tiêu (Chay)', quantity: 1, unitPrice: 35000 },
      { id: 8, orderId: 1004, itemName: 'Canh Rong Biển Hạt Sen (Chay)', quantity: 1, unitPrice: 15000 },
    ]
  },
  {
    id: 1005,
    orderCode: 'CTG-8910',
    receiverName: 'Vũ Minh Tuấn',
    phone: '0988112233',
    pickupArea: 'Quầy Canteen số 1',
    pickupTime: '10:45',
    status: 'CANCELLED',
    totalAmount: 45000,
    finalAmount: 45000,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    payment: {
      method: 'cash',
      status: 'unpaid'
    },
    cancelReason: 'Hết nguyên liệu tại bếp',
    cancel: {
      cancelledBy: 'staff',
      reason: 'Hết nguyên liệu tại bếp',
      cancelledAt: '10:40:00'
    },
    createdAt: '10:35:00',
    orderDate: getRelativeIsoDate(0),
    items: [
      { id: 9, orderId: 1005, itemName: 'Cơm Ba Chỉ Bò Sốt Tiêu Đen', quantity: 1, unitPrice: 45000 }
    ]
  }
];

export const PICKUP_AREAS = [
  'Quầy Canteen số 1 (Tầng trệt)',
  'Quầy Canteen số 2 (Khu Fast-track)',
  'Bàn ăn Canteen Khu A (Bàn 1-20)',
  'Bàn ăn Canteen Khu B (Bàn 21-40)',
  'Tòa nhà Văn phòng - Tầng 2',
  'Tòa nhà Văn phòng - Tầng 3',
  'Tòa nhà Văn phòng - Tầng 4',
  'Khu Ký túc xá Sinh viên',
  'Khác'
];

export const PICKUP_TIMES = [
  '11:00 - 11:15',
  '11:15 - 11:30',
  '11:30 - 11:45',
  '11:45 - 12:00',
  '12:00 - 12:15',
  '12:15 - 12:30',
  '12:30 - 12:45',
  '12:45 - 13:00'
];

export const INITIAL_REVIEWS: ItemReview[] = [
  {
    id: 1,
    itemId: 1,
    userId: 101,
    userName: 'Nguyễn Văn An',
    rating: 5,
    comment: 'Sườn nướng rất mềm và thơm, bì giòn không bị dai. Phần cơm tấm này ăn rất vừa bụng!',
    createdAt: '2026-09-14 11:45',
    adminReply: {
      comment: 'Cảm ơn bạn đã yêu thích món Cơm tấm sườn nướng của Canteen! Đầu bếp luôn tẩm ướp sườn theo công thức đặc biệt mỗi sáng để đảm bảo độ mềm ngọt. Chúc bạn luôn có những bữa trưa ngon miệng!',
      repliedAt: '2026-09-14 12:15',
      repliedBy: 'Ban Quản Trị Canteen'
    }
  },
  {
    id: 2,
    itemId: 2,
    userId: 102,
    userName: 'Lê Thùy Dung',
    rating: 5,
    comment: 'Gà da giòn tan, thịt bên trong mềm mọng nước. Nước sốt tỏi ớt chấm kèm xuất sắc.',
    createdAt: '2026-09-14 12:10'
  },
  {
    id: 3,
    itemId: 4,
    userId: 103,
    userName: 'Trần Văn Minh',
    rating: 5,
    comment: 'Món chay nấm đùi gà kho tiêu rất đậm đà, ăn kèm cơm nóng tuyệt vời cho bữa trưa healthy.',
    createdAt: '2026-09-13 12:05'
  },
  {
    id: 4,
    itemId: 9,
    userId: 101,
    userName: 'Nguyễn Văn An',
    rating: 4,
    comment: 'Trà chanh dây thơm thanh mát, chua ngọt dịu, ít đường giải nhiệt rất tốt!',
    createdAt: '2026-09-14 11:50'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-staff-1',
    targetRole: 'STAFF',
    title: '🔔 ĐƠN HÀNG MỚI #CTG-8821',
    message: 'Khách hàng Nguyễn Văn An vừa đặt đơn Cơm tấm sườn bì chả (Trị giá 45.000₫) - Nhận tại Quầy 2.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: 'ORDER',
    isRead: false,
    orderId: 1
  },
  {
    id: 'notif-staff-2',
    targetRole: 'STAFF',
    title: '💬 Yêu cầu hỗ trợ mới từ Nguyễn Văn An',
    message: 'Khách hỏi: "Dạ shop ơi, đơn #CTG-8821 cơm tấm của em khoảng mấy phút nữa làm xong vậy ạ?"',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    type: 'CHAT',
    isRead: false
  },
  {
    id: 'notif-staff-3',
    targetRole: 'STAFF',
    title: '💰 Giao dịch Ví C-Pay: Nguyễn Văn An',
    message: 'Khách hàng vừa nạp +250.000₫ vào Ví C-Pay qua Chuyển khoản VietQR.',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    type: 'WALLET',
    isRead: true
  },
  {
    id: 'notif-1',
    userId: 101, // Target: Nguyễn Văn An
    targetRole: 'CUSTOMER',
    title: '🎉 Đơn hàng #CTG-8821 đã sẵn sàng!',
    message: 'Món Cơm tấm sườn bì chả của bạn đã bếp chế biến xong. Vui lòng tới Quầy 2 để nhận món nóng hổi.',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    type: 'ORDER',
    isRead: false,
    orderId: 1
  },
  {
    id: 'notif-2',
    userId: 101, // Target: Nguyễn Văn An
    targetRole: 'CUSTOMER',
    title: '💰 Nạp tiền vào Ví C-Pay thành công',
    message: 'Tài khoản của bạn vừa nạp thành công +250.000₫ qua phương thức Chuyển khoản VietQR.',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    type: 'WALLET',
    isRead: false
  },
  {
    id: 'notif-3',
    userId: 101, // Target: Nguyễn Văn An
    targetRole: 'CUSTOMER',
    title: '🎁 Mã ưu đãi sinh viên STUDENT20',
    message: 'Áp dụng mã STUDENT20 giảm ngay 20% cho đơn hàng từ 80k khi thanh toán bằng Ví C-Pay!',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    type: 'PROMO',
    isRead: false,
    voucherCode: 'STUDENT20'
  },
  {
    id: 'notif-4',
    userId: 103, // Target: Trần Văn Minh
    targetRole: 'CUSTOMER',
    title: '🎉 Đơn hàng #CTG-8823 đang được bếp làm nóng hổi!',
    message: 'Đơn bún chả & trà chanh dây của bạn đang được chế biến khẩn trương tại Bếp 1.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    type: 'ORDER',
    isRead: false,
    orderId: 3
  },
  {
    id: 'notif-5',
    userId: 104, // Target: Lê Thị Mai
    targetRole: 'CUSTOMER',
    title: '💰 Nạp tiền vào Ví C-Pay thành công',
    message: 'Tài khoản Lê Thị Mai vừa nạp thành công +150.000₫ vào Ví Canteen.',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    type: 'WALLET',
    isRead: true
  }
];

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg-1',
    conversationId: 'user-101',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0901234567',
    senderId: 101,
    senderName: 'Nguyễn Văn An',
    senderRole: 'CUSTOMER',
    message: 'Dạ shop ơi, đơn #CTG-8821 cơm tấm của em khoảng mấy phút nữa làm xong vậy ạ?',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isReadByStaff: false,
    isReadByCustomer: true,
    isStaffReply: false
  },
  {
    id: 'msg-2',
    conversationId: 'user-101',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0901234567',
    senderId: 2,
    senderName: 'Hoàng Nam (Thu ngân)',
    senderRole: 'STAFF',
    message: 'Dạ chào bạn An! Đơn của bạn bếp vừa nướng xong sườn nóng hổi rồi ạ, khoảng 2 phút nữa bạn qua Quầy 2 nhận nha!',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    isReadByStaff: true,
    isReadByCustomer: true,
    isStaffReply: true
  },
  {
    id: 'msg-3',
    conversationId: 'user-101',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0901234567',
    senderId: 101,
    senderName: 'Nguyễn Văn An',
    senderRole: 'CUSTOMER',
    message: 'Dạ cho em xin thêm 1 hũ nước mắm ngọt và ít tương ớt nha anh!',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isReadByStaff: false,
    isReadByCustomer: true,
    isStaffReply: false
  },
  {
    id: 'msg-4',
    conversationId: 'user-102',
    customerName: 'Trần Thị Bích',
    customerPhone: '0912345678',
    senderId: 102,
    senderName: 'Trần Thị Bích',
    senderRole: 'CUSTOMER',
    message: 'Shop ơi món Trà chanh dây hôm nay có ít ngọt được không ạ?',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    isReadByStaff: false,
    isReadByCustomer: true,
    isStaffReply: false
  }
];

export const DEFAULT_CANTEEN_STATUS: import('../types').CanteenStatusConfig = {
  isOpen: true,
  mode: 'MANUAL',
  statusText: 'Đang mở cửa phục vụ',
  closedNote: 'Căng tin tạm nghỉ phục vụ để dọn dẹp và chuẩn bị nguyên liệu tươi ngon. Hẹn gặp lại bạn vào ca tiếp theo!',
  lunchHours: '10:30 – 13:30 (Thứ 2 – Thứ 7)',
  breakfastHours: '06:30 – 08:30 & 16:00 – 21:00',
  allowOrderingWhenClosed: false,
};
