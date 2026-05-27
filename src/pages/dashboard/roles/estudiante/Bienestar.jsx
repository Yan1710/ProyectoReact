import React, { useState, useEffect } from 'react';
import './Bienestar.css';
import AuthService from '../../../../components/auth/AuthService';

const EstudianteBienestar = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('autoevaluacion');
  const [ryffData, setRyffData] = useState({
    respuestas: Array(39).fill(null),
    puntuacionTotal: 0,
    nivelBP: '',
    dimensiones: {
      autoaceptacion: 0,
      dominioEntorno: 0,
      relacionesPositivas: 0,
      crecimientoPersonal: 0,
      autonomia: 0,
      propositoVida: 0
    },
    dominanciaAfectos: 'positivos'
  });
  const [showRyffResults, setShowRyffResults] = useState(false);
  const [autoevaluacion, setAutoevaluacion] = useState({
    estado_emocional: '',
    nivel_estres: '',
    calidad_sueño: '',
    relacion_social: '',
    autoestima: '',
    motivacion: ''
  });
  const [recursosRecomendados, setRecursosRecomendados] = useState([]);
  const [historialRyff, setHistorialRyff] = useState([]);
  const [showHistorialRyff, setShowHistorialRyff] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [historialAutoevaluaciones, setHistorialAutoevaluaciones] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forceUpdate, setForceUpdate] = useState(0); // Forzar re-render

  // Función para cargar historial RYFF desde localStorage
  const loadHistorialRyff = () => {
    try {
      const historialGuardado = localStorage.getItem('historialRyff');
      if (historialGuardado) {
        setHistorialRyff(JSON.parse(historialGuardado));
      }
    } catch (error) {
      console.error('Error cargando historial RYFF:', error);
    }
  };

  // Estado para progreso RYFF
  const [ryffProgress, setRyffProgress] = useState({
    evaluacion_id: null,
    estado: null,
    progreso: null,
    respuestas: null,
    ultima_actualizacion: null
  });

  // Guardar progreso en localStorage
  const saveProgressToLocal = (progressData) => {
    try {
      localStorage.setItem('ryffProgress', JSON.stringify(progressData));
      console.log('💾 Progreso guardado en localStorage:', progressData);
    } catch (error) {
      console.error('❌ Error guardando progreso local:', error);
    }
  };

  // Cargar progreso desde localStorage
  const loadProgressFromLocal = () => {
    try {
      const saved = localStorage.getItem('ryffProgress');
      if (saved) {
        const progress = JSON.parse(saved);
        console.log('📂 Progreso cargado desde localStorage:', progress);
        return progress;
      }
    } catch (error) {
      console.error('❌ Error cargando progreso local:', error);
    }
    return null;
  };

  // Sincronizar progreso con backend
  const syncProgressWithBackend = async (progressData) => {
    try {
      const token = AuthService.getToken();
      if (!token) {
        console.warn('⚠️ No hay token, guardando solo localmente');
        saveProgressToLocal(progressData);
        return;
      }

      const response = await fetch('http://localhost:5000/api/estudiante/evaluaciones/ryff/progreso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(progressData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Progreso sincronizado con backend:', result);
        setRyffProgress(result.data);
        saveProgressToLocal(result.data);
      } else {
        console.warn('⚠️ Error sincronizando con backend, guardando localmente');
        saveProgressToLocal(progressData);
      }
    } catch (error) {
      console.error('❌ Error de sincronización:', error);
      saveProgressToLocal(progressData);
    }
  };

  // Cargar progreso desde backend
  const loadProgressFromBackend = async () => {
    try {
      const token = AuthService.getToken();
      if (!token) {
        const localProgress = loadProgressFromLocal();
        if (localProgress) {
          setRyffProgress(localProgress);
        }
        return;
      }

      const response = await fetch('http://localhost:5000/api/estudiante/evaluaciones/ryff/progreso', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          console.log('✅ Progreso cargado desde backend:', result.data);
          setRyffProgress(result.data);
          saveProgressToLocal(result.data);
          
          // Restaurar respuestas si hay
          if (result.data.respuestas) {
            setRyffData(prev => ({
              ...prev,
              respuestas: result.data.respuestas
            }));
          }
        }
      } else {
        const localProgress = loadProgressFromLocal();
        if (localProgress) {
          setRyffProgress(localProgress);
        }
      }
    } catch (error) {
      console.error('❌ Error cargando progreso desde backend:', error);
      const localProgress = loadProgressFromLocal();
      if (localProgress) {
        setRyffProgress(localProgress);
      }
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('🚀 Iniciando carga de datos del perfil (estudiante bienestar)...');
        
        const user = AuthService.getUserInfo();
        console.log('👤 Usuario desde localStorage:', user);
        console.log('🔑 Token disponible:', !!AuthService.getToken());
        
        if (!user || !user.id) {
          console.error('❌ No se encontró información del usuario o ID');
          setError('No se pudo cargar la información del usuario');
          setLoading(false);
          return;
        }

        // Establecer información básica del usuario
        setUserInfo(user);
        
        // Intentar cargar datos adicionales pero sin bloquear la carga
        try {
          const response = await fetch(`/api/estudiante/perfil`, {
            headers: {
              'Authorization': `Bearer ${AuthService.getToken()}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Datos del perfil cargados:', data);
            
            if (data.recursos) {
              setRecursosRecomendados(data.recursos);
            }
            
            if (data.historial) {
              setHistorialAutoevaluaciones(data.historial);
            }
          }
        } catch (apiError) {
          console.warn('⚠️ No se pudieron cargar datos adicionales:', apiError);
          // No bloquear la carga si falla la API
        }
        
        // Cargar datos adicionales en paralelo
        const [historialAuto, historialRyffData, progresoData] = await Promise.allSettled([
          fetchHistorialAutoevaluaciones(),
          fetchHistorialRyff(),
          loadProgressFromBackend()
        ]);

        if (historialAuto.status === 'fulfilled') {
          console.log('✅ Historial autoevaluaciones cargado');
        }
        
        if (historialRyffData.status === 'fulfilled') {
          console.log('✅ Historial RYFF cargado');
        }

        if (progresoData.status === 'fulfilled') {
          console.log('✅ Progreso RYFF cargado');
        }
        
        // Cargar historial de autoevaluaciones desde localStorage
        const historialLocal = JSON.parse(localStorage.getItem('historialAutoevaluaciones') || '[]');
        if (historialLocal.length > 0) {
          setHistorialAutoevaluaciones(historialLocal);
          console.log('✅ Historial local cargado:', historialLocal.length, 'evaluaciones');
        }
        
        // Cargar historial RYFF desde localStorage SIEMPRE
        const historialRyffLocal = JSON.parse(localStorage.getItem('historialRyff') || '[]');
        if (historialRyffLocal.length > 0) {
          setHistorialRyff(historialRyffLocal);
          setForceUpdate(prev => prev + 1); // Forzar re-render
          console.log('✅ Historial RYFF local cargado:', historialRyffLocal.length, 'evaluaciones');
        }
        
        // Si no hay historial RYFF en localStorage pero sí en el estado, sincronizar
        if (historialRyffLocal.length === 0 && historialRyff.length > 0) {
          localStorage.setItem('historialRyff', JSON.stringify(historialRyff));
          console.log('🔄 Historial RYFF sincronizado con localStorage');
        }
        
      } catch (error) {
        console.error('❌ Error general cargando perfil:', error);
        setError('Error de conexión al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const fetchHistorialAutoevaluaciones = async () => {
    try {
      const token = AuthService.getToken();
      const response = await fetch('http://localhost:5000/api/estudiante/autoevaluaciones/historial', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistorialAutoevaluaciones(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching historial:', error);
    }
  };

  const fetchHistorialRyff = async () => {
    try {
      console.log('🚀 Iniciando fetchHistorialRyff...');
      const token = AuthService.getToken();
      console.log('🔑 Token disponible:', !!token);
      
      const response = await fetch('http://localhost:5000/api/estudiante/evaluaciones/ryff/historial', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Respuesta del servidor (historial):', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Historial RYFF cargado desde backend:', data.data);
        console.log('📊 Cantidad de evaluaciones:', data.data?.length);
        
        // Formatear datos para el frontend
        const historialFormateado = data.data.map(evaluacion => ({
          id: evaluacion._id,
          fecha: evaluacion.fecha || evaluacion.createdAt || new Date().toISOString(),
          puntuacionTotal: evaluacion.puntuacion_total || 0,
          nivelBP: evaluacion.nivel_bp || 'BP Bajo',
          dimensiones: evaluacion.dimensiones || {
            autoaceptacion: 0,
            dominioEntorno: 0,
            relacionesPositivas: 0,
            crecimientoPersonal: 0,
            autonomia: 0,
            propositoVida: 0
          },
          dominanciaAfectos: evaluacion.dominancia_afectos || 'positivos',
          recomendaciones: evaluacion.recomendaciones || [],
          estado: evaluacion.estado || 'completada',
          progreso: evaluacion.progreso || {
            respondidas: 39,
            total: 39,
            porcentaje: 100
          }
        }));
        
        console.log('📝 Historial formateado:', historialFormateado);
        setHistorialRyff(historialFormateado);
        setForceUpdate(prev => prev + 1); // Forzar re-render
        
        // También guardar en localStorage como respaldo
        localStorage.setItem('historialRyff', JSON.stringify(historialFormateado));
        console.log('💾 Historial guardado en localStorage');
      } else {
        console.warn('⚠️ No se pudo cargar historial desde backend, usando localStorage');
        // Cargar desde localStorage como respaldo
        const historialLocal = JSON.parse(localStorage.getItem('historialRyff') || '[]');
        setHistorialRyff(historialLocal);
        setForceUpdate(prev => prev + 1); // Forzar re-render
        console.log('📂 Historial cargado desde localStorage:', historialLocal.length);
      }
    } catch (error) {
      console.error('❌ Error cargando historial RYFF desde backend:', error);
      // Cargar desde localStorage como respaldo
      const historialLocal = JSON.parse(localStorage.getItem('historialRyff') || '[]');
      setHistorialRyff(historialLocal);
      setForceUpdate(prev => prev + 1); // Forzar re-render
      console.log('📂 Historial cargado desde localStorage (error):', historialLocal.length);
    }
  };

  const fetchRecursosRecomendados = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recursos/recomendados', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecursosRecomendados(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching recursos:', error);
    }
  };

  const handleAutoevaluacionChange = (field, value) => {
    setAutoevaluacion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitAutoevaluacion = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setSuccess('');
      
      // Primero, mostrar resultados y recomendaciones localmente
      setShowResults(true);
      
      // Guardar en localStorage como respaldo
      const evaluacionGuardada = {
        ...autoevaluacion,
        fecha: new Date().toISOString(),
        id: Date.now()
      };
      
      // Obtener historial existente
      const historialExistente = JSON.parse(localStorage.getItem('historialAutoevaluaciones') || '[]');
      const nuevoHistorial = [evaluacionGuardada, ...historialExistente];
      localStorage.setItem('historialAutoevaluaciones', JSON.stringify(nuevoHistorial));
      setHistorialAutoevaluaciones(nuevoHistorial);
      
      // Intentar guardar en backend
      try {
        const token = AuthService.getToken();
        const response = await fetch('http://localhost:5000/api/estudiante/autoevaluacion', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(autoevaluacion)
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Autoevaluación guardada en backend:', data);
          setSuccess('Autoevaluación guardada exitosamente');
        } else {
          console.warn('⚠️ No se pudo guardar en backend, pero se guardó localmente');
          setSuccess('Autoevaluación guardada localmente');
        }
      } catch (apiError) {
        console.warn('⚠️ Error de conexión con backend, guardado local:', apiError);
        setSuccess('Autoevaluación guardada localmente (sin conexión)');
      }
      
      // Actualizar recursos recomendados basados en la autoevaluación
      fetchRecursosRecomendados();
      
    } catch (error) {
      console.error('Error general:', error);
      setError('Error al procesar la autoevaluación');
    }
  };

  const getRecursoIcon = (tipo) => {
    const icons = {
      'libro': '📚',
      'musica': '🎵',
      'video': '🎥'
    };
    return icons[tipo] || '📋';
  };

  const getEmocionalColor = (nivel) => {
    const colores = {
      'Excelente': '#10b981',
      'Bueno': '#3b82f6',
      'Regular': '#f59e0b',
      'Bajo': '#ef4444'
    };
    return colores[nivel] || '#6b7280';
  };

  const getRecomendaciones = () => {
    const recomendaciones = [];
    
    console.log('🔍 Debug - autoevaluacion:', autoevaluacion);
    
    // Recomendaciones basadas en estado emocional
    if (autoevaluacion.estado_emocional === 'Mal' || autoevaluacion.estado_emocional === 'Regular') {
      recomendaciones.push({
        tipo: '🌟 Cuidado Emocional',
        descripcion: 'Practica la meditación mindfulness por 10 minutos diarios. La respiración profunda y el enfoque en el presente ayudan a regular tus emociones.',
        icono: '🧘‍♀️',
        prioridad: 'alta'
      });
    }
    
    if (autoevaluacion.estado_emocional === 'Bueno' || autoevaluacion.estado_emocional === 'Excelente') {
      recomendaciones.push({
        tipo: '✨ Mantén tu Energía',
        descripcion: 'Continúa con tus prácticas positivas. Comparte tu energía con otros y considera mantener un diario gratitud.',
        icono: '🌈',
        prioridad: 'media'
      });
    }
    
    // Recomendaciones basadas en nivel de estrés
    if (autoevaluacion.nivel_estres === 'Alto' || autoevaluacion.nivel_estres === 'Muy Alto') {
      recomendaciones.push({
        tipo: '🚨 Gestión del Estrés',
        descripcion: 'Establece límites claros entre estudio y descanso. Prueba técnicas de relajación progresiva y considera reducir el consumo de cafeína.',
        icono: '🛑',
        prioridad: 'alta'
      });
      
      recomendaciones.push({
        tipo: '🏃‍♀️ Actividad Física',
        descripcion: 'Realiza 20-30 minutos de ejercicio moderado diario. Caminar, correr o yoga ayudan a reducir el cortisol y mejorar tu estado de ánimo.',
        icono: '🏃',
        prioridad: 'alta'
      });
    }
    
    if (autoevaluacion.nivel_estres === 'Bajo') {
      recomendaciones.push({
        tipo: '😌 Mantén la Calma',
        descripcion: 'Excelente manejo del estrés. Considera enseñar tus técnicas a compañeros que puedan estar luchando con el estrés.',
        icono: '🍃',
        prioridad: 'baja'
      });
    }
    
    // Recomendaciones basadas en calidad de sueño
    if (autoevaluacion.calidad_sueño === 'Mala' || autoevaluacion.calidad_sueño === 'Regular') {
      recomendaciones.push({
        tipo: '😴 Higiene del Sueño',
        descripcion: 'Establece una rutina regular: duerme 7-9 horas, evita pantallas 1 hora antes de dormir, y mantén tu habitación fresca y oscura.',
        icono: '🌙',
        prioridad: 'alta'
      });
      
      recomendaciones.push({
        tipo: 'té Relajante',
        descripcion: 'Prueba té de manzanilla o valeriana antes de dormir. Evita comidas pesadas y ejercicio intenso 2 horas antes de acostarte.',
        icono: '☕',
        prioridad: 'media'
      });
    }
    
    if (autoevaluacion.calidad_sueño === 'Excelente' || autoevaluacion.calidad_sueño === 'Buena') {
      recomendaciones.push({
        tipo: '💤 Descano Óptimo',
        descripcion: 'Tu calidad de sueño es excelente. Mantén tu rutina y considera un power nap de 20 minutos si necesitas recargar energías.',
        icono: '⭐',
        prioridad: 'baja'
      });
    }
    
    // Recomendaciones basadas en relaciones sociales
    if (autoevaluacion.relacion_social === 'Difícil' || autoevaluacion.relacion_social === 'Regular') {
      recomendaciones.push({
        tipo: '👥 Conexiones Sociales',
        descripcion: 'Únete a grupos de estudio o actividades extracurriculares. Las conexiones sociales son fundamentales para el bienestar emocional.',
        icono: '🤝',
        prioridad: 'alta'
      });
      
      recomendaciones.push({
        tipo: '💬 Comunicación Asertiva',
        descripcion: 'Practica expresar tus necesidades y límites de manera respetuosa. La comunicación clara fortalece cualquier relación.',
        icono: '🗣️',
        prioridad: 'media'
      });
    }
    
    if (autoevaluacion.relacion_social === 'Excelente' || autoevaluacion.relacion_social === 'Buena') {
      recomendaciones.push({
        tipo: '🌟 Red de Apoyo',
        descripcion: 'Tus relaciones son sólidas. Considera ser mentor para otros estudiantes y fortalecer aún más tu red de apoyo.',
        icono: '�',
        prioridad: 'baja'
      });
    }
    
    // Recomendaciones basadas en autoestima
    if (autoevaluacion.autoestima === 'Baja' || autoevaluacion.autoestima === 'Regular') {
      recomendaciones.push({
        tipo: '💪 Fortalecimiento Personal',
        descripcion: 'Practica el autocuidado diario y celebra pequeños logros. Recuerda que tu valor no depende de tu rendimiento académico.',
        icono: '🛡️',
        prioridad: 'alta'
      });
      
      recomendaciones.push({
        tipo: '📓 Diario de Logros',
        descripcion: 'Anota 3 cosas que hiciste bien cada día. Enfócate en tus fortalezas y aprendizajes, no solo en los resultados.',
        icono: '📝',
        prioridad: 'media'
      });
    }
    
    if (autoevaluacion.autoestima === 'Alta' || autoevaluacion.autoestima === 'Buena') {
      recomendaciones.push({
        tipo: '🎉 Confianza Sólida',
        descripcion: 'Tu autoestima es fuerte. Comparte tu confianza con otros y considera nuevos desafíos que sigan expandiendo tu zona de confort.',
        icono: '🏆',
        prioridad: 'baja'
      });
    }
    
    // Recomendaciones basadas en motivación
    if (autoevaluacion.motivacion === 'Baja' || autoevaluacion.motivacion === 'Regular') {
      recomendaciones.push({
        tipo: '🎯 Recuperando la Motivación',
        descripcion: 'Reconecta con tus metas originales. Divide grandes objetivos en pasos pequeños y celebra cada avance.',
        icono: '🔥',
        prioridad: 'alta'
      });
      
      recomendaciones.push({
        tipo: '🌅 Nueva Perspectiva',
        descripcion: 'Cambia tu entorno de estudio, busca inspiración en nuevas fuentes, y recuerda por qué comenzaste este camino.',
        icono: '🔄',
        prioridad: 'media'
      });
    }
    
    if (autoevaluacion.motivacion === 'Muy Alta' || autoevaluacion.motivacion === 'Alta') {
      recomendaciones.push({
        tipo: '🚀 Impulso Máximo',
        descripcion: 'Aprovecha tu alta motivación para proyectos desafiantes. Mantén el equilibrio para evitar el agotamiento.',
        icono: '⚡',
        prioridad: 'media'
      });
    }
    
    // Recomendación general si todo está bien
    if (recomendaciones.length === 0) {
      recomendaciones.push({
        tipo: '🌟 Bienestar Integral',
        descripcion: '¡Tu estado emocional es excelente! Mantén tus prácticas positivas y considera compartir tu sabiduría con compañeros.',
        icono: '�',
        prioridad: 'baja'
      });
    }
    
    // Ordenar por prioridad
    const recomendacionesOrdenadas = recomendaciones.sort((a, b) => {
      const priorityOrder = { alta: 0, media: 1, baja: 2 };
      return priorityOrder[a.prioridad] - priorityOrder[b.prioridad];
    });
    
    console.log('🔍 Debug - recomendaciones generadas:', recomendacionesOrdenadas);
    return recomendacionesOrdenadas;
  };

  const handleRecursoClick = async (recurso) => {
    try {
      await fetch(`http://localhost:5000/api/recursos/${recurso._id}/vistas`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Error incrementando vistas:', error);
    }
    
    window.open(recurso.link, '_blank');
  };

  const resetAutoevaluacionForm = () => {
    setAutoevaluacion({
      estado_emocional: '',
      nivel_estres: '',
      calidad_sueño: '',
      relacion_social: '',
      autoestima: '',
      motivacion: ''
    });
    setShowResults(false);
    setError('');
    setSuccess('');
  };

  // Función de prueba para mostrar resultados
  const handleTestResults = () => {
    setAutoevaluacion({
      estado_emocional: 'Regular',
      nivel_estres: 'Alto',
      calidad_sueño: 'Mala',
      relacion_social: 'Regular',
      autoestima: 'Baja',
      motivacion: 'Baja'
    });
    setShowResults(true);
    console.log('🧪 Prueba: Resultados mostrados con datos de prueba');
  };

  // Función de prueba para RYFF
  const handleTestRyff = () => {
    // Crear respuestas de prueba (valores aleatorios entre 1-6)
    const respuestasPrueba = Array.from({length: 39}, () => Math.floor(Math.random() * 6) + 1);
    
    setRyffData({
      respuestas: respuestasPrueba,
      puntuacionTotal: 0,
      nivelBP: '',
      dimensiones: {
        autoaceptacion: 0,
        dominioEntorno: 0,
        relacionesPositivas: 0,
        crecimientoPersonal: 0,
        autonomia: 0,
        propositoVida: 0
      },
      dominanciaAfectos: 'positivos'
    });
    
    // Guardar progreso de prueba inmediatamente
    const progressData = {
      evaluacion_id: ryffProgress?.evaluacion_id,
      respuestas: respuestasPrueba,
      pregunta_actual: 38, // Última pregunta
      timestamp_progreso: new Date().toISOString()
    };
    
    // Guardar localmente
    saveProgressToLocal(progressData);
    
    // Sincronizar con backend
    syncProgressWithBackend(progressData);
    
    console.log('🧪 Prueba RYFF: Respuestas generadas y guardadas:', respuestasPrueba);
    console.log('🧪 Progreso guardado automáticamente');
    console.log('🧪 Ahora haz clic en "🧠✨ Analizar Mi Bienestar" para procesar resultados');
  };

  // Funciones para la escala RYFF
  const getRyffQuestions = () => [
    // Autoaceptación (Preguntas 1, 7, 13, 19, 25, 31)
    { id: 1, texto: "Cuando repaso la historia de mi vida estoy contento con cómo han resultado las cosas.", dimension: "autoaceptacion" },
    { id: 7, texto: "En general, me siento seguro y positivo conmigo mismo.", dimension: "autoaceptacion" },
    { id: 13, texto: "Si tuviera la oportunidad, hay muchas cosas de mí mismo que cambiaría.", dimension: "autoaceptacion" },
    { id: 19, texto: "Me gusta la mayor parte de los aspectos de mi personalidad.", dimension: "autoaceptacion" },
    { id: 25, texto: "En muchos aspectos, me siento decepcionado de mis logros en la vida.", dimension: "autoaceptacion" },
    { id: 31, texto: "En su mayor parte, me siento orgulloso de quien soy y la vida que llevo.", dimension: "autoaceptacion" },
    
    // Relaciones Positivas (Preguntas 2, 8, 14, 20, 26, 32)
    { id: 2, texto: "A menudo me siento solo porque tengo pocos amigos íntimos con quienes compartir mis preocupaciones.", dimension: "relacionesPositivas" },
    { id: 8, texto: "No tengo muchas personas que quieran escucharme cuando necesito hablar.", dimension: "relacionesPositivas" },
    { id: 14, texto: "Siento que mis amistades me aportan muchas cosas.", dimension: "relacionesPositivas" },
    { id: 20, texto: "Me parece que la mayor parte de las personas tienen más amigos que yo.", dimension: "relacionesPositivas" },
    { id: 26, texto: "No he experimentado muchas relaciones cercanas y de confianza.", dimension: "relacionesPositivas" },
    { id: 32, texto: "Sé que puedo confiar en mis amigos, y ellos saben que pueden confiar en mí.", dimension: "relacionesPositivas" },
    
    // Autonomía (Preguntas 3, 4, 9, 10, 15, 21, 27, 33)
    { id: 3, texto: "No tengo miedo de expresar mis opiniones, incluso cuando son opuestas a las opiniones de la mayoría de la gente.", dimension: "autonomia" },
    { id: 4, texto: "Me preocupa cómo otra gente evalúa las elecciones que he hecho en mi vida.", dimension: "autonomia" },
    { id: 9, texto: "Tiendo a preocuparme sobre lo que otra gente piensa de mí.", dimension: "autonomia" },
    { id: 10, texto: "Me juzgo por lo que yo creo que es importante, no por los valores que otros piensan que son importantes.", dimension: "autonomia" },
    { id: 15, texto: "Tiendo a estar influenciado por la gente con fuertes convicciones.", dimension: "autonomia" },
    { id: 21, texto: "Tengo confianza en mis opiniones incluso si son contrarias al consenso general.", dimension: "autonomia" },
    { id: 27, texto: "Es difícil para mí expresar mis propias opiniones en asuntos polémicos.", dimension: "autonomia" },
    { id: 33, texto: "A menudo cambio mis decisiones si mis amigos o mi familia están en desacuerdo.", dimension: "autonomia" },
    
    // Dominio del Entorno (Preguntas 5, 11, 16, 22, 28, 39)
    { id: 5, texto: "Me resulta difícil dirigir mi vida hacia un camino que me satisfaga.", dimension: "dominioEntorno" },
    { id: 11, texto: "He sido capaz de construir un hogar y un modo de vida a mi gusto.", dimension: "dominioEntorno" },
    { id: 16, texto: "En general, siento que soy responsable de la situación en la que vivo.", dimension: "dominioEntorno" },
    { id: 22, texto: "Las demandas de la vida diaria a menudo me deprimen.", dimension: "dominioEntorno" },
    { id: 28, texto: "Soy bastante bueno manejando muchas de mis responsabilidades en la vida diaria.", dimension: "dominioEntorno" },
    { id: 39, texto: "Si me sintiera infeliz con mi situación de vida daría los pasos más eficaces para cambiarla.", dimension: "dominioEntorno" },
    
    // Propósito en la Vida (Preguntas 6, 12, 17, 18, 23, 29)
    { id: 6, texto: "Disfruto haciendo planes para el futuro y trabajar para hacerlos realidad.", dimension: "propositoVida" },
    { id: 12, texto: "Soy una persona activa al realizar los proyectos que propuse para mí mismo.", dimension: "propositoVida" },
    { id: 17, texto: "Me siento bien cuando pienso en lo que he hecho en el pasado y lo que espero hacer en el futuro.", dimension: "propositoVida" },
    { id: 18, texto: "Mis objetivos en la vida han sido más una fuente de satisfacción que de frustración para mí.", dimension: "propositoVida" },
    { id: 23, texto: "Tengo clara la dirección y el objetivo de mi vida.", dimension: "propositoVida" },
    { id: 29, texto: "No tengo claro qué es lo que intento conseguir en la vida.", dimension: "propositoVida" },
    
    // Crecimiento Personal (Preguntas 24, 30, 34, 35, 36, 37, 38)
    { id: 24, texto: "En general, con el tiempo siento que sigo aprendiendo más sobre mí mismo.", dimension: "crecimientoPersonal" },
    { id: 30, texto: "Hace mucho tiempo que dejé de intentar hacer grandes mejoras o cambios en mi vida.", dimension: "crecimientoPersonal" },
    { id: 34, texto: "No quiero intentar nuevas formas de hacer las cosas; mi vida está bien como está.", dimension: "crecimientoPersonal" },
    { id: 35, texto: "Pienso que es importante tener nuevas experiencias que desafíen lo que uno piensa sobre sí mismo y sobre el mundo.", dimension: "crecimientoPersonal" },
    { id: 36, texto: "Cuando pienso en ello, realmente con los años no he mejorado mucho como persona.", dimension: "crecimientoPersonal" },
    { id: 37, texto: "Tengo la sensación de que con el tiempo me he desarrollado mucho como persona.", dimension: "crecimientoPersonal" },
    { id: 38, texto: "Para mí, la vida ha sido un proceso continuo de estudio, cambio y crecimiento.", dimension: "crecimientoPersonal" }
  ];

  const getQuestionsByDimension = () => {
    const questions = getRyffQuestions();
    const dimensions = {
      autoaceptacion: [],
      relacionesPositivas: [],
      autonomia: [],
      dominioEntorno: [],
      propositoVida: [],
      crecimientoPersonal: []
    };

    questions.forEach((question, index) => {
      dimensions[question.dimension].push({
        ...question,
        index
      });
    });

    return dimensions;
  };

  const handleRyffChange = (questionIndex, value) => {
    const newRespuestas = [...ryffData.respuestas];
    newRespuestas[questionIndex] = value;
    setRyffData(prev => ({ ...prev, respuestas: newRespuestas }));
    
    // Guardar progreso automáticamente cada vez que se responde una pregunta
    const progressData = {
      evaluacion_id: ryffProgress?.evaluacion_id,
      respuestas: newRespuestas,
      pregunta_actual: questionIndex,
      timestamp_progreso: new Date().toISOString()
    };
    
    // Guardar localmente inmediatamente
    saveProgressToLocal(progressData);
    
    // Sincronizar con backend (async para no bloquear UI)
    syncProgressWithBackend(progressData);
  };

  const calculateRyffResults = () => {
    const dimensiones = {
      autoaceptacion: [1, 7, 13, 19, 25, 31],
      dominioEntorno: [5, 11, 16, 22, 28, 39],
      relacionesPositivas: [2, 8, 14, 20, 26, 32],
      crecimientoPersonal: [24, 30, 34, 35, 36, 37, 38],
      autonomia: [3, 4, 9, 10, 15, 21, 27, 33],
      propositoVida: [6, 12, 17, 18, 23, 29]
    };

    const puntuaciones = {};
    let totalPositivos = 0;
    let totalNegativos = 0;

    Object.entries(dimensiones).forEach(([dimension, preguntas]) => {
      puntuaciones[dimension] = preguntas.reduce((sum, preguntaIndex) => {
        const respuesta = ryffData.respuestas[preguntaIndex - 1];
        return sum + (respuesta || 0);
      }, 0);

      if (dimension === 'relacionesPositivas') {
        totalPositivos += puntuaciones[dimension];
      } else if (dimension === 'dominioEntorno') {
        totalNegativos += puntuaciones[dimension];
      }
    });

    const puntuacionTotal = Object.values(puntuaciones).reduce((sum, score) => sum + score, 0);
    
    let nivelBP = '';
    if (puntuacionTotal > 176) nivelBP = 'BP Elevado';
    else if (puntuacionTotal >= 141 && puntuacionTotal <= 175) nivelBP = 'BP Alto';
    else if (puntuacionTotal >= 117 && puntuacionTotal <= 140) nivelBP = 'BP Moderado';
    else if (puntuacionTotal < 116) nivelBP = 'BP Bajo';

    const dominanciaAfectos = totalPositivos > totalNegativos ? 'positivos' : 'negativos';

    return {
      puntuacionTotal,
      nivelBP,
      dimensiones: puntuaciones,
      dominanciaAfectos
    };
  };

  const handleRyffSubmit = async () => {
    try {
      setLoading(true);
      
      // Verificar si todas las preguntas están respondidas
      const respuestasNoNulas = ryffData.respuestas.filter(r => r !== null);
      if (respuestasNoNulas.length < 39) {
        setError('Por favor responde todas las 39 preguntas antes de ver los resultados');
        setLoading(false);
        return;
      }
      
      const results = calculateRyffResults();
      console.log('🔍 Debug - RYFF Results:', results);
      
      // Actualizar estado con los resultados
      const updatedRyffData = {
        ...ryffData,
        ...results
      };
      setRyffData(updatedRyffData);
      setShowRyffResults(true);
      
      // 1. Guardar progreso final (100% completado)
      const finalProgressData = {
        evaluacion_id: ryffProgress?.evaluacion_id,
        respuestas: ryffData.respuestas,
        pregunta_actual: 38, // Última pregunta
        timestamp_progreso: new Date().toISOString()
      };
      
      // Guardar progreso final localmente y en backend
      saveProgressToLocal(finalProgressData);
      await syncProgressWithBackend(finalProgressData);
      
      // 2. Guardar evaluación completa en localStorage
      const nuevaEvaluacion = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        respuestas: ryffData.respuestas,
        puntuacionTotal: results.puntuacionTotal,
        nivelBP: results.nivelBP,
        dimensiones: results.dimensiones,
        dominanciaAfectos: results.dominanciaAfectos,
        recomendaciones: []
      };
      
      // Generar recomendaciones
      try {
        nuevaEvaluacion.recomendaciones = getRyffRecommendationsByLevel(results.nivelBP, results.dimensiones);
      } catch (error) {
        console.error('❌ Error generando recomendaciones:', error);
        nuevaEvaluacion.recomendaciones = [{
          titulo: '🎯 Recomendación General',
          descripcion: 'Continúa trabajando en tu bienestar personal.',
          icono: '🎯',
          categoria: 'general',
          prioridad: 'media'
        }];
      }
      
      // Agregar al historial local
      const nuevoHistorial = [nuevaEvaluacion, ...historialRyff];
      setHistorialRyff(nuevoHistorial);
      localStorage.setItem('historialRyff', JSON.stringify(nuevoHistorial));
      
      console.log('✅ Evaluación RYFF guardada localmente:', nuevaEvaluacion);
      
      // 3. Intentar guardar en backend (opcional)
      try {
        const evaluationData = {
          respuestas: ryffData.respuestas,
          puntuacion_total: results.puntuacionTotal,
          nivel_bp: results.nivelBP,
          dimensiones: results.dimensiones,
          dominancia_afectos: results.dominanciaAfectos,
          fecha: new Date().toISOString()
        };

        console.log('🔍 Enviando evaluación final al backend:', evaluationData);

        const response = await fetch('http://localhost:5000/api/estudiante/evaluaciones/ryff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(evaluationData)
        });

        console.log('📡 Respuesta del servidor (evaluación final):', response.status);

        if (response.ok) {
          const responseData = await response.json();
          console.log('✅ Evaluación final guardada en backend:', responseData);
          setSuccess('✅ Evaluación guardada exitosamente en la base de datos');
          
          // Refrescar historial desde backend para obtener los datos más recientes
          setTimeout(() => {
            fetchHistorialRyff();
          }, 500);
          
          // También forzar actualización del localStorage
          setTimeout(() => {
            const historialLocal = JSON.parse(localStorage.getItem('historialRyff') || '[]');
            if (historialLocal.length > 0) {
              setHistorialRyff(historialLocal);
              console.log('🔄 Historial actualizado desde localStorage:', historialLocal.length);
            }
          }, 1000);
        } else {
          const errorData = await response.json();
          console.error('❌ Error del servidor (evaluación final):', errorData);
          setSuccess('✅ Evaluación guardada localmente');
          console.warn('⚠️ No se pudo guardar en backend, pero está guardada localmente');
          
          // Asegurarse de que el historial local esté actualizado
          const historialLocal = JSON.parse(localStorage.getItem('historialRyff') || '[]');
          setHistorialRyff(historialLocal);
        }
      } catch (apiError) {
        console.error('❌ Error de conexión con backend (evaluación final):', apiError);
        setSuccess('✅ Evaluación guardada localmente (sin conexión)');
        console.warn('⚠️ Error de conexión con backend:', apiError);
        
        // Asegurarse de que el historial local esté actualizado
        const historialLocal = JSON.parse(localStorage.getItem('historialRyff') || '[]');
        setHistorialRyff(historialLocal);
      }
      
    } catch (error) {
      console.error('❌ Error general en RYFF:', error);
      setError('Error al procesar la evaluación RYFF');
    } finally {
      setLoading(false);
    }
  };

  // Función para recargar historial cuando se cambia a la pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Si cambia a la pestaña de historial RYFF, recargar datos
    if (tab === 'historial-ryff') {
      console.log('🔄 Cambiando a historial RYFF, recargando datos...');
      
      // Recargar desde backend
      fetchHistorialRyff();
      
      // También verificar localStorage
      setTimeout(() => {
        const historialLocal = JSON.parse(localStorage.getItem('historialRyff') || '[]');
        console.log('📂 Historial en localStorage:', historialLocal.length, 'evaluaciones');
        
        if (historialLocal.length > 0 && historialRyff.length === 0) {
          setHistorialRyff(historialLocal);
          console.log('🔄 Historial cargado desde localStorage');
        }
      }, 500);
    }
  };

  // Función de depuración para verificar historial
  const debugHistorial = () => {
    console.log('🔍 DEBUG - Estado actual del historial:');
    console.log('historialRyff:', historialRyff);
    console.log('Longitud:', historialRyff.length);
    
    const historialLocal = JSON.parse(localStorage.getItem('historialRyff') || '[]');
    console.log('localStorage historialRyff:', historialLocal);
    console.log('localStorage Longitud:', historialLocal.length);
    
    // Forzar actualización desde localStorage si está vacío
    if (historialRyff.length === 0 && historialLocal.length > 0) {
      console.log('🔄 Forzando actualización desde localStorage');
      setHistorialRyff(historialLocal);
    }
  };

  const resetRyffForm = () => {
    setRyffData({
      respuestas: Array(39).fill(null),
      puntuacionTotal: 0,
      nivelBP: '',
      dimensiones: {
        autoaceptacion: 0,
        dominioEntorno: 0,
        relacionesPositivas: 0,
        crecimientoPersonal: 0,
        autonomia: 0,
        propositoVida: 0
      },
      dominanciaAfectos: 'positivos'
    });
    setShowRyffResults(false);
    setError('');
    setSuccess('');
  };

  const saveRyffProgress = () => {
    try {
      const progressData = {
        evaluacion_id: ryffProgress?.evaluacion_id,
        respuestas: ryffData.respuestas,
        pregunta_actual: ryffData.respuestas.filter(r => r !== null).length - 1,
        timestamp_progreso: new Date().toISOString()
      };
      
      // Guardar localmente inmediatamente
      saveProgressToLocal(progressData);
      
      // Sincronizar con backend
      syncProgressWithBackend(progressData);
      
      setSuccess('💾 Progreso guardado automáticamente');
    } catch (error) {
      console.error('❌ Error guardando progreso:', error);
    }
  };

  const getDimensionName = (dimension) => {
    const names = {
      autoaceptacion: 'Autoaceptación',
      dominioEntorno: 'Dominio del Entorno',
      relacionesPositivas: 'Relaciones Positivas',
      crecimientoPersonal: 'Crecimiento Personal',
      autonomia: 'Autonomía',
      propositoVida: 'Propósito en la Vida'
    };
    return names[dimension] || dimension;
  };

  const getDimensionMax = (dimension) => {
    const maxScores = {
      autoaceptacion: 36,
      dominioEntorno: 39,
      relacionesPositivas: 36,
      crecimientoPersonal: 42,
      autonomia: 33,
      propositoVida: 36
    };
    return maxScores[dimension] || 0;
  };

  const getDimensionLevel = (puntuacion, maxScore) => {
    const percentage = (puntuacion / maxScore) * 100;
    if (percentage > 75) return 'Alto';
    if (percentage >= 50) return 'Medio';
    return 'Bajo';
  };

  const getDimensionLevelClass = (puntuacion, maxScore) => {
    const level = getDimensionLevel(puntuacion, maxScore);
    return `dimension-${level.toLowerCase()}`;
  };

  const getDimensionInfo = () => [
    { key: 'autoaceptacion', emoji: '🤗', name: 'Autoaceptación', color: '#FF6B6B' },
    { key: 'dominioEntorno', emoji: '🏠', name: 'Dominio del Entorno', color: '#4ECDC4' },
    { key: 'relacionesPositivas', emoji: '💑', name: 'Relaciones Positivas', color: '#45B7D1' },
    { key: 'crecimientoPersonal', emoji: '🌱', name: 'Crecimiento Personal', color: '#96CEB4' },
    { key: 'autonomia', emoji: '🦋', name: 'Autonomía', color: '#FFEAA7' },
    { key: 'propositoVida', emoji: '🎯', name: 'Propósito en la Vida', color: '#DDA0DD' }
  ];

  const getBPLevelClass = (level) => {
    if (!level || typeof level !== 'string') return 'bp-bajo';
    if (level.includes('Elevado')) return 'bp-elevado';
    if (level.includes('Alto')) return 'bp-alto';
    if (level.includes('Moderado')) return 'bp-moderado';
    return 'bp-bajo';
  };

  const getRyffRecommendationsByLevel = (nivelBP, dimensiones) => {
    const recommendations = [];
    
    // Validar que nivelBP sea un string
    if (!nivelBP || typeof nivelBP !== 'string') {
      nivelBP = 'BP Bajo'; // Valor por defecto
    }
    
    // Recomendaciones específicas por nivel BP
    if (nivelBP.includes('Elevado')) {
      recommendations.push({
        titulo: '🌟 Mantén tu Excelencia',
        descripcion: 'Tu bienestar psicológico es excepcional. Continúa desarrollando tus fortalezas y comparte tu sabiduría con otros. Considera ser mentor para quienes están en proceso de crecimiento.',
        icono: '🌟',
        categoria: 'mantenimiento',
        prioridad: 'baja'
      });
      
      recommendations.push({
        titulo: '🎯 Desafía tus Límites',
        descripcion: 'Explora nuevas áreas de crecimiento personal. Tu nivel actual te permite abordar proyectos más ambiciosos y metas transformadoras.',
        icono: '🎯',
        categoria: 'crecimiento',
        prioridad: 'media'
      });
    }
    
    if (nivelBP.includes('Alto')) {
      recommendations.push({
        titulo: '⭐ Consolida tus Fortalezas',
        descripcion: 'Tienes una base sólida de bienestar. Enfócate en mantener tus prácticas positivas y profundizar en las áreas que ya funcionan bien para ti.',
        icono: '⭐',
        categoria: 'consolidacion',
        prioridad: 'media'
      });
      
      recommendations.push({
        titulo: '🔄 Optimización Continua',
        descripcion: 'Identifica pequeñas áreas de mejora que puedan elevar tu bienestar de alto a elevado. La excelencia está en los detalles.',
        icono: '🔄',
        categoria: 'optimizacion',
        prioridad: 'media'
      });
    }
    
    if (nivelBP.includes('Moderado')) {
      recommendations.push({
        titulo: '📈 Construye Fundamentos Sólidos',
        descripcion: 'Estás en un buen punto para crecer. Establece rutinas diarias que fortalezcan tus áreas de oportunidad y mantengan tus fortalezas actuales.',
        icono: '📈',
        categoria: 'crecimiento',
        prioridad: 'alta'
      });
      
      recommendations.push({
        titulo: '🎯 Enfoque Estratégico',
        descripcion: 'Identifica 2-3 dimensiones clave para trabajar intensamente. El enfoque estratégico producirá resultados más rápidos que intentar mejorar todo a la vez.',
        icono: '🎯',
        categoria: 'estrategia',
        prioridad: 'alta'
      });
      
      recommendations.push({
        titulo: '🤝 Busca Apoyo',
        descripcion: 'Considera trabajar con un coach o terapeuta que te guíe en tu desarrollo. El apoyo profesional acelera el progreso.',
        icono: '🤝',
        categoria: 'apoyo',
        prioridad: 'media'
      });
    }
    
    if (nivelBP.includes('Bajo')) {
      recommendations.push({
        titulo: '🚨 Prioriza tu Bienestar',
        descripcion: 'Es crucial tomar acción ahora. Tu bienestar requiere atención inmediata. Considera buscar ayuda profesional y establecer un plan de acción estructurado.',
        icono: '🚨',
        categoria: 'prioritaria',
        prioridad: 'alta'
      });
      
      recommendations.push({
        titulo: '🏥 Apoyo Profesional',
        descripcion: 'Te recomiendo buscar ayuda psicológica profesional. Un terapeuta puede proporcionarte herramientas personalizadas para tu situación específica.',
        icono: '🏥',
        categoria: 'profesional',
        prioridad: 'alta'
      });
      
      recommendations.push({
        titulo: '📅 Establece Rutinas Básicas',
        descripcion: 'Comienza con hábitos simples: sueño regular, actividad física básica, y alimentación balanceada. Los fundamentos son esenciales para la recuperación.',
        icono: '📅',
        categoria: 'fundamentos',
        prioridad: 'alta'
      });
      
      recommendations.push({
        titulo: '👥 Red de Apoyo',
        descripcion: 'Conecta con personas de confianza. No enfrentes esto solo. Comparte tus sentimientos con amigos, familiares o grupos de apoyo.',
        icono: '👥',
        categoria: 'social',
        prioridad: 'alta'
      });
    }
    
    // Recomendaciones específicas por dimensión (si están bajas)
    if (dimensiones.autoaceptacion < 20) {
      recommendations.push({
        titulo: '🤗 Trabaja tu Autoaceptación',
        descripcion: 'Practica la autocompasión y celebra tus logros diarios. Eres valioso independientemente de tus imperfecciones.',
        icono: '🤗',
        categoria: 'dimension',
        prioridad: 'alta'
      });
    }
    
    if (dimensiones.relacionesPositivas < 20) {
      recommendations.push({
        titulo: '💑 Fortalece Conexiones',
        descripcion: 'Dedica tiempo a cultivar relaciones significativas. La calidad de tus conexiones impacta directamente tu bienestar.',
        icono: '💑',
        categoria: 'dimension',
        prioridad: 'alta'
      });
    }
    
    if (dimensiones.autonomia < 18) {
      recommendations.push({
        titulo: '🦋 Desarrolla tu Independencia',
        descripcion: 'Practica tomar decisiones pequeñas sin buscar aprobación externa. Tu autonomía es clave para tu bienestar.',
        icono: '🦋',
        categoria: 'dimension',
        prioridad: 'media'
      });
    }
    
    if (dimensiones.dominioEntorno < 22) {
      recommendations.push({
        titulo: '🏠 Organiza tu Espacio',
        descripcion: 'Crea un entorno que apoye tus objetivos. Un espacio ordenado influye positivamente en tu estado mental.',
        icono: '🏠',
        categoria: 'dimension',
        prioridad: 'media'
      });
    }
    
    if (dimensiones.propositoVida < 20) {
      recommendations.push({
        titulo: '🎯 Encuentra tu Propósito',
        descripcion: 'Reflexiona sobre qué es realmente importante para ti. Un sentido de propósito guía tus decisiones y acciones.',
        icono: '🎯',
        categoria: 'dimension',
        prioridad: 'alta'
      });
    }
    
    if (dimensiones.crecimientoPersonal < 24) {
      recommendations.push({
        titulo: '🌱 Fomenta tu Crecimiento',
        descripcion: 'Abraza el aprendizaje continuo. Cada nuevo conocimiento o habilidad fortalece tu confianza y bienestar.',
        icono: '🌱',
        categoria: 'dimension',
        prioridad: 'media'
      });
    }
    
    // Recomendaciones según dominancia afectiva
    if (dimensiones.dominanciaAfectos === 'negativos') {
      recommendations.push({
        titulo: '😊 Cultiva Positividad',
        descripcion: 'Practica la gratitud diaria y enfócate en lo bueno de tu vida. La perspectiva positiva transforma tu realidad.',
        icono: '😊',
        categoria: 'emocional',
        prioridad: 'alta'
      });
    }
    
    // Ordenar por prioridad
    return recommendations.sort((a, b) => {
      const priorityOrder = { alta: 0, media: 1, baja: 2 };
      return priorityOrder[a.prioridad] - priorityOrder[b.prioridad];
    });
  };

  const getRyffRecommendations = () => {
    try {
      const recommendations = [];
      const dimensions = ryffData.dimensiones;
      
      console.log('🔍 Debug - ryffData:', ryffData);
      console.log('🔍 Debug - dimensions:', dimensions);
      
      // Si no hay datos, devolver recomendación por defecto
      if (!dimensions || Object.keys(dimensions).length === 0) {
        return [{
          titulo: '🎯 Completa la Evaluación',
          descripcion: 'Por favor completa la escala RYFF para recibir recomendaciones personalizadas.',
          icono: '🎯',
          dimension: 'general',
          priority: 'high'
        }];
      }
      
      // Recomendaciones específicas por dimensión
      if (dimensions.autoaceptacion < 24) {
        recommendations.push({
          titulo: '🤗 Fortalece tu Autoaceptación',
          descripcion: 'Practica el autocuidado diario, celebra tus logros y aprende a aceptar tus imperfecciones como parte de tu crecimiento. Eres valioso tal como eres.',
          icono: '🤗',
          dimension: 'autoaceptacion',
          priority: 'high'
        });
      }

    if (dimensions.relacionesPositivas < 24) {
        recommendations.push({
          titulo: '💑 Cultiva Relaciones Significativas',
          descripcion: 'Dedica tiempo a conectar con personas que te aporten valor. Escucha activamente, muestra empatía y construye lazos basados en la confianza y el respeto mutuo.',
          icono: '💑',
          dimension: 'relacionesPositivas',
          priority: 'high'
        });
      }

    if (dimensions.autonomia < 22) {
        recommendations.push({
          titulo: '🦋 Desarrolla tu Autonomía',
          descripcion: 'Confía en tus decisiones y aprende a tomar la iniciativa. Establece tus propias metas y trabaja hacia ellas con determinación. Tu voz importa.',
          icono: '🦋',
          dimension: 'autonomia',
          priority: 'medium'
        });
      }

    if (dimensions.dominioEntorno < 26) {
      recommendations.push({
        titulo: '🏠 Optimiza tu Entorno',
        descripcion: 'Organiza tu espacio para que apoye tus objetivos. Establece rutinas que te ayuden a manejar las responsabilidades diarias de manera eficiente.',
        icono: '�',
        dimension: 'dominioEntorno',
        priority: 'medium'
      });
    }

    if (dimensions.propositoVida < 24) {
      recommendations.push({
        titulo: '🎯 Encuentra tu Propósito',
        descripcion: 'Reflexiona sobre lo que realmente te apasiona. Establece metas significativas y trabaja gradualmente hacia ellas. Cada paso cuenta en tu camino.',
        icono: '🎯',
        dimension: 'propositoVida',
        priority: 'high'
      });
    }

    if (dimensions.crecimientoPersonal < 28) {
      recommendations.push({
        titulo: '🌱 Fomenta tu Crecimiento',
        descripcion: 'Abraza nuevos desafíos como oportunidades de aprendizaje. Mantén una mentalidad abierta y celebra cada pequeño avance en tu desarrollo personal.',
        icono: '🌱',
        dimension: 'crecimientoPersonal',
        priority: 'medium'
      });
    }

    // Recomendaciones generales según nivel BP
    if (ryffData.nivelBP && (ryffData.nivelBP.includes('Bajo') || ryffData.nivelBP.includes('Moderado'))) {
      recommendations.push({
        titulo: '✨ Construye Hábitos Positivos',
        descripcion: 'Establece pequeñas rutinas diarias que mejoren tu bienestar. La consistencia en acciones positivas crea transformaciones duraderas.',
        icono: '✨',
        dimension: 'general',
        priority: 'high'
      });
    }

    if (ryffData.dominanciaAfectos === 'negativos') {
      recommendations.push({
        titulo: '🌟 Cultiva el Optimismo',
        descripcion: 'Practica la gratitud diaria, enfócate en soluciones en lugar de problemas y rodeate de personas que te inspiren. Tu perspectiva positiva transforma tu realidad.',
        icono: '🌟',
        dimension: 'emocional',
        priority: 'high'
      });
    }

    // Si todo está bien, recomendaciones de mantenimiento
    if (ryffData.nivelBP && (ryffData.nivelBP.includes('Alto') || ryffData.nivelBP.includes('Elevado'))) {
      recommendations.push({
        titulo: '🎉 Mantén tu Excelencia',
        descripcion: 'Continúa desarrollando tus fortalezas y comparte tu sabiduría con otros. Tu bienestar es un ejemplo inspirador para quienes te rodean.',
        icono: '🎉',
        dimension: 'mantenimiento',
        priority: 'low'
      });
    }

    // Ordenar por prioridad
    const finalRecommendations = recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    console.log('🔍 Debug - finalRecommendations:', finalRecommendations);
    return finalRecommendations;
    
    } catch (error) {
      console.error('❌ Error en getRyffRecommendations:', error);
      return [{
        titulo: '🎯 Recomendación General',
        descripcion: 'Continúa trabajando en tu bienestar personal.',
        icono: '🎯',
        dimension: 'general',
        priority: 'medium'
      }];
    }
  };

  const resetForm = () => {
    setAutoevaluacion({
      estado_emocional: '',
      nivel_estres: '',
      calidad_sueño: '',
      relacion_social: '',
      autoestima: '',
      motivacion: ''
    });
    setShowResults(false);
  };

  if (loading) {
    return <div className="loading">Cargando perfil de bienestar...</div>;
  }

  return (
    <div className="bienestar-container">
      <div className="bienestar-header">
        <h1>🧠 Mi Perfil de Bienestar</h1>
        <p>Hola, {userInfo?.name || 'Estudiante'}! Herramientas para tu autoconocimiento y crecimiento personal</p>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      {success && (
        <div className="success-message">
          <span>✅ {success}</span>
        </div>
      )}

      <div className="bienestar-tabs">
        <button 
          className={`tab-btn ${activeTab === 'autoevaluacion' ? 'active' : ''}`}
          onClick={() => handleTabChange('autoevaluacion')}
        >
          📊 Autoevaluación
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ryff' ? 'active' : ''}`}
          onClick={() => handleTabChange('ryff')}
        >
          🧠 Escala RYFF
        </button>
        <button 
          className={`tab-btn ${activeTab === 'historial-ryff' ? 'active' : ''}`}
          onClick={() => handleTabChange('historial-ryff')}
        >
          📈 Historial RYFF
        </button>
        <button 
          className={`tab-btn ${activeTab === 'recursos' ? 'active' : ''}`}
          onClick={() => handleTabChange('recursos')}
        >
          📚 Recursos de Apoyo
        </button>
        <button 
          className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
          onClick={() => handleTabChange('historial')}
        >
          📈 Mi Historial
        </button>
      </div>

      {activeTab === 'autoevaluacion' && (
        <div className="autoevaluacion-section">
          <div className="autoevaluacion-header">
            <h2>Autoevaluación de Bienestar Emocional</h2>
            <p>Responde honestamente para conocerte mejor y recibir recomendaciones personalizadas</p>
          </div>

          {!showResults ? (
            <form onSubmit={handleSubmitAutoevaluacion} className="autoevaluacion-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>¿Cómo te sientes hoy emocionalmente?</label>
                  <select
                    value={autoevaluacion.estado_emocional}
                    onChange={(e) => handleAutoevaluacionChange('estado_emocional', e.target.value)}
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Excelente">😊 Excelente</option>
                    <option value="Bueno">🙂 Bueno</option>
                    <option value="Regular">😐 Regular</option>
                    <option value="Mal">😔 Mal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>¿Cuál es tu nivel de estrés actual?</label>
                  <select
                    value={autoevaluacion.nivel_estres}
                    onChange={(e) => handleAutoevaluacionChange('nivel_estres', e.target.value)}
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Bajo">😌 Bajo</option>
                    <option value="Moderado">😐 Moderado</option>
                    <option value="Alto">😰 Alto</option>
                    <option value="Muy Alto">😟 Muy Alto</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>¿Cómo ha sido tu calidad de sueño esta semana?</label>
                  <select
                    value={autoevaluacion.calidad_sueño}
                    onChange={(e) => handleAutoevaluacionChange('calidad_sueño', e.target.value)}
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Excelente">😴 Excelente</option>
                    <option value="Buena">😊 Buena</option>
                    <option value="Regular">😐 Regular</option>
                    <option value="Mala">😞 Mala</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>¿Cómo calificas tus relaciones sociales?</label>
                  <select
                    value={autoevaluacion.relacion_social}
                    onChange={(e) => handleAutoevaluacionChange('relacion_social', e.target.value)}
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Excelente">👥 Excelente</option>
                    <option value="Buena">👍 Buena</option>
                    <option value="Regular">🤷 Regular</option>
                    <option value="Difícil">😞 Difícil</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>¿Cómo está tu autoestima últimamente?</label>
                  <select
                    value={autoevaluacion.autoestima}
                    onChange={(e) => handleAutoevaluacionChange('autoestima', e.target.value)}
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Alta">💪 Alta</option>
                    <option value="Buena">😊 Buena</option>
                    <option value="Regular">😐 Regular</option>
                    <option value="Baja">😞 Baja</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>¿Cuál es tu nivel de motivación actual?</label>
                  <select
                    value={autoevaluacion.motivacion}
                    onChange={(e) => handleAutoevaluacionChange('motivacion', e.target.value)}
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Muy Alta">🚀 Muy Alta</option>
                    <option value="Alta">⭐ Alta</option>
                    <option value="Regular">😐 Regular</option>
                    <option value="Baja">😔 Baja</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Ver Resultados y Recomendaciones
                </button>
              </div>
            </form>
          ) : (
            <div className="autoevaluacion-results">
              <div className="results-header">
                <h3>📊 Tus Resultados</h3>
                <button className="new-evaluation-btn" onClick={resetAutoevaluacionForm}>
                  Nueva Autoevaluación
                </button>
              </div>

              <div className="results-summary">
                <div className="result-item">
                  <span className="result-label">Estado Emocional:</span>
                  <span 
                    className="result-value"
                    style={{ color: getEmocionalColor(autoevaluacion.estado_emocional) }}
                  >
                    {autoevaluacion.estado_emocional}
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">Nivel de Estrés:</span>
                  <span 
                    className="result-value"
                    style={{ color: getEmocionalColor(autoevaluacion.nivel_estres === 'Bajo' ? 'Excelente' : autoevaluacion.nivel_estres === 'Moderado' ? 'Bueno' : 'Bajo') }}
                  >
                    {autoevaluacion.nivel_estres}
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">Calidad de Sueño:</span>
                  <span 
                    className="result-value"
                    style={{ color: getEmocionalColor(autoevaluacion.calidad_sueño) }}
                  >
                    {autoevaluacion.calidad_sueño}
                  </span>
                </div>
              </div>

              <div className="recomendaciones-section">
                <h4>🎯 Recomendaciones Personalizadas</h4>
                <div className="recomendaciones-list">
                  {getRecomendaciones().length > 0 ? (
                    getRecomendaciones().map((rec, index) => (
                      <div key={index} className={`recomendacion-item prioridad-${rec.prioridad}`}>
                        <div className="recomendacion-icon">{rec.icono}</div>
                        <div className="recomendacion-content">
                          <div className="recomendacion-header">
                            <h5>{rec.tipo}</h5>
                            <span className={`prioridad-badge ${rec.prioridad}`}>
                              {rec.prioridad === 'alta' && '🔴 Urgente'}
                              {rec.prioridad === 'media' && '🟡 Importante'}
                              {rec.prioridad === 'baja' && '🟢 Sugerencia'}
                            </span>
                          </div>
                          <p>{rec.descripcion}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-recomendaciones">
                      <p>🎉 ¡Tu bienestar está excelente! Sigue manteniendo tus buenas prácticas.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ryff' && (
        <div className="ryff-section">
          <div className="ryff-header">
            <h2>🧠✨ Escala de Bienestar Psicológico RYFF (1995)</h2>
            <p>Evalúa tu bienestar psicológico en 6 dimensiones con 39 preguntas</p>
            <div className="ryff-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(ryffData.respuestas.filter(r => r !== null).length / 39) * 100}%` }}
                ></div>
              </div>
              <span className="progress-text">
                {ryffData.respuestas.filter(r => r !== null).length}/39 preguntas respondidas
              </span>
            </div>
          </div>

          {!showRyffResults ? (
            <div className="ryff-form">
              <div className="ryff-instructions">
                <h3>📋📝 Instrucciones</h3>
                <p>Responde a cada afirmación utilizando la escala:</p>
                <div className="scale-visual">
                  {[1, 2, 3, 4, 5, 6].map(valor => (
                    <div key={valor} className="scale-item">
                      <span className="scale-number">{valor}</span>
                      <span className="scale-emoji">
                        {valor === 1 && '😟'}
                        {valor === 2 && '😐'}
                        {valor === 3 && '🙂'}
                        {valor === 4 && '😊'}
                        {valor === 5 && '😃'}
                        {valor === 6 && '😄'}
                      </span>
                      <span className="scale-text">
                        {valor === 1 && 'Totalmente en desacuerdo'}
                        {valor === 2 && 'En desacuerdo'}
                        {valor === 3 && 'Algunas veces de acuerdo'}
                        {valor === 4 && 'Frecuentemente de acuerdo'}
                        {valor === 5 && 'De acuerdo'}
                        {valor === 6 && 'Totalmente de acuerdo'}
                      </span>
                    </div>
                  ))}
                </div>
                <p>Por favor, responde a todas las preguntas de la manera más honesta posible.</p>
              </div>

              <div className="ryff-questions-organized">
                {getDimensionInfo().map((dimensionInfo) => {
                  const dimensionQuestions = getQuestionsByDimension()[dimensionInfo.key];
                  const answeredCount = dimensionQuestions.filter(q => ryffData.respuestas[q.index] !== null).length;
                  const totalCount = dimensionQuestions.length;
                  const progressPercentage = (answeredCount / totalCount) * 100;
                  
                  return (
                    <div key={dimensionInfo.key} className="dimension-card">
                      <div className="dimension-header" style={{ backgroundColor: dimensionInfo.bgColor, borderColor: dimensionInfo.color }}>
                        <div className="dimension-icon-large" style={{ color: dimensionInfo.color }}>
                          {dimensionInfo.emoji}
                        </div>
                        <div className="dimension-info">
                          <h3>{dimensionInfo.name}</h3>
                          <p>{dimensionInfo.description}</p>
                          <div className="dimension-progress">
                            <div className="progress-mini-bar">
                              <div 
                                className="progress-mini-fill" 
                                style={{ 
                                  width: `${progressPercentage}%`,
                                  backgroundColor: dimensionInfo.color 
                                }}
                              />
                            </div>
                            <span className="progress-text">
                              {answeredCount}/{totalCount} preguntas respondidas
                            </span>
                          </div>
                        </div>
                        <div className="dimension-status">
                          {progressPercentage === 100 && (
                            <span className="status-complete">✅ Completado</span>
                          )}
                          {progressPercentage > 0 && progressPercentage < 100 && (
                            <span className="status-partial">🔄 En progreso</span>
                          )}
                          {progressPercentage === 0 && (
                            <span className="status-pending">⏳ Pendiente</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="dimension-questions">
                        {dimensionQuestions.map((question) => (
                          <div key={question.id} className={`ryff-question-card ${ryffData.respuestas[question.index] !== null ? 'answered' : ''}`}>
                            <div className="question-number">
                              <span className="number">P{question.id}</span>
                              {ryffData.respuestas[question.index] !== null && (
                                <span className="answered-check">✓</span>
                              )}
                            </div>
                            <div className="question-content">
                              <div className="question-text">
                                {question.texto}
                              </div>
                              <div className="question-options">
                                {[1, 2, 3, 4, 5, 6].map(valor => (
                                  <label key={valor} className={`option-label ${ryffData.respuestas[question.index] === valor ? 'selected' : ''}`}>
                                    <input
                                      type="radio"
                                      name={`ryff-${question.index}`}
                                      value={valor}
                                      checked={ryffData.respuestas[question.index] === valor}
                                      onChange={(e) => handleRyffChange(question.index, parseInt(e.target.value))}
                                    />
                                    <span className="option-content">
                                      <span className="option-emoji">
                                        {valor === 1 && '😟'}
                                        {valor === 2 && '😐'}
                                        {valor === 3 && '🙂'}
                                        {valor === 4 && '😊'}
                                        {valor === 5 && '😃'}
                                        {valor === 6 && '😄'}
                                      </span>
                                      <span className="option-number">{valor}</span>
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="ryff-submit">
                <button 
                  className={`submit-btn ${ryffData.respuestas.filter(r => r !== null).length === 39 ? 'complete' : ''}`}
                  onClick={handleRyffSubmit}
                  disabled={ryffData.respuestas.includes(null)}
                >
                  {ryffData.respuestas.filter(r => r !== null).length === 39 
                    ? '🧠✨ Analizar Mi Bienestar' 
                    : `📝 Responde ${39 - ryffData.respuestas.filter(r => r !== null).length} más`
                  }
                </button>
                <button 
                  onClick={handleTestRyff}
                  style={{marginTop: '10px', padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%'}}
                >
                  🧪 Generar Respuestas de Prueba
                </button>
                {ryffData.respuestas.filter(r => r !== null).length > 0 && (
                  <div className="save-progress">
                    <span>💾 Guardar progreso</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="ryff-results">
              <div className="results-header">
                <h3>🎉📊 Resultados de tu Evaluación RYFF</h3>
                <button className="new-evaluation-btn" onClick={resetRyffForm}>
                  🔄 Nueva Evaluación
                </button>
              </div>

              <div className="ryff-summary">
                <div className="total-score">
                  <h4>🎯 Puntuación Total</h4>
                  <div className={`score-display ${getBPLevelClass(ryffData.nivelBP)}`}>
                    <span className="score-value">{ryffData.puntuacionTotal}</span>
                    <span className="score-max">/ 234 puntos</span>
                    <div className="score-emoji">
                      {ryffData.nivelBP && ryffData.nivelBP.includes('Elevado') && '🌟'}
                      {ryffData.nivelBP && ryffData.nivelBP.includes('Alto') && '⭐'}
                      {ryffData.nivelBP && ryffData.nivelBP.includes('Moderado') && '👍'}
                      {ryffData.nivelBP && ryffData.nivelBP.includes('Bajo') && '📈'}
                    </div>
                  </div>
                </div>

                <div className="bp-level">
                  <h4>🏆 Nivel de Bienestar Psicológico</h4>
                  <div className={`level-display ${getBPLevelClass(ryffData.nivelBP)}`}>
                    <span className="level-text">{ryffData.nivelBP}</span>
                    <div className="level-emoji">
                      {ryffData.nivelBP && ryffData.nivelBP.includes('Elevado') && '😄'}
                      {ryffData.nivelBP && ryffData.nivelBP.includes('Alto') && '😊'}
                      {ryffData.nivelBP && ryffData.nivelBP.includes('Moderado') && '🙂'}
                      {ryffData.nivelBP && ryffData.nivelBP.includes('Bajo') && '😐'}
                    </div>
                  </div>
                  <div className="level-ranges">
                    <div className="range-item">
                      <span className="range-label">🌟 BP Elevado:</span>
                      <span className="range-value">&gt; 176 pts.</span>
                    </div>
                    <div className="range-item">
                      <span className="range-label">⭐ BP Alto:</span>
                      <span className="range-value">141-175 pts.</span>
                    </div>
                    <div className="range-item">
                      <span className="range-label">👍 BP Moderado:</span>
                      <span className="range-value">117-140 pts.</span>
                    </div>
                    <div className="range-item">
                      <span className="range-label">📈 BP Bajo:</span>
                      <span className="range-value">&lt; 116 pts.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dimensions-analysis">
                <h4>📈📊 Análisis por Dimensiones</h4>
                <div className="dimensions-grid">
                  {Object.entries(ryffData.dimensiones).map(([dimension, puntuacion]) => {
                    const maxScore = getDimensionMax(dimension);
                    const percentage = (puntuacion / maxScore) * 100;
                    const level = getDimensionLevel(puntuacion, maxScore);
                    
                    return (
                      <div key={dimension} className="dimension-card">
                        <div className="dimension-header">
                          <h5>
                            <span className="dimension-emoji">
                              {dimension === 'autoaceptacion' && '🤗'}
                              {dimension === 'dominioEntorno' && '🏠'}
                              {dimension === 'relacionesPositivas' && '💑'}
                              {dimension === 'crecimientoPersonal' && '🌱'}
                              {dimension === 'autonomia' && '🦋'}
                              {dimension === 'propositoVida' && '🎯'}
                            </span>
                            {getDimensionName(dimension)}
                          </h5>
                        </div>
                        
                        <div className="dimension-visual">
                          <div className="circular-progress">
                            <svg className="progress-ring" viewBox="0 0 120 120">
                              <circle
                                className="progress-ring-bg"
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke="#f1f5f9"
                                strokeWidth="8"
                              />
                              <circle
                                className={`progress-ring-fill ${getDimensionLevelClass(puntuacion, maxScore)}`}
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 50}`}
                                strokeDashoffset={`${2 * Math.PI * 50 * (1 - percentage / 100)}`}
                                strokeWidth="8"
                                strokeLinecap="round"
                              />
                              <text
                                x="60"
                                y="60"
                                textAnchor="middle"
                                dy="0.3em"
                                className="progress-text"
                                fontSize="16"
                                fontWeight="600"
                                fill={percentage > 75 ? '#15803d' : percentage > 50 ? '#d97706' : '#dc2626'}
                              >
                                {Math.round(percentage)}%
                              </text>
                            </svg>
                          </div>
                        </div>
                          
                        <div className="dimension-stats">
                          <div className="score-display">
                            <span className="score-value">{puntuacion}</span>
                            <span className="score-max">/ {maxScore} pts.</span>
                          </div>
                          <div className={`dimension-level ${getDimensionLevelClass(puntuacion, maxScore)}`}>
                            <span className="level-emoji">
                              {level === 'Alto' && '🟢'}
                              {level === 'Medio' && '🟡'}
                              {level === 'Bajo' && '🔴'}
                            </span>
                            <span className="level-text">{level}</span>
                          </div>
                          <div className="percentage-display">
                            <span className="percentage-value">{percentage.toFixed(1)}%</span>
                            <div className="percentage-bar">
                              <div 
                                className={`percentage-fill ${getDimensionLevelClass(puntuacion, maxScore)}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="dominance-analysis">
                <h4>⚖️🎭 Dominancia Afectiva</h4>
                <div className={`dominance-display ${ryffData.dominanciaAfectos}`}>
                  <span className="dominance-emoji">
                    {ryffData.dominanciaAfectos === 'positivos' ? '😊' : '😔'}
                  </span>
                  <span className="dominance-text">
                    {ryffData.dominanciaAfectos === 'positivos' ? 'Afectos Positivos 😊' : 'Afectos Negativos 😔'}
                  </span>
                </div>
                <p className="dominance-description">
                  {ryffData.dominanciaAfectos === 'positivos' 
                    ? '✅ Tu bienestar se caracteriza por una predominancia de afectos positivos sobre los negativos, indicando un estado emocional saludable y optimista.'
                    : '⚠️ Tu bienestar se caracteriza por una predominancia de afectos negativos sobre los positivos, lo que podría indicar áreas de oportunidad para el crecimiento personal.'
                  }
                </p>
              </div>

              <div className="ryff-recommendations">
                <h4>💡🎯 Recomendaciones Personalizadas</h4>
                <div className="recommendations-list">
                  {getRyffRecommendations().map((rec, index) => (
                    <div key={index} className={`recommendation-item prioridad-${rec.priority || 'medium'}`}>
                      <div className="rec-icon">{rec.icono}</div>
                      <div className="rec-content">
                        <div className="rec-header">
                          <h6>{rec.titulo}</h6>
                          <span className={`prioridad-badge ${rec.priority || 'medium'}`}>
                            {rec.priority === 'high' && '🔴 Alta Prioridad'}
                            {rec.priority === 'medium' && '🟡 Media Prioridad'}
                            {rec.priority === 'low' && '🟢 Sugerencia'}
                          </span>
                        </div>
                        <p>{rec.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'historial-ryff' && (
        <div className="historial-ryff-section" key={`historial-${forceUpdate}`}>
          <div className="historial-header">
            <div className="historial-title">
              <h2>📈 Historial de Evaluaciones RYFF</h2>
              <p>Tus resultados y recomendaciones a lo largo del tiempo</p>
            </div>
            <button 
              className="refresh-btn"
              onClick={() => {
                console.log('🔄 Refrescando historial manualmente...');
                fetchHistorialRyff();
                setTimeout(() => {
                  const historialLocal = JSON.parse(localStorage.getItem('historialRyff') || '[]');
                  if (historialLocal.length > 0) {
                    setHistorialRyff(historialLocal);
                    setSuccess('🔄 Historial actualizado');
                  }
                }, 500);
              }}
              title="Refrescar historial"
            >
              🔄 Actualizar
            </button>
          </div>

          {/* Barra de acciones - SIEMPRE VISIBLE */}
          <div className="historial-actions-bar">
            <h3>🚀 Acciones Rápidas</h3>
            <div className="action-buttons">
              <button 
                className="action-btn primary"
                onClick={() => setActiveTab('ryff')}
              >
                🧠 Comenzar Nueva Evaluación
              </button>
              
                          </div>
          </div>

          {/* Contenido del historial */}
          
          {historialRyff.length === 0 ? (
            <div className="no-historial">
              <div className="no-historial-icon">📊</div>
              <h3>¡Aún no tienes evaluaciones RYFF!</h3>
              <p>Descubre tu nivel de bienestar psicológico y recibe recomendaciones personalizadas basadas en tus resultados.</p>
              
              <div className="no-historial-actions">
                <button 
                  className="start-ryff-btn primary"
                  onClick={() => setActiveTab('ryff')}
                >
                  🧠 Comenzar Evaluación RYFF Completa
                </button>
                
                <button 
                  className="start-ryff-btn secondary"
                  onClick={() => {
                    console.log('🚀 Iniciando prueba rápida RYFF...');
                    
                    // Generar automáticamente respuestas de prueba
                    const respuestasPrueba = Array.from({length: 39}, () => Math.floor(Math.random() * 6) + 1);
                    console.log('🎲 Respuestas generadas:', respuestasPrueba);
                    
                    setRyffData({
                      respuestas: respuestasPrueba,
                      puntuacionTotal: 0,
                      nivelBP: '',
                      dimensiones: {
                        autoaceptacion: 0,
                        dominioEntorno: 0,
                        relacionesPositivas: 0,
                        crecimientoPersonal: 0,
                        autonomia: 0,
                        propositoVida: 0
                      },
                      dominanciaAfectos: 'positivos'
                    });
                    
                    // Guardar progreso de prueba inmediatamente
                    const progressData = {
                      evaluacion_id: ryffProgress?.evaluacion_id,
                      respuestas: respuestasPrueba,
                      pregunta_actual: 38, // Última pregunta
                      timestamp_progreso: new Date().toISOString()
                    };
                    
                    console.log('💾 Guardando progreso de prueba:', progressData);
                    
                    // Guardar localmente inmediatamente
                    saveProgressToLocal(progressData);
                    
                    // Sincronizar con backend
                    syncProgressWithBackend(progressData);
                    
                    // Cambiar a la pestaña RYFF
                    setActiveTab('ryff');
                    
                    // Mostrar mensaje de éxito
                    setSuccess('🧪 ¡Respuestas de prueba generadas! Haz clic en "🧠✨ Analizar Mi Bienestar" para ver resultados');
                    
                    console.log('✅ Prueba rápida RYFF iniciada correctamente');
                  }}
                >
                  ⚡ Generar Evaluación de Prueba
                </button>
                
                <button 
                  className="start-ryff-btn tertiary"
                  onClick={async () => {
                    console.log('🎯 Creando evaluación RYFF completa de prueba...');
                    
                    try {
                      // Generar respuestas de prueba
                      const respuestasPrueba = Array.from({length: 39}, () => Math.floor(Math.random() * 6) + 1);
                      
                      // Calcular resultados usando las respuestas de prueba
                      const calculateRyffResultsWithRespuestas = (respuestas) => {
                        const dimensiones = {
                          autoaceptacion: [1, 7, 13, 19, 25, 31],
                          dominioEntorno: [5, 11, 16, 22, 28, 39],
                          relacionesPositivas: [2, 8, 14, 20, 26, 32],
                          crecimientoPersonal: [24, 30, 34, 35, 36, 37, 38],
                          autonomia: [3, 4, 9, 10, 15, 21, 27, 33],
                          propositoVida: [6, 12, 17, 18, 23, 29]
                        };

                        const puntuaciones = {};
                        let totalPositivos = 0;
                        let totalNegativos = 0;

                        Object.entries(dimensiones).forEach(([dimension, preguntas]) => {
                          puntuaciones[dimension] = preguntas.reduce((sum, preguntaIndex) => {
                            const respuesta = respuestas[preguntaIndex - 1];
                            return sum + (respuesta || 0);
                          }, 0);

                          if (dimension === 'relacionesPositivas') {
                            totalPositivos += puntuaciones[dimension];
                          } else if (dimension === 'dominioEntorno') {
                            totalNegativos += puntuaciones[dimension];
                          }
                        });

                        const puntuacionTotal = Object.values(puntuaciones).reduce((sum, score) => sum + score, 0);
                        
                        let nivelBP = '';
                        if (puntuacionTotal > 176) nivelBP = 'BP Elevado';
                        else if (puntuacionTotal >= 141 && puntuacionTotal <= 175) nivelBP = 'BP Alto';
                        else if (puntuacionTotal >= 117 && puntuacionTotal <= 140) nivelBP = 'BP Moderado';
                        else if (puntuacionTotal < 116) nivelBP = 'BP Bajo';

                        const dominanciaAfectos = totalPositivos > totalNegativos ? 'positivos' : 'negativos';

                        return {
                          puntuacionTotal,
                          nivelBP,
                          dimensiones: puntuaciones,
                          dominanciaAfectos
                        };
                      };
                      
                      const results = calculateRyffResultsWithRespuestas(respuestasPrueba);
                      
                      // Crear evaluación completa
                      const nuevaEvaluacion = {
                        id: Date.now().toString(),
                        fecha: new Date().toISOString(),
                        respuestas: respuestasPrueba,
                        puntuacionTotal: results.puntuacionTotal,
                        nivelBP: results.nivelBP,
                        dimensiones: results.dimensiones,
                        dominanciaAfectos: results.dominanciaAfectos,
                        recomendaciones: [],
                        estado: 'completada',
                        progreso: {
                          respondidas: 39,
                          total: 39,
                          porcentaje: 100
                        }
                      };
                      
                      // Generar recomendaciones
                      try {
                        nuevaEvaluacion.recomendaciones = getRyffRecommendationsByLevel(results.nivelBP, results.dimensiones);
                      } catch (error) {
                        console.error('❌ Error generando recomendaciones:', error);
                        nuevaEvaluacion.recomendaciones = [{
                          titulo: '🎯 Recomendación General',
                          descripcion: 'Continúa trabajando en tu bienestar personal.',
                          icono: '🎯',
                          categoria: 'general',
                          prioridad: 'media'
                        }];
                      }
                      
                      // Agregar al historial local
                      const nuevoHistorial = [nuevaEvaluacion, ...historialRyff];
                      setHistorialRyff(nuevoHistorial);
                      localStorage.setItem('historialRyff', JSON.stringify(nuevoHistorial));
                      
                      // Intentar guardar en backend
                      const evaluationData = {
                        respuestas: respuestasPrueba,
                        puntuacion_total: results.puntuacionTotal,
                        nivel_bp: results.nivelBP,
                        dimensiones: results.dimensiones,
                        dominancia_afectos: results.dominanciaAfectos,
                        fecha: new Date().toISOString()
                      };

                      const token = AuthService.getToken();
                      if (token) {
                        const response = await fetch('http://localhost:5000/api/estudiante/evaluaciones/ryff', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify(evaluationData)
                        });

                        if (response.ok) {
                          const responseData = await response.json();
                          console.log('✅ Evaluación guardada en backend:', responseData);
                        }
                      }
                      
                      setSuccess('🎉 ¡Evaluación RYFF completada y agregada a tu historial!');
                      console.log('✅ Evaluación RYFF de prueba creada y guardada');
                      
                    } catch (error) {
                      console.error('❌ Error creando evaluación de prueba:', error);
                      setError('Error al crear evaluación de prueba');
                    }
                  }}
                >
                  🎯 Crear y Agregar al Historial
                </button>
              </div>
              
              <div className="no-historial-benefits">
                <h4>🌟 ¿Qué mide la evaluación RYFF?</h4>
                <ul>
                  <li>🤗 <strong>Autoaceptación:</strong> Cómo te sientes contigo mismo</li>
                  <li>👥 <strong>Relaciones Positivas:</strong> Calidad de tus vínculos sociales</li>
                  <li>🦋 <strong>Autonomía:</strong> Capacidad de tomar tus propias decisiones</li>
                  <li>🏠 <strong>Dominio del Entorno:</strong> Manejo de tus responsabilidades</li>
                  <li>🎯 <strong>Propósito de Vida:</strong> Dirección y metas claras</li>
                  <li>🌱 <strong>Crecimiento Personal:</strong> Desarrollo continuo como persona</li>
                </ul>
              </div>
              
              {/* Botón de depuración */}
              <button 
                className="debug-btn"
                onClick={debugHistorial}
                style={{ marginTop: '15px', background: '#dc3545', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
              >
                🔍 DEBUG Historial
              </button>
              
              {/* Botón para crear datos de prueba automáticamente */}
              <button 
                className="debug-btn"
                onClick={() => {
                  console.log('🚀 Creando datos de prueba automáticamente...');
                  
                  // Crear evaluación de prueba directamente
                  const respuestasPrueba = Array.from({length: 39}, () => Math.floor(Math.random() * 6) + 1);
                  
                  const calculateRyffResultsWithRespuestas = (respuestas) => {
                    const dimensiones = {
                      autoaceptacion: [1, 7, 13, 19, 25, 31],
                      dominioEntorno: [5, 11, 16, 22, 28, 39],
                      relacionesPositivas: [2, 8, 14, 20, 26, 32],
                      crecimientoPersonal: [24, 30, 34, 35, 36, 37, 38],
                      autonomia: [3, 4, 9, 10, 15, 21, 27, 33],
                      propositoVida: [6, 12, 17, 18, 23, 29]
                    };

                    const puntuaciones = {};
                    let totalPositivos = 0;
                    let totalNegativos = 0;

                    Object.entries(dimensiones).forEach(([dimension, preguntas]) => {
                      puntuaciones[dimension] = preguntas.reduce((sum, preguntaIndex) => {
                        const respuesta = respuestas[preguntaIndex - 1];
                        return sum + (respuesta || 0);
                      }, 0);

                      if (dimension === 'relacionesPositivas') {
                        totalPositivos += puntuaciones[dimension];
                      } else if (dimension === 'dominioEntorno') {
                        totalNegativos += puntuaciones[dimension];
                      }
                    });

                    const puntuacionTotal = Object.values(puntuaciones).reduce((sum, score) => sum + score, 0);
                    
                    let nivelBP = '';
                    if (puntuacionTotal > 176) nivelBP = 'BP Elevado';
                    else if (puntuacionTotal >= 141 && puntuacionTotal <= 175) nivelBP = 'BP Alto';
                    else if (puntuacionTotal >= 117 && puntuacionTotal <= 140) nivelBP = 'BP Moderado';
                    else if (puntuacionTotal < 116) nivelBP = 'BP Bajo';

                    const dominanciaAfectos = totalPositivos > totalNegativos ? 'positivos' : 'negativos';

                    return {
                      puntuacionTotal,
                      nivelBP,
                      dimensiones: puntuaciones,
                      dominanciaAfectos
                    };
                  };
                  
                  const results = calculateRyffResultsWithRespuestas(respuestasPrueba);
                  
                  const nuevaEvaluacion = {
                    id: Date.now().toString(),
                    fecha: new Date().toISOString(),
                    respuestas: respuestasPrueba,
                    puntuacionTotal: results.puntuacionTotal,
                    nivelBP: results.nivelBP,
                    dimensiones: results.dimensiones,
                    dominanciaAfectos: results.dominanciaAfectos,
                    recomendaciones: [{
                      titulo: '🎯 Recomendación de Prueba',
                      descripcion: 'Esta es una evaluación de prueba para verificar el funcionamiento.',
                      icono: '🎯',
                      categoria: 'general',
                      prioridad: 'media'
                    }],
                    estado: 'completada',
                    progreso: {
                      respondidas: 39,
                      total: 39,
                      porcentaje: 100
                    }
                  };
                  
                  // Agregar al estado y localStorage
                  const nuevoHistorial = [nuevaEvaluacion, ...historialRyff];
                  setHistorialRyff(nuevoHistorial);
                  localStorage.setItem('historialRyff', JSON.stringify(nuevoHistorial));
                  
                  console.log('✅ Datos de prueba creados:', nuevaEvaluacion);
                  console.log('📊 Nuevo historial:', nuevoHistorial);
                  setSuccess('🎉 ¡Datos de prueba creados! Revisa el historial');
                }}
                style={{ marginTop: '10px', background: '#28a745', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
              >
                🎯 Crear Datos de Prueba
              </button>
            </div>
          ) : (
            <div>
              {/* Barra de acciones cuando hay historial */}
              <div className="historial-with-data">
                <div className="historial-stats">
                  <h3>📊 {historialRyff.length} Evaluación{historialRyff.length !== 1 ? 'es' : ''} Registrada{historialRyff.length !== 1 ? 's' : ''}</h3>
                </div>
                <div className="historial-actions">
                  <button 
                    className="action-btn primary"
                    onClick={() => setActiveTab('ryff')}
                  >
                    🧠 Hacer Nueva Evaluación
                  </button>
                  
                  <button 
                    className="action-btn secondary"
                    onClick={() => {
                      console.log('🚀 Iniciando prueba rápida RYFF...');
                      
                      // Generar automáticamente respuestas de prueba
                      const respuestasPrueba = Array.from({length: 39}, () => Math.floor(Math.random() * 6) + 1);
                      console.log('🎲 Respuestas generadas:', respuestasPrueba);
                      
                      setRyffData({
                        respuestas: respuestasPrueba,
                        puntuacionTotal: 0,
                        nivelBP: '',
                        dimensiones: {
                          autoaceptacion: 0,
                          dominioEntorno: 0,
                          relacionesPositivas: 0,
                          crecimientoPersonal: 0,
                          autonomia: 0,
                          propositoVida: 0
                        },
                        dominanciaAfectos: 'positivos'
                      });
                      
                      // Guardar progreso de prueba inmediatamente
                      const progressData = {
                        evaluacion_id: ryffProgress?.evaluacion_id,
                        respuestas: respuestasPrueba,
                        pregunta_actual: 38, // Última pregunta
                        timestamp_progreso: new Date().toISOString()
                      };
                      
                      console.log('💾 Guardando progreso de prueba:', progressData);
                      
                      // Guardar localmente inmediatamente
                      saveProgressToLocal(progressData);
                      
                      // Sincronizar con backend
                      syncProgressWithBackend(progressData);
                      
                      // Cambiar a la pestaña RYFF
                      setActiveTab('ryff');
                      
                      // Mostrar mensaje de éxito
                      setSuccess('🧪 ¡Respuestas de prueba generadas! Haz clic en "🧠✨ Analizar Mi Bienestar" para ver resultados');
                      
                      console.log('✅ Prueba rápida RYFF iniciada correctamente');
                    }}
                  >
                    ⚡ Probar con Datos Aleatorios
                  </button>
                  
                  <button 
                    className="action-btn tertiary"
                    onClick={async () => {
                      console.log('🎯 Creando evaluación RYFF completa de prueba...');
                      
                      try {
                        // Generar respuestas de prueba
                        const respuestasPrueba = Array.from({length: 39}, () => Math.floor(Math.random() * 6) + 1);
                        
                        // Calcular resultados usando las respuestas de prueba
                        const calculateRyffResultsWithRespuestas = (respuestas) => {
                          const dimensiones = {
                            autoaceptacion: [1, 7, 13, 19, 25, 31],
                            dominioEntorno: [5, 11, 16, 22, 28, 39],
                            relacionesPositivas: [2, 8, 14, 20, 26, 32],
                            crecimientoPersonal: [24, 30, 34, 35, 36, 37, 38],
                            autonomia: [3, 4, 9, 10, 15, 21, 27, 33],
                            propositoVida: [6, 12, 17, 18, 23, 29]
                          };

                          const puntuaciones = {};
                          let totalPositivos = 0;
                          let totalNegativos = 0;

                          Object.entries(dimensiones).forEach(([dimension, preguntas]) => {
                            puntuaciones[dimension] = preguntas.reduce((sum, preguntaIndex) => {
                              const respuesta = respuestas[preguntaIndex - 1];
                              return sum + (respuesta || 0);
                            }, 0);

                            if (dimension === 'relacionesPositivas') {
                              totalPositivos += puntuaciones[dimension];
                            } else if (dimension === 'dominioEntorno') {
                              totalNegativos += puntuaciones[dimension];
                            }
                          });

                          const puntuacionTotal = Object.values(puntuaciones).reduce((sum, score) => sum + score, 0);
                          
                          let nivelBP = '';
                          if (puntuacionTotal > 176) nivelBP = 'BP Elevado';
                          else if (puntuacionTotal >= 141 && puntuacionTotal <= 175) nivelBP = 'BP Alto';
                          else if (puntuacionTotal >= 117 && puntuacionTotal <= 140) nivelBP = 'BP Moderado';
                          else if (puntuacionTotal < 116) nivelBP = 'BP Bajo';

                          const dominanciaAfectos = totalPositivos > totalNegativos ? 'positivos' : 'negativos';

                          return {
                            puntuacionTotal,
                            nivelBP,
                            dimensiones: puntuaciones,
                            dominanciaAfectos
                          };
                        };
                        
                        const results = calculateRyffResultsWithRespuestas(respuestasPrueba);
                        
                        // Crear evaluación completa
                        const nuevaEvaluacion = {
                          id: Date.now().toString(),
                          fecha: new Date().toISOString(),
                          respuestas: respuestasPrueba,
                          puntuacionTotal: results.puntuacionTotal,
                          nivelBP: results.nivelBP,
                          dimensiones: results.dimensiones,
                          dominanciaAfectos: results.dominanciaAfectos,
                          recomendaciones: [],
                          estado: 'completada',
                          progreso: {
                            respondidas: 39,
                            total: 39,
                            porcentaje: 100
                          }
                        };
                        
                        // Generar recomendaciones
                        try {
                          nuevaEvaluacion.recomendaciones = getRyffRecommendationsByLevel(results.nivelBP, results.dimensiones);
                        } catch (error) {
                          console.error('❌ Error generando recomendaciones:', error);
                          nuevaEvaluacion.recomendaciones = [{
                            titulo: '🎯 Recomendación General',
                            descripcion: 'Continúa trabajando en tu bienestar personal.',
                            icono: '🎯',
                            categoria: 'general',
                            prioridad: 'media'
                          }];
                        }
                        
                        // Agregar al historial local
                        const nuevoHistorial = [nuevaEvaluacion, ...historialRyff];
                        setHistorialRyff(nuevoHistorial);
                        localStorage.setItem('historialRyff', JSON.stringify(nuevoHistorial));
                        
                        // Intentar guardar en backend
                        const evaluationData = {
                          respuestas: respuestasPrueba,
                          puntuacion_total: results.puntuacionTotal,
                          nivel_bp: results.nivelBP,
                          dimensiones: results.dimensiones,
                          dominancia_afectos: results.dominanciaAfectos,
                          fecha: new Date().toISOString()
                        };

                        const token = AuthService.getToken();
                        if (token) {
                          const response = await fetch('http://localhost:5000/api/estudiante/evaluaciones/ryff', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(evaluationData)
                          });

                          if (response.ok) {
                            const responseData = await response.json();
                            console.log('✅ Evaluación guardada en backend:', responseData);
                          }
                        }
                        
                        setSuccess('🎉 ¡Evaluación RYFF completada y guardada! Revisa tu historial');
                        console.log('✅ Evaluación RYFF de prueba creada y guardada');
                        
                      } catch (error) {
                        console.error('❌ Error creando evaluación de prueba:', error);
                        setError('Error al crear evaluación de prueba');
                      }
                    }}
                  >
                    🎯 Agregar Evaluación de Prueba
                  </button>
                </div>
              </div>

              {/* Lista de historial */}
              <div className="historial-list">
              {historialRyff.map((evaluacion, index) => (
                <div key={evaluacion.id} className="historial-item">
                  <div className="evaluacion-header">
                    <div className="evaluacion-info">
                      <h4>Evaluación #{historialRyff.length - index}</h4>
                      <div className="evaluacion-date">
                        📅 {new Date(evaluacion.fecha).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className={`evaluacion-level ${getBPLevelClass(evaluacion.nivelBP)}`}>
                      <span className="level-emoji">
                        {evaluacion.nivelBP && evaluacion.nivelBP.includes('Elevado') && '🌟'}
                        {evaluacion.nivelBP && evaluacion.nivelBP.includes('Alto') && '⭐'}
                        {evaluacion.nivelBP && evaluacion.nivelBP.includes('Moderado') && '👍'}
                        {evaluacion.nivelBP && evaluacion.nivelBP.includes('Bajo') && '📈'}
                      </span>
                      <span className="level-text">{evaluacion.nivelBP}</span>
                    </div>
                  </div>

                  <div className="evaluacion-summary">
                    <div className="score-display">
                      <span className="score-label">Puntuación Total:</span>
                      <span className="score-value">{evaluacion.puntuacionTotal}/234</span>
                    </div>
                    <div className="dominancia-display">
                      <span className="dominancia-label">Dominancia:</span>
                      <span className={`dominancia-value ${evaluacion.dominanciaAfectos}`}>
                        {evaluacion.dominanciaAfectos === 'positivos' ? '😊 Positivos' : '😔 Negativos'}
                      </span>
                    </div>
                  </div>

                  {/* Sección de Progreso */}
                  {evaluacion.progreso && (
                    <div className="progreso-summary">
                      <h5>📈 Progreso de la Evaluación:</h5>
                      <div className="progreso-stats">
                        <div className="progreso-item">
                          <span className="progreso-label">Estado:</span>
                          <span className={`progreso-value ${evaluacion.estado}`}>
                            {evaluacion.estado === 'completada' ? '✅ Completada' : 
                             evaluacion.estado === 'en_progreso' ? '⏳ En Progreso' : '💾 Guardada'}
                          </span>
                        </div>
                        <div className="progreso-item">
                          <span className="progreso-label">Respondidas:</span>
                          <span className="progreso-value">
                            {evaluacion.progreso.respondidas || 39}/{evaluacion.progreso.total || 39} preguntas
                          </span>
                        </div>
                        <div className="progreso-item">
                          <span className="progreso-label">Completado:</span>
                          <div className="progreso-bar-container">
                            <div className="progreso-bar">
                              <div 
                                className="progreso-fill"
                                style={{ width: `${evaluacion.progreso.porcentaje || 100}%` }}
                              />
                            </div>
                            <span className="progreso-percentage">
                              {evaluacion.progreso.porcentaje || 100}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="dimensiones-summary">
                    <h5>📊 Resultados por Dimensión:</h5>
                    <div className="dimensiones-grid-historial">
                      {Object.entries(evaluacion.dimensiones).map(([dimension, puntuacion]) => {
                        const dimensionInfo = getDimensionInfo().find(d => d.key === dimension);
                        const maxScore = getDimensionMax(dimension);
                        const percentage = (puntuacion / maxScore) * 100;
                        
                        return (
                          <div key={dimension} className="dimension-item-historial">
                            <div className="dimension-icon" style={{ color: dimensionInfo?.color }}>
                              {dimensionInfo?.emoji}
                            </div>
                            <div className="dimension-info">
                              <span className="dimension-name">{getDimensionName(dimension)}</span>
                              <span className="dimension-score">{puntuacion}/{maxScore}</span>
                              <div className="dimension-bar">
                                <div 
                                  className={`dimension-fill ${getDimensionLevelClass(puntuacion, maxScore)}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="recomendaciones-summary">
                    <h5>💡 Recomendaciones Principales:</h5>
                    <div className="recomendaciones-list-historial">
                      {evaluacion.recomendaciones.slice(0, 3).map((rec, index) => (
                        <div key={index} className="recomendacion-item-historial">
                          <span className="rec-icon">{rec.icono}</span>
                          <div className="rec-content">
                            <span className="rec-title">{rec.titulo}</span>
                            <span className="rec-description">{rec.descripcion}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      )}

      {activeTab === 'recursos' && (
        <div className="recursos-section">
          <div className="recursos-header">
            <h2>📚 Recursos de Apoyo Personalizados</h2>
            <p>Material seleccionado para ayudarte en tu bienestar emocional</p>
          </div>

          <div className="recursos-grid">
            {recursosRecomendados.map((recurso) => (
              <div 
                key={recurso._id} 
                className="recurso-card"
                onClick={() => handleRecursoClick(recurso)}
              >
                <div className="recurso-header">
                  <div className="recurso-icon">
                    {getRecursoIcon(recurso.tipo)}
                  </div>
                  <div className="recurso-info">
                    <h3>{recurso.titulo}</h3>
                    <p className="recurso-tipo">{recurso.tipo}</p>
                  </div>
                </div>
                <div className="recurso-descripcion">
                  <p>{recurso.descripcion}</p>
                </div>
                <div className="recurso-meta">
                  <span className="recurso-creador">
                    Por {recurso.creado_por?.name}
                  </span>
                  <span className="recurso-vistas">
                    👁️ {recurso.vista} vistas
                  </span>
                </div>
              </div>
            ))}
          </div>

          {recursosRecomendados.length === 0 && (
            <div className="no-recursos">
              <p>Completa una autoevaluación para recibir recursos personalizados</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'historial' && (
        <div className="historial-section">
          <div className="historial-header">
            <h2>📈 Mi Historial de Autoevaluaciones</h2>
            <p>Visualiza tu progreso y evolución emocional</p>
          </div>

          {historialAutoevaluaciones.length > 0 ? (
            <div className="historial-timeline">
              {historialAutoevaluaciones.map((evaluacion, index) => (
                <div key={evaluacion._id || index} className="timeline-item">
                  <div className="timeline-date">
                    {new Date(evaluacion.fecha).toLocaleDateString('es', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-emotional">
                      <span className="emotional-label">Estado:</span>
                      <span 
                        className="emotional-value"
                        style={{ color: getEmocionalColor(evaluacion.estado_emocional) }}
                      >
                        {evaluacion.estado_emocional}
                      </span>
                    </div>
                    <div className="timeline-stress">
                      <span className="stress-label">Estrés:</span>
                      <span 
                        className="stress-value"
                        style={{ color: getEmocionalColor(evaluacion.nivel_estres === 'Bajo' ? 'Excelente' : evaluacion.nivel_estres === 'Moderado' ? 'Bueno' : 'Bajo') }}
                      >
                        {evaluacion.nivel_estres}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-historial">
              <p>Aún no tienes autoevaluaciones registradas</p>
              <button 
                className="start-evaluation-btn"
                onClick={() => setActiveTab('autoevaluacion')}
              >
                Comenzar Autoevaluación
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EstudianteBienestar;
