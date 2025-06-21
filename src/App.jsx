import React, { useState, useEffect } from 'react';
import Catalogo from './components/Catalogo.jsx';
import QuestionarioMatch from './components/QuestionarioMatch.jsx';
import CalendarIcon from './components/CalendarIcon.jsx';
import { psicologasData } from './data.js';
import logger from './utils/logger.js'; // Importa o nosso logger

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
    const [isLoadingHorarios, setIsLoadingHorarios] = useState(true);

    const numeroClinica = '5521996561994';
    const API_URL = 'https://lista-psis-api.onrender.com/api/horarios';

    useEffect(() => {
        const dadosIniciais = psicologasData.map(psi => ({ ...psi, horarios_disponiveis: {} }));
        const shuffledIniciais = [...dadosIniciais].sort(() => 0.5 - Math.random());
        setPsicologasList(shuffledIniciais);

        const fetchHorarios = async () => {
            setIsLoadingHorarios(true);
            setError(null);
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error(`A API de horários respondeu com status ${response.status}`);
                
                const horariosData = await response.json();
                if (!Array.isArray(horariosData)) throw new Error("Formato de dados da API de horários inesperado.");

                const horariosMap = horariosData.reduce((acc, curr) => {
                    if (curr.psicologa_id && curr.horarios_disponiveis) {
                        acc[curr.psicologa_id] = curr.horarios_disponiveis;
                    }
                    return acc;
                }, {});

                setPsicologasList(prevList => prevList.map(psi => ({
                    ...psi,
                    horarios_disponiveis: horariosMap[psi.id] || {}
                })));
                
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
                // LOG DE ERRO + MENSAGEM VISÍVEL
                logger.error("--- ERRO API HORÁRIOS ---", { erro: err.message });
                setError(err); // Define o erro para ser mostrado na UI
            } finally {
                setIsLoadingHorarios(false);
            }
        };

        fetchHorarios();
    }, []);
    
    // LOG DE INÍCIO DA JORNADA
    const handleStartMatch = () => {
        logger.log("--- QUESTIONÁRIO INICIADO ---");
        setIniciarMatch(true);
    };

    // LOG DE CONVERSÃO
    const handleWhatsAppResultadoClick = (psiNome) => {
        if (!horarioSelecionado && Object.keys(horariosGerais).length > 0) {
            alert('Por favor, selecione um horário para continuar o agendamento.');
            return;
        }
        logger.log("--- AGENDAMENTO INICIADO ---", { psicologa: psiNome, horario_escolhido: horarioSelecionado || "Nenhum" });
        
        const mensagemComHorario = horarioSelecionado 
            ? `Gostaria de agendar para ${horarioSelecionado}.`
            : "Gostaria de verificar os horários disponíveis.";

        const mensagem = encodeURIComponent(`Olá, fiz o questionário e a especialista ideal para mim foi a ${psiNome}. ${mensagemComHorario}`);
        window.open(`https://wa.me/${numeroClinica}?text=${mensagem}`, '_blank');
    };
    
    // As outras funções (handleMatchComplete, resetApp) continuam as mesmas
    const handleMatchComplete = (matches) => {
        setResultadoMatch(matches);
        setIniciarMatch(false);
        setHorarioSelecionado('');
    };

    const resetApp = () => {
        setIniciarMatch(false);
        setResultadoMatch([]);
        setHorarioSelecionado('');
        const shuffled = [...psicologasList].sort(() => 0.5 - Math.random());
        setPsicologasList(shuffled);
    };

    const renderContent = () => {
        if (iniciarMatch) {
            return (
                <QuestionarioMatch 
                    onMatchComplete={handleMatchComplete} 
                    horariosGerais={horariosGerais}
                    psicologas={psicologasList}
                    isLoadingHorarios={isLoadingHorarios}
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
                                <select id="horario-select" className="horario-select" value={horarioSelecionado} onChange={(e) => setHorarioSelecionado(e.target.value)} disabled={isLoadingHorarios || Object.keys(horariosGerais).length === 0}>
                                    <option value="" disabled>
                                        {isLoadingHorarios ? "A carregar..." : "Selecione um horário"}
                                    </option>
                                    {!isLoadingHorarios && Object.keys(horariosGerais).length === 0 && (
                                        <option disabled>Horários indisponíveis</option>
                                    )}
                                    {Object.entries(horariosGerais).map(([dia, horas]) => (
                                        <optgroup key={dia} label={traduzirDia(dia)}>
                                            {horas.map(hora => (<option key={`${dia}-${hora}`} value={`${traduzirDia(dia)} às ${hora}`}>{hora}</option>))}
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

        return <Catalogo psicologas={psicologasList} isLoadingHorarios={isLoadingHorarios} />;
    }

    return (
        <div className="AppContainer">
            {/* MENSAGEM DE ERRO DESTACADA PARA O UTILIZADOR */}
            {error && (
                <div className="error-banner">
                    <strong>Ops! Ocorreu um problema.</strong> 
                    <p>Não foi possível carregar os horários disponíveis no momento. Pode continuar a navegar, mas a funcionalidade de agendamento pode estar limitada.</p>
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
            {!iniciarMatch && resultadoMatch.length === 0 && (
                <div className="promo-match-container">
                    <h2>Não sabe qual profissional escolher?</h2>
                    <p>Responda a 5 perguntas rápidas e o nosso sistema inteligente encontra a especialista que mais combina com o seu momento e as suas preferências.</p>
                    <button className="botao-iniciar-match" onClick={handleStartMatch}>
                        ✨ Encontrar a minha especialista ideal
                    </button>
                </div>
            )}
            {renderContent()}
            <footer className="app-footer">
                <p>&copy; {new Date().getFullYear()} DeepSaúde. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}
