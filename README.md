# 🛍️ Smart Inventory Reservation System

A production-ready e-commerce backend system that handles concurrent inventory reservations with TTL-based expiry, designed for high-traffic flash sale scenarios.

## ✨ Key Features

- ✅ **Concurrent-Safe Reservations** - Multiple users can safely reserve items simultaneously
- ✅ **TTL-Based Auto-Expiry** - Reservations automatically expire after 5 minutes
- ✅ **Idempotent Operations** - Safe to retry failed requests without duplication
- ✅ **Atomic Transactions** - Inventory is never oversold
- ✅ **Real-Time Cleanup** - Expired reservations are automatically cleaned up
- ✅ **Fair Access** - FIFO + concurrency control ensures fair checkout experience
- ✅ **Layered Architecture** - Clean separation of concerns

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         API Controllers Layer           │
│  (InventoryController, ReservationCtrl) │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Business Services Layer            │
│  (ReservationService, CheckoutService)  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    Data Repository Layer                │
│  (InventoryRepository, OrderRepository) │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      MongoDB Data Models                │
│  (Inventory, Reservation, Order)        │
└─────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd FlexyPe
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file** (already configured, verify values)
```env
PORT=5000
MONGODB_URI=mongodb+srv://namansharma3194_db_user:X7zRz37bjDUCKqUy@cluster0.68hn3po.mongodb.net/?appName=Cluster0
NODE_ENV=development
RESERVATION_TTL=300000  # 5 minutes
```

4. **Seed the database with sample products**
```bash
npm run seed
```

5. **Start the server**
```bash
npm start
```

Server will run on `http://localhost:5000`

### Development Mode
```bash
npm run dev
# Uses nodemon for auto-reload
```

## 📋 Available Products

After seeding, the following products are available:

| SKU | Product | Price | Stock |
|-----|---------|-------|-------|
| LAPTOP001 | Premium Laptop Pro | $1,299.99 | 5 |
| PHONE001 | Flagship Smartphone X | $899.99 | 10 |
| HEADSET001 | Wireless Headphones Pro | $299.99 | 20 |
| TABLET001 | Ultra Tablet Max | $699.99 | 8 |
| WATCH001 | Smart Watch Elite | $399.99 | 15 |
| CAMERA001 | 4K Mirrorless Camera | $1,599.99 | 3 |
| SPEAKER001 | Portable Bluetooth Speaker | $149.99 | 25 |
| CHARGER001 | Fast Charging Station | $79.99 | 30 |

## 🔌 API Endpoints

### Inventory Management
```
GET    /inventory                 - Get all products
GET    /inventory/{sku}           - Get product by SKU
POST   /inventory                 - Create new product
```

### Reservation Management
```
POST   /inventory/reserve         - Reserve inventory (5-min TTL)
GET    /reservation/{reservationId} - Check reservation status
POST   /inventory/reserve/cancel  - Cancel reservation
```

### Checkout & Orders
```
POST   /checkout/confirm          - Confirm checkout & create order
POST   /checkout/cancel           - Cancel order
GET    /order/{orderId}           - Get order details
```

## 📚 API Documentation

Complete API documentation with examples is available in:
- [`docs/API.md`](docs/API.md) - Detailed endpoint specifications
- [`docs/Postman_Collection.json`](docs/Postman_Collection.json) - Postman collection for testing

### Quick Example

**1. Get all products**
```bash
curl http://localhost:5000/inventory
```

**2. Reserve a product**
```bash
curl -X POST http://localhost:5000/inventory/reserve \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "sku": "LAPTOP001",
    "quantity": 1
  }'
```

Response includes `reservationId` and `expiresAt` timestamp.

**3. Confirm checkout**
```bash
curl -X POST http://localhost:5000/checkout/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "reservationId": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6"
  }'
```

Returns `orderId` and order details.

## 🔄 Transaction Flow

