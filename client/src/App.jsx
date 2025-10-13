import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CompanyList from './pages/CompanyList.jsx';
import CompanyDetail from './pages/CompanyDetail.jsx';
import CreateRegistration from './pages/CreateRegistration.jsx';
import CreateCompany from './pages/CreateCompany.jsx';
import EditCompany from './pages/EditCompany.jsx';
import DriveStaff from './pages/DriveStaff.jsx';
import DriveStudent from './pages/DriveStudent.jsx';
import Experiences from './pages/Experiences.jsx';
import Profile from './pages/Profile.jsx';
import RegisterCompany from './pages/RegisterCompany.jsx';
import AddInterviewExperience from './pages/AddInterviewExperience.jsx';
import ExperienceApproval from './pages/ExperienceApproval.jsx';
import PlacedStudentExperience from './pages/PlacedStudentExperience.jsx';
import Blacklist from './pages/Blacklist.jsx';
import PlacementDrives from './pages/PlacementDrives.jsx';
import ManageStudents from './pages/ManageStudents.jsx';
import SkeletonDemo from './pages/SkeletonDemo.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider, useToast } from './context/ToastContext.jsx';
import AuthGuard from './components/AuthGuard.jsx';
import Navbar from './components/Navbar.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import LoadingAnimation from './components/LoadingAnimation.jsx';
import Chatbot from './pages/Chatbot.jsx';

function AppContent() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const { toasts, removeToast } = useToast();

  // Hide navbar on home and login pages; show sidebar elsewhere
  const hideNavbarPages = ['/', '/login'];
  const shouldShowNavbar = !hideNavbarPages.includes(location.pathname);
  const isHome = location.pathname === '/';
  const showHeader = shouldShowNavbar && !isHome;

  // Show loading animation when user is being authenticated
  if (loading) {
    return <LoadingAnimation message="Authenticating..." />;
  }

  const pageTitle = () => {
    const p = location.pathname;
    if (p.startsWith('/dashboard')) return 'Dashboard';
    if (p.startsWith('/company') && p.includes('/interview-experience'))
      return 'Interview Experience';
    if (p.startsWith('/company') && p.includes('/create-registration'))
      return 'Create Registration';
    if (p.startsWith('/company')) return 'Companies';
    if (p.startsWith('/drive')) return 'Drives';
    if (p.startsWith('/staff/experience-approval'))
      return 'Experience Approval';
    if (p.startsWith('/staff/placement-drives')) return 'Placement Drives';
    if (p.startsWith('/staff/manage-students')) return 'Manage Students';
    if (p.startsWith('/student/profile')) return 'Profile';
    if (p.startsWith('/registrations')) return 'Registrations';
    return 'Dashboard';
  };

  return (
    <div
      className={
        (shouldShowNavbar && !isHome ? 'with-sidebar ' : '') +
        (showHeader ? 'with-header' : '')
      }
    >
      {shouldShowNavbar && <Navbar />}
      {showHeader && (
        <div className="app-topbar">
          <div className="app-topbar-title">{pageTitle()}</div>
          <div className="app-topbar-user">
            <span className="user-name">
              {user?.name || user?.email || 'User'}
            </span>
            <span className="profile-avatar" />
          </div>
        </div>
      )}
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/company"
            element={
              <AuthGuard>
                <CompanyList />
              </AuthGuard>
            }
          />
          <Route
            path="/company/create"
            element={
              <AuthGuard>
                <CreateCompany />
              </AuthGuard>
            }
          />
          <Route
            path="/company/edit/:id"
            element={
              <AuthGuard>
                <EditCompany />
              </AuthGuard>
            }
          />
          <Route
            path="/company/:companyName"
            element={
              <AuthGuard>
                <CompanyDetail />
              </AuthGuard>
            }
          />
          <Route
            path="/company/create-registration"
            element={
              <AuthGuard>
                <CreateRegistration />
              </AuthGuard>
            }
          />
          <Route
            path="/drive/:companyName"
            element={
              <AuthGuard>
                <DriveStudent />
              </AuthGuard>
            }
          />
          <Route
            path="/staff/drive/:id"
            element={
              <AuthGuard>
                <DriveStaff />
              </AuthGuard>
            }
          />
          <Route
            path="/experiences"
            element={
              <AuthGuard>
                <Experiences />
              </AuthGuard>
            }
          />
          <Route
            path="/company/:companyName/interview-experience"
            element={
              <AuthGuard>
                <Experiences />
              </AuthGuard>
            }
          />
          <Route
            path="/company/:companyName/add-interview-experience"
            element={
              <AuthGuard>
                <AddInterviewExperience />
              </AuthGuard>
            }
          />
          <Route
            path="/placed-student/experience"
            element={
              <AuthGuard>
                <PlacedStudentExperience />
              </AuthGuard>
            }
          />
          <Route
            path="/staff/experience-approval"
            element={
              <AuthGuard>
                <ExperienceApproval />
              </AuthGuard>
            }
          />
          <Route
            path="/staff/placement-drives"
            element={
              <AuthGuard>
                <PlacementDrives />
              </AuthGuard>
            }
          />
          <Route
            path="/staff/blacklist"
            element={
              <AuthGuard>
                <Blacklist />
              </AuthGuard>
            }
          />
          <Route
            path="/staff/manage-students"
            element={
              <AuthGuard>
                <ManageStudents />
              </AuthGuard>
            }
          />
          <Route
            path="/student/profile"
            element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            }
          />
          <Route
            path="/company/:companyName/register"
            element={
              <AuthGuard>
                <RegisterCompany />
              </AuthGuard>
            }
          />
          <Route
            path="/skeleton-demo"
            element={
              <AuthGuard>
                <SkeletonDemo />
              </AuthGuard>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {user && user.role === 'student' && shouldShowNavbar && <Chatbot />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
