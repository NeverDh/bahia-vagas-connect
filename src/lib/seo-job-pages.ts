export interface SeoJobPage {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  keywords: string[];
  introText: string;
  relatedPages: string[]; // slugs of related pages
  filterType: 'search' | 'remote' | 'experience_level';
  filterValue?: string;
}

export const seoJobPages: SeoJobPage[] = [
  {
    slug: "auxiliar-administrativo",
    title: "Vagas de Auxiliar Administrativo: Oportunidades Abertas Hoje",
    metaDescription: "Encontre vagas de auxiliar administrativo e assistente administrativo abertas agora. Oportunidades CLT, PJ e estágio na Bahia. Candidate-se hoje no BahiaVagas!",
    h1: "Vagas de Auxiliar Administrativo",
    keywords: ["auxiliar administrativo", "assistente administrativo", "administrativo"],
    introText: `O cargo de Auxiliar Administrativo é uma das portas de entrada mais procuradas no mercado de trabalho brasileiro. Esse profissional desempenha um papel essencial no funcionamento de empresas de todos os portes e segmentos, sendo responsável por atividades como organização de documentos, controle de planilhas, atendimento telefônico, apoio ao setor financeiro e suporte às rotinas operacionais do escritório. A área administrativa oferece uma base sólida para quem deseja construir uma carreira corporativa, com possibilidades reais de crescimento para cargos como Assistente Administrativo, Analista Administrativo e até Coordenador ou Gerente de áreas específicas. Para se destacar nessa função, é importante ter organização, boa comunicação, domínio básico de informática e proatividade. Muitas vagas não exigem experiência prévia, tornando essa uma excelente oportunidade para quem está ingressando no mercado de trabalho. As empresas baianas, especialmente em Salvador, Feira de Santana e Camaçari, frequentemente abrem processos seletivos para essa posição. Confira abaixo as vagas de auxiliar administrativo disponíveis no momento e candidate-se agora mesmo pelo BahiaVagas.`,
    relatedPages: ["atendente", "estagio", "sem-experiencia", "jovem-aprendiz"],
    filterType: "search",
  },
  {
    slug: "vendedor",
    title: "Vagas para Vendedor: Empresas Contratando Agora",
    metaDescription: "Vagas para vendedor abertas na Bahia. Oportunidades em lojas, comércio e empresas. CLT, PJ e comissão. Encontre sua vaga no BahiaVagas!",
    h1: "Vagas para Vendedor",
    keywords: ["vendedor", "vendedora", "consultor de vendas", "promotor de vendas"],
    introText: `A área de vendas é um dos setores que mais emprega no Brasil, oferecendo oportunidades para profissionais com diferentes níveis de experiência e formação. O vendedor é o profissional responsável por apresentar produtos e serviços, negociar condições comerciais, fidelizar clientes e atingir metas estabelecidas pela empresa. Atuar em vendas exige habilidades como comunicação persuasiva, resiliência, empatia e capacidade de trabalhar sob pressão. O mercado baiano apresenta forte demanda por vendedores em diversos segmentos, como varejo, atacado, tecnologia, imobiliário e serviços. Muitas empresas oferecem remuneração composta por salário fixo mais comissão, o que pode representar ganhos significativos para profissionais dedicados. As oportunidades variam entre vendas presenciais em lojas físicas e vendas externas, além de posições de televendas e vendas online que vêm crescendo nos últimos anos. Salvador, Feira de Santana, Vitória da Conquista e Lauro de Freitas concentram grande parte das vagas. Se você tem perfil comercial e busca crescimento profissional, confira as vagas de vendedor disponíveis abaixo e candidate-se pelo BahiaVagas.`,
    relatedPages: ["atendente", "atendimento-ao-cliente", "meio-periodo", "sem-experiencia"],
    filterType: "search",
  },
  {
    slug: "atendente",
    title: "Vagas para Atendente: Empregos em Lojas e Empresas",
    metaDescription: "Vagas para atendente em lojas, restaurantes e empresas na Bahia. Oportunidades com e sem experiência. Candidate-se no BahiaVagas!",
    h1: "Vagas para Atendente",
    keywords: ["atendente", "atendimento", "recepcionista", "balconista"],
    introText: `O profissional de atendimento é fundamental para qualquer negócio que lida diretamente com o público. Atendentes trabalham em lojas, restaurantes, clínicas, farmácias, supermercados, hotéis e diversos outros estabelecimentos, sendo o primeiro ponto de contato entre a empresa e seus clientes. Suas responsabilidades incluem recepcionar e orientar clientes, registrar pedidos, operar caixas, organizar o ambiente de trabalho e garantir uma experiência positiva para o consumidor. A função de atendente valoriza profissionais com boa comunicação, simpatia, agilidade e capacidade de resolver problemas rapidamente. Muitas vagas de atendente não exigem experiência prévia, sendo uma excelente porta de entrada para jovens e pessoas em transição de carreira. O mercado na Bahia oferece ampla demanda por atendentes, especialmente em centros comerciais e áreas turísticas de Salvador, Porto Seguro, Ilhéus e outras cidades. A remuneração varia conforme o segmento e a cidade, com muitas empresas oferecendo benefícios como vale-transporte, vale-alimentação e plano de saúde. Explore as vagas de atendente disponíveis abaixo e encontre a oportunidade ideal para você no BahiaVagas.`,
    relatedPages: ["vendedor", "atendimento-ao-cliente", "sem-experiencia", "meio-periodo"],
    filterType: "search",
  },
  {
    slug: "jovem-aprendiz",
    title: "Vagas de Jovem Aprendiz: Empresas Contratando em 2026",
    metaDescription: "Vagas de jovem aprendiz abertas na Bahia em 2026. Primeiro emprego com carteira assinada. Encontre oportunidades no BahiaVagas!",
    h1: "Vagas de Jovem Aprendiz",
    keywords: ["jovem aprendiz", "aprendiz", "menor aprendiz", "primeiro emprego"],
    introText: `O programa Jovem Aprendiz é uma das melhores oportunidades para adolescentes e jovens que desejam ingressar no mercado de trabalho com carteira assinada e formação profissional. Regulamentado pela Lei da Aprendizagem (Lei 10.097/2000), o programa permite que jovens entre 14 e 24 anos trabalhem em empresas de médio e grande porte, combinando atividades práticas com capacitação teórica em instituições de ensino parceiras. O contrato de aprendizagem pode durar até dois anos e garante direitos como salário mínimo-hora, FGTS, férias, 13º salário e vale-transporte. Para os jovens, é uma chance única de adquirir experiência profissional, desenvolver habilidades e construir uma rede de contatos que facilitará a inserção definitiva no mercado. Empresas de diversos setores na Bahia, incluindo bancos, indústrias, comércio e serviços, mantêm programas de aprendizagem ativos durante todo o ano. Salvador, Camaçari, Lauro de Freitas e Feira de Santana são as cidades com maior número de vagas. Se você é jovem e busca seu primeiro emprego com carteira assinada, confira as vagas de jovem aprendiz disponíveis abaixo.`,
    relatedPages: ["estagio", "sem-experiencia", "auxiliar-administrativo", "atendente"],
    filterType: "search",
  },
  {
    slug: "estagio",
    title: "Vagas de Estágio: Oportunidades para Estudantes",
    metaDescription: "Vagas de estágio abertas na Bahia para estudantes universitários e técnicos. Diversas áreas de atuação. Candidate-se no BahiaVagas!",
    h1: "Vagas de Estágio",
    keywords: ["estágio", "estagiário", "estagiaria", "estágio remunerado"],
    introText: `O estágio é uma etapa fundamental na formação profissional de estudantes universitários e de cursos técnicos, proporcionando a oportunidade de aplicar na prática os conhecimentos adquiridos em sala de aula. Regulamentado pela Lei do Estágio (Lei 11.788/2008), o estágio pode ser obrigatório ou não obrigatório, com carga horária máxima de 6 horas diárias e 30 horas semanais. As empresas que oferecem estágio remunerado costumam pagar bolsa-auxílio, vale-transporte e, em muitos casos, vale-alimentação e seguro de vida. Para os estudantes, o estágio representa não apenas uma fonte de renda, mas também a chance de desenvolver competências profissionais, conhecer diferentes áreas de atuação e construir um currículo competitivo. O mercado baiano oferece vagas de estágio em áreas como administração, direito, engenharia, tecnologia da informação, comunicação, saúde e educação. Salvador concentra a maior parte das oportunidades, seguida por Feira de Santana, Vitória da Conquista e Ilhéus. Confira abaixo as vagas de estágio disponíveis e dê o primeiro passo na sua carreira profissional com o BahiaVagas.`,
    relatedPages: ["jovem-aprendiz", "sem-experiencia", "auxiliar-administrativo", "home-office"],
    filterType: "search",
  },
  {
    slug: "sem-experiencia",
    title: "Empregos Sem Experiência: Empresas Contratando Agora",
    metaDescription: "Vagas que não exigem experiência na Bahia. Oportunidades para primeiro emprego em diversas áreas. Candidate-se agora no BahiaVagas!",
    h1: "Vagas Sem Experiência",
    keywords: ["sem experiência", "primeiro emprego", "não exige experiência", "sem experiencia"],
    introText: `Encontrar o primeiro emprego ou uma nova oportunidade sem ter experiência prévia é um dos maiores desafios enfrentados por profissionais em início de carreira ou em transição profissional. No entanto, muitas empresas na Bahia valorizam qualidades como disposição para aprender, proatividade, pontualidade e boa comunicação, abrindo vagas que não exigem experiência anterior. Essas oportunidades estão presentes em diversos setores, como comércio, serviços, alimentação, logística e atendimento ao cliente. Cargos como auxiliar de produção, atendente, operador de caixa, auxiliar de limpeza e ajudante geral são frequentemente oferecidos para candidatos sem experiência, muitas vezes com treinamento fornecido pela própria empresa. Para se destacar na busca por essas vagas, é importante ter um currículo bem elaborado, mesmo que simples, destacando cursos complementares, habilidades pessoais e trabalhos voluntários. O BahiaVagas reúne oportunidades de emprego sem experiência em Salvador, Feira de Santana, Camaçari, Lauro de Freitas e diversas outras cidades baianas. Confira abaixo as vagas disponíveis e comece sua trajetória profissional hoje mesmo.`,
    relatedPages: ["jovem-aprendiz", "estagio", "atendente", "auxiliar-administrativo"],
    filterType: "search",
  },
  {
    slug: "home-office",
    title: "Vagas Home Office: Trabalhe de Casa em Diversas Empresas",
    metaDescription: "Vagas home office e trabalho remoto na Bahia e no Brasil. Oportunidades para trabalhar de casa. Encontre sua vaga no BahiaVagas!",
    h1: "Vagas Home Office",
    keywords: ["home office", "trabalho remoto", "remoto", "trabalhar de casa"],
    introText: `O trabalho home office se consolidou como uma das modalidades mais desejadas por profissionais de diversas áreas, oferecendo flexibilidade, economia de tempo com deslocamento e melhor qualidade de vida. Após a expansão do trabalho remoto nos últimos anos, muitas empresas adotaram permanentemente esse modelo, abrindo oportunidades para profissionais de todo o Brasil. As vagas home office abrangem áreas como tecnologia da informação, marketing digital, atendimento ao cliente, design, redação, vendas, suporte técnico, recursos humanos e finanças. Para trabalhar remotamente, é importante ter disciplina, organização, boa conexão de internet e um ambiente adequado para o trabalho. Muitas empresas fornecem equipamentos e ajuda de custo para home office. O modelo remoto é especialmente vantajoso para profissionais da Bahia, que podem acessar vagas de empresas sediadas em qualquer parte do país, ampliando significativamente as possibilidades de carreira e remuneração. Além das vagas totalmente remotas, também existem oportunidades híbridas, que combinam dias presenciais e dias de trabalho em casa. Confira abaixo as vagas home office disponíveis no BahiaVagas e encontre a oportunidade ideal para trabalhar de onde você estiver.`,
    relatedPages: ["estagio", "atendimento-ao-cliente", "vendedor", "logistica"],
    filterType: "remote",
  },
  {
    slug: "meio-periodo",
    title: "Vagas Meio Período: Trabalhos de Meio Turno",
    metaDescription: "Vagas de meio período e meio turno na Bahia. Trabalhos flexíveis para estudantes e profissionais. Candidate-se no BahiaVagas!",
    h1: "Vagas de Meio Período",
    keywords: ["meio período", "meio turno", "part time", "meio expediente", "4 horas", "6 horas"],
    introText: `As vagas de meio período são ideais para quem precisa conciliar o trabalho com estudos, cuidados familiares ou outras atividades. Com jornada reduzida, geralmente de 4 a 6 horas diárias, essas oportunidades permitem que o profissional mantenha uma renda sem comprometer toda a sua rotina. O mercado baiano oferece vagas de meio período em diversos setores, como comércio, alimentação, educação, atendimento ao cliente e serviços. Cargos como atendente, vendedor, auxiliar administrativo, recepcionista e monitor são frequentemente oferecidos nessa modalidade. Estudantes universitários e de cursos técnicos são um dos públicos que mais se beneficiam dessas oportunidades, já que podem adquirir experiência profissional sem prejudicar o desempenho acadêmico. Além disso, mães e pais que precisam de flexibilidade para cuidar dos filhos também encontram nessas vagas uma alternativa viável. A remuneração é proporcional à jornada, e muitas empresas oferecem benefícios como vale-transporte e vale-alimentação mesmo para contratos de meio período. Salvador, Feira de Santana, Lauro de Freitas e Camaçari estão entre as cidades com maior oferta dessas vagas. Explore abaixo as vagas de meio período disponíveis no BahiaVagas.`,
    relatedPages: ["estagio", "jovem-aprendiz", "atendente", "vendedor"],
    filterType: "search",
  },
  {
    slug: "atendimento-ao-cliente",
    title: "Vagas de Atendimento ao Cliente: Empresas Contratando",
    metaDescription: "Vagas de atendimento ao cliente, SAC e suporte na Bahia. Oportunidades presenciais e home office. Candidate-se no BahiaVagas!",
    h1: "Vagas de Atendimento ao Cliente",
    keywords: ["atendimento ao cliente", "SAC", "suporte ao cliente", "call center", "telemarketing"],
    introText: `O setor de atendimento ao cliente é um dos que mais emprega na Bahia e no Brasil, oferecendo oportunidades para profissionais com diferentes perfis e níveis de experiência. O profissional de atendimento ao cliente é responsável por solucionar dúvidas, registrar reclamações, processar solicitações e garantir a satisfação dos consumidores. As vagas abrangem diversas modalidades, como atendimento presencial, telefônico, por chat e por e-mail, além de posições em SAC (Serviço de Atendimento ao Consumidor) e call centers. Habilidades como paciência, boa dicção, empatia, capacidade de resolução de problemas e domínio de ferramentas digitais são altamente valorizadas nessa área. O mercado de atendimento ao cliente tem se expandido com o crescimento do comércio eletrônico e dos serviços digitais, gerando novas vagas tanto presenciais quanto remotas. Muitas empresas de tecnologia, telecomunicações, bancos e varejo mantêm centrais de atendimento em Salvador e outras cidades baianas. A remuneração varia conforme a complexidade do atendimento e o porte da empresa, com muitas posições oferecendo benefícios atrativos. Confira abaixo as vagas de atendimento ao cliente disponíveis e candidate-se pelo BahiaVagas.`,
    relatedPages: ["atendente", "vendedor", "home-office", "sem-experiencia"],
    filterType: "search",
  },
  {
    slug: "logistica",
    title: "Vagas de Logística: Oportunidades em Estoque e Transporte",
    metaDescription: "Vagas de logística, estoque, transporte e distribuição na Bahia. Oportunidades para diversos níveis. Candidate-se no BahiaVagas!",
    h1: "Vagas de Logística",
    keywords: ["logística", "estoque", "almoxarifado", "transporte", "expedição", "distribuição", "motorista"],
    introText: `A logística é uma área estratégica para o funcionamento de empresas de todos os setores, englobando atividades como armazenagem, controle de estoque, transporte, distribuição e gestão da cadeia de suprimentos. O profissional de logística é responsável por garantir que produtos e materiais cheguem ao destino certo, no prazo estabelecido e nas condições adequadas. As vagas na área de logística incluem posições como auxiliar de logística, almoxarife, conferente, operador de empilhadeira, motorista, analista de logística e coordenador de distribuição. O setor é especialmente forte na Bahia devido à posição geográfica estratégica do estado, com importantes portos, rodovias e centros de distribuição. O Polo Industrial de Camaçari, o Porto de Salvador e os centros logísticos de Feira de Santana e Simões Filho são grandes geradores de empregos na área. Profissionais com cursos técnicos em logística, administração ou áreas correlatas têm vantagem competitiva, embora muitas vagas operacionais não exijam formação específica. Confira abaixo as vagas de logística disponíveis no BahiaVagas e encontre a oportunidade ideal para a sua carreira.`,
    relatedPages: ["auxiliar-administrativo", "sem-experiencia", "meio-periodo", "vendedor"],
    filterType: "search",
  },
];

export const getSeoJobPageBySlug = (slug: string): SeoJobPage | undefined => {
  return seoJobPages.find((page) => page.slug === slug);
};
