import { useState } from "react";
import zaloIcon from "../assets/icons/zalo.png";

function FloatingContact() {
  const [isExpanded, setIsExpanded] = useState(false);
  const phoneNumber = "0964274540";
  const zaloLink = `https://zalo.me/${phoneNumber}`;
  const messengerLink = "https://m.me/YOUR_FACEBOOK_PAGE_ID"; // Replace with your Facebook Page ID

  return (
    <>
      {/* Floating Contact Buttons */}
      <div style={{
        position: "fixed",
        bottom: 30,
        right: 30,
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 15,
      }}>
        {/* Expanded Buttons */}
        {isExpanded && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            animation: "slideIn 0.3s ease",
          }}>
            {/* Zalo Button */}
            <a
              href={zaloLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "white",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                transition: "all 0.3s ease",
                border: "3px solid #0068FF",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.boxShadow = "0 6px 25px rgba(0,104,255,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
              }}
            >
              <img 
                src={zaloIcon} 
                alt="Zalo"
                style={{
                  width: 40,
                  height: 40,
                  objectFit: "contain",
                }}
              />
            </a>

            {/* Messenger Button */}
            <a
              href={messengerLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00B2FF 0%, #006AFF 100%)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                transition: "all 0.3s ease",
                fontSize: 28,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.boxShadow = "0 6px 25px rgba(0,106,255,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
              }}
            >
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="white"
              >
                <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.912 1.446 5.51 3.707 7.215V22l3.39-1.862c.905.251 1.862.385 2.903.385 5.523 0 10-4.145 10-9.243C22 6.145 17.523 2 12 2zm1.093 12.45l-2.546-2.714-4.97 2.714 5.467-5.8 2.607 2.714 4.909-2.714-5.467 5.8z"/>
              </svg>
            </a>

            {/* Phone Button */}
            <a
              href={`tel:${phoneNumber}`}
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                transition: "all 0.3s ease",
                fontSize: 28,
                color: "white",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.boxShadow = "0 6px 25px rgba(76,175,80,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
              }}
            >
              📞
            </a>
          </div>
        )}

        {/* Main Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
            border: "none",
            boxShadow: "0 6px 30px rgba(229, 57, 53, 0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            transition: "all 0.3s ease",
            color: "white",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1) rotate(90deg)";
            e.currentTarget.style.boxShadow = "0 8px 35px rgba(229, 57, 53, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = isExpanded ? "scale(1) rotate(45deg)" : "scale(1) rotate(0deg)";
            e.currentTarget.style.boxShadow = "0 6px 30px rgba(229, 57, 53, 0.4)";
          }}
        >
          {isExpanded ? "✕" : "💬"}
        </button>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          /* Adjust for mobile */
        }
      `}</style>
    </>
  );
}

export default FloatingContact;
