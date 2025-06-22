# Guia do Projeto: Lista de Psicólogas Front-End

Este documento serve como um guia para entender a estrutura, funcionamento e como realizar modificações no projeto "Lista de Psicólogas Front-End". O objetivo é facilitar a manutenção e a colaboração, especialmente ao utilizar assistentes de IA para edições de código.

## 1. Arquitetura Geral

### 1.1. Stack Tecnológica

*   **React (v19.1.0):** Biblioteca JavaScript para construção de interfaces de usuário.
*   **Vite (v6.3.5):** Ferramenta de build e servidor de desenvolvimento rápido para projetos web modernos.
*   **JavaScript (ES Modules):** Linguagem principal do projeto.
*   **CSS:** Para estilização dos componentes.
*   **Vitest (v3.2.4):** Framework de testes unitários e de integração, compatível com a API do Jest.
*   **ESLint (v9.25.0):** Ferramenta para identificar e reportar padrões problemáticos no código JavaScript.

### 1.2. Organização de Pastas e Arquivos

```
.
├── public/                     # Arquivos estáticos (imagens, favicon)
│   ├── psicologas_fotos/       # Fotos das psicólogas
│   └── ...
├── src/                        # Código fonte da aplicação
│   ├── __tests__/              # Testes unitários e de integração
│   │   ├── App.test.jsx
│   │   ├── QuestionarioMatch.test.jsx
│   │   └── setup.js            # Configuração para Vitest (jsdom)
│   ├── assets/                 # Assets como SVGs (ex: logo React)
│   ├── components/             # Componentes React reutilizáveis
│   │   ├── CalendarIcon.jsx
│   │   ├── Catalogo.jsx
│   │   ├── Horarios.jsx
│   │   └── QuestionarioMatch.jsx
│   ├── utils/                  # Utilitários (ex: logger)
│   │   └── logger.js
│   ├── App.css                 # Estilos globais para App.jsx
│   ├── App.jsx                 # Componente principal da aplicação
│   ├── data.js                 # Dados estáticos (psicólogas, perguntas do questionário)
│   ├── index.css               # Estilos globais de base
│   └── main.jsx                # Ponto de entrada da aplicação React
├── .gitignore                  # Arquivos ignorados pelo Git
├── eslint.config.js            # Configuração do ESLint
├── index.html                  # Arquivo HTML principal
├── package-lock.json           # Lockfile de dependências do npm
├── package.json                # Metadados do projeto e dependências
├── PROJECT_GUIDE.md            # Este documento
├── README.md                   # Informações gerais do projeto (gerado pelo Vite)
└── vite.config.js              # Configuração do Vite (build, dev server, testes)
```

### 1.3. Comunicação entre Componentes

A comunicação entre componentes é feita primariamente através de:

*   **Props (Propriedades):** Dados são passados de componentes pais para componentes filhos. Por exemplo, `App.jsx` passa a lista de psicólogas para `Catalogo.jsx`.
*   **State (Estado):** Componentes gerenciam seu próprio estado interno usando `useState`. O estado global da aplicação (como a lista de psicólogas, o estado do questionário, resultados do match) é gerenciado principalmente no componente `App.jsx`.
*   **Callbacks:** Funções são passadas como props para componentes filhos, permitindo que os filhos comuniquem eventos ou dados de volta para os pais. Por exemplo, `QuestionarioMatch.jsx` chama `onMatchComplete` (uma prop recebida de `App.jsx`) quando o questionário é finalizado.
*   **Refs (Referências):** Usado para interagir diretamente com elementos do DOM, como no `Catalogo.jsx` para scroll suave ao expandir um card, e no `App.jsx` para scroll suave até a seção de resultados do match.

### 1.4. Fluxo de Dados Geral

1.  **Inicialização:**
    *   `main.jsx` renderiza `App.jsx`.
    *   `App.jsx` inicializa seu estado:
        *   Carrega `psicologasData` de `src/data.js`.
        *   Inicia uma requisição assíncrona para a API de horários (`https://lista-psis-api.onrender.com/api/horarios`).
        *   Os dados das psicólogas são embaralhados para exibição inicial.
2.  **Exibição do Catálogo:**
    *   `App.jsx` passa a `psicologasList` (com horários atualizados após a resposta da API) para `Catalogo.jsx`.
    *   `Catalogo.jsx` renderiza os cards das psicólogas.
