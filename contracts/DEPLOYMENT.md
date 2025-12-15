# AgriYieldChain Smart Contract Deployment Guide

## Prerequisites

1. Install Hardhat: `npm install --save-dev hardhat`
2. Install dependencies: `npm install --save-dev @nomicfoundation/hardhat-toolbox ethers`
3. Install MetaMask browser extension
4. Get test ETH from a faucet (for testnets)

## Local Development

### 1. Start Local Hardhat Network
\`\`\`bash
npx hardhat node
\`\`\`

This will start a local Ethereum network at `http://127.0.0.1:8545/` and provide you with 20 test accounts.

### 2. Deploy Contract Locally
\`\`\`bash
npx hardhat run scripts/deploy.js --network localhost
\`\`\`

### 3. Configure MetaMask
- Network Name: Hardhat Local
- RPC URL: http://127.0.0.1:8545
- Chain ID: 1337
- Currency Symbol: ETH

Import one of the test accounts into MetaMask using the private key provided.

## Testnet Deployment (Sepolia)

### 1. Get Sepolia Test ETH
- Visit: https://sepoliafaucet.com/
- Or: https://www.alchemy.com/faucets/ethereum-sepolia

### 2. Configure Network
Update `hardhat.config.js` with your private key and Alchemy/Infura API key:

\`\`\`javascript
networks: {
  sepolia: {
    url: `https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY`,
    accounts: [`0x${YOUR_PRIVATE_KEY}`]
  }
}
\`\`\`

### 3. Deploy to Sepolia
\`\`\`bash
npx hardhat run scripts/deploy.js --network sepolia
\`\`\`

### 4. Verify Contract (Optional)
\`\`\`bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
\`\`\`

## Mainnet Deployment

⚠️ **Warning**: Deploying to mainnet requires real ETH. Make sure you've thoroughly tested on testnets first.

### 1. Configure Mainnet Network
\`\`\`javascript
networks: {
  mainnet: {
    url: `https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY`,
    accounts: [`0x${YOUR_PRIVATE_KEY}`]
  }
}
\`\`\`

### 2. Deploy to Mainnet
\`\`\`bash
npx hardhat run scripts/deploy.js --network mainnet
\`\`\`

## Polygon Deployment (Recommended for Lower Gas Fees)

### 1. Get MATIC Tokens
- Testnet: https://faucet.polygon.technology/
- Mainnet: Purchase from exchanges

### 2. Configure Polygon Network
\`\`\`javascript
networks: {
  polygon: {
    url: "https://polygon-rpc.com/",
    accounts: [`0x${YOUR_PRIVATE_KEY}`],
    chainId: 137
  }
}
\`\`\`

### 3. Deploy to Polygon
\`\`\`bash
npx hardhat run scripts/deploy.js --network polygon
\`\`\`

## After Deployment

1. **Save the Contract Address**: Copy the deployed contract address
2. **Update Environment Variable**: Set `NEXT_PUBLIC_CONTRACT_ADDRESS` in your `.env.local` file
3. **Update Frontend**: The contract address in `lib/blockchain.ts` will automatically use the env variable
4. **Test Functions**: Use the frontend interface to test all contract functions

## Contract Interaction Examples

### Register User
\`\`\`javascript
await contract.registerUser("John Doe", "john@example.com", 0) // 0 = Farmer
\`\`\`

### Submit Yield
\`\`\`javascript
await contract.submitYield(
  "Wheat",
  5000, // 5000 kg
  Math.floor(Date.now() / 1000),
  "40.7128,-74.0060",
  "QmXxx..." // IPFS hash
)
\`\`\`

### Verify Yield
\`\`\`javascript
await contract.verifyYield(1, 1, "Approved - All documents verified") // 1 = Verified
\`\`\`

## Gas Estimation

Approximate gas costs (varies by network):

| Function | Estimated Gas | Sepolia (gwei) | Polygon (MATIC) |
|----------|---------------|----------------|-----------------|
| Register User | ~150,000 | ~$0.50 | ~$0.02 |
| Submit Yield | ~200,000 | ~$0.70 | ~$0.03 |
| Verify Yield | ~100,000 | ~$0.35 | ~$0.01 |

## Troubleshooting

### "Insufficient funds" Error
- Ensure you have enough ETH/MATIC for gas fees
- Check your wallet balance

### "Nonce too high" Error
- Reset your MetaMask account: Settings > Advanced > Clear activity tab data

### Contract Not Responding
- Verify the contract address is correct
- Check you're connected to the right network
- Ensure the contract is deployed and verified

## Security Considerations

1. **Never commit private keys** to version control
2. Use **hardware wallets** for mainnet deployments
3. **Audit your contract** before mainnet deployment
4. Implement **rate limiting** in the frontend
5. Use **multi-signature wallets** for admin functions

## Next Steps

1. Deploy the contract to your chosen network
2. Update the `NEXT_PUBLIC_CONTRACT_ADDRESS` environment variable
3. Test all functions through the frontend interface
4. Consider adding a block explorer link for transparency
