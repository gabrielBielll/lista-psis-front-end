// src/components/Horarios.jsx

import React from 'react';

// Função para traduzir os dias da semana, como na sua documentação
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

const Horarios = ({ horarios }) => {
    // Verifica se o objeto de horários existe e tem chaves
    if (!horarios || Object.keys(horarios).length === 0) {
        return <p className="sem-horarios-texto">Nenhum horário disponível no momento.</p>;
    }

    const diasComHorarios = Object.entries(horarios).filter(([dia, lista]) => lista.length > 0);

    if (diasComHorarios.length === 0) {
        return <p className="sem-horarios-texto">Nenhum horário disponível no momento.</p>;
    }
    
    return (
        <div className="horarios-container">
            <h4>Horários Disponíveis:</h4>
            <ul className="horarios-lista">
                {diasComHorarios.map(([dia, lista]) => (
                    <li key={dia}>
                        <span className="dia">{traduzirDia(dia)}:</span> {lista.join(', ')}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Horarios;
