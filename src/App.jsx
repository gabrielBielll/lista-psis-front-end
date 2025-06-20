// src/App.jsx

import React, { useState, useEffect } from 'react';
import Catalogo from './components/Catalogo.jsx';
import QuestionarioMatch from './components/QuestionarioMatch.jsx';
import CalendarIcon from './components/CalendarIcon.jsx';
import { psicologasData } from './data.js';

// Função auxiliar para traduzir os dias
function traduzirDia(dia) {
    const mapaDias = {
        seg: "Segunda-feira",
        ter: "Terça-feira",
        qua: "Quarta-feira",
        qui: "Quinta-feira",
        sex: "Sexta-feira",
        sab: "Sábado",
        dom: "Domingo"
    };
    return mapaDias[dia.toLowerCase()] || dia;
}

export default function App() {
  const [psicologasList, setPsicologasList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [iniciarMatch, setIniciarMatch] = useState(false);
  const [resultadoMatch, setResultadoMatch] = useState([]);
  
  // --- NOVOS ESTADOS ---
  const [horariosGerais, setHorariosGerais] = useState({}); // Para guardar a junção de todos os horários
  const [horarioSelecionado, setHorarioSelecionado] = useState(''); // Para guardar a escolha do usuário

  const numeroClinica = '5521996561994';
  const API_URL = 'https://lista-psis-api.onrender.com/api/horarios';

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Falha ao carregar horários da API.');
        
        const horariosData = await response.json();
        const horariosMap = horariosData.reduce((acc, curr) => {
          acc[curr.psicologa_id] = curr.horarios_disponiveis;
          return acc;
        }, {});

        const dadosCompletos = psicologasData.map(psi => ({
          ...psi,
          horarios_disponiveis: horariosMap[psi.id] || {}
        }));

        const shuffled = [...dadosCompletos].sort(() => 0.5 - Math.random());
        setPsicologasList(shuffled);
        
        // --- NOVA LÓGICA PARA CALCULAR HORÁRIOS GERAIS ---
        const todosOsHorarios = {};
        dadosCompletos.forEach(psi => {
            for (const dia in psi.horarios_disponiveis) {
                if (!todosOsHorarios[dia]) {
                    todosOsHorarios[dia] = new Set();
                }
                psi.horarios_disponiveis[dia].forEach(hora => {
                    todosOsHorarios[dia].add(hora);
                });
            }
        });

        // Converte os Sets para Arrays ordenados
        for (const dia in todosOsHorarios) {
            todosOsHorarios[dia] = Array.from(todosOsHorarios[dia]).sort();
        }
        setHorariosGerais(todosOsHorarios);
        
      } catch (error) {
        console.error("Erro ao buscar ou unir dados:", error);
        const shuffled = [...psicologasData].sort(() => 0.5 - Math.random());
        setPsicologasList(shuffled);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleMatchComplete = (matches) => {
    setResultadoMatch(matches);
    setIniciarMatch(false);
    setHorarioSelecionado(''); // Limpa a seleção anterior ao mostrar um novo resultado
  };

  // --- FUNÇÃO DE AGENDAMENTO ATUALIZADA ---
  const handleWhatsAppResultadoClick = (psiNome) => {
    if (!horarioSelecionado) {
        alert('Por favor, selecione um horário para continuar o agendamento.');
        return;
    }
    const mensagem = encodeURIComponent(`Olá, fiz o questionário e a especialista ideal para mim foi a ${psiNome}. Gostaria de agendar para ${horarioSelecionado}.`);
    window.open(`httpshttps://wa.me/${numeroClinica}?text=${mensagem}`, '_blank');
  };

  const resetApp = () => {
    setIniciarMatch(false);
    setResultadoMatch([]);
    setHorarioSelecionado('');
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

    if (resultadoMatch.length > 0) {
      const matchedPsi = resultadoMatch[0];
      return (
        <div className="resultado-container">
          <h2>✨ Sua especialista ideal</h2>
          <p>{matchedPsi.mensagemResultado}</p>

          <div key={matchedPsi.id} className="psi-card resultado-card">
            {/* O card da psicóloga continua o mesmo */}
            <img src={matchedPsi.fotoUrl} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x150/EAE5DE/CCC?text=Foto'; }} alt={`Foto de ${matchedPsi.nome}`} className="psi-foto" />
            <div className="psi-info">
              <h3 className="psi-nome">{matchedPsi.nome}</h3>
              {matchedPsi.crp && <p className="psi-crp"><strong>CRP:</strong> {matchedPsi.crp}</p>}
              <p className="psi-abordagem">{matchedPsi.abordagem}</p>
              <p className="psi-bio">{matchedPsi.bio}</p>
            </div>
            <div className="card-botoes">
                {/* --- SELEÇÃO DE HORÁRIO ADICIONADA AQUI --- */}
                <div className="selecao-horario-container">
                    <label htmlFor="horario-select">Escolha um horário para iniciar:</label>
                    <select 
                        id="horario-select"
                        className="horario-select" 
                        value={horarioSelecionado} 
                        onChange={(e) => setHorarioSelecionado(e.target.value)}
                    >
                        <option value="" disabled>Selecione um horário</option>
                        {Object.entries(horariosGerais).map(([dia, horas]) => (
                            <optgroup key={dia} label={traduzirDia(dia)}>
                                {horas.map(hora => (
                                    <option key={`${dia}-${hora}`} value={`${traduzirDia(dia)} às ${hora}`}>
                                        {hora}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

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
