import { useState, useEffect, useRef, useCallback } from "react";
import { onlineExamAPI } from "../api";

const API_URL = "http://localhost:5000";

// ========== TIMER COMPONENT ==========
export function Timer({ seconds, onTimeUp, warningThreshold = 300 }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  
  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft, onTimeUp]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const isWarning = timeLeft <= warningThreshold;

  return (
    <div style={{
      padding: '8px 16px',
      background: isWarning ? '#fee2e2' : '#f3f4f6',
      borderRadius: 8,
      fontWeight: 700,
      fontFamily: 'monospace',
      fontSize: 18,
      color: isWarning ? '#dc2626' : '#111827'
    }}>
      ⏱️ {formatTime(timeLeft)}
    </div>
  );
}

// ========== AUDIO PLAYER COMPONENT ==========
export function AudioPlayer({ audioUrl, onEnded }) {
  const audioRef = useRef(null);

  if (!audioUrl) {
    return (
      <div style={{ padding: 20, background: '#fef3c7', borderRadius: 8, color: '#92400e' }}>
        ⚠️ Chưa có file audio
      </div>
    );
  }

  return (
    <div style={{ background: '#1f2937', borderRadius: 8, padding: 16 }}>
      <audio 
        ref={audioRef}
        controls 
        style={{ width: '100%' }}
        onEnded={onEnded}
      >
        <source src={audioUrl.startsWith('http') ? audioUrl : `${API_URL}${audioUrl}`} type="audio/mpeg" />
        Trình duyệt không hỗ trợ audio
      </audio>
      <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>
        👂 Nghe audio và trả lời câu hỏi bên dưới
      </div>
    </div>
  );
}

// ========== READING PASSAGE COMPONENT ==========
export function ReadingPassage({ content, title }) {
  if (!content) {
    return (
      <div style={{ padding: 20, background: '#fef3c7', borderRadius: 8, color: '#92400e' }}>
        ⚠️ Chưa có nội dung đọc
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#fff', 
      border: '1px solid #e5e7eb', 
      borderRadius: 8, 
      padding: 24,
      maxHeight: 500,
      overflowY: 'auto'
    }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111827' }}>
        {title || '📖 Reading Passage'}
      </h3>
      <div style={{ 
        fontSize: 14, 
        lineHeight: 1.8, 
        whiteSpace: 'pre-wrap',
        color: '#374151'
      }}>
        {content}
      </div>
    </div>
  );
}

// ========== QUESTION NAVIGATION ==========
export function QuestionNavigator({ questions, answers, currentQuestion, onSelect }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: 16,
      position: 'sticky',
      top: 80
    }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#374151' }}>
        Danh sách câu hỏi
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
        {questions.map((q, idx) => {
          const isAnswered = answers[q.id];
          const isCurrent = currentQuestion === q.id;
          
          return (
            <button
              key={q.id}
              onClick={() => onSelect(q.id)}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 6,
                border: `2px solid ${isCurrent ? '#111827' : isAnswered ? '#10b981' : '#e5e7eb'}`,
                background: isAnswered ? '#10b981' : isCurrent ? '#111827' : '#fff',
                color: isAnswered || isCurrent ? '#fff' : '#374151',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: '#6b7280' }}>
        <span style={{ display: 'inline-block', width: 10, height: 10, background: '#10b981', borderRadius: 2, marginRight: 4 }}></span>
        Đã trả lời
        <span style={{ display: 'inline-block', width: 10, height: 10, background: '#e5e7eb', borderRadius: 2, marginLeft: 12, marginRight: 4 }}></span>
        Chưa trả lời
      </div>
    </div>
  );
}

