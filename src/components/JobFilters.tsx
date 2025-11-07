import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";

interface JobFiltersProps {
  filters: {
    contractTypes: string[];
    experienceLevels: string[];
    remoteOnly: boolean;
  };
  onFilterChange: (filters: any) => void;
}

const contractTypes = [
  { value: "clt", label: "CLT" },
  { value: "pj", label: "PJ" },
  { value: "temporary", label: "Temporário" },
  { value: "intern", label: "Estágio" },
  { value: "freelance", label: "Freelance" }
];

const experienceLevels = [
  { value: "intern", label: "Estágio" },
  { value: "junior", label: "Júnior" },
  { value: "mid", label: "Pleno" },
  { value: "senior", label: "Sênior" },
  { value: "specialist", label: "Especialista" }
];

export const JobFilters = ({ filters, onFilterChange }: JobFiltersProps) => {
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

  return (
    <Card className="p-6 sticky top-20">
      <h3 className="font-semibold text-lg mb-4">Filtros</h3>
      
      <div className="space-y-4">
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
    </Card>
  );
};
