export type CareerData = {
  id:            number; // ID
  companyEn:     string; // 会社名（英語）
  companyJa:     string; // 会社名（日本語）
  positionEn:    string; // 職種（英語）
  positionJa:    string; // 職種（日本語）
  period:        string; // 在籍期間
  descriptionEn: string; // 業務内容（英語）
  descriptionJa: string; // 業務内容（日本語）
  companyUrl:    string; // 会社WebサイトのURL
};

type CareerProps = {
  career: CareerData;
  isJapanese: boolean;
};

function Career(props: CareerProps) {
  const career = props.career;

  return (
    <div className = "career-item">
      <h3 className = "career-company">
        <a
          href = {career.companyUrl}
          target = "_blank"
          rel = "noopener noreferrer"
        >
          {props.isJapanese ? career.companyJa : career.companyEn}
        </a>
      </h3>
      <p className = "career-position">{props.isJapanese ? career.positionJa : career.positionEn}</p>
      <p className = "career-period">{career.period}</p>
      <p className = "career-description">{props.isJapanese ? career.descriptionJa : career.descriptionEn}</p>
    </div>
  );
}

export default Career;