3.  **Questionário de Match:**
    *   Se o usuário inicia o match, `App.jsx` renderiza `QuestionarioMatch.jsx`.
    *   `QuestionarioMatch.jsx` gerencia o estado das respostas, seleção de horários e texto livre.
    *   Para o texto livre, ele chama a API Gemini (configurada via `VITE_GEMINI_API_KEY`) para análise.
    *   Ao finalizar, chama `onMatchComplete` com a psicóloga recomendada.
4.  **Resultado do Match:**
    *   `App.jsx` atualiza seu estado com o resultado e renderiza o card da psicóloga correspondente.
5.  **Interações:**
    *   Cliques em botões de agendamento abrem o WhatsApp.
    *   A seleção de horários no resultado do match atualiza o estado `horarioSelecionado` em `App.jsx`.

---

## 2. Componentes Principais

Esta seção detalha os componentes React mais importantes da aplicação.

### 2.1. `App.jsx`

*   **Responsabilidade:** Componente raiz da aplicação. Gerencia o estado global, o roteamento entre visualizações (catálogo, questionário, resultado do match) e a lógica de busca de dados da API de horários.
*   **Props Recebidas:** Nenhuma.
*   **Estado Interno Principal:**
    *   `psicologasList`: Array com os dados das psicólogas, incluindo seus horários (atualizados pela API).
    *   `iniciarMatch`: Booleano que controla a exibição do questionário.
    *   `resultadoMatch`: Array contendo a psicóloga que deu "match" (ou vazio).
    *   `horariosGerais`: Objeto com todos os horários disponíveis agregados de todas as psicólogas, usado no filtro do questionário.
    *   `horarioSelecionado`: String do horário escolhido na tela de resultado do match.
    *   `error`: Objeto de erro caso a API de horários falhe.
    *   `isLoadingHorarios`: Booleano para indicar o carregamento dos horários.
*   **Eventos e Funções Chave:**
    *   `useEffect` (inicial): Busca os dados das psicólogas e os horários da API.
    *   `useEffect` (scroll): Faz scroll suave para a seção de resultados quando `resultadoMatch` é preenchido.
    *   `handleStartMatch`: Define `iniciarMatch` para `true`.
    *   `handleWhatsAppResultadoClick`: Abre o WhatsApp com mensagem para agendamento a partir do resultado do match.
    *   `handleMatchComplete`: Callback chamada por `QuestionarioMatch.jsx` para atualizar `resultadoMatch`.
    *   `resetApp`: Reseta o estado para voltar à visualização do catálogo.
    *   `renderContent`: Lógica condicional para renderizar `Catalogo.jsx`, `QuestionarioMatch.jsx` ou a seção de resultado do match.
*   **Interação com Serviços Externos:**
    *   Consome a API de horários (`https://lista-psis-api.onrender.com/api/horarios`).

### 2.2. `src/components/Catalogo.jsx`

*   **Responsabilidade:** Exibir a lista de psicólogas em formato de cards. Permite expandir cards para ver mais detalhes (incluindo horários específicos) e iniciar agendamento via WhatsApp.
*   **Props Recebidas:**
    *   `psicologas`: Array de objetos, cada um representando uma psicóloga com seus dados.
    *   `isLoadingHorarios`: Booleano que indica se os horários ainda estão sendo carregados.
*   **Estado Interno Principal:**
    *   `expandedCardId`: ID da psicóloga cujo card está expandido (ou `null`).
*   **Eventos e Funções Chave:**
    *   `handleWhatsAppClick`: Abre o WhatsApp com mensagem para agendamento com a psicóloga selecionada.
    *   `handleToggleExpand`: Alterna a expansão do card da psicóloga e faz scroll suave para o card.
*   **Interação com Serviços Externos:** Nenhuma direta (indireta via `App.jsx` para horários).

### 2.3. `src/components/QuestionarioMatch.jsx`

*   **Responsabilidade:** Conduzir o usuário através de um questionário para encontrar a psicóloga ideal. Coleta respostas, preferências de horário e um texto livre para análise por IA.
*   **Props Recebidas:**
    *   `onMatchComplete`: Callback chamada ao finalizar o questionário, passando a psicóloga que deu "match".
    *   `psicologas`: Array com todas as psicólogas (usado para filtrar por horário e para o match).
    *   `horariosGerais`: Objeto com todos os horários disponíveis para o filtro de horários.
    *   `isLoadingHorarios`: Booleano para a etapa de seleção de horários.
