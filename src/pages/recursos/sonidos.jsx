import React, { useState } from 'react';
import './sonidos.css';

const Sonidos = () => {
  const [activeSound, setActiveSound] = useState(null);

  const sonidosRelajacion = [
    {
      id: 1,
      title: "Lluvia Suave",
      description: "Sonido de lluvia suave para relajación profunda",
      duration: "5 min",
      videoId: "t8_Dquklg4Y",
      thumbnail: "https://img.youtube.com/vi/t8_Dquklg4Y/hqdefault.jpg"
    },
    {
      id: 2,
      title: "Olas del Mar",
      description: "Sonido de olas del mar para calmar la mente",
      duration: "8 horas",
      videoId: "lFQY0sH1U_c",
      thumbnail: "https://img.youtube.com/vi/lFQY0sH1U_c/hqdefault.jpg"
    },
    {
      id: 3,
      title: "Bosque Tranquilo",
      description: "Sonidos de bosque para concentración y paz",
      duration: "3 min",
      videoId: "UwOl4cat3bk",
      thumbnail: "https://img.youtube.com/vi/UwOl4cat3bk/hqdefault.jpg"
    },
    {
      id: 4,
      title: "Música Tibetana",
      description: "Cuencos tibetanos para meditación",
      duration: "11 horas",
      videoId: "SbTtheW72xw",
      thumbnail: "https://img.youtube.com/vi/SbTtheW72xw/hqdefault.jpg"
    },
    {
      id: 5,
      title: "Pájaros Cantando",
      description: "Canto de pájaros para renovar energía",
      duration: "14 min",
      videoId: "IvgKsXObQNI",
      thumbnail: "https://img.youtube.com/vi/IvgKsXObQNI/hqdefault.jpg"
    },
    {
      id: 6,
      title: "Viento Suave",
      description: "Sonido de viento para liberar tensiones",
      duration: "5 min",
      videoId: "HPQ8pm1jJgk",
      thumbnail: "https://img.youtube.com/vi/HPQ8pm1jJgk/hqdefault.jpg"
    }
  ];

  const handlePlaySound = (soundId) => {
    setActiveSound(activeSound === soundId ? null : soundId);
  };

  const getEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autohide=1&showinfo=0&controls=1`;
  };

  return (
    <section id="sonidos" className="sonidos-section">
      <div className="sonidos-header">
        <h2>🎵 Sonidos de Relajación</h2>
        <p>Encuentra tu paz interior con nuestra colección de sonidos naturales y música relajante</p>
      </div>

      <div className="sonidos-grid">
        {sonidosRelajacion.map((sonido) => (
          <div key={sonido.id} className="sonido-card">
            <div className="sonido-thumbnail">
              <img 
                src={sonido.thumbnail} 
                alt={sonido.title}
                loading="lazy"
              />
              <div className="sonido-duration">{sonido.duration}</div>
            </div>
            
            <div className="sonido-content">
              <h3>{sonido.title}</h3>
              <p>{sonido.description}</p>
              
              <div className="sonido-controls">
                <button 
                  className={`play-btn ${activeSound === sonido.id ? 'playing' : ''}`}
                  onClick={() => handlePlaySound(sonido.id)}
                >
                  {activeSound === sonido.id ? '⏸ Pausar' : '▶️ Reproducir'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reproductor de YouTube para el sonido activo */}
      {activeSound && (
        <div className="youtube-player">
          <div className="player-header">
            <h3>Reproduciendo: {sonidosRelajacion.find(s => s.id === activeSound)?.title}</h3>
            <button 
              className="close-player"
              onClick={() => setActiveSound(null)}
            >
              ✕
            </button>
          </div>
          <div className="video-container">
            <iframe
              src={getEmbedUrl(sonidosRelajacion.find(s => s.id === activeSound)?.videoId)}
              title="Reproductor de YouTube"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="youtube-iframe"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Sonidos;
