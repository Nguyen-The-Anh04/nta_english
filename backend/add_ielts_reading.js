/**
 * Script thêm câu hỏi reading mẫu từ file PDF có sẵn
 * Chạy: node backend/add_ielts_reading.js
 */
const sequelize = require('./src/config/db');
const { DeThi, CauHoi } = require('./src/models/ExamModels');

async function addIeltsReading() {
  try {
    await sequelize.sync();
    
    // Tìm đề thi đã tạo
    const deThi = await DeThi.findByPk(2);
    if (!deThi) {
      console.log('❌ Không tìm thấy đề thi ID 2');
      process.exit(1);
    }
    
    console.log('📋 Thêm câu hỏi IELTS Reading cho đề:', deThi.ten_de);
    
    // Xóa câu hỏi cũ
    await CauHoi.destroy({ where: { de_thi_id: 2 } });
    
    // Tạo 40 câu hỏi IELTS Reading mẫu (dạng điền từ/trắc nghiệm)
    const cauHois = [];
    
    // Part 1: Multiple Choice (câu 1-10)
    const part1Questions = [
      { noi_dung: "The main topic of the passage is about...", lua_chon: { A: "Climate change effects", B: "Ocean pollution", C: "Forest conservation", D: "Renewable energy" }, dap_an: "A" },
      { noi_dung: "According to paragraph 1, the author mentions that...", lua_chon: { A: "All countries agree on the solution", B: "The problem is getting worse", C: "Immediate action is not needed", D: "Scientists disagree on the cause" }, dap_an: "B" },
      { noi_dung: "The word 'significant' in paragraph 2 could be best replaced by...", lua_chon: { A: "Small", B: "Important", C: "Temporary", D: "Negative" }, dap_an: "B" },
      { noi_dung: "Which of the following is NOT mentioned as a consequence?", lua_chon: { A: "Rising sea levels", B: "Extreme weather", C: "Economic growth", D: "Species extinction" }, dap_an: "C" },
      { noi_dung: "The author's attitude toward the issue can be described as...", lua_chon: { A: "Indifferent", B: "Optimistic", C: "Concerned", D: " humorous" }, dap_an: "C" },
      { noi_dung: "In paragraph 3, the author states that...", lua_chon: { A: "Governments are taking sufficient action", B: "More funding is needed", C: "The problem has been solved", D: "Experts disagree on solutions" }, dap_an: "B" },
      { noi_dung: "The phrase 'time is running out' implies that...", lua_chon: { A: "We have plenty of time", B: "Urgent action is needed", C: "The deadline is flexible", D: "We should wait longer" }, dap_an: "B" },
      { noi_dung: "According to the passage, which country is mentioned as a good example?", lua_chon: { A: "United States", B: "China", C: "Germany", D: "Japan" }, dap_an: "C" },
      { noi_dung: "The word 'mitigate' in paragraph 4 means...", lua_chon: { A: "Ignore", B: "Reduce", C: "Increase", D: "Celebrate" }, dap_an: "B" },
      { noi_dung: "What is the author's main purpose in writing this passage?", lua_chon: { A: "To entertain readers", B: "To persuade action", C: "To criticize governments", D: "To present historical facts" }, dap_an: "B" },
    ];
    
    // Part 2: True/False/Not Given (câu 11-20)
    const part2Questions = [
      { noi_dung: "The Earth's temperature has increased by 2°C in the past century.", lua_chon: { A: "True", B: "False", C: "Not Given" }, dap_an: "B" },
      { noi_dung: "All scientists agree on the exact causes of climate change.", lua_chon: { A: "True", B: "False", C: "Not Given" }, dap_an: "B" },
      { noi_dung: "Renewable energy is becoming more affordable.", lua_chon: { A: "True", B: "False", C: "Not Given" }, dap_an: "A" },
      { noi_dung: "Climate change only affects polar bears.", lua_chon: { A: "True", B: "False", C: "Not Given" }, dap_an: "B" },
      { noi_dung: "The Paris Agreement was signed in 2015.", lua_chon: { A: "True", B: "False", C: "Not Given" }, dap_an: "A" },
      { noi_dung: "Electric vehicles are currently used by most people.", lua_chon: { A: "True", B: "False", C: "Not Given" }, dap_an: "C" },
      { noi_dung: "Deforestation contributes to climate change.", lua_chon: { A: "True", B: "False", C: "Not Given" }, dap_an: "A" },
      { noi_dung: "Climate change has no impact on human health.", lua_chon: { A: "True", B: "False", C: "Not Given" }, dap_an: "B" },
      { noi_dung: "Some countries have already reached net-zero emissions.", lua_chon: { A: "True", B: "False", C: "Not Given" }, dap_an: "C" },
      { noi_dung: "Individual actions can make a difference.", lua_chon: { A: "True", B: "False", C: "Not Given" }, dap_an: "A" },
    ];
    
    // Part 3: Matching Headings (câu 21-30)
    const part3Questions = [
      { noi_dung: "Paragraph A describes the current state of the environment.", lua_chon: { A: "Current Situation", B: "Historical Context", C: "Future Predictions", D: "Solutions" }, dap_an: "A" },
      { noi_dung: "Paragraph B explains what happened in the past 100 years.", lua_chon: { A: "Current Situation", B: "Historical Context", C: "Future Predictions", D: "Solutions" }, dap_an: "B" },
      { noi_dung: "Paragraph C shows what might happen in coming decades.", lua_chon: { A: "Current Situation", B: "Historical Context", C: "Future Predictions", D: "Solutions" }, dap_an: "C" },
      { noi_dung: "Paragraph D presents ways to address the problem.", lua_chon: { A: "Current Situation", B: "Historical Context", C: "Future Predictions", D: "Solutions" }, dap_an: "D" },
      { noi_dung: "Paragraph E discusses government policies and actions.", lua_chon: { A: "Current Situation", B: "Historical Context", C: "Future Predictions", D: "Solutions" }, dap_an: "D" },
      { noi_dung: "Paragraph F examines the economic impacts.", lua_chon: { A: "Economic Effects", B: "Social Impacts", C: "Environmental Causes", D: "Technological Solutions" }, dap_an: "A" },
      { noi_dung: "Paragraph G looks at how communities are affected.", lua_chon: { A: "Economic Effects", B: "Social Impacts", C: "Environmental Causes", D: "Technological Solutions" }, dap_an: "B" },
      { noi_dung: "Paragraph H explains natural factors contributing to change.", lua_chon: { A: "Economic Effects", B: "Social Impacts", C: "Environmental Causes", D: "Technological Solutions" }, dap_an: "C" },
      { noi_dung: "Paragraph I describes new clean energy technologies.", lua_chon: { A: "Economic Effects", B: "Social Impacts", C: "Environmental Causes", D: "Technological Solutions" }, dap_an: "D" },
      { noi_dung: "Paragraph J concludes with a call for collective action.", lua_chon: { A: "Conclusion", B: "Introduction", C: "Methodology", D: "References" }, dap_an: "A" },
    ];
    
    // Part 4: Summary Completion (câu 31-40)
    const part4Questions = [
      { noi_dung: "The Earth's average temperature has ___ significantly over the past century.", lua_chon: { A: "decreased", B: "remained stable", C: "increased", D: "fluctuated" }, dap_an: "C" },
      { noi_dung: "Carbon dioxide is one of the main ___ gases in the atmosphere.", lua_chon: { A: "beneficial", B: "greenhouse", C: "natural", D: "rare" }, dap_an: "B" },
      { noi_dung: "Scientists warn that we must ___ emissions to avoid the worst effects.", lua_chon: { A: "increase", B: "maintain", C: "reduce", D: "ignore" }, dap_an: "C" },
      { noi_dung: "Renewable energy sources include solar, wind, and ___ power.", lua_chon: { A: "nuclear", B: "coal", C: "hydroelectric", D: "gas" }, dap_an: "C" },
      { noi_dung: "Many countries have set ___ targets to reduce their carbon footprint.", lua_chon: { A: "zero", B: "emission", C: "increase", D: "delay" }, dap_an: "B" },
      { noi_dung: "Climate change affects both human health and ___ systems.", lua_chon: { A: "entertainment", B: "educational", C: "ecosystem", D: "financial" }, dap_an: "C" },
      { noi_dung: "The Paris Agreement aims to limit global warming to ___ degrees Celsius.", lua_chon: { A: "1.5", B: "3", C: "5", D: "10" }, dap_an: "A" },
      { noi_dung: "Electric vehicles produce ___ emissions than traditional cars.", lua_chon: { A: "more", B: "the same", C: "fewer", D: "no" }, dap_an: "C" },
      { noi_dung: "Forests act as ___ sinks by absorbing carbon dioxide.", lua_chon: { A: "carbon", B: "oxygen", C: "nitrogen", D: "hydrogen" }, dap_an: "A" },
      { noi_dung: "Individual actions, such as reducing energy use, can ___ to the solution.", lua_chon: { A: "contribute", B: "hinder", C: "delay", D: "ignore" }, dap_an: "A" },
    ];
    
    // Combine all parts
    const allQuestions = [...part1Questions, ...part2Questions, ...part3Questions, ...part4Questions];
    
    // Add phan field (doc for all since no audio)
    allQuestions.forEach((q, i) => {
      cauHois.push({
        de_thi_id: 2,
        stt: i + 1,
        phan: 'doc',
        ky_nang: 'doc',
        noi_dung: q.noi_dung,
        lua_chon: JSON.stringify(q.lua_chon),
        dap_an_dung: q.dap_an,
        diem: 1,
      });
    });
    
    // Insert all questions
    await CauHoi.bulkCreate(cauHois);
    
    // Update de thi with correct counts
    await deThi.update({ so_cau_doc: 40, so_cau_nghe: 0 });
    
    console.log('✅ Đã thêm', cauHois.length, 'câu hỏi IELTS Reading');
    console.log('   - Multiple Choice: 10 câu');
    console.log('   - True/False/Not Given: 10 câu');
    console.log('   - Matching Headings: 10 câu');
    console.log('   - Summary Completion: 10 câu');
    console.log('\n✅ Hoàn tất! Học viên có thể làm bài test online.');
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Lỗi:', e.message);
    process.exit(1);
  }
}

addIeltsReading();