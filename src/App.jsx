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
  // Estados da aplicação
  const [psicologasList, setPsicologasList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [iniciarMatch, setIniciarMatch] = useState(false);
  const [resultadoMatch, setResultadoMatch] = useState([]);
  const [horariosGerais, setHorariosGerais] = useState({});
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  
  // NOVO ESTADO PARA DIAGNÓSTICO DE ERRO
  const [error, setError] = useState(null);

  // Constantes da aplicação
  const numeroClinica = '5521996561994';
  const API_URL = 'https://lista-psis-api.onrender.com/api/horarios';

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null); // Limpa erros anteriores
      try {
        // 1. Busca os horários da API
        console.log("A iniciar busca de horários da API...");
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          // Lança um erro específico se a resposta da API não for bem-sucedida
          throw new Error(`Erro na API: Recebeu o status ${response.status}. Verifique se o endereço da API está correto e se o servidor está no ar.`);
        }
        
        const horariosData = await response.json();
        console.log("Dados recebidos da API de horários:", horariosData); // LOG PARA DEBUG

        if (!Array.isArray(horariosData)) {
            throw new Error("Formato de dados inesperado da API. Esperava um array.");
        }

        // 2. Mapeia os horários por ID para fácil acesso
        const horariosMap = horariosData.reduce((acc, curr) => {
          acc[curr.psicologa_id] = curr.horarios_disponiveis;
          return acc;
        }, {});

        // 3. Une os dados locais com os da API
        const dadosCompletos = psicologasData.map(psi => ({
          ...psi,
          horarios_disponiveis: horariosMap[psi.id] || {} 
        }));
        console.log("Dados das psicólogas combinados com horários:", dadosCompletos); // LOG PARA DEBUG

        // 4. Calcula o objeto com todos os horários disponíveis consolidados
        const todosOsHorarios = {};
        dadosCompletos.forEach(psi => {
            if (psi.horarios_disponiveis) {
                for (const dia in psi.horarios_disponiveis) {
                    if (!todosOsHorarios[dia]) {
                        todosOsHorarios[dia] = new Set();
                    }
                    psi.horarios_disponiveis[dia].forEach(hora => {
                        todosOsHorarios[dia].add(hora);
                    });
                }
            }
        });

        for (const dia in todosOsHorarios) {
            todosOsHorarios[dia] = Array.from(todosOsHorarios[dia]).sort();
        }
        setHorariosGerais(todosOsHorarios);
        console.log("Horários gerais calculados:", todosOsHorarios); // LOG PARA DEBUG
        
        // 5. Embaralha a lista final e atualiza o estado
        const shuffled = [...dadosCompletos].sort(() => 0.5 - Math.random());
        setPsicologasList(shuffled);
        
      } catch (err) {
        // Se qualquer passo acima falhar, captura o erro
        console.error("Ocorreu um erro ao buscar ou processar os dados:", err);
        setError(err); // Define o estado de erro para exibição na UI
        
        // Carrega a lista apenas com os dados locais como fallback
        const shuffled = [...psicologasData].sort(() => 0.5 - Math.random());
        setPsicologasList(shuffled);
        setHorariosGerais({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // ... (o resto das funções `handleMatchComplete`, `handleWhatsAppResultadoClick`, `resetApp` continua igual) ...

  const handleMatchComplete = (matches) => {
    setResultadoMatch(matches);
    setIniciarMatch(false);
    setHorarioSelecionado('');
  };

  const handleWhatsAppResultadoClick = (psiNome) => {
    if (!horarioSelecionado) {
        alert('Por favor, selecione um horário para continuar o agendamento.');
        return;
    }
    const mensagem = encodeURIComponent(`Olá, fiz o questionário e a especialista ideal para mim foi a ${psiNome}. Gostaria de agendar para ${horarioSelecionado}.`);
    window.open(`https://wa.me/${numeroClinica}?text=${mensagem}`, '_blank');
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
      return <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>A carregar profissionais...</p>;
    }
  
    if (iniciarMatch) {
       return (
         <QuestionarioMatch 
            onMatchComplete={handleMatchComplete} 
            horariosGerais={horariosGerais}
            psicologas={psicologasList}
         />
       );
    }

    if (resultadoMatch.length > 0) {
      const matchedPsi = resultadoMatch[0];
      return (
        <div className="resultado-container">
          <h2>✨ A sua especialista ideal</h2>
          <p>{matchedPsi.mensagemResultado || `Baseado nas suas respostas, esta especialista é uma ótima combinação para si.`}</p>

          <div key={matchedPsi.id} className="psi-card resultado-card">
            <img src={matchedPsi.fotoUrl} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x150/EAE5DE/CCC?text=Foto'; }} alt={`Foto de ${matchedPsi.nome}`} className="psi-foto" />
            <div className="psi-info">
              <h3 className="psi-nome">{matchedPsi.nome}</h3>
              {matchedPsi.crp && <p className="psi-crp"><strong>CRP:</strong> {matchedPsi.crp}</p>}
              <p className="psi-abordagem">{matchedPsi.abordagem}</p>
              <p className="psi-bio">{matchedPsi.bio}</p>
            </div>
            <div className="card-botoes">
                <div className="selecao-horario-container">
                    <label htmlFor="horario-select">Escolha um horário para iniciar:</label>
                    <select 
                        id="horario-select"
                        className="horario-select" 
                        value={horarioSelecionado} 
                        onChange={(e) => setHorarioSelecionado(e.target.value)}
                        disabled={Object.keys(horariosGerais).length === 0}
                    >
                        <option value="" disabled>Selecione um horário</option>
                        {Object.keys(horariosGerais).length === 0 ? (
                            <option disabled>Horários indisponíveis</option>
                        ) : (
                            Object.entries(horariosGerais).map(([dia, horas]) => (
                                <optgroup key={dia} label={traduzirDia(dia)}>
                                    {horas.map(hora => (
                                        <option key={`${dia}-${hora}`} value={`${traduzirDia(dia)} às ${hora}`}>
                                            {hora}
                                        </option>
                                    ))}
                                </optgroup>
                            ))
                        )}
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
        {/* EXIBIÇÃO DA MENSAGEM DE ERRO */}
        {error && (
            <div style={{ padding: '1rem', backgroundColor: '#fff0f0', border: '1px solid #ffaaaa', color: '#d8000c', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
                <strong>Erro de Conexão:</strong> {error.message}
            </div>
        )}

        <header className="app-header">
          <h1>Encontre uma especialista ideal para si</h1>
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
            <p>Responda a 5 perguntas rápidas e o nosso sistema inteligente encontra a especialista que mais combina com o seu momento e as suas preferências.</p>
            <button className="botao-iniciar-match" onClick={() => setIniciarMatch(true)}>
              ✨ Encontrar a minha especialista ideal
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
