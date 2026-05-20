import { useState, useEffect, useRef } from "react";

const API_URL = "http://localhost:5000/api/chatbot";
const IMG_BASE = "http://localhost:5000";

function getSessionId() {
  let sid = localStorage.getItem("chat_session_id");
  if (!sid) {
    sid = "sess_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("chat_session_id", sid);
  }
  return sid;
}

const QUICK_REPLIES = [
  "Tìm sách IELTS",
  "Sách TOEIC",
  "Sách ngữ pháp",
  "Cách đặt hàng?",
];

// Card hiển thị sản phẩm trong chat
function BookCard({ book }) {
  const imgSrc = book.hinh_anh
    ? (book.hinh_anh.startsWith("http")
        ? book.hinh_anh
        : book.hinh_anh.startsWith("/")
          ? IMG_BASE + book.hinh_anh
          : `${IMG_BASE}/uploads/${book.hinh_anh}`)
    : null;

  return (
    <div
      onClick={() => window.navigateTo(`/product/${book.id}`)}
      style={{
        background: "white", borderRadius: 10, overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)", cursor: "pointer",
        width: 140, flexShrink: 0, transition: "transform 0.15s",
        border: "1px solid #f0f0f0",
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
    >
      {/* Hình sách */}
      <div style={{
        height: 100, background: "#f5f5f5",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        {imgSrc ? (
          <img src={imgSrc} alt={book.ten_sach} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 36 }}>📚</span>
        )}
      </div>
      {/* Info */}
      <div style={{ padding: "8px 8px 10px" }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: "#222",
          lineHeight: 1.3, marginBottom: 4,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{book.ten_sach}</div>
        {book.tac_gia && (
          <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>{book.tac_gia}</div>
        )}
        <div style={{ fontSize: 12, fontWeight: 700, color: "#e53935" }}>
          {book.gia_ban.toLocaleString("vi-VN")}đ
        </div>
        <div style={{
          marginTop: 6, background: "#e53935", color: "white",
          borderRadius: 6, padding: "3px 0", textAlign: "center", fontSize: 10, fontWeight: 600,
        }}>Xem chi tiết →</div>
      </div>
    </div>
  );
}

// Render markdown đơn giản
function renderContent(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(getSessionId);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) loadHistory();
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadHistory() {
    try {
      const res = await fetch(`${API_URL}/history/${sessionId}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setMessages(data.data.map((m) => ({ role: m.role, content: m.content })));
      } else {
        setMessages([{
          role: "assistant",
          content: "Xin chào! 👋 Tôi là trợ lý tư vấn sách của **NTA English Center**.\nTôi có thể giúp bạn tìm sách phù hợp, tư vấn giá cả và hỗ trợ đặt hàng. Bạn cần tìm loại sách gì?",
        }]);
      }
    } catch {
      setMessages([{
        role: "assistant",
        content: "Xin chào! 👋 Tôi là trợ lý tư vấn sách của **NTA English Center**. Bạn cần tìm loại sách gì?",
      }]);
    }
  }

  async function sendMessage(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionId }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Xin lỗi, có lỗi xảy ra.",
          books: data.books || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Xin lỗi, không thể kết nối. Vui lòng thử lại sau." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function clearChat() {
    await fetch(`${API_URL}/history/${sessionId}`, { method: "DELETE" });
    setMessages([{
      role: "assistant",
      content: "Đã xóa lịch sử. Tôi có thể giúp gì cho bạn? 😊",
    }]);
  }

  return (
    <>
      {/* Nút mở chat */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, #e53935, #c62828)",
          border: "none", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(229,57,53,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, color: "white",
        }}
        title="Chat tư vấn 24/7"
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Badge 24/7 */}
      {!open && (
        <div style={{
          position: "fixed", bottom: 76, right: 18, zIndex: 9999,
          background: "#4caf50", color: "white", borderRadius: 10,
          padding: "2px 7px", fontSize: 10, fontWeight: 700,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}>24/7</div>
      )}

      {/* Cửa sổ chat */}
      {open && (
        <div style={{
          position: "fixed", bottom: 90, right: 24, zIndex: 9998,
          width: 370, height: 560, borderRadius: 16,
          background: "white", boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          fontFamily: "sans-serif",
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #e53935, #c62828)",
            padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>🤖</div>
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>Trợ lý NTA</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4caf50" }} />
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>Hoạt động 24/7</span>
                </div>
              </div>
            </div>
            <button onClick={clearChat} style={{
              background: "rgba(255,255,255,0.15)", border: "none", color: "white",
              borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 11,
            }}>Xóa chat</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", background: "#f8f9fa" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}>
                  {m.role === "assistant" && (
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", background: "#e53935",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, marginRight: 8, flexShrink: 0, alignSelf: "flex-end",
                    }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: "78%", padding: "9px 13px",
                    borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: m.role === "user" ? "#e53935" : "white",
                    color: m.role === "user" ? "white" : "#333",
                    fontSize: 13, lineHeight: 1.5,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }}
                    dangerouslySetInnerHTML={{ __html: renderContent(m.content) }}
                  />
                </div>

                {/* Book cards */}
                {m.books && m.books.length > 0 && (
                  <div style={{
                    marginTop: 8, marginLeft: 36,
                    display: "flex", gap: 8, overflowX: "auto",
                    paddingBottom: 4,
                  }}>
                    {m.books.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", background: "#e53935",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                }}>🤖</div>
                <div style={{
                  background: "white", borderRadius: "16px 16px 16px 4px",
                  padding: "10px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}>
                  <span style={{ display: "inline-flex", gap: 4 }}>
                    {[0, 1, 2].map((n) => (
                      <span key={n} style={{
                        width: 6, height: 6, borderRadius: "50%", background: "#e53935",
                        display: "inline-block",
                        animation: `bounce 1s ${n * 0.2}s infinite`,
                      }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 1 && (
            <div style={{
              padding: "6px 14px", display: "flex", flexWrap: "wrap",
              gap: 6, background: "#f8f9fa", borderTop: "1px solid #eee",
            }}>
              {QUICK_REPLIES.map((q) => (
                <button key={q} onClick={() => sendMessage(q)} style={{
                  background: "white", border: "1px solid #e53935", color: "#e53935",
                  borderRadius: 20, padding: "4px 10px", fontSize: 11, cursor: "pointer",
                }}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "10px 14px", background: "white",
            borderTop: "1px solid #eee", display: "flex", gap: 8,
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Nhập tin nhắn..."
              style={{
                flex: 1, border: "1px solid #ddd", borderRadius: 20,
                padding: "8px 14px", fontSize: 13, outline: "none",
              }}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: input.trim() ? "#e53935" : "#ddd",
                border: "none", cursor: input.trim() ? "pointer" : "default",
                color: "white", fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >➤</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
