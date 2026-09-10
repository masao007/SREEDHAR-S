-- ============================================================================
-- MONEY MAKER: PRODUCTION POSTGRESQL + POSTGIS DATABASE SCHEMA
-- Target Database: PostgreSQL 15+ with PostGIS Extension (Supabase / AWS RDS / Cloud SQL)
-- ============================================================================

-- Enable UUID extension and PostGIS for high-performance spatial proximity calculations
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('worker', 'employer')),
    location GEOGRAPHY(POINT, 4326), -- PostGIS Spatial Point (SRID 4326: WGS 84)
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    address VARCHAR(500) NOT NULL,
    rating NUMERIC(3,2) DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5.00),
    skills TEXT[] DEFAULT '{}',
    availability VARCHAR(50) DEFAULT 'flexible',
    total_earnings NUMERIC(12,2) DEFAULT 0.00,
    completed_jobs_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index on Users location for reverse geocoding & geo-fenced worker lookups
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- 2. JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    pay_amount NUMERIC(10,2) NOT NULL CHECK (pay_amount > 0),
    pay_type VARCHAR(20) NOT NULL CHECK (pay_type IN ('hourly', 'daily', 'fixed')),
    pay_display VARCHAR(50) NOT NULL, -- e.g. "₹600/day", "₹180/hr"
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    location_lat DOUBLE PRECISION NOT NULL,
    location_lng DOUBLE PRECISION NOT NULL,
    location_address VARCHAR(500) NOT NULL,
    is_urgent BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    hours_per_day VARCHAR(50),
    duration VARCHAR(100),
    emoji VARCHAR(10) DEFAULT '💼',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index for sub-millisecond radius search (ST_DWithin)
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs (category);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_urgent ON jobs (is_urgent);

-- 3. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'applied' CHECK (status IN ('applied', 'accepted', 'rejected', 'completed')),
    message TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, worker_id) -- Prevent duplicate applications
);

CREATE INDEX IF NOT EXISTS idx_applications_job ON applications (job_id);
CREATE INDEX IF NOT EXISTS idx_applications_worker ON applications (worker_id);

-- 4. EARNINGS TABLE
CREATE TABLE IF NOT EXISTS earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payout_status VARCHAR(20) DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processed')),
    payout_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) DEFAULT 'UPI',
    transaction_ref VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_earnings_worker ON earnings (worker_id);
CREATE INDEX IF NOT EXISTS idx_earnings_status ON earnings (payout_status);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('job_alert', 'application_update', 'payout', 'referral', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, is_read);

-- ----------------------------------------------------------------------------
-- POSTGIS SPATIAL PROXIMITY STORED FUNCTION (Optimized for Nearby Search)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_nearby_jobs(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 10.0,
    filter_category VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    employer_id UUID,
    title VARCHAR,
    category VARCHAR,
    description TEXT,
    pay_amount NUMERIC,
    pay_type VARCHAR,
    pay_display VARCHAR,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    location_address VARCHAR,
    distance_km DOUBLE PRECISION,
    is_urgent BOOLEAN,
    status VARCHAR,
    hours_per_day VARCHAR,
    emoji VARCHAR,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.employer_id,
        j.title,
        j.category,
        j.description,
        j.pay_amount,
        j.pay_type,
        j.pay_display,
        j.location_lat,
        j.location_lng,
        j.location_address,
        -- Calculate distance in Kilometers using PostGIS ST_Distance (spheroid)
        ROUND((ST_Distance(j.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) / 1000.0)::numeric, 2)::DOUBLE PRECISION AS distance_km,
        j.is_urgent,
        j.status,
        j.hours_per_day,
        j.emoji,
        j.tags,
        j.created_at
    FROM jobs j
    WHERE j.status = 'open'
      AND (filter_category IS NULL OR filter_category = 'All' OR j.category = filter_category)
      AND ST_DWithin(j.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, radius_km * 1000.0)
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;
