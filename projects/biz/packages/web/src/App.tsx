import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Interview } from './routes/Interview';
import { Landing } from './routes/Landing';
import { Preview } from './routes/Preview';
import { Projects } from './routes/Projects';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId/interview" element={<Interview />} />
        <Route path="/projects/:projectId/preview" element={<Preview />} />
      </Routes>
    </BrowserRouter>
  );
}
