export type ProjectData = {
  id:           number;   // ID
  title:        string;   // プロジェクト名
  description:  string;   // プロジェクトの説明
  technologies: string[]; // 使用技術
  githubUrl:    string;   // GitHubのURL
  demoUrl:      string;   // 公開サイトのURL
};

type ProjectProps = {
  project: ProjectData;
};

function Project(props: ProjectProps) {
  const project = props.project;

  return (
    <div className = "project-item">
      <h3 className = "project-title">{project.title}</h3>
      <p className = "project-description">{project.description}</p>
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