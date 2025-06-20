// src/App.jsx

import React, { useState, useEffect } from 'react';
import Catalogo from './components/Catalogo.jsx';
import QuestionarioMatch from './components/QuestionarioMatch.jsx';
import CalendarIcon from './components/CalendarIcon.jsx';
import { psicologasData } from './data.js';

// Função auxiliar para traduzir os dias da semana para exibição amigável
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
  // Estado para a lista de psicólogas com todos os dados (locais + API)
  const [psicologasList, setPsicologasList] = useState([]);
  
  // Estado para controlar o carregamento inicial dos dados
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para controlar o fluxo do questionário (match)
  const [iniciarMatch, setIniciarMatch] = useState(false);
  const [resultadoMatch, setResultadoMatch] = useState([]);
  
  // Estado para armazenar a junção de todos os horários de todas as psicólogas
  const [horariosGerais, setHorariosGerais] = useState({});
  
  // Estado para armazenar o horário que o usuário seleciona na tela de resultado
  const [horarioSelecionado, setHorarioSelecionado] = useState('');

  // Constantes da aplicação
  const numeroClinica = '5521996561994';
  const API_URL = 'https://lista-psis-api.onrender.com/api/horarios';

  // Efeito que executa apenas uma vez, quando o componente é montado, para buscar os dados
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // 1. Busca os horários da API
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Falha ao carregar horários da API. Usando dados locais como fallback.');
        }
        const horariosData = await response.json();

        // 2. Mapeia os horários por ID para fácil acesso (ex: {1: {seg: [...]}})
        const horariosMap = horariosData.reduce((acc, curr) => {
          acc[curr.psicologa_id] = curr.horarios_disponiveis;
          return acc;
        }, {});

        // 3. Une os dados locais das psicólogas com seus horários vindos da API
        const dadosCompletos = psicologasData.map(psi => ({
          ...psi,
          horarios_disponiveis: horariosMap[psi.id] || {} // Garante que sempre haja um objeto de horários
        }));

        // 4. Calcula o objeto com todos os horários disponíveis consolidados
        const todosOsHorarios = {};
        dadosCompletos.forEach(psi => {
            for (const dia in psi.horarios_disponiveis) {
                if (!todosOsHorarios[dia]) {
                    todosOsHorarios[dia] = new Set(); // Usa Set para evitar duplicatas
                }
                psi.horarios_disponiveis[dia].forEach(hora => {
                    todosOsHorarios[dia].add(hora);
                });
            }
        });

        // Converte os Sets de volta para arrays ordenados
        for (const dia in todosOsHorarios) {
            todosOsHorarios[dia] = Array.from(todosOsHorarios[dia]).sort();
        }
        setHorariosGerais(todosOsHorarios);
        
        // 5. Embaralha a lista final e atualiza o estado
        const shuffled = [...dadosCompletos].sort(() => 0.5 - Math.random());
        setPsicologasList(shuffled);
        
      } catch (error) {
        console.error(error.message);
        // Em caso de erro na API, carrega a lista apenas com os dados locais
        const shuffled = [...psicologasData].sort(() => 0.5 - Math.random());
        setPsicologasList(shuffled);
        setHorariosGerais({}); // Define horários como vazio
      } finally {
        setIsLoading(false); // Finaliza o estado de carregamento
      }
    };

    fetchAllData();
  }, []); // O array vazio [] garante que o useEffect rode apenas uma vez

  // Função chamada quando o questionário é completado
  const handleMatchComplete = (matches) => {
    setResultadoMatch(matches);
    setIniciarMatch(false);
    setHorarioSelecionado(''); // Limpa a seleção de horário anterior
  };

  // Função para abrir o WhatsApp, agora incluindo o horário selecionado
  const handleWhatsAppResultadoClick = (psiNome) => {
    if (!horarioSelecionado) {
        alert('Por favor, selecione um horário para continuar o agendamento.');
        return;
    }
    const mensagem = encodeURIComponent(`Olá, fiz o questionário e a especialista ideal para mim foi a ${psiNome}. Gostaria de agendar para ${horarioSelecionado}.`);
    window.open(`https://wa.me/${numeroClinica}?text=${mensagem}`, '_blank');
  };

  // Função para voltar à tela inicial
  const resetApp = () => {
    setIniciarMatch(false);
    setResultadoMatch([]);
    setHorarioSelecionado('');
    // Re-embaralha a lista para dar uma sensação de novidade
    const shuffled = [...psicologasList].sort(() => 0.5 - Math.random());
    setPsicologasList(shuffled);
  };

  // Função que decide qual conteúdo principal renderizar na tela
  const renderContent = () => {
    if (isLoading) {
      return <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>A carregar profissionais...</p>;
    }
  
    if (iniciarMatch) {
       return (
         <QuestionarioMatch 
            onMatchComplete={handleMatchComplete} 
            horariosGerais={horariosGerais} // Passa os horários para o questionário
            psicologas={psicologasList} // Passa a lista completa para o match
         />
       );
    }

    if (resultadoMatch.length > 0) {
      const matchedPsi = resultadoMatch[0];
      return (
        <div className="resultado-container">
          <h2>✨ A sua especialista ideal</h2>
          <p>{matchedPsi.mensagemResultado || `Baseado nas suas respostas, esta especialista é uma ótima combinação para você.`}</p>

          <div key={matchedPsi.id} className="psi-card resultado-card">
            <img src={matchedPsi.fotoUrl} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x150/EAE5DE/CCC?text=Foto'; }} alt={`Foto de ${matchedPsi.nome}`} className="psi-foto" />
            <div className="psi-info">
              <h3 className="psi-nome">{matchedPsi.nome}</h3>
              {matchedPsi.crp && <p className="psi-crp"><strong>CRP:</strong> {matchedPsi.crp}</p>}
              <p className="psi-abordagem">{matchedPsi.abordagem}</p>
              <p className="psi-bio">{matchedPsi.bio}</p>
            </div>
            <div className="card-botoes">
                {/* Seletor de Horário na tela de resultado */}
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
    
    // Renderização padrão: o catálogo
    return <Catalogo psicologas={psicologasList} />;
  }

  return (
    <>
      <div className="AppContainer">
        <header className="app-header">
          <h1>Encontre uma especialista ideal para si</h1>
          <p>Cuidar da sua saúde mental é um ato de amor-próprio. Estamos aqui para ajudar.</p>
        </header>

        {/* Botão para voltar para a home, visível apenas fora da tela inicial */}
        {(iniciarMatch || resultadoMatch.length > 0) && (
          <button onClick={resetApp} className="botao-home">
            ‹ Ver todas as profissionais
          </button>
        )}

        {/* Bloco de chamada para o questionário, visível apenas na tela inicial */}
        {!iniciarMatch && resultadoMatch.length === 0 && !isLoading && (
          <div className="promo-match-container">
            <h2>Não sabe qual profissional escolher?</h2>
            <p>Responda a 5 perguntas rápidas e o nosso sistema inteligente encontra a especialista que mais combina com o seu momento e as suas preferências.</p>
            <button className="botao-iniciar-match" onClick={() => setIniciarMatch(true)}>
              ✨ Encontrar a minha especialista ideal
            </button>
          </div>
        )}

        {/* Renderiza o conteúdo principal (catálogo, questionário ou resultado) */}
        {renderContent()}

        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} DeepSaúde. Todos os direitos reservados.</p>
        </footer>
      </div>
    </>
  );
}
