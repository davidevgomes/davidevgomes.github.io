// Todo o conteúdo do site fica aqui. Edite textos, links e projetos sem tocar nos componentes.

export const profile = {
  name: 'Davi Gomes Araújo',
  role: 'Engenheiro de Software & Desenvolvedor Criativo',
  tagline: ['Transformo', 'ideias', 'em experiências digitais.'],
  statement: 'Construo sistemas, produtos e experiências que resolvem problemas reais.',
  location: 'Maricá, RJ — Brasil', // edite se necessário
  coords: '22°55′S 42°49′W',
  timezone: 'America/Sao_Paulo',
}

export const contact = {
  email: 'devdavigomes@gmail.com',
  whatsappLabel: '(21) 99500-6549',
  whatsapp: 'https://wa.me/5521995006549',
  github: 'https://github.com/devdavigomes-sudo',
  githubLabel: 'devdavigomes-sudo',
  linkedin: '', // cole aqui a URL do LinkedIn para o canal aparecer no site
  linkedinLabel: '',
}

export const nav = [
  { id: 'home', label: 'Início' },
  { id: 'about', label: 'Sobre' },
  { id: 'expertise', label: 'Competências' },
  { id: 'work', label: 'Projetos' },
  { id: 'contact', label: 'Contato' },
]

export const about = {
  lead: [
    'Comecei pela infraestrutura — abrindo máquinas, montando redes — e segui até o código.',
    'Hoje projeto e construo sistemas inteiros: do servidor à interface.',
  ],
  paragraphs: [
    'Sou Davi Gomes Araújo, desenvolvedor de software. Minha trajetória na tecnologia começou pela infraestrutura e manutenção de computadores, evoluindo para o desenvolvimento de sistemas, aplicações e soluções digitais.',
    'Ao longo dessa jornada, trabalhei em projetos institucionais que resolveram problemas reais, desenvolvi aplicações próprias e explorei diferentes tecnologias para transformar ideias em produtos funcionais.',
    'Tenho especial interesse em desenvolvimento de software, automação de processos, inteligência artificial e experiências digitais.',
  ],
  education: [
    { title: 'Engenharia de Software', place: 'Universidade de Vassouras', note: 'Em andamento' },
    { title: 'Técnico em Informática', place: 'Instituto Federal Fluminense — IFF Maricá', note: 'Concluído' },
    { title: 'Formação técnica', place: 'Escola Master Profissionalizante', note: 'Concluído' },
  ],
  path: ['Infraestrutura', 'Redes', 'Sistemas', 'Aplicações', 'Produtos'],
  photos: [
    { src: '/img/bastidores-1.webp', w: 1600, h: 901, caption: 'Rodada de revisão — Mapa da Mulher Empreendedora' },
    { src: '/img/bastidores-2.webp', w: 699, h: 1240, caption: 'Código de um lado, serviços no ar do outro' },
  ],
}

// Ordem = camadas do objeto 3D, da base ao topo.
export const expertise = [
  {
    id: 'infra',
    title: 'Infraestrutura & Redes',
    blurb: 'A base. Onde tudo precisa estar de pé antes de existir uma tela.',
    items: ['Infraestrutura de servidores', 'Redes e ambientes de hospedagem', 'Configuração de ambientes para aplicações', 'GitLab e ambientes de desenvolvimento'],
  },
  {
    id: 'backend',
    title: 'Desenvolvimento Back-end',
    blurb: 'Regras, dados e serviços que sustentam o produto.',
    items: ['Python', 'Node.js', 'Desenvolvimento de APIs', 'Arquitetura de sistemas'],
  },
  {
    id: 'frontend',
    title: 'Desenvolvimento Front-end',
    blurb: 'A camada que as pessoas tocam — precisa ser clara, rápida e bem acabada.',
    items: ['HTML5', 'CSS3', 'JavaScript', 'React'],
  },
  {
    id: 'mobile',
    title: 'Mobile & Sistemas',
    blurb: 'Software que sai do navegador e vai para o campo, o tablet e o bolso.',
    items: ['Desenvolvimento de aplicativos', 'Sistemas administrativos', 'Automação de processos', 'Aplicações multiplataforma'],
  },
  {
    id: 'ai',
    title: 'Inteligência Artificial',
    blurb: 'IA como ferramenta de engenharia: acelera, explora e amplia o que dá para construir.',
    items: ['Desenvolvimento assistido por IA', 'Automação com inteligência artificial', 'Integração de IA em aplicações', 'Engenharia de prompts e uso avançado de ferramentas de IA'],
  },
]

