const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/productModel');

const sampleProducts = [
  {
    name: 'iPhone 14 Pro Max',
    code: 'IP14PM',
    description: 'iPhone 14 Pro Max mới nhất với camera 48MP, chip A16 Bionic',
    price: 27990000,
    promotionPrice: 26990000,
    stock: 50,
    images: ['/public/img/products/iphone-14-pro-max.jpg'],
    category: 'Điện thoại',
    brand: 'Apple',
    isActive: true,
    isPromoted: true,
    isFeatured: true,
    specifications: {
      screen: '6.7 inch OLED',
      cpu: 'A16 Bionic',
      ram: '6GB',
      storage: '128GB'
    },
    tags: ['iPhone', 'Apple', 'Cao cấp'],
    rating: {
      average: 4.8,
      count: 150
    }
  },
  {
    name: 'Samsung Galaxy S23 Ultra',
    code: 'SS23U',
    description: 'Samsung Galaxy S23 Ultra với bút S-Pen, camera 200MP',
    price: 26990000,
    promotionPrice: 25990000,
    stock: 45,
    images: ['/public/img/products/samsung-s23-ultra.jpg'],
    category: 'Điện thoại',
    brand: 'Samsung',
    isActive: true,
    isPromoted: true,
    isFeatured: true,
    specifications: {
      screen: '6.8 inch Dynamic AMOLED 2X',
      cpu: 'Snapdragon 8 Gen 2',
      ram: '8GB',
      storage: '256GB'
    },
    tags: ['Samsung', 'Galaxy', 'Cao cấp'],
    rating: {
      average: 4.7,
      count: 120
    }
  },
  {
    name: 'OPPO Find X5 Pro',
    code: 'OFX5P',
    description: 'OPPO Find X5 Pro với camera Hasselblad',
    price: 19990000,
    promotionPrice: 18990000,
    stock: 30,
    images: ['/public/img/products/oppo-find-x5-pro.jpg'],
    category: 'Điện thoại',
    brand: 'OPPO',
    isActive: true,
    isPromoted: true,
    isFeatured: false,
    specifications: {
      screen: '6.7 inch AMOLED',
      cpu: 'Snapdragon 8 Gen 1',
      ram: '12GB',
      storage: '256GB'
    },
    tags: ['OPPO', 'Find X', 'Cao cấp'],
    rating: {
      average: 4.6,
      count: 80
    }
  }
];

async function seedProducts() {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Đã kết nối đến MongoDB');

    // Xóa tất cả sản phẩm cũ
    await Product.deleteMany({});
    console.log('Đã xóa sản phẩm cũ');

    // Thêm sản phẩm mẫu
    await Product.insertMany(sampleProducts);
    console.log('Đã thêm sản phẩm mẫu');

    // Ngắt kết nối
    await mongoose.connection.close();
    console.log('Đã ngắt kết nối MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
}

seedProducts();
