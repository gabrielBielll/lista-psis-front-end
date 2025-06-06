import React, { useState } from 'react';
import { psicologasData, perguntasMatch } from '../data.js';

const QuestionarioMatch = ({ onMatchComplete }) => {
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostas, setRespostas] = useState([]);

  const handleRespostaClick = (resposta) => {
    const novasRespostas = [...respostas, resposta];
    setRespostas(novasRespostas);

    if (perguntaAtual < perguntasMatch.length - 1) {
      setPerguntaAtual(perguntaAtual + 1);
    } else {
      calcularMatch(novasRespostas);
    }
  };

  const calcularMatch = (respostasFinais) => {
    const scores = psicologasData.reduce((acc, psi) => ({ ...acc, [psi.id]: 0 }), {});

    respostasFinais.forEach(resposta => {
        psicologasData.forEach(psi => {
        if (psi.tagsParaMatch.includes(resposta.tag)) {
          scores[psi.id] += resposta.peso;
        }
      });
    });

    const maiorScore = Math.max(...Object.values(scores));

    if (maiorScore === 0) {
      const shuffled = [...psicologasData].sort(() => 0.5 - Math.random());
      onMatchComplete(shuffled.slice(0, 1)); // Retorna a primeira psicóloga aleatória se não houver match
      return;
    }

    const melhoresMatches = psicologasData.filter(psi => scores[psi.id] === maiorScore);

    // Se houver empate, retorna uma aleatória entre as melhores
    const randomIndex = Math.floor(Math.random() * melhoresMatches.length);
    onMatchComplete([melhoresMatches[randomIndex]]);
  };

  const pergunta = perguntasMatch[perguntaAtual];
  const progresso = ((perguntaAtual + 1) / perguntasMatch.length) * 100;

  return (
    <div className="match-container">
        <div className="match-progresso-barra">
            <div className="match-progresso-preenchimento" style={{ width: `${progresso}%` }}></div>
        </div>
        <h3 className="match-pergunta">{pergunta.pergunta}</h3>
        <div className="match-respostas">
            {pergunta.respostas.map((resposta, index) => (
            <button key={index} onClick={() => handleRespostaClick(resposta)}>
                {resposta.texto}
            </button>
            ))}
        </div>
        <p className="match-progresso-texto">Passo {perguntaAtual + 1} de {perguntasMatch.length}</p>
    </div>
  );
};

export default QuestionarioMatch;
