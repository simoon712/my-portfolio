type SkillsProps = {
  skills: string[];
};

function Skills(props: SkillsProps) {
  const skills = props.skills;

  return (
    <section
      className = "skills"
      id = "skills"
    >
      <h2>Skills</h2>
      <ul className = "skill-list">
        {skills.map((skill) => {
          return (
            <li
              key = {skill}
              className = "skill-item"
            >
              {skill}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default Skills;