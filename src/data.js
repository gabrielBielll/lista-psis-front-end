export const psicologasData = [
  {
    id: 1,
    nome: 'Karina S. Carvalho',
    fotoUrl: '/psicologas_fotos/karina_carvalho_photo.png',
    abordagem: 'Análise do Comportamento Aplicada',
    bio: 'Psicóloga com formação em Terapia Cognitivo-Comportamental e pós-graduanda em Análise do Comportamento Aplicada. Acredita que o vínculo é a base do processo terapêutico e busca proporcionar autonomia e desenvolvimento aos pacientes.',
    especialidades: ['Ansiedade', 'TDAH', 'Relacionamentos'],
    tagsParaMatch: ['ansiedade', 'tdah', 'tea', 'desregulacao-emocional', 'habilidades-sociais', 'relacionamentos-amorosos', 'tcc', 'ferramentas-praticas']
  },
  {
    id: 2,
    nome: 'Jessica S. Reimol',
    fotoUrl: '/psicologas_fotos/jessica_reimol_photo.png',
    abordagem: 'Terapia Cognitivo-Comportamental',
    bio: 'Psicóloga com formação em Terapia Cognitivo-Comportamental e pós-graduanda em Psicopatologia, oferecendo escuta qualificada, intervenções baseadas em evidências e foco no desenvolvimento emocional dos pacientes.',
    especialidades: ['Saúde Mental', 'Psicopatologia', 'Adultos'],
    tagsParaMatch: ['ansiedade', 'humor', 'tdah', 'relacionamentos-gerais', 'comunicacao', 'tcc', 'saude-mental', 'ferramentas-praticas']
  },
  {
    id: 3,
    nome: 'Juliana dos Santos',
    fotoUrl: '/psicologas_fotos/juliana_santos_photo.png',
    abordagem: 'Psicanálise',
    bio: 'Especialista em saúde mental e atenção psicossocial, com foco no atendimento de crianças e transtornos de personalidade. Acredito na importância de compreender as raízes dos conflitos para uma mudança real.',
    especialidades: ['Crianças', 'Autismo', 'Personalidade'],
    tagsParaMatch: ['criancas', 'autismo', 'personalidade', 'psicanalise', 'saude-mental', 'reflexao-profunda']
  },
  {
    id: 4,
    nome: 'Bruna N. Bernardi',
    fotoUrl: '/psicologas_fotos/bruna_bernardi_photo.png',
    abordagem: 'Psicanálise',
    bio: 'Auxilia pacientes a navegarem por questões existenciais complexas, promovendo uma jornada profunda de autoconhecimento e ressignificação de suas histórias de vida.',
    especialidades: ['Questões Existenciais', 'Autoconhecimento'],
    tagsParaMatch: ['psicanalise', 'autoconhecimento', 'existencial', 'reflexao-profunda']
  },
  {
    id: 5,
    nome: 'Andrezza Alves da Mata',
    fotoUrl: '/psicologas_fotos/andrezza_mata_photo.png',
    abordagem: 'Psicanálise',
    bio: 'Psicanalista com pós-graduação em Psicologia, Andrezza dedica-se ao estudo e tratamento de dinâmicas psíquicas complexas. Com foco em histeria e neurose obsessiva, ela auxilia pacientes na exploração profunda do inconsciente para promover autoconhecimento e resolução de conflitos internos.',
    especialidades: ['Psicanálise', 'Histeria', 'Neurose Obsessiva'],
    tagsParaMatch: ['psicanalise', 'histeria', 'neurose-obsessiva', 'autoconhecimento', 'reflexao-profunda']
  }
];

export const perguntasMatch = [
  {
    pergunta: 'Como você tem se sentido mais frequentemente nos últimos tempos?',
    respostas: [
      { texto: 'Ansioso(a), com a mente acelerada e preocupações constantes.', tag: 'ansiedade', peso: 3 },
      { texto: 'Desmotivado(a), com alterações de humor ou sentindo um vazio.', tag: 'humor', peso: 3 },
      { texto: 'Com dificuldades de foco, organização e impulsividade.', tag: 'tdah', peso: 3 },
      { texto: 'Sobrecarregado(a) e com dificuldade para lidar com minhas emoções.', tag: 'desregulacao-emocional', peso: 2 },
    ],
  },
  {
    pergunta: 'Qual área da sua vida você sente que precisa de mais atenção?',
    respostas: [
      { texto: 'Meus relacionamentos amorosos.', tag: 'relacionamentos-amorosos', peso: 3 },
      { texto: 'Minhas amizades e interações sociais em geral.', tag: 'habilidades-sociais', peso: 2 },
      { texto: 'A forma como me comunico com as pessoas.', tag: 'comunicacao', peso: 2 },
      { texto: 'Questões relacionadas a crianças, como desenvolvimento ou autismo.', tag: 'criancas', peso: 3 },
    ],
  },
  {
    pergunta: 'O que você espera entender ou desenvolver com a terapia?',
    respostas: [
      { texto: 'Compreender padrões de comportamento que se repetem.', tag: 'personalidade', peso: 3 },
      { texto: 'Encontrar um maior sentido para a vida ou lidar com questões existenciais.', tag: 'existencial', peso: 2 },
      { texto: 'Melhorar minha saúde mental de forma geral e meu autoconhecimento.', tag: 'saude-mental', peso: 2 },
    ],
  },
    {
    pergunta: 'No processo terapêutico, o que é mais importante para você?',
    respostas: [
      { texto: 'Receber ferramentas e estratégias práticas para aplicar no dia a dia.', tag: 'ferramentas-praticas', peso: 3 },
      { texto: 'Explorar a fundo as origens e os significados dos meus sentimentos.', tag: 'reflexao-profunda', peso: 3 },
    ],
  },
  {
    pergunta: 'Qual abordagem de terapia mais te atrai?',
    respostas: [
      { texto: 'Uma mais estruturada e focada no presente (TCC).', tag: 'tcc', peso: 4 },
      { texto: 'Uma que explore o inconsciente e o passado (Psicanálise).', tag: 'psicanalise', peso: 4 },
      { texto: 'Não conheço bem, estou aberto(a) a sugestões.', tag: 'indiferente', peso: 0 },
    ],
  },
];
