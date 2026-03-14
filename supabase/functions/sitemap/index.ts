import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BASE_URL = "https://bahiavagas.com";

const bahiaMunicipios: Record<string, string> = {
  "abaira": "Abaíra", "abare": "Abaré", "acajutiba": "Acajutiba", "adustina": "Adustina",
  "agua-fria": "Água Fria", "aiquara": "Aiquara", "alagoinhas": "Alagoinhas", "alcobaca": "Alcobaça",
  "almadina": "Almadina", "amargosa": "Amargosa", "amelia-rodrigues": "Amélia Rodrigues",
  "america-dourada": "América Dourada", "anage": "Anagé", "andarai": "Andaraí", "andorinha": "Andorinha",
  "angical": "Angical", "anguera": "Anguera", "antas": "Antas", "antonio-cardoso": "Antônio Cardoso",
  "antonio-goncalves": "Antônio Gonçalves", "apore": "Aporá", "apuarema": "Apuarema", "araças": "Araças",
  "aracatu": "Aracatu", "araci": "Araci", "aramari": "Aramari", "arataca": "Arataca", "aratuipe": "Aratuípe",
  "aurelino-leal": "Aurelino Leal", "baianopolis": "Baianópolis", "baixa-grande": "Baixa Grande",
  "banzae": "Banzaê", "barra": "Barra", "barra-da-estiva": "Barra da Estiva", "barra-do-choca": "Barra do Choça",
  "barra-do-mendes": "Barra do Mendes", "barra-do-rocha": "Barra do Rocha", "barreiras": "Barreiras",
  "barro-alto": "Barro Alto", "barro-preto": "Barro Preto", "barrocas": "Barrocas", "belmonte": "Belmonte",
  "belo-campo": "Belo Campo", "biritinga": "Biritinga", "boa-nova": "Boa Nova",
  "boa-vista-do-tupim": "Boa Vista do Tupim", "bom-jesus-da-lapa": "Bom Jesus da Lapa",
  "bom-jesus-da-serra": "Bom Jesus da Serra", "boninal": "Boninal", "bonito": "Bonito", "boquira": "Boquira",
  "botupora": "Botuporã", "brejoes": "Brejões", "brejolandia": "Brejolândia",
  "brotas-de-macaubas": "Brotas de Macaúbas", "brumado": "Brumado", "buerarema": "Buerarema",
  "buritirama": "Buritirama", "caatiba": "Caatiba", "cabaceiras-do-paraguacu": "Cabaceiras do Paraguaçu",
  "cachoeira": "Cachoeira", "cacule": "Caculé", "caem": "Caém", "caetanos": "Caetanos", "caetite": "Caetité",
  "cafarnaum": "Cafarnaum", "cairu": "Cairu", "caldeirao-grande": "Caldeirão Grande", "camacan": "Camacan",
  "camacari": "Camaçari", "camamu": "Camamu", "campo-alegre-de-lourdes": "Campo Alegre de Lourdes",
  "campo-formoso": "Campo Formoso", "canapolis": "Canápolis", "canarana": "Canarana",
  "canavieiras": "Canavieiras", "candeal": "Candeal", "candeias": "Candeias", "candiba": "Candiba",
  "candido-sales": "Cândido Sales", "cansancao": "Cansanção", "canudos": "Canudos",
  "capela-do-alto-alegre": "Capela do Alto Alegre", "capim-grosso": "Capim Grosso", "caraibas": "Caraíbas",
  "caravelas": "Caravelas", "cardeal-da-silva": "Cardeal da Silva", "carinhanha": "Carinhanha",
  "casa-nova": "Casa Nova", "castro-alves": "Castro Alves", "catolandia": "Catolândia", "catu": "Catu",
  "caturama": "Caturama", "central": "Central", "chorrocho": "Chorrochó", "cicero-dantas": "Cícero Dantas",
  "cipó": "Cipó", "coaraci": "Coaraci", "cocos": "Cocos", "conceicao-da-feira": "Conceição da Feira",
  "conceicao-do-almeida": "Conceição do Almeida", "conceicao-do-coite": "Conceição do Coité",
  "conceicao-do-jacuipe": "Conceição do Jacuípe", "conde": "Conde", "condeuba": "Condeúba",
  "contendas-do-sincora": "Contendas do Sincorá", "coracao-de-maria": "Coração de Maria",
  "cordeiros": "Cordeiros", "coribe": "Coribe", "coronel-joao-sa": "Coronel João Sá",
  "correntina": "Correntina", "cotegipe": "Cotegipe", "cravolandia": "Cravolândia",
  "crisopolis": "Crisópolis", "cristopolis": "Cristópolis", "cruz-das-almas": "Cruz das Almas",
  "curaca": "Curaçá", "dario-meira": "Dário Meira", "dias-davila": "Dias d'Ávila",
  "dom-basilio": "Dom Basílio", "dom-macedo-costa": "Dom Macedo Costa", "elísio-medrado": "Elísio Medrado",
  "encruzilhada": "Encruzilhada", "entre-rios": "Entre Rios", "erico-cardoso": "Érico Cardoso",
  "esplanada": "Esplanada", "euclides-da-cunha": "Euclides da Cunha", "eunapolis": "Eunápolis",
  "fatima": "Fátima", "feira-da-mata": "Feira da Mata", "feira-de-santana": "Feira de Santana",
  "filadelfia": "Filadélfia", "firmino-alves": "Firmino Alves", "floresta-azul": "Floresta Azul",
  "formosa-do-rio-preto": "Formosa do Rio Preto", "gandu": "Gandu", "gaviao": "Gavião",
  "gentio-do-ouro": "Gentio do Ouro", "gloria": "Glória", "gongogi": "Gongogi",
  "governador-mangabeira": "Governador Mangabeira", "guajeru": "Guajeru", "guanambi": "Guanambi",
  "guaratinga": "Guaratinga", "heliópolis": "Heliópolis", "iacu": "Iaçu", "ibiassuce": "Ibiassucê",
  "ibicarai": "Ibicaraí", "ibicoara": "Ibicoara", "ibicui": "Ibicuí", "ibipeba": "Ibipeba",
  "ibipitanga": "Ibipitanga", "ibiquera": "Ibiquera", "ibirapitanga": "Ibirapitanga",
  "ibirapua": "Ibirapuã", "ibirataia": "Ibirataia", "ibitiara": "Ibitiara", "ibitita": "Ibititá",
  "ibotirama": "Ibotirama", "ichu": "Ichu", "igapora": "Igaporã", "igrapiuna": "Igrapiúna",
  "iguai": "Iguaí", "ilheus": "Ilhéus", "inhambupe": "Inhambupe", "ipecaeta": "Ipecaetá",
  "ipiau": "Ipiaú", "ipira": "Ipirá", "ipupiara": "Ipupiara", "irajuba": "Irajuba", "iramaia": "Iramaia",
  "iraquara": "Iraquara", "irara": "Irará", "irece": "Irecê", "itabela": "Itabela",
  "itaberaba": "Itaberaba", "itabuna": "Itabuna", "itacare": "Itacaré", "itaete": "Itaeté",
  "itagi": "Itagi", "itagiba": "Itagibá", "itagimirim": "Itagimirim",
  "itaguacu-da-bahia": "Itaguaçu da Bahia", "itaju-do-colonia": "Itaju do Colônia",
  "itajuipe": "Itajuípe", "itamaraju": "Itamaraju", "itamari": "Itamari", "itambe": "Itambé",
  "itanagra": "Itanagra", "itanhem": "Itanhém", "itaparica": "Itaparica", "itape": "Itapé",
  "itapebi": "Itapebi", "itapetinga": "Itapetinga", "itapicuru": "Itapicuru", "itapitanga": "Itapitanga",
  "itaquara": "Itaquara", "itarantim": "Itarantim", "itatim": "Itatim", "itirucu": "Itiruçu",
  "itiuba": "Itiúba", "itororo": "Itororó", "ituacu": "Ituaçu", "itubera": "Ituberá", "iuiu": "Iuiú",
  "jaborandi": "Jaborandi", "jacaraci": "Jacaraci", "jacobina": "Jacobina", "jaguaquara": "Jaguaquara",
  "jaguarari": "Jaguarari", "jaguaripe": "Jaguaripe", "jandaira": "Jandaíra", "jequie": "Jequié",
  "jeremoabo": "Jeremoabo", "jiquirica": "Jiquiriçá", "jitauna": "Jitaúna", "joao-dourado": "João Dourado",
  "juazeiro": "Juazeiro", "jucurucu": "Jucuruçu", "jussara": "Jussara", "jussari": "Jussari",
  "jussiape": "Jussiape", "lafaiete-coutinho": "Lafaiete Coutinho", "lagedo-do-tabocal": "Lagedo do Tabocal",
  "lagoa-real": "Lagoa Real", "laje": "Laje", "lajedao": "Lajedão", "lajedinho": "Lajedinho",
  "lajedo-do-tabocal": "Lajedo do Tabocal", "lamarao": "Lamarão", "lapao": "Lapão",
  "lauro-de-freitas": "Lauro de Freitas", "lencois": "Lençóis", "licinio-de-almeida": "Licínio de Almeida",
  "livramento-de-nossa-senhora": "Livramento de Nossa Senhora",
  "luis-eduardo-magalhaes": "Luís Eduardo Magalhães", "macajuba": "Macajuba", "macarani": "Macarani",
  "macaubas": "Macaúbas", "macurure": "Macururé", "madre-de-deus": "Madre de Deus",
  "maetinga": "Maetinga", "maiquinique": "Maiquinique", "mairi": "Mairi", "malhada": "Malhada",
  "malhada-de-pedras": "Malhada de Pedras", "manoel-vitorino": "Manoel Vitorino", "mansidao": "Mansidão",
  "maracas": "Maracás", "maragogipe": "Maragogipe", "marau": "Maraú",
  "marcionilio-souza": "Marcionílio Souza", "mascote": "Mascote", "mata-de-sao-joao": "Mata de São João",
  "matina": "Matina", "medeiros-neto": "Medeiros Neto", "miguel-calmon": "Miguel Calmon",
  "milagres": "Milagres", "mirangaba": "Mirangaba", "mirante": "Mirante", "monte-santo": "Monte Santo",
  "morpara": "Morpará", "morro-do-chapeu": "Morro do Chapéu", "mortugaba": "Mortugaba",
  "mucuge": "Mucugê", "mucuri": "Mucuri", "mulungu-do-morro": "Mulungu do Morro",
  "mundo-novo": "Mundo Novo", "muniz-ferreira": "Muniz Ferreira",
  "muquem-do-sao-francisco": "Muquém do São Francisco", "muritiba": "Muritiba", "mutuipe": "Mutuípe",
  "nazare": "Nazaré", "nilo-pecanha": "Nilo Peçanha", "nordestina": "Nordestina",
  "nova-canaa": "Nova Canaã", "nova-fatima": "Nova Fátima", "nova-ibia": "Nova Ibiá",
  "nova-itarana": "Nova Itarana", "nova-redencao": "Nova Redenção", "nova-soure": "Nova Soure",
  "nova-vicosa": "Nova Viçosa", "novo-horizonte": "Novo Horizonte", "novo-triunfo": "Novo Triunfo",
  "olindina": "Olindina", "oliveira-dos-brejinhos": "Oliveira dos Brejinhos", "ouricangas": "Ouriçangas",
  "ourolandia": "Ourolândia", "palmas-de-monte-alto": "Palmas de Monte Alto", "palmeiras": "Palmeiras",
  "paramirim": "Paramirim", "paratinga": "Paratinga", "paripiranga": "Paripiranga",
  "pau-brasil": "Pau Brasil", "paulo-afonso": "Paulo Afonso", "pe-de-serra": "Pé de Serra",
  "pedrão": "Pedrão", "pedro-alexandre": "Pedro Alexandre", "piata": "Piatã",
  "pilao-arcado": "Pilão Arcado", "pindai": "Pindaí", "pindobacu": "Pindobaçu", "pintadas": "Pintadas",
  "pirai-do-norte": "Piraí do Norte", "piripa": "Piripá", "piritiba": "Piritiba",
  "planaltino": "Planaltino", "planalto": "Planalto", "pocoes": "Poções", "pojuca": "Pojuca",
  "ponto-novo": "Ponto Novo", "porto-seguro": "Porto Seguro", "potiraguá": "Potiraguá", "prado": "Prado",
  "presidente-dutra": "Presidente Dutra", "presidente-janio-quadros": "Presidente Jânio Quadros",
  "presidente-tancredo-neves": "Presidente Tancredo Neves", "queimadas": "Queimadas",
  "quijingue": "Quijingue", "quixabeira": "Quixabeira", "rafael-jambeiro": "Rafael Jambeiro",
  "remanso": "Remanso", "retirolandia": "Retirolândia", "riachao-das-neves": "Riachão das Neves",
  "riachao-do-jacuipe": "Riachão do Jacuípe", "riacho-de-santana": "Riacho de Santana",
  "ribeira-do-amparo": "Ribeira do Amparo", "ribeira-do-pombal": "Ribeira do Pombal",
  "ribeirao-do-largo": "Ribeirão do Largo", "rio-de-contas": "Rio de Contas",
  "rio-do-antonio": "Rio do Antônio", "rio-do-pires": "Rio do Pires", "rio-real": "Rio Real",
  "rodelas": "Rodelas", "ruy-barbosa": "Ruy Barbosa", "salinas-da-margarida": "Salinas da Margarida",
  "salvador": "Salvador", "santa-barbara": "Santa Bárbara", "santa-brigida": "Santa Brígida",
  "santa-cruz-cabralia": "Santa Cruz Cabrália", "santa-cruz-da-vitoria": "Santa Cruz da Vitória",
  "santa-ines": "Santa Inês", "santa-luzia": "Santa Luzia",
  "santa-maria-da-vitoria": "Santa Maria da Vitória", "santa-rita-de-cassia": "Santa Rita de Cássia",
  "santa-teresinha": "Santa Teresinha", "santaluz": "Santaluz", "santana": "Santana",
  "santanopolis": "Santanópolis", "santo-amaro": "Santo Amaro",
  "santo-antonio-de-jesus": "Santo Antônio de Jesus", "santo-estevao": "Santo Estêvão",
  "sao-desiderio": "São Desidério", "sao-domingos": "São Domingos", "sao-felipe": "São Felipe",
  "sao-felix": "São Félix", "sao-felix-do-coribe": "São Félix do Coribe",
  "sao-francisco-do-conde": "São Francisco do Conde", "sao-gabriel": "São Gabriel",
  "sao-goncalo-dos-campos": "São Gonçalo dos Campos", "sao-jose-da-vitoria": "São José da Vitória",
  "sao-jose-do-jacuipe": "São José do Jacuípe", "sao-miguel-das-matas": "São Miguel das Matas",
  "sao-sebastiao-do-passe": "São Sebastião do Passé", "sapeacu": "Sapeaçu", "satiro-dias": "Sátiro Dias",
  "saubara": "Saubara", "saude": "Saúde", "seabra": "Seabra",
  "sebastiao-laranjeiras": "Sebastião Laranjeiras", "senhor-do-bonfim": "Senhor do Bonfim",
  "sento-se": "Sento Sé", "serra-do-ramalho": "Serra do Ramalho", "serra-dourada": "Serra Dourada",
  "serra-preta": "Serra Preta", "serrinha": "Serrinha", "serrolandia": "Serrolândia",
  "simoes-filho": "Simões Filho", "sitio-do-mato": "Sítio do Mato",
  "sitio-do-quinto": "Sítio do Quinto", "sobradinho": "Sobradinho", "souto-soares": "Souto Soares",
  "tabocas-do-brejo-velho": "Tabocas do Brejo Velho", "tanhacu": "Tanhaçu", "tanque-novo": "Tanque Novo",
  "tanquinho": "Tanquinho", "taperoa": "Taperoá", "tapiramuta": "Tapiramutá",
  "teixeira-de-freitas": "Teixeira de Freitas", "teodoro-sampaio": "Teodoro Sampaio",
  "teofilandia": "Teofilândia", "teolandia": "Teolândia", "terra-nova": "Terra Nova",
  "tremedal": "Tremedal", "tucano": "Tucano", "uaua": "Uauá", "ubaia": "Ubaíra",
  "ubaitaba": "Ubaitaba", "ubata": "Ubatã", "uibai": "Uibaí", "umburanas": "Umburanas", "una": "Una",
  "urandi": "Urandi", "urucuca": "Uruçuca", "utinga": "Utinga", "valenca": "Valença",
  "valente": "Valente", "varzea-da-roca": "Várzea da Roça", "varzea-do-poco": "Várzea do Poço",
  "varzea-nova": "Várzea Nova", "varzedo": "Varzedo", "vera-cruz": "Vera Cruz", "vereda": "Vereda",
  "vitoria-da-conquista": "Vitória da Conquista", "wagner": "Wagner", "wanderley": "Wanderley",
  "wenceslau-guimaraes": "Wenceslau Guimarães", "xique-xique": "Xique-Xique",
};

