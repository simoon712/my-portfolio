function Header() {
  return (
    <header className = "header">
      <div className = "header-name">
        <h1>Yukihiro Ikuta</h1>
        <p>Frontend Engineer</p>
      </div>

      <nav className = "nav">
        <a href = "#about">About</a>
        <a href = "#skills">Skills</a>
        <a href = "#career">Career</a>
        <a href = "#projects">Projects</a>
      </nav>
    </header>
  );
}

export default Header;