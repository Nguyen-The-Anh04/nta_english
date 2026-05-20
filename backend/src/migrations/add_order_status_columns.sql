-- Migration: Tách trạng thái đơn hàng thành 3 cột riêng biệt
-- order_status  : trạng thái đơn hàng tổng thể
-- payment_status: trạng thái thanh toán
-- shipping_status: trạng thái vận chuyển

ALTER TABLE don_hang
  ADD COLUMN order_status ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending' AFTER trang_thai,
  ADD COLUMN payment_status ENUM('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid' AFTER order_status,
  ADD COLUMN shipping_status ENUM('not_shipped','shipping','delivered','returned') NOT NULL DEFAULT 'not_shipped' AFTER payment_status;

-- Sync dữ liệu cũ từ trang_thai sang 3 cột mới
UPDATE don_hang SET
  order_status    = CASE trang_thai
                      WHEN 'cho_tt'    THEN 'pending'
                      WHEN 'da_tt'     THEN 'confirmed'
                      WHEN 'dang_giao' THEN 'confirmed'
                      WHEN 'da_giao'   THEN 'completed'
                      WHEN 'da_huy'    THEN 'cancelled'
                      ELSE 'pending'
                    END,
  payment_status  = CASE trang_thai
                      WHEN 'cho_tt'    THEN 'unpaid'
                      WHEN 'da_tt'     THEN 'paid'
                      WHEN 'dang_giao' THEN 'paid'
                      WHEN 'da_giao'   THEN 'paid'
                      WHEN 'da_huy'    THEN 'unpaid'
                      ELSE 'unpaid'
                    END,
  shipping_status = CASE trang_thai
                      WHEN 'cho_tt'    THEN 'not_shipped'
                      WHEN 'da_tt'     THEN 'not_shipped'
                      WHEN 'dang_giao' THEN 'shipping'
                      WHEN 'da_giao'   THEN 'delivered'
                      WHEN 'da_huy'    THEN 'not_shipped'
                      ELSE 'not_shipped'
                    END;
