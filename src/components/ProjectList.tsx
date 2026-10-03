import Project from './Project';
import type { ProjectData } from './Project';

type ProjectListProps = {
  projects: ProjectData[];
};

function ProjectList(props: ProjectListProps) {
  const projects = props.projects;

  return (
    <section id = "projects">
      <h2>Projects</h2>

      {projects.map((project) => (
          <Project
            key = {project.id}
            project = {project}
          />
      ))}
    </section>
  );
}

export default ProjectList;