import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { Button } from "./ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface JobFiltersProps {
  filters: {
    contractTypes: string[];
    experienceLevels: string[];
    remoteOnly: boolean;
    location: string;
    sortOrder: "newest" | "oldest";
  };
  onFilterChange: (filters: any) => void;
  variant?: "desktop" | "mobile";
}

const contractTypes = [
  { value: "clt", label: "CLT" },
  { value: "pj", label: "PJ" },
  { value: "temporary", label: "Temporário" },
  { value: "intern", label: "Estágio" },
  { value: "freelance", label: "Freelance" }
];

const experienceLevels = [
  { value: "jovem_aprendiz", label: "Jovem Aprendiz" },
  { value: "auxiliar", label: "Auxiliar" },
  { value: "assistente", label: "Assistente" },
  { value: "intern", label: "Estágio" },
  { value: "freelancer", label: "Freelancer" },
  { value: "junior", label: "Júnior" },
  { value: "mid", label: "Pleno" },
  { value: "senior", label: "Sênior" },
  { value: "specialist", label: "Especialista" }
];

const bahiaMunicipios = [
  "Abaíra", "Abaré", "Acajutiba", "Adustina", "Água Fria", "Aiquara", "Alagoinhas", "Alcobaça",
  "Almadina", "Amargosa", "Amélia Rodrigues", "América Dourada", "Anagé", "Andaraí", "Andorinha",
  "Angical", "Anguera", "Antas", "Antônio Cardoso", "Antônio Gonçalves", "Aporá", "Apuarema",
  "Araças", "Aracatu", "Araci", "Aramari", "Arataca", "Aratuípe", "Aurelino Leal", "Baianópolis",
  "Baixa Grande", "Banzaê", "Barra", "Barra da Estiva", "Barra do Choça", "Barra do Mendes",
  "Barra do Rocha", "Barreiras", "Barro Alto", "Barro Preto", "Barrocas", "Belmonte", "Belo Campo",
  "Biritinga", "Boa Nova", "Boa Vista do Tupim", "Bom Jesus da Lapa", "Bom Jesus da Serra",
  "Boninal", "Bonito", "Boquira", "Botuporã", "Brejões", "Brejolândia", "Brotas de Macaúbas",
  "Brumado", "Buerarema", "Buritirama", "Caatiba", "Cabaceiras do Paraguaçu", "Cachoeira",
  "Caculé", "Caém", "Caetanos", "Caetité", "Cafarnaum", "Cairu", "Caldeirão Grande", "Camacan",
  "Camaçari", "Camamu", "Campo Alegre de Lourdes", "Campo Formoso", "Canápolis", "Canarana",
  "Canavieiras", "Candeal", "Candeias", "Candiba", "Cândido Sales", "Cansanção", "Canudos",
  "Capela do Alto Alegre", "Capim Grosso", "Caraíbas", "Caravelas", "Cardeal da Silva", "Carinhanha",
  "Casa Nova", "Castro Alves", "Catolândia", "Catu", "Caturama", "Central", "Chorrochó", "Cícero Dantas",
  "Cipó", "Coaraci", "Cocos", "Conceição da Feira", "Conceição do Almeida", "Conceição do Coité",
  "Conceição do Jacuípe", "Conde", "Condeúba", "Contendas do Sincorá", "Coração de Maria", "Cordeiros",
  "Coribe", "Coronel João Sá", "Correntina", "Cotegipe", "Cravolândia", "Crisópolis", "Cristópolis",
  "Cruz das Almas", "Curaçá", "Dário Meira", "Dias d'Ávila", "Dom Basílio", "Dom Macedo Costa",
  "Elísio Medrado", "Encruzilhada", "Entre Rios", "Érico Cardoso", "Esplanada", "Euclides da Cunha",
  "Eunápolis", "Fátima", "Feira da Mata", "Feira de Santana", "Filadélfia", "Firmino Alves",
  "Floresta Azul", "Formosa do Rio Preto", "Gandu", "Gavião", "Gentio do Ouro", "Glória",
  "Gongogi", "Governador Mangabeira", "Guajeru", "Guanambi", "Guaratinga", "Heliópolis",
  "Iaçu", "Ibiassucê", "Ibicaraí", "Ibicoara", "Ibicuí", "Ibipeba", "Ibipitanga", "Ibiquera",
  "Ibirapitanga", "Ibirapuã", "Ibirataia", "Ibitiara", "Ibititá", "Ibotirama", "Ichu", "Igaporã",
  "Igrapiúna", "Iguaí", "Ilhéus", "Inhambupe", "Ipecaetá", "Ipiaú", "Ipirá", "Ipupiara",
  "Irajuba", "Iramaia", "Iraquara", "Irará", "Irecê", "Itabela", "Itaberaba", "Itabuna",
  "Itacaré", "Itaeté", "Itagi", "Itagibá", "Itagimirim", "Itaguaçu da Bahia", "Itaju do Colônia",
  "Itajuípe", "Itamaraju", "Itamari", "Itambé", "Itanagra", "Itanhém", "Itaparica", "Itapé",
  "Itapebi", "Itapetinga", "Itapicuru", "Itapitanga", "Itaquara", "Itarantim", "Itatim",
  "Itiruçu", "Itiúba", "Itororó", "Ituaçu", "Ituberá", "Iuiu", "Jaborandi", "Jacaraci",
  "Jacobina", "Jaguaquara", "Jaguarari", "Jaguaripe", "Jandaíra", "Jequié", "Jeremoabo",
  "Jiquiriçá", "Jitaúna", "João Dourado", "Juazeiro", "Jucuruçu", "Jussara", "Jussari",
  "Jussiape", "Lafaiete Coutinho", "Lagoa Real", "Laje", "Lajedão", "Lajedinho", "Lajedo do Tabocal",
  "Lamarão", "Lapão", "Lauro de Freitas", "Lençóis", "Licínio de Almeida", "Livramento de Nossa Senhora",
  "Luís Eduardo Magalhães", "Macajuba", "Macarani", "Macaúbas", "Macururé", "Madre de Deus",
  "Maetinga", "Maiquinique", "Mairi", "Malhada", "Malhada de Pedras", "Manoel Vitorino",
  "Mansidão", "Maracás", "Maragogipe", "Maraú", "Marcionílio Souza", "Mascote", "Mata de São João",
  "Matina", "Medeiros Neto", "Miguel Calmon", "Milagres", "Mirangaba", "Mirante", "Monte Santo",
  "Morpará", "Morro do Chapéu", "Mortugaba", "Mucugê", "Mucuri", "Mulungu do Morro", "Mundo Novo",
  "Muniz Ferreira", "Muquém de São Francisco", "Muritiba", "Mutuípe", "Nazaré", "Nilo Peçanha",
  "Nordestina", "Nova Canaã", "Nova Fátima", "Nova Ibiá", "Nova Itarana", "Nova Redenção",
  "Nova Soure", "Nova Viçosa", "Novo Horizonte", "Novo Triunfo", "Olindina", "Oliveira dos Brejinhos",
  "Ouriçangas", "Ourolândia", "Palmas de Monte Alto", "Palmeiras", "Paramirim", "Paratinga",
  "Paripiranga", "Pau Brasil", "Paulo Afonso", "Pé de Serra", "Pedrão", "Pedro Alexandre",
  "Piatã", "Pilão Arcado", "Pindaí", "Pindobaçu", "Pintadas", "Piraí do Norte", "Piripá",
  "Piritiba", "Planaltino", "Planalto", "Poções", "Pojuca", "Ponto Novo", "Porto Seguro",
  "Potiraguá", "Prado", "Presidente Dutra", "Presidente Jânio Quadros", "Presidente Tancredo Neves",
  "Queimadas", "Quijingue", "Quixabeira", "Rafael Jambeiro", "Remanso", "Retirolândia",
  "Riachão das Neves", "Riachão do Jacuípe", "Riacho de Santana", "Ribeira do Amparo",
  "Ribeira do Pombal", "Ribeirão do Largo", "Rio de Contas", "Rio do Antônio", "Rio do Pires",
  "Rio Real", "Rodelas", "Ruy Barbosa", "Salinas da Margarida", "Salvador", "Santa Bárbara",
  "Santa Brígida", "Santa Cruz Cabrália", "Santa Cruz da Vitória", "Santa Inês", "Santa Luzia",
  "Santa Maria da Vitória", "Santa Rita de Cássia", "Santa Teresinha", "Santaluz", "Santana",
  "Santanópolis", "Santo Amaro", "Santo Antônio de Jesus", "Santo Estêvão", "São Desidério",
  "São Domingos", "São Felipe", "São Félix", "São Félix do Coribe", "São Francisco do Conde",
  "São Gabriel", "São Gonçalo dos Campos", "São José da Vitória", "São José do Jacuípe",
  "São Miguel das Matas", "São Sebastião do Passé", "Sapeaçu", "Sátiro Dias", "Saubara",
  "Saúde", "Seabra", "Sebastião Laranjeiras", "Senhor do Bonfim", "Sento Sé", "Serra do Ramalho",
  "Serra Dourada", "Serra Preta", "Serrinha", "Serrolândia", "Simões Filho", "Sítio do Mato",
  "Sítio do Quinto", "Sobradinho", "Souto Soares", "Tabocas do Brejo Velho", "Tanhaçu", "Tanque Novo",
  "Tanquinho", "Taperoá", "Tapiramutá", "Teixeira de Freitas", "Teodoro Sampaio", "Teofilândia",
  "Teolândia", "Terra Nova", "Tremedal", "Tucano", "Uauá", "Ubaíra", "Ubaitaba", "Ubatã",
  "Uibaí", "Umburanas", "Una", "Urandi", "Uruçuca", "Utinga", "Valença", "Valente",
  "Várzea da Roça", "Várzea do Poço", "Várzea Nova", "Varzedo", "Vera Cruz", "Vereda",
  "Vitória da Conquista", "Wagner", "Wanderley", "Wenceslau Guimarães", "Xique-Xique"
];

