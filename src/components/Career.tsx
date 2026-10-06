export type CareerData = {
  id:            number; // id
  company:       string; // 会社名（企業名）
  positionEn:    string; // 役職（職種・ポジション）
  positionJa:    string; // 役職（職種・ポジション）
  period:        string; // 期間（在籍期間）
  descriptionEn: string; // 業務内容（詳細・説明）
  descriptionJa: string; // 業務内容（詳細・説明）
};

type CareerProps = {
  career: CareerData;
  isJapanese: boolean;
};

function Career(props: CareerProps) {
  const career = props.career;

  return (
    <div className = "career-item">
      <h3 className = "career-company">{career.company}</h3>
      <p className = "career-position">{props.isJapanese ? career.positionJa : career.positionEn}</p>
      <p className = "career-period">{career.period}</p>
      <p className = "career-description">{props.isJapanese ? career.descriptionJa : career.descriptionEn}</p>
    </div>
  );
}

export default Career;