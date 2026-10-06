import Career from './Career';
import type { CareerData } from './Career';

type CareerListProps = {
  careers: CareerData[];
  isJapanese: boolean;
};

function CareerList(props: CareerListProps) {
  const careers = props.careers;

  return (
    <section id = "career">
      <h2>{props.isJapanese ? '経歴' : 'Career'}</h2>

      {careers.map((career) => (
          <Career
            key = {career.id}
            career = {career}
            isJapanese = {props.isJapanese}
          />
      ))}
    </section>
  );
}

export default CareerList;