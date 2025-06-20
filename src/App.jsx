// src/App.jsx

import React, { useState, useEffect } from 'react';
import Catalogo from './components/Catalogo.jsx';
import QuestionarioMatch from './components/QuestionarioMatch.jsx';
import CalendarIcon from './components/CalendarIcon.jsx';
import { psicologasData } from './data.js';

function traduzirDia(dia) {
    const mapaDias = { seg: "Segunda-feira", ter: "Terça-feira", qua: "Quarta-feira", qui: "Quinta-feira", sex: "Sexta-feira", sab: "Sábado", dom: "Domingo" };
    return mapaDias[dia.toLowerCase()] || dia;
}

export default function App() {
  const [psicologasList, setPsicologasList] = useState([]);
  const [iniciarMatch, setIniciarMatch] = useState(false);
  const [resultadoMatch, setResultadoMatch] = useState([]);
  const [horariosGerais, setHorariosGerais] = useState({});
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  const [error, setError] = useState(null);

  // NOVO: Estado de loading específico para os horários da API
  const [isLoadingHorarios, setIsLoadingHorarios] = useState(true);

  const numeroClinica = '5521996561994';
  const API_URL = 'https://lista-psis-api.onrender.com/api/horarios';

  useEffect(() => {
    // 1. Carrega a lista de psicólogas IMEDIATAMENTE com os dados locais.
    // Isso faz com que a página não fique em branco.
    const dadosIniciais = psicologasData.map(psi => ({
      ...psi,
      horarios_disponiveis: {} // Inicia sem horários
    }));
    const shuffled = [...dadosIniciais].sort(() => 0.5 - Math.random());
    setPsicologasList(shuffled);

    // 2. Inicia a busca dos horários da API em SEGUNDO PLANO.
    const fetchHorarios = async () => {
      setIsLoadingHorarios(true);
      setError(null);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Erro na API: Status ${response.status}`);
        
        const horariosData = await response.json();
        if (!Array.isArray(horariosData)) throw new Error("Formato de dados da API inesperado.");

        const horariosMap = horariosData.reduce((acc, curr) => {
          acc[curr.psicologa_id] = curr.horarios_disponiveis;
          return acc;
        }, {});

        // 3. Atualiza a lista de psicólogas existente com os horários recebidos.
        setPsicologasList(prevList => {
          const dadosCompletos = prevList.map(psi => ({
            ...psi,
            horarios_disponiveis: horariosMap[psi.id] || {}
          }));
          return dadosCompletos;
        });

        // Calcula os horários gerais para o questionário
        const todosOsHorarios = {};
        horariosData.forEach(item => {
            if (item.horarios_disponiveis) {
                for (const dia in item.horarios_disponiveis) {
                    if (!todosOsHorarios[dia]) todosOsHorarios[dia] = new Set();
                    item.horarios_disponiveis[dia].forEach(hora => todosOsHorarios[dia].add(hora));
                }
            }
        });
        for (const dia in todosOsHorarios) {
            todosOsHorarios[dia] = Array.from(todosOsHorarios[dia]).sort();
        }
        setHorariosGerais(todosOsHorarios);

      } catch (err) {
        console.error("Erro ao buscar horários:", err);
        setError(err);
      } finally {
        setIsLoadingHorarios(false); // Finaliza o loading dos horários
      }
    };

    fetchHorarios();
  }, []);

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
  
  // A renderização principal agora não depende mais do loading
  const renderContent = () => {
    if (iniciarMatch) {
       return (
         <QuestionarioMatch 
            onMatchComplete={handleMatchComplete} 
            horariosGerais={horariosGerais}
            psicologas={psicologasList}
            isLoadingHorarios={isLoadingHorarios} // Passa o estado de loading
         />
       );
    }

    if (resultadoMatch.length > 0) {
      // ... (código do resultado do match continua igual)
    }
    
    // Passa o estado de loading para o Catálogo
    return <Catalogo psicologas={psicologasList} isLoadingHorarios={isLoadingHorarios} />;
  }

  return (
    <div className="AppContainer">
      {/* ... (código do header, footer e botões continua igual) ... */}
    </div>
  );
}
