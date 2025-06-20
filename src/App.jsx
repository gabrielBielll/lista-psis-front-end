// src/App.jsx

import React, { useState, useEffect } from 'react';
import Catalogo from './components/Catalogo.jsx';
import QuestionarioMatch from './components/QuestionarioMatch.jsx';
import CalendarIcon from './components/CalendarIcon.jsx';
import { psicologasData } from './data.js';

export default function App() {
  const [psicologasList, setPsicologasList] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Adicionado estado de loading
  const [iniciarMatch, setIniciarMatch] = useState(false);
  const [resultadoMatch, setResultadoMatch] = useState([]);
  const [isClientReady, setIsClientReady] = useState(false);
  const numeroClinica = '5521996561994';
  const API_URL = 'https://lista-psis-api.onrender.com/api/horarios';

  useEffect(() => {
    // Função para buscar e unir os dados
    const fetchAllData = async () => {
      try {
        // 1. Busca os horários da API
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Falha ao carregar horários da API.');
        }
        const horariosData = await response.json();

        // 2. Cria um mapa de horários para busca rápida (ex: {1: {seg: [...]}, 2: {qua: [...]}})
        const horariosMap = horariosData.reduce((acc, curr) => {
          acc[curr.psicologa_id] = curr.horarios_disponiveis;
          return acc;
        }, {});

        // 3. Une os dados das psicólogas com seus respectivos horários
        const dadosCompletos = psicologasData.map(psi => ({
          ...psi, // Mantém todos os dados originais da psicóloga
          horarios_disponiveis: horariosMap[psi.id] || {} // Adiciona os horários encontrados ou um objeto vazio
        }));

        // 4. Embaralha a lista final e atualiza o estado
        const shuffled = [...dadosCompletos].sort(() => 0.5 - Math.random());
        setPsicologasList(shuffled);
        
      } catch (error) {
        console.error("Erro ao buscar ou unir dados:", error);
        // Em caso de erro, usa apenas os dados locais sem horários
        const shuffled = [...psicologasData].sort(() => 0.5 - Math.random());
        setPsicologasList(shuffled);
      } finally {
        setIsLoading(false); // Finaliza o loading
      }
    };

    fetchAllData();
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const handleMatchComplete = (matches) => {
    setResultadoMatch(matches);
    setIniciarMatch(false);
  };

  const handleWhatsAppResultadoClick = (psiNome) => {
    const mensagem = encodeURIComponent(`Olá, fiz o questionário e a especialista ideal para mim foi a ${psiNome}. Gostaria de agendar.`);
    window.open(`httpshttps://wa.me/${numeroClinica}?text=${mensagem}`, '_blank');
  };

  const resetApp = () => {
    setIniciarMatch(false);
    setResultadoMatch([]);
    // Re-embaralha a lista atual que já contém os horários
    const shuffled = [...psicologasList].sort(() => 0.5 - Math.random());
    setPsicologasList(shuffled);
  };

  const renderContent = () => {
    if (isLoading) {
      return <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>Carregando profissionais...</p>;
    }
  
    if (iniciarMatch) {
       return <QuestionarioMatch onMatchComplete={handleMatchComplete} />;
    }

    if (isClientReady && resultadoMatch.length > 0) {
      const matchedPsi = resultadoMatch[0];
      return (
        <div className="resultado-container">
          <h2>✨ Sua especialista ideal</h2>
          <p>{matchedPsi.mensagemResultado}</p>

          <div key={matchedPsi.id} className="psi-card resultado-card">
            <img src={matchedPsi.fotoUrl} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x150/EAE5DE/CCC?text=Foto'; }} alt={`Foto de ${matchedPsi.nome}`} className="psi-foto" />
            <div className="psi-info">
              <h3 className="psi-nome">{matchedPsi.nome}</h3>
              {matchedPsi.crp && <p className="psi-crp"><strong>CRP:</strong> {matchedPsi.crp}</p>}
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
    
    return <Catalogo psicologas={psicologasList} />;
  }

  return (
    <>
      <div className="AppContainer">
        <header className="app-header">
          <h1>Encontre um especialista ideal para você</h1>
          <p>Cuidar da sua saúde mental é um ato de amor-próprio. Estamos aqui para ajudar.</p>
        </header>

        {(iniciarMatch || resultadoMatch.length > 0) && (
          <button onClick={resetApp} className="botao-home">
            ‹ Ver todas as profissionais
          </button>
        )}

        {!iniciarMatch && resultadoMatch.length === 0 && !isLoading && (
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
