-- Create projections table for player scoring projections
CREATE TABLE IF NOT EXISTS projections (
    id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    week INTEGER NOT NULL,
    season INTEGER NOT NULL,
    projected_points DECIMAL(5,2) DEFAULT 0,
    floor_points DECIMAL(5,2),
    ceiling_points DECIMAL(5,2),
    projection_source VARCHAR(50) DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, week, season, projection_source)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_projections_player_week 
ON projections(player_id, week, season);

CREATE INDEX IF NOT EXISTS idx_projections_week_season 
ON projections(week, season);

-- Insert sample projection data for Week 3, 2025
INSERT INTO projections (player_id, week, season, projected_points, floor_points, ceiling_points, projection_source) VALUES
-- RBs
('7594', 3, 2025, 12.5, 8.0, 18.0, 'expert_consensus'), -- Chuba Hubbard
('7611', 3, 2025, 14.2, 9.5, 20.0, 'expert_consensus'), -- Rhamondre Stevenson  
('8155', 3, 2025, 16.8, 6.0, 28.0, 'expert_consensus'), -- Breece Hall
('8205', 3, 2025, 13.7, 8.5, 22.0, 'expert_consensus'), -- Isiah Pacheco

-- QBs
('4892', 3, 2025, 18.5, 12.0, 28.0, 'expert_consensus'), -- Baker Mayfield

-- WRs  
('11628', 3, 2025, 15.2, 8.0, 25.0, 'expert_consensus'), -- Marvin Harrison Jr
('12514', 3, 2025, 11.8, 6.0, 20.0, 'expert_consensus'), -- Emeka Egbuka
('12526', 3, 2025, 10.5, 5.0, 18.0, 'expert_consensus'), -- Tetairoa McMillan
('7049', 3, 2025, 9.2, 4.0, 16.0, 'expert_consensus'), -- Jauan Jennings
('7569', 3, 2025, 14.8, 8.0, 24.0, 'expert_consensus'), -- Nico Collins
('9756', 3, 2025, 12.3, 6.0, 22.0, 'expert_consensus'), -- Jordan Addison

-- TEs
('5012', 3, 2025, 11.8, 6.0, 20.0, 'expert_consensus'), -- Mark Andrews
('7553', 3, 2025, 9.5, 4.0, 18.0, 'expert_consensus'), -- Kyle Pitts

-- DST
('DEN', 3, 2025, 8.2, 2.0, 16.0, 'expert_consensus') -- Denver Broncos
ON CONFLICT (player_id, week, season, projection_source) 
DO UPDATE SET 
    projected_points = EXCLUDED.projected_points,
    floor_points = EXCLUDED.floor_points,
    ceiling_points = EXCLUDED.ceiling_points,
    updated_at = NOW();

-- Create function to get player projections
CREATE OR REPLACE FUNCTION get_player_projection(
    p_player_id VARCHAR(50),
    p_week INTEGER,
    p_season INTEGER
) RETURNS TABLE (
    projected_points DECIMAL(5,2),
    floor_points DECIMAL(5,2),
    ceiling_points DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.projected_points,
        p.floor_points,
        p.ceiling_points
    FROM projections p
    WHERE p.player_id = p_player_id 
      AND p.week = p_week 
      AND p.season = p_season
    ORDER BY p.updated_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;