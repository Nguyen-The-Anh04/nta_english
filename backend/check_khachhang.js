const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

async function checkKhachHang() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'tanhutehyk20',
      database: process.env.DB_NAME || 'nta_english'
    });

    console.log('✅ Kết nối database thành công!');
    
    // Kiểm tra xem bảng khach_hang có tồn tại không
    const [tables] = await connection.execute('SHOW TABLES LIKE "khach_hang"');
    
    if (tables.length === 0) {
      console.log('❌ Bảng khach_hang KHÔNG tồn tại trong database!');
    } else {
      console.log('✅ Bảng khach_hang TỒN TẠI');
      
      // Đếm số lượng khách hàng
      const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM khach_hang');
      console.log(`📊 Tổng số khách hàng: ${countResult[0].total}`);
      
      // Lấy dữ liệu khách hàng
      const [customers] = await connection.execute('SELECT * FROM khach_hang LIMIT 10');
      
      if (customers.length > 0) {
        console.log('\n📋 Dữ liệu khách hàng:');
        console.table(customers);
      } else {
        console.log('❌ Bảng khach_hang TRỐNG - Chưa có dữ liệu khách hàng!');
      }
    }
    
    // Kiểm tra bảng tu_van_lead (lead/khách hàng tiềm năng)
    console.log('\n===== KIỂM TRA TU_VAN_LEAD =====');
    const [leads] = await connection.execute('SELECT * FROM tu_van_lead LIMIT 10');
    console.log(`📊 Dữ liệu từ bảng tu_van_lead: ${leads.length} records`);
    if (leads.length > 0) {
      console.table(leads);
    }

    // Kiểm tra bảng nguoi_dung (người dùng/học viên)
    console.log('\n===== KIỂM TRA NGUOI_DUNG =====');
    const [users] = await connection.execute('SELECT id, email, ho_ten, sdt, trang_thai FROM nguoi_dung LIMIT 10');
    console.log(`📊 Dữ liệu từ bảng nguoi_dung: ${users.length} records`);
    if (users.length > 0) {
      console.table(users);
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

checkKhachHang();