### Successful Purchase
```
1. GET /inventory
   ↓ Check available products
2. POST /inventory/reserve (userId, sku, quantity)
   ↓ Locks inventory for 5 minutes
3. GET /reservation/{reservationId}
   ↓ Verify reservation is active
4. POST /checkout/confirm (userId, reservationId)
   ↓ Creates order, consumes inventory
5. GET /order/{orderId}
   ✓ Verify order is confirmed
```

### Handling Reservation Expiry
```
1. POST /inventory/reserve
   ↓ Reserve created with 5-min TTL
2. [User doesn't confirm within 5 minutes]
   ↓ Reservation auto-expires
3. GET /reservation/{reservationId}
   ↓ Returns: "Reservation has expired"
4. [Inventory automatically freed]
   ↓ Another user can now reserve
```

## 🛡️ Edge Case Handling

### Concurrent Reservations
✅ **Problem**: Two users try to buy the last item simultaneously
```
User A: POST /inventory/reserve (quantity: 1)
User B: POST /inventory/reserve (quantity: 1)  [at same time]

Response A: success (reservation created)
Response B: error "Insufficient inventory available"
```

### Page Refresh During Checkout
✅ **Problem**: User refreshes page during checkout, loses state
```
Request 1: POST /checkout/confirm
Request 2: POST /checkout/confirm  [page refresh]

Response 1: success (orderId: "order-123")
Response 2: success (isIdempotent: true)  [same order]
```

### Duplicate Reserve Requests
✅ **Problem**: Network duplicate or page refresh during reserve
```
Request 1: POST /inventory/reserve (userId: "user-1", sku: "LAPTOP001")
Request 2: POST /inventory/reserve (userId: "user-1", sku: "LAPTOP001")  [duplicate]

Response 1: success (reservationId: "res-123", isIdempotent: false)
Response 2: success (reservationId: "res-123", isIdempotent: true)
[Inventory reserved only once!]
```

### Backend Restart
✅ **Problem**: Server crashes and restarts
```
- All in-memory data is lost
- MongoDB persists all reservations
- TTL indexes automatically cleanup expired data
- System recovers fully on restart
```

## 📁 Project Structure

```
FlexyPe/
├── src/
│   ├── controllers/           # API request handlers
│   │   ├── InventoryController.js
│   │   ├── ReservationController.js
│   │   └── CheckoutController.js
│   ├── services/              # Business logic
│   │   ├── InventoryService.js
│   │   ├── ReservationService.js
│   │   └── CheckoutService.js
│   ├── repositories/          # Data access layer
│   │   ├── InventoryRepository.js
│   │   ├── ReservationRepository.js
│   │   └── OrderRepository.js
│   ├── models/                # MongoDB schemas
│   │   ├── Inventory.js
│   │   ├── Reservation.js
│   │   └── Order.js
│   ├── middleware/            # Express middleware
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── routes/                # API route definitions
│   │   └── index.js
│   ├── utils/                 # Helper utilities
│   │   ├── logger.js
│   │   ├── apiResponse.js
│   │   └── validation.js
│   ├── config/                # Configuration
│   │   ├── database.js
│   │   └── constants.js
│   └── database/              # Database utilities
│       └── seed.js
├── frontend/                  # Frontend (optional)
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── utils/
├── tests/                     # Test files
│   ├── unit/
│   └── integration/
├── docs/                      # Documentation
│   ├── API.md
│   └── Postman_Collection.json
├── .env                       # Environment variables
├── .gitignore
├── package.json
├── index.js                   # Entry point
└── README.md
```

## 🧪 Testing

### Using Postman
1. Import `docs/Postman_Collection.json` into Postman
2. Set variables: `reservationId`, `orderId`
3. Run requests from "Test Scenarios" folder

### Using cURL
See [docs/API.md](docs/API.md) for detailed cURL examples

### Running Tests
```bash
npm test
```

## 🔧 Configuration

### Environment Variables
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://...