*   **Estado Interno Principal:**
    *   `perguntaAtual`: Índice da pergunta atual ou etapa do questionário.
    *   `respostas`: Array com as respostas selecionadas pelo usuário.
    *   `horariosSelecionados`: Array com os horários preferenciais selecionados.
    *   `textoLivre`: String com o texto inserido pelo usuário.
    *   `isLoadingMatch`: Booleano para indicar que o match está sendo processado.
*   **Eventos e Funções Chave:**
    *   `handleRespostaClick`: Avança para a próxima pergunta e armazena a resposta.
    *   `handleHorarioClick`: Adiciona/remove um horário da seleção.
    *   `irParaProximaEtapa`: Avança para a próxima etapa do questionário (de perguntas para horários, de horários para texto livre).
    *   `finalizarMatch`:
        *   Filtra psicólogas com base nos horários selecionados (se houver).
        *   Calcula scores para cada psicóloga com base nas `tagsParaMatch` e pesos das respostas.
        *   Se houver `textoLivre`, chama `analisarTextoComIA` para obter tags adicionais e seus pesos.
        *   Determina a psicóloga com maior score (com desempate aleatório).
        *   Chama `onMatchComplete` com a psicóloga resultante.
    *   `analisarTextoComIA`: Função assíncrona que envia o `textoLivre` para a API Gemini e processa a resposta.
*   **Interação com Serviços Externos:**
    *   Consome a API Gemini (`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`) para análise de texto. A chave da API (`VITE_GEMINI_API_KEY`) é acessada via `import.meta.env`.

### 2.4. `src/components/Horarios.jsx`

*   **Responsabilidade:** Exibir os horários disponíveis de uma psicóloga específica.
*   **Props Recebidas:**
    *   `horarios`: Objeto onde as chaves são os dias da semana (ex: "seg", "ter") e os valores são arrays de strings de horários (ex: `["10:00", "14:00"]`).
    *   `isLoading`: Booleano que indica se os horários ainda estão sendo carregados.
*   **Estado Interno Principal:** Nenhum.
*   **Eventos e Funções Chave:** Nenhuma lógica complexa, apenas renderização dos horários.
*   **Interação com Serviços Externos:** Nenhuma.

### 2.5. `src/components/CalendarIcon.jsx`

*   **Responsabilidade:** Renderizar um ícone de calendário (SVG).
*   **Props Recebidas:** Nenhuma.
*   **Estado Interno Principal:** Nenhum.
*   **Interação com Serviços Externos:** Nenhuma.

---
*Esta seção documenta os componentes principais do projeto.*

## 3. Dados e Gerenciamento de Estado

### 3.1. `src/data.js`

Este arquivo é crucial pois centraliza dados estáticos da aplicação:

*   **`psicologasData`**: Array de objetos. Cada objeto representa uma psicóloga e contém:
    *   `id`: (Number) Identificador único.
    *   `nome`: (String) Nome completo.
    *   `fotoUrl`: (String) Caminho para a foto da psicóloga.
    *   `abordagem`: (String) Principal abordagem terapêutica.
    *   `bio`: (String) Biografia detalhada.
    *   `especialidades`: (Array de Strings) Lista de especialidades.
    *   `tagsParaMatch`: (Array de Strings) Tags usadas internamente para o algoritmo de match. Devem ser curtas, em minúsculas e usar hífen para espaços.
    *   `crp`: (String) Número do CRP.
    *   `horariosDisponiveis`: (Array de Strings - *inicialmente, mas é sobrescrito pela API*) Exemplo de horários. **Nota:** No `App.jsx`, a propriedade `horarios_disponiveis` (com underscore) de cada psicóloga é populada com os dados da API, que segue um formato de objeto: `{ dia: [hora1, hora2], ... }` (ex: `{ seg: ["10:00", "11:00"], ter: ["14:00"] }`).
    *   `mensagemResultado`: (String) Mensagem personalizada exibida quando esta psicóloga é o resultado do match.