serve(async () => {
  const today = new Date().toISOString().split("T")[0];

  const staticUrls = [
    { loc: "/", changefreq: "daily", priority: "1.0" },
    { loc: "/vagas", changefreq: "daily", priority: "0.9" },
    { loc: "/empresas", changefreq: "weekly", priority: "0.7" },
    { loc: "/urls", changefreq: "weekly", priority: "0.5" },
    { loc: "/auth", changefreq: "monthly", priority: "0.3" },
    { loc: "/privacidade", changefreq: "monthly", priority: "0.2" },
    { loc: "/termos-de-uso", changefreq: "monthly", priority: "0.2" },
    { loc: "/cookies-necessarios", changefreq: "monthly", priority: "0.1" },
  ];

  const seoJobPageSlugs = [
    "auxiliar-administrativo", "vendedor", "atendente", "jovem-aprendiz",
    "estagio", "sem-experiencia", "home-office", "meio-periodo",
    "atendimento-ao-cliente", "logistica",
  ];

  const seoJobUrls = seoJobPageSlugs.map((slug) => ({
    loc: `/vagas-${slug}`,
    changefreq: "daily",
    priority: "0.85",
  }));

  const municipioUrls = Object.keys(bahiaMunicipios).map((slug) => ({
    loc: `/vagas-${slug}`,
    changefreq: "daily",
    priority: "0.8",
  }));

  // Programmatic SEO pages: profession × city and job-type × city
  const professions = [
    "vendedor", "auxiliar-administrativo", "recepcionista", "atendente",
    "operador-de-caixa", "motorista", "estoquista", "analista-de-marketing",
    "auxiliar-de-servicos-gerais", "telemarketing",
  ];

  const cities = [
    "salvador", "feira-de-santana", "vitoria-da-conquista", "luis-eduardo-magalhaes",
    "ilheus", "itabuna", "camacari", "juazeiro", "barreiras", "porto-seguro",
  ];

  const jobTypes = [
    "emprego", "vaga", "trabalho", "vagas-hoje", "vagas-urgentes",
    "sem-experiencia", "jovem-aprendiz", "home-office",
  ];

  const programmaticUrls: { loc: string; changefreq: string; priority: string }[] = [];

  // Profession × City
  for (const prof of professions) {
    for (const city of cities) {
      programmaticUrls.push({
        loc: `/vagas-${prof}-${city}`,
        changefreq: "daily",
        priority: "0.75",
      });
    }
  }

  // Job Type × City
  for (const jt of jobTypes) {
    for (const city of cities) {
      programmaticUrls.push({
        loc: `/vagas-${jt}-${city}`,
        changefreq: "daily",
        priority: "0.7",
      });
    }
  }

  const allUrls = [...staticUrls, ...seoJobUrls, ...municipioUrls, ...programmaticUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${BASE_URL}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
