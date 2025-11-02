# Pinterest-like Server

A Firebase Cloud Functions-based backend server for a Pinterest-like application, deployed in Asia region (Mumbai) for optimal performance. This server provides RESTful APIs for user authentication, post management, comments, and user interactions.

## 🚀 Features

- 👤 User Authentication (Sign up, Login, Profile management)
- 📌 Post Management (Create, Read, Update, Delete)
- 💬 Comment System
- 🖼️ Image Upload with Cloudinary
- 🌐 Deployed on Firebase Cloud Functions (asia-south1 region)
- 📦 MongoDB Database Integration
- 🔒 JWT-based Authentication
- ⚡ Optimized Performance with Minimum Instances
## �️ Technology Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Cloud Platform**: Firebase Cloud Functions (2nd Gen)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Image Storage**: Cloudinary
- **Service Location**: Asia South 1 (Mumbai)
- **Other Tools**: 
  - Firebase Admin SDK
  - CORS (Cross-Origin Resource Sharing)
  - Cookie Parser
  - Express Validator
  - Cloudinary SDK

## � Security Features

- JWT-based Authentication
- Secure Cookie Management
- CORS Configuration (Configured for frontend domain)
- Request Validation using Express Validator
- Error Handling Middleware
- Secure Environment Variables
- Firebase Security Rules

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

```
src/
├── index.js                # Main entry point for Firebase Functions
├── app.js                  # Express app configuration
├── functions/
│   └── express-api.js      # Express API function (asia-south1 region)
├── controllers/
│   ├── auth.js            # Authentication controllers
│   ├── post.js            # Post management controllers
│   ├── comment.js         # Comment controllers
│   └── user.js            # User controllers
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── post.js            # Post routes
│   ├── comment.js         # Comment routes
│   └── user.js            # User routes
├── middleware/
│   └── index.js           # Authentication middleware
├── utils/
│   ├── auth.utils.js      # Authentication utilities
│   ├── cloudinary.js      # Cloudinary configuration
│   ├── db.utils.js        # Database utilities
│   └── token.js           # JWT token utilities
└── db/
    ├── index.js           # Database connection
    └── schema/            # MongoDB schemas
        ├── User.js
        ├── Post.js
        └── Comment.js
```

## 📌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get specific post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Comments
- `GET /api/comments/:postId` - Get comments for a post
- `POST /api/comments/:postId` - Add comment to post
- `DELETE /api/comments/:id` - Delete comment

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## ⚙️ Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ravindra-24/PinterestLike-server.git
   cd PinterestLike-server
   ```

2. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Firebase Setup**
   ```bash
   firebase login
   firebase init functions
   ```

5. **Environment Setup**
   Create a `.env` file in the root directory with:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

6. **Local Development**
   ```bash
   npm run serve
   ```

## 🚀 Deployment

Deploy to Firebase Cloud Functions:
```bash
firebase deploy --only functions
```

The API will be available at:
```
https://asia-south1-pinterest-server.cloudfunctions.net/expressApi
```

## ⚡ Performance Configuration

- **Region**: Asia South 1 (Mumbai)
- **Memory**: 512MB
- **Timeout**: 540 seconds
- **Minimum Instances**: 1 (for reduced cold starts)
- **Maximum Instances**: Auto-scaled based on load

## 🔐 Security Features

The server is configured to accept requests from: `https://pinterest-clone-tau.vercel.app`

---