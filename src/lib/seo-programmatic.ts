// Programmatic SEO: profession × city and job-type × city combinations

export interface SeoProgrammaticCity {
  slug: string;
  name: string;
}

export interface SeoProfession {
  slug: string;
  name: string;
  keywords: string[];
}

export interface SeoJobType {
  slug: string;
  name: string;
  keywords: string[];
  filterType?: 'remote' | 'experience_level' | 'search';
}

export const seoCities: SeoProgrammaticCity[] = [
  { slug: "salvador", name: "Salvador" },
  { slug: "feira-de-santana", name: "Feira de Santana" },
  { slug: "vitoria-da-conquista", name: "Vitória da Conquista" },
  { slug: "luis-eduardo-magalhaes", name: "Luís Eduardo Magalhães" },
  { slug: "ilheus", name: "Ilhéus" },
  { slug: "itabuna", name: "Itabuna" },
  { slug: "camacari", name: "Camaçari" },
  { slug: "juazeiro", name: "Juazeiro" },
  { slug: "barreiras", name: "Barreiras" },
  { slug: "porto-seguro", name: "Porto Seguro" },
];

export const seoProfessions: SeoProfession[] = [
  { slug: "vendedor", name: "Vendedor", keywords: ["vendedor", "vendedora", "consultor de vendas"] },
  { slug: "auxiliar-administrativo", name: "Auxiliar Administrativo", keywords: ["auxiliar administrativo", "assistente administrativo"] },
  { slug: "recepcionista", name: "Recepcionista", keywords: ["recepcionista", "recepção"] },
  { slug: "atendente", name: "Atendente", keywords: ["atendente", "atendimento", "balconista"] },
  { slug: "operador-de-caixa", name: "Operador de Caixa", keywords: ["operador de caixa", "caixa", "operadora de caixa"] },
  { slug: "motorista", name: "Motorista", keywords: ["motorista", "condutor", "entregador"] },
  { slug: "estoquista", name: "Estoquista", keywords: ["estoquista", "almoxarife", "estoque"] },
  { slug: "analista-de-marketing", name: "Analista de Marketing", keywords: ["analista de marketing", "marketing", "marketing digital"] },
  { slug: "auxiliar-de-servicos-gerais", name: "Auxiliar de Serviços Gerais", keywords: ["auxiliar de serviços gerais", "serviços gerais", "limpeza"] },
  { slug: "telemarketing", name: "Telemarketing", keywords: ["telemarketing", "operador de telemarketing", "call center"] },
];

export const seoJobTypes: SeoJobType[] = [
  { slug: "emprego", name: "Emprego", keywords: ["emprego", "trabalho", "vaga"], filterType: "search" },
  { slug: "vaga", name: "Vaga", keywords: ["vaga", "oportunidade"], filterType: "search" },
  { slug: "trabalho", name: "Trabalho", keywords: ["trabalho", "emprego"], filterType: "search" },
  { slug: "vagas-hoje", name: "Vagas Hoje", keywords: ["vaga", "emprego", "oportunidade"], filterType: "search" },
  { slug: "vagas-urgentes", name: "Vagas Urgentes", keywords: ["urgente", "imediato", "início imediato"], filterType: "search" },
  { slug: "sem-experiencia", name: "Sem Experiência", keywords: ["sem experiência", "primeiro emprego", "não exige experiência"], filterType: "search" },
  { slug: "jovem-aprendiz", name: "Jovem Aprendiz", keywords: ["jovem aprendiz", "aprendiz", "menor aprendiz"], filterType: "search" },
  { slug: "home-office", name: "Home Office", keywords: ["home office", "remoto", "trabalho remoto"], filterType: "remote" },
];

