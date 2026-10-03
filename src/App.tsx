import Skills from './components/Skills';
import type { CareerData } from './components/Career';
import './App.css';
import About from './components/About';
import Header from './components/Header';
import Footer from './components/Footer';
import CareerList from './components/CareerList';
import ProjectList from './components/ProjectList';
import type { ProjectData } from './components/Project';

const careers: CareerData[] = [
  {
    id: 1,
    company: 'BESTTECH Inc.',
    position: 'Mechanical Designer',
    period: '2013 - 2024',
    description: 'Mechanical design'
  },
  {
    id: 2,
    company: 'Marietta Inc.',
    position: 'Frontend Engineer',
    period: '2024 - 2025',
    description: 'WebCAD development and maintenance'
  }
];

const projects: ProjectData[] = [
  {
    id: 1,
    title: 'Simple 2D Editor',
    description: 'A simple 2D drawing application built with React and TypeScript.',
    technologies: ['TypeScript', 'React', 'HTML', 'CSS', 'Git'],
    githubUrl: '',
    demoUrl: ''
  }
];

function App() {
  return (
    <>
      <Header />

      <main>
        <About />

        <Skills skills = {['TypeScript', 'JavaScript', 'HTML', 'CSS']} />

        <CareerList careers = {careers} />

        <ProjectList projects = {projects} />

      </main>

      <Footer />

    </>
  );
}

export default App;