import { useEffect, useState } from "react";
import slider1 from "../assets/images/1.jpeg";
import slider2 from "../assets/images/2.jpeg";
import slider3 from "../assets/images/3.jpeg";
import slider4 from "../assets/images/4.jpeg";
import slider5 from "../assets/images/5.jpeg";

const slides = [
  {
    id: 1,
    
    bg: slider1,
  },
  {
    id: 2,
   
    bg: slider2,
  },
  {
    id: 3,
    
    bg: slider3,
  },
  {
    id: 4,
    
    bg: slider4,
  },
  {
    id: 5,
   
    bg: slider5,
  },
];

function Slider() {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);

    // Cleanup interval on unmount to prevent memory leak
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (idx) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex(idx);
      setIsTransitioning(false);
    }, 500);
  };

  const goToPrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + slides.length) % slides.length);
      setIsTransitioning(false);
    }, 500);
  };

  const goToNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % slides.length);
      setIsTransitioning(false);
    }, 500);
  };

  return (
    <div style={{
      position: "relative",
      height: 500,
      overflow: "hidden",
      backgroundImage: `url(${slides[index].bg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      {/* Dark Overlay for better text visibility */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
      }}></div>
      
      {/* Slide Content */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: isTransitioning ? 0 : 1,
        transition: "opacity 0.5s ease-in-out",
      }}>
        <div style={{
          textAlign: "center",
          color: "white",
          maxWidth: 800,
          padding: 40,
        }}>
          <h1 style={{
            fontSize: 64,
            fontWeight: "bold",
            marginBottom: 20,
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            animation: "fadeInUp 0.8s ease-out",
          }}>
            {slides[index].title}
          </h1>
          <p style={{
            fontSize: 28,
            fontWeight: 600,
            marginBottom: 15,
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            animation: "fadeInUp 0.8s ease-out 0.2s both",
          }}>
            {slides[index].subtitle}
          </p>
          <p style={{
            fontSize: 18,
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            marginBottom: 35,
            animation: "fadeInUp 0.8s ease-out 0.4s both",
          }}>
            {slides[index].description}
          </p>
          <div style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            animation: "fadeInUp 0.8s ease-out 0.6s both",
          }}>
           
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        style={{
          position: "absolute",
          left: 30,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          background: "rgba(255,255,255,0.2)",
          border: "none",
          width: 50,
          height: 50,
          borderRadius: "50%",
          color: "white",
          fontSize: 24,
          cursor: "pointer",
          transition: "all 0.3s ease",
          backdropFilter: "blur(10px)",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "rgba(255,255,255,0.4)";
          e.target.style.transform = "translateY(-50%) scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "rgba(255,255,255,0.2)";
          e.target.style.transform = "translateY(-50%) scale(1)";
        }}
      >
        ❮
      </button>
      <button
        onClick={goToNext}
        style={{
          position: "absolute",
          right: 30,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          background: "rgba(255,255,255,0.2)",
          border: "none",
          width: 50,
          height: 50,
          borderRadius: "50%",
          color: "white",
          fontSize: 24,
          cursor: "pointer",
          transition: "all 0.3s ease",
          backdropFilter: "blur(10px)",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "rgba(255,255,255,0.4)";
          e.target.style.transform = "translateY(-50%) scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "rgba(255,255,255,0.2)";
          e.target.style.transform = "translateY(-50%) scale(1)";
        }}
      >
        ❯
      </button>

      {/* Dots Navigation */}
      <div style={{
        position: "absolute",
        bottom: 30,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 12,
      }}>
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            style={{
              width: idx === index ? 30 : 12,
              height: 12,
              borderRadius: 10,
              background: idx === index ? "white" : "rgba(255,255,255,0.4)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Slider;