export const JobFilters = ({ filters, onFilterChange, variant = "desktop" }: JobFiltersProps) => {
  const [locationOpen, setLocationOpen] = useState(false);

  const handleContractTypeChange = (value: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.contractTypes, value]
      : filters.contractTypes.filter(t => t !== value);
    onFilterChange({ ...filters, contractTypes: newTypes });
  };

  const handleExperienceChange = (value: string, checked: boolean) => {
    const newLevels = checked
      ? [...filters.experienceLevels, value]
      : filters.experienceLevels.filter(l => l !== value);
    onFilterChange({ ...filters, experienceLevels: newLevels });
  };

  const content = (
    <div className="space-y-4">
      {/* Sort Order */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Ordenar por</Label>
        <Select
          value={filters.sortOrder}
          onValueChange={(value: "newest" | "oldest") => onFilterChange({ ...filters, sortOrder: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mais recentes primeiro</SelectItem>
            <SelectItem value="oldest">Mais antigas primeiro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Location Filter with Autocomplete */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Município</Label>
        <Popover open={locationOpen} onOpenChange={setLocationOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={locationOpen}
              className="w-full justify-between font-normal"
            >
              {filters.location || "Todos os municípios"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 pointer-events-auto" align="start">
            <Command>
              <CommandInput placeholder="Buscar município..." />
              <CommandList>
                <CommandEmpty>Município não encontrado.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      onFilterChange({ ...filters, location: "" });
                      setLocationOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !filters.location ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Todos os municípios
                  </CommandItem>
                  {bahiaMunicipios.map(municipio => (
                    <CommandItem
                      key={municipio}
                      value={municipio}
                      onSelect={(value) => {
                        onFilterChange({ ...filters, location: value });
                        setLocationOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          filters.location === municipio ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {municipio}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Separator />

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="remote" 
          checked={filters.remoteOnly}
          onCheckedChange={(checked) => onFilterChange({ ...filters, remoteOnly: checked })}
        />
        <Label htmlFor="remote" className="cursor-pointer">Apenas vagas remotas</Label>
      </div>
      
      <Separator />
      
      <div>
        <Label className="text-sm font-semibold mb-3 block">Tipo de Contrato</Label>
        <div className="space-y-2">
          {contractTypes.map(type => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox 
                id={`contract-${type.value}`}
                checked={filters.contractTypes.includes(type.value)}
                onCheckedChange={(checked) => handleContractTypeChange(type.value, checked as boolean)}
              />
              <Label htmlFor={`contract-${type.value}`} className="cursor-pointer text-sm">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <Label className="text-sm font-semibold mb-3 block">Nível de Experiência</Label>
        <div className="space-y-2">
          {experienceLevels.map(level => (
            <div key={level.value} className="flex items-center space-x-2">
              <Checkbox 
                id={`exp-${level.value}`}
                checked={filters.experienceLevels.includes(level.value)}
                onCheckedChange={(checked) => handleExperienceChange(level.value, checked as boolean)}
              />
              <Label htmlFor={`exp-${level.value}`} className="cursor-pointer text-sm">
                {level.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (variant === "mobile") {
    return content;
  }

  return (
    <Card className="p-6 sticky top-20">
      <h3 className="font-semibold text-lg mb-4">Filtros</h3>
      {content}
    </Card>
  );
};
