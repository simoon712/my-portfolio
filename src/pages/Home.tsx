import Skills from '../components/Skills';
import type { CareerData } from '../components/Career';
import '../App.css';
import About from '../components/About';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CareerList from '../components/CareerList';
import ProjectList from '../components/ProjectList';
import type { ProjectData } from '../components/Project';
import { useState } from "react";

const careers: CareerData[] = [
  {
    id: 1,
    companyEn: 'BESTTECH Inc.',
    companyJa: 'ベストテック株式会社',
    positionEn: 'Mechanical Designer',
    positionJa: '機械設計エンジニア',
    period: '2013 - 2024',
    descriptionEn: 'Mechanical design',
    descriptionJa: '機械設計業務',
    companyUrl: 'https://www.besttechjp.com/'
  },
  {
    id: 2,
    companyEn: 'Marietta Inc.',
    companyJa: '株式会社マリエッタ',
    positionEn: 'Frontend Engineer',
    positionJa: 'フロントエンドエンジニア',
    period: '2024 - 2025',
    descriptionEn: 'WebCAD development and maintenance',
    descriptionJa: 'WebCADの開発・保守',
    companyUrl: 'https://www.marietta.co.jp/'
  }
];

const projects: ProjectData[] = [
  {
    id: 1,
    workType: 'personal',
    titleEn: 'Simple 2D Editor',
    titleJa: 'シンプルな2Dエディタ',
    descriptionEn: 'A simple 2D drawing application built with React and TypeScript.',
    descriptionJa: 'ReactとTypeScriptを使って構築された、シンプルな2D描画アプリケーションです。',
    technologies: ['TypeScript', 'React', 'HTML', 'CSS', 'Git'],
    githubUrl: '',
    projectUrl: '${import.meta.env.BASE_URL}#/editor'
  },
  {
    id: 2,
    workType: 'professional',
    titleEn: 'Banana Catch',
    titleJa: 'バナナキャッチ',
    descriptionEn: 'This is a reflex game where you have to catch spinning bananas at just the right moment.',
    descriptionJa: '回転するバナナをタイミングよくキャッチする反射神経ゲームです。',
    technologies: ['TypeScript', 'HTML', 'CSS', 'Git'],
    githubUrl: '',
    projectUrl: 'https://www.p-game.jp/game/371/detail'
  },
  {
    id: 3,
    workType: 'professional',
    titleEn: 'The Way of Sushi',
    titleJa: '寿司道',
    descriptionEn: 'This is a puzzle game where you clear a row or column by matching all the pieces in that row or column.',
    descriptionJa: 'タテ・ヨコ1列を同じネタにして消すパズルゲームです。',
    technologies: ['TypeScript', 'HTML', 'CSS', 'Git'],
    githubUrl: '',
    projectUrl: 'https://www.p-game.jp/game/376/detail'
  },
];

function Home() {
  // 表示言語の状態を管理（false: 英語 / true: 日本語）
  const [isJapanese, setIsJapanese] = useState(false);

  return (
    <>
      <Header
        isJapanese = {isJapanese}
        setIsJapanese = {setIsJapanese}
      />
      <main>
        <About
          isJapanese = {isJapanese}
        />

        <Skills
          isJapanese = {isJapanese}
          skills = {['TypeScript', 'JavaScript', 'HTML', 'CSS']}
        />

        <CareerList
          isJapanese = {isJapanese}
          careers = {careers}
        />

        <ProjectList
          isJapanese = {isJapanese}
          projects = {projects}
        />
      </main>

      <Footer />

    </>
  );
}

export default Home;