# Documentação Técnica: Gestor de Horários PSIs

## 1. Visão Geral do Projeto

O projeto "Gestor de Horários PSIs" é uma aplicação web desenvolvida em React com Vite, projetada para ajudar usuários a encontrar uma psicóloga compatível com suas necessidades e preferências. A aplicação apresenta um catálogo de psicólogas, informações detalhadas sobre cada uma, e um sistema de "match" inteligente. Este sistema utiliza um questionário e, opcionalmente, análise de texto livre por Inteligência Artificial (Google Gemini) para recomendar a profissional mais adequada. Adicionalmente, a aplicação busca e exibe os horários de atendimento dinamicamente através de uma API externa.

## 2. Estrutura do Projeto e Tecnologias

### 2.1. Estrutura de Pastas e Arquivos Principais

*   **`public/`**: Contém arquivos estáticos.
    *   `favicon.svg`: Ícone da aplicação.
    *   `psicologas_fotos/`: Armazena as imagens das psicólogas.
*   **`src/`**: Código-fonte da aplicação React.
    *   **`assets/`**: Recursos estáticos como SVGs.
    *   **`components/`**: Componentes React reutilizáveis.
        *   `App.jsx`: Componente raiz que gerencia o estado principal.
        *   `Catalogo.jsx`: Exibe a lista de todas as psicólogas.
        *   `QuestionarioMatch.jsx`: Conduz o usuário pelo quiz de match.
        *   `Horarios.jsx`: Exibe os horários de uma psicóloga.
        *   `CalendarIcon.jsx`: Ícone de calendário (SVG).
    *   **`__tests__/`**: Arquivos de teste (Vitest/React Testing Library).
    *   `data.js`: Contém dados estáticos (perfis de psicólogas, perguntas do questionário).
    *   `main.jsx`: Ponto de entrada da aplicação React.
    *   `App.css`, `index.css`: Arquivos de estilização CSS.
    *   **`utils/`**: Módulos utilitários.
        *   `logger.js`: Utilitário de logging com integração Grafana Faro.
*   `package.json`: Define metadados do projeto, scripts e dependências.
*   `vite.config.js`: Configuração do Vite e Vitest.
*   `index.html`: Ponto de entrada HTML.

### 2.2. Tecnologias e Bibliotecas

*   **Frontend:** React (v19.1.0)
*   **Build Tool:** Vite (v6.3.5)
*   **Linguagem:** JavaScript (ES6+)
*   **Estilização:** CSS
*   **Testes:** Vitest, React Testing Library, JSDOM
*   **Linting:** ESLint
*   **Logging/Monitoramento:** Grafana Faro (integrado via `src/utils/logger.js`)
*   **APIs Externas:**
    *   Horários: `https://lista-psis-api.onrender.com/api/horarios`
    *   Análise de Texto (IA): Google Gemini (`https://generativelanguage.googleapis.com/`)

## 3. Fluxo de Dados Principal

1.  **Inicialização (`App.jsx`):**
    *   Carrega dados estáticos das psicólogas de `src/data.js`.
    *   Busca horários da API externa e os mescla aos dados das psicólogas.
    *   Popula `horariosGerais` para uso no questionário.
2.  **Visualização Inicial:**
    *   Renderiza `Catalogo.jsx` com todas as psicólogas.
    *   Oferece a opção de iniciar o questionário de match.
3.  **Questionário (`QuestionarioMatch.jsx`):**
    *   Usuário responde perguntas, seleciona horários (opcional) e pode fornecer texto livre.
4.  **Processamento do Match (em `QuestionarioMatch.jsx`):**
    *   Filtra psicólogas por horário (se selecionado).
    *   Calcula scores com base nas respostas do questionário (tags e pesos).
    *   Se houver texto livre, envia para a API Gemini; tags retornadas adicionam pontos aos scores.
    *   Seleciona a psicóloga com o maior score (desempate aleatório).
5.  **Exibição do Resultado (`App.jsx`):**
    *   Mostra a psicóloga recomendada e permite agendamento via WhatsApp.
