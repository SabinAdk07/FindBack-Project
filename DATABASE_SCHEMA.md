# Database Schema Documentation

## Lost & Found System - MongoDB Schemas

This document describes the database structure for the Lost & Found System.

## Collections

### 1. Users Collection

Stores user account information and authentication details.

```javascript
{
  _id: ObjectId,
  name: String,              // User's full name
  email: String,             // Unique email address
  password: String,          // Hashed password (bcrypt)
  phone: String,             // Optional phone number
  role: String,              // 'user' or 'admin'
  isActive: Boolean,         // Account status
  createdAt: Date,           // Account creation timestamp
  updatedAt: Date            // Last update timestamp
}
```

**Indexes:**
- `email`: Unique index for fast lookups and ensuring uniqueness

**Example:**
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$...",
  "phone": "1234567890",
  "role": "user",
  "isActive": true,
  "createdAt": ISODate("2026-01-15T10:30:00Z"),
  "updatedAt": ISODate("2026-01-15T10:30:00Z")
}
```

### 2. LostItems Collection

Stores information about items that users have lost.

```javascript
{
  _id: ObjectId,
  itemName: String,          // Name/title of the item
  category: String,          // 'Books', 'ID Card', 'Electronics', 'Accessories', 'Other'
  description: String,       // Detailed description (max 1000 chars)
  dateLost: Date,            // Date when item was lost
  location: String,          // Location where item was lost
  image: String,             // Path to uploaded image (optional)
  status: String,            // 'Pending', 'Claimed', 'Resolved'
  postedBy: ObjectId,        // Reference to Users collection
  contactEmail: String,      // Contact email
  contactPhone: String,      // Optional contact phone
  views: Number,             // Number of times viewed
  createdAt: Date,           // Post creation timestamp
  updatedAt: Date            // Last update timestamp
}
```

**Indexes:**
- `postedBy`: Index for user's items queries
- Text index on `itemName`, `description`, `location` for search functionality

**Example:**
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "itemName": "iPhone 13 Pro",
  "category": "Electronics",
  "description": "Black iPhone 13 Pro with cracked screen protector. Has a blue case.",
  "dateLost": ISODate("2026-01-20T00:00:00Z"),
  "location": "Main Library, 2nd Floor",
  "image": "/uploads/image-1234567890.jpg",
  "status": "Pending",
  "postedBy": ObjectId("507f1f77bcf86cd799439011"),
  "contactEmail": "john@example.com",
  "contactPhone": "1234567890",
  "views": 15,
  "createdAt": ISODate("2026-01-21T14:20:00Z"),
  "updatedAt": ISODate("2026-01-21T14:20:00Z")
}
```

### 3. FoundItems Collection

Stores information about items that users have found.

```javascript
{
  _id: ObjectId,
  itemName: String,          // Name/title of the item
  category: String,          // 'Books', 'ID Card', 'Electronics', 'Accessories', 'Other'
  description: String,       // Detailed description (max 1000 chars)
  dateFound: Date,           // Date when item was found
  location: String,          // Location where item was found
  image: String,             // Path to uploaded image (optional)
  status: String,            // 'Pending', 'Claimed', 'Resolved'
  postedBy: ObjectId,        // Reference to Users collection
  contactEmail: String,      // Contact email
  contactPhone: String,      // Optional contact phone
  views: Number,             // Number of times viewed
  createdAt: Date,           // Post creation timestamp
  updatedAt: Date            // Last update timestamp
}
```

**Indexes:**
- `postedBy`: Index for user's items queries
- Text index on `itemName`, `description`, `location` for search functionality

