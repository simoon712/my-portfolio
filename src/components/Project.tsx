import { useState } from "react";
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
  // 詳細表示の開閉状態を管理
  const [isOpen, setIsOpen] = useState(false);
  const detailsText = props.isJapanese ? '詳細 ▼' : 'Details ▼';
  const closeText = props.isJapanese ? '閉じる ▲' : 'Close ▲';

  return (
    <div className = "project-item">
      {/* タイトル */}
      <h3 className = "project-title">{props.isJapanese ? project.titleJa : project.titleEn}</h3>
      {isOpen && (
        <div className = "project-details">
          {/* 説明 */}
          <p className = "project-description">{props.isJapanese ? project.descriptionJa : project.descriptionEn}</p>
          {/* 使用技術 */}
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
          {/* リンク */}
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
      )}
      {/* 詳細ボタン */}
      <button
        className = "details-button"
        onClick = {() => setIsOpen(!isOpen)}
        >
          {isOpen ? closeText : detailsText}
      </button>
    </div>
  );
}
export default Project;