// Generate intro texts for profession + city combinations
function generateProfessionCityIntro(profession: SeoProfession, city: SeoProgrammaticCity): string {
  const intros: Record<string, (city: string) => string> = {
    "vendedor": (c) => `Está procurando vagas de vendedor em ${c}? O mercado comercial em ${c} oferece diversas oportunidades para profissionais de vendas, desde o varejo até vendas externas e consultivas. O BahiaVagas reúne as melhores oportunidades de emprego para vendedores em ${c}, com vagas atualizadas diariamente. Muitas empresas da região estão contratando vendedores com e sem experiência, oferecendo salário fixo mais comissão, vale-transporte e outros benefícios. Se você tem perfil comercial e busca uma colocação em ${c}, confira as vagas disponíveis abaixo e candidate-se agora mesmo.`,
    "auxiliar-administrativo": (c) => `Encontre vagas de auxiliar administrativo em ${c} no BahiaVagas. A área administrativa é uma das que mais emprega em ${c}, com oportunidades em empresas de todos os portes e segmentos. O auxiliar administrativo é responsável por organizar documentos, controlar planilhas, apoiar o setor financeiro e dar suporte às rotinas do escritório. Muitas vagas em ${c} não exigem experiência prévia, sendo uma excelente porta de entrada no mercado de trabalho. Confira as vagas abertas e candidate-se hoje.`,
    "recepcionista": (c) => `Vagas para recepcionista em ${c} estão disponíveis no BahiaVagas. O profissional de recepção é fundamental para clínicas, escritórios, hotéis, salões de beleza e empresas em geral. Em ${c}, a demanda por recepcionistas é constante, com vagas que valorizam boa comunicação, organização e simpatia. Muitas oportunidades oferecem carteira assinada, vale-transporte e vale-alimentação. Veja as vagas abertas para recepcionista em ${c} e dê o próximo passo na sua carreira.`,
    "atendente": (c) => `Procurando vagas de atendente em ${c}? O setor de atendimento é um dos maiores empregadores da cidade, com oportunidades em lojas, restaurantes, farmácias, supermercados e estabelecimentos comerciais. O BahiaVagas lista vagas atualizadas para atendentes em ${c}, incluindo posições com e sem experiência. Se você é comunicativo e gosta de lidar com o público, confira as vagas disponíveis e candidate-se.`,
    "operador-de-caixa": (c) => `Vagas para operador de caixa em ${c} são frequentemente abertas em supermercados, lojas, farmácias e postos de combustível. O BahiaVagas reúne as oportunidades mais recentes para operadores de caixa na região de ${c}. A função exige atenção, agilidade e bom atendimento ao cliente. Muitas vagas oferecem treinamento e não exigem experiência anterior. Confira as vagas abertas e candidate-se pelo BahiaVagas.`,
    "motorista": (c) => `Está buscando vagas de motorista em ${c}? O setor de transporte e logística em ${c} está sempre contratando motoristas para entregas, transporte de passageiros e frota corporativa. O BahiaVagas lista oportunidades para motoristas com diferentes categorias de CNH, incluindo vagas para entregadores e motoristas de aplicativo. Confira as vagas disponíveis em ${c} e candidate-se agora.`,
    "estoquista": (c) => `Vagas de estoquista em ${c} estão disponíveis no BahiaVagas. O estoquista é responsável por receber, organizar e controlar mercadorias em depósitos, centros de distribuição e lojas. Em ${c}, empresas de varejo, atacado e logística frequentemente abrem vagas para essa função. Muitas oportunidades não exigem experiência e oferecem treinamento. Veja as vagas abertas para estoquista em ${c}.`,
    "analista-de-marketing": (c) => `Encontre vagas de analista de marketing em ${c} no BahiaVagas. A área de marketing está em expansão em ${c}, com oportunidades em marketing digital, mídias sociais, SEO, tráfego pago e branding. Empresas de diversos setores buscam analistas de marketing para fortalecer sua presença online e ampliar seus resultados. Se você tem formação ou experiência em marketing, confira as vagas disponíveis e candidate-se.`,
    "auxiliar-de-servicos-gerais": (c) => `Procurando vagas de auxiliar de serviços gerais em ${c}? Essa é uma das funções com maior oferta de vagas na cidade, com oportunidades em condomínios, empresas, escolas, hospitais e comércios. O BahiaVagas reúne vagas atualizadas para auxiliar de serviços gerais em ${c}, muitas delas sem exigência de experiência prévia e com carteira assinada. Confira as vagas disponíveis abaixo.`,
    "telemarketing": (c) => `Vagas de telemarketing em ${c} estão disponíveis no BahiaVagas. O setor de call center e telemarketing é um dos maiores empregadores para quem busca uma oportunidade com horário flexível e possibilidade de crescimento. Em ${c}, diversas empresas de telecomunicações, bancos e serviços contratam operadores de telemarketing ativo e receptivo. Muitas vagas não exigem experiência e oferecem treinamento completo. Veja as vagas abertas e candidate-se.`,
  };

  return intros[profession.slug]?.(city.name) || 
    `Encontre vagas de ${profession.name.toLowerCase()} em ${city.name} no BahiaVagas. Confira as oportunidades de emprego abertas e candidate-se agora. Vagas atualizadas diariamente com as melhores empresas contratando em ${city.name}, Bahia.`;
}

