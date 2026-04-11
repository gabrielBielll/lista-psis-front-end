// src/components/Catalogo.jsx

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarIcon from './CalendarIcon.jsx';
import Horarios from './Horarios.jsx';

const Catalogo = ({ psicologas, isLoadingHorarios }) => {
  const [expandedCardId, setExpandedCardId] = useState(null);
  const numeroClinica = '5521996561994';
  const cardRefs = useRef({});

  const handleWhatsAppClick = (psiNome) => {
    const mensagem = encodeURIComponent(`Olá, vi o catálogo e gostaria de agendar com a psicóloga ${psiNome}.`);
    window.open(`https://wa.me/${numeroClinica}?text=${mensagem}`, '_blank');
  };

  const handleToggleExpand = (psiId) => {
    const isExpanding = expandedCardId !== psiId;
    setExpandedCardId(isExpanding ? psiId : null);

    if (isExpanding) {
      setTimeout(() => {
        const cardElement = cardRefs.current[psiId];
        if (cardElement) {
          cardElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 300); // Aguarda um pouco mais para a animação do Framer Motion começar
    }
  };

  return (
    <div className="catalogo-container">
      {psicologas.map((psi) => {
        const isExpanded = expandedCardId === psi.id;
        return (
          <motion.div
            layout
            key={psi.id}
            className={`psi-card ${isExpanded ? 'psi-card--expanded' : ''}`}
            ref={el => (cardRefs.current[psi.id] = el)}
            initial={false}
            transition={{
              layout: { duration: 0.4, type: "spring", stiffness: 200, damping: 25 },
              opacity: { duration: 0.2 }
            }}
          >
            <motion.img 
              layout="position"
              src={psi.fotoUrl} 
              onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x150/EAE5DE/CCC?text=Foto'; }} 
              alt={`Foto de ${psi.nome}`} 
              className="psi-foto" 
            />
            
            <motion.div layout="position" className="psi-info">
                <motion.h3 layout="position" className="psi-nome">{psi.nome}</motion.h3>
                {psi.crp && <motion.p layout="position" className="psi-crp"><strong>CRP:</strong> {psi.crp}</motion.p>}
                <motion.p layout="position" className="psi-abordagem">{psi.abordagem}</motion.p>
                
                <div className="psi-bio-wrapper">
                  <motion.p 
                    layout="position"
                    className={`psi-bio ${!isExpanded ? 'psi-bio--collapsed' : ''}`}
                  >
                    {psi.bio}
                  </motion.p>
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="expanded-content"
                    >
                      <Horarios horarios={psi.horarios_disponiveis} isLoading={isLoadingHorarios} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div layout="position" className="psi-especialidades">
                  {psi.especialidades.map((esp, index) => (
                    <motion.span 
                      layout="position" 
                      key={index} 
                      className="tag"
                    >
                      {esp}
                    </motion.span>
                  ))}
                </motion.div>
            </motion.div>

            <motion.div layout="position" className="card-botoes">
                <button className="botao-agendar" onClick={() => handleWhatsAppClick(psi.nome)}>
                    <CalendarIcon /> Agendar
                </button>
                <button className="botao-perfil" onClick={() => handleToggleExpand(psi.id)}>
                    {isExpanded ? 'Ver Menos' : 'Ver Perfil'}
                </button>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Catalogo;