export const idr = {
  index: '01',
  name: 'Instituto Darcy Ribeiro',
  kicker: 'Tecnologia para o setor público',
  url: 'https://idr.marica.rj.gov.br',
  meta: [
    ['Organização', 'Autarquia do município de Maricá — RJ'],
    ['Papel', 'Desenvolvedor'],
    ['Escopo', 'Sistemas de campo, plataformas de mapas e indicadores, gestão de ocorrências e site institucional'],
    ['Setor', 'Administração pública · Pesquisa e dados'],
  ],
  context:
    'O Instituto Darcy Ribeiro produz e organiza dados, pesquisas, indicadores e mapas sobre Maricá. Esse trabalho depende de tecnologia em duas frentes: a coleta em campo, com entrevistadores e tablets, e a publicação do conhecimento para a gestão e para a população.',
  contribution:
    'Atuei como desenvolvedor em projetos institucionais e soluções voltadas à administração pública e à coleta de dados — de ferramentas internas que organizam a operação de campo a plataformas públicas que colocam a informação no mapa.',
  cover: { src: '/img/idr-site.webp', alt: 'Página inicial do site institucional do Instituto Darcy Ribeiro' },
  solutions: [
    {
      name: 'Sistema de Monitoramento de Campo (GPS)',
      kind: 'Sistema interno · Operação de campo',
      role: 'Desenvolvimento',
      text: 'Sistema para monitorar a localização dos entrevistadores em campo e acompanhar os equipamentos utilizados durante as pesquisas, especialmente tablets.',
      img: '/img/idr-gps.webp', // painel real; o mapa foi desfocado (nomes e posições de entrevistadores)
    },
    {
      name: 'Aplicativo Kiosk',
      kind: 'Aplicativo · Controle de dispositivos',
      role: 'Desenvolvimento',
      text: 'Aplicação para bloqueio e controle dos tablets usados pelos entrevistadores, restringindo o uso dos equipamentos às atividades profissionais das pesquisas. Na foto, o Kiosk em campo, com o IDR GPS rastreando.',
      img: '/img/idr-kiosk.webp', // foto do tablet em campo (nome do entrevistador desfocado)
      portrait: true,
    },
    {
      name: 'Mapa de Prevenção e Alertas de Maricá',
      kind: 'Plataforma pública · Informação geográfica',
      role: 'Participação no desenvolvimento',
      text: 'Plataforma de visualização de informações geográficas relacionadas à prevenção e aos alertas municipais.',
      img: '/img/idr-mapa-alertas.webp',
      url: 'https://idr.marica.rj.gov.br/mapa-alertas/',
    },
    {
      name: 'Mapa da Mulher Empreendedora',
      kind: 'Plataforma pública · Diretório e mapa',
      role: 'Participação no desenvolvimento',
      text: 'Plataforma voltada à identificação e visualização de mulheres empreendedoras no município.',
      img: '/img/idr-mapa-mulher.webp',
      url: 'https://idr.marica.rj.gov.br/mapa-mulher/',
    },
    {
      name: 'Sistema de Registro de Ocorrências — COMAR',
      kind: 'Sistema interno · Centro de Operações de Maricá',
      role: 'Participação no desenvolvimento',
      text: 'Sistema para registro e gerenciamento de ocorrências do Centro de Operações de Maricá.',
      img: '/img/idr-comar.webp', // painel de gestão (visão sem dados pessoais)
    },
    {
      name: 'Website Institucional',
      kind: 'Site público · Instituto Darcy Ribeiro',
      role: 'Desenvolvimento',
      text: 'O site institucional do Instituto: projetos, publicações, notícias e transparência em um só lugar.',
      img: '/img/idr-site.webp',
      url: 'https://idr.marica.rj.gov.br/inicio/',
    },
    {
      name: 'Painel Socioeconômico de Maricá',
      kind: 'Plataforma pública · Indicadores',
      role: 'Integrante da equipe',
      text: 'Painel com indicadores sociais e econômicos do município: mercado de trabalho, empreendedorismo, transferência de renda e contas públicas.',
      img: '/img/idr-socioeconomico.webp',
      url: 'https://idr.marica.rj.gov.br/socioeconomico/',
    },
    {
      name: 'IPCB — Índice de Preços do Consumo Básico',
      kind: 'Plataforma pública · Índice de preços',
      role: 'Integrante da equipe',
      text: 'Plataforma do índice que acompanha a variação dos preços de itens básicos essenciais em Maricá.',
      img: '/img/idr-ipcb.webp',
      url: 'https://idr.marica.rj.gov.br/ipcb/',
    },
  ],
  gallery: [
    { src: '/img/idr-mapa-mulher.webp', alt: 'Mapa da Mulher Empreendedora — página inicial', label: 'Mapa da Mulher Empreendedora', url: 'https://idr.marica.rj.gov.br/mapa-mulher/' },
    { src: '/img/idr-mapa-alertas.webp', alt: 'Mapa de Prevenção e Alertas de Maricá', label: 'Mapa de Prevenção e Alertas', url: 'https://idr.marica.rj.gov.br/mapa-alertas/' },
  ],
}

