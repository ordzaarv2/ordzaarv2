# Ordzaar - Bitcoin Ordinals NFT Marketplace

Ordzaar is a modern, user-friendly marketplace for Bitcoin Ordinals NFTs. It provides a platform for creators and collectors to mint, buy, sell, and manage digital assets on the Bitcoin blockchain.

## Quick Start

```bash

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install

# Start the backend server (keep it running)
npm start

# In a new terminal, start the frontend
cd ..
npm run dev

# Open http://localhost:3000 in your browser
```

Note: You'll need MongoDB running locally or a MongoDB Atlas connection. See the MongoDB Setup section below for details.

## Features

- Browse and view collections of Bitcoin Ordinals
- View individual Ordinals with detailed information
- Real-time marketplace statistics
- Connect with popular Bitcoin wallets (UniSat, Xverse)
- Mint new Ordinals directly from collections
- Buy and sell Ordinals
- Admin dashboard for collection management

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Blockchain Integration**: LaserEyes Core for Bitcoin wallet connectivity

## Installation and Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB instance (local or remote)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ordzaarv2.git
cd ordzaarv2
```

2. Install dependencies for the frontend:

```bash
npm install
```

3. Install dependencies for the backend server:

```bash
cd server
npm install
cd ..
```

### Configuration

1. Create a `.env.local` file in the root directory with the following content:

```
# Client-side environment variables
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

2. Create a `.env` file in the `server` directory with the following content:

```
# Server Configuration
PORT=5000
NODE_ENV=development
SERVER_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/ordzaar

# API Configuration
API_URL=http://localhost:5000/api/v1
CORS_ORIGIN=http://localhost:3000
```

### MongoDB Setup

The application requires MongoDB to store collection and ordinal data. You can either:

1. **Install MongoDB locally**:
   - [Download and install MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Start the MongoDB service
   - The default connection string `mongodb://localhost:27017/ordzaar` should work

2. **Use MongoDB Atlas (cloud)**:
   - [Sign up for a free MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register)
   - Create a new cluster
   - Get your connection string and update it in the `.env` file in the server directory
   - Allow network access from your IP address

### Running the Application

1. Start the backend server:

```bash
cd server
npm start
```

2. In a new terminal, start the frontend development server:

```bash
# From the root directory
npm run dev
```

3. Access the application in your browser at `http://localhost:3000`

## Project Structure

```
ordzaarv2/
├── app/                  # Next.js pages and routes
│   ├── collections/      # Collections pages
│   ├── ordinals/         # Ordinals pages
│   ├── market-stats/     # Market statistics page
│   └── admin/            # Admin dashboard
├── components/           # React components
│   ├── layout/           # Layout components (Navbar, etc.)
│   └── MarketStats.tsx   # Market statistics component
├── lib/                  # Utilities and shared code
│   ├── api/              # API client code
│   ├── wallet/           # Wallet integration
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Utility functions
├── server/               # Backend server
│   ├── src/              # Server source code
│   │   ├── controllers/  # API controllers
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   └── index.ts      # Server entry point
│   └── package.json      # Server dependencies
└── package.json          # Frontend dependencies
```

## Using the Wallet Integration

Ordzaar integrates with Bitcoin wallets using the LaserEyes Core library. To use this feature:

1. Click on the "Connect Wallet" button in the navigation bar
2. Select a wallet provider (UniSat or Xverse)
3. Approve the connection request in your wallet extension
4. Once connected, you can:
   - View your Bitcoin balance
   - Mint new Ordinals
   - Purchase existing Ordinals

### Troubleshooting Wallet Connections

If you experience issues with wallet connections:

1. **Browser Requirements**:
   - Ensure you're using a modern browser (Chrome, Firefox, Edge)
   - Check that you have the wallet extension installed and enabled

2. **Wallet Extension Issues**:
   - Make sure your wallet extension is up to date
   - For UniSat, version 1.1.0 or higher is recommended
   - For Xverse, version 0.5.0 or higher is recommended

3. **Connection Problems**:
   - If the wallet connection fails, try refreshing the page
   - Ensure your wallet is on the correct network (mainnet by default)
   - Try disconnecting and reconnecting the wallet

4. **Balance Not Showing**:
   - If your balance doesn't appear, disconnect and reconnect
   - The balance is displayed in BTC (not satoshis)

5. **Transaction Errors**:
   - Ensure you have sufficient balance for the transaction
   - Check that your wallet is properly connected before attempting transactions

## Development

### Backend API

The backend API is built with Express and provides endpoints for:

- Collections management
- Ordinals data
- Market statistics
- User authentication (coming soon)
- Transaction processing (coming soon)

The API is accessible at `http://localhost:5000/api/v1`.

### Frontend

The frontend is built with Next.js and Tailwind CSS, providing:

- Server-side rendering for better SEO
- Client-side navigation for a smooth user experience
- Responsive design for all devices
- Integration with Bitcoin wallets

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [LaserEyes Core](https://github.com/omnisat/lasereyes-core) for Bitcoin wallet integration
- The Bitcoin Ordinals community for inspiration and support 