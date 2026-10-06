export type ProjectData = {
  id:            number;   // ID
  titleEn:       string;   // プロジェクト名（英語）
  titleJa:       string;   // プロジェクト名（日本語）
  descriptionEn: string;   // プロジェクトの説明（英語）
  descriptionJa: string;   // プロジェクトの説明（日本語）
  technologies:  string[]; // 使用技術
  githubUrl:     string;   // GitHubのURL
  demoUrl:       string;   // 公開サイトのURL
};

type ProjectProps = {
  project: ProjectData;
  isJapanese: boolean;
};

function Project(props: ProjectProps) {
  const project = props.project;

  return (
    <div className = "project-item">
      <h3 className = "project-title">{props.isJapanese ? project.titleJa : project.titleEn}</h3>
      <p className = "project-description">{props.isJapanese ? project.descriptionJa : project.descriptionEn}</p>
      <ul className = "project-technologies">
        {project.technologies.map((technology) => {
          return (
            <li
              key = {technology}
              className = "technology-item"
            >
              {technology}
            </li>
          );
        })}
      </ul>
      <div className = "project-links">
        {/* URLがあるリンクだけ表示 */}
        {project.githubUrl && (
          <a
            href = {project.githubUrl}
            target = "_blank"
            rel = "noopener noreferrer"
          >
            GitHub
          </a>
        )}
        {project.demoUrl && (
          <a
            href = {project.demoUrl}
            target = "_blank"
            rel = "noopener noreferrer"
          >
            Live Demo
          </a>
        )}
      </div>
    </div>
  );
}
export default Project;