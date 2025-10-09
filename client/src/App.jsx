import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CompanyList from './pages/CompanyList.jsx'
import CompanyDetail from './pages/CompanyDetail.jsx'
import CreateRegistration from './pages/CreateRegistration.jsx'
import CreateCompany from './pages/CreateCompany.jsx'
import DriveStaff from './pages/DriveStaff.jsx'
import DriveStudent from './pages/DriveStudent.jsx'
import Experiences from './pages/Experiences.jsx'
import Profile from './pages/Profile.jsx'
import RegisterCompany from './pages/RegisterCompany.jsx'
import AddInterviewExperience from './pages/AddInterviewExperience.jsx'
import ExperienceApproval from './pages/ExperienceApproval.jsx'
import PlacedStudentExperience from './pages/PlacedStudentExperience.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import AuthGuard from './components/AuthGuard.jsx'
import Navbar from './components/Navbar.jsx'

function AppContent() {
  const location = useLocation()
  
  // Pages where navbar should be hidden
  const hideNavbarPages = ['/', '/login']
  const shouldShowNavbar = !hideNavbarPages.includes(location.pathname)

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/company" element={<AuthGuard><CompanyList /></AuthGuard>} />
        <Route path="/company/create" element={<AuthGuard><CreateCompany /></AuthGuard>} />
        <Route path="/company/:companyName" element={<AuthGuard><CompanyDetail /></AuthGuard>} />
        <Route path="/company/create-registration" element={<AuthGuard><CreateRegistration /></AuthGuard>} />
        <Route path="/drive/:companyName" element={<AuthGuard><DriveStudent /></AuthGuard>} />
        <Route path="/staff/drive/:id" element={<AuthGuard><DriveStaff /></AuthGuard>} />
        <Route path="/company/:companyName/interview-experience" element={<AuthGuard><Experiences /></AuthGuard>} />
        <Route path="/company/:companyName/add-interview-experience" element={<AuthGuard><AddInterviewExperience /></AuthGuard>} />
        <Route path="/placed-student/experience" element={<AuthGuard><PlacedStudentExperience /></AuthGuard>} />
        <Route path="/staff/experience-approval" element={<AuthGuard><ExperienceApproval /></AuthGuard>} />
        <Route path="/student/profile" element={<AuthGuard><Profile /></AuthGuard>} />
        <Route path="/company/:companyName/register" element={<AuthGuard><RegisterCompany /></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}



