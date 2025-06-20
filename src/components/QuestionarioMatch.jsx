// src/components/QuestionarioMatch.jsx

import React, { useState } from 'react';
import { perguntasMatch } from '../data.js';

function formatarDia(dia) {
    const mapa = { seg: "Segunda", ter: "Terça", qua: "Quarta", qui: "Quinta", sex: "Sexta", sab: "Sábado", dom: "Domingo" };
    return mapa[dia.toLowerCase()] || dia;
}

const QuestionarioMatch = ({ onMatchComplete, psicologas, horariosGerais, isLoadingHorarios }) => {
    const [perguntaAtual, setPerguntaAtual] = useState(0);
    const [respostas, setRespostas] = useState([]);
    const [horariosSelecionados, setHorariosSelecionados] = useState([]);
    const [textoLivre, setTextoLivre] = useState("");
    const [isLoadingMatch, setIsLoadingMatch] = useState(false);

    const totalEtapas = perguntasMatch.length + 2;

    const handleRespostaClick = (resposta) => {
        setRespostas([...respostas, resposta]);
        setPerguntaAtual(perguntaAtual + 1);
    };

    const handleHorarioClick = (horarioKey) => {
        setHorariosSelecionados(prev => prev.includes(horarioKey) ? prev.filter(h => h !== horarioKey) : [...prev, horarioKey]);
    };

    const irParaProximaEtapa = () => {
        setPerguntaAtual(perguntaAtual + 1);
    };

    const finalizarMatch = async () => {
        if (isLoadingMatch) return;
        setIsLoadingMatch(true);

        // --- NOVA LÓGICA DE FILTRAGEM ---
        let candidatasParaMatch = psicologas;
        let avisoHorario = false;

        // 1. Filtra por horário, se o utilizador selecionou algum.
        if (horariosSelecionados.length > 0) {
            const psicologasDisponiveis = psicologas.filter(psi => 
                horariosSelecionados.some(horarioKey => {
                    const [dia, hora] = horarioKey.split(':');
                    return psi.horarios_disponiveis && psi.horarios_disponiveis[dia]?.includes(hora);
                })
            );

            if (psicologasDisponiveis.length > 0) {
                candidatasParaMatch = psicologasDisponiveis; // Usa a lista filtrada se houver compatibilidade.
            } else {
                avisoHorario = true; // Ativa o aviso para o resultado final.
            }
        }

        // 2. Calcula scores APENAS para as candidatas.
        const scores = candidatasParaMatch.reduce((acc, psi) => ({ ...acc, [psi.id]: 0 }), {});

        respostas.forEach(resposta => {
            candidatasParaMatch.forEach(psi => {
                if (psi.tagsParaMatch.includes(resposta.tag)) {
                    scores[psi.id] += resposta.peso;
                }
            });
        });

        // 3. (Opcional) Refina com a IA.
        if (textoLivre.trim().length > 0) {
             // A sua lógica de chamada à API Gemini iria aqui...
             // Lembre-se de passar as tags das `candidatasParaMatch` para a IA ser mais precisa.
        }
        
        // 4. Encontra o melhor match dentro do grupo de candidatas.
        const maiorScore = Math.max(...Object.values(scores));

        if (maiorScore === 0) {
            const shuffled = [...candidatasParaMatch].sort(() => 0.5 - Math.random());
            onMatchComplete(shuffled.slice(0, 1));
            setIsLoadingMatch(false);
            return;
        }

        let melhoresMatches = candidatasParaMatch.filter(psi => scores[psi.id] === maiorScore);
        let melhorMatch = melhoresMatches[Math.floor(Math.random() * melhoresMatches.length)];

        // 5. Adiciona a mensagem de aviso se necessário.
        if (avisoHorario) {
            melhorMatch = {
                ...melhorMatch,
                mensagemResultado: (melhorMatch.mensagemResultado || "Esta é a melhor combinação para si.") + " (Aviso: não encontrámos uma especialista com os horários que selecionou, mas esta é a melhor combinação para as suas outras necessidades.)"
            };
        }

        setIsLoadingMatch(false);
        onMatchComplete([melhorMatch]);
    };

    const renderEtapaAtual = () => {
        const progresso = ((perguntaAtual + 1) / totalEtapas) * 100;

        if (perguntaAtual < perguntasMatch.length) {
            const pergunta = perguntasMatch[perguntaAtual];
            return (
                <>
                    <div className="match-progresso-barra"><div className="match-progresso-preenchimento" style={{ width: `${progresso}%` }}></div></div>
                    <h3 className="match-pergunta">{pergunta.pergunta}</h3>
                    <div className="match-respostas">
                        {pergunta.respostas.map((resposta, index) => (
                            <button key={index} onClick={() => handleRespostaClick(resposta)}>{resposta.texto}</button>
                        ))}
                    </div>
                    <p className="match-progresso-texto">Passo {perguntaAtual + 1} de {totalEtapas}</p>
                </>
            );
        } else if (perguntaAtual === perguntasMatch.length) {
            const todosHorariosParaGrid = Object.entries(horariosGerais).flatMap(([dia, horas]) => horas.map(hora => ({
                key: `${dia}:${hora}`,
                display: `${formatarDia(dia)} ${hora}`
            })));

            return (
                <>
                    <div className="match-progresso-barra"><div className="match-progresso-preenchimento" style={{ width: `${progresso}%` }}></div></div>
                    <h3 className="match-pergunta">Quais dias e horários funcionam para si?</h3>
                    <p className="match-subpergunta">Selecione todas as opções que se encaixam na sua rotina. Isto ajudar-nos-á a encontrar uma especialista com agenda compatível.</p>
                    <div className="horarios-grid-container">
                        {isLoadingHorarios ? (
                            <p className="sem-horarios-texto">A carregar horários disponíveis...</p>
                        ) : todosHorariosParaGrid.length > 0 ? (
                            todosHorariosParaGrid.map(horario => (
                                <button key={horario.key} className={`botao-horario ${horariosSelecionados.includes(horario.key) ? 'selecionado' : ''}`} onClick={() => handleHorarioClick(horario.key)}>
                                    {horario.display}
                                </button>
                            ))
                        ) : (
                            <p className="sem-horarios-texto">Não foi possível carregar os horários. Pode pular esta etapa.</p>
                        )}
                    </div>
                    <div className="botoes-navegacao-horarios">
                        <button className="botao-proximo" onClick={irParaProximaEtapa}>Próxima Etapa</button>
                        <button className="botao-pular" onClick={irParaProximaEtapa}>Pular esta etapa</button>
                    </div>
                    <p className="match-progresso-texto">Passo {perguntaAtual + 1} de {totalEtapas}</p>
                </>
            );
        } else {
            return (
                <>
                    <div className="match-progresso-barra"><div className="match-progresso-preenchimento" style={{ width: '100%' }}></div></div>
                    <h3 className="match-pergunta">Descreva o seu momento com as suas palavras.</h3>
                    <p className="match-subpergunta">A nossa Inteligência Artificial analisará a sua descrição para refinar a recomendação. (Opcional)</p>
                    <textarea className="match-textarea" value={textoLivre} onChange={(e) => setTextoLivre(e.target.value)} placeholder="Ex: 'Tenho tido muitas crises de ansiedade no trabalho...'" rows="4"></textarea>
                    <button className="botao-finalizar" onClick={finalizarMatch} disabled={isLoadingMatch}>
                        {isLoadingMatch ? 'A analisar...' : 'Ver a minha especialista ideal'}
                    </button>
                    <p className="match-progresso-texto">Último passo</p>
                </>
            );
        }
    };

    return (
        <div className="match-container">
            {renderEtapaAtual()}
        </div>
    );
};

export default QuestionarioMatch;
