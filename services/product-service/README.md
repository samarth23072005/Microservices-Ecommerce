# Product Service Microservice

A dedicated, independently deployable microservice for managing product catalog items, categories, full-text product search, and stock inventory levels.

---

## 1. Service Specification

- **Runtime**: Node.js (v18+) & Express.js
- **Database**: MongoDB (`product_db`) via Mongoose ODM
- **Default Port**: `5002`
- **Architectural Isolation**: Database-per-Service (owns all catalog & stock data)

---

## 2. Environment Configuration

Create a `.env` file in `services/product-service/` based on [`.env.example`](./.env.example):

```env
PORT=5002
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/product_db
ALLOWED_ORIGIN=*
```

---

## 3. Installation & Execution

### Install Dependencies
```bash
cd services/product-service
npm install
```

### Seed Product Dataset (DummyJSON Integration)
Populate the database with 100 products from [DummyJSON](https://dummyjson.com/products?limit=100) (prevents duplicates and preserves existing records):
```bash
npm run seed
```

### Start Service in Development Mode (Live Reload)
```bash
npm run dev
```

### Start Service in Production Mode
```bash
npm start
```

---

## 4. Verifying Imported Products

Once the service is running, you can verify the imported dataset using the following endpoints:

1. **Verify Total Imported Count & Pagination**:
   ```bash
   curl "http://localhost:5002/api/products?page=1&limit=20"
   ```
   *Returns pagination metadata: `total`, `page`, `pages`, and the first 20 products.*

2. **Retrieve High Limit (e.g., all 100 products)**:
   ```bash
   curl "http://localhost:5002/api/products?limit=100"
   ```

3. **Verify Category Filtering** (e.g., beauty, smartphones, laptops, fragrances, groceries):
   ```bash
   curl "http://localhost:5002/api/products?category=beauty"
   ```

4. **Verify Full-Text Search**:
   ```bash
   curl "http://localhost:5002/api/products/search?q=mascara"
   ```

5. **Verify Single Product by ID**:
   ```bash
   curl "http://localhost:5002/api/products/<product_id>"
   ```

---

## 4. Product Listing & Search API Specification

### Query Parameters for `GET /api/products` & `GET /api/products/search`

| Parameter | Type | Default | Constraints / Allowed Values | Description |
| :--- | :---: | :---: | :--- | :--- |
| `page` | Integer | `1` | $\ge 1$ | Target page number |
| `limit` | Integer | `10` | $1 \le \text{limit} \le 100$ | Number of products per page |
| `category` | String | None | Case-insensitive string | Filter by exact category (e.g. `smartphones`, `beauty`) |
| `sort` | String | `newest` | `price_asc`, `price_desc`, `newest`, `oldest`, `name_asc`, `name_desc` | Sort order specification |
| `q` | String | None | Non-empty string | Keyword search across product `name` and `description` |
| `minPrice` | Number | None | $\ge 0$ | Minimum price filter |
| `maxPrice` | Number | None | $\ge 0$, $\ge \text{minPrice}$ | Maximum price filter |
| `inStock` | Boolean | None | `true` | Filter for products with stock $> 0$ |

---

## 5. API Endpoints

| Method | Endpoint | Description | Request Body / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Service health & MongoDB status | None |
| `GET` | `/api/products` | Advanced listing with pagination, category filter & sorting | `?category=&sort=&page=1&limit=10` |
| `GET` | `/api/products/search` | Search products across name & description with filters | `?q=phone&category=&sort=&page=1&limit=10` |
| `GET` | `/api/products/:id` | Retrieve single product by ID | None |
| `POST` | `/api/products` | Create a new product | JSON body with product fields |
| `PUT` | `/api/products/:id` | Update product fields | JSON body with fields to modify |
| `DELETE`| `/api/products/:id` | Delete product by ID | None |
| `POST` | `/api/products/:id/deduct-stock` | Atomic stock reservation (Used by Order Service) | `{"quantity": 2}` |
| `POST` | `/api/products/:id/release-stock`| Atomic stock restoral (Used by Order Service) | `{"quantity": 2}` |

---

## 6. Response Format & Examples

### Advanced Listing Response (`GET /api/products?category=smartphones&sort=price_asc&page=1&limit=2`)
```json
{
  "success": true,
  "count": 2,
  "totalProducts": 5,
  "totalPages": 3,
  "currentPage": 1,
  "hasNextPage": true,
  "hasPrevPage": false,
  "pagination": {
    "totalProducts": 5,
    "totalPages": 3,
    "currentPage": 1,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 2,
    "total": 5,
    "page": 1,
    "pages": 3
  },
  "data": [
    {
      "_id": "672f7a90b411d51a2e88a001",
      "name": "iPhone 13",
      "description": "Super Retina XDR display with A15 Bionic chip.",
      "price": 699,
      "category": "smartphones",
      "stock": 32,
      "image": "https://cdn.dummyjson.com/products/images/smartphones/iPhone%2013/thumbnail.png",
      "imageUrl": "https://cdn.dummyjson.com/products/images/smartphones/iPhone%2013/thumbnail.png",
      "sourceId": "1",
      "createdAt": "2026-11-12T03:00:00.000Z",
      "updatedAt": "2026-11-12T03:00:00.000Z"
    }
  ]
}
```

### Validation Error Response (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Query parameter validation failed",
  "errors": [
    "Invalid 'page' parameter: must be a positive integer greater than or equal to 1.",
    "Invalid 'limit' parameter: must be an integer between 1 and 100.",
    "Invalid 'sort' parameter 'invalid_sort'. Allowed values are: price_asc, price_desc, newest, oldest, name_asc, name_desc."
  ]
}
```

---

## 5. Sample Request & Response Payloads

### POST `/api/products`
```json
{
  "name": "Sony WH-1000XM5 Wireless Headphones",
  "description": "Premium noise cancelling headphones with LDAC codec support.",
  "price": 399.99,
  "category": "audio",
  "stock": 45,
  "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
}
```

Response (`201 Created`):
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "672f7a90b411d51a2e88a001",
    "name": "Sony WH-1000XM5 Wireless Headphones",
    "description": "Premium noise cancelling headphones with LDAC codec support.",
    "price": 399.99,
    "category": "audio",
    "stock": 45,
    "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    "createdAt": "2026-11-09T16:20:00.000Z",
    "updatedAt": "2026-11-09T16:20:00.000Z"
  }
}
```
