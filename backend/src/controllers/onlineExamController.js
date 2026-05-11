const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// ==================== EXAMS API ====================

// GET /api/online-exams - Lấy danh sách đề thi
const getAllExams = async (req, res) => {
  try {
    const exams = await sequelize.query(`
      SELECT id, title, description, duration, status, created_at
      FROM online_exams
      ORDER BY created_at DESC
    `, { type: QueryTypes.SELECT });
    
    res.json({ success: true, data: exams });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/online-exams/:id - Lấy chi tiết đề thi với sections và questions
const getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy exam
    const [exam] = await sequelize.query(`
      SELECT * FROM online_exams WHERE id = ?
    `, { replacements: [id], type: QueryTypes.SELECT });
    
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đề thi' });
    }
    
    // Lấy sections
    const sections = await sequelize.query(`
      SELECT * FROM online_sections 
      WHERE exam_id = ? 
      ORDER BY order_index
    `, { replacements: [id], type: QueryTypes.SELECT });
    
    // Lấy questions và answers cho mỗi section
    for (let section of sections) {
      const questions = await sequelize.query(`
        SELECT * FROM online_questions 
        WHERE section_id = ? 
        ORDER BY question_order
      `, { replacements: [section.id], type: QueryTypes.SELECT });
      
      // Lấy answers cho mỗi question (KHÔNG gửi đáp án đúng cho user)
      for (let q of questions) {
        const answers = await sequelize.query(`
          SELECT id, answer_text, answer_order 
          FROM online_answers 
          WHERE question_id = ?
          ORDER BY answer_order
        `, { replacements: [q.id], type: QueryTypes.SELECT });
        
        q.answers = answers;
        // Không gửi is_correct về phía client
      }
      
      section.questions = questions;
    }
    
    exam.sections = sections;
    
    res.json({ success: true, data: exam });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/online-exams - Tạo đề thi mới
const createExam = async (req, res) => {
  try {
    const { title, description, duration, status } = req.body;
    
    const [result] = await sequelize.query(`
      INSERT INTO online_exams (title, description, duration, status)
      VALUES (?, ?, ?, ?)
    `, { 
      replacements: [title, description || '', duration || 60, status || 'draft'],
      type: QueryTypes.INSERT
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Tạo đề thi thành công',
      data: { id: result }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PUT /api/online-exams/:id - Cập nhật đề thi
const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, status } = req.body;
    
    await sequelize.query(`
      UPDATE online_exams 
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          duration = COALESCE(?, duration),
          status = COALESCE(?, status)
      WHERE id = ?
    `, { 
      replacements: [title, description, duration, status, id],
      type: QueryTypes.UPDATE
    });
    
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE /api/online-exams/:id - Xóa đề thi
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    
    await sequelize.query(`DELETE FROM online_exams WHERE id = ?`, { 
      replacements: [id],
      type: QueryTypes.DELETE
    });
    
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ==================== SECTIONS API ====================

// POST /api/online-sections - Tạo section mới
const createSection = async (req, res) => {
  try {
    const { exam_id, type, title, content, audio_url, audio_filename, section_order } = req.body;
    
    const [result] = await sequelize.query(`
      INSERT INTO online_sections (exam_id, type, title, content, audio_url, audio_filename, section_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, { 
      replacements: [exam_id, type, title || '', content || '', audio_url || null, audio_filename || null, section_order || 1],
      type: QueryTypes.INSERT
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Tạo section thành công',
      data: { id: result }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PUT /api/online-sections/:id - Cập nhật section
const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, audio_url, audio_filename } = req.body;
    
    await sequelize.query(`
      UPDATE online_sections 
      SET title = COALESCE(?, title),
          content = COALESCE(?, content),
          audio_url = COALESCE(?, audio_url),
          audio_filename = COALESCE(?, audio_filename)
      WHERE id = ?
    `, { 
      replacements: [title, content, audio_url, audio_filename, id],
      type: QueryTypes.UPDATE
    });
    
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE /api/online-sections/:id - Xóa section
const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    
    await sequelize.query(`DELETE FROM online_sections WHERE id = ?`, { 
      replacements: [id],
      type: QueryTypes.DELETE
    });
    
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ==================== QUESTIONS API ====================

// POST /api/online-questions - Tạo câu hỏi mới
const createQuestion = async (req, res) => {
  try {
    const { section_id, question_text, question_type, order_index, points } = req.body;
    
    const [result] = await sequelize.query(`
      INSERT INTO online_questions (section_id, question_text, question_type, order_index, points)
      VALUES (?, ?, ?, ?, ?)
    `, { 
      replacements: [section_id, question_text, question_type || 'multiple_choice', order_index || 1, points || 1],
      type: QueryTypes.INSERT
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Tạo câu hỏi thành công',
      data: { id: result }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE /api/online-questions/:id - Xóa câu hỏi
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    await sequelize.query(`DELETE FROM online_questions WHERE id = ?`, { 
      replacements: [id],
      type: QueryTypes.DELETE
    });
    
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ==================== ANSWERS API ====================

// POST /api/online-answers - Tạo đáp án
const createAnswer = async (req, res) => {
  try {
    const { question_id, answer_text, is_correct, answer_order } = req.body;
    
    const [result] = await sequelize.query(`
      INSERT INTO online_answers (question_id, answer_text, is_correct, answer_order)
      VALUES (?, ?, ?, ?)
    `, { 
      replacements: [question_id, answer_text, is_correct || false, answer_order || 1],
      type: QueryTypes.INSERT
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Tạo đáp án thành công',
      data: { id: result }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE /api/online-answers/:id - Xóa đáp án
const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    
    await sequelize.query(`DELETE FROM online_answers WHERE id = ?`, { 
      replacements: [id],
      type: QueryTypes.DELETE
    });
    
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ==================== SUBMIT/GRADING API ====================

// POST /api/online-submit - Nộp bài và chấm điểm
const submitExam = async (req, res) => {
  try {
    const { exam_id, user_id, answers, time_spent } = req.body;
    
    // Tạo kết quả
    const [resultId] = await sequelize.query(`
      INSERT INTO online_results (user_id, exam_id, time_spent, status, started_at)
      VALUES (?, ?, ?, 'completed', NOW())
    `, { 
      replacements: [user_id, exam_id, time_spent || 0],
      type: QueryTypes.INSERT
    });
    
    // Lấy tất cả câu hỏi của exam
    const questions = await sequelize.query(`
      SELECT q.id, q.question_text, q.question_type, q.points, a.id as answer_id, a.answer_text, a.is_correct
      FROM online_questions q
      JOIN online_sections s ON q.section_id = s.id
      JOIN online_answers a ON q.id = a.question_id AND a.is_correct = TRUE
      WHERE s.exam_id = ?
    `, { replacements: [exam_id], type: QueryTypes.SELECT });
    
    // Map correct answers
    const correctAnswers = {};
    questions.forEach(q => {
      if (!correctAnswers[q.id]) {
        correctAnswers[q.id] = q.answer_text;
      }
    });
    
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    
    // Lưu từng câu trả lời
    for (const [question_id, selected_answer] of Object.entries(answers)) {
      const isCorrect = correctAnswers[question_id] === selected_answer;
      const question = questions.find(q => q.id === parseInt(question_id));
      const points = question ? parseFloat(question.points) : 1;
      
      if (isCorrect) {
        correctCount++;
        earnedPoints += points;
      }
      totalPoints += points;
      
      await sequelize.query(`
        INSERT INTO online_user_answers (result_id, question_id, selected_answer, is_correct, points_earned)
        VALUES (?, ?, ?, ?, ?)
      `, { 
        replacements: [resultId, question_id, selected_answer, isCorrect, isCorrect ? points : 0],
        type: QueryTypes.INSERT
      });
    }
    
    // Cập nhật điểm
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 10 : 0;
    
    await sequelize.query(`
      UPDATE online_results 
      SET score = ?, total_questions = ?, correct_answers = ?, completed_at = NOW()
      WHERE id = ?
    `, { 
      replacements: [score, Object.keys(answers).length, correctCount, resultId],
      type: QueryTypes.UPDATE
    });
    
    // Lấy kết quả chi tiết
    const [result] = await sequelize.query(`
      SELECT * FROM online_results WHERE id = ?
    `, { replacements: [resultId], type: QueryTypes.SELECT });
    
    res.json({
      success: true,
      data: {
        ...result,
        correct_count: correctCount,
        total_questions: Object.keys(answers).length,
        score: score.toFixed(2)
      },
      message: `Hoàn thành! Đúng ${correctCount}/${Object.keys(answers).length} câu. Điểm: ${score.toFixed(1)}`
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/online-results/:userId - Lấy kết quả của user
const getUserResults = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const results = await sequelize.query(`
      SELECT r.*, e.title as exam_title, e.duration
      FROM online_results r
      JOIN online_exams e ON r.exam_id = e.id
      WHERE r.user_id = ?
      ORDER BY r.started_at DESC
    `, { replacements: [userId], type: QueryTypes.SELECT });
    
    res.json({ success: true, data: results });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/online-start - Bắt đầu làm bài (tạo result record)
const startExam = async (req, res) => {
  try {
    const { exam_id, user_id } = req.body;
    
    // Kiểm tra đã có bài đang làm chưa
    const [existing] = await sequelize.query(`
      SELECT id FROM online_results 
      WHERE user_id = ? AND exam_id = ? AND status = 'in_progress'
    `, { replacements: [user_id, exam_id], type: QueryTypes.SELECT });
    
    if (existing) {
      return res.json({ 
        success: true, 
        data: { result_id: existing.id, is_resume: true }
      });
    }
    
    // Tạo mới
    const [resultId] = await sequelize.query(`
      INSERT INTO online_results (user_id, exam_id, status, started_at)
      VALUES (?, ?, 'in_progress', NOW())
    `, { 
      replacements: [user_id, exam_id],
      type: QueryTypes.INSERT
    });
    
    res.json({ 
      success: true, 
      data: { result_id: resultId, is_resume: false }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  createSection,
  updateSection,
  deleteSection,
  createQuestion,
  deleteQuestion,
  createAnswer,
  deleteAnswer,
  submitExam,
  getUserResults,
  startExam
};