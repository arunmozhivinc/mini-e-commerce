require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-ecommerce';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [String],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, unique: true, sparse: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const seedData = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected successfully.');

    // 1. Seed Users
    console.log('Seeding Users...');
    await User.deleteMany({});

    const salt = await bcrypt.genSalt(12);
    const adminPasswordHash = await bcrypt.hash('Admin123!', salt);
    const customerPasswordHash = await bcrypt.hash('Password123!', salt);

    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: adminPasswordHash,
      role: 'admin',
    });

    const customerUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: customerPasswordHash,
      role: 'customer',
    });

    console.log('Users created:');
    console.log(' - Admin: admin@example.com (Password: Admin123!)');
    console.log(' - Customer: john@example.com (Password: Password123!)');

    // 2. Seed Categories
    console.log('Seeding Categories...');
    await Category.deleteMany({});

    const categoriesData = [
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Latest gadgets, laptops, smartphones, and accessories.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Fashion & Apparel',
        slug: 'fashion-apparel',
        description: 'Trendy clothing, luxury footwear, and lifestyle wearables.',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Home & Kitchen',
        slug: 'home-kitchen',
        description: 'Modern cookware, aesthetic decor, and smart home essentials.',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Sports & Fitness',
        slug: 'sports-fitness',
        description: 'Workout equipment, athletic gear, and outdoor essentials.',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Books & Stationery',
        slug: 'books-stationery',
        description: 'Bestsellers, journals, executive pens, and desk supplies.',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      },
    ];

    const insertedCategories = await Category.insertMany(categoriesData);
    const catMap = insertedCategories.reduce((acc, cat) => {
      acc[cat.slug] = cat._id;
      return acc;
    }, {});
    console.log(`Created ${insertedCategories.length} categories.`);

    // 3. Seed Products
    console.log('Seeding Products...');
    await Product.deleteMany({});

    const productsData = [
      {
        name: 'Sony WH-1000XM5 Wireless Headphones',
        slug: 'sony-wh-1000xm5-wireless-headphones',
        description: 'Industry-leading noise canceling with two processors and 8 microphones for unprecedented noise canceling.',
        price: 348.0,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
        ],
        category: catMap['electronics'],
        stock: 45,
        sku: 'ELEC-SNY-001',
        featured: true,
      },
      {
        name: 'Apple MacBook Pro 14" M3 Pro',
        slug: 'apple-macbook-pro-14-m3-pro',
        description: 'Liquid Retina XDR display, up to 18 hours of battery life, and powerhouse performance for creators.',
        price: 1999.0,
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
        ],
        category: catMap['electronics'],
        stock: 18,
        sku: 'ELEC-APP-002',
        featured: true,
      },
      {
        name: 'Logitech MX Master 3S Wireless Mouse',
        slug: 'logitech-mx-master-3s-wireless-mouse',
        description: 'Quiet clicks and an 8K DPI track-on-glass sensor. Ergonomic precision tool for power users.',
        price: 99.99,
        images: [
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
        ],
        category: catMap['electronics'],
        stock: 60,
        sku: 'ELEC-LOG-003',
        featured: false,
      },
      {
        name: 'Mechanical Gaming Keyboard RGB',
        slug: 'mechanical-gaming-keyboard-rgb',
        description: 'Custom hot-swappable switches, PBT double-shot keycaps, and custom dynamic per-key RGB backlighting.',
        price: 129.5,
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        ],
        category: catMap['electronics'],
        stock: 32,
        sku: 'ELEC-KBD-004',
        featured: true,
      },
      {
        name: 'Minimalist Japanese Linen Overshirt',
        slug: 'minimalist-japanese-linen-overshirt',
        description: 'Crafted with premium breathable organic linen. Tailored modern fit with timeless horn buttons.',
        price: 85.0,
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        ],
        category: catMap['fashion-apparel'],
        stock: 50,
        sku: 'FASH-SHT-001',
        featured: true,
      },
      {
        name: 'Italian Leather Everyday Backpack',
        slug: 'italian-leather-everyday-backpack',
        description: 'Full-grain vegetable-tanned Italian leather with padded 16-inch laptop compartment and brass hardware.',
        price: 240.0,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
        ],
        category: catMap['fashion-apparel'],
        stock: 25,
        sku: 'FASH-BAG-002',
        featured: true,
      },
      {
        name: 'Classic Urban Wool Overcoat',
        slug: 'classic-urban-wool-overcoat',
        description: 'Heavyweight double-faced wool blend. Single-breasted silhouette with notched lapel and silk lining.',
        price: 295.0,
        images: [
          'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=80',
        ],
        category: catMap['fashion-apparel'],
        stock: 14,
        sku: 'FASH-COAT-003',
        featured: false,
      },
      {
        name: 'Specialty Pour-Over Coffee Kettle & Dripper Set',
        slug: 'specialty-pour-over-coffee-kettle-dripper-set',
        description: 'Gooseneck stainless steel kettle with precision flow spout and heat-resistant borosilicate glass carafe.',
        price: 68.0,
        images: [
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
        ],
        category: catMap['home-kitchen'],
        stock: 40,
        sku: 'HOME-COF-001',
        featured: true,
      },
      {
        name: 'Cast Iron Enamelled Dutch Oven 5.5 Qt',
        slug: 'cast-iron-enamelled-dutch-oven-5-5-qt',
        description: 'Heavyweight enamel cast iron delivers superior heat distribution and retention for artisan bread and stews.',
        price: 145.0,
        images: [
          'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
        ],
        category: catMap['home-kitchen'],
        stock: 20,
        sku: 'HOME-POT-002',
        featured: false,
      },
      {
        name: 'Nordic Ceramic Dinnerware Set (16 Pieces)',
        slug: 'nordic-ceramic-dinnerware-set-16-pieces',
        description: 'Hand-glazed stoneware in matte cream finish. Dishwasher and microwave safe high-durability clay.',
        price: 110.0,
        images: [
          'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&auto=format&fit=crop&q=80',
        ],
        category: catMap['home-kitchen'],
        stock: 15,
        sku: 'HOME-PLT-003',
        featured: false,
      },
      {
        name: 'Pro Adjustable Dumbbell Set (5-52.5 lbs)',
        slug: 'pro-adjustable-dumbbell-set-5-52-5-lbs',
        description: 'Replaces 15 sets of weights with a turn of a dial. Compact home gym solution with textured steel grips.',
        price: 379.0,
        images: [
          'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
        ],
        category: catMap['sports-fitness'],
        stock: 12,
        sku: 'SPRT-DMB-001',
        featured: true,
      },
      {
        name: 'High-Density Non-Slip Yoga Mat',
        slug: 'high-density-non-slip-yoga-mat',
        description: 'Eco-friendly biodegradable natural tree rubber with alignment lines for superior grip and joint cushioning.',
        price: 54.0,
        images: [
          'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&auto=format&fit=crop&q=80',
        ],
        category: catMap['sports-fitness'],
        stock: 80,
        sku: 'SPRT-MAT-002',
        featured: false,
      },
      {
        name: 'Designing Data-Intensive Applications',
        slug: 'designing-data-intensive-applications',
        description: 'The definitive guide to distributed systems, storage engines, data models, and reliability by Martin Kleppmann.',
        price: 42.5,
        images: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
        ],
        category: catMap['books-stationery'],
        stock: 95,
        sku: 'BOOK-DDIA-001',
        featured: true,
      },
      {
        name: 'Refillable Full-Grain Leather Journal',
        slug: 'refillable-full-grain-leather-journal',
        description: 'Handcrafted genuine leather cover with 240 pages of 120gsm fountain-pen friendly acid-free paper.',
        price: 36.0,
        images: [
          'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=80',
        ],
        category: catMap['books-stationery'],
        stock: 70,
        sku: 'BOOK-JRN-002',
        featured: false,
      },
    ];

    const insertedProducts = await Product.insertMany(productsData);
    console.log(`Successfully seeded ${insertedProducts.length} products.`);

    console.log('\n=============================================');
    console.log('Database Seeding Complete!');
    console.log('=============================================');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
