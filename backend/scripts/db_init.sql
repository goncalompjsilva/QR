-- ============================================================================
-- QR Loyalty Platform - Complete Database Schema
-- ============================================================================
-- This file contains the complete database schema for the QR Loyalty Platform
-- Supporting multi-establishment loyalty programs with role-based access
-- ============================================================================

-- Drop existing objects if they exist
DROP VIEW IF EXISTS establishment_analytics CASCADE;
DROP TABLE IF EXISTS point_activities CASCADE;
DROP TABLE IF EXISTS qr_codes CASCADE;
DROP TABLE IF EXISTS user_loyalty_points CASCADE;
DROP TABLE IF EXISTS loyalty_programs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS establishments CASCADE;
DROP TABLE IF EXISTS business_owners CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Business Owners Table (Franchise/Chain Owners)
-- ============================================================================
CREATE TABLE business_owners (
    id SERIAL PRIMARY KEY,
    
    -- Owner Information
    owner_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    
    -- Address Information
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    
    -- Branding
    avatar_url VARCHAR(500),
    
    -- Business Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    partnership_status VARCHAR(50) DEFAULT 'active', -- active, suspended, terminated
    pricing_model VARCHAR(50) DEFAULT 'per_customer', -- per_customer, per_redemption, revenue_share
    joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Audit Fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for business_owners
CREATE TRIGGER update_business_owners_updated_at 
    BEFORE UPDATE ON business_owners 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Establishments Table (Individual Business Locations)
-- ============================================================================
CREATE TABLE establishments (
    id SERIAL PRIMARY KEY,
    
    -- Owner Relationship
    business_owner_id INTEGER NOT NULL REFERENCES business_owners(id) ON DELETE CASCADE,
    
    -- Business Information
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100), -- restaurant, cafe, bakery, shop, etc.
    description TEXT,
    
    -- Branding
    avatar_url VARCHAR(500), -- establishment logo/avatar
    background_image_url VARCHAR(500), -- background image for app
    
    -- Contact Information
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Business Settings
    business_hours JSONB, -- {"monday": "9:00-18:00", "tuesday": "9:00-18:00", ...}
    settings JSONB, -- custom settings per establishment
    
    -- Location and Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    location_coords POINT, -- for map discovery
    
    -- Audit Fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for establishments
CREATE INDEX idx_establishments_business_owner ON establishments(business_owner_id);
CREATE INDEX idx_establishments_city ON establishments(city);
CREATE INDEX idx_establishments_business_type ON establishments(business_type);
CREATE INDEX idx_establishments_location ON establishments USING GIST(location_coords);

-- Create trigger for establishments
CREATE TRIGGER update_establishments_updated_at 
    BEFORE UPDATE ON establishments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Users Table (Customers, Workers, Admins)
-- ============================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    
    -- Basic Information
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    password_hash VARCHAR(255), -- optional for customers, required for workers/admins
    avatar_url VARCHAR(500),
    
    -- Role and Permissions
    role VARCHAR(20) NOT NULL DEFAULT 'customer', -- customer, worker, admin
    establishment_id INTEGER REFERENCES establishments(id) ON DELETE SET NULL, -- for workers/admins
    
    -- Verification Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- App Preferences
    notification_settings JSONB DEFAULT '{"push": true, "sms": false, "email": false}',
    app_language VARCHAR(10) DEFAULT 'en',
    
    -- Audit Fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create indexes for users
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_establishment ON users(establishment_id);

-- Create trigger for users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Loyalty Programs Table (Flexible Reward Programs)
-- ============================================================================
CREATE TABLE loyalty_programs (
    id SERIAL PRIMARY KEY,
    
    -- Establishment Relationship
    establishment_id INTEGER NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    
    -- Program Details
    program_name VARCHAR(255) NOT NULL,
    program_description TEXT,
    reward_description VARCHAR(500) NOT NULL, -- "Free Pizza", "Free Coffee", "20% Discount"
    
    -- Point Rules
    points_required INTEGER NOT NULL, -- points needed for reward
    points_per_euro DECIMAL(5,2) DEFAULT 1.0, -- how many points per euro spent
    max_redemptions_per_user INTEGER, -- limit per customer (NULL = unlimited)
    
    -- Program Settings
    point_expiry_days INTEGER, -- NULL = points never expire
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    
    -- Display Settings
    program_color VARCHAR(7), -- hex color for UI
    program_icon VARCHAR(100), -- icon name for UI
    
    -- Audit Fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for loyalty_programs
CREATE INDEX idx_loyalty_programs_establishment ON loyalty_programs(establishment_id);
CREATE INDEX idx_loyalty_programs_active ON loyalty_programs(is_active);

-- Create trigger for loyalty_programs
CREATE TRIGGER update_loyalty_programs_updated_at 
    BEFORE UPDATE ON loyalty_programs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- User Loyalty Points Table (Customer Points per Establishment)
-- ============================================================================
CREATE TABLE user_loyalty_points (
    id SERIAL PRIMARY KEY,
    
    -- Relationships
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    establishment_id INTEGER NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    
    -- Point Tracking per Establishment (across all programs)
    total_points_earned INTEGER NOT NULL DEFAULT 0,
    total_points_redeemed INTEGER NOT NULL DEFAULT 0,
    current_balance INTEGER NOT NULL DEFAULT 0,
    
    -- Activity Tracking
    total_visits INTEGER NOT NULL DEFAULT 0,
    last_activity_date TIMESTAMP,
    first_visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Customer Insights
    favorite_programs JSONB, -- track which programs user uses most
    lifetime_value DECIMAL(10,2) DEFAULT 0, -- estimated customer value
    
    -- Audit Fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(user_id, establishment_id)
);

-- Create indexes for user_loyalty_points
CREATE INDEX idx_user_loyalty_points_user ON user_loyalty_points(user_id);
CREATE INDEX idx_user_loyalty_points_establishment ON user_loyalty_points(establishment_id);
CREATE INDEX idx_user_loyalty_points_balance ON user_loyalty_points(current_balance);

-- Create trigger for user_loyalty_points
CREATE TRIGGER update_user_loyalty_points_updated_at 
    BEFORE UPDATE ON user_loyalty_points 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- QR Codes Table (One-time Use Codes)
-- ============================================================================
CREATE TABLE qr_codes (
    id SERIAL PRIMARY KEY,
    
    -- Relationships
    establishment_id INTEGER NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    program_id INTEGER REFERENCES loyalty_programs(id) ON DELETE SET NULL,
    
    -- QR Code Data
    qr_code_hash VARCHAR(255) UNIQUE NOT NULL, -- unique hash for the QR code
    qr_code_url VARCHAR(500), -- full URL that opens the app
    
    -- Code Purpose
    code_type VARCHAR(20) NOT NULL, -- 'earn_points' or 'redeem_reward'
    points_value INTEGER NOT NULL, -- points to award or redeem
    amount_spent DECIMAL(10,2), -- original purchase amount (for earn_points)
    
    -- Usage Tracking
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    used_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    used_at TIMESTAMP,
    
    -- Security and Expiration
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    -- Who Created This Code
    created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- which worker/admin created it
    
    -- Additional Data
    description TEXT, -- "Purchase of 40€", "Free Pizza Redemption"
    metadata JSONB -- any additional data needed
);

-- Create indexes for qr_codes
CREATE INDEX idx_qr_codes_hash ON qr_codes(qr_code_hash);
CREATE INDEX idx_qr_codes_establishment ON qr_codes(establishment_id);
CREATE INDEX idx_qr_codes_expires ON qr_codes(expires_at);
CREATE INDEX idx_qr_codes_used ON qr_codes(is_used);

-- Point Activities Table (Activity Log)
-- ============================================================================
CREATE TABLE point_activities (
    id SERIAL PRIMARY KEY,
    
    -- Relationships
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    establishment_id INTEGER NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    program_id INTEGER REFERENCES loyalty_programs(id) ON DELETE SET NULL,
    
    -- Activity Details
    activity_type VARCHAR(20) NOT NULL, -- 'earned', 'redeemed', 'expired', 'adjusted'
    points_change INTEGER NOT NULL, -- positive for earned, negative for redeemed
    description TEXT NOT NULL, -- "Purchased 40€", "Redeemed Free Pizza"
    
    -- Context
    qr_code_id INTEGER REFERENCES qr_codes(id) ON DELETE SET NULL,
    processed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- which worker/admin processed
    
    -- Additional Data
    amount_spent DECIMAL(10,2), -- original purchase amount
    metadata JSONB, -- any additional context
    
    -- Timestamp
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for point_activities
CREATE INDEX idx_point_activities_user ON point_activities(user_id);
CREATE INDEX idx_point_activities_establishment ON point_activities(establishment_id);
CREATE INDEX idx_point_activities_type ON point_activities(activity_type);
CREATE INDEX idx_point_activities_date ON point_activities(created_at);

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

-- Establishment Analytics View
-- ============================================================================
CREATE VIEW establishment_analytics AS
SELECT 
    e.id as establishment_id,
    e.business_name,
    e.business_type,
    e.city,
    COUNT(DISTINCT ulp.user_id) as total_customers,
    COUNT(DISTINCT CASE WHEN ulp.last_activity_date >= CURRENT_DATE - INTERVAL '30 days' THEN ulp.user_id END) as active_customers_30d,
    COUNT(DISTINCT CASE WHEN ulp.last_activity_date >= CURRENT_DATE - INTERVAL '7 days' THEN ulp.user_id END) as active_customers_7d,
    SUM(ulp.total_points_earned) as total_points_given,
    SUM(ulp.total_points_redeemed) as total_points_redeemed,
    AVG(ulp.current_balance) as avg_customer_balance,
    SUM(ulp.total_visits) as total_visits,
    AVG(ulp.lifetime_value) as avg_lifetime_value,
    COUNT(lp.id) as total_programs,
    COUNT(CASE WHEN lp.is_active THEN lp.id END) as active_programs
FROM establishments e
LEFT JOIN user_loyalty_points ulp ON e.id = ulp.establishment_id
LEFT JOIN loyalty_programs lp ON e.id = lp.establishment_id
GROUP BY e.id, e.business_name, e.business_type, e.city;

-- ============================================================================
-- COMPREHENSIVE SAMPLE DATA (Diverse Real-World Examples)
-- ============================================================================

-- Business Owners (Different types of business operators)
-- ============================================================================
INSERT INTO business_owners (owner_name, company_name, email, phone, city, country, partnership_status, pricing_model) VALUES
('Mario Rossi', 'Rossi Restaurant Group', 'mario@rossigroup.com', '+351912345678', 'Porto', 'Portugal', 'active', 'per_customer'),
('Ana Silva', 'Silva Coffee Chain', 'ana@silvacoffee.pt', '+351913456789', 'Lisboa', 'Portugal', 'active', 'per_redemption'),
('João Santos', 'Santos Bakery & More', 'joao@santosbakery.com', '+351914567890', 'Braga', 'Portugal', 'active', 'revenue_share'),
('Maria Costa', 'Costa Ice Cream Shops', 'maria@costaice.pt', '+351915678901', 'Coimbra', 'Portugal', 'active', 'per_customer'),
('Pedro Oliveira', 'Fast Burger Express', 'pedro@fastburger.pt', '+351916789012', 'Aveiro', 'Portugal', 'active', 'per_redemption'),
('Sofia Fernandes', 'Healthy Juice Bars', 'sofia@healthyjuice.pt', '+351917890123', 'Faro', 'Portugal', 'active', 'per_customer');

-- Establishments (Diverse business types and locations)
-- ============================================================================
INSERT INTO establishments (business_owner_id, business_name, business_type, description, phone, email, address, city, country, business_hours) VALUES
-- Mario Rossi's Italian Restaurants
(1, 'Restaurant Italian Porto', 'restaurant', 'Authentic Italian cuisine in the heart of Porto', '+351912345679', 'porto@rossigroup.com', 'Rua das Flores 123', 'Porto', 'Portugal', '{"monday": "12:00-23:00", "tuesday": "12:00-23:00", "wednesday": "12:00-23:00", "thursday": "12:00-23:00", "friday": "12:00-24:00", "saturday": "12:00-24:00", "sunday": "12:00-22:00"}'),
(1, 'Rossi Pizzeria Gaia', 'restaurant', 'Wood-fired pizza and Italian specialties', '+351912345680', 'gaia@rossigroup.com', 'Avenida da Republica 456', 'Vila Nova de Gaia', 'Portugal', '{"monday": "18:00-23:00", "tuesday": "18:00-23:00", "wednesday": "18:00-23:00", "thursday": "18:00-23:00", "friday": "18:00-24:00", "saturday": "12:00-24:00", "sunday": "12:00-22:00"}'),
(1, 'Mama Rossi Trattoria', 'restaurant', 'Family-style Italian dining experience', '+351912345681', 'trattoria@rossigroup.com', 'Praça da Liberdade 789', 'Porto', 'Portugal', '{"monday": "12:00-22:00", "tuesday": "12:00-22:00", "wednesday": "12:00-22:00", "thursday": "12:00-22:00", "friday": "12:00-23:00", "saturday": "12:00-23:00", "sunday": "12:00-21:00"}'),

-- Ana Silva's Coffee Shops
(2, 'Silva Coffee Downtown', 'cafe', 'Premium coffee and fresh pastries in Lisboa center', '+351913456790', 'downtown@silvacoffee.pt', 'Rua Augusta 101', 'Lisboa', 'Portugal', '{"monday": "07:00-19:00", "tuesday": "07:00-19:00", "wednesday": "07:00-19:00", "thursday": "07:00-19:00", "friday": "07:00-20:00", "saturday": "08:00-20:00", "sunday": "09:00-18:00"}'),
(2, 'Silva Coffee Station', 'cafe', 'Quick coffee for commuters and students', '+351913456791', 'station@silvacoffee.pt', 'Estação do Oriente', 'Lisboa', 'Portugal', '{"monday": "06:00-22:00", "tuesday": "06:00-22:00", "wednesday": "06:00-22:00", "thursday": "06:00-22:00", "friday": "06:00-22:00", "saturday": "07:00-21:00", "sunday": "08:00-20:00"}'),

-- João Santos' Bakeries
(3, 'Santos Traditional Bakery', 'bakery', 'Traditional Portuguese bread and pastries since 1985', '+351914567891', 'traditional@santosbakery.com', 'Rua do Souto 25', 'Braga', 'Portugal', '{"monday": "06:00-19:00", "tuesday": "06:00-19:00", "wednesday": "06:00-19:00", "thursday": "06:00-19:00", "friday": "06:00-19:00", "saturday": "06:00-18:00", "sunday": "07:00-13:00"}'),
(3, 'Santos Modern Bakery', 'bakery', 'Modern artisan breads and international pastries', '+351914567892', 'modern@santosbakery.com', 'Shopping Minho Center', 'Braga', 'Portugal', '{"monday": "09:00-22:00", "tuesday": "09:00-22:00", "wednesday": "09:00-22:00", "thursday": "09:00-22:00", "friday": "09:00-23:00", "saturday": "09:00-23:00", "sunday": "10:00-22:00"}'),

-- Maria Costa's Ice Cream Shops
(4, 'Costa Gelato Paradise', 'ice_cream', 'Artisan gelato with unique Portuguese flavors', '+351915678902', 'paradise@costaice.pt', 'Largo da Portagem 15', 'Coimbra', 'Portugal', '{"monday": "10:00-23:00", "tuesday": "10:00-23:00", "wednesday": "10:00-23:00", "thursday": "10:00-23:00", "friday": "10:00-24:00", "saturday": "10:00-24:00", "sunday": "11:00-23:00"}'),
(4, 'Costa Ice Cream Beach', 'ice_cream', 'Fresh ice cream by the river', '+351915678903', 'beach@costaice.pt', 'Parque Verde do Mondego', 'Coimbra', 'Portugal', '{"monday": "12:00-22:00", "tuesday": "12:00-22:00", "wednesday": "12:00-22:00", "thursday": "12:00-22:00", "friday": "11:00-23:00", "saturday": "11:00-23:00", "sunday": "11:00-22:00"}'),

-- Pedro Oliveira's Burger Joints
(5, 'Fast Burger Central', 'fast_food', 'Gourmet burgers made fast in Aveiro center', '+351916789013', 'central@fastburger.pt', 'Rua de João Mendonça 88', 'Aveiro', 'Portugal', '{"monday": "11:00-23:00", "tuesday": "11:00-23:00", "wednesday": "11:00-23:00", "thursday": "11:00-23:00", "friday": "11:00-24:00", "saturday": "11:00-24:00", "sunday": "12:00-22:00"}'),

-- Sofia Fernandes' Juice Bars
(6, 'Healthy Juice Algarve', 'juice_bar', 'Fresh juices and smoothies with local fruits', '+351917890124', 'algarve@healthyjuice.pt', 'Marina de Vilamoura', 'Faro', 'Portugal', '{"monday": "08:00-20:00", "tuesday": "08:00-20:00", "wednesday": "08:00-20:00", "thursday": "08:00-20:00", "friday": "08:00-21:00", "saturday": "07:00-21:00", "sunday": "08:00-19:00"}');

-- Loyalty Programs (Diverse program types and strategies)
-- ============================================================================
INSERT INTO loyalty_programs (establishment_id, program_name, program_description, reward_description, points_required, points_per_euro, max_redemptions_per_user, point_expiry_days, program_color, program_icon) VALUES
-- Restaurant Italian Porto (3 different programs)
(1, 'Pizza Master', 'Become a pizza master with every slice', 'Free Large Pizza', 200, 1.5, NULL, 365, '#FF6B35', 'pizza'),
(1, 'Pasta Lover', 'For our pasta enthusiasts', 'Free Pasta Dish', 150, 1.2, 2, 180, '#4ECDC4', 'pasta'),
(1, 'Wine Connoisseur', 'Exclusive wine rewards for wine lovers', 'Free Bottle of Wine', 300, 2.0, 1, 730, '#8B0000', 'wine'),

-- Rossi Pizzeria Gaia (focused on pizza)
(2, 'Slice Collector', 'Collect slices, earn pizzas', 'Free Medium Pizza', 120, 2.0, NULL, 180, '#FF4444', 'pizza'),
(2, 'Family Pack', 'Perfect for families', 'Family Pizza Deal (2 Large + Drinks)', 400, 1.8, NULL, 365, '#FF8C00', 'family'),

-- Mama Rossi Trattoria (traditional approach)
(3, 'Family Friends', 'Traditional loyalty for our family', 'Free 3-Course Meal', 250, 1.0, NULL, NULL, '#228B22', 'plate'),
(3, 'Sunday Special', 'Weekend family dining rewards', 'Free Sunday Lunch for 2', 180, 1.5, 1, 90, '#DAA520', 'calendar'),

-- Silva Coffee Downtown (coffee focused)
(4, 'Coffee Addict', 'For serious coffee lovers', 'Free Premium Coffee', 25, 2.5, NULL, 60, '#8B4513', 'coffee'),
(4, 'Morning Rush', 'Quick rewards for busy mornings', 'Free Coffee + Pastry', 40, 2.0, NULL, 30, '#D2691E', 'clock'),
(4, 'Study Buddy', 'Perfect for students and remote workers', 'Free Large Coffee + Wifi Day Pass', 60, 1.8, NULL, 90, '#4169E1', 'book'),

-- Silva Coffee Station (commuter focused)
(5, 'Commuter Express', 'Fast rewards for daily commuters', 'Free Express Coffee', 15, 3.0, NULL, 21, '#FF69B4', 'train'),
(5, 'Travel Mug', 'Eco-friendly coffee rewards', 'Free Coffee + Reusable Mug', 50, 2.0, 1, 60, '#32CD32', 'leaf'),

-- Santos Traditional Bakery (traditional bakery)
(6, 'Daily Bread', 'Fresh bread every day', 'Free Traditional Bread', 30, 1.5, NULL, 14, '#DEB887', 'bread'),
(6, 'Sweet Tooth', 'For pastry lovers', 'Free Box of Pastries (6pcs)', 80, 1.2, NULL, 30, '#FFB6C1', 'cake'),
(6, 'Weekend Treats', 'Special weekend rewards', 'Free Weekend Breakfast Set', 100, 1.0, 1, 90, '#F0E68C', 'sun'),

-- Santos Modern Bakery (modern approach)
(7, 'Artisan Collector', 'Collect artisan bread experiences', 'Free Artisan Bread + Coffee', 60, 2.0, NULL, 45, '#8A2BE2', 'chef'),
(7, 'Birthday Club', 'Special birthday rewards', 'Free Birthday Cake (Small)', 150, 1.0, 1, 365, '#FF1493', 'gift'),

-- Costa Gelato Paradise (premium ice cream)
(8, 'Gelato Master', 'Italian gelato experience', 'Free Premium Gelato (3 scoops)', 45, 2.5, NULL, 90, '#00CED1', 'icecream'),
(8, 'Flavor Explorer', 'Try new flavors, earn rewards', 'Free Gelato Tasting (5 flavors)', 80, 2.0, NULL, 60, '#FF6347', 'star'),
(8, 'Summer Special', 'Beat the heat with rewards', 'Free Large Gelato Sundae', 100, 1.8, NULL, 120, '#FFD700', 'summer'),

-- Costa Ice Cream Beach (casual approach)
(9, 'Beach Lover', 'Perfect for sunny days', 'Free Ice Cream Cone', 20, 3.0, NULL, 30, '#00BFFF', 'beach'),
(9, 'Family Fun', 'Ice cream for the whole family', 'Free Family Pack (4 ice creams)', 120, 2.0, NULL, 60, '#FF69B4', 'family'),

-- Fast Burger Central (fast food)
(10, 'Burger Beast', 'Conquer our biggest burgers', 'Free Beast Burger + Fries', 80, 2.5, NULL, 45, '#FF0000', 'burger'),
(10, 'Quick Bite', 'Fast rewards for quick meals', 'Free Regular Burger', 35, 2.0, NULL, 30, '#FFA500', 'fast'),
(10, 'Late Night', 'For night owls and late workers', 'Free Late Night Combo', 60, 2.2, NULL, 30, '#800080', 'moon'),

-- Healthy Juice Algarve (health focused)
(11, 'Health Warrior', 'Boost your health with every sip', 'Free Large Smoothie', 40, 2.0, NULL, 90, '#32CD32', 'leaf'),
(11, 'Detox Master', 'Cleanse and earn rewards', 'Free Detox Package (3 juices)', 120, 1.5, 1, 30, '#90EE90', 'heart'),
(11, 'Beach Body', 'Get ready for beach season', 'Free Protein Smoothie + Supplement', 80, 2.2, NULL, 60, '#FF6B6B', 'muscle');

-- Users (Diverse customer base and staff)
-- ============================================================================
INSERT INTO users (phone_number, email, full_name, role, establishment_id, phone_verified, email_verified, app_language, notification_settings) VALUES
-- Customers (diverse demographics and preferences)
('+351912000001', 'joao.silva@email.com', 'João Silva', 'customer', NULL, true, true, 'pt', '{"push": true, "sms": true, "email": false}'),
('+351912000002', 'maria.santos@email.com', 'Maria Santos', 'customer', NULL, true, false, 'pt', '{"push": true, "sms": false, "email": true}'),
('+351912000003', 'carlos.ferreira@email.com', 'Carlos Ferreira', 'customer', NULL, true, true, 'pt', '{"push": false, "sms": true, "email": false}'),
('+351912000004', 'ana.costa@email.com', 'Ana Costa', 'customer', NULL, true, true, 'en', '{"push": true, "sms": false, "email": false}'),
('+351912000005', 'pedro.oliveira@email.com', 'Pedro Oliveira', 'customer', NULL, false, false, 'pt', '{"push": true, "sms": false, "email": false}'),
('+351912000006', 'sofia.rodrigues@email.com', 'Sofia Rodrigues', 'customer', NULL, true, true, 'pt', '{"push": true, "sms": true, "email": true}'),
('+351912000007', 'miguel.pereira@email.com', 'Miguel Pereira', 'customer', NULL, true, false, 'en', '{"push": false, "sms": false, "email": true}'),
('+351912000008', 'catarina.alves@email.com', 'Catarina Alves', 'customer', NULL, true, true, 'pt', '{"push": true, "sms": false, "email": false}'),
('+351912000009', 'ricardo.martins@email.com', 'Ricardo Martins', 'customer', NULL, true, true, 'pt', '{"push": true, "sms": true, "email": false}'),
('+351912000010', 'beatriz.sousa@email.com', 'Beatriz Sousa', 'customer', NULL, true, false, 'en', '{"push": true, "sms": false, "email": true}'),

-- Workers for different establishments
('+351913000001', 'worker1@rossigroup.com', 'Giuseppe Romano', 'worker', 1, true, true, 'pt', '{"push": true, "sms": false, "email": true}'),
('+351913000002', 'worker2@rossigroup.com', 'Lucia Bianchi', 'worker', 2, true, true, 'pt', '{"push": true, "sms": false, "email": true}'),
('+351913000003', 'worker3@rossigroup.com', 'Marco Ferrari', 'worker', 3, true, true, 'pt', '{"push": true, "sms": false, "email": true}'),
('+351913000004', 'barista1@silvacoffee.pt', 'Tiago Mendes', 'worker', 4, true, true, 'pt', '{"push": true, "sms": false, "email": true}'),
('+351913000005', 'barista2@silvacoffee.pt', 'Rita Carvalho', 'worker', 5, true, true, 'pt', '{"push": true, "sms": false, "email": true}'),
('+351913000006', 'baker1@santosbakery.com', 'Manuel Santos', 'worker', 6, true, true, 'pt', '{"push": true, "sms": false, "email": true}'),
('+351913000007', 'baker2@santosbakery.com', 'Isabel Ferreira', 'worker', 7, true, true, 'pt', '{"push": true, "sms": false, "email": true}'),

-- Admins for establishments
('+351914000001', 'admin@rossigroup.com', 'Francesco Rossi', 'admin', 1, true, true, 'pt', '{"push": true, "sms": true, "email": true}'),
('+351914000002', 'admin@silvacoffee.pt', 'Helena Silva', 'admin', 4, true, true, 'pt', '{"push": true, "sms": true, "email": true}'),
('+351914000003', 'admin@santosbakery.com', 'António Santos', 'admin', 6, true, true, 'pt', '{"push": true, "sms": true, "email": true}'),
('+351914000004', 'admin@costaice.pt', 'Cristina Costa', 'admin', 8, true, true, 'pt', '{"push": true, "sms": true, "email": true}'),
('+351914000005', 'admin@fastburger.pt', 'Paulo Oliveira', 'admin', 10, true, true, 'pt', '{"push": true, "sms": true, "email": true}'),
('+351914000006', 'admin@healthyjuice.pt', 'Inês Fernandes', 'admin', 11, true, true, 'pt', '{"push": true, "sms": true, "email": true}');

-- User Loyalty Points (Realistic customer engagement)
-- ============================================================================
INSERT INTO user_loyalty_points (user_id, establishment_id, total_points_earned, total_points_redeemed, current_balance, total_visits, last_activity_date, first_visit_date, lifetime_value) VALUES
-- João Silva - Heavy Italian restaurant user
(1, 1, 450, 200, 250, 15, '2025-01-10 19:30:00', '2024-06-15 20:00:00', 300.00),
(1, 2, 180, 120, 60, 8, '2025-01-08 21:15:00', '2024-08-20 19:45:00', 120.00),

-- Maria Santos - Coffee addict
(2, 4, 320, 100, 220, 45, '2025-01-12 08:30:00', '2024-05-10 07:45:00', 280.00),
(2, 5, 150, 45, 105, 22, '2025-01-11 07:15:00', '2024-09-05 08:00:00', 95.00),

-- Carlos Ferreira - Bakery regular
(3, 6, 280, 120, 160, 35, '2025-01-09 07:30:00', '2024-07-01 07:00:00', 180.00),
(3, 7, 95, 60, 35, 12, '2025-01-07 10:00:00', '2024-10-15 16:30:00', 65.00),

-- Ana Costa - Ice cream enthusiast
(4, 8, 220, 90, 130, 18, '2025-01-06 15:45:00', '2024-06-20 14:30:00', 150.00),
(4, 9, 85, 40, 45, 10, '2025-01-04 16:20:00', '2024-08-10 17:00:00', 55.00),

-- Pedro Oliveira - Fast food lover
(5, 10, 180, 80, 100, 14, '2025-01-05 22:30:00', '2024-09-01 21:45:00', 120.00),

-- Sofia Rodrigues - Health conscious
(6, 11, 240, 80, 160, 25, '2025-01-11 09:15:00', '2024-07-15 08:30:00', 200.00),

-- Miguel Pereira - Multi-establishment user
(7, 1, 120, 0, 120, 6, '2024-12-28 20:00:00', '2024-11-10 19:30:00', 80.00),
(7, 4, 90, 50, 40, 12, '2025-01-03 08:45:00', '2024-10-05 07:30:00', 60.00),
(7, 6, 65, 30, 35, 8, '2024-12-30 08:00:00', '2024-11-20 07:45:00', 45.00),

-- Catarina Alves - Regular customer
(8, 2, 200, 120, 80, 16, '2025-01-02 20:30:00', '2024-08-05 19:15:00', 135.00),
(8, 8, 110, 45, 65, 9, '2024-12-29 16:00:00', '2024-09-10 15:30:00', 75.00),

-- Ricardo Martins - Occasional user
(9, 3, 85, 0, 85, 4, '2024-12-20 19:45:00', '2024-11-01 20:30:00', 60.00),
(9, 10, 45, 35, 10, 3, '2024-12-15 21:00:00', '2024-11-25 22:15:00', 30.00),

-- Beatriz Sousa - New but engaged customer
(10, 5, 120, 30, 90, 18, '2025-01-10 07:30:00', '2024-12-01 08:00:00', 75.00),
(10, 7, 80, 0, 80, 8, '2025-01-08 16:45:00', '2024-12-10 17:00:00', 55.00);

-- Point Activities (Realistic transaction history)
-- ============================================================================
INSERT INTO point_activities (user_id, establishment_id, program_id, activity_type, points_change, description, amount_spent, processed_by_user_id, created_at) VALUES
-- Recent activities for João Silva at Restaurant Italian Porto
(1, 1, 1, 'earned', 45, 'Purchased large pizza and drinks', 30.00, 18, '2025-01-10 19:30:00'),
(1, 1, 1, 'earned', 30, 'Dinner for two - pizza and pasta', 20.00, 18, '2025-01-05 20:15:00'),
(1, 1, 1, 'redeemed', -200, 'Redeemed Free Large Pizza', NULL, 18, '2024-12-28 19:45:00'),

-- Maria Santos coffee activities
(2, 4, 8, 'earned', 20, 'Morning coffee and pastry', 8.00, 19, '2025-01-12 08:30:00'),
(2, 4, 8, 'earned', 15, 'Afternoon coffee break', 6.00, 19, '2025-01-11 15:20:00'),
(2, 4, 8, 'redeemed', -25, 'Redeemed Free Premium Coffee', NULL, 19, '2025-01-10 08:45:00'),

-- Carlos Ferreira bakery visits
(3, 6, 12, 'earned', 18, 'Daily bread and pastries', 12.00, 20, '2025-01-09 07:30:00'),
(3, 6, 12, 'earned', 12, 'Weekend bread order', 8.00, 20, '2025-01-07 08:00:00'),
(3, 6, 12, 'redeemed', -30, 'Redeemed Free Traditional Bread', NULL, 20, '2025-01-06 07:45:00'),

-- Ana Costa ice cream activities
(4, 8, 15, 'earned', 25, 'Gelato tasting session', 10.00, 21, '2025-01-06 15:45:00'),
(4, 8, 15, 'earned', 30, 'Family gelato order', 12.00, 21, '2025-01-02 16:30:00'),
(4, 8, 15, 'redeemed', -45, 'Redeemed Free Premium Gelato', NULL, 21, '2024-12-30 14:20:00'),

-- Pedro Oliveira burger activities
(5, 10, 19, 'earned', 25, 'Beast burger combo meal', 10.00, 22, '2025-01-05 22:30:00'),
(5, 10, 19, 'earned', 20, 'Quick lunch burger', 8.00, 22, '2025-01-03 13:15:00'),
(5, 10, 20, 'redeemed', -35, 'Redeemed Free Regular Burger', NULL, 22, '2024-12-29 21:45:00'),

-- Sofia Rodrigues health juice activities
(6, 11, 22, 'earned', 30, 'Morning detox smoothie', 15.00, 23, '2025-01-11 09:15:00'),
(6, 11, 22, 'earned', 25, 'Post-workout protein shake', 12.50, 23, '2025-01-09 17:30:00'),
(6, 11, 22, 'redeemed', -40, 'Redeemed Free Large Smoothie', NULL, 23, '2025-01-07 10:00:00'),

-- Cross-establishment activities for Miguel Pereira
(7, 1, 1, 'earned', 30, 'Pizza dinner', 20.00, 18, '2024-12-28 20:00:00'),
(7, 4, 8, 'earned', 20, 'Coffee and work session', 8.00, 19, '2025-01-03 08:45:00'),
(7, 6, 12, 'earned', 15, 'Fresh bread purchase', 10.00, 20, '2024-12-30 08:00:00'),

-- Redemption activities showing program diversity
(8, 2, 4, 'redeemed', -120, 'Redeemed Free Medium Pizza', NULL, 11, '2024-12-25 19:30:00'),
(9, 3, 6, 'earned', 85, 'Large family dinner', 85.00, 12, '2024-12-20 19:45:00'),
(10, 5, 9, 'earned', 45, 'Multiple coffee purchases', 15.00, 19, '2025-01-08 08:30:00');

-- Sample QR Codes (showing different types and states)
-- ============================================================================
INSERT INTO qr_codes (establishment_id, program_id, qr_code_hash, code_type, points_value, amount_spent, is_used, used_by_user_id, used_at, expires_at, created_by_user_id, description) VALUES
-- Active earn_points codes
(1, 1, 'QR_EARN_001_abc123', 'earn_points', 45, 30.00, false, NULL, NULL, '2025-01-16 23:59:59', 18, 'Pizza purchase for 30€'),
(4, 8, 'QR_EARN_002_def456', 'earn_points', 20, 8.00, false, NULL, NULL, '2025-01-15 23:59:59', 19, 'Morning coffee and pastry'),
(6, 12, 'QR_EARN_003_ghi789', 'earn_points', 15, 10.00, false, NULL, NULL, '2025-01-14 23:59:59', 20, 'Fresh bread and pastries'),

-- Used earn_points codes
(1, 1, 'QR_EARN_004_jkl012', 'earn_points', 30, 20.00, true, 1, '2025-01-10 19:35:00', '2025-01-11 23:59:59', 18, 'Dinner for two'),
(8, 15, 'QR_EARN_005_mno345', 'earn_points', 25, 10.00, true, 4, '2025-01-06 15:50:00', '2025-01-07 23:59:59', 21, 'Gelato tasting'),
(11, 22, 'QR_EARN_006_pqr678', 'earn_points', 30, 15.00, true, 6, '2025-01-11 09:20:00', '2025-01-12 23:59:59', 23, 'Detox smoothie'),

-- Active redeem_reward codes
(1, 1, 'QR_REDEEM_001_stu901', 'redeem_reward', 200, NULL, false, NULL, NULL, '2025-01-20 23:59:59', 18, 'Free Large Pizza redemption'),
(4, 8, 'QR_REDEEM_002_vwx234', 'redeem_reward', 25, NULL, false, NULL, NULL, '2025-01-18 23:59:59', 19, 'Free Premium Coffee redemption'),

-- Used redeem_reward codes
(2, 4, 'QR_REDEEM_003_yza567', 'redeem_reward', 120, NULL, true, 8, '2024-12-25 19:35:00', '2024-12-26 23:59:59', 11, 'Free Medium Pizza redeemed'),
(6, 12, 'QR_REDEEM_004_bcd890', 'redeem_reward', 30, NULL, true, 3, '2025-01-06 07:50:00', '2025-01-07 23:59:59', 20, 'Free Traditional Bread redeemed'),

-- Expired codes (examples of fraud prevention)
(10, 20, 'QR_EARN_007_efg123', 'earn_points', 20, 8.00, false, NULL, NULL, '2025-01-10 23:59:59', 22, 'Expired burger purchase code'),
(5, 9, 'QR_REDEEM_005_hij456', 'redeem_reward', 15, NULL, false, NULL, NULL, '2025-01-09 23:59:59', 19, 'Expired free coffee redemption');

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Show completion message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 QR Loyalty Platform Database Schema Applied Successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Created Tables:';
    RAISE NOTICE '   ✅ business_owners (franchise/chain management)';
    RAISE NOTICE '   ✅ establishments (individual business locations)';
    RAISE NOTICE '   ✅ users (customers, workers, admins)';
    RAISE NOTICE '   ✅ loyalty_programs (flexible reward programs)';
    RAISE NOTICE '   ✅ user_loyalty_points (customer point tracking)';
    RAISE NOTICE '   ✅ qr_codes (one-time use codes)';
    RAISE NOTICE '   ✅ point_activities (activity logging)';
    RAISE NOTICE '';
    RAISE NOTICE '📈 Created Views:';
    RAISE NOTICE '   ✅ establishment_analytics (business insights)';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Features:';
    RAISE NOTICE '   ✅ Multi-establishment support';
    RAISE NOTICE '   ✅ Role-based access control';
    RAISE NOTICE '   ✅ Flexible loyalty programs';
    RAISE NOTICE '   ✅ QR code security with expiration';
    RAISE NOTICE '   ✅ Complete activity logging';
    RAISE NOTICE '   ✅ Customer analytics';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Database is ready for the QR Loyalty Platform!';
    RAISE NOTICE '';
END $$;
