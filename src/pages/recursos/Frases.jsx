import React, { useState } from 'react';
import './Frases.css';

const Frases = () => {
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [favoriteQuotes, setFavoriteQuotes] = useState([]);

  const frases = [
    {
      id: 1,
      categoria: "motivacion",
      frase: "El único modo de hacer un gran trabajo es amar lo que haces.",
      autor: "Steve Jobs",
      imagen: "https://picsum.photos/seed/motivacion1/400/300.jpg",
      color: "#FF6B6B"
    },
    {
      id: 2,
      categoria: "paz",
      frase: "La paz interior es la clave para la felicidad exterior.",
      autor: "Buda",
      imagen: "https://picsum.photos/seed/paz1/400/300.jpg",
      color: "#4ECDC4"
    },
    {
      id: 3,
      categoria: "resiliencia",
      frase: "Lo que no me mata, me hace más fuerte.",
      autor: "Friedrich Nietzsche",
      imagen: "https://picsum.photos/seed/resiliencia1/400/300.jpg",
      color: "#45B7D1"
    },
    {
      id: 4,
      categoria: "autoestima",
      frase: "Eres mucho más de lo que crees ser.",
      autor: "Anónimo",
      imagen: "https://picsum.photos/seed/autoestima1/400/300.jpg",
      color: "#96CEB4"
    },
    {
      id: 5,
      categoria: "superacion",
      frase: "El éxito no es final, el fracaso no es fatal: es el coraje para continuar lo que cuenta.",
      autor: "Winston Churchill",
      imagen: "https://picsum.photos/seed/superacion1/400/300.jpg",
      color: "#FFEAA7"
    },
    {
      id: 6,
      categoria: "mindfulness",
      frase: "El presente es el único tiempo sobre el tenemos dominio.",
      autor: "Thích Nhất Hạnh",
      imagen: "https://picsum.photos/seed/mindfulness1/400/300.jpg",
      color: "#DDA0DD"
    },
    {
      id: 7,
      categoria: "gratitud",
      frase: "La gratitud transforma lo que tenemos en suficiente.",
      autor: "Melody Beattie",
      imagen: "https://picsum.photos/seed/gratitud1/400/300.jpg",
      color: "#FFB6C1"
    },
    {
      id: 8,
      categoria: "cambio",
      frase: "La única constante en la vida es el cambio.",
      autor: "Heráclito",
      imagen: "https://picsum.photos/seed/cambio1/400/300.jpg",
      color: "#87CEEB"
    },
    {
      id: 9,
      categoria: "esperanza",
      frase: "La esperanza es el sueño de un hombre despierto.",
      autor: "Aristóteles",
      imagen: "https://picsum.photos/seed/esperanza1/400/300.jpg",
      color: "#98D8C8"
    },
    {
      id: 10,
      categoria: "motivacion",
      frase: "No te preocupes por los fracasos, preocúpate por las oportunidades que pierdes al no intentarlo.",
      autor: "Jack Canfield",
      imagen: "https://picsum.photos/seed/motivacion2/400/300.jpg",
      color: "#FF6B6B"
    },
    {
      id: 11,
      categoria: "paz",
      frase: "La paz no es ausencia de conflicto, sino la habilidad de manejarlo con medios pacíficos.",
      autor: "Ronald Reagan",
      imagen: "https://picsum.photos/seed/paz2/400/300.jpg",
      color: "#4ECDC4"
    },
    {
      id: 12,
      categoria: "resiliencia",
      frase: "La resiliencia es la capacidad de volver a ser uno mismo después de haber sido roto.",
      autor: "Junot Díaz",
      imagen: "https://picsum.photos/seed/resiliencia2/400/300.jpg",
      color: "#45B7D1"
    }
  ];

  const categorias = [
    { id: 'todas', nombre: 'Todas', icon: '🌟' },
    { id: 'motivacion', nombre: 'Motivación', icon: '🚀' },
    { id: 'paz', nombre: 'Paz', icon: '🕊️' },
    { id: 'resiliencia', nombre: 'Resiliencia', icon: '💪' },
    { id: 'autoestima', nombre: 'Autoestima', icon: '💝' },
    { id: 'superacion', nombre: 'Superación', icon: '🌱' },
    { id: 'mindfulness', nombre: 'Mindfulness', icon: '🧘' },
    { id: 'gratitud', nombre: 'Gratitud', icon: '🙏' },
    { id: 'cambio', nombre: 'Cambio', icon: '🔄' },
    { id: 'esperanza', nombre: 'Esperanza', icon: '✨' }
  ];

  const frasesFiltradas = frases; // Mostrar todas las frases sin filtro

  const toggleFavorite = (fraseId) => {
    setFavoriteQuotes(prev => 
      prev.includes(fraseId) 
        ? prev.filter(id => id !== fraseId)
        : [...prev, fraseId]
    );
  };

  const shareQuote = (frase, autor) => {
    const text = `"${frase}" - ${autor}`;
    if (navigator.share) {
      navigator.share({
        title: 'Frase Inspiradora',
        text: text
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('¡Frase copiada al portapapeles!');
    }
  };

  return (
    <section id="frases" className="frases-section">
      <div className="frases-header">
        <h2>💭 Frases Inspiradoras</h2>
        <p>Encuentra la motivación y la paz interior con nuestra colección de frases que transforman tu día</p>
      </div>

      {/* Filtro de Categorías - Eliminado por solicitud */}

      {/* Estadísticas */}
      <div className="frases-stats">
        <div className="stat-card">
          <span className="stat-number">{frasesFiltradas.length}</span>
          <span className="stat-label">Frases disponibles</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{favoriteQuotes.length}</span>
          <span className="stat-label">Favoritas</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{categorias.length}</span>
          <span className="stat-label">Categorías</span>
        </div>
      </div>

      {/* Línea Divisoria */}
      <div className="frases-divider">
        <div className="divider-line"></div>
        <div className="divider-content">
          <span className="divider-icon">💭</span>
          <span className="divider-text">Frases Inspiradoras</span>
          <span className="divider-icon">✨</span>
        </div>
        <div className="divider-line"></div>
      </div>

      {/* Grid de Frases */}
      <div className="frases-grid">
        {frasesFiltradas.map((frase, index) => (
          <div 
            key={frase.id} 
            className="frase-card"
            style={{ 
              '--frase-color': frase.color,
              animation: `fadeInUp 0.5s ease ${index * 0.1}s both`
            }}
          >
            <div className="frase-imagen-container">
              <img 
                src={frase.imagen} 
                alt={frase.categoria}
                className="frase-imagen"
                loading="lazy"
                onError={(e) => {
                  e.target.src = `https://picsum.photos/seed/default${frase.id}/400/300.jpg`;
                }}
              />
              <div className="frase-overlay">
                <span className="frase-categoria-badge">
                  {categorias.find(c => c.id === frase.categoria)?.icon} {categorias.find(c => c.id === frase.categoria)?.nombre}
                </span>
              </div>
            </div>
            
            <div className="frase-content">
              <div className="frase-texto">
                <p>"{frase.frase}"</p>
              </div>
              
              <div className="frase-autor">
                <span className="autor-nombre">— {frase.autor}</span>
              </div>
              
              <div className="frase-acciones">
                <button 
                  className={`accion-btn favorite-btn ${favoriteQuotes.includes(frase.id) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(frase.id)}
                  title="Añadir a favoritos"
                >
                  {favoriteQuotes.includes(frase.id) ? '❤️' : '🤍'}
                </button>
                
                <button 
                  className="accion-btn share-btn"
                  onClick={() => shareQuote(frase.frase, frase.autor)}
                  title="Compartir frase"
                >
                  📤
                </button>
                
                <button 
                  className="accion-btn copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(`"${frase.frase}" - ${frase.autor}`);
                    alert('¡Frase copiada!');
                  }}
                  title="Copiar frase"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sección de Favoritos */}
      {favoriteQuotes.length > 0 && (
        <div className="favoritos-section">
          <h3>❤️ Tus Frases Favoritas</h3>
          <div className="favoritos-grid">
            {favoriteQuotes.map(favId => {
              const frase = frases.find(f => f.id === favId);
              return (
                <div key={favId} className="favorito-card">
                  <p>"{frase.frase}"</p>
                  <span>— {frase.autor}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </section>
  );
};

export default Frases;
