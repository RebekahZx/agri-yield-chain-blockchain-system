-- AgriYieldChain Database Schema
-- This script creates all necessary tables for the application

-- Users table (synced with blockchain wallet addresses)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'verifier', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Yield records table (mirrors blockchain data with additional metadata)
CREATE TABLE IF NOT EXISTS yield_records (
    id SERIAL PRIMARY KEY,
    blockchain_id BIGINT UNIQUE,
    farmer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farmer_wallet TEXT NOT NULL,
    crop_type TEXT NOT NULL,
    quantity BIGINT NOT NULL,
    harvest_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT NOT NULL,
    ipfs_hash TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    verifier_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    verifier_wallet TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IPFS documents table (supporting documents for yield records)
CREATE TABLE IF NOT EXISTS ipfs_documents (
    id SERIAL PRIMARY KEY,
    yield_record_id INTEGER NOT NULL REFERENCES yield_records(id) ON DELETE CASCADE,
    ipfs_hash TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification history table (audit trail)
CREATE TABLE IF NOT EXISTS verification_history (
    id SERIAL PRIMARY KEY,
    yield_record_id INTEGER NOT NULL REFERENCES yield_records(id) ON DELETE CASCADE,
    verifier_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('verified', 'rejected', 'requested_changes')),
    remarks TEXT,
    transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    related_yield_id INTEGER REFERENCES yield_records(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table (aggregated statistics)
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_yields_submitted INTEGER DEFAULT 0,
    total_yields_verified INTEGER DEFAULT 0,
    total_yields_rejected INTEGER DEFAULT 0,
    total_quantity_verified BIGINT DEFAULT 0,
    unique_farmers INTEGER DEFAULT 0,
    unique_verifiers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_yield_records_farmer ON yield_records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_yield_records_verifier ON yield_records(verifier_id);
CREATE INDEX IF NOT EXISTS idx_yield_records_status ON yield_records(status);
CREATE INDEX IF NOT EXISTS idx_yield_records_blockchain ON yield_records(blockchain_id);
CREATE INDEX IF NOT EXISTS idx_yield_records_submitted ON yield_records(submitted_at);

CREATE INDEX IF NOT EXISTS idx_ipfs_documents_yield ON ipfs_documents(yield_record_id);
CREATE INDEX IF NOT EXISTS idx_verification_history_yield ON verification_history(yield_record_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_yield_records_updated_at BEFORE UPDATE ON yield_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