export const dashpoint = {
  index: '02',
  name: ['Dash', 'point'],
  kicker: 'Aplicativo mobile / Gamificação / Tecnologia fitness',
  slogan: 'Corra. Feche a volta. A área é sua.',
  url: 'https://dashpoint.net.br',
  urlLabel: 'dashpoint.net.br',
  meta: [
    ['Papel', 'Líder do projeto — direção, desenvolvimento full stack e tech lead'],
    ['Plataformas', 'Android · iOS'],
    ['Contexto', 'Práticas Extensionistas — Engenharia de Software'],
    ['Stack', 'React Native · Expo · TypeScript · Supabase (PostgreSQL + PostGIS)'],
  ],
  context:
    'Aplicativos de corrida registram distância e tempo. O Dashpoint parte de plataformas como o Strava e vai mais fundo na gamificação: transformar a atividade física em uma experiência mais divertida, competitiva e social.',
  contribution:
    'Um produto digital completo, com identidade própria: você corre, fecha uma volta e a área de dentro vira território — seu e da sua equipe.',
  hero: ['/img/dp-missoes.webp', '/img/dp-mapa.webp', '/img/dp-perfil.webp'],
  features: [
    { title: 'Territórios', text: 'Sistema de conquista de territórios: o mapa da cidade vira o tabuleiro.', img: '/img/dp-mapa.webp' },
    { title: 'Equipes', text: 'Corredores jogam em equipe e disputam o ranking.', img: '/img/dp-ranking.webp' },
    { title: 'Perfis', text: 'Cada corredor tem um perfil com sua identidade e histórico.', img: '/img/dp-perfil.webp' },
    { title: 'Missões & desafios', text: 'Objetivos que dão motivo para sair de casa e voltar amanhã.', img: '/img/dp-missoes.webp' },
    { title: 'Conquistas', text: 'Medalhas que registram o que já foi alcançado.', img: '/img/dp-medalhas.webp' },
    { title: 'Cosméticos', text: 'Itens para personalizar a presença no jogo.', img: '/img/dp-loja.webp' },
  ],
}

export const approach = {
  title: ['Não escrevo', 'só código.', 'Eu projeto', 'soluções.'],
  steps: [
    { verb: 'Identificar', text: 'Entender o problema e a oportunidade antes de escolher a tecnologia.' },
    { verb: 'Planejar', text: 'Desenhar a solução: o que construir, em que ordem e com quais peças.' },
    { verb: 'Estruturar', text: 'Preparar a infraestrutura — servidores, redes e ambientes prontos para receber o sistema.' },
    { verb: 'Desenvolver', text: 'Construir sistemas e aplicações completos, da API à interface.' },
    { verb: 'Potencializar', text: 'Usar inteligência artificial para acelerar e ampliar o processo de desenvolvimento.' },
    { verb: 'Automatizar', text: 'Tirar o trabalho repetitivo do caminho com processos automáticos.' },
    { verb: 'Entregar', text: 'Colocar no ar uma solução funcional, usada por pessoas reais.' },
  ],
}
