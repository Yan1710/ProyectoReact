import React, { useState, useEffect } from 'react';
import SimpleLoading from '../../../../components/ui/SimpleLoading';
import './Recursos.css';
import AuthService from '../../../../components/auth/AuthService';

const AdminRecursos = () => {
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRecurso, setCurrentRecurso] = useState(null);
  const [docentes, setDocentes] = useState([]);
  const [psicoorientadores, setPsicoorientadores] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'libro',
    descripcion: '',
    link: '',
    creado_por: '',
    creado_por_modelo: 'Docente',
    thumbnail: '',
    duracion: '',
    etiquetas: '',
    categoria: 'bienestar'
  });

  useEffect(() => {
    fetchRecursos();
    fetchCreadores();
  }, []);

  const fetchRecursos = async () => {
    try {
      const token = AuthService.getToken();
      const response = await fetch('http://localhost:5000/api/recursos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setRecursos(data.data);
      }
    } catch (error) {
      console.error('Error fetching recursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreadores = async () => {
    try {
      const token = AuthService.getToken();
      
      const [docentesRes, psicoRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/docentes', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/psicoorientadores', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const docentesData = await docentesRes.json();
      const psicoData = await psicoRes.json();

      if (docentesData.success) setDocentes(docentesData.data);
      if (psicoData.success) setPsicoorientadores(psicoData.data);
    } catch (error) {
      console.error('Error fetching creadores:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = AuthService.getToken();
      const datosEnvio = {
        ...formData,
        etiquetas: formData.etiquetas.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const url = editMode 
        ? `http://localhost:5000/api/admin/recursos/${currentRecurso._id}`
        : 'http://localhost:5000/api/admin/recursos';

      const response = await fetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosEnvio)
      });

      const data = await response.json();
      if (data.success) {
        alert(editMode ? 'Recurso actualizado exitosamente' : 'Recurso creado exitosamente');
        setShowForm(false);
        resetForm();
        fetchRecursos();
      } else {
        alert(data.message || 'Error al guardar recurso');
      }
    } catch (error) {
      console.error('Error guardando recurso:', error);
      alert('Error de conexión al guardar recurso');
    }
  };

  const handleEdit = (recurso) => {
    setEditMode(true);
    setCurrentRecurso(recurso);
    setFormData({
      titulo: recurso.titulo,
      tipo: recurso.tipo,
      descripcion: recurso.descripcion,
      link: recurso.link,
      creado_por: recurso.creado_por._id,
      creado_por_modelo: recurso.creado_por_modelo,
      thumbnail: recurso.thumbnail || '',
      duracion: recurso.duracion || '',
      etiquetas: recurso.etiquetas.join(', '),
      categoria: recurso.categoria
    });
    setShowForm(true);
  };

  const handleDelete = async (recurso) => {
    if (!confirm(`¿Estás seguro de desactivar el recurso "${recurso.titulo}"?`)) {
      return;
    }

    try {
      const token = AuthService.getToken();
      const response = await fetch(`http://localhost:5000/api/admin/recursos/${recurso._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Recurso desactivado exitosamente');
        fetchRecursos();
      } else {
        alert(data.message || 'Error al desactivar recurso');
      }
    } catch (error) {
      console.error('Error desactivando recurso:', error);
      alert('Error de conexión al desactivar recurso');
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      tipo: 'libro',
      descripcion: '',
      link: '',
      creado_por: '',
      creado_por_modelo: 'Docente',
      thumbnail: '',
      duracion: '',
      etiquetas: '',
      categoria: 'bienestar'
    });
    setEditMode(false);
    setCurrentRecurso(null);
  };

  const getRecursoIcon = (tipo) => {
    const icons = {
      'libro': '📚',
      'musica': '🎵',
      'video': '🎥'
    };
    return icons[tipo] || '📋';
  };

  if (loading) {
    return <SimpleLoading text="Cargando recursos..." />;
  }

  return (
    <div className="admin-recursos">
      <div className="admin-header">
        <h1>Gestión de Recursos</h1>
        <button 
          className="add-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <span className="btn-icon">➕</span>
          Agregar Recurso
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h2>{editMode ? 'Editar Recurso' : 'Nuevo Recurso'}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Título *</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tipo *</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="libro">📚 Libro</option>
                    <option value="musica">🎵 Música</option>
                    <option value="video">🎥 Video</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Descripción *</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    required
                    rows={3}
                  ></textarea>
                </div>

                <div className="form-group full-width">
                  <label>Enlace *</label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    required
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label>Creado por *</label>
                  <select
                    name="creado_por_modelo"
                    value={formData.creado_por_modelo}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Docente">Docente</option>
                    <option value="Psicoorientador">Psicoorientador</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{formData.creado_por_modelo === 'Docente' ? 'Docente' : 'Psicoorientador'} *</label>
                  <select
                    name="creado_por"
                    value={formData.creado_por}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {(formData.creado_por_modelo === 'Docente' ? docentes : psicoorientadores).map(creador => (
                      <option key={creador._id} value={creador._id}>
                        {creador.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Thumbnail (URL)</label>
                  <input
                    type="url"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label>Duración</label>
                  <input
                    type="text"
                    name="duracion"
                    value={formData.duracion}
                    onChange={handleInputChange}
                    placeholder="Ej: 15 min, 1 hora"
                  />
                </div>

                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                  >
                    <option value="bienestar">Bienestar</option>
                    <option value="manejo_emociones">Manejo de Emociones</option>
                    <option value="estres">Estrés</option>
                    <option value="ansiedad">Ansiedad</option>
                    <option value="autoestima">Autoestima</option>
                    <option value="relaciones">Relaciones</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="creatividad">Creatividad</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Etiquetas (separadas por comas)</label>
                  <input
                    type="text"
                    name="etiquetas"
                    value={formData.etiquetas}
                    onChange={handleInputChange}
                    placeholder="Ej: mindfulness, estres, relajacion"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  {editMode ? 'Actualizar' : 'Crear'} Recurso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de recursos */}
      <div className="recursos-list">
        {recursos.length > 0 ? (
          recursos.map(recurso => (
            <div key={recurso._id} className="recurso-item">
              <div className="recurso-header">
                <div className="recurso-icon">
                  {getRecursoIcon(recurso.tipo)}
                </div>
                <div className="recurso-info">
                  <h3>{recurso.titulo}</h3>
                  <p className="recurso-tipo">{recurso.tipo.charAt(0).toUpperCase() + recurso.tipo.slice(1)}</p>
                  <p className="recurso-creador">
                    Por {recurso.creado_por?.name} ({recurso.creado_por_modelo})
                  </p>
                </div>
                <div className="recurso-actions">
                  <button className="edit-btn" onClick={() => handleEdit(recurso)}>
                    ✏️
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(recurso)}>
                    🗑️
                  </button>
                </div>
              </div>
              <div className="recurso-descripcion">
                <p>{recurso.descripcion}</p>
              </div>
              <div className="recurso-meta">
                <span className="recurso-views">👁️ {recurso.vista} vistas</span>
                <span className="recurso-category">📁 {recurso.categoria}</span>
                {recurso.etiquetas.length > 0 && (
                  <div className="recurso-tags">
                    {recurso.etiquetas.map((tag, index) => (
                      <span key={index} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-recursos">
            <p>No hay recursos disponibles</p>
            <button 
              className="add-first-btn"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              Agregar primer recurso
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRecursos;
