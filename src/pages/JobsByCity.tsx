import { useParams, Navigate } from "react-router-dom";
import { getMunicipioBySlug } from "@/lib/bahia-municipios";
import Jobs from "./Jobs";

const JobsByCity = () => {
  const { slug } = useParams<{ slug: string }>();
  const municipio = slug ? getMunicipioBySlug(slug) : undefined;

  if (!municipio) {
    return <Navigate to="/vagas" replace />;
  }

  return <Jobs initialLocation={municipio} />;
};

export default JobsByCity;
