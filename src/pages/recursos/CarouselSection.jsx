import React, { useState } from "react";
import "./CarouselSection.css";

const slides = [
  {
    title: "BIBLIOTECA",
    text: "Sumérgete en el conocimiento. Encuentra libros y artículos que te ayudarán a comprender y mejorar tu salud mental.",
    button: "EXPLORA BIBLIOTECA",
    image: "/src/assets/common/biblioteca.png",
    section: "biblioteca" // ID de la sección en la misma página
  },
  {
    title: "SONIDOS",
    text: "Cada día es una nueva oportunidad para crecer y avanzar hacia tus metas.",
    button: "EXPLORA SONIDOS",
    image: "/src/assets/common/sonidos.jpg",
    section: "sonidos" // ID de la sección en la misma página
  },
  {
    title: "FRASES",
    text: "Descubre el poder de las palabras. Siembra pensamientos positivos y transforma tu día.",
    button: "EXPLORA FRASES",
    image: "/src/assets/common/frases.jpg",
    section: "frases" // ID de la sección en la misma página
  },
  {
    title: "JUEGOS PSICOEDUCATIVOS",
    text: "Aprende jugando. Descubre actividades interactivas para desarrollar habilidades emocionales y cognitivas de forma divertida.",
    button: "EXPLORA JUEGOS",
    image: "/src/assets/common/juegos.jpg",
    section: "juegos" // ID de la sección en la misma página
  },
];

const CarouselSection = () => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleButtonClick = () => {
    const section = document.getElementById(slides[current].section);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="carousel" className="carousel-section">
      <div className="carousel-container">
        
        {/* Imagen izquierda */}
        <div className="carousel-image">
          <img src={slides[current].image} alt={slides[current].title} />
        </div>

        {/* Tarjeta derecha */}
        <div className="carousel-content">
          <h2>{slides[current].title}</h2>
          <p>"{slides[current].text}"</p>

          <button 
            className="carousel-btn"
            onClick={handleButtonClick}
          >
            {slides[current].button}
          </button>

          {/* Indicadores */}
          <div className="carousel-dots">
            {slides.map((_, index) => (
              <span
                key={index}
                className={index === current ? "dot active" : "dot"}
                onClick={() => setCurrent(index)}
              ></span>
            ))}
          </div>
        </div>

        {/* Flechas */}
        <button className="carousel-arrow left" onClick={prevSlide}>
          ‹
        </button>
        <button className="carousel-arrow right" onClick={nextSlide}>
          ›
        </button>

      </div>
    </section>
  );
};

export default CarouselSection;