*   **`perguntasMatch`**: Array de objetos. Cada objeto representa uma pergunta no questionário de match:
    *   `pergunta`: (String) O texto da pergunta.
    *   `respostas`: Array de objetos, onde cada objeto é uma opção de resposta:
        *   `texto`: (String) O texto da opção de resposta.
        *   `tag`: (String) A tag associada a esta resposta, que deve corresponder a uma ou mais `tagsParaMatch` das psicólogas.
        *   `peso`: (Number) O peso/pontuação que esta resposta atribui à tag correspondente no cálculo do match.

### 3.2. Estado da Aplicação (`App.jsx`)

O componente `App.jsx` é o principal gerenciador de estado da aplicação. Os estados mais importantes incluem:

*   **`psicologasList`**: Mantém a lista completa de psicólogas, enriquecida com os `horarios_disponiveis` obtidos da API. É a fonte de dados para o `Catalogo.jsx` e para a lógica de match no `QuestionarioMatch.jsx`.
*   **`iniciarMatch`**: Controla a visibilidade do componente `QuestionarioMatch.jsx`.
*   **`resultadoMatch`**: Armazena a psicóloga (ou um array com uma psicóloga) que foi selecionada como o melhor "match" após o questionário. Controla a exibição da seção de resultado.
*   **`horariosGerais`**: Um objeto que agrega todos os horários únicos de todas as psicólogas, no formato `{ dia: Set(hora1, hora2), ... }` e depois convertido para `{ dia: [hora1, hora2 (ordenado)], ... }`. Usado para popular as opções de filtro de horário no `QuestionarioMatch.jsx`.
*   **`horarioSelecionado`**: Armazena o horário específico que o usuário seleciona na tela de resultado do match, para ser incluído na mensagem do WhatsApp.
*   **`error`**: Guarda informações de erro caso a chamada à API de horários falhe, permitindo exibir uma mensagem ao usuário.
*   **`isLoadingHorarios`**: Indica se os horários ainda estão sendo carregados da API, útil para mostrar feedback de carregamento.

### 3.3. Formato dos Dados da API de Horários

A API de horários (`https://lista-psis-api.onrender.com/api/horarios`) é esperada para retornar um array de objetos, onde cada objeto representa os horários de uma psicóloga:

```json
[
  {
    "psicologa_id": 1, // Corresponde ao 'id' em psicologasData
    "horarios_disponiveis": {
      "seg": ["10:00", "11:00", "14:00"],
      "ter": ["09:00"],
      "qua": [], // Dia sem horários
      "qui": ["15:00", "16:00"],
      "sex": ["10:00"]
      // "sab" e "dom" podem ser omitidos se não houver horários
    }
  },
  {
    "psicologa_id": 2,
    "horarios_disponiveis": {
      // ... horários para psicóloga 2
    }
  }
  // ... mais psicólogas
]
```

*   `psicologa_id`: (Number) Deve corresponder ao `id` da psicóloga em `psicologasData`.
*   `horarios_disponiveis`: (Object) Um objeto onde cada chave é uma abreviação do dia da semana (`seg`, `ter`, `qua`, `qui`, `sex`, `sab`, `dom`) e o valor é um array de strings representando os horários disponíveis nesse dia (formato "HH:MM").

Esta estrutura é então mesclada com os dados de `psicologasData` no estado `psicologasList` em `App.jsx`.

---
*Esta seção documenta os dados da aplicação e como o estado é gerenciado.*

## 4. Lógica de Negócio Crítica

### 4.1. Algoritmo de "Match" (`QuestionarioMatch.jsx`)

A lógica para encontrar a psicóloga ideal para o usuário reside principalmente na função `finalizarMatch` dentro do componente `QuestionarioMatch.jsx`. O processo é o seguinte:

1.  **Filtragem Inicial por Horários (Opcional):**
    *   Se o usuário selecionou horários preferenciais (`horariosSelecionados`), o sistema primeiro filtra a lista de `psicologas` para incluir apenas aquelas que têm disponibilidade em pelo menos um dos horários escolhidos.
    *   A verificação é feita comparando os `horariosSelecionados` (no formato `dia:hora`) com a estrutura `horarios_disponiveis[dia]` de cada psicóloga.
    *   Se nenhuma psicóloga atender aos critérios de horário, um aviso (`avisoHorario`) é definido, e o match prossegue com a lista original de psicólogas, mas o resultado final incluirá uma observação sobre a indisponibilidade de horário.

