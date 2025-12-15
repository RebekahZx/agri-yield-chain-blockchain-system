-- Seed data for AgriYieldChain

-- Insert sample users
INSERT INTO users (id, wallet_address, name, email, role, is_active) VALUES
    ('admin-1', '0x1234567890123456789012345678901234567890', 'System Admin', 'admin@agriyieldchain.com', 'admin', true),
    ('farmer-1', '0x2345678901234567890123456789012345678901', 'John Smith', 'john.smith@farm.com', 'farmer', true),
    ('farmer-2', '0x3456789012345678901234567890123456789012', 'Maria Garcia', 'maria.garcia@farm.com', 'farmer', true),
    ('farmer-3', '0x4567890123456789012345678901234567890123', 'Wei Chen', 'wei.chen@farm.com', 'farmer', true),
    ('verifier-1', '0x5678901234567890123456789012345678901234', 'Dr. Sarah Johnson', 'sarah.johnson@agri.gov', 'verifier', true),
    ('verifier-2', '0x6789012345678901234567890123456789012345', 'Michael Brown', 'michael.brown@agri.gov', 'verifier', true)
ON CONFLICT (wallet_address) DO NOTHING;

-- Insert sample yield records
INSERT INTO yield_records (
    blockchain_id, farmer_id, farmer_wallet, crop_type, quantity, 
    harvest_date, location, ipfs_hash, status, verifier_id, verifier_wallet,
    submitted_at, verified_at, remarks, transaction_hash
) VALUES
    (
        1, 'farmer-1', '0x2345678901234567890123456789012345678901',
        'Wheat', 5000, '2024-06-15 10:00:00+00', '40.7128,-74.0060',
        'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', 'verified',
        'verifier-1', '0x5678901234567890123456789012345678901234',
        '2024-06-16 14:30:00+00', '2024-06-17 09:15:00+00',
        'All documentation verified. Excellent quality.',
        '0xabc123...'
    ),
    (
        2, 'farmer-2', '0x3456789012345678901234567890123456789012',
        'Rice', 7500, '2024-06-18 08:30:00+00', '34.0522,-118.2437',
        'QmPpHdWEz79ojWnPbdGYwAPJzv5CZsnA625s3Xf2nemtYg', 'verified',
        'verifier-2', '0x6789012345678901234567890123456789012345',
        '2024-06-19 11:00:00+00', '2024-06-20 16:45:00+00',
        'Approved after field inspection.',
        '0xdef456...'
    ),
    (
        3, 'farmer-3', '0x4567890123456789012345678901234567890123',
        'Corn', 6200, '2024-06-20 12:00:00+00', '41.8781,-87.6298',
        'QmSnA625s3Xf2nemtYgPpHdWEz79ojWnPbdGYwAPJzv5CZ', 'pending',
        NULL, NULL,
        '2024-06-21 10:30:00+00', NULL,
        NULL,
        NULL
    ),
    (
        4, 'farmer-1', '0x2345678901234567890123456789012345678901',
        'Soybeans', 4800, '2024-06-22 09:15:00+00', '40.7128,-74.0060',
        'QmWnPbdGYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79oj', 'pending',
        NULL, NULL,
        '2024-06-23 13:20:00+00', NULL,
        NULL,
        NULL
    )
ON CONFLICT (blockchain_id) DO NOTHING;

-- Insert sample IPFS documents
INSERT INTO ipfs_documents (yield_record_id, ipfs_hash, file_name, file_type, file_size, description) VALUES
    (1, 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', 'harvest_report_wheat_2024.pdf', 'application/pdf', 245680, 'Official harvest report'),
    (1, 'QmPpHdWEz79ojWnPbdGYwAPJzv5CZsnA625s3Xf2nemtYg', 'field_inspection_photos.zip', 'application/zip', 1024000, 'Field inspection photographs'),
    (2, 'QmSnA625s3Xf2nemtYgPpHdWEz79ojWnPbdGYwAPJzv5CZ', 'harvest_report_rice_2024.pdf', 'application/pdf', 198450, 'Official harvest report'),
    (3, 'QmWnPbdGYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79oj', 'harvest_report_corn_2024.pdf', 'application/pdf', 215890, 'Official harvest report');

-- Insert sample verification history
INSERT INTO verification_history (yield_record_id, verifier_id, action, remarks, transaction_hash) VALUES
    (1, 'verifier-1', 'verified', 'Initial verification passed. Documentation complete.', '0xabc123...'),
    (2, 'verifier-2', 'verified', 'Field inspection completed successfully.', '0xdef456...');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, is_read, related_yield_id) VALUES
    ('farmer-1', 'Yield Verified', 'Your wheat yield submission has been verified and approved.', 'success', true, 1),
    ('farmer-2', 'Yield Verified', 'Your rice yield submission has been verified and approved.', 'success', true, 2),
    ('farmer-3', 'Yield Pending', 'Your corn yield submission is awaiting verification.', 'info', false, 3),
    ('verifier-1', 'New Submission', 'A new yield record requires your verification.', 'info', false, 3);

-- Insert sample analytics
INSERT INTO analytics (date, total_yields_submitted, total_yields_verified, total_yields_rejected, total_quantity_verified, unique_farmers, unique_verifiers) VALUES
    ('2024-06-17', 1, 1, 0, 5000, 1, 1),
    ('2024-06-20', 2, 2, 0, 12500, 2, 2),
    ('2024-06-23', 4, 2, 0, 12500, 3, 2);
