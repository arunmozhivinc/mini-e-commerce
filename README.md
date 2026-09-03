# ApexCart — Full-Stack MERN Microservices E-Commerce Platform

A production-style, microservices-driven e-commerce platform built with **React.js**, **Tailwind CSS**, **Node.js**, **Express.js**, **MongoDB**, **Redis**, **BullMQ**, **Stripe**, and **Web Push (VAPID)**.

---

## 1. System Architecture

ApexCart follows an asynchronous, event-driven microservices architecture fronted by an API Gateway:

```
                                  ┌───────────────────────────┐
                                  │   React + Tailwind CSS    │
                                  │      (Vite :5173)         │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │   Express API Gateway     │
                                  │      (Port :5000)         │
                                  │  Rate Limit, Proxy, CORS  │
                                  └─────────────┬─────────────┘
                                                │
         ┌───────────────┬──────────────────────┼──────────────────────┬────────────────┐
         ▼               ▼                      ▼                      ▼                ▼
   ┌───────────┐   ┌───────────┐          ┌───────────┐          ┌───────────┐   ┌────────────┐
   │   Auth    │   │  Product  │          │   Order   │          │  Payment  │   │Notification│
   │  Service  │   │  Service  │          │  Service  │          │  Service  │   │  Service   │
   │  (:5001)  │   │  (:5002)  │          │  (:5003)  │          │  (:5004)  │   │  (:5005)   │
   └─────┬─────┘   └─────┬─────┘          └─────┬─────┘          └─────┬─────┘   └─────┬──────┘
         │               │                      │                      │               │
         │         ┌─────┴─────┐          ┌─────┴─────┐          ┌─────┴─────┐   ┌─────┴──────┐
         │         │   Redis   │          │  BullMQ   │          │  Stripe   │   │  Web Push  │
         │         │  (Cache)  │          │  (Queue)  │          │  Webhook  │   │  (VAPID)   │
         │         └───────────┘          └─────┬─────┘          └─────┬─────┘   └────────────┘
         │                                      │                      │
         │                                      ▼                      ▼
         │                             ┌─────────────────┐   ┌─────────────────┐
         │                             │  Notification   │   │     Payment     │
         │                             │     Worker      │   │     Worker      │
         │                             └────────┬────────┘   └────────┬────────┘
         │                                      │                     │
         └───────────────────────┬──────────────┴─────────────────────┘
                                 ▼
                       ┌───────────────────┐
                       │  MongoDB Cluster  │
                       │   (Port 27017)    │
                       └───────────────────┘
```

---