2.  **Cálculo de Pontuação (Scores):**
    *   Um objeto `scores` é inicializado, com cada ID de psicóloga (da lista de candidatas, possivelmente filtrada por horário) começando com 0 pontos.
    *   **Respostas do Questionário:** Para cada resposta fornecida pelo usuário (`respostas` do estado):
        *   A `tag` e o `peso` da resposta são considerados.
        *   Para cada psicóloga candidata, se a sua lista de `tagsParaMatch` (de `src/data.js`) incluir a `tag` da resposta, o `peso` correspondente é somado ao score daquela psicóloga.
    *   **Análise de Texto Livre com IA Gemini (Opcional):**
        *   Se o usuário forneceu um `textoLivre`:
            *   Uma lista única de todas as `tagsParaMatch` das psicólogas candidatas é compilada.
            *   A função `analisarTextoComIA` é chamada com o `textoLivre` e essa lista de tags.
            *   **`analisarTextoComIA`:**
                *   Constrói um prompt para a API Gemini, pedindo para identificar as 3 tags mais relevantes da lista fornecida, com base no texto do usuário, e retornar um array de objetos JSON `{ "tag": "string", "confianca": numero }`.
                *   Envia a requisição para a API Gemini (endpoint `gemini-2.0-flash:generateContent`). A chave da API `VITE_GEMINI_API_KEY` é crucial aqui.
                *   Processa a resposta JSON da API.
            *   As tags retornadas pela IA (com seus níveis de `confianca`) são usadas para adicionar pontos aos scores:
                *   Para cada tag retornada pela IA, se ela estiver presente nas `tagsParaMatch` de uma psicóloga, são adicionados `Math.round(7 * (item.confianca || 0.5))` pontos ao score dessa psicóloga. O multiplicador `7` é um fator de ponderação para a contribuição da IA.
        *   Erros na chamada da API Gemini são registrados, e o processo de match continua sem essa pontuação adicional.

3.  **Determinação do Melhor Match:**
    *   O `maiorScore` entre todas as psicólogas candidatas é identificado.
    *   **Caso de Score Zero:** Se o `maiorScore` for 0 (nenhuma tag correspondeu), uma psicóloga é escolhida aleatoriamente da lista de candidatas (possivelmente filtrada por horário) como resultado.
    *   **Caso de Scores Positivos:**
        *   Todas as psicólogas que atingiram o `maiorScore` são consideradas `melhoresMatches`.
        *   Uma psicóloga é escolhida aleatoriamente dentre as `melhoresMatches` para garantir variedade caso haja empates.
    *   Se o `avisoHorario` estiver ativo (usuário selecionou horários, mas nenhuma psicóloga os atendia perfeitamente), uma mensagem adicional é concatenada à `mensagemResultado` da psicóloga escolhida.

4.  **Finalização:**
    *   A função `onMatchComplete` (prop de `App.jsx`) é chamada com um array contendo a psicóloga selecionada.
    *   O estado `isLoadingMatch` é definido como `false`.

### 4.2. Lógica de Busca e Exibição de Horários (`App.jsx`)

1.  **Busca Inicial:**
    *   No `useEffect` de inicialização do `App.jsx`, a função `fetchHorarios` é chamada.
    *   Ela faz uma requisição `fetch` para a `API_URL` (`https://lista-psis-api.onrender.com/api/horarios`).
    *   Trata possíveis erros de rede ou respostas não-OK da API, atualizando o estado `error`.
2.  **Processamento dos Dados de Horários:**
    *   A resposta da API (esperada como um array de objetos, conforme descrito na Seção 3.3) é processada:
        *   Um `horariosMap` é criado para facilitar o acesso aos horários por `psicologa_id`.
        *   A lista `psicologasList` no estado é atualizada: para cada psicóloga, sua propriedade `horarios_disponiveis` é preenchida com os dados correspondentes do `horariosMap`. Se uma psicóloga não tiver entrada na API, seus `horarios_disponiveis` permanecem como um objeto vazio.
        *   O estado `horariosGerais` é populado:
            *   Itera sobre todos os horários de todas as psicólogas.
            *   Para cada dia da semana, cria um `Set` de horários para garantir unicidade.
            *   Converte os `Set`s de volta para arrays ordenados de horários.
