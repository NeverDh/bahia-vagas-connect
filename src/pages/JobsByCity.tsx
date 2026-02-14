import { useEffect } from "react";
import Jobs from "./Jobs";

interface JobsByCityProps {
  cityName: string;
}

const JobsByCity = ({ cityName }: JobsByCityProps) => {
  useEffect(() => {
    document.title = `Vagas de Emprego em ${cityName}, Bahia | BahiaVagas`;

    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const desc = `Encontre as melhores vagas de emprego em ${cityName}, Bahia. Oportunidades CLT, PJ, estágio, freelance e mais. Candidate-se agora no BahiaVagas!`;

    setMeta("description", desc);
    setMeta("og:title", `Vagas de Emprego em ${cityName}, BA | BahiaVagas`, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:type", "website", "property");

    return () => {
      document.title = "BahiaVagas";
    };
  }, [cityName]);

  return <Jobs initialLocation={cityName} />;
};

export default JobsByCity;
