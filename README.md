# Pinterest-Like Server

A robust backend server implementation for a Pinterest-like application, built with Node.js and Express.

## Features

- 👤 User Authentication (Register/Login)
- 📌 Post Management (Create, Read, Update, Delete)
- 💬 Comment System
- 🖼️ Image Upload with Cloudinary
- 🔒 JWT-based Authentication
- 🗄️ MongoDB Database Integration
- ⚡ CORS Support
- 🍪 Cookie-based Session Management

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Image Storage**: Cloudinary
- **Build Tool**: Webpack
- **Other Tools**: 
  - cors (Cross-Origin Resource Sharing)
  - cookie-parser (Cookie handling)
  - express-validator (Input validation)
  - multer (File upload handling)

## Project Structure

```
├── src/
│   ├── controllers/      # Request handlers
│   │   ├── auth.js      # Authentication controllers
│   │   ├── comment.js   # Comment management
│   │   ├── post.js      # Post management
│   │   └── user.js      # User management
│   ├── db/
│   │   ├── index.js     # Database connection
│   │   └── schema/      # MongoDB schemas
│   ├── middleware/      # Custom middleware
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── index.js        # Application entry point
├── logs/              # Application logs
├── package.json       # Project dependencies
├── vercel.json       # Vercel deployment config
└── webpack.config.js  # Webpack configuration
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Posts
- `GET /post` - Get all posts
- `POST /post` - Create new post
- `PUT /post/:id` - Update post
- `DELETE /post/:id` - Delete post

### Comments
- `POST /comment` - Add comment
- `GET /comment/:postId` - Get comments for post
- `DELETE /comment/:id` - Delete comment

### Users
- `GET /user/:id` - Get user profile
- `PUT /user/:id` - Update user profile

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PinterestLike-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=8080
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Start production server**
   ```bash
   npm start
   ```

## Deployment

The project is configured for deployment on Vercel with the included `vercel.json` configuration file.

## CORS Configuration

The server is configured to accept requests from: `https://pinterest-clone-tau.vercel.app`

---