import { ExternalLink } from "lucide-react";

interface AdBannerProps {
  variant?: "vertical" | "horizontal";
  className?: string;
}

const mockAds = [
  {
    id: 1,
    title: "Curso de Programação",
    description: "Aprenda a programar do zero",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=250&fit=crop",
    sponsor: "TechAcademy",
  },
  {
    id: 2,
    title: "MBA Online",
    description: "Especialize-se em Gestão",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=250&fit=crop",
    sponsor: "UniEducação",
  },
  {
    id: 3,
    title: "Inglês Fluente",
    description: "Em apenas 18 meses",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&h=250&fit=crop",
    sponsor: "GlobalEnglish",
  },
  {
    id: 4,
    title: "Coworking Salvador",
    description: "Seu escritório na Bahia",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=250&fit=crop",
    sponsor: "WorkHub BA",
  },
  {
    id: 5,
    title: "Seguro Profissional",
    description: "Proteja sua carreira",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300&h=250&fit=crop",
    sponsor: "SeguroPro",
  },
  {
    id: 6,
    title: "Currículo Profissional",
    description: "Destaque-se no mercado",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=250&fit=crop",
    sponsor: "CVMaster",
  },
];

export const AdBanner = ({ variant = "vertical", className = "" }: AdBannerProps) => {
  const randomAds = [...mockAds].sort(() => Math.random() - 0.5).slice(0, variant === "vertical" ? 3 : 1);

  if (variant === "horizontal") {
    const ad = randomAds[0];
    return (
      <div className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}>
        <div className="flex items-center gap-4 p-3">
          <img 
            src={ad.image} 
            alt={ad.title}
            className="w-20 h-20 object-cover rounded-md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Patrocinado • {ad.sponsor}</p>
            <h4 className="font-semibold text-foreground truncate">{ad.title}</h4>
            <p className="text-sm text-muted-foreground truncate">{ad.description}</p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {randomAds.map((ad) => (
        <div 
          key={ad.id}
          className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        >
          <img 
            src={ad.image} 
            alt={ad.title}
            className="w-full h-32 object-cover"
          />
          <div className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Patrocinado • {ad.sponsor}</p>
            <h4 className="font-semibold text-foreground text-sm">{ad.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{ad.description}</p>
            <div className="flex items-center gap-1 mt-2 text-primary text-xs font-medium">
              <span>Saiba mais</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};