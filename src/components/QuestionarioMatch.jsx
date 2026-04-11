import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { perguntasMatch } from '../data.js';
import logger from '../utils/logger.js';

function formatarDia(dia) {
    const mapa = { seg: "Segunda", ter: "Terça", qua: "Quarta", qui: "Quinta", sex: "Sexta", sab: "Sábado", dom: "Domingo" };
    return mapa[dia.toLowerCase()] || dia;
}

async function analisarTextoComIA(texto, todasAsTags) {
    logger.log("--- INÍCIO ANÁLISE IA ---", { texto });
    
    const prompt = `Analise o seguinte texto de um utilizador que procura terapia: "${texto}". Com base no texto, identifique as 3 tags mais relevantes da lista abaixo. Responda APENAS com um array de objetos JSON. Cada objeto deve ter uma chave "tag" (string) e uma chave "confianca" (um número de 0 a 1). Lista de tags disponíveis: ${JSON.stringify(todasAsTags)}`;
    
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              "tag": { "type": "STRING" },
              "confianca": { "type": "NUMBER" }
            },
            required: ["tag", "confianca"]
          }
        }
      }
    };
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        logger.error("ERRO CRÍTICO: Variável de ambiente VITE_GEMINI_API_KEY não encontrada.");
        return [];
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`Erro na API Gemini: ${response.status}`, { errorBody });
        throw new Error(`Erro na API Gemini: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();
    
    if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
        const text = result.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(text);
        logger.log("--- SUCESSO ANÁLISE IA ---", { resultado: parsedJson });
        return parsedJson;
    } else {
        logger.warn("Resposta da API Gemini bem-sucedida, mas sem conteúdo esperado.", { apiResponse: result });
        return [];
    }
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
        logger.log("--- INÍCIO DO MATCH ---", { num_respostas: respostas.length, num_horarios: horariosSelecionados.length, tem_texto: textoLivre.trim().length > 0 });

        let candidatasParaMatch;
        let avisoHorario = false;

        if (horariosSelecionados.length > 0) {
            const psicologasDisponiveis = psicologas.filter(psi => 
                horariosSelecionados.some(horarioKey => {
                    const [dia, ...horaParts] = horarioKey.split(':');
                    const hora = horaParts.join(':');
                    
                    return psi.horarios_disponiveis && psi.horarios_disponiveis[dia]?.includes(hora);
                })
            );

            if (psicologasDisponiveis.length > 0) {
                candidatasParaMatch = psicologasDisponiveis;
                logger.log("Filtro de horário aplicado. Candidatas reduzidas para:", { count: candidatasParaMatch.length });
            } else {
                candidatasParaMatch = psicologas;
                avisoHorario = true;
                logger.warn("Nenhuma psicóloga encontrada com os horários selecionados. Usando lista completa como fallback.");
            }
        } else {
            candidatasParaMatch = psicologas;
        }

        const scores = candidatasParaMatch.reduce((acc, psi) => ({ ...acc, [psi.id]: 0 }), {});

        respostas.forEach(resposta => {
            candidatasParaMatch.forEach(psi => {
                if (psi.tagsParaMatch.includes(resposta.tag)) {
                    scores[psi.id] += resposta.peso;
                }
            });
        });

        if (textoLivre.trim().length > 0) {
            const tagsParaIA = [...new Set(candidatasParaMatch.flatMap(p => p.tagsParaMatch))];
            try {
                const startTime = performance.now();
                const tagsFromAI = await analisarTextoComIA(textoLivre, tagsParaIA);
                const endTime = performance.now();
                const duration = Math.round(endTime - startTime);
                
                logger.log("--- Performance Análise IA ---", { duration_ms: duration });

                tagsFromAI.forEach(item => {
                    candidatasParaMatch.forEach(psi => {
                        if (psi.tagsParaMatch.includes(item.tag)) {
                            const pontosIA = Math.round(7 * (item.confianca || 0.5));
                            scores[psi.id] += pontosIA;
                        }
                    });
                });
            } catch (error) {
                logger.error("Falha ao adicionar pontos da IA", { error: error.message });
            }
        }
        
        const maiorScore = Math.max(...Object.values(scores), 0);

        if (maiorScore === 0) {
            const shuffled = [...candidatasParaMatch].sort(() => 0.5 - Math.random());
            const resultadoFinal = shuffled.slice(0, 1);
            if (resultadoFinal.length > 0) {
               logger.log("--- FIM DO MATCH (Score Zero) ---", { resultado: resultadoFinal[0]?.nome });
               onMatchComplete(resultadoFinal);
            } else {
               logger.error("--- FIM DO MATCH (Falha) ---", { erro: "Nenhuma psicóloga encontrada após filtros e score zero." });
               onMatchComplete([]);
            }
            setIsLoadingMatch(false);
            return;
        }

        let melhoresMatches = candidatasParaMatch.filter(psi => scores[psi.id] === maiorScore);
        
        if (melhoresMatches.length === 0) {
            logger.error("--- FIM DO MATCH (Falha) ---", { erro: "Nenhuma psicóloga encontrada com o maior score.", score: maiorScore });
            onMatchComplete([]);
            setIsLoadingMatch(false);
            return;
        }

        let melhorMatch = melhoresMatches[Math.floor(Math.random() * melhoresMatches.length)];

        if (avisoHorario) {
            melhorMatch = {
                ...melhorMatch,
                mensagemResultado: (melhorMatch.mensagemResultado || "Esta é a melhor combinação para si.") + " (Aviso: não encontrámos uma especialista com os horários que selecionou, mas esta é a melhor combinação para as suas outras necessidades.)"
            };
        }
        
        logger.log("--- FIM DO MATCH (Sucesso) ---", { resultado: melhorMatch.nome, score: maiorScore, aviso_horario: avisoHorario });

        setIsLoadingMatch(false);
        onMatchComplete([melhorMatch]);
    };

    const renderEtapaAtual = () => {
        const progresso = ((perguntaAtual + 1) / totalEtapas) * 100;

        return (
            <div className="match-questionnaire-inner">
                <div className="match-progresso-barra">
                    <motion.div 
                        className="match-progresso-preenchimento" 
                        initial={{ width: 0 }}
                        animate={{ width: `${progresso}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={perguntaAtual}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="match-step-content"
                    >
                        {perguntaAtual < perguntasMatch.length ? (
                            <>
                                <h3 className="match-pergunta">{perguntasMatch[perguntaAtual].pergunta}</h3>
                                <div className="match-respostas">
                                    {perguntasMatch[perguntaAtual].respostas.map((resposta, index) => (
                                        <motion.button 
                                            key={index} 
                                            whileHover={{ scale: 1.02, translateX: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleRespostaClick(resposta)}
                                        >
                                            {resposta.texto}
                                        </motion.button>
                                    ))}
                                </div>
                                <p className="match-progresso-texto">Passo {perguntaAtual + 1} de {totalEtapas}</p>
                            </>
                        ) : perguntaAtual === perguntasMatch.length ? (
                            <>
                                <h3 className="match-pergunta">Quais dias e horários você tem disponivel?</h3>
                                <p className="match-subpergunta">Selecione todas as opções que se encaixam na sua rotina. Isto nos ajuda a encontrar uma especialista com agenda compatível.</p>
                                
                                <div className="dias-container">
                                    {isLoadingHorarios ? (
                                        <p className="sem-horarios-texto">A carregar horários disponíveis...</p>
                                    ) : (
                                        ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']
                                            .filter(dia => horariosGerais[dia] && horariosGerais[dia].length > 0)
                                            .map(dia => (
                                                <div key={dia} className="dia-horarios-grupo">
                                                    <h4>{formatarDia(dia)}</h4>
                                                    <div className="horarios-grid">
                                                        {horariosGerais[dia].sort().map(hora => {
                                                            const horarioKey = `${dia}:${hora}`;
                                                            return (
                                                                <motion.button 
                                                                    key={horarioKey} 
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    className={`botao-horario ${horariosSelecionados.includes(horarioKey) ? 'selecionado' : ''}`} 
                                                                    onClick={() => handleHorarioClick(horarioKey)}
                                                                >
                                                                    {hora}
                                                                </motion.button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>

                                <div className="botoes-navegacao-horarios">
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="botao-proximo" 
                                        onClick={irParaProximaEtapa}
                                    >
                                        Próxima Etapa
                                    </motion.button>
                                    <button className="botao-pular" onClick={irParaProximaEtapa}>Pular esta etapa</button>
                                </div>
                                <p className="match-progresso-texto">Passo {perguntaAtual + 1} de {totalEtapas}</p>
                            </>
                        ) : (
                            <>
                                <h3 className="match-pergunta">Descreva o seu momento com as suas palavras.</h3>
                                <p className="match-subpergunta">A nossa Inteligência Artificial analisará a sua descrição para refinar a recomendação. (Opcional)</p>
                                <textarea className="match-textarea" value={textoLivre} onChange={(e) => setTextoLivre(e.target.value)} placeholder="Ex: 'Tenho tido muitas crises de ansiedade no trabalho...'" rows="4"></textarea>
                                <motion.button 
                                    whileHover={!isLoadingMatch ? { scale: 1.05 } : {}}
                                    whileTap={!isLoadingMatch ? { scale: 0.95 } : {}}
                                    className="botao-finalizar" 
                                    onClick={finalizarMatch} 
                                    disabled={isLoadingMatch}
                                >
                                    {isLoadingMatch ? 'A analisar...' : 'Ver a minha especialista ideal'}
                                </motion.button>
                                <p className="match-progresso-texto">Último passo</p>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="match-container">
            {renderEtapaAtual()}
        </div>
    );
};

export default QuestionarioMatch;