3.  **Exibição:**
    *   **Catálogo (`Catalogo.jsx` -> `Horarios.jsx`):**
        *   `Catalogo.jsx` passa `psi.horarios_disponiveis` (que veio de `App.jsx` após processamento da API) para o componente `Horarios.jsx` quando um card é expandido.
        *   `Horarios.jsx` renderiza os dias e horários recebidos.
    *   **Filtro do Questionário (`QuestionarioMatch.jsx`):**
        *   `App.jsx` passa `horariosGerais` para `QuestionarioMatch.jsx`.
        *   Na etapa de seleção de horários, `QuestionarioMatch.jsx` usa `horariosGerais` para renderizar os botões de seleção de dia/hora.
    *   **Resultado do Match (`App.jsx`):**
        *   Quando um resultado de match é exibido, o dropdown de seleção de horário é populado com os `horarios_disponiveis` da psicóloga específica que deu match (`matchedPsi.horarios_disponiveis`). A função `traduzirDia` é usada para formatar os nomes dos dias.

---
*Esta seção documenta as lógicas de negócio mais complexas e cruciais da aplicação.*

## 5. Configuração, Build e Testes

### 5.1. Requisitos

*   Node.js (versão que suporte as dependências do `package.json`, ex: >=18.x)
*   npm (geralmente vem com o Node.js)

### 5.2. Instalação de Dependências

Para instalar todas as dependências do projeto, navegue até a raiz do projeto no terminal e execute:

```bash
npm install
```

### 5.3. Rodar em Ambiente de Desenvolvimento

Para iniciar o servidor de desenvolvimento Vite (com Hot Module Replacement - HMR):

```bash
npm run dev
```

A aplicação estará normalmente disponível em `http://localhost:5173` (a porta pode variar se a 5173 estiver em uso).

### 5.4. Build para Produção

Para gerar os arquivos estáticos otimizados para produção:

```bash
npm run build
```

Os arquivos resultantes estarão na pasta `dist/`. Estes são os arquivos que devem ser implantados em um servidor web. O projeto também inclui um script `start` que usa `serve` para servir a pasta `dist` (útil para testar o build localmente ou para implantações simples):

```bash
npm start # Serve o conteúdo da pasta 'dist'
```

### 5.5. Rodar Testes

O projeto utiliza Vitest para testes. Para executar todos os testes:

```bash
npm run test
```

Para executar os testes e gerar um relatório de cobertura de código:

```bash
npm run coverage
```

Os arquivos de teste estão localizados em `src/__tests__/` e seguem o padrão `*.test.jsx`. A configuração dos testes (como o ambiente `jsdom` e arquivos de setup) está em `vite.config.js` e `src/__tests__/setup.js`.

### 5.6. Linting

Para verificar o código com ESLint:

```bash
npm run lint
```

A configuração do ESLint está em `eslint.config.js`.

### 5.7. Variáveis de Ambiente

A aplicação utiliza uma variável de ambiente principal:

*   **`VITE_GEMINI_API_KEY`**: Chave da API para o serviço Google Gemini AI.
    *   **Para desenvolvimento:** Pode ser definida em um arquivo `.env` na raiz do projeto. Exemplo de conteúdo para `.env`:
        ```
        VITE_GEMINI_API_KEY=sua_chave_api_aqui
        ```
        **Importante:** Adicione `.env` ao seu arquivo `.gitignore` para não commitar chaves secretas.
    *   **Para testes:** Em `vite.config.js`, uma chave mock (`test-api-key-gemini`) é definida para o ambiente de teste, garantindo que os testes não dependam de uma chave real.
    *   **Para produção:** A variável de ambiente deve ser configurada no ambiente de build/hospedagem (ex: Vercel, Netlify, Docker, etc.).

O prefixo `VITE_` é importante para que o Vite exponha a variável de ambiente para o código do cliente através de `import.meta.env.VITE_GEMINI_API_KEY`.

---
*Esta seção detalha como configurar, construir e testar o projeto.*

## 6. Guia para Edição com Assistentes de IA

