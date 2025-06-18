import React, { useState } from 'react';
import { psicologasData, perguntasMatch } from '../data.js';

const QuestionarioMatch = ({ onMatchComplete }) => {
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostas, setRespostas] = useState([]);
  const [textoLivre, setTextoLivre] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const totalPerguntas = perguntasMatch.length + 1; // +1 for the text input step

  const handleRespostaClick = (resposta) => {
    const novasRespostas = [...respostas, resposta];
    setRespostas(novasRespostas);
    setPerguntaAtual(perguntaAtual + 1);
  };

  const handleTextoSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const scores = psicologasData.reduce((acc, psi) => ({ ...acc, [psi.id]: 0 }), {});

    // Calcula os scores do Questionário
    respostas.forEach(resposta => {
      psicologasData.forEach(psi => {
        if (psi.tagsParaMatch.includes(resposta.tag)) {
          scores[psi.id] += resposta.peso;
        }
      });
    });

    // Adiciona os scores da IA, se houver texto
    if (textoLivre.trim().length > 0) {
      try {
        const tagsFromAI = await analisarTextoComIA(textoLivre);
        tagsFromAI.forEach(item => {
          psicologasData.forEach(psi => {
            if(psi.tagsParaMatch.includes(item.tag)) {
              const confianca = typeof item.confianca === 'number' ? item.confianca : 0;
              const pontuacaoIA = 7 * confianca; // Multiplicador calibrado
              scores[psi.id] += pontuacaoIA;
            }
          });
        });
      } catch (error) {
        // Loga apenas erros reais que podem acontecer na chamada da API
        console.error("Erro ao analisar texto com IA:", error);
      }
    }

    // Encontra o melhor match
    const maiorScore = Math.max(...Object.values(scores));

    if (maiorScore === 0) {
      const shuffled = [...psicologasData].sort(() => 0.5 - Math.random());
      onMatchComplete(shuffled.slice(0, 1));
      setIsLoading(false);
      return;
    }

    const melhoresMatches = psicologasData.filter(psi => scores[psi.id] === maiorScore);

    const randomIndex = Math.floor(Math.random() * melhoresMatches.length);
    setIsLoading(false);
    onMatchComplete([melhoresMatches[randomIndex]]);
  };

  async function analisarTextoComIA(texto) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const todasAsTags = [...new Set(psicologasData.flatMap(p => p.tagsParaMatch))];
    const prompt = `Analise o seguinte texto de um paciente: "${texto}". Com base no texto, retorne uma lista em formato JSON com os 3 rótulos mais relevantes da lista de opções a seguir que descrevem as necessidades do paciente: ${JSON.stringify(todasAsTags)}. Para cada rótulo, forneça um 'score de confiança' de 0.0 a 1.0. O formato da resposta deve ser um array de objetos JSON, como neste exemplo: [{"tag": "ansiedade", "confianca": 0.95}, {"tag": "relacionamentos", "confianca": 0.70}]`;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        })
      });

      if (!response.ok) {
        console.error(`API call failed with status: ${response.status}`, await response.text());
        return []; // Retorna vazio em caso de erro na API
      }

      const result = await response.json();

      if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
        const textResponse = result.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/(\[[\s\S]*?\])/);
        if (jsonMatch && jsonMatch[0]) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error("Failed to parse JSON from AI response:", e, "Response was:", textResponse);
            return [];
          }
        } else {
          console.warn("No JSON array found in AI response. Response was:", textResponse);
          return [];
        }
      }
    } catch (error) {
      console.error("Error during fetch or processing AI response:", error);
      return []; // Retorna vazio em caso de erro de rede ou outros
    }
    return []; // Retorno padrão
  }

  const renderEtapaAtual = () => {
    if (perguntaAtual < perguntasMatch.length) {
      const pergunta = perguntasMatch[perguntaAtual];
      if (!pergunta) {
        console.error("Pergunta não encontrada para o índice atual:", perguntaAtual);
        return <p>Erro ao carregar pergunta. Tente novamente.</p>;
      }
      const progresso = ((perguntaAtual + 1) / totalPerguntas) * 100;
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
          <p className="match-progresso-texto">Passo {perguntaAtual + 1} de {totalPerguntas}</p>
        </>
      );
    } else {
      const finalProgresso = 100;
      return (
        <>
          <div className="match-progresso-barra"><div className="match-progresso-preenchimento" style={{ width: `${finalProgresso}%` }}></div></div>
          <h3 className="match-pergunta">Descreva seu momento em suas palavras.</h3>
          <p className="match-subpergunta">Nossa Inteligência Artificial analisará sua descrição para refinar a recomendação, garantindo a escolha mais precisa. (Opcional)</p>
          <textarea
            className="match-textarea"
            value={textoLivre}
            onChange={(e) => setTextoLivre(e.target.value)}
            placeholder="Ex: 'Tenho tido muitas crises de ansiedade no trabalho e isso tem afetado o meu casamento...'"
            rows="4"
          ></textarea>
          <button className="botao-finalizar" onClick={handleTextoSubmit} disabled={isLoading}>
            {isLoading ? 'A analisar...' : 'Ver minha especialista ideal'}
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
