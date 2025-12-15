import { ethers } from "ethers"

// Contract ABI (Application Binary Interface)
export const AGRIYIELD_ABI = [
  "event UserRegistered(address indexed userAddress, string name, uint8 role)",
  "event YieldSubmitted(uint256 indexed yieldId, address indexed farmer, string cropType, uint256 quantity)",
  "event YieldVerified(uint256 indexed yieldId, address indexed verifier, uint8 status)",
  "event UserRoleUpdated(address indexed userAddress, uint8 newRole)",

  "function registerUser(string memory _name, string memory _email, uint8 _role) external",
  "function submitYield(string memory _cropType, uint256 _quantity, uint256 _harvestDate, string memory _location, string memory _ipfsHash) external returns (uint256)",
  "function verifyYield(uint256 _yieldId, uint8 _status, string memory _remarks) external",
  "function updateUserRole(address _userAddress, uint8 _newRole) external",
  "function getFarmerYields(address _farmer) external view returns (uint256[] memory)",
  "function getVerifierApprovals(address _verifier) external view returns (uint256[] memory)",
  "function getYieldRecord(uint256 _yieldId) external view returns (tuple(uint256 id, address farmer, string cropType, uint256 quantity, uint256 harvestDate, string location, string ipfsHash, uint8 status, address verifier, uint256 submittedAt, uint256 verifiedAt, string remarks))",
  "function getUser(address _userAddress) external view returns (tuple(address walletAddress, string name, string email, uint8 role, bool isActive, uint256 registeredAt))",
  "function getTotalYields() external view returns (uint256)",
  "function users(address) external view returns (address walletAddress, string name, string email, uint8 role, bool isActive, uint256 registeredAt)",
  "function yieldRecords(uint256) external view returns (uint256 id, address farmer, string cropType, uint256 quantity, uint256 harvestDate, string location, string ipfsHash, uint8 status, address verifier, uint256 submittedAt, uint256 verifiedAt, string remarks)",
  "function yieldCounter() external view returns (uint256)",
  "function contractOwner() external view returns (address)",
] as const

// Contract address (Update this after deployment)
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"

// Enums
export enum UserRole {
  Farmer = 0,
  Verifier = 1,
  Admin = 2,
}

export enum YieldStatus {
  Pending = 0,
  Verified = 1,
  Rejected = 2,
}

// Type definitions
export interface User {
  walletAddress: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  registeredAt: bigint
}

export interface YieldRecord {
  id: bigint
  farmer: string
  cropType: string
  quantity: bigint
  harvestDate: bigint
  location: string
  ipfsHash: string
  status: YieldStatus
  verifier: string
  submittedAt: bigint
  verifiedAt: bigint
  remarks: string
}

// Helper functions
export function getProvider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum)
  }
  throw new Error("MetaMask not installed")
}

export async function getSigner() {
  const provider = getProvider()
  return await provider.getSigner()
}

export function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(CONTRACT_ADDRESS, AGRIYIELD_ABI, signerOrProvider)
}

export async function connectWallet(): Promise<string> {
  try {
    const provider = getProvider()
    const accounts = await provider.send("eth_requestAccounts", [])
    return accounts[0]
  } catch (error) {
    console.error("Error connecting wallet:", error)
    throw error
  }
}

export async function getConnectedAddress(): Promise<string | null> {
  try {
    const provider = getProvider()
    const accounts = await provider.send("eth_accounts", [])
    return accounts[0] || null
  } catch (error) {
    return null
  }
}

export function formatAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatQuantity(quantity: bigint): string {
  return `${quantity.toString()} kg`
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.Farmer:
      return "Farmer"
    case UserRole.Verifier:
      return "Verifier"
    case UserRole.Admin:
      return "Admin"
    default:
      return "Unknown"
  }
}

export function getStatusLabel(status: YieldStatus): string {
  switch (status) {
    case YieldStatus.Pending:
      return "Pending"
    case YieldStatus.Verified:
      return "Verified"
    case YieldStatus.Rejected:
      return "Rejected"
    default:
      return "Unknown"
  }
}

export function getStatusColor(status: YieldStatus): string {
  switch (status) {
    case YieldStatus.Pending:
      return "text-amber-600"
    case YieldStatus.Verified:
      return "text-emerald-600"
    case YieldStatus.Rejected:
      return "text-red-600"
    default:
      return "text-muted-foreground"
  }
}
