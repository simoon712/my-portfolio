import Skills from './components/Skills';
import type { CareerData } from './components/Career';
import './App.css';
import About from './components/About';
import Projects from './components/Projects';
import Header from './components/Header';
import Footer from './components/Footer';
import CareerList from './components/CareerList';

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

function App() {
  return (
    <>
      <Header />

      <main>
        <About />

        <Skills skills = {['TypeScript', 'JavaScript', 'HTML', 'CSS']} />

        <CareerList careers = {careers} />

        <Projects />
      </main>

      <Footer />

    </>
  );
}

export default App;