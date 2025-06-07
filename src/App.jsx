import React, { useState, useEffect } from 'react';
import Catalogo from './components/Catalogo.jsx';
import QuestionarioMatch from './components/QuestionarioMatch.jsx';
import CalendarIcon from './components/CalendarIcon.jsx';
// import MagicWandIcon from './components/MagicWandIcon.jsx'; // Import MagicWandIcon REMOVED
import { psicologasData } from './data.js';
// Note: App.css will be imported in main.js or App.js as per plan step 8.
// If importing here, add: import './App.css';

export default function App() {
  const [psicologasList, setPsicologasList] = useState([]);
  const [iniciarMatch, setIniciarMatch] = useState(false);
  const [resultadoMatch, setResultadoMatch] = useState([]);
  const [isClientReady, setIsClientReady] = useState(false);
  const numeroClinica = '5521996561994';

  useEffect(() => {
    const shuffled = [...psicologasData].sort(() => 0.5 - Math.random());
    setPsicologasList(shuffled);
  }, []);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const handleMatchComplete = (matches) => {
    setResultadoMatch(matches);
    setIniciarMatch(false);
  };

  const handleWhatsAppResultadoClick = (psiNome) => {
    const mensagem = encodeURIComponent(`Olá, fiz o questionário e a especialista ideal para mim foi a ${psiNome}. Gostaria de agendar.`);
    window.open(`https://wa.me/${numeroClinica}?text=${mensagem}`, '_blank');
  };

  const resetApp = () => {
    setIniciarMatch(false);
    setResultadoMatch([]);
    const shuffled = [...psicologasData].sort(() => 0.5 - Math.random());
    setPsicologasList(shuffled);
  };

  const renderContent = () => {
    if (iniciarMatch) {
       return (
        <QuestionarioMatch
          onMatchComplete={handleMatchComplete}
        />
      );
    }

    if (isClientReady && resultadoMatch.length > 0) {
      const matchedPsi = resultadoMatch[0];
      return (
        <div className="resultado-container">
          <h2>Resultado do Questionário</h2>
          <p>{matchedPsi.mensagemResultado}</p>

          <div key={matchedPsi.id} className="psi-card resultado-card">
            <img src={matchedPsi.fotoUrl} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x150/EAE5DE/CCC?text=Foto'; }} alt={`Foto de ${matchedPsi.nome}`} className="psi-foto" />
            <div className="psi-info">
              <h3 className="psi-nome">{matchedPsi.nome}</h3>
              <p className="psi-abordagem">{matchedPsi.abordagem}</p>
              <p className="psi-bio">{matchedPsi.bio}</p>
            </div>
            <div className="card-botoes">
              <button className="botao-agendar" onClick={() => handleWhatsAppResultadoClick(matchedPsi.nome)}>
                  <CalendarIcon /> Agendar
              </button>
              <button className="botao-perfil" onClick={resetApp}>Ver outras profissionais</button>
            </div>
          </div>
        </div>
      );
    }

    // If not showing results or questionnaire, and promo hasn't been clicked, show catalog
    // The promo block will be rendered outside and before this specific catalog part
    return <Catalogo psicologas={psicologasList} />;
  }

  return (
    <>
      <div className="AppContainer">
        <header className="app-header">
          <h1>Encontre um especialista ideal para você</h1>
          <p>Cuidar da sua saúde mental é um ato de amor-próprio. Estamos aqui para ajudar.</p>
          {/* Old link removed from here */}
        </header>

        {(iniciarMatch || resultadoMatch.length > 0) && (
          <button onClick={resetApp} className="botao-home">
            ‹ Ver todas as profissionais
          </button>
        )}

        {/* NEW PROMO BLOCK - Conditionally render this before renderContent if catalog is to be shown */}
        {!iniciarMatch && resultadoMatch.length === 0 && (
          <div className="promo-match-container">
            <h2>Não sabe qual profissional escolher?</h2>
            <p>Responda a 5 perguntas rápidas e nosso sistema inteligente encontra a especialista que mais combina com seu momento e suas preferências.</p>
            <button className="botao-iniciar-match" onClick={() => setIniciarMatch(true)}>
              ✨ Encontrar meu especialista ideal
            </button>
          </div>
        )}

        {renderContent()}

        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} DeepSaúde. Todos os direitos reservados.</p>
        </footer>
      </div>
    </>
  );
}
