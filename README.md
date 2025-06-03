# EstateX - Premium Property Portal for Brokers

EstateX is a subscription-based property portal designed specifically for real estate brokers. It provides a modern platform for managing property listings, client interactions, and location-based subscriptions.

## Features

### For Brokers
- 🏠 Property Listing Management
- 📍 Location-based Subscriptions
- 📱 WhatsApp Integration for Property Sharing
- 🗺️ Google Maps Integration
- 📊 Property Analytics
- 💼 Inventory Management

### For Admins
- 👥 Broker Management
- ✅ Property Approval Workflow
- 📈 Advanced Analytics
- 💰 Subscription Management
- 🔍 Audit Trails

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- RESTful API

### Frontend
- React.js
- React Router
- Tailwind CSS
- Google Maps API
- Axios

## Getting Started

### Prerequisites
- Node.js >= 14.0.0
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/estatex.git
cd estatex
\`\`\`

2. Install dependencies:
\`\`\`bash
npm run install:all
\`\`\`

3. Configure environment variables:
- Copy \`.env.example\` to \`.env\` in both frontend and backend directories
- Update the variables with your configuration

4. Start the development servers:
\`\`\`bash
npm start
\`\`\`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

\`\`\`
estatex/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── server.js        # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── App.js      # Main app component
│   │   └── index.js    # Entry point
│   └── public/         # Static files
└── package.json       # Root package.json
\`\`\`

## API Documentation

### Authentication
- POST /api/auth/signup - Register new broker
- POST /api/auth/login - Login broker
- GET /api/auth/profile - Get broker profile

### Properties
- GET /api/property - Get properties
- POST /api/property - Add new property
- PUT /api/property/:id - Update property
- DELETE /api/property/:id - Delete property

### Subscriptions
- GET /api/subscription - Get subscription details
- POST /api/subscription - Create subscription
- PUT /api/subscription/:id - Update subscription

### Admin Routes
- GET /api/admin/stats - Get dashboard statistics
- GET /api/admin/brokers - Get all brokers
- GET /api/admin/properties - Get all properties

## Environment Variables

### Backend
\`\`\`env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_MAPS_API_KEY=your_api_key
\`\`\`

### Frontend
\`\`\`env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Maps API for location services
- Tailwind CSS for styling
- MongoDB Atlas for database hosting

## Support

For support, email support@estatex.com or join our Slack channel.
