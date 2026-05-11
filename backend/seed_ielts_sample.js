/**
 * Script tạo đề thi IELTS mẫu từ template JSON
 * Chạy: node seed_ielts_sample.js
 */

const sequelize = require('./src/config/db');
const { DeThi, CauHoi } = require('./src/models/ExamModels');

const sampleIeltsTest = {
  ten_de: "IELTS Academic Test Sample - 3 Skills",
  mo_ta: "Đề thi IELTS Academic mẫu với 3 kỹ năng: Listening, Reading, Writing",
  loai: "ielts",
  thoi_gian_phut: 120,
  file_audio: null,
  so_cau_nghe: 12,
  so_cau_doc: 13,
  trang_thai: "hoat_dong",
  created_by: 1,
  json_data: JSON.stringify({
    ten_de: "IELTS Academic Test Sample - 3 Skills",
    mo_ta: "Đề thi IELTS Academic mẫu",
    loai: "ielts",
    thoi_gian_phut: 120,
    ky_nang: [
      {
        ten: "Listening",
        bai_tap: [
          {
            id: "L1",
            loai: "mcq",
            huong_dan: "You will hear a conversation between two people about a hotel booking. Answer the questions below.",
            audio: "",
            cau_hoi: [
              { so: 1, nhan: "What type of room does the customer want?", lua_chon: { A: "Single room", B: "Double room", C: "Twin room", D: "Suite" }, dap_an: "B", diem: 1 },
              { so: 2, nhan: "How many nights will they stay?", lua_chon: { A: "1 night", B: "2 nights", C: "3 nights", D: "4 nights" }, dap_an: "C", diem: 1 },
              { so: 3, nhan: "What is the total price?", lua_chon: { A: "$150", B: "$200", C: "$250", D: "$300" }, dap_an: "B", diem: 1 }
            ]
          },
          {
            id: "L2",
            loai: "fill_blank",
            huong_dan: "Fill in the blanks with the correct information from the recording.",
            audio: "",
            cau_hoi: [
              { so: 4, nhan: "The conference starts at", dap_an: "9:00", diem: 1 },
              { so: 5, nhan: "The venue is located at", dap_an: "Main Hall", diem: 1 },
              { so: 6, nhan: "Parking is available at", dap_an: "Car Park B", diem: 1 }
            ]
          },
          {
            id: "L3",
            loai: "true_false",
            huong_dan: "Write TRUE, FALSE, or NOT GIVEN.",
            audio: "",
            cau_hoi: [
              { so: 7, nhan: "The university offers free parking for all students.", dap_an: "FALSE", diem: 1 },
              { so: 8, nhan: "Library opening hours have been extended.", dap_an: "TRUE", diem: 1 },
              { so: 9, nhan: "Online registration is available.", dap_an: "NOT GIVEN", diem: 1 }
            ]
          }
        ]
      },
      {
        ten: "Reading",
        bai_tap: [
          {
            id: "R1",
            loai: "true_false",
            passage: "The Growth of Organic Farming\n\nOrganic farming has become increasingly popular over the past decade. This method of agriculture avoids the use of synthetic pesticides and chemical fertilizers. Instead, it relies on natural processes and techniques to maintain soil fertility.\n\nMany farmers have converted to organic methods due to consumer demand for healthier food. However, organic farming typically requires more labor and produces lower yields compared to conventional farming. Despite these challenges, the environmental benefits make it an attractive option for sustainable agriculture.\n\nThe certification process for organic products is rigorous. Farmers must follow strict guidelines for at least three years before their products can be labeled as organic. This has led some to criticize the system as too restrictive.",
            huong_dan: "Do the following statements agree with the information in the passage? Write TRUE, FALSE, or NOT GIVEN.",
            cau_hoi: [
              { so: 1, noi_dung: "Organic farming uses only natural pesticides.", dap_an: "TRUE", diem: 1 },
              { so: 2, noi_dung: "Organic farms always produce higher yields than conventional farms.", dap_an: "FALSE", diem: 1 },
              { so: 3, noi_dung: "Certification takes at least three years to complete.", dap_an: "TRUE", diem: 1 },
              { so: 4, noi_dung: "Organic farming requires less labor than conventional farming.", dap_an: "FALSE", diem: 1 },
              { so: 5, noi_dung: "All farmers can label their products as organic immediately.", dap_an: "NOT GIVEN", diem: 1 }
            ]
          },
          {
            id: "R2",
            loai: "mcq",
            passage: "The History of the Internet\n\nThe internet began as a military project in the 1960s. The US Department of Defense wanted to create a network that could survive a nuclear attack. ARPA (Advanced Research Projects Agency) was tasked with developing this system.\n\nIn 1969, the first message was sent between two computers at UCLA and Stanford Research Institute. This marked the beginning of what we now call the internet. Throughout the 1970s and 1980s, the network expanded to include universities and research institutions.\n\nThe World Wide Web was invented in 1989 by Tim Berners-Lee, a British scientist at CERN. He created the system of hypertext links that made the internet accessible to ordinary users. By the mid-1990s, millions of people were using the web daily.\n\nToday, the internet has transformed virtually every aspect of modern life, from communication to commerce to entertainment.",
            huong_dan: "Choose the best answer (A, B, C, or D) for each question.",
            cau_hoi: [
              { so: 6, noi_dung: "Why was the internet originally created?", lua_chon: { A: "For entertainment", B: "To survive nuclear attack", C: "For academic research", D: "For commercial use" }, dap_an: "B", diem: 1 },
              { so: 7, noi_dung: "Who invented the World Wide Web?", lua_chon: { A: "UCLA scientists", B: "US Department of Defense", C: "Tim Berners-Lee", D: "Stanford Research Institute" }, dap_an: "C", diem: 1 },
              { so: 8, noi_dung: "When did the internet become popular with ordinary users?", lua_chon: { A: "1960s", B: "1970s", C: "1980s", D: "Mid-1990s" }, dap_an: "D", diem: 1 }
            ]
          },
          {
            id: "R3",
            loai: "fill_blank",
            passage: "Climate Change Effects\n\nClimate change is affecting ecosystems around the world. Polar ice caps are melting, causing sea levels to rise. This threatens coastal communities and island nations. Temperature increases are also causing shifts in animal migration patterns and plant growing seasons.\n\nScientists warn that without immediate action, these effects will worsen. The Paris Agreement aims to limit global temperature rise to 1.5 degrees Celsius. However, current emission levels suggest this target may be missed.\n\nRenewable energy adoption is accelerating. Solar and wind power are now cost-competitive with fossil fuels. Electric vehicle sales are growing rapidly. These trends offer hope for reducing future climate impacts.",
            huong_dan: "Complete the summary below. Write NO MORE THAN TWO WORDS for each answer.",
            cau_hoi: [
              { so: 9, noi_dung: "Polar ice caps are causing sea levels to ___", dap_an: "rise", diem: 1 },
              { so: 10, noi_dung: "The Paris Agreement aims to limit temperature rise to ___ degrees.", dap_an: "1.5", diem: 1 },
              { so: 11, noi_dung: "Solar and ___ power are now cost-competitive.", dap_an: "wind", diem: 1 }
            ]
          }
        ]
      },
      {
        ten: "Writing",
        bai_tap: [
          {
            id: "W1",
            loai: "essay",
            huong_dan: "The bar chart below shows the number of books read by students in a university library in 2010, 2015, and 2020.\n\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
            cau_hoi: [
              { so: 1, noi_dung: "Task 1: Write a minimum of 150 words about the bar chart.", diem: 10 }
            ]
          },
          {
            id: "W2",
            loai: "essay",
            huong_dan: "Some people believe that university students should study whatever they like. Others think that they should only be allowed to study subjects that will be useful in the future, such as those related to science and technology.\n\nDiscuss both these views and give your own opinion.\n\nWrite at least 250 words.",
            cau_hoi: [
              { so: 2, noi_dung: "Task 2: Write an essay of at least 250 words (will be graded manually).", diem: 20 }
            ]
          }
        ]
      }
    ]
  })
};

