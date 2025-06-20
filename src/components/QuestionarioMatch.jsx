// src/components/QuestionarioMatch.jsx

import React, { useState } from 'react';
// REMOVIDO: Não vamos mais depender do 'useMemo' ou 'psicologasData' diretamente aqui para horários.
// import { psicologasData, perguntasMatch } from '../data.js';
import { perguntasMatch } from '../data.js'; // Apenas as perguntas são necessárias de data.js

// NOVO: Função para traduzir os dias, para exibição na tela.
function traduzirDia(dia) {
    const mapaDias = {
        seg: "Segunda",
        ter: "Terça",
        qua: "Quarta",
        qui: "Quinta",
        sex: "Sexta",
        sab: "Sábado",
        dom: "Domingo"
    };
    return mapaDias[dia.toLowerCase()] || dia;
}

// ALTERAÇÃO: O componente agora recebe 'psicologas' e 'horariosGerais'
const QuestionarioMatch = ({ onMatchComplete, psicologas, horariosGerais }) => {
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostas, setRespostas] = useState([]);
  // ALTERAÇÃO: O Set agora vai guardar chaves únicas como "dia-hora" (ex: "seg-10:00")
  const [selectedHorarios, setSelectedHorarios] = useState(new Set());
  const [textoLivre, setTextoLivre] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const totalPerguntas = perguntasMatch.length + 2;

  // REMOVIDO: A lógica de 'todosOsHorarios' agora vem via prop 'horariosGerais'.
  /* const todosOsHorarios = useMemo(() => { ... });
  */

  const handleRespostaClick = (resposta) => {
    setRespostas([...respostas, resposta]);
    setPerguntaAtual(perguntaAtual + 1);
  };

  // ALTERAÇÃO: Lida com a seleção de horários no formato "dia-hora"
  const handleHorarioToggle = (horarioKey) => {
    const newSelected = new Set(selectedHorarios);
    if (newSelected.has(horarioKey)) {
      newSelected.delete(horarioKey);
    } else {
      newSelected.add(horarioKey);
    }
    setSelectedHorarios(newSelected);
  };

  const handleTextoSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const horariosSelecionadosArray = Array.from(selectedHorarios);

    // ALTERAÇÃO FUNDAMENTAL: Filtrar psicólogas com base nos horários selecionados
    const psicologasDisponiveis = horariosSelecionadosArray.length === 0
      ? psicologas // Se nenhum horário foi selecionado, considera todas
      : psicologas.filter(psi => {
          // Para cada psicóloga, verifica se algum de seus horários bate com os selecionados
          return horariosSelecionadosArray.some(selecionado => {
            const [dia, hora] = selecionado.split('-');
            // Verifica se a psi tem o dia e se o array de horas para aquele dia inclui a hora selecionada
            return psi.horarios_disponiveis[dia] && psi.horarios_disponiveis[dia].includes(hora);
          });
        });

    // Se o filtro de horário não retornou ninguém, mas o usuário selecionou horários,
    // usamos todas as psicólogas como fallback para não travar o processo.
    // O aviso sobre a incompatibilidade de horário será adicionado no final.
    const listaParaMatch = psicologasDisponiveis.length > 0 ? psicologasDisponiveis : psicologas;

    // O restante da lógica de cálculo de score permanece a mesma, mas agora opera sobre 'listaParaMatch'
    const scores = listaParaMatch.reduce((acc, psi) => ({ ...acc, [psi.id]: 0 }), {});

    respostas.forEach(resposta => {
      listaParaMatch.forEach(psi => {
        if (psi.tagsParaMatch.includes(resposta.tag)) {
          scores[psi.id] += resposta.peso;
        }
      });
    });

    if (textoLivre.trim().length > 0) {
      try {
        const tagsFromAI = await analisarTextoComIA(textoLivre);
        tagsFromAI.forEach(item => {
          listaParaMatch.forEach(psi => {
            if (psi.tagsParaMatch.includes(item.tag)) {
              const confianca = typeof item.confianca === 'number' ? item.confianca : 0;
              scores[psi.id] += 7 * confianca;
            }
          });
        });
      } catch (error) {
        console.error("Erro ao analisar texto com IA:", error);
      }
    }

    const maiorScore = Math.max(...Object.values(scores));

    if (maiorScore === 0) {
        const shuffled = [...listaParaMatch].sort(() => 0.5 - Math.random());
        onMatchComplete(shuffled.slice(0, 1));
        setIsLoading(false);
        return;
    }

    let melhoresMatches = listaParaMatch.filter(psi => scores[psi.id] === maiorScore);
    let melhorMatch = melhoresMatches[Math.floor(Math.random() * melhoresMatches.length)];

    // Adicionar aviso se o match final não tiver o horário desejado
    if (psicologasDisponiveis.length === 0 && horariosSelecionadosArray.length > 0) {
        melhorMatch = {
            ...melhorMatch,
            mensagemResultado: melhorMatch.mensagemResultado + " (Aviso: não encontramos uma especialista com os horários que você selecionou, mas esta é a melhor combinação para suas outras necessidades.)"
        };
    }

    setIsLoading(false);
    onMatchComplete([melhorMatch]);
  };

  // A função analisarTextoComIA continua a mesma (pode ser mantida como está)
  async function analisarTextoComIA(texto) {
    //... (código da função inalterado)
  }

  const renderEtapaAtual = () => {
    const progresso = ((perguntaAtual + 1) / totalPerguntas) * 100;

    if (perguntaAtual < perguntasMatch.length) {
      // ... (etapa de perguntas inalterada)
    } 
    // ALTERAÇÃO: Lógica de renderização da grade de horários
    else if (perguntaAtual === perguntasMatch.length) {
      return (
         <>
          <div className="match-progresso-barra"><div className="match-progresso-preenchimento" style={{ width: `${progresso}%` }}></div></div>
          <h3 className="match-pergunta">Quais dias e horários funcionam para você?</h3>
          <p className="match-subpergunta">Selecione todas as opções que se encaixam na sua rotina. Isso nos ajudará a encontrar uma especialista com agenda compatível.</p>
          
          <div className="horarios-selecao-container"> {/* NOVO: Wrapper para os dias */}
            {Object.entries(horariosGerais).map(([dia, horas]) => (
              <div key={dia} className="horarios-dia-grupo">
                <h4>{traduzirDia(dia)}</h4>
                <div className="horarios-grid">
                  {horas.map(hora => {
                    const horarioKey = `${dia}-${hora}`; // Chave única: "seg-10:00"
                    return (
                      <button
                        key={horarioKey}
                        onClick={() => handleHorarioToggle(horarioKey)}
                        className={`horario-botao ${selectedHorarios.has(horarioKey) ? 'selecionado' : ''}`}
                      >
                        {hora}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <button className="botao-proximo" onClick={() => setPerguntaAtual(perguntaAtual + 1)}>
             {selectedHorarios.size > 0 ? "Continuar" : "Pular esta etapa"}
          </button>
          <p className="match-progresso-texto">Passo {perguntaAtual + 1} de {totalPerguntas}</p>
        </>
      )
    }
    else {
      // ... (etapa de texto livre inalterada)
    }
  }

  return (
    <div className="match-container">
      {renderEtapaAtual()}
    </div>
  );
};

export default QuestionarioMatch;
