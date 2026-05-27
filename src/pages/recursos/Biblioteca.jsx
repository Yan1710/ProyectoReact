import React from 'react';
import './Biblioteca.css';

const Biblioteca = () => {
  const libros = [
    {
      id: 1,
      titulo: "Ansiedad: Cómo enfrentar las preocupaciones y los miedos que paralizan",
      autor: "Dr. David Burns",
      descripcion: "Una guía práctica para superar la ansiedad utilizando técnicas cognitivo-conductuales.",
      imagen: "/src/assets/recursos/ansiedad.jpg",
      categoria: "Ansiedad",
      link: "https://www.oshungroup.com.ar/wp-content/uploads/2020/10/ADIOS-ANSIEDAD-DAVID-BURNS.pdf",
      calificacion: 4.5,
      paginas: 12
    },
    {
      id: 2,
      titulo: "El poder del ahora: Una guía para la realización espiritual",
      autor: "Eckhart Tolle",
      descripcion: "Aprende a vivir en el presente y liberarte del sufrimiento mental y emocional.",
      imagen: "/src/assets/recursos/poder.jpg",
      categoria: "Mindfulness",
      link: "https://www.espiritualidadpamplona-irunea.org/wp-content/uploads/2017/11/Tolle-Eckhart-El-Poder-del-Ahora.pdf",
      calificacion: 4.8,
      paginas: 79
    },
    {
      id: 3,
      titulo: "Vencer la depresión Descubre el poder de las técnicas del mindfulness",
      autor: "Dra. Mark Williams, John Teasdale, Zindel Segal, Jon Kabat-Zinn",
      descripcion: "Estrategias basadas en la terapia cognitivo-conductual para combatir la depresión.",
      imagen: "/src/assets/recursos/vencer.jpg",
      categoria: "Depresión",
      link: "https://www.rehueong.com.ar/sites/default/files/2023-10/Vencer%20la%20depresion%20tecnicas%20mindfulness.pdf",
      calificacion: 4.6,
      paginas: 204
    },
    {
      id: 4,
      titulo: "El arte de no amargarse la vida: Claves para la resiliencia emocional",
      autor: "Rafael Santandreu",
      descripcion: "Aprende a desarrollar una mentalidad resiliente y optimista ante los desafíos.",
      imagen: "/src/assets/recursos/arte.jpg",
      categoria: "Resiliencia",
      link: "https://solopsique.com/wp-content/uploads/2022/07/el-arte-de-no-amargarse-la-vida-rafael-santandreu.pdf",
      calificacion: 4.4,
      paginas: 139
    },
    {
      id: 5,
      titulo: "Mindfulness: Guía práctica para encontrar la paz interior",
      autor: "Jon Kabat-Zinn",
      descripcion: "Introducción completa a la práctica del mindfulness y sus beneficios para la salud mental.",
      imagen: "/src/assets/recursos/mindfulness.webp",
      categoria: "Mindfulness",
      link: "https://budismolibre.org/docs/libros_budistas/Mark_Williams_Danny_Penman_Mindfulness.pdf",
      calificacion: 4.7,
      paginas: 256
    },
    {
      id: 6,
      titulo: "Inteligencia emocional: La clave para el éxito personal y profesional",
      autor: "Daniel Goleman",
      descripcion: "Descubre cómo gestionar tus emociones para mejorar todas las áreas de tu vida.",
      imagen: "/src/assets/recursos/inteligencia.webp",
      categoria: "Inteligencia Emocional",
      link: "https://iuymca.edu.ar/wp-content/uploads/2022/01/La-Inteligencia-Emocional-Daniel-Goleman-1.pdf",
      calificacion: 4.9,
      paginas: 376
    },
    {
      id: 7,
      titulo: "Autoestima: Cómo mejorar tu relación contigo mismo",
      autor: "Dr. Matthew McKay",
      descripcion: "Ejercicios prácticos para construir una autoestima saludable y duradera.",
      imagen: "/src/assets/recursos/autoestima.jpg",
      categoria: "Autoestima",
      link: "https://books.google.es/books?id=4WGnDwAAQBAJ&printsec=copyright&hl=es#v=onepage&q&f=false",
      calificacion: 4.3,
      paginas: 400
    },
    {
      id: 8,
      titulo: "¿Cómo hacer que te pasen cosas buenas? ",
      autor: "Marian Rojas Estapé",
      descripcion: "Un libro de desarrollo personal que explica cómo las emociones, los pensamientos y la forma de interpretar la vida influyen en nuestro bienestar, ofreciendo herramientas para vivir con más equilibrio, optimismo y salud emocional.",
      imagen: "/src/assets/recursos/buenas.webp",
      categoria: "Trauma",
      link: "https://ens9002-infd.mendoza.edu.ar/sitio/wp-content/uploads/2022/09/Rojas_Estape_Marian_Como_Hacer_Que_Te_Pa.pdf",
      calificacion: 4.8,
      paginas: 218
    },
    {
      id: 9,
      titulo: "Los 4 acuerdos: Una guía práctica para la libertad personal",
      autor: "Don Miguel Ruiz",
      descripcion: "Aprende cuatro principios fundamentales para transformar tu vida y alcanzar la felicidad.",
      imagen: "/src/assets/recursos/acuerdos.webp",
      categoria: "Crecimiento Personal",
      link: "https://moodle.net/.pkg/@moodlenet/ed-resource/dl/ed-resource/A4M1kAmH/872_Los_Cuatro_Acuerdos_Miguel_Ruiz_1_.pdf",
      calificacion: 4.7,
      paginas: 49
    }
  ];

  const renderCalificacion = (calificacion) => {
    const estrellas = [];
    const calificacionRedondeada = Math.round(calificacion);
    
    for (let i = 1; i <= 5; i++) {
      if (i <= calificacionRedondeada) {
        estrellas.push(<span key={i} className="estrella-llena">⭐</span>);
      } else {
        estrellas.push(<span key={i} className="estrella-vacia">☆</span>);
      }
    }
    
    return (
      <div className="calificacion">
        {estrellas}
        <span className="calificacion-numero">({calificacion})</span>
      </div>
    );
  };

  return (
    <div id="biblioteca" className="biblioteca-container">
      <div className="biblioteca-header">
        <h2>📚 Biblioteca de Salud Mental</h2>
        <p>Una selección curada de libros para apoyar tu bienestar emocional y crecimiento personal</p>
      </div>

      <div className="biblioteca-grid">
        {libros.map((libro) => (
          <div key={libro.id} className="libro-card">
            <div className="libro-imagen-container">
              <img 
                src={libro.imagen} 
                alt={libro.titulo}
                className="libro-imagen"
                onError={(e) => {
                  e.target.src = "/src/assets/recursos/libro-placeholder.jpg";
                }}
              />
              <div className="libro-categoria">
                <span className="categoria-badge">{libro.categoria}</span>
              </div>
            </div>
            
            <div className="libro-contenido">
              <h3 className="libro-titulo">{libro.titulo}</h3>
              <p className="libro-autor">Por {libro.autor}</p>
              
              <div className="libro-meta">
                <span className="paginas">📖 {libro.paginas} páginas</span>
                {renderCalificacion(libro.calificacion)}
              </div>
              
              <p className="libro-descripcion">{libro.descripcion}</p>
              
              <div className="libro-acciones">
                <a 
                  href={libro.link} 
                  className="btn-leer-mas"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📖 Leer más
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Biblioteca;