async function seedIeltsTest() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Check if already exists
    const existing = await DeThi.findOne({ where: { ten_de: sampleIeltsTest.ten_de } });
    if (existing) {
      console.log("ℹ️ Đề thi đã tồn tại, bỏ qua...");
      process.exit(0);
    }

    // Create exam
    const deThi = await DeThi.create(sampleIeltsTest);
    console.log("✅ Đề thi đã được tạo:", deThi.id);

    // Parse JSON to create questions
    const jsonData = JSON.parse(sampleIeltsTest.json_data);
    let stt = 1;
    let cauHoiList = [];

    jsonData.ky_nang.forEach(ky => {
      const phan = ky.ten.toLowerCase().includes("listen") ? "nghe" 
                 : ky.ten.toLowerCase().includes("writ") ? "viet" : "doc";
      
      ky.bai_tap.forEach(bt => {
        bt.cau_hoi.forEach(cq => {
          cauHoiList.push({
            de_thi_id: deThi.id,
            stt: stt++,
            phan: phan,
            ky_nang: phan,
            noi_dung: cq.nhan || cq.noi_dung || "",
            lua_chon: cq.lua_chon ? JSON.stringify(cq.lua_chon) : null,
            dap_an_dung: Array.isArray(cq.dap_an) ? cq.dap_an[0] : cq.dap_an,
            diem: cq.diem || 1,
          });
        });
      });
    });

    await CauHoi.bulkCreate(cauHoiList);
    console.log(`✅ Đã tạo ${cauHoiList.length} câu hỏi`);

    process.exit(0);
  } catch (e) {
    console.error("❌ Lỗi:", e.message);
    process.exit(1);
  }
}

seedIeltsTest();