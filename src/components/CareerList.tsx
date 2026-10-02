import Career from './Career';
import type { CareerData } from './Career';

type CareerListProps = {
  careers: CareerData[];
};

function CareerList(props: CareerListProps) {
  const careers = props.careers;

  return (
    <section>
      <h2>Career</h2>

      {careers.map((career) => (
          <Career
            key = {career.id}
            career = {career}
          />
      ))}
    </section>
  );
}

export default CareerList;