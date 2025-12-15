# AgriYieldChain

A blockchain-based platform for transparent agricultural yield registration and verification.

## Overview

AgriYieldChain provides a decentralized solution for recording, verifying, and accessing agricultural yield data. Built on blockchain technology with IPFS for document storage, the platform ensures data immutability, transparency, and trust in agricultural supply chains.

## Features

### Core Functionality
- **Blockchain Integration**: Immutable yield records stored on-chain
- **Smart Contracts**: Automated verification workflows with role-based access
- **IPFS Storage**: Decentralized document storage for supporting files
- **Multi-Role System**: Separate dashboards for farmers, verifiers, and public access
- **Real-Time Analytics**: Track yields, trends, and production statistics

### User Roles
1. **Farmers**: Submit yield records with supporting documentation
2. **Verifiers**: Review and approve/reject submissions on-chain
3. **Public**: Access verified data through the transparent explorer

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Database**: Neon (PostgreSQL)
- **Blockchain**: Ethereum (Solidity 0.8.20)
- **Storage**: IPFS for decentralized document storage
- **Authentication**: Web3 wallet-based (MetaMask)
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Neon database account

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd agriyieldchain
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
# Database (automatically configured via Neon integration)
DATABASE_URL=your_neon_database_url

# Blockchain (set after contract deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address

# Optional: IPFS Configuration
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
IPFS_PROJECT_ID=your_ipfs_project_id
IPFS_PROJECT_SECRET=your_ipfs_secret
\`\`\`

4. Run database migrations
\`\`\`bash
# The SQL scripts in /scripts will set up your database
# Run them through the v0 interface or your database client
\`\`\`

5. Start the development server
\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:3000 to see the application.

## Smart Contract Deployment

### Local Development (Hardhat)

1. Install Hardhat
\`\`\`bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
\`\`\`

2. Start local blockchain
\`\`\`bash
npx hardhat node
\`\`\`

3. Deploy contract
\`\`\`bash
npx hardhat run scripts/deploy.js --network localhost
\`\`\`

4. Update environment variable with deployed contract address

### Testnet Deployment

See \`contracts/DEPLOYMENT.md\` for detailed deployment instructions for:
- Sepolia testnet
- Polygon Mumbai testnet
- Mainnet deployment

## Project Structure

\`\`\`
agriyieldchain/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard pages (farmer, verifier)
│   ├── explorer/         # Public explorer
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # Reusable UI components
│   ├── ipfs-upload.tsx   # IPFS upload component
│   └── wallet-connect.tsx # Wallet connection
├── contracts/
│   ├── AgriYieldChain.sol # Main smart contract
│   ├── DEPLOYMENT.md     # Deployment guide
│   └── hardhat.config.json
├── lib/
│   ├── blockchain.ts     # Blockchain utilities
│   ├── db.ts             # Database utilities
│   └── ipfs.ts           # IPFS utilities
└── scripts/
    ├── 01-create-tables.sql  # Database schema
    ├── 02-seed-data.sql      # Sample data
    └── deploy-contract.ts    # Deployment helper
\`\`\`

## Usage

### For Farmers

1. Connect your MetaMask wallet
2. Register as a farmer
3. Submit yield records with:
   - Crop type and quantity
   - Harvest date and location
   - Supporting documents (uploaded to IPFS)
4. Track verification status in your dashboard

### For Verifiers

1. Connect your MetaMask wallet
2. Register as a verifier
3. Review pending submissions
4. Approve or reject with remarks
5. All actions recorded on blockchain

### For Public Access

1. Visit the Explorer (no wallet required)
2. Search and filter yield records
3. View verified data and blockchain details
4. Access IPFS documents
5. Track agricultural trends

## API Endpoints

### Users
- \`GET /api/users?wallet={address}\` - Get user by wallet
- \`POST /api/users\` - Register new user

### Yields
- \`GET /api/yields?farmer_id={id}\` - Get farmer's yields
- \`GET /api/yields?status=pending\` - Get pending yields
- \`POST /api/yields\` - Submit new yield
- \`POST /api/yields/{id}/verify\` - Verify yield

### Analytics
- \`GET /api/analytics?type=summary\` - Get statistics summary
- \`GET /api/analytics?type=crop-distribution\` - Get crop distribution

### IPFS
- \`POST /api/ipfs/upload\` - Upload files to IPFS

## Smart Contract Functions

### User Management
- \`registerUser(name, email, role)\` - Register new user
- \`updateUserRole(address, role)\` - Update user role (admin only)

### Yield Management
- \`submitYield(cropType, quantity, harvestDate, location, ipfsHash)\` - Submit yield
- \`verifyYield(yieldId, status, remarks)\` - Verify yield
- \`getYieldRecord(yieldId)\` - Get yield details
- \`getFarmerYields(address)\` - Get farmer's yields

## Security Considerations

- All blockchain transactions require gas fees
- Wallet signatures required for all write operations
- Role-based access control enforced on-chain
- Input validation on both frontend and smart contract
- IPFS hashes stored on-chain for document integrity

## Production Deployment

### Checklist

- [ ] Deploy smart contract to production network
- [ ] Update \`NEXT_PUBLIC_CONTRACT_ADDRESS\` environment variable
- [ ] Set up IPFS service (Pinata, NFT.Storage, or Web3.Storage)
- [ ] Configure IPFS credentials in environment variables
- [ ] Run database migrations on production database
- [ ] Test all workflows end-to-end
- [ ] Set up blockchain explorer links
- [ ] Configure proper CORS and security headers
- [ ] Enable rate limiting for API routes
- [ ] Set up monitoring and error tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: admin@agriyieldchain.com

## Acknowledgments

- Built with Next.js and Vercel
- Blockchain integration powered by ethers.js
- UI components from shadcn/ui
- Database powered by Neon
- Decentralized storage via IPFS

---

Built with blockchain technology for a transparent agricultural future.
\`\`\`
