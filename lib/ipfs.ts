/**
 * IPFS Integration Library
 * Handles file uploads and retrieval from IPFS (InterPlanetary File System)
 * for decentralized storage of agricultural yield documents
 */

export interface IPFSUploadResult {
  hash: string
  url: string
  size: number
}

/**
 * Upload files to IPFS
 * In production, this would connect to an IPFS node or service like Pinata, NFT.Storage, or Web3.Storage
 * For development, this simulates the upload and returns a mock IPFS hash
 */
export async function uploadToIPFS(files: File[]): Promise<IPFSUploadResult[]> {
  // In production, replace with actual IPFS upload implementation
  // Example with Pinata:
  // const formData = new FormData()
  // files.forEach(file => formData.append('file', file))
  // const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
  //   body: formData
  // })
  // return response.json()

  console.log(
    "[v0] Uploading files to IPFS:",
    files.map((f) => f.name),
  )

  // Simulate upload delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Generate mock IPFS results
  const results: IPFSUploadResult[] = files.map((file) => {
    // Generate a realistic-looking IPFS hash (CIDv1)
    const mockHash = `Qm${generateRandomHash(44)}`
    return {
      hash: mockHash,
      url: `https://ipfs.io/ipfs/${mockHash}`,
      size: file.size,
    }
  })

  console.log(
    "[v0] IPFS upload complete:",
    results.map((r) => r.hash),
  )

  return results
}

/**
 * Upload a single file to IPFS
 */
export async function uploadFileToIPFS(file: File): Promise<IPFSUploadResult> {
  const results = await uploadToIPFS([file])
  return results[0]
}

/**
 * Get IPFS URL from hash
 */
export function getIPFSUrl(hash: string): string {
  if (!hash) return ""

  // Support multiple IPFS gateways for redundancy
  const gateways = [
    "https://ipfs.io/ipfs/",
    "https://gateway.pinata.cloud/ipfs/",
    "https://cloudflare-ipfs.com/ipfs/",
    "https://dweb.link/ipfs/",
  ]

  // Use the first gateway by default
  return `${gateways[0]}${hash}`
}

/**
 * Get multiple IPFS gateway URLs for a hash
 */
export function getIPFSGateways(hash: string): string[] {
  if (!hash) return []

  return [
    `https://ipfs.io/ipfs/${hash}`,
    `https://gateway.pinata.cloud/ipfs/${hash}`,
    `https://cloudflare-ipfs.com/ipfs/${hash}`,
    `https://dweb.link/ipfs/${hash}`,
  ]
}

/**
 * Validate IPFS hash format
 */
export function isValidIPFSHash(hash: string): boolean {
  // CIDv0: Qm + 44 base58 characters
  const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/
  // CIDv1: b + base32 characters
  const cidv1Regex = /^b[a-z2-7]{58}$/

  return cidv0Regex.test(hash) || cidv1Regex.test(hash)
}

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(file: File): boolean {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]

  return allowedTypes.includes(file.type)
}

/**
 * Validate file size (max 10MB)
 */
export function isValidFileSize(file: File, maxSizeMB = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Generate a random hash for mock IPFS operations
 */
function generateRandomHash(length: number): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Create metadata for IPFS upload
 */
export interface IPFSMetadata {
  name: string
  description: string
  files: Array<{
    name: string
    type: string
    size: number
    hash: string
  }>
  timestamp: number
  yieldId?: number
  farmerId?: string
}

export function createIPFSMetadata(files: File[], yieldId?: number, farmerId?: string): IPFSMetadata {
  return {
    name: `Yield Documents - ${yieldId || "Draft"}`,
    description: "Supporting documents for agricultural yield submission",
    files: files.map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      hash: "", // Will be filled after upload
    })),
    timestamp: Date.now(),
    yieldId,
    farmerId,
  }
}

/**
 * IPFS Service Configuration
 * Set these environment variables in production:
 * - NEXT_PUBLIC_IPFS_GATEWAY: Your preferred IPFS gateway
 * - IPFS_PROJECT_ID: Your IPFS project ID (for Infura/Pinata)
 * - IPFS_PROJECT_SECRET: Your IPFS project secret
 */
export const IPFS_CONFIG = {
  gateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/",
  uploadEndpoint: process.env.IPFS_UPLOAD_ENDPOINT || "https://api.pinata.cloud/pinning/pinFileToIPFS",
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ["application/pdf", "image/jpeg", "image/png", "image/jpg", "application/msword"],
}
