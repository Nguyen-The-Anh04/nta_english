/**
 * Script tạo đề thi mẫu từ file có sẵn trong thư mục uploads
 * Chạy: node backend/seed_de_thi.js
 */
const sequelize = require('./src/config/db');
const { DeThi, CauHoi } = require('./src/models/ExamModels');

async function seedDeThi() {
  try {
    await sequelize.sync();
    
    // Tạo đề thi IELTS Reading từ file có sẵn
    const [deThi, created] = await DeThi.findOrCreate({
      where: { ten_de: 'IELTS Reading - Đề thi mẫu 1' },
      defaults: {
        ten_de: 'IELTS Reading - Đề thi mẫu 1',
        mo_ta: 'Đề thi IELTS Reading sử dụng file PDF có sẵn trong hệ thống',
        loai: 'ielts',
        thoi_gian_phut: 60,
        file_pdf: '1 - Đề thi IELTS Reading.pdf',
        // Không có file audio cho đề reading
        so_cau_nghe: 0,
        so_cau_doc: 40, // IELTS Reading thường có 40 câu
        trang_thai: 'hoat_dong',
        created_by: 1,
      },
    });

    if (!created) {
      console.log('Đề thi đã tồn tại, cập nhật lại...');
      await deThi.update({
        file_pdf: '1 - Đề thi IELTS Reading.pdf',
        so_cau_doc: 40,
      });
    }

    console.log('✅ Đề thi đã được tạo:', deThi.ten_de);

    // Thêm câu hỏi mẫu cho phần Reading (không có phần Nghe)
    const cauHois = [];
    
    // Tạo 5 câu hỏi mẫu để test
    for (let i = 1; i <= 5; i++) {
      cauHois.push({
        de_thi_id: deThi.id,
        stt: i,
        phan: 'doc',
        ky_nang: 'doc',
        noi_dung: `Câu hỏi mẫu ${i}: What is the main idea of the passage?`,
        lua_chon: JSON.stringify({
          A: 'Option A - Sample answer for question ' + i,
          B: 'Option B - Sample answer for question ' + i,
          C: 'Option C - Sample answer for question ' + i,
          D: 'Option D - Sample answer for question ' + i,
        }),
        dap_an_dung: 'A',
        diem: 1,
      });
    }

    // Xóa câu hỏi cũ nếu có
    await CauHoi.destroy({ where: { de_thi_id: deThi.id } });
    
    // Thêm câu hỏi mới
    await CauHoi.bulkCreate(cauHois);
    
    console.log('✅ Đã thêm', cauHois.length, 'câu hỏi mẫu');

    // Hiển thị thông tin
    console.log('\n📋 Thông tin đề thi:');
    console.log('   - ID:', deThi.id);
    console.log('   - Tên:', deThi.ten_de);
    console.log('   - File PDF:', deThi.file_pdf);
    console.log('   - Thời gian:', deThi.thoi_gian_phut, 'phút');
    console.log('   - Số câu Nghe:', deThi.so_cau_nghe);
    console.log('   - Số câu Đọc:', deThi.so_cau_doc);

    console.log('\n✅ Seed hoàn tất!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Lỗi:', e.message);
    process.exit(1);
  }
}

seedDeThi();