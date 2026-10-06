import Project from './Project';
import type { ProjectData } from './Project';

type ProjectListProps = {
  projects: ProjectData[];
  isJapanese: boolean;
};

function ProjectList(props: ProjectListProps) {
  const projects = props.projects;

  return (
    <section id = "projects">
      <h2>{props.isJapanese ? '制作物' : 'Projects'}</h2>

      {projects.map((project) => (
          <Project
            key = {project.id}
            project = {project}
            isJapanese = {props.isJapanese}
          />
      ))}
    </section>
  );
}

export default ProjectList;