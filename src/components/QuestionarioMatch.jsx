import React, { useState, useMemo } from 'react';
import { psicologasData, perguntasMatch } from '../data.js';

const QuestionarioMatch = ({ onMatchComplete }) => {
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostas, setRespostas] = useState([]);
  const [selectedHorarios, setSelectedHorarios] = useState(new Set());
  const [textoLivre, setTextoLivre] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const totalPerguntas = perguntasMatch.length + 2; // Perguntas + Horários + Texto Livre

  const todosOsHorarios = useMemo(() => {
    const horariosSet = new Set(psicologasData.flatMap(p => p.horariosDisponiveis));
    return Array.from(horariosSet).sort(); // Ordena para consistência
  }, []);

  const handleRespostaClick = (resposta) => {
    setRespostas([...respostas, resposta]);
    setPerguntaAtual(perguntaAtual + 1);
  };

  const handleHorarioToggle = (horario) => {
    const newSelected = new Set(selectedHorarios);
    if (newSelected.has(horario)) {
      newSelected.delete(horario);
    } else {
      newSelected.add(horario);
    }
    setSelectedHorarios(newSelected);
  };

  const handleTextoSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);

    // 1. Filtrar psicólogas por horário
    const horariosSelecionadosArray = Array.from(selectedHorarios);
    const psicologasDisponiveis = psicologasData.filter(psi =>
      psi.horariosDisponiveis.some(horarioPsi => horariosSelecionadosArray.includes(horarioPsi))
    );

    // 2. Determinar a lista de candidatas para o match
    // Se houver psicólogas disponíveis, usamos essa lista. Senão, usamos todas como fallback.
    const listaParaMatch = psicologasDisponiveis.length > 0 ? psicologasDisponiveis : psicologasData;

    const scores = listaParaMatch.reduce((acc, psi) => ({ ...acc, [psi.id]: 0 }), {});

    // 3. Calcular scores do questionário
    respostas.forEach(resposta => {
      listaParaMatch.forEach(psi => {
        if (psi.tagsParaMatch.includes(resposta.tag)) {
          scores[psi.id] += resposta.peso;
        }
      });
    });

    // 4. Adicionar scores da IA (se houver texto)
    if (textoLivre.trim().length > 0) {
      try {
        const tagsFromAI = await analisarTextoComIA(textoLivre);
        tagsFromAI.forEach(item => {
          listaParaMatch.forEach(psi => {
            if (psi.tagsParaMatch.includes(item.tag)) {
              const confianca = typeof item.confianca === 'number' ? item.confianca : 0;
              scores[psi.id] += 7 * confianca; // Multiplicador calibrado
            }
          });
        });
      } catch (error) {
        console.error("Erro ao analisar texto com IA:", error);
      }
    }

    // 5. Encontrar o melhor match
    const maiorScore = Math.max(...Object.values(scores));

    if (maiorScore === 0) {
        // Se nenhum score foi gerado, retorna uma aleatória da lista (disponível ou total)
        const shuffled = [...listaParaMatch].sort(() => 0.5 - Math.random());
        onMatchComplete(shuffled.slice(0, 1));
        setIsLoading(false);
        return;
    }

    let melhoresMatches = listaParaMatch.filter(psi => scores[psi.id] === maiorScore);
    let melhorMatch = melhoresMatches[Math.floor(Math.random() * melhoresMatches.length)];

    // 6. Adicionar aviso se o match final não tiver o horário desejado
    if (psicologasDisponiveis.length === 0 && horariosSelecionadosArray.length > 0) {
        melhorMatch = {
            ...melhorMatch,
            mensagemResultado: melhorMatch.mensagemResultado + " (Aviso: não encontramos uma especialista com os horários que você selecionou, mas esta é a melhor combinação para suas outras necessidades.)"
        };
    }

    setIsLoading(false);
    onMatchComplete([melhorMatch]);
  };

  // A função analisarTextoComIA continua a mesma
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
        return [];
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
      return [];
    }
    return [];
  }

  const renderEtapaAtual = () => {
    const progresso = ((perguntaAtual + 1) / totalPerguntas) * 100;

    // Etapa das perguntas de múltipla escolha
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
          <p className="match-progresso-texto">Passo {perguntaAtual + 1} de {totalPerguntas}</p>
        </>
      );
    }
    // Nova Etapa: Seleção de Horários
    else if (perguntaAtual === perguntasMatch.length) {
      return (
         <>
          <div className="match-progresso-barra"><div className="match-progresso-preenchimento" style={{ width: `${progresso}%` }}></div></div>
          <h3 className="match-pergunta">Quais dias e horários funcionam para você?</h3>
          <p className="match-subpergunta">Selecione todas as opções que se encaixam na sua rotina. Isso nos ajudará a encontrar uma especialista com agenda compatível.</p>
          <div className="horarios-grid">
            {todosOsHorarios.map(horario => (
              <button
                key={horario}
                onClick={() => handleHorarioToggle(horario)}
                className={`horario-botao ${selectedHorarios.has(horario) ? 'selecionado' : ''}`}
              >
                {horario}
              </button>
            ))}
          </div>
          <button className="botao-proximo" onClick={() => setPerguntaAtual(perguntaAtual + 1)}>
             {selectedHorarios.size > 0 ? "Continuar" : "Pular esta etapa"}
          </button>
          <p className="match-progresso-texto">Passo {perguntaAtual + 1} de {totalPerguntas}</p>
        </>
      )
    }
    // Etapa Final: Texto Livre (opcional)
    else {
      return (
        <>
          <div className="match-progresso-barra"><div className="match-progresso-preenchimento" style={{ width: '100%' }}></div></div>
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