## 2. Technologies

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js (v18), Vite | Single Page Application with dynamic state |
| **Styling** | Tailwind CSS (v3) | Responsive, mobile-first utility design |
| **Icons & Fonts** | Lucide React, Plus Jakarta Sans | Modern typography & iconography |
| **Gateway** | Express.js, `http-proxy-middleware` | Reverse proxy, rate limiting, and raw webhook handling |
| **Backend Services** | Node.js, Express.js | Modular, standalone microservices |
| **Database** | MongoDB & Mongoose | Flexible NoSQL document models with compound indexes |
| **Caching (Redis #1)** | Redis & ioredis | Frequently accessed product list & category caching |
| **Caching (Redis #2)** | Redis & ioredis | Per-user unread notification count caching |
| **Job Queue (BullMQ #1)**| BullMQ | Order placement & fulfillment event queuing with retries |
| **Job Queue (BullMQ #2)**| BullMQ | Delayed payment settlement & confirmation jobs |
| **Payments** | Stripe Checkout (Test Sandbox) | Hosted checkout sessions & webhook signature verification |
| **Push Notifications** | Web Push API & Service Worker | VAPID-authenticated native push notifications |
| **Authentication** | JWT & bcryptjs | Stateless token auth with role-based access (Customer, Admin) |

---

## 3. Microservice Responsibilities

### 1. API Gateway (`:5000`)
- Single point of entry for all frontend requests.
- Routes `/api/auth/*` → Auth Service (`:5001`)
- Routes `/api/products/*`, `/api/categories/*` → Product Service (`:5002`)
- Routes `/api/cart/*`, `/api/orders/*` → Order Service (`:5003`)
- Routes `/api/payments/*` → Payment Service (`:5004`) (preserves raw body for Stripe signature validation)
- Routes `/api/notifications/*` → Notification Service (`:5005`)
- Applies rate limiting (200 req/15min general; 20 req/15min auth) and CORS.

### 2. Auth Service (`:5001`)
- Handles user registration with password hashing (bcrypt salt 12).
- Issues signed JWT tokens (7-day lifespan).
- Role-based authorization: `customer` and `admin`.

### 3. Product Service (`:5002`)
- Product and Category catalog management.
- Full-text search and category filtering with pagination.
- **Redis Cache Layer**: Caches product lists (`products:p1:l12:...`) and single items (`product:<id>`). Automatically invalidates on product/category creation or stock adjustments.

### 4. Order Service (`:5003`)
- Persistent shopping cart management per authenticated user.
- Order creation with tax calculation (8%) and free shipping threshold ($50).
- Publishes order events to BullMQ `order-notifications` queue with exponential backoff.

### 5. Payment Service (`:5004`)
- Creates Stripe Checkout Sessions for PCI-compliant payments.
- Listens to Stripe webhooks (`checkout.session.completed`).
- Verifies `Stripe-Signature` header against `STRIPE_WEBHOOK_SECRET`.
- Enqueues delayed payment confirmation jobs to BullMQ `payment-confirmations` queue.

### 6. Notification Service (`:5005`)
- Manages user notification history and unread status.
- Caches unread counts in Redis (`notifications:unread:<userId>`).
- Saves Web Push subscriptions and provides public VAPID key.

### 7. Background Workers (`workers/`)
- **Notification Worker**: Consumes `order-notifications` queue, persists notification documents, invalidates Redis caches, and sends push notifications through Web Push.
- **Payment Worker**: Consumes `payment-confirmations` queue (with 5-second deliberate delay), confirms payment receipt, and pushes browser alerts.

---

## 4. Redis Use Cases

1. **Use Case 1 — Query & Catalog Caching**:
   - High-throughput product listings, search queries, and category lists are cached in Redis with a 5-minute TTL (`shared/src/redis.js`).
   - Mutations (creating/updating/deleting products or updating warehouse stock) trigger automated cache invalidation using key patterns (`products:*`).

2. **Use Case 2 — Queue Engine & Notification Counters**:
   - Powers BullMQ's distributed background queues (`order-notifications` and `payment-confirmations`).
   - Caches active unread notification counts per user (`notifications:unread:<userId>`) with instant invalidation upon receipt or read events.

---

## 5. BullMQ Background Jobs

1. **Job 1 — Order Notification Job**:
   - Triggered on: Order created or fulfillment status updated (Pending → Confirmed → Processing → Shipped → Delivered).
   - Queue: `order-notifications`.
   - Retry Strategy: 3 attempts with exponential backoff (2000ms delay).
   - Behavior: Creates in-app notification, invalidates cache, and dispatches Web Push payload.

2. **Job 2 — Payment Confirmation (Delayed Job)**:
   - Triggered on: Stripe webhook `checkout.session.completed`.
   - Queue: `payment-confirmations`.
   - Delayed execution: Configured with a `delay: 5000` (5-second grace window) to simulate realistic bank confirmation workflows.
   - Behavior: Confirms settlement and pushes a notification to the customer.

---

## 6. Payment Flow

```
User -> Cart -> Checkout Page
     ↓
POST /api/orders (Order created in PENDING status)
     ↓
POST /api/payments/create (Stripe Checkout Session initialized)
     ↓
Redirect to Stripe Hosted Checkout (Test Sandbox)
     ↓
Customer enters test card details & submits payment
     ↓
Stripe Webhook -> POST /api/payments/webhook
     ↓
Backend validates Stripe signature using raw request buffer
     ↓
Order & Payment status updated to COMPLETED / CONFIRMED
     ↓
Payment & Order notifications queued in BullMQ
     ↓
Background Workers dispatch Web Push notifications
```

---

## 7. Web Push Notification Flow

1. Browser loads service worker `/sw.js`.
2. User clicks "Enable" on the notification bell banner in the Navbar.
3. Client retrieves public VAPID key from `GET /api/notifications/public-key`.
4. Browser prompts for native notification permission and subscribes via `PushManager`.
5. Subscription object is stored in MongoDB via `POST /api/notifications/subscribe`.
6. Whenever an order event occurs, the BullMQ worker calls `webpush.sendNotification()` to deliver a real-time native desktop/mobile alert.

---

## 8. Installation & Setup

### Prerequisites
- Node.js (v18+ or v20+)
- MongoDB (running locally on port `27017` or via Docker)
- Redis (running locally on port `6379` or via Docker)

### Step 1: Start Database & Redis (Docker Compose)
```bash
docker-compose up -d
```

### Step 2: Install All Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Generate VAPID keys for Web Push:
```bash
npm run generate:vapid
```
Paste the generated `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` into your `.env`.

### Step 4: Seed the Database
Populates admin user, customer user, 5 categories, and 14 premium products:
```bash
npm run seed
```

### Step 5: Run the Entire Application
Starts the API Gateway, 5 microservices, 2 BullMQ workers, and the React frontend concurrently:
```bash
npm run dev
```

Visit the frontend at **http://localhost:5173**.

---

## 9. Test Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Admin123!` | Access to `/admin`, Product CRUD, stock adjustments, order fulfillment updates |
| **Customer** | `john@example.com` | `Password123!` | Browsing, cart, checkout, order tracking, push notifications |

*Note: The Login page includes 1-click test credential fill buttons for fast testing.*

---

## 10. API Documentation

### Auth Service (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user and receive JWT |
| `POST` | `/api/auth/login` | Public | Sign in with email & password |
| `GET` | `/api/auth/me` | Protected | Fetch authenticated user profile |
| `GET` | `/api/auth/users` | Admin | List all registered users |

### Product Service (`/api/products`, `/api/categories`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | List products (search, category, sort, pagination) [Redis-Cached] |
| `GET` | `/api/products/:id` | Public | Get single product by ID [Redis-Cached] |
| `POST` | `/api/products` | Admin | Create product & invalidate cache |
| `PUT` | `/api/products/:id` | Admin | Update product & invalidate cache |
| `DELETE` | `/api/products/:id` | Admin | Delete product & invalidate cache |
| `PATCH` | `/api/products/:id/stock` | Admin | Update stock quantity & invalidate cache |
| `GET` | `/api/categories` | Public | List all categories [Redis-Cached] |
| `POST` | `/api/categories` | Admin | Create new category |

### Cart & Orders (`/api/cart`, `/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Protected | Fetch current user's shopping cart |
| `POST` | `/api/cart` | Protected | Add item to cart |
| `PUT` | `/api/cart/:itemId` | Protected | Update item quantity |
| `DELETE` | `/api/cart/:itemId` | Protected | Remove item from cart |
| `DELETE` | `/api/cart` | Protected | Empty user's cart |
| `POST` | `/api/orders` | Protected | Create order & queue BullMQ notification |
| `GET` | `/api/orders` | Protected | List current user's order history |
| `GET` | `/api/orders/:id` | Protected | Get detailed order timeline |
| `GET` | `/api/orders/admin/all` | Admin | List all system orders with filters |
| `PATCH` | `/api/orders/:id/status` | Admin | Update fulfillment status & queue notification |

### Payments (`/api/payments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/create` | Protected | Initialize Stripe Checkout session |
| `POST` | `/api/payments/webhook` | Public | Stripe webhook listener with signature verification |
| `GET` | `/api/payments/:orderId`| Protected | Query payment record by order ID |

### Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications/public-key` | Public | Get public VAPID key |
| `GET` | `/api/notifications` | Protected | Fetch user notifications |
| `GET` | `/api/notifications/unread-count` | Protected | Get unread count [Redis-Cached] |
| `PATCH`| `/api/notifications/:id/read` | Protected | Mark single notification as read |
| `PATCH`| `/api/notifications/read-all` | Protected | Mark all notifications as read |
| `POST` | `/api/notifications/subscribe`| Protected | Save Web Push subscription |
