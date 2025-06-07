export const psicologasData = [
  {
    id: 1,
    nome: 'Karina S. Carvalho',
    fotoUrl: '/psicologas_fotos/karina_carvalho_photo.png',
    abordagem: 'Terapia Cognitivo-Comportamental', // Updated
    bio: 'Psicóloga com formação em Terapia Cognitivo-Comportamental e pós-graduanda em Análise do Comportamento Aplicada. Acredita que o vínculo é a base do processo terapêutico e busca proporcionar autonomia e desenvolvimento aos pacientes.', // Kept existing
    especialidades: ["Ansiedade", "Relacionamentos", "TCC"], // Updated
    tagsParaMatch: ["ansiedade", "relacionamentos-amorosos", "ferramentas-praticas", "tcc", "abordagem-direta"], // Updated
    mensagemResultado: "Karine é especialista em Terapia Cognitivo-Comportamental com foco em ansiedade e relacionamentos. Ela vai te dar ferramentas práticas para lidar com suas preocupações e melhorar seus vínculos afetivos!" // Added
  },
  {
    id: 2,
    nome: 'Jessica S. Reimol',
    fotoUrl: '/psicologas_fotos/jessica_reimol_photo.png',
    abordagem: 'Terapia Cognitivo-Comportamental', // Kept existing
    bio: 'Psicóloga com formação em Terapia Cognitivo-Comportamental e pós-graduanda em Psicopatologia, oferecendo escuta qualificada, intervenções baseadas em evidências e foco no desenvolvimento emocional dos pacientes.', // Kept existing
    especialidades: ["Transtornos de Humor", "Comunicação", "TCC"], // Updated
    tagsParaMatch: ["humor", "comunicacao", "ferramentas-praticas", "tcc", "abordagem-direta"], // Updated
    mensagemResultado: "Jéssica é especialista em TCC para transtornos de humor e comunicação. Ela vai te ajudar a recuperar sua energia e melhorar suas habilidades sociais com estratégias eficazes!" // Added
  },
  {
    id: 3,
    nome: 'Juliana dos Santos',
    fotoUrl: '/psicologas_fotos/juliana_santos_photo.png',
    abordagem: 'Psicanálise', // Kept existing
    bio: 'Especialista em saúde mental e atenção psicossocial, com foco no atendimento de crianças e transtornos de personalidade. Acredito na importância de compreender as raízes dos conflitos para uma mudança real.', // Kept existing
    especialidades: ["Infantil", "Desenvolvimento", "Psicanálise"], // Updated
    tagsParaMatch: ["existencial", "criancas", "reflexao-profunda", "desenvolvimento-infantil", "especialista-infantil"], // Updated
    mensagemResultado: "Juliana é psicanalista especialista em psicologia infantil e desenvolvimento. Ela vai te ajudar a entender profundamente as questões do seu filho(a) e orientar a família!" // Added
  },
  {
    id: 4,
    nome: 'Bruna N. Bernardi',
    fotoUrl: '/psicologas_fotos/bruna_bernardi_photo.png',
    abordagem: 'Psicanálise', // Updated
    bio: 'Auxilia pacientes a navegarem por questões existenciais complexas, promovendo uma jornada profunda de autoconhecimento e ressignificação de suas histórias de vida.', // Updated to original Psicanalytic bio
    especialidades: ["Existencial", "Autoconhecimento", "Psicanálise"], // Updated
    tagsParaMatch: ["existencial", "autoconhecimento", "reflexao-profunda", "existencial-profundo", "autodescobrimento"], // Updated
    mensagemResultado: "Bruna é psicanalista com foco existencial e autoconhecimento. Ela vai te acompanhar numa jornada profunda de autodescoberta e busca de sentido!" // Added
  },
  {
    id: 5,
    nome: 'Andrezza Alves da Mata',
    fotoUrl: '/psicologas_fotos/andrezza_mata_photo.png',
    abordagem: 'Psicanálise', // Kept existing
    bio: 'Psicanalista com pós-graduação em Psicologia, Andrezza dedica-se ao estudo e tratamento de dinâmicas psíquicas complexas. Com foco em histeria e neurose obsessiva, ela auxilia pacientes na exploração profunda do inconsciente para promover autoconhecimento e resolução de conflitos internos.', // Kept existing
    especialidades: ["Psicossomática", "Expressão Emocional", "Psicanálise"], // Updated
    tagsParaMatch: ["somatizacao", "mente-corpo", "expressao-emocional", "psicossomatica", "especialista-somatico"], // Updated
    mensagemResultado: "Andrezza é psicanalista especialista na relação mente-corpo. Ela vai te ajudar a entender como suas emoções se manifestam fisicamente e encontrar formas saudáveis de expressão!" // Added
  }
];

