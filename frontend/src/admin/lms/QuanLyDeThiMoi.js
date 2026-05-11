import { useState, useEffect } from 'react';
import { onlineExamAPI } from '../../api';

const S = {
  page: { padding: '24px', background: '#f9fafb', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 },
  btnPrimary: { background: '#111827', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  btnSecondary: { background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12, marginRight: 6 },
  btnSuccess: { background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  btnWarning: { background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  btnDanger: { background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  card: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: 24 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#111827', color: '#fff', padding: '10px 14px', textAlign: 'left', fontSize: 13, fontWeight: 600 },
  td: { padding: '10px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6' },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  badgeSuccess: { background: '#d1fae5', color: '#065f46' },
  badgeWarning: { background: '#fef3c7', color: '#92400e' },
  badgeDanger: { background: '#fee2e2', color: '#991b1b' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: (w) => ({ background: '#fff', borderRadius: 10, padding: 28, width: w, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }),
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 },
  input: { width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', fontSize: 13, boxSizing: 'border-box', outline: 'none' },
  select: { width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', fontSize: 13, boxSizing: 'border-box', background: '#fff' },
  textarea: { width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', fontSize: 13, boxSizing: 'border-box', resize: 'vertical', minHeight: 72 },
  formRow: { marginBottom: 14 },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #f3f4f6' },
  tabBtn: (active) => ({
    padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
    background: active ? '#111827' : '#f3f4f6', color: active ? '#fff' : '#374151',
    borderRadius: 6, marginRight: 8
  }),
};

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('token');

export default function QuanLyDeThiMoi() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  
  // Form states
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    exam_type: 'ielts',
    duration: 60,
    status: 'draft'
  });
  
  const [sectionForm, setSectionForm] = useState({
    title: '',
    type: 'reading', // reading or listening
    content: '',
    audio_url: null,
    order_index: 1
  });
  
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_order: 1,
    answers: [
      { answer_text: '', answer_order: 'A', is_correct: false },
      { answer_text: '', answer_order: 'B', is_correct: false },
      { answer_text: '', answer_order: 'C', is_correct: false },
      { answer_text: '', answer_order: 'D', is_correct: false }
    ]
  });

  const [hoverRow, setHoverRow] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { loadExams(); }, []);

  const loadExams = async () => {
    setLoading(true);
    try {
      const res = await onlineExamAPI.getAllExams();
      setExams(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadSections = async (examId) => {
    try {
      const res = await onlineExamAPI.getExamById(examId);
      if (res.success) {
        setSections(res.data.sections || []);
      }
    } catch (e) { console.error(e); }
  };

  const loadQuestions = async (sectionId) => {
    try {
      const res = await onlineExamAPI.getQuestions(sectionId);
      setQuestions(res.data || []);
    } catch (e) { console.error(e); }
  };

  const loadResults = async (examId) => {
    try {
      const res = await onlineExamAPI.getResults(examId);
      setResults(res.data || []);
    } catch (e) { console.error(e); }
  };

  // Create exam
  const handleCreateExam = async () => {
    if (!examForm.title) { alert('Vui lòng nhập tên đề thi!'); return; }
    try {
      const res = await onlineExamAPI.createExam(examForm);
      if (res.success) {
        alert('Tạo đề thi thành công!');
        setShowExamModal(false);
        setExamForm({ title: '', description: '', exam_type: 'ielts', duration: 60, status: 'draft' });
        loadExams();
      } else {
        alert('Lỗi: ' + res.message);
      }
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  // Update exam status (publish/unpublish)
  const handlePublishExam = async (exam, newStatus) => {
    if (!window.confirm(newStatus === 'published' ? 'Công bố đề thi để học viên có thể làm bài?' : 'Hủy công bố đề thi?')) return;
    try {
      const res = await onlineExamAPI.updateExam(exam.id, { status: newStatus });
      if (res.success) {
        alert('Cập nhật trạng thái thành công!');
        loadExams();
      } else {
        alert('Lỗi: ' + res.message);
      }
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  // Delete exam
  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Xóa đề thi này?')) return;
    try {
      const res = await onlineExamAPI.deleteExam(examId);
      if (res.success) {
        alert('Xóa đề thi thành công!');
        loadExams();
        setSelectedExam(null);
        setSections([]);
      } else {
        alert('Lỗi: ' + res.message);
      }
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  // Create section
  const handleCreateSection = async () => {
    if (!sectionForm.title) { alert('Vui lòng nhập tên phần!'); return; }
    try {
      const res = await onlineExamAPI.createSection({
        ...sectionForm,
        exam_id: selectedExam.id
      });
      if (res.success) {
        alert('Tạo phần thi thành công!');
        setShowSectionModal(false);
        setSectionForm({ title: '', type: 'reading', content: '', audio_url: null, order_index: 1 });
        loadSections(selectedExam.id);
      } else {
        alert('Lỗi: ' + res.message);
      }
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  // Delete section
  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Xóa phần thi này?')) return;
    try {
      const res = await onlineExamAPI.deleteSection(sectionId);
      if (res.success) {
        loadSections(selectedExam.id);
      } else {
        alert('Lỗi: ' + res.message);
      }
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  // Create question with answers
  const handleCreateQuestion = async () => {
    if (!questionForm.question_text) { alert('Vui lòng nhập nội dung câu hỏi!'); return; }
    const correctAnswers = questionForm.answers.filter(a => a.is_correct);
    if (correctAnswers.length === 0) { alert('Vui lòng chọn đáp án đúng!'); return; }
    
    try {
      const res = await onlineExamAPI.createQuestion({
        section_id: selectedSection.id,
        question_text: questionForm.question_text,
        question_order: questionForm.question_order,
        answers: questionForm.answers
      });
      if (res.success) {
        alert('Tạo câu hỏi thành công!');
        setShowQuestionModal(false);
        setQuestionForm({
          question_text: '',
          question_order: questions.length + 1,
          answers: [
            { answer_text: '', answer_order: 'A', is_correct: false },
            { answer_text: '', answer_order: 'B', is_correct: false },
            { answer_text: '', answer_order: 'C', is_correct: false },
            { answer_text: '', answer_order: 'D', is_correct: false }
          ]
        });
        loadQuestions(selectedSection.id);
      } else {
        alert('Lỗi: ' + res.message);
      }
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Xóa câu hỏi này?')) return;
    try {
      const res = await onlineExamAPI.deleteQuestion(questionId);
      if (res.success) {
        loadQuestions(selectedSection.id);
      } else {
        alert('Lỗi: ' + res.message);
      }
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  // Update answer option
  const updateAnswer = (index, field, value) => {
    const newAnswers = [...questionForm.answers];
    if (field === 'is_correct' && value === true) {
      // Uncheck all others if this is radio behavior
      newAnswers.forEach((a, i) => { a.is_correct = (i === index); });
    } else {
      newAnswers[index][field] = value;
    }
    setQuestionForm({ ...questionForm, answers: newAnswers });
  };

  // View exam details
  const handleViewExam = (exam) => {
    setSelectedExam(exam);
    loadSections(exam.id);
  };

  // View section questions
  const handleViewSection = (section) => {
    setSelectedSection(section);
    loadQuestions(section.id);
  };

  // View results
  const handleViewResults = (exam) => {
    setSelectedExam(exam);
    loadResults(exam.id);
    setShowResultModal(true);
  };

  const examTypeLabel = { ielts: 'IELTS', toeic: 'TOEIC', giao_tiep: 'Giao tiếp' };
  const statusLabel = { draft: 'Nháp', published: 'Đã công bố' };

  const filteredExams = filterStatus === 'all' 
    ? exams 
    : exams.filter(e => e.status === filterStatus);

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>📝 Quản lý đề thi Online (Mới)</h1>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>
            Hệ thống thi Listening và Reading mới
          </p>
        </div>
        <button style={S.btnPrimary} onClick={() => setShowExamModal(true)}>
          + Tạo đề thi mới
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button style={S.tabBtn(filterStatus === 'all')} onClick={() => setFilterStatus('all')}>Tất cả</button>
        <button style={S.tabBtn(filterStatus === 'draft')} onClick={() => setFilterStatus('draft')}>Nháp</button>
        <button style={S.tabBtn(filterStatus === 'published')} onClick={() => setFilterStatus('published')}>Đã công bố</button>
      </div>

      {/* Exam list */}
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              {['#', 'Tên đề', 'Loại', 'Thời gian', 'Số phần', 'Trạng thái', 'Actions'].map(h => 
                <th key={h} style={S.th}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#9ca3af' }}>Đang tải...</td></tr>
            ) : filteredExams.length === 0 ? (
              <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#9ca3af' }}>Chưa có đề thi nào</td></tr>
            ) : filteredExams.map((exam, i) => (
              <tr key={exam.id} 
                onMouseEnter={() => setHoverRow(exam.id)} 
                onMouseLeave={() => setHoverRow(null)}
                style={{ background: hoverRow === exam.id ? '#f9fafb' : '#fff' }}>
                <td style={S.td}>{i + 1}</td>
                <td style={{ ...S.td, fontWeight: 600 }}>{exam.title}</td>
                <td style={S.td}>
                  <span style={{ ...S.badge, background: '#eff6ff', color: '#1d4ed8' }}>
                    {examTypeLabel[exam.exam_type] || exam.exam_type}
                  </span>
                </td>
                <td style={S.td}>{exam.duration} phút</td>
                <td style={S.td}>{exam.sections?.length || 0}</td>
                <td style={S.td}>
                  <span style={{ 
                    ...S.badge, 
                    background: exam.status === 'published' ? '#d1fae5' : '#fef3c7', 
                    color: exam.status === 'published' ? '#065f46' : '#92400e' 
                  }}>
                    {statusLabel[exam.status] || exam.status}
                  </span>
                </td>
                <td style={S.td}>
                  <button style={S.btnSecondary} onClick={() => handleViewExam(exam)}>Chi tiết</button>
                  <button style={S.btnSecondary} onClick={() => handleViewResults(exam)}>Kết quả</button>
                  <button 
                    style={exam.status === 'published' ? S.btnWarning : S.btnSuccess}
                    onClick={() => handlePublishExam(exam, exam.status === 'published' ? 'draft' : 'published')}
                  >
                    {exam.status === 'published' ? '⏸ Dừng' : '✅ Công bố'}
                  </button>
                  <button style={S.btnDanger} onClick={() => handleDeleteExam(exam.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sections panel */}
      {selectedExam && !showResultModal && (
        <div style={S.card}>
          <div style={S.panelHeader}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              📋 Các phần thi — {selectedExam.title}
            </span>
            <div>
              <button style={S.btnPrimary} onClick={() => setShowSectionModal(true)}>Thêm phần</button>
              <button style={{ ...S.btnSecondary, marginLeft: 8 }} onClick={() => { setSelectedExam(null); setSections([]); }}>Đóng</button>
            </div>
          </div>
          {sections.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
              Chưa có phần thi nào. Hãy thêm phần Listening hoặc Reading.
            </div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  {['STT', 'Tên phần', 'Loại', 'Số câu', 'Actions'].map(h => 
                    <th key={h} style={S.th}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sections.map((section, i) => (
                  <tr key={section.id}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={{ ...S.td, fontWeight: 600 }}>{section.title}</td>
                    <td style={S.td}>
                      <span style={{ 
                        ...S.badge, 
                        background: section.type === 'listening' ? '#dbeafe' : '#fef3c7',
                        color: section.type === 'listening' ? '#1d4ed8' : '#92400e'
                      }}>
                        {section.type === 'listening' ? '👂 Listening' : '📖 Reading'}
                      </span>
                    </td>
                    <td style={S.td}>{section.questions?.length || 0}</td>
                    <td style={S.td}>
                      <button style={S.btnSecondary} onClick={() => handleViewSection(section)}>Câu hỏi</button>
                      <button style={S.btnDanger} onClick={() => handleDeleteSection(section.id)}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Questions panel */}
      {selectedSection && (
        <div style={S.card}>
          <div style={S.panelHeader}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              ❓ Câu hỏi — {selectedSection.title}
            </span>
            <div>
              <button style={S.btnPrimary} onClick={() => setShowQuestionModal(true)}>Thêm câu hỏi</button>
              <button style={{ ...S.btnSecondary, marginLeft: 8 }} onClick={() => { setSelectedSection(null); setQuestions([]); }}>Đóng</button>
            </div>
          </div>
          {questions.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
              Chưa có câu hỏi nào.
            </div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  {['STT', 'Nội dung', 'Đáp án đúng', 'Actions'].map(h => 
                    <th key={h} style={S.th}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {questions.map((q, i) => (
                  <tr key={q.id}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={S.td}>{q.question_text?.substring(0, 60)}...</td>
                    <td style={{ ...S.td, fontWeight: 700, color: '#059669' }}>
                      {q.answers?.find(a => a.is_correct)?.answer_order || '—'}
                    </td>
                    <td style={S.td}>
                      <button style={S.btnDanger} onClick={() => handleDeleteQuestion(q.id)}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal: Create Exam */}
      {showExamModal && (
        <div style={S.overlay} onClick={() => setShowExamModal(false)}>
          <div style={S.modal(500)} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700 }}>➕ Tạo đề thi mới</h2>
            
            <div style={S.formRow}>
              <label style={S.label}>Tên đề thi *</label>
              <input style={S.input} value={examForm.title} 
                onChange={e => setExamForm(f => ({ ...f, title: e.target.value }))} 
                placeholder="VD: IELTS Reading Test 1" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={S.formRow}>
                <label style={S.label}>Loại bài thi</label>
                <select style={S.select} value={examForm.exam_type} 
                  onChange={e => setExamForm(f => ({ ...f, exam_type: e.target.value }))}>
                  <option value="ielts">IELTS</option>
                  <option value="toeic">TOEIC</option>
                  <option value="giao_tiep">Giao tiếp</option>
                </select>
              </div>
              <div style={S.formRow}>
                <label style={S.label}>Thời gian (phút)</label>
                <input style={S.input} type="number" value={examForm.duration} 
                  onChange={e => setExamForm(f => ({ ...f, duration: +e.target.value }))} />
              </div>
            </div>

            <div style={S.formRow}>
              <label style={S.label}>Mô tả</label>
              <textarea style={S.textarea} value={examForm.description} 
                onChange={e => setExamForm(f => ({ ...f, description: e.target.value }))} 
                placeholder="Mô tả đề thi..." />
            </div>

            <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: 6, fontSize: 12, color: '#065f46', marginBottom: 16 }}>
              📝 <b>Quy trình:</b> Tạo đề → Thêm phần (Listening/Reading) → Thêm câu hỏi → Công bố → Học viên làm bài
            </div>

            <div style={S.modalFooter}>
              <button style={S.btnSecondary} onClick={() => setShowExamModal(false)}>Hủy</button>
              <button style={S.btnPrimary} onClick={handleCreateExam}>Tạo đề</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Section */}
      {showSectionModal && (
        <div style={S.overlay} onClick={() => setShowSectionModal(false)}>
          <div style={S.modal(600)} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700 }}>➕ Thêm phần thi</h2>
            
            <div style={S.formRow}>
              <label style={S.label}>Tên phần *</label>
              <input style={S.input} value={sectionForm.title} 
                onChange={e => setSectionForm(f => ({ ...f, title: e.target.value }))} 
                placeholder="VD: Part 1 - Section 1" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={S.formRow}>
                <label style={S.label}>Loại phần</label>
                <select style={S.select} value={sectionForm.type} 
                  onChange={e => setSectionForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="reading">📖 Reading (Đọc)</option>
                  <option value="listening">👂 Listening (Nghe)</option>
                </select>
              </div>
              <div style={S.formRow}>
                <label style={S.label}>Thứ tự</label>
                <input style={S.input} type="number" value={sectionForm.order_index} 
                  onChange={e => setSectionForm(f => ({ ...f, order_index: +e.target.value }))} />
              </div>
            </div>

            {/* Content for Reading */}
            {sectionForm.type === 'reading' && (
              <div style={S.formRow}>
                <label style={S.label}>📖 Nội dung đọc (Reading Passage)</label>
                <textarea style={{ ...S.textarea, minHeight: 150 }} value={sectionForm.content} 
                  onChange={e => setSectionForm(f => ({ ...f, content: e.target.value }))} 
                  placeholder="Nhập đoạn văn đọc..." />
              </div>
            )}

            {/* Audio for Listening */}
            {sectionForm.type === 'listening' && (
              <div style={S.formRow}>
                <label style={S.label}>🎵 Upload Audio (mp3)</label>
                <input type="file" accept="audio/*" 
                  onChange={e => setSectionForm(f => ({ ...f, audio_url: e.target.files[0] }))} 
                  style={{ fontSize: 12 }} />
              </div>
            )}

            <div style={S.modalFooter}>
              <button style={S.btnSecondary} onClick={() => setShowSectionModal(false)}>Hủy</button>
              <button style={S.btnPrimary} onClick={handleCreateSection}>Thêm phần</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Question */}
      {showQuestionModal && (
        <div style={S.overlay} onClick={() => setShowQuestionModal(false)}>
          <div style={S.modal(600)} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700 }}>➕ Thêm câu hỏi</h2>
            
            <div style={S.formRow}>
              <label style={S.label}>Nội dung câu hỏi *</label>
              <textarea style={S.textarea} value={questionForm.question_text} 
                onChange={e => setQuestionForm(f => ({ ...f, question_text: e.target.value }))} 
                placeholder="Nhập nội dung câu hỏi..." />
            </div>

            <div style={S.formRow}>
              <label style={S.label}>Thứ tự câu</label>
              <input style={S.input} type="number" value={questionForm.question_order} 
                onChange={e => setQuestionForm(f => ({ ...f, question_order: +e.target.value }))} />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={S.label}>Các đáp án (chọn đáp án đúng) *</label>
              {questionForm.answers.map((ans, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <input type="radio" name="correct_answer" 
                    checked={ans.is_correct} 
                    onChange={() => updateAnswer(idx, 'is_correct', true)}
                    style={{ width: 20, height: 20 }} 
                  />
                  <span style={{ fontWeight: 600, minWidth: 24 }}>{ans.answer_order}.</span>
                  <input style={{ ...S.input, flex: 1 }} value={ans.answer_text} 
                    onChange={e => updateAnswer(idx, 'answer_text', e.target.value)} 
                    placeholder={`Đáp án ${ans.answer_order}`} />
                </div>
              ))}
            </div>

            <div style={S.modalFooter}>
              <button style={S.btnSecondary} onClick={() => setShowQuestionModal(false)}>Hủy</button>
              <button style={S.btnPrimary} onClick={handleCreateQuestion}>Thêm câu hỏi</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Results */}
      {showResultModal && (
        <div style={S.overlay} onClick={() => setShowResultModal(false)}>
          <div style={S.modal(700)} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                📊 Kết quả thi — {selectedExam?.title}
              </h2>
              <button style={S.btnSecondary} onClick={() => setShowResultModal(false)}>Đóng</button>
            </div>
            
            {results.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
                Chưa có học viên làm bài thi nào.
              </div>
            ) : (
              <table style={S.table}>
                <thead>
                  <tr>
                    {['STT', 'Học viên', 'Điểm', 'Đúng/Tổng', 'Thời gian', 'Ngày thi'].map(h => 
                      <th key={h} style={S.th}>{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r.id}>
                      <td style={S.td}>{i + 1}</td>
                      <td style={{ ...S.td, fontWeight: 600 }}>{r.user_name || 'Học viên'}</td>
                      <td style={{ ...S.td, fontWeight: 700, fontSize: 16, color: '#059669' }}>
                        {r.score}/10
                      </td>
                      <td style={S.td}>{r.correct_count}/{r.total_questions}</td>
                      <td style={S.td}>{Math.floor(r.time_spent / 60)}p {r.time_spent % 60}s</td>
                      <td style={S.td}>{r.created_at ? new Date(r.created_at).toLocaleString('vi-VN') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}