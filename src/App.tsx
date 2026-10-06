import Skills from './components/Skills';
import type { CareerData } from './components/Career';
import './App.css';
import About from './components/About';
import Header from './components/Header';
import Footer from './components/Footer';
import CareerList from './components/CareerList';
import ProjectList from './components/ProjectList';
import type { ProjectData } from './components/Project';
import { useState } from "react";

const careers: CareerData[] = [
  {
    id: 1,
    company: 'BESTTECH Inc.',
    positionEn: 'Mechanical Designer',
    positionJa: '機械設計エンジニア',
    period: '2013 - 2024',
    descriptionEn: 'Mechanical design',
    descriptionJa: '機械設計業務',
  },
  {
    id: 2,
    company: 'Marietta Inc.',
    positionEn: 'Frontend Engineer',
    positionJa: 'フロントエンドエンジニア',
    period: '2024 - 2025',
    descriptionEn: 'WebCAD development and maintenance',
    descriptionJa: 'WebCADの開発・保守',
  }
];

const projects: ProjectData[] = [
  {
    id: 1,
    titleEn: 'Simple 2D Editor',
    titleJa: 'シンプルな2Dエディタ',
    descriptionEn: 'A simple 2D drawing application built with React and TypeScript.',
    descriptionJa: 'ReactとTypeScriptを使って構築された、シンプルな2D描画アプリケーションです。',
    technologies: ['TypeScript', 'React', 'HTML', 'CSS', 'Git'],
    githubUrl: '',
    demoUrl: ''
  }
];

function App() {
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

export default App;