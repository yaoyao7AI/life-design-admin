import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import RequireAuth from './components/auth/RequireAuth';
import PermissionRoute from './components/auth/PermissionRoute';
import { PERMISSIONS } from './auth/permissions';
import ArticlesPage from './pages/growth/ArticlesPage';
import ArticleEditorPage from './pages/growth/ArticleEditorPage';
import TopicsPage from './pages/growth/TopicsPage';
import HomeConfigPage from './pages/growth/HomeConfigPage';
import CoursesPage from './pages/growth/CoursesPage';
import AnalyticsPage from './pages/growth/AnalyticsPage';
import MemberContentPage from './pages/growth/MemberContentPage';
import DesignLibraryCategoriesPage from './pages/growth/design-library/CategoriesPage';
import DesignLibraryTemplatesPage from './pages/growth/design-library/TemplatesPage';
import TemplateEditorPage from './pages/growth/design-library/TemplateEditorPage';
import DesignLibraryTagsPage from './pages/growth/design-library/TagsPage';
import DesignLibraryAnalyticsPage from './pages/growth/design-library/AnalyticsPage';
import DesignLibraryCollectionsPage from './pages/growth/design-library/CollectionsPage';
import AffirmationsList from './pages/AffirmationsList';
import CreateAffirmation from './pages/CreateAffirmation';
import EditAffirmation from './pages/EditAffirmation';
import PlayAffirmation from './pages/PlayAffirmation';
import LoginPage from './pages/Login/LoginPage';
import ConsolePage from './pages/Console/ConsolePage';
import EventsLayout from './pages/events/EventsLayout';
import EventsHomePage from './pages/events/EventsHomePage';
import EventsPlaceholderPage from './pages/events/EventsPlaceholderPage';
import OrganizationsPage from './pages/events/OrganizationsPage';
import { EventsAuthProvider } from './events-auth/EventsAuthContext';
import './App.css';
import './pages/Login/login.css';

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

function ProtectedOutlet() {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
}

function GrowthGuard() {
  return (
    <PermissionRoute permission={PERMISSIONS.GROWTH_ACCESS}>
      <Outlet />
    </PermissionRoute>
  );
}

function EventsGuard() {
  return (
    <PermissionRoute permission={PERMISSIONS.EVENTS_ACCESS}>
      <Outlet />
    </PermissionRoute>
  );
}

function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <div className="app">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedOutlet />}>
            <Route path="/console" element={<ConsolePage />} />

            {/* 成长运营中心 + 遗留成长后台页 */}
            <Route element={<GrowthGuard />}>
              <Route element={<AdminLayout />}>
                <Route path="/growth/articles" element={<ArticlesPage />} />
                <Route
                  path="/growth/articles/new"
                  element={<ArticleEditorPage />}
                />
                <Route
                  path="/growth/articles/:id/edit"
                  element={<ArticleEditorPage />}
                />
                <Route path="/growth/topics" element={<TopicsPage />} />
                <Route path="/growth/home" element={<HomeConfigPage />} />
                <Route path="/growth/courses" element={<CoursesPage />} />
                <Route path="/growth/analytics" element={<AnalyticsPage />} />
                <Route path="/growth/members" element={<MemberContentPage />} />
                <Route
                  path="/growth/design-library"
                  element={<Navigate to="/growth/design-library/templates" replace />}
                />
                <Route
                  path="/growth/design-library/categories"
                  element={<DesignLibraryCategoriesPage />}
                />
                <Route
                  path="/growth/design-library/templates"
                  element={<DesignLibraryTemplatesPage />}
                />
                <Route
                  path="/growth/design-library/templates/new"
                  element={<TemplateEditorPage />}
                />
                <Route
                  path="/growth/design-library/templates/:id/edit"
                  element={<TemplateEditorPage />}
                />
                <Route
                  path="/growth/design-library/tags"
                  element={<DesignLibraryTagsPage />}
                />
                <Route
                  path="/growth/design-library/analytics"
                  element={<DesignLibraryAnalyticsPage />}
                />
                <Route
                  path="/growth/design-library/collections"
                  element={<DesignLibraryCollectionsPage />}
                />
                <Route path="/affirmations" element={<AffirmationsList />} />
              </Route>
              <Route path="/create" element={<CreateAffirmation />} />
              <Route path="/edit/:id" element={<EditAffirmation />} />
            </Route>

            {/* 探索运营中心（内部平台运营） */}
            <Route element={<EventsGuard />}>
              <Route
                path="/events"
                element={
                  <EventsAuthProvider>
                    <EventsLayout />
                  </EventsAuthProvider>
                }
              >
                <Route index element={<EventsHomePage />} />
                <Route path="organizations" element={<OrganizationsPage />} />
                <Route
                  path="activities"
                  element={
                    <EventsPlaceholderPage
                      title="全部活动"
                      description="查看与运营平台全部活动。"
                    />
                  }
                />
                <Route
                  path="registrations"
                  element={
                    <EventsPlaceholderPage
                      title="报名管理"
                      description="查看与处理活动报名记录。"
                    />
                  }
                />
                <Route
                  path="users"
                  element={
                    <EventsPlaceholderPage
                      title="用户管理"
                      description="活动用户与参与者管理。"
                      comingSoon
                    />
                  }
                />
                <Route
                  path="finance"
                  element={
                    <EventsPlaceholderPage
                      title="财务中心"
                      description="活动相关财务数据。"
                      comingSoon
                    />
                  }
                />
                <Route
                  path="reviews"
                  element={
                    <EventsPlaceholderPage
                      title="审核管理"
                      description="活动与内容审核。"
                      comingSoon
                    />
                  }
                />
              </Route>
            </Route>
          </Route>

          {/* 播放页保持公开（C 端短链场景） */}
          <Route path="/play" element={<PlayAffirmation />} />

          <Route path="/" element={<Navigate to="/console" replace />} />
          <Route path="*" element={<Navigate to="/console" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
