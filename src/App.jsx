import React, { useState, useEffect } from 'react';
import Catalogo from './components/Catalogo.jsx';
import QuestionarioMatch from './components/QuestionarioMatch.jsx';
import CalendarIcon from './components/CalendarIcon.jsx'; // Assuming CalendarIcon might be used directly in App.js in the future or for consistency
import { psicologasData } from './data.js';
// Note: App.css will be imported in main.js or App.js as per plan step 8.
// If importing here, add: import './App.css';

export default function App() {
  const [psicologasList, setPsicologasList] = useState([]);
  const [iniciarMatch, setIniciarMatch] = useState(false);
  const [resultadoMatch, setResultadoMatch] = useState([]);
  const [isClientReady, setIsClientReady] = useState(false); // Added state
  const numeroClinica = '5521996561994';

  useEffect(() => {
    const shuffled = [...psicologasData].sort(() => 0.5 - Math.random());
    setPsicologasList(shuffled);
  }, []);

  // Added useEffect for client readiness
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
    // Re-shuffle the list if desired when resetting, or keep the original shuffled list
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

    // Modified condition for rendering results
    if (isClientReady && resultadoMatch.length > 0) {
      return (
        <div className="resultado-container">
          <h2>Sua especialista ideal</h2>
          <p>Com base nas suas respostas, esta é a profissional que mais se alinha com seu momento atual.</p>
          {resultadoMatch.map(psi => (
             <div key={psi.id} className="psi-card resultado-card">
              <img src={psi.fotoUrl} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x150/EAE5DE/CCC?text=Foto'; }} alt={`Foto de ${psi.nome}`} className="psi-foto" />
              <div className="psi-info">
                <h3 className="psi-nome">{psi.nome}</h3>
                <p className="psi-abordagem">{psi.abordagem}</p>
                <p className="psi-bio">{psi.bio}</p>
              </div>
              <div className="card-botoes">
                <button className="botao-agendar" onClick={() => handleWhatsAppResultadoClick(psi.nome)}>
                    <CalendarIcon /> Agendar
                </button>
                <button className="botao-perfil" onClick={resetApp}>Ver outras profissionais</button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return <Catalogo psicologas={psicologasList} />;
  }

  return (
    <>
      {/* The <style> tag will be removed and its content moved to App.css */}
      <div className="AppContainer">
        <header className="app-header">
          <h1>Encontre a especialista ideal para você</h1>
          <p>Cuidar da sua saúde mental é um ato de amor-próprio. Estamos aqui para ajudar.</p>
          {!iniciarMatch && resultadoMatch.length === 0 && (
             <a onClick={() => setIniciarMatch(true)} className="match-start-link" style={{cursor: 'pointer'}}>Ou responda ao nosso questionário para encontrar seu match ideal</a>
          )}
        </header>

        {(iniciarMatch || resultadoMatch.length > 0) && (
          <button onClick={resetApp} className="botao-home">
            ‹ Ver todas as profissionais
          </button>
        )}

        {renderContent()}

        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} DeepSaúde. Todos os direitos reservados.</p>
        </footer>
      </div>
    </>
  );
}
