type AboutProps = {
  isJapanese: boolean;
}

function About(props: AboutProps) {
  return (
    <section
      className = "about"
      id = "about"
    >
      <h2>{props.isJapanese ? '自己紹介' : 'About'}</h2>

      <p>
        {props.isJapanese ?
          '機械設計エンジニアとしての経験を経て、フロントエンド開発へ転向しました。TypeScriptを中心に、WebCADの開発・保守に携わってきました。' :
          "After working as a mechanical design engineer, I transitioned into frontend development. I have experience developing and maintaining WebCAD applications, primarily using TypeScript."
        }
      </p>

      <p>
        {props.isJapanese ?
          '現在はこれまでの実務経験をもとに、フロントエンドエンジニアとしてさらに技術の幅を広げるため、ReactなどのモダンなWeb技術にも取り組んでいます。' :
          "I am continuing to expand my frontend development skills by learning modern web technologies such as React."
        }
      </p>
    </section>
  );
}

export default About;