6.  **Reset:** Permite ao usuário retornar ao catálogo.

## 4. Componentes Principais e Utilitários

### 4.1. `src/App.jsx`

*   **Responsabilidade:** Orquestrador principal da aplicação. Gerencia o estado de qual tela exibir (catálogo, questionário, resultado), os dados das psicólogas, horários e os resultados do match.
*   **Estado Chave:** `psicologasList`, `iniciarMatch`, `resultadoMatch`, `horariosGerais`, `isLoadingHorarios`.
*   **Funções Importantes:**
    *   `fetchHorarios()`: Busca e processa horários da API.
    *   `handleStartMatch()`: Inicia o questionário.
    *   `handleMatchComplete()`: Recebe o resultado do `QuestionarioMatch`.
    *   `resetApp()`: Volta ao estado inicial.
    *   `renderContent()`: Decide qual componente principal renderizar.

### 4.2. `src/components/QuestionarioMatch.jsx`

*   **Responsabilidade:** Guia o usuário pelo questionário interativo, coleta respostas, horários e texto livre, e executa a lógica de match para encontrar a psicóloga mais compatível.
*   **Props Recebidas:** `onMatchComplete` (callback), `psicologas`, `horariosGerais`, `isLoadingHorarios`.
*   **Estado Chave:** `perguntaAtual`, `respostas`, `horariosSelecionados`, `textoLivre`, `isLoadingMatch`.
*   **Lógica de Match Detalhada:** Ver Seção 6.
*   **Funções Importantes:**
    *   `finalizarMatch()`: Orquestra todo o processo de cálculo de score e seleção.
    *   `analisarTextoComIA()`: Interage com a API do Gemini.
    *   `renderEtapaAtual()`: Controla a exibição das etapas do questionário.

### 4.3. `src/components/Catalogo.jsx`

*   **Responsabilidade:** Exibe a lista de todas as psicólogas em formato de cards, permitindo expansão para mais detalhes e agendamento direto.
*   **Props Recebidas:** `psicologas`, `isLoadingHorarios`.
*   **Funcionalidade:**
    *   Cards expansíveis com informações da psicóloga.
    *   Scroll suave para o card expandido.
    *   Integração com o componente `Horarios.jsx` para mostrar disponibilidade.

### 4.4. `src/components/Horarios.jsx`

*   **Responsabilidade:** Exibe os horários disponíveis de uma psicóloga específica ou mensagens de status (carregando, indisponível).
*   **Props Recebidas:** `horarios`, `isLoading`.

### 4.5. `src/utils/logger.js`

*   **Responsabilidade:** Utilitário de logging que envia logs para o console (em desenvolvimento) e para o Grafana Faro (se configurado via `VITE_GRAFANA_FARO_URL`).
*   **Métodos:** `log()`, `info()`, `warn()`, `error()`.

### 4.6. `src/components/CalendarIcon.jsx`

*   **Responsabilidade:** Componente SVG simples que renderiza um ícone de calendário.

## 5. Estrutura de Dados (`src/data.js`)

Este arquivo é crucial, pois define os perfis das psicólogas e a estrutura do questionário.

### 5.1. `psicologasData`

Array de objetos, cada um representando uma psicóloga.
*   **Campos Notáveis:**
    *   `id` (Number): Identificador único.
    *   `nome` (String): Nome da psicóloga.
    *   `fotoUrl`, `abordagem`, `bio`, `crp` (Strings): Informações do perfil.
    *   `especialidades` (Array de Strings): Para exibição.
    *   `tagsParaMatch` (Array de Strings): **Essencial para o match.** Tags padronizadas (kebab-case) que conectam com as respostas do questionário e a análise da IA.
    *   `mensagemResultado` (String): Mensagem personalizada para o resultado do match.
    *   `horariosDisponiveis` (Array de Strings): **Placeholder estático.** Os horários reais são carregados dinamicamente pela API em `App.jsx` e associados à psicóloga pelo `id`. A estrutura dinâmica é `{ dia_abreviado: ['HH:MM', ...] }`.

