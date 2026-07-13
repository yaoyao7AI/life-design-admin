import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import ArticlesPage from './pages/growth/ArticlesPage';
import ArticleEditorPage from './pages/growth/ArticleEditorPage';
import TopicsPage from './pages/growth/TopicsPage';
import HomeConfigPage from './pages/growth/HomeConfigPage';
import CoursesPage from './pages/growth/CoursesPage';
import AnalyticsPage from './pages/growth/AnalyticsPage';
import MemberContentPage from './pages/growth/MemberContentPage';
import AffirmationsList from './pages/AffirmationsList';
import CreateAffirmation from './pages/CreateAffirmation';
import EditAffirmation from './pages/EditAffirmation';
import PlayAffirmation from './pages/PlayAffirmation';
import './App.css';

function App() {
  return (
    <BrowserRouter basename="/admin">
      <div className="app">
        <Routes>
          {/* 后台主框架（成长管理 CMS） */}
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/growth/articles" replace />} />
            <Route path="/growth/articles" element={<ArticlesPage />} />
            <Route path="/growth/articles/new" element={<ArticleEditorPage />} />
            <Route
              path="/growth/articles/:id/edit"
              element={<ArticleEditorPage />}
            />
            <Route path="/growth/topics" element={<TopicsPage />} />
            <Route path="/growth/home" element={<HomeConfigPage />} />
            <Route path="/growth/courses" element={<CoursesPage />} />
            <Route path="/growth/analytics" element={<AnalyticsPage />} />
            <Route path="/growth/members" element={<MemberContentPage />} />
            {/* 遗留模块：肯定语管理列表 */}
            <Route path="/affirmations" element={<AffirmationsList />} />
          </Route>

          {/* 遗留全屏页面 */}
          <Route path="/create" element={<CreateAffirmation />} />
          <Route path="/edit/:id" element={<EditAffirmation />} />
          <Route path="/play" element={<PlayAffirmation />} />

          <Route path="*" element={<Navigate to="/growth/articles" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