// Generate intro texts for job type + city combinations
function generateJobTypeCityIntro(jobType: SeoJobType, city: SeoProgrammaticCity): string {
  const intros: Record<string, (city: string) => string> = {
    "emprego": (c) => `Encontre as melhores oportunidades de emprego em ${c} no BahiaVagas. Reunimos vagas atualizadas diariamente para profissionais de todas as áreas e níveis de experiência. O mercado de trabalho em ${c} oferece oportunidades em comércio, serviços, indústria, tecnologia e muito mais. Confira as vagas abertas e candidate-se agora.`,
    "vaga": (c) => `Procurando vagas em ${c}? O BahiaVagas lista as oportunidades mais recentes para profissionais de ${c} e região. Com vagas atualizadas todos os dias, você encontra oportunidades em diversas áreas e para todos os níveis de experiência. Não perca tempo: confira as vagas disponíveis abaixo.`,
    "trabalho": (c) => `Busque trabalho em ${c} com o BahiaVagas. Reunimos oportunidades de emprego em diversas áreas profissionais na cidade de ${c} e região. Seja você um profissional experiente ou alguém em busca do primeiro emprego, aqui você encontra vagas reais e atualizadas. Confira as oportunidades disponíveis.`,
    "vagas-hoje": (c) => `Confira as vagas publicadas hoje em ${c}. O BahiaVagas atualiza suas oportunidades diariamente, trazendo as vagas mais recentes para você. Empresas de ${c} estão contratando agora para diversas posições. Não perca as oportunidades do dia.`,
    "vagas-urgentes": (c) => `Vagas urgentes em ${c} com início imediato. Empresas da região de ${c} estão com processos seletivos abertos e precisam preencher posições rapidamente. O BahiaVagas lista as oportunidades mais urgentes para você se candidatar agora mesmo.`,
    "sem-experiencia": (c) => `Vagas sem experiência em ${c} para quem busca o primeiro emprego ou uma nova oportunidade profissional. Muitas empresas de ${c} não exigem experiência prévia e oferecem treinamento completo. O BahiaVagas reúne essas oportunidades para facilitar sua busca. Confira as vagas disponíveis.`,
    "jovem-aprendiz": (c) => `Vagas de jovem aprendiz em ${c} para jovens entre 14 e 24 anos. O programa de aprendizagem oferece carteira assinada, formação profissional e uma excelente oportunidade de início de carreira. Empresas de ${c} mantêm programas de jovem aprendiz ativos durante todo o ano. Veja as vagas disponíveis.`,
    "home-office": (c) => `Vagas home office disponíveis para profissionais de ${c} e região. Trabalhe de casa com flexibilidade e qualidade de vida. O BahiaVagas reúne oportunidades de trabalho remoto em diversas áreas, incluindo tecnologia, atendimento, marketing e vendas. Confira as vagas home office disponíveis.`,
  };

  return intros[jobType.slug]?.(city.name) ||
    `Confira as vagas de ${jobType.name.toLowerCase()} em ${city.name} no BahiaVagas. Oportunidades atualizadas diariamente para todas as áreas profissionais.`;
}

export interface ProgrammaticPage {
  slug: string; // e.g. "vendedor-salvador"
  fullPath: string; // e.g. "/vagas-vendedor-salvador"
  title: string;
  metaDescription: string;
  h1: string;
  introText: string;
  type: 'profession-city' | 'jobtype-city';
  profession?: SeoProfession;
  city: SeoProgrammaticCity;
  jobType?: SeoJobType;
  keywords: string[];
}

// Generate all profession × city pages
export function generateProfessionCityPages(): ProgrammaticPage[] {
  const pages: ProgrammaticPage[] = [];
  for (const profession of seoProfessions) {
    for (const city of seoCities) {
      const slug = `${profession.slug}-${city.slug}`;
      pages.push({
        slug,
        fullPath: `/vagas-${slug}`,
        title: `Vagas de ${profession.name} em ${city.name}, BA | BahiaVagas`,
        metaDescription: `Vagas de ${profession.name.toLowerCase()} em ${city.name}, Bahia. Oportunidades de emprego atualizadas diariamente. Candidate-se agora no BahiaVagas!`,
        h1: `Vagas de ${profession.name} em ${city.name}`,
        introText: generateProfessionCityIntro(profession, city),
        type: 'profession-city',
        profession,
        city,
        keywords: [...profession.keywords],
      });
    }
  }
  return pages;
}

// Generate all job-type × city pages
export function generateJobTypeCityPages(): ProgrammaticPage[] {
  const pages: ProgrammaticPage[] = [];
  for (const jobType of seoJobTypes) {
    for (const city of seoCities) {
      const slug = `${jobType.slug}-${city.slug}`;
      pages.push({
        slug,
        fullPath: `/vagas-${slug}`,
        title: `${jobType.name} em ${city.name}, BA | BahiaVagas`,
        metaDescription: `${jobType.name} em ${city.name}, Bahia. Encontre oportunidades de trabalho atualizadas. Candidate-se no BahiaVagas!`,
        h1: `${jobType.name} em ${city.name}`,
        introText: generateJobTypeCityIntro(jobType, city),
        type: 'jobtype-city',
        city,
        jobType,
        keywords: [...jobType.keywords],
      });
    }
  }
  return pages;
}

// Get all programmatic pages
export function getAllProgrammaticPages(): ProgrammaticPage[] {
  return [...generateProfessionCityPages(), ...generateJobTypeCityPages()];
}

// Lookup a page by slug
const _cache = new Map<string, ProgrammaticPage>();
export function getProgrammaticPageBySlug(slug: string): ProgrammaticPage | undefined {
  if (_cache.size === 0) {
    for (const page of getAllProgrammaticPages()) {
      _cache.set(page.slug, page);
    }
  }
  return _cache.get(slug);
}