### 5.2. `perguntasMatch`

Array de objetos, cada um definindo uma pergunta do questionário.
*   **Campos da Pergunta:**
    *   `pergunta` (String): Texto da pergunta.
    *   `respostas` (Array de Objetos): Opções de resposta.
        *   **Campos da Resposta:**
            *   `texto` (String): Texto da opção.
            *   `tag` (String): **Link com `tagsParaMatch` das psicólogas.**
            *   `peso` (Number): Importância da resposta para o score.

**Relação `tagsParaMatch` vs `tag` da Resposta:** O match ocorre quando a `tag` de uma resposta selecionada corresponde a uma das `tagsParaMatch` da psicóloga, somando o `peso` da resposta ao score da psicóloga.

## 6. Lógica de Pontuação das PSIs (Sistema de Match)

Implementada em `QuestionarioMatch.jsx#finalizarMatch`.

1.  **Filtragem Inicial por Horários (Opcional):**
    *   Se o usuário selecionou horários, a lista de `candidatasParaMatch` é filtrada para incluir apenas psicólogas com disponibilidade correspondente.
    *   Se nenhuma psicóloga corresponder aos horários, o filtro é ignorado, e um aviso (`avisoHorario`) é ativado.

2.  **Cálculo de Score Base (Questionário):**
    *   Cada psicóloga candidata inicia com score `0`.
    *   Para cada resposta do usuário:
        *   Se a `tag` da resposta estiver nas `tagsParaMatch` da psicóloga, o `peso` da resposta é somado ao score da psicóloga.
        *   `score_psi += resposta.peso`

3.  **Pontuação Adicional (Análise de Texto Livre via IA - Gemini):**
    *   Se o usuário forneceu texto livre:
        *   O texto e uma lista de todas as `tagsParaMatch` únicas das psicólogas candidatas são enviados à API Gemini.
        *   A API retorna até 3 tags relevantes com um nível de `confianca` (0-1).
        *   Para cada tag retornada pela IA que também está nas `tagsParaMatch` de uma psicóloga:
            *   `pontosIA = Math.round(7 * (item.confianca || 0.5))`
            *   `score_psi += pontosIA`
            *   O multiplicador `7` e o fallback `0.5` para confiança são constantes definidas no código.

4.  **Seleção da Melhor Psicóloga:**
    *   Identifica-se o `maiorScore` entre todas as candidatas.
    *   **Score Zero:** Se `maiorScore` for `0`, uma psicóloga é selecionada aleatoriamente das candidatas.
    *   **Score > 0:**
        *   Cria-se uma lista `melhoresMatches` com todas as psicólogas que atingiram o `maiorScore`.
        *   **Desempate:** Uma psicóloga é selecionada aleatoriamente de `melhoresMatches`.
    *   Se `avisoHorario` estiver ativo, uma mensagem é adicionada ao resultado.

5.  **Resultado:** A psicóloga selecionada é passada para `App.jsx` via callback `onMatchComplete`.

Este sistema combina preferências explícitas do usuário com uma análise mais sutil via IA, aplicando pesos para diferentes critérios e garantindo uma seleção mesmo em casos de empate ou baixa correspondência.

## 7. Considerações Futuras e Melhorias

*   **Testes:** Expandir a cobertura de testes, especialmente para a lógica de match e interações com API.
*   **Gerenciamento de Estado:** Para aplicações maiores, considerar bibliotecas de gerenciamento de estado como Redux ou Zustand.
*   **Performance:** Otimizar a renderização de listas grandes se o número de psicólogas crescer significativamente.
*   **Error Handling:** Aprimorar o feedback ao usuário para diferentes tipos de falhas de API.
*   **Configurabilidade:** Tornar pesos e o multiplicador da IA configuráveis, talvez via variáveis de ambiente ou um painel de admin.
*   **Internacionalização (i18n):** Se aplicável, preparar a aplicação para múltiplos idiomas.
*   **Acessibilidade (a11y):** Realizar auditorias de acessibilidade e implementar melhorias.
