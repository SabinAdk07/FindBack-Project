# Lost & Found System

A comprehensive web-based Lost & Found management system built with modern web technologies. This system allows users to report lost or found items, search for matches, and connect with others to reunite items with their owners.

## 🌟 Features

- **User Authentication**: Secure JWT-based authentication system
- **Item Management**: Post and manage lost/found items
- **Advanced Search**: Filter items by category, date, location, and status
- **Image Upload**: Upload images of items for better identification
- **Email Notifications**: Get notified of potential matches
- **Dashboard**: Personalized dashboard to manage your items
- **Admin Panel**: Administrative controls for managing users and items
- **Responsive Design**: Mobile-friendly interface with modern UI

## 🛠 Tech Stack

### Frontend
- HTML5
- CSS3 (Modern responsive design)
- Vanilla JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer (File uploads)
- Nodemailer (Email notifications)

## 📁 Project Structure

```
lost-and-found/
├── backend/
│   ├── config/
│   │   ├── db.js                 # Database configuration
│   │   └── jwt.js                # JWT utilities
│   ├── models/
│   │   ├── User.js               # User model
│   │   ├── LostItem.js           # Lost item model
│   │   └── FoundItem.js          # Found item model
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── lostItemController.js # Lost items logic
│   │   ├── foundItemController.js# Found items logic
│   │   └── adminController.js    # Admin logic
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── lostItems.js          # Lost items routes
│   │   ├── foundItems.js         # Found items routes
│   │   └── admin.js              # Admin routes
│   ├── middleware/
│   │   ├── auth.js               # Auth middleware
│   │   └── upload.js             # File upload middleware
│   ├── utils/
│   │   └── emailService.js       # Email utilities
│   ├── uploads/                  # Uploaded images directory
│   ├── .env                      # Environment variables
│   ├── server.js                 # Main server file
│   └── package.json
│
└── frontend/
    ├── css/
    │   └── style.css             # Main stylesheet
    ├── js/
    │   ├── main.js               # Common utilities
    │   ├── auth.js               # Authentication
    │   ├── lostItems.js          # Lost items functionality
    │   ├── foundItems.js         # Found items functionality
    │   └── dashboard.js          # Dashboard functionality
    ├── index.html                # Home page
    ├── lost-items.html           # Report lost item
    ├── found-items.html          # Report found item
    ├── dashboard.html            # User dashboard
    └── login.html                # Login/Signup page
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Configure Environment Variables**

Edit the `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lost-and-found

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=Lost & Found <noreply@lostandfound.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Upload Configuration
MAX_FILE_SIZE=5242880
```

4. **Start MongoDB**

Make sure MongoDB is running on your system:
```bash
mongod
```

5. **Create uploads directory**
```bash
mkdir uploads
```

6. **Start the Backend Server**
```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend server will start on http://localhost:5000

7. **Serve the Frontend**

You can use any static file server. Here are a few options:

**Option A: Using Live Server (VS Code Extension)**
- Install "Live Server" extension in VS Code
- Right-click on `index.html` and select "Open with Live Server"

**Option B: Using Python's HTTP Server**
```bash
cd frontend
python -m http.server 3000
```

**Option C: Using Node's http-server**
```bash
npm install -g http-server
cd frontend
http-server -p 3000
```

The frontend will be available at http://localhost:3000

## 📖 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "John Updated",
  "phone": "0987654321"
}
```

### Lost Items Endpoints

#### Get All Lost Items
```
GET /api/lost-items?category=Books&status=Pending&search=phone
```

#### Get Single Lost Item
```
GET /api/lost-items/:id
```

#### Create Lost Item
```
POST /api/lost-items
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
{
  "itemName": "iPhone 13",
  "category": "Electronics",
  "description": "Black iPhone 13 Pro",
  "dateLost": "2026-01-20",
  "location": "Library",
  "contactPhone": "1234567890",
  "image": <file>
}
```

#### Update Lost Item
```
PUT /api/lost-items/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
{
  "status": "Resolved"
}
```

#### Delete Lost Item
```
DELETE /api/lost-items/:id
Authorization: Bearer <token>
```

#### Get My Lost Items
```
GET /api/lost-items/user/my-items
Authorization: Bearer <token>
```

### Found Items Endpoints

#### Get All Found Items
```
GET /api/found-items?category=Books&status=Pending&search=phone
```

#### Get Single Found Item
```
GET /api/found-items/:id
```

#### Create Found Item
```
POST /api/found-items
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
{
  "itemName": "iPhone 13",
  "category": "Electronics",
  "description": "Black iPhone 13 Pro",
  "dateFound": "2026-01-20",
  "location": "Library",
  "contactPhone": "1234567890",
  "image": <file>
}
```

#### Update Found Item
```
PUT /api/found-items/:id
Authorization: Bearer <token>
```

#### Delete Found Item
```
DELETE /api/found-items/:id
Authorization: Bearer <token>
```

#### Get My Found Items
```
GET /api/found-items/user/my-items
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get Dashboard Stats
```
GET /api/admin/stats
Authorization: Bearer <token> (admin only)
```

#### Get All Users
```
GET /api/admin/users
Authorization: Bearer <token> (admin only)
```

#### Update User
```
PUT /api/admin/users/:id
Authorization: Bearer <token> (admin only)
```

#### Delete User
```
DELETE /api/admin/users/:id
Authorization: Bearer <token> (admin only)
```

#### Get All Items
```
GET /api/admin/items
Authorization: Bearer <token> (admin only)
```

## 🎨 UI Features

- **Modern Color Theme**: Blue/White/Green school-friendly colors
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Interactive Cards**: Hover effects and smooth animations
- **Modal Dialogs**: Clean item detail views
- **Status Badges**: Visual indicators for item status
- **Category Icons**: Intuitive category representation

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes and endpoints
- Input validation
- File upload restrictions
- CORS configuration

## 📧 Email Notifications

The system can send email notifications when:
- A potential match is found between lost and found items
- Item status changes
- New messages are received

Configure your email settings in the `.env` file to enable this feature.

## 👤 User Roles

### Regular User
- Post lost items
- Post found items
- Search and browse items
- Contact item posters
- Manage own items

### Admin User
- All user permissions
- View dashboard statistics
- Manage all users
- Manage all items
- Delete any content

To create an admin user, manually update the `role` field in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the connection string in `.env`
- Verify network connectivity

### File Upload Issues
- Check the `uploads` directory exists
- Verify file size limits in `.env`
- Ensure proper permissions on uploads folder

### CORS Issues
- Update `FRONTEND_URL` in `.env`
- Check CORS configuration in `server.js`

### Email Not Sending
- Verify email credentials in `.env`
- For Gmail, enable "Less secure app access" or use App Password
- Check spam folder for test emails

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create a Heroku app
2. Set environment variables
3. Deploy the backend folder
4. Use MongoDB Atlas for database

### Frontend Deployment (Netlify/Vercel)
1. Update API_URL in frontend JavaScript files
2. Deploy the frontend folder
3. Configure redirects if needed

## 📝 Future Enhancements

- Real-time chat between users
- Push notifications
- Advanced matching algorithm
- QR code generation
- Multi-language support
- Social media integration
- Analytics dashboard
- Mobile app (React Native)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Support

For support, email support@lostandfound.com or create an issue in the repository.

## 🙏 Acknowledgments

- Icons and emojis from Unicode Consortium
- Design inspiration from modern web applications
- Community feedback and testing

---

Built with ❤️ for helping people reunite with their lost items!
