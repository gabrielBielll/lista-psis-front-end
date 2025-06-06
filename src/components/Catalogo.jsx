import React, { useState } from 'react';
import CalendarIcon from './CalendarIcon.jsx';

const Catalogo = ({ psicologas }) => {
  const [expandedCardId, setExpandedCardId] = useState(null);
  const numeroClinica = '5521996561994';

  const handleWhatsAppClick = (psiNome) => {
    const mensagem = encodeURIComponent(`Olá, vi o catálogo e gostaria de agendar com a psicóloga ${psiNome}.`);
    window.open(`https://wa.me/${numeroClinica}?text=${mensagem}`, '_blank');
  };

  const handleToggleExpand = (psiId) => {
    setExpandedCardId(prevId => (prevId === psiId ? null : psiId));
  };

  return (
    <div className="catalogo-container">
      {psicologas.map((psi) => {
        const isExpanded = expandedCardId === psi.id;
        return (
          <div key={psi.id} className={`psi-card ${isExpanded ? 'psi-card--expanded' : ''}`}>
            <img src={psi.fotoUrl} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x150/EAE5DE/CCC?text=Foto'; }} alt={`Foto de ${psi.nome}`} className="psi-foto" />
            <div className="psi-info">
                <h3 className="psi-nome">{psi.nome}</h3>
                <p className="psi-abordagem">{psi.abordagem}</p>
                <p className={`psi-bio ${!isExpanded ? 'psi-bio--collapsed' : ''}`}>{psi.bio}</p>
                <div className="psi-especialidades">
                {psi.especialidades.map((esp, index) => (
                    <span key={index} className="tag">{esp}</span>
                ))}
                </div>
            </div>
            <div className="card-botoes">
                <button className="botao-agendar" onClick={() => handleWhatsAppClick(psi.nome)}>
                    <CalendarIcon /> Agendar
                </button>
                <button className="botao-perfil" onClick={() => handleToggleExpand(psi.id)}>
                    {isExpanded ? 'Ver Menos' : 'Ver Perfil'}
                </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Catalogo;