// ========== MAIN EXAM PAGE ==========
export default function OnlineExamPage({ examId, userId: propUserId, onComplete }) {
  // Get userId from props or localStorage
  const [userId, setUserId] = useState(() => {
    if (propUserId) return propUserId;
    // Try to get from localStorage
    try {
      const hvUser = localStorage.getItem("hv_user");
      if (hvUser) {
        const parsed = JSON.parse(hvUser);
        return parsed?.id || null;
      }
    } catch {}
    return null;
  });
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Load exam
  useEffect(() => {
    loadExam();
  }, [examId]);

  // Timer
  useEffect(() => {
    if (exam && !showResult) {
      const timer = setInterval(() => {
        setTimeSpent(t => t + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [exam, showResult]);

  const loadExam = async () => {
    try {
      const res = await onlineExamAPI.getExamById(examId);
      if (res.success) {
        setExam(res.data);
        // Set first question as current
        if (res.data.sections?.length > 0 && res.data.sections[0].questions?.length > 0) {
          setCurrentQuestion(res.data.sections[0].questions[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSelectAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!window.confirm("Bạn có chắc muốn nộp bài?")) return;
    
    setSubmitting(true);
    try {
      const res = await onlineExamAPI.submitExam({
        exam_id: examId,
        user_id: userId,
        answers,
        time_spent: timeSpent
      });
      
      if (res.success) {
        setResult(res.data);
        setShowResult(true);
      } else {
        alert("Lỗi: " + res.message);
      }
    } catch (e) {
      alert("Lỗi nộp bài: " + e.message);
    }
    setSubmitting(false);
  };

  const handleTimeUp = () => {
    handleSubmit();
  };

  // Flatten all questions
  const allQuestions = exam?.sections?.flatMap(s => s.questions || []) || [];
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
        ⏳ Đang tải đề thi...
      </div>
    );
  }

  if (!exam) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>
        ❌ Không tìm thấy đề thi
      </div>
    );
  }

  // Show result
  if (showResult && result) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f9fafb', 
        padding: 24,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 32,
          maxWidth: 600,
          width: '100%',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 700, textAlign: 'center' }}>
            🎉 Kết quả bài thi
          </h2>
          
          <div style={{ 
            textAlign: 'center', 
            padding: 24, 
            background: '#f0fdf4', 
            borderRadius: 12,
            marginBottom: 24
          }}>
            <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Điểm số</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: '#059669' }}>
              {result.score}/10
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ textAlign: 'center', padding: 16, background: '#f3f4f6', borderRadius: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{result.correct_count}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Đúng</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, background: '#f3f4f6', borderRadius: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
                {result.total_questions - result.correct_count}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Sai</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', color: '#6b7280', marginBottom: 24 }}>
            Thời gian làm: {Math.floor(timeSpent / 60)} phút {timeSpent % 60} giây
          </div>

          <button
            onClick={onComplete}
            style={{
              width: '100%',
              padding: 14,
              background: '#111827',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Hoàn thành
          </button>
        </div>
      </div>
    );
  }

  const currentSec = exam.sections[currentSection];
  const sectionQuestions = currentSec?.questions || [];

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <header style={{
        background: '#111827',
        color: '#fff',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{exam.title}</h1>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>
            {answeredCount}/{allQuestions.length} câu đã trả lời
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Timer 
            seconds={exam.duration * 60} 
            onTimeUp={handleTimeUp}
            warningThreshold={300}
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '8px 20px',
              background: submitting ? '#6b7280' : '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </header>

      {/* Section Tabs */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 24px',
        display: 'flex',
        gap: 8
      }}>
        {exam.sections?.map((section, idx) => (
          <button
            key={section.id}
            onClick={() => {
              setCurrentSection(idx);
              if (section.questions?.length > 0) {
                setCurrentQuestion(section.questions[0].id);
              }
            }}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: currentSection === idx ? '#111827' : 'transparent',
              color: currentSection === idx ? '#fff' : '#374151',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              borderBottom: currentSection === idx ? '2px solid #111827' : '2px solid transparent'
            }}
          >
            {section.type === 'listening' ? '👂' : '📖'} {section.title || section.type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto', padding: 24, gap: 24 }}>
        {/* Left: Content (Audio/Passage) */}
        <div style={{ flex: 1 }}>
          {/* Section Content */}
          {currentSec?.type === 'listening' ? (
            <AudioPlayer audioUrl={currentSec.audio_url} />
          ) : (
            <ReadingPassage content={currentSec?.content} title={currentSec?.title} />
          )}

          {/* Questions */}
          <div style={{ marginTop: 24 }}>
            {sectionQuestions.map((q, idx) => (
              <div
                key={q.id}
                id={`question-${q.id}`}
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: 20,
                  marginBottom: 16,
                  border: currentQuestion === q.id ? '2px solid #111827' : '1px solid #e5e7eb',
                  boxShadow: currentQuestion === q.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ 
                    fontWeight: 700, 
                    fontSize: 14,
                    background: '#f3f4f6',
                    padding: '4px 10px',
                    borderRadius: 4
                  }}>
                    Câu {idx + 1}
                  </span>
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    background: currentSec?.type === 'listening' ? '#dbeafe' : '#fef3c7',
                    color: currentSec?.type === 'listening' ? '#1d4ed8' : '#92400e',
                    borderRadius: 4
                  }}>
                    {currentSec?.type === 'listening' ? 'Listening' : 'Reading'}
                  </span>
                </div>

                <div style={{ fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
                  {q.question_text}
                </div>

                {/* Answers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {q.answers?.map((a) => {
                    const isSelected = answers[q.id] === a.answer_text;
                    
                    return (
                      <button
                        key={a.id}
                        onClick={() => handleSelectAnswer(q.id, a.answer_text)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 16px',
                          border: isSelected ? '2px solid #111827' : '1px solid #e5e7eb',
                          borderRadius: 8,
                          background: isSelected ? '#111827' : '#fff',
                          color: isSelected ? '#fff' : '#374151',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: 14,
                          transition: 'all 0.1s'
                        }}
                      >
                        <span style={{ fontWeight: 700, minWidth: 20 }}>{a.answer_order}.</span>
                        <span>{a.answer_text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Navigation */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <QuestionNavigator 
            questions={allQuestions}
            answers={answers}
            currentQuestion={currentQuestion}
            onSelect={setCurrentQuestion}
          />
        </div>
      </div>
    </div>
  );
}