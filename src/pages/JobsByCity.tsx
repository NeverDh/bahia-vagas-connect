import Jobs from "./Jobs";

interface JobsByCityProps {
  cityName: string;
}

const JobsByCity = ({ cityName }: JobsByCityProps) => {
  return <Jobs initialLocation={cityName} />;
};

export default JobsByCity;
