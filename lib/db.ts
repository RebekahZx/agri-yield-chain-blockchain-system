import { neon } from "@neondatabase/serverless"

// Initialize Neon serverless database connection
const sql = neon(process.env.DATABASE_URL!)

export default sql

// Type definitions for database models
export interface User {
  id: string
  wallet_address: string
  name: string
  email: string
  role: "farmer" | "verifier" | "admin"
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface YieldRecord {
  id: number
  blockchain_id: number | null
  farmer_id: string
  farmer_wallet: string
  crop_type: string
  quantity: number
  harvest_date: Date
  location: string
  ipfs_hash: string | null
  status: "pending" | "verified" | "rejected"
  verifier_id: string | null
  verifier_wallet: string | null
  submitted_at: Date
  verified_at: Date | null
  remarks: string | null
  transaction_hash: string | null
  created_at: Date
  updated_at: Date
}

export interface IPFSDocument {
  id: number
  yield_record_id: number
  ipfs_hash: string
  file_name: string
  file_type: string
  file_size: number | null
  description: string | null
  uploaded_at: Date
}

export interface VerificationHistory {
  id: number
  yield_record_id: number
  verifier_id: string
  action: "verified" | "rejected" | "requested_changes"
  remarks: string | null
  transaction_hash: string | null
  created_at: Date
}

export interface Notification {
  id: number
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  is_read: boolean
  related_yield_id: number | null
  created_at: Date
}

export interface Analytics {
  id: number
  date: Date
  total_yields_submitted: number
  total_yields_verified: number
  total_yields_rejected: number
  total_quantity_verified: number
  unique_farmers: number
  unique_verifiers: number
  created_at: Date
}

// Helper functions for common queries
export async function getUserByWallet(walletAddress: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE wallet_address = ${walletAddress} LIMIT 1
  `
  return (result[0] as User) || null
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE id = ${userId} LIMIT 1
  `
  return (result[0] as User) || null
}

export async function createUser(data: {
  id: string
  wallet_address: string
  name: string
  email: string
  role: "farmer" | "verifier" | "admin"
}): Promise<User> {
  const result = await sql`
    INSERT INTO users (id, wallet_address, name, email, role)
    VALUES (${data.id}, ${data.wallet_address}, ${data.name}, ${data.email}, ${data.role})
    RETURNING *
  `
  return result[0] as User
}

export async function getYieldRecordById(yieldId: number): Promise<YieldRecord | null> {
  const result = await sql`
    SELECT * FROM yield_records WHERE id = ${yieldId} LIMIT 1
  `
  return (result[0] as YieldRecord) || null
}

export async function getYieldRecordsByFarmer(farmerId: string): Promise<YieldRecord[]> {
  const result = await sql`
    SELECT * FROM yield_records 
    WHERE farmer_id = ${farmerId}
    ORDER BY submitted_at DESC
  `
  return result as YieldRecord[]
}

export async function getPendingYieldRecords(): Promise<YieldRecord[]> {
  const result = await sql`
    SELECT * FROM yield_records 
    WHERE status = 'pending'
    ORDER BY submitted_at ASC
  `
  return result as YieldRecord[]
}

export async function getAllYieldRecords(limit = 50): Promise<YieldRecord[]> {
  const result = await sql`
    SELECT * FROM yield_records 
    ORDER BY submitted_at DESC
    LIMIT ${limit}
  `
  return result as YieldRecord[]
}

export async function createYieldRecord(data: {
  farmer_id: string
  farmer_wallet: string
  crop_type: string
  quantity: number
  harvest_date: Date
  location: string
  ipfs_hash?: string
  blockchain_id?: number
  transaction_hash?: string
}): Promise<YieldRecord> {
  const result = await sql`
    INSERT INTO yield_records (
      farmer_id, farmer_wallet, crop_type, quantity, harvest_date, 
      location, ipfs_hash, blockchain_id, transaction_hash
    )
    VALUES (
      ${data.farmer_id}, ${data.farmer_wallet}, ${data.crop_type}, 
      ${data.quantity}, ${data.harvest_date}, ${data.location}, 
      ${data.ipfs_hash || null}, ${data.blockchain_id || null}, 
      ${data.transaction_hash || null}
    )
    RETURNING *
  `
  return result[0] as YieldRecord
}

export async function updateYieldRecordStatus(
  yieldId: number,
  status: "verified" | "rejected",
  verifierId: string,
  verifierWallet: string,
  remarks: string,
  transactionHash?: string,
): Promise<YieldRecord> {
  const result = await sql`
    UPDATE yield_records
    SET 
      status = ${status},
      verifier_id = ${verifierId},
      verifier_wallet = ${verifierWallet},
      verified_at = NOW(),
      remarks = ${remarks},
      transaction_hash = ${transactionHash || null}
    WHERE id = ${yieldId}
    RETURNING *
  `
  return result[0] as YieldRecord
}

export async function getNotificationsByUser(userId: string): Promise<Notification[]> {
  const result = await sql`
    SELECT * FROM notifications 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `
  return result as Notification[]
}

export async function createNotification(data: {
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  related_yield_id?: number
}): Promise<Notification> {
  const result = await sql`
    INSERT INTO notifications (user_id, title, message, type, related_yield_id)
    VALUES (${data.user_id}, ${data.title}, ${data.message}, ${data.type}, ${data.related_yield_id || null})
    RETURNING *
  `
  return result[0] as Notification
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  await sql`
    UPDATE notifications
    SET is_read = true
    WHERE id = ${notificationId}
  `
}

export async function getAnalyticsSummary(): Promise<{
  totalYields: number
  verifiedYields: number
  pendingYields: number
  totalQuantity: number
  totalFarmers: number
  totalVerifiers: number
}> {
  const result = await sql`
    SELECT 
      COUNT(*) as total_yields,
      COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_yields,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_yields,
      COALESCE(SUM(CASE WHEN status = 'verified' THEN quantity ELSE 0 END), 0) as total_quantity,
      COUNT(DISTINCT farmer_id) as total_farmers,
      COUNT(DISTINCT verifier_id) as total_verifiers
    FROM yield_records
  `

  return {
    totalYields: Number(result[0].total_yields),
    verifiedYields: Number(result[0].verified_yields),
    pendingYields: Number(result[0].pending_yields),
    totalQuantity: Number(result[0].total_quantity),
    totalFarmers: Number(result[0].total_farmers),
    totalVerifiers: Number(result[0].total_verifiers),
  }
}