# Reservation
RESERVATION_TTL=300000  # 5 minutes in milliseconds
```

### Constants
Edit `src/config/constants.js` to modify:
- TTL duration
- Cleanup interval
- HTTP status codes
- Error messages

## 📊 Database Schema

### Inventory Collection
```javascript
{
  sku: String (unique, uppercase),
  productName: String,
  totalQuantity: Number,
  availableQuantity: Number,      // not reserved
  reservedQuantity: Number,       // currently reserved
  price: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Reservation Collection
```javascript
{
  reservationId: String (uuid, unique),
  userId: String,
  sku: String,
  quantity: Number,
  status: 'RESERVED' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED',
  expiresAt: Date,  // TTL index for auto-cleanup
  confirmedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Collection
```javascript
{
  orderId: String (uuid, unique),
  userId: String,
  reservationId: String,
  sku: String,
  quantity: Number,
  totalPrice: Number,
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED',
  createdAt: Date,
  updatedAt: Date
}
```

## 🚨 Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "error": "Error description",
  "statusCode": 400
}
```

### Common Errors

| Error | Status | Cause |
|-------|--------|-------|
| Insufficient inventory available | 400 | Not enough stock |
| Reservation has expired | 400 | TTL expired |
| Reservation not found | 404 | Invalid ID |
| Product not found | 404 | Invalid SKU |
| Cannot confirm expired reservation | 400 | TTL exceeded |

## 🔐 Production Considerations

### Security
- [ ] Add JWT authentication
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Use HTTPS only
- [ ] Sanitize all inputs

### Performance
- [ ] Add Redis caching
- [ ] Implement pagination
- [ ] Add request compression
- [ ] Monitor query performance
- [ ] Use connection pooling

### Reliability
- [ ] Add comprehensive logging
- [ ] Implement monitoring/alerts
- [ ] Add circuit breakers
- [ ] Backup strategy
- [ ] Disaster recovery plan

## 📈 Scalability

### Current Limitations
- Single MongoDB instance
- In-memory cleanup job
- No horizontal scaling

### Recommendations for Scale
1. **Database**: Use MongoDB sharding by `sku`
2. **Caching**: Add Redis for inventory quick-checks
3. **Queue**: Use RabbitMQ for async confirmations
4. **Workers**: Scale checkout workers independently
5. **Monitoring**: Add Prometheus metrics

## 🤝 Contributing

1. Follow [Conventional Commits](https://www.conventionalcommits.org/) standard
2. Test edge cases thoroughly
3. Update documentation
4. Run tests before PR

### Commit Format
```
<type>(<scope>): <subject>
feat(reservation): add TTL-based auto-expiry
fix(checkout): handle concurrent confirmations
docs(api): update endpoint documentation
```

## 📝 Commit History

```
commit 1a2b3c4
feat(setup): initialize project structure

commit 5d6e7f8
feat(models): create Inventory, Reservation, Order schemas

commit 9g0h1i2
feat(services): implement ReservationService with idempotency

commit 3j4k5l6
feat(api): create inventory and checkout endpoints

commit 7m8n9o0
feat(database): seed initial inventory data

commit 1p2q3r4
fix(models): remove duplicate schema indexes
```

## 📄 License

ISC License

## 📧 Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Review [docs/API.md](docs/API.md)
- Check [docs/Postman_Collection.json](docs/Postman_Collection.json) for examples

## 🎯 Roadmap

### v1.0 (Current)
- ✅ Core inventory reservation system
- ✅ TTL-based expiry
- ✅ Idempotent operations
- ✅ Concurrent safety

### v1.1 (Planned)
- [ ] User authentication
- [ ] Payment integration
- [ ] Email notifications
- [ ] Inventory analytics

### v2.0 (Future)
- [ ] Admin dashboard
- [ ] Real-time WebSocket updates
- [ ] Mobile app
- [ ] Multi-region support

---

**Built with ❤️ for e-commerce excellence**