Este guia tem como objetivo orientar assistentes de IA (como você!) a realizar modificações no código deste projeto de forma eficaz e segura, minimizando a chance de quebrar funcionalidades existentes.

### 6.1. Princípios Gerais ao Editar

1.  **Contexto é Tudo:** Sempre utilize este documento (`PROJECT_GUIDE.md`) em conjunto com o arquivo de código específico que você está editando. Este guia fornece o mapa, o código é o território.
2.  **Modificações Cirúrgicas:** Prefira alterações pequenas e localizadas. Evite refatorações extensas ou mudanças de arquitetura, a menos que explicitamente solicitado e compreendendo completamente as implicações (descritas neste guia).
3.  **Respeite a Estrutura:**
    *   Mantenha a organização de pastas e arquivos existente.
    *   Siga os padrões de nomenclatura e estilo de código (o ESLint ajuda aqui - `npm run lint`).
4.  **Fluxo de Dados:** Preste muita atenção em como os dados fluem através dos componentes (props) e como o estado é gerenciado (principalmente em `App.jsx`). Alterações em um componente podem impactar outros.
5.  **Imutabilidade:** Ao manipular o estado (especialmente arrays e objetos), siga os princípios da imutabilidade. Crie novas instâncias em vez de modificar as existentes diretamente (ex: usando `[...array, novoItem]` ou `{...objeto, chaveModificada: valor}`).
6.  **Testes:** Se o projeto tiver testes (`src/__tests__/`), eles são seus amigos.
    *   Após modificações significativas, o ideal é rodar `npm run test`.
    *   Se você adicionar uma nova funcionalidade, idealmente, novos testes deveriam ser criados. Se você modificar uma existente, os testes podem precisar de atualização.

### 6.2. Como Editar Componentes Específicos e Lógicas

#### 6.2.1. Adicionar/Modificar Informações Visuais nos Cards de Psicólogas

*   **Localização:**
    *   Para o catálogo geral: `src/components/Catalogo.jsx`.
    *   Para o card de resultado do match: `src/App.jsx` (dentro da função `renderContent`, na seção `if (resultadoMatch.length > 0)`).
*   **Fonte dos Dados:**
    *   As informações das psicólogas vêm de `psicologasData` em `src/data.js`.
    *   Os horários vêm da API e são mesclados em `psicologasList` no estado de `App.jsx`.
*   **Instruções:**
    *   **Passo 1:** Se a nova informação não existe em `psicologasData`, adicione-a lá primeiro, mantendo a estrutura do objeto de cada psicóloga.
    *   **Passo 2:** Certifique-se de que a prop necessária está sendo passada para `Catalogo.jsx` a partir de `App.jsx` (geralmente já estará se for parte do objeto `psi`).
    *   **Passo 3:** No JSX do componente (`Catalogo.jsx` ou `App.jsx`), adicione os novos elementos HTML/React para exibir a informação. Use as classes CSS existentes para manter a consistência visual ou adicione novos estilos de forma organizada em `App.css` ou `index.css`.

#### 6.2.2. Alterar Perguntas, Respostas ou Lógica de Pontuação do Questionário

*   **Localização:**
    *   Definição das perguntas e respostas: `src/data.js` (array `perguntasMatch`).
    *   Lógica de processamento das respostas e cálculo de score: `src/components/QuestionarioMatch.jsx` (principalmente na função `finalizarMatch`).
*   **Instruções:**
    *   **Para alterar textos de perguntas/respostas:** Edite diretamente em `perguntasMatch` no `src/data.js`.
    *   **Para alterar tags ou pesos:** Modifique as propriedades `tag` e `peso` dos objetos de resposta em `perguntasMatch`. Certifique-se que as `tag`s correspondem às `tagsParaMatch` definidas para as psicólogas em `psicologasData`.
    *   **Para alterar a lógica de como os scores são calculados (além dos pesos):** Modifique a função `finalizarMatch` em `QuestionarioMatch.jsx`. Tenha cuidado ao alterar como os pontos de respostas e da IA são somados.

#### 6.2.3. Modificar a Interação ou Lógica da API Gemini

