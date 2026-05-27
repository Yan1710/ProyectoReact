import React, { useState, useEffect } from 'react';
import SimpleLoading from '../../../../components/ui/SimpleLoading';
import './Recursos.css';
import AuthService from '../../../../components/auth/AuthService';

const EstudianteRecursos = () => {
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos'); // todos, libro, musica, video
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecurso, setSelectedRecurso] = useState(null);

  useEffect(() => {
    fetchRecursos();
  }, []);

  const fetchRecursos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recursos');
      const data = await response.json();
      if (data.success) {
        setRecursos(data.data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecursoIcon = (tipo) => {
    const icons = {
      'libro': '�',
      'musica': '�',
      'video': '�'
    };
    return icons[tipo] || '�';
  };

  const getRecursoColor = (tipo) => {
    const colors = {
      'libro': '#dc2626',
      'musica': '#8b5cf6',
      'video': '#ef4444'
    };
    return colors[tipo] || '#6b7280';
  };

  const filteredRecursos = recursos.filter(recurso => {
    const matchesFilter = filter === 'todos' || recurso.tipo === filter;
    const matchesSearch = searchTerm === '' || 
      recurso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recurso.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recurso.etiquetas?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const handleRecursoClick = async (recurso) => {
    // Incrementar vistas
    try {
      await fetch(`http://localhost:5000/api/recursos/${recurso._id}/vistas`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Error incrementando vistas:', error);
    }
    
    // Abrir el enlace en nueva pestaña
    window.open(recurso.link, '_blank');
  };

  const handleRecursoModal = (recurso) => {
    setSelectedRecurso(recurso);
  };

  const closeModal = () => {
    setSelectedRecurso(null);
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getFilterOptions = () => {
    const tipos = [...new Set(recursos.map(r => r.tipo))];
    return [
      { value: 'todos', label: 'Todos', count: recursos.length },
      ...tipos.map(tipo => ({
        value: tipo,
        label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
        count: recursos.filter(r => r.tipo === tipo).length
      }))
    ];
  };

  // Recursos por defecto del sistema
  const recursosPorDefecto = [
    {
      _id: 'default-1',
      titulo: "Guía de Relajación Rápida",
      tipo: "libro",
      descripcion: "PDF con técnicas de relajación que puedes usar en cualquier momento para reducir el estrés.",
      link: "https://www.psicologiayser.com/wp-content/uploads/2019/07/guia-relajacion-rapida.pdf",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      duracion: "10 min de lectura",
      etiquetas: ["relajacion", "estres", "tecnicas"],
      categoria: "estres",
      vista: 0,
      creado_por: { name: "Sistema LUDA" },
      createdAt: new Date()
    },
    {
      _id: 'default-2',
      titulo: "Música para Concentración",
      tipo: "musica",
      descripcion: "Playlist instrumental diseñada para mejorar la concentración durante el estudio.",
      link: "https://www.youtube.com/watch?v=2_O0ixgW2_A",
      thumbnail: "https://img.youtube.com/vi/2_O0ixgW2_A/hqdefault.jpg",
      duracion: "1 hora",
      etiquetas: ["concentracion", "musica", "estudio"],
      categoria: "bienestar",
      vista: 0,
      creado_por: { name: "Sistema LUDA" },
      createdAt: new Date()
    },
    {
      _id: 'default-3',
      titulo: "Respiración para la Ansiedad",
      tipo: "video",
      descripcion: "Video con ejercicios de respiración para controlar los síntomas de ansiedad.",
      link: "https://www.youtube.com/watch?v=inW4Wh8pnLQ",
      thumbnail: "https://img.youtube.com/vi/inW4Wh8pnLQ/hqdefault.jpg",
      duracion: "12 min",
      etiquetas: ["ansiedad", "respiracion", "tecnicas"],
      categoria: "ansiedad",
      vista: 0,
      creado_por: { name: "Sistema LUDA" },
      createdAt: new Date()
    }
  ];

  const todosLosRecursos = [...recursosPorDefecto, ...filteredRecursos];

  if (loading) {
    return <SimpleLoading text="Cargando recursos..." />;
  }

  return (
    <div className="recursos-container">
      <div className="recursos-header">
        <h1>Recursos de Bienestar</h1>
        <p>Explora materiales diseñados para apoyar tu salud mental y emocional</p>
      </div>

      {/* Buscador y filtros */}
      <div className="recursos-filtros">
        <div className="search-container">
          <div className="search-input">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar recursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-container">
          <div className="filter-buttons">
            {getFilterOptions().map(option => (
              <button
                key={option.value}
                className={`filter-btn ${filter === option.value ? 'active' : ''}`}
                onClick={() => setFilter(option.value)}
              >
                <span className="filter-icon">
                  {option.value === 'todos' ? '📚' : getRecursoIcon(option.value)}
                </span>
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de recursos */}
      <div className="recursos-list">
        {todosLosRecursos.length > 0 ? (
          todosLosRecursos.map(recurso => (
            <div 
              key={recurso._id} 
              className="recurso-card"
              onClick={() => handleRecursoClick(recurso)}
            >
              <div className="recurso-header">
                <div 
                  className="recurso-icon"
                  style={{ backgroundColor: getRecursoColor(recurso.tipo) }}
                >
                  {getRecursoIcon(recurso.tipo)}
                </div>
                <div className="recurso-info">
                  <h3>{recurso.titulo}</h3>
                  <p className="recurso-descripcion">{recurso.descripcion}</p>
                  <div className="recurso-meta">
                    <span className="recurso-tipo">
                      {recurso.tipo.charAt(0).toUpperCase() + recurso.tipo.slice(1)}
                    </span>
                    <span className="recurso-fecha">
                      {formatFecha(recurso.createdAt)}
                    </span>
                    {recurso.duracion && (
                      <span className="recurso-duracion">
                        ⏱️ {recurso.duracion}
                      </span>
                    )}
                  </div>
                </div>
                <div className="recurso-action">
                  <button className="ver-mas-btn">
                    Ver más →
                  </button>
                </div>
              </div>

              {recurso.etiquetas && recurso.etiquetas.length > 0 && (
                <div className="recurso-etiquetas">
                  {recurso.etiquetas.map((etiqueta, index) => (
                    <span key={index} className="etiqueta">
                      #{etiqueta}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-recursos">
            <div className="no-recursos-icon">📚</div>
            <h3>No se encontraron recursos</h3>
            <p>
              {searchTerm 
                ? 'No hay recursos que coincidan con tu búsqueda.'
                : 'No hay recursos disponibles en este momento.'
              }
            </p>
            {searchTerm && (
              <button 
                className="limpiar-busqueda-btn"
                onClick={() => setSearchTerm('')}
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de detalle de recurso */}
      {selectedRecurso && (
        <div className="recurso-modal-overlay" onClick={closeModal}>
          <div className="recurso-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div 
                  className="modal-icon"
                  style={{ backgroundColor: getRecursoColor(selectedRecurso.tipo) }}
                >
                  {getRecursoIcon(selectedRecurso.tipo)}
                </div>
                <h2>{selectedRecurso.titulo}</h2>
              </div>
              <button className="close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="recurso-detalle">
                <p className="recurso-descripcion-completa">
                  {selectedRecurso.descripcion}
                </p>
                
                <div className="recurso-enlace">
                  <h3>Enlace al recurso</h3>
                  <a 
                    href={selectedRecurso.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="enlace-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRecursoClick(selectedRecurso);
                    }}
                  >
                    <span className="enlace-icon">🔗</span>
                    Abrir recurso externo
                  </a>
                </div>

                {selectedRecurso.etiquetas && selectedRecurso.etiquetas.length > 0 && (
                  <div className="recurso-etiquetas-modal">
                    <h3>Etiquetas</h3>
                    <div className="etiquetas-list">
                      {selectedRecurso.etiquetas.map((etiqueta, index) => (
                        <span key={index} className="etiqueta">
                          #{etiqueta}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="recurso-meta-modal">
                  <div className="meta-item">
                    <span className="meta-label">Tipo:</span>
                    <span className="meta-value">
                      {selectedRecurso.tipo.charAt(0).toUpperCase() + selectedRecurso.tipo.slice(1)}
                    </span>
                  </div>
                  {selectedRecurso.duracion && (
                    <div className="meta-item">
                      <span className="meta-label">Duración:</span>
                      <span className="meta-value">{selectedRecurso.duracion}</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <span className="meta-label">Agregado por:</span>
                    <span className="meta-value">{selectedRecurso.creado_por?.name}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Fecha:</span>
                    <span className="meta-value">{formatFecha(selectedRecurso.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="cerrar-modal-btn" onClick={closeModal}>
                Cerrar
              </button>
              <a 
                href={selectedRecurso.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="acceder-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRecursoClick(selectedRecurso);
                }}
              >
                Acceder al recurso
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstudianteRecursos;
