// src/components/QuestionarioMatch.jsx

import React, { useState } from 'react';
import { perguntasMatch } from '../data.js'; // Apenas as perguntas são estáticas

// Função auxiliar para formatar o dia para exibição (ex: "seg" -> "Segunda")
function formatarDia(dia) {
    const mapa = { seg: "Segunda", ter: "Terça", qua: "Quarta", qui: "Quinta", sex: "Sexta", sab: "Sábado", dom: "Domingo" };
    return mapa[dia.toLowerCase()] || dia;
}

const QuestionarioMatch = ({ onMatchComplete, psicologas, horariosGerais }) => {
  // Estados para controlar o fluxo do questionário
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostas, setRespostas] = useState([]);
  const [horariosSelecionados, setHorariosSelecionados] = useState([]);
  const [textoLivre, setTextoLivre] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const totalEtapas = perguntasMatch.length + 2; // Perguntas + Horários + Texto IA

  // Avança para a próxima pergunta
  const handleRespostaClick = (resposta) => {
    setRespostas([...respostas, resposta]);
    setPerguntaAtual(perguntaAtual + 1);
  };

  // Lida com a seleção (marcar/desmarcar) de horários
  const handleHorarioClick = (horarioKey) => {
    setHorariosSelecionados(prev =>
      prev.includes(horarioKey)
        ? prev.filter(h => h !== horarioKey)
        : [...prev, horarioKey]
    );
  };
  
  // Avança para a próxima etapa (usado após a seleção de horários)
  const irParaProximaEtapa = () => {
    setPerguntaAtual(perguntaAtual + 1);
  };

  // Função final que calcula o match com base em todas as respostas
  const finalizarMatch = async () => {
    if (isLoading) return;
    setIsLoading(true);

    // Usa a prop `psicologas` que vem do App.jsx, já com os dados da API
    const scores = psicologas.reduce((acc, psi) => ({ ...acc, [psi.id]: 0 }), {});

    // 1. Adiciona pontos com base nas respostas do questionário
    respostas.forEach(resposta => {
      psicologas.forEach(psi => {
        if (psi.tagsParaMatch.includes(resposta.tag)) {
          scores[psi.id] += resposta.peso;
        }
      });
    });

    // 2. Adiciona um "super bônus" para psicólogas com horário compatível
    if (horariosSelecionados.length > 0) {
      horariosSelecionados.forEach(horarioKey => { // ex: "seg:10:00"
        const [dia, hora] = horarioKey.split(':');
        psicologas.forEach(psi => {
          if (psi.horarios_disponiveis && psi.horarios_disponiveis[dia]?.includes(hora)) {
            scores[psi.id] += 5; // Bônus de 5 pontos por match de horário
          }
        });
      });
    }

    // 3. Adiciona pontos com base na análise da IA (se houver texto)
    if (textoLivre.trim().length > 0) {
      const todasAsTags = [...new Set(psicologas.flatMap(p => p.tagsParaMatch))];
      try {
        const tagsFromAI = await analisarTextoComIA(textoLivre, todasAsTags);
        tagsFromAI.forEach(item => {
          psicologas.forEach(psi => {
            if (psi.tagsParaMatch.includes(item.tag)) {
              scores[psi.id] += 7 * (item.confianca || 0);
            }
          });
        });
      } catch (error) {
        console.error("Erro ao analisar texto com IA:", error);
      }
    }

    // 4. Encontra o maior score e lida com empates aleatoriamente
    const maiorScore = Math.max(...Object.values(scores));
    if (maiorScore === 0) {
        const shuffled = [...psicologas].sort(() => 0.5 - Math.random());
        onMatchComplete(shuffled.slice(0, 1));
        setIsLoading(false);
        return;
    }
    const melhoresMatches = psicologas.filter(psi => scores[psi.id] === maiorScore);
    const melhorMatch = melhoresMatches[Math.floor(Math.random() * melhoresMatches.length)];
    
    setIsLoading(false);
    onMatchComplete([melhorMatch]);
  };
  
  // A função da IA continua a mesma, mas agora recebe as tags como argumento
  async function analisarTextoComIA(texto, todasAsTags) {
     // ... (a sua lógica de chamada à API Gemini continua aqui, sem alterações)
  }

  // Renderiza a etapa correta do questionário
  const renderEtapaAtual = () => {
    const progresso = ((perguntaAtual + 1) / totalEtapas) * 100;

    // Etapas de múltipla escolha
    if (perguntaAtual < perguntasMatch.length) {
      const pergunta = perguntasMatch[perguntaAtual];
      return (
        <>
          <div className="match-progresso-barra"><div className="match-progresso-preenchimento" style={{ width: `${progresso}%` }}></div></div>
          <h3 className="match-pergunta">{pergunta.pergunta}</h3>
          <div className="match-respostas">
            {pergunta.respostas.map((resposta, index) => (
              <button key={index} onClick={() => handleRespostaClick(resposta)}>
                {resposta.texto}
              </button>
            ))}
          </div>
          <p className="match-progresso-texto">Passo {perguntaAtual + 1} de {totalEtapas}</p>
        </>
      );
    } 
    // Etapa da Grade de Horários
    else if (perguntaAtual === perguntasMatch.length) {
      // Cria a grade de horários a partir da prop `horariosGerais`
      const todosHorariosParaGrid = Object.entries(horariosGerais)
        .flatMap(([dia, horas]) => horas.map(hora => ({
            key: `${dia}:${hora}`, // "seg:10:00"
            display: `${formatarDia(dia)} ${hora}` // "Segunda 10:00"
        })));

      return (
        <>
          <div className="match-progresso-barra"><div className="match-progresso-preenchimento" style={{ width: `${progresso}%` }}></div></div>
          <h3 className="match-pergunta">Quais dias e horários funcionam para si?</h3>
          <p className="match-subpergunta">Selecione todas as opções que se encaixam na sua rotina. Isto ajudar-nos-á a encontrar uma especialista com agenda compatível.</p>
          <div className="horarios-grid-container">
            {todosHorariosParaGrid.length > 0 ? (
                todosHorariosParaGrid.map(horario => (
                    <button
                        key={horario.key}
                        className={`botao-horario ${horariosSelecionados.includes(horario.key) ? 'selecionado' : ''}`}
                        onClick={() => handleHorarioClick(horario.key)}
                    >
                        {horario.display}
                    </button>
                ))
            ) : (
                <p>Não foi possível carregar os horários. Pode pular esta etapa.</p>
            )}
          </div>
          <div className="botoes-navegacao-horarios">
            <button className="botao-proximo" onClick={irParaProximaEtapa}>Próxima Etapa</button>
            <button className="botao-pular" onClick={irParaProximaEtapa}>Pular esta etapa</button>
          </div>
          <p className="match-progresso-texto">Passo {perguntaAtual + 1} de {totalEtapas}</p>
        </>
      );
    }
    // Etapa Final: Texto livre
    else {
      return (
        <>
          <div className="match-progresso-barra"><div className="match-progresso-preenchimento" style={{ width: `100%` }}></div></div>
          <h3 className="match-pergunta">Descreva o seu momento com as suas palavras.</h3>
          <p className="match-subpergunta">A nossa Inteligência Artificial analisará a sua descrição para refinar a recomendação. (Opcional)</p>
          <textarea
            className="match-textarea"
            value={textoLivre}
            onChange={(e) => setTextoLivre(e.target.value)}
            placeholder="Ex: 'Tenho tido muitas crises de ansiedade no trabalho e isso tem afetado o meu casamento...'"
            rows="4"
          ></textarea>
          <button className="botao-finalizar" onClick={finalizarMatch} disabled={isLoading}>
            {isLoading ? 'A analisar...' : 'Ver a minha especialista ideal'}
          </button>
          <p className="match-progresso-texto">Último passo</p>
        </>
      );
    }
  }

  return (
    <div className="match-container">
      {renderEtapaAtual()}
    </div>
  );
};

export default QuestionarioMatch;