*   **Localização:** `src/components/QuestionarioMatch.jsx` (função `analisarTextoComIA` e seu uso em `finalizarMatch`).
*   **Instruções:**
    *   **Alterar o prompt:** Modifique a string `prompt` dentro de `analisarTextoComIA`.
    *   **Alterar o schema da resposta esperada:** Modifique o objeto `generationConfig.responseSchema`.
    *   **Alterar como os resultados da IA são ponderados:** Modifique a linha `const pontosIA = Math.round(7 * (item.confianca || 0.5));` em `finalizarMatch`.
    *   **Variável de Ambiente:** Lembre-se que a chave da API é `VITE_GEMINI_API_KEY`.

#### 6.2.4. Adicionar/Modificar Psicólogas

*   **Localização:** `src/data.js` (array `psicologasData`).
*   **Instruções:**
    *   Adicione um novo objeto ao array `psicologasData` ou modifique um existente.
    *   **Campos Cruciais:**
        *   `id`: Deve ser único.
        *   `fotoUrl`: Deve apontar para uma imagem válida em `public/psicologas_fotos/` (ou um placeholder).
        *   `tagsParaMatch`: Defina tags que correspondam às `tag`s das respostas do questionário (`perguntasMatch` em `src/data.js`) e possíveis saídas da IA. Estas são fundamentais para o algoritmo de match.
    *   Os horários (`horariosDisponiveis`) em `psicologasData` são apenas um fallback inicial. Os horários reais são carregados da API e mesclados em `App.jsx`. Para que uma nova psicóloga tenha horários da API, o backend da API de horários também precisa ser atualizado para incluir o `psicologa_id` correspondente.

#### 6.2.5. Modificar a Lógica de Busca ou Tratamento da API de Horários

*   **Localização:** `src/App.jsx` (principalmente na função `fetchHorarios` e no `useEffect` que a chama).
*   **Instruções:**
    *   **Alterar URL da API:** Modifique a constante `API_URL`.
    *   **Alterar como a resposta é processada:** Modifique a lógica dentro do `try` após `await response.json()`. Preste atenção em como `horariosMap` e `horariosGerais` são construídos e como `psicologasList` é atualizada.
    *   **Tratamento de Erros:** A lógica de `catch` e `finally` pode ser ajustada conforme necessário.

#### 6.2.6. Estilos e CSS

*   **Arquivos Principais:** `src/index.css` (estilos globais/reset), `src/App.css` (estilos específicos para componentes principais e layout).
*   **Instruções:**
    *   Tente reutilizar classes CSS existentes.
    *   Se adicionar novas classes, faça-o de forma organizada e com nomes descritivos.
    *   Evite estilos inline sempre que possível, preferindo classes em arquivos CSS.
    *   O projeto não usa CSS Modules ou Styled Components por padrão; as classes são globais.

### 6.3. Exemplo de Solicitação para a IA

**Usuário:** "Por favor, adicione uma nova especialidade 'Terapia de Casal' para a psicóloga Karine Dos Santos Carvalho e certifique-se de que isso apareça no card dela no catálogo."

**Como a IA deve proceder (pensamento):**

1.  **Consultar Guia:** "Ok, preciso modificar dados de uma psicóloga e sua exibição no catálogo."
2.  **Localizar Dados:** "A seção 3.1 diz que `psicologasData` em `src/data.js` contém os dados das psicólogas, incluindo `especialidades`."
3.  **Editar `src/data.js`:**
    *   Encontrar o objeto da Karine (ID 1).
    *   Adicionar "Terapia de Casal" ao array `especialidades`.
4.  **Localizar Componente de Exibição:** "A seção 2.2 diz que `Catalogo.jsx` exibe os cards. A seção 6.2.1 confirma isso."
5.  **Verificar `Catalogo.jsx`:**
    *   Confirmar que o componente já itera sobre `psi.especialidades` e as exibe (o que ele faz com `<span key={index} className="tag">{esp}</span>`).
    *   Se já exibe, nenhuma alteração no JSX é necessária para esta parte.
6.  **Concluir:** "A alteração em `src/data.js` é suficiente para que a nova especialidade apareça, pois `Catalogo.jsx` já renderiza todas as especialidades listadas."

**IA (resposta/ação):** Modificaria `src/data.js` para adicionar a especialidade. Se o componente não estivesse preparado para exibir, a IA também proporia a alteração no JSX do `Catalogo.jsx`.

---
*Este guia visa ajudar assistentes de IA a realizar edições de forma mais eficiente e segura.*
