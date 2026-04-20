-- Add new columns to tu_van_lead table for enhanced lead management
-- Run this SQL to update your database

ALTER TABLE tu_van_lead 
ADD COLUMN trung_tam VARCHAR(100) DEFAULT 'NTA_English',
ADD COLUMN tu_van_vien VARCHAR(255) DEFAULT 'NGUYỄN THẾ ANH',
ADD COLUMN khoi_tao VARCHAR(255),
ADD COLUMN cap_nhat_gan_nhat VARCHAR(255);

-- Update existing records with default values
UPDATE tu_van_lead SET trung_tam = 'NTA_English' WHERE trung_tam IS NULL OR trung_tam = '';
UPDATE tu_van_lead SET tu_van_vien = 'NGUYỄN THẾ ANH' WHERE tu_van_vien IS NULL OR tu_van_vien = '';
UPDATE tu_van_lead SET khoi_tao = CONCAT('NGUYỄN THẾ ANH ', DATE_FORMAT(NOW(), '%d/%m/%Y %H:%i')) WHERE khoi_tao IS NULL OR khoi_tao = '';
UPDATE tu_van_lead SET cap_nhat_gan_nhat = CONCAT('NGUYỄN THẾ ANH ', DATE_FORMAT(NOW(), '%d/%m/%Y %H:%i')) WHERE cap_nhat_gan_nhat IS NULL OR cap_nhat_gan_nhat = '';