**Example:**
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "itemName": "Student ID Card",
  "category": "ID Card",
  "description": "Found a student ID card near the cafeteria entrance. Name starts with 'S'.",
  "dateFound": ISODate("2026-01-22T00:00:00Z"),
  "location": "Cafeteria Entrance",
  "image": "/uploads/image-1234567891.jpg",
  "status": "Pending",
  "postedBy": ObjectId("507f1f77bcf86cd799439014"),
  "contactEmail": "jane@example.com",
  "contactPhone": "",
  "views": 8,
  "createdAt": ISODate("2026-01-22T16:45:00Z"),
  "updatedAt": ISODate("2026-01-22T16:45:00Z")
}
```

## Relationships

### User to LostItems (One-to-Many)
- A user can post multiple lost items
- Each lost item belongs to one user
- Reference: `LostItems.postedBy` → `Users._id`

### User to FoundItems (One-to-Many)
- A user can post multiple found items
- Each found item belongs to one user
- Reference: `FoundItems.postedBy` → `Users._id`

## Enumerations

### User Roles
- `user`: Regular user with standard permissions
- `admin`: Administrator with elevated permissions

### Item Categories
- `Books`: Textbooks, notebooks, novels
- `ID Card`: Student ID, driver's license, credit cards
- `Electronics`: Phones, laptops, tablets, earbuds
- `Accessories`: Bags, wallets, keys, jewelry
- `Other`: Items not fitting other categories

### Item Status
- `Pending`: Item not yet claimed or resolved
- `Claimed`: Someone has claimed the item (verification pending)
- `Resolved`: Item successfully returned to owner

## Data Validation

### Users
- `name`: Required, trimmed
- `email`: Required, unique, valid email format, lowercase
- `password`: Required, minimum 6 characters, hashed before storage
- `phone`: Optional
- `role`: Defaults to 'user'
- `isActive`: Defaults to true

### LostItems / FoundItems
- `itemName`: Required, trimmed
- `category`: Required, must be one of the enum values
- `description`: Required, max 1000 characters
- `dateLost/dateFound`: Required, valid date
- `location`: Required, trimmed
- `image`: Optional, validated file types (jpg, jpeg, png, gif, webp)
- `status`: Defaults to 'Pending'
- `postedBy`: Required, valid user reference
- `contactEmail`: Required, valid email
- `contactPhone`: Optional
- `views`: Defaults to 0

## Query Patterns

### Common Queries

1. **Find items by category**
```javascript
db.lostitems.find({ category: "Electronics" })
```

2. **Find items by status**
```javascript
db.lostitems.find({ status: "Pending" })
```

3. **Find items by user**
```javascript
db.lostitems.find({ postedBy: ObjectId("...") })
```

4. **Text search**
```javascript
db.lostitems.find({ $text: { $search: "iPhone" } })
```

5. **Find items by date range**
```javascript
db.lostitems.find({
  dateLost: {
    $gte: ISODate("2026-01-01"),
    $lte: ISODate("2026-01-31")
  }
})
```

6. **Find recent items**
```javascript
db.lostitems.find().sort({ createdAt: -1 }).limit(10)
```

7. **Get user with populated items**
```javascript
// Using Mongoose populate
LostItem.find().populate('postedBy', 'name email')
```

## Performance Considerations

1. **Indexes**: Text indexes on searchable fields improve search performance
2. **Pagination**: Use skip() and limit() for large result sets
3. **Projection**: Select only needed fields to reduce data transfer
4. **Aggregation**: Use aggregation pipeline for complex queries

## Backup and Maintenance

### Recommended Backup Strategy
- Daily automated backups
- Incremental backups every 6 hours
- Keep backups for 30 days
- Test restore procedures monthly

### Database Maintenance
- Monitor index usage and performance
- Clean up old resolved items periodically
- Archive items older than 1 year
- Monitor storage usage and optimize images

## Security

1. **Password Storage**: Always use bcrypt hashing
2. **Access Control**: Implement role-based access control
3. **Input Validation**: Validate all input before database operations
4. **Query Injection**: Use parameterized queries (Mongoose does this)
5. **Data Sanitization**: Sanitize user input to prevent XSS

## Migration Scripts

### Creating Indexes
```javascript
// Text search indexes
db.lostitems.createIndex({ 
  itemName: "text", 
  description: "text", 
  location: "text" 
})

db.founditems.createIndex({ 
  itemName: "text", 
  description: "text", 
  location: "text" 
})

// User items index
db.lostitems.createIndex({ postedBy: 1 })
db.founditems.createIndex({ postedBy: 1 })

// Email unique index
db.users.createIndex({ email: 1 }, { unique: true })
```

### Sample Data for Testing
```javascript
// Create test user
db.users.insertOne({
  name: "Test User",
  email: "test@example.com",
  password: "$2a$10$...", // Hashed password
  phone: "1234567890",
  role: "user",
  isActive: true
})

// Create test lost item
db.lostitems.insertOne({
  itemName: "Test Item",
  category: "Books",
  description: "This is a test item",
  dateLost: new Date(),
  location: "Test Location",
  status: "Pending",
  postedBy: ObjectId("..."),
  contactEmail: "test@example.com",
  views: 0
})
```
