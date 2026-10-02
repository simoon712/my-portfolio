export type CareerData = {
  id:          number; // id
  company:     string; // 会社名（企業名）
  position:    string; // 役職（職種・ポジション）
  period:      string; // 期間（在籍期間）
  description: string; // 業務内容（詳細・説明）
};

type CareerProps = {
  career: CareerData;
};

function Career(props: CareerProps) {
  const career = props.career;

  return (
    <div className = "career-item">
      <h3 className = "career-company">{career.company}</h3>
      <p className = "career-position">{career.position}</p>
      <p className = "career-period">{career.period}</p>
      <p className = "career-description">{career.description}</p>
    </div>
  );
}

export default Career;