export const perguntasMatch = [
  {
    pergunta: 'Como você se sente ultimamente?',
    respostas: [
      { texto: 'Ansioso(a) e preocupado(a) com tudo', tag: 'ansiedade', peso: 3 },
      { texto: 'Triste e sem energia para as coisas', tag: 'humor', peso: 3 },
      { texto: 'Confuso(a) e perdido(a) na vida', tag: 'existencial', peso: 2 },
      { texto: 'Preso(a) em pensamentos que não saem da cabeça', tag: 'obsessivo', peso: 3 },
      { texto: 'Estressado(a) e com sintomas físicos estranhos', tag: 'somatizacao', peso: 3 }
    ]
  },
  {
    pergunta: 'O que te motiva a buscar ajuda?',
    respostas: [
      { texto: 'Melhorar meus relacionamentos amorosos', tag: 'relacionamentos-amorosos', peso: 3 },
      { texto: 'Me comunicar melhor com as pessoas', tag: 'comunicacao', peso: 2 },
      { texto: 'Questões do meu filho(a): comportamento, desenvolvimento, escola', tag: 'criancas', peso: 3 },
      { texto: 'Me conhecer melhor e crescer como pessoa', tag: 'autoconhecimento', peso: 2 },
      { texto: 'Entender por que meu corpo reage ao estresse', tag: 'mente-corpo', peso: 3 }
    ]
  },
  {
    pergunta: 'Como você prefere resolver problemas?',
    respostas: [
      { texto: 'Quero soluções práticas e rápidas', tag: 'ferramentas-praticas', peso: 3 },
      { texto: 'Gosto de entender o \'porquê\' profundo das coisas', tag: 'reflexao-profunda', peso: 3 },
      { texto: 'Preciso me acalmar e focar no presente', tag: 'mindfulness', peso: 2 },
      { texto: 'Prefiro ter controle e um plano estruturado', tag: 'controle', peso: 3 },
      { texto: 'Quero expressar o que sinto sem julgamento', tag: 'expressao-emocional', peso: 3 }
    ]
  },
  {
    pergunta: 'Qual situação te representa mais?',
    respostas: [
      { texto: 'Preciso de ferramentas para usar no dia a dia', tag: 'tcc', peso: 3 },
      { texto: 'Quero explorar meus sentimentos profundamente', tag: 'psicanalise', peso: 3 },
      { texto: 'Meu filho(a) tem dificuldades na escola ou comportamento', tag: 'desenvolvimento-infantil', peso: 3 },
      { texto: 'Busco entender o sentido da minha vida', tag: 'existencial-profundo', peso: 3 },
      { texto: 'Quero entender a conexão entre mente e corpo', tag: 'psicossomatica', peso: 3 }
    ]
  },
  {
    pergunta: 'Que tipo de profissional você imagina te ajudando?',
    respostas: [
      { texto: 'Alguém prático(a) e objetivo(a)', tag: 'abordagem-direta', peso: 3 },
      { texto: 'Alguém que me faça refletir profundamente', tag: 'abordagem-analitica', peso: 3 },
      { texto: 'Especialista em crianças e desenvolvimento', tag: 'especialista-infantil', peso: 3 },
      { texto: 'Alguém que me ajude na jornada de autoconhecimento', tag: 'autodescobrimento', peso: 3 },
      { texto: 'Especialista em sintomas físicos e emocionais', tag: 'especialista-somatico', peso: 3 }
    ]
  }
];
