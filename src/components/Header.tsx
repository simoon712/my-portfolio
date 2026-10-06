type HeaderProps = {
  isJapanese: boolean;
  setIsJapanese: (value: boolean) => void;
};

function Header(props: HeaderProps) {

  return (
    <header className = "header">
      <div className = "header-name">
        <h1>{props.isJapanese ? '生田幸寛' : 'Yukihiro Ikuta'}</h1>
        <p>{props.isJapanese ? 'フロントエンド' : 'Frontend Engineer'}</p>
      </div>

      <nav className = "nav">
        <a href = "#about">{props.isJapanese ? '自己紹介' : 'About'}</a>
        <a href = "#skills">{props.isJapanese ? 'スキル' : 'Skills'}</a>
        <a href = "#career">{props.isJapanese ? '経歴' : 'Career'}</a>
        <a href = "#projects">{props.isJapanese ? '制作物' : 'Projects'}</a>
      </nav>
      <button
        onClick = {() => props.setIsJapanese(!props.isJapanese)}
        >
        {props.isJapanese ? 'EN' : 'JA'}
      </button>
    </header>
  );
}

export default Header;