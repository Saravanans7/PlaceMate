import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CompanyList from './pages/CompanyList.jsx'
import CompanyDetail from './pages/CompanyDetail.jsx'
import CreateRegistration from './pages/CreateRegistration.jsx'
import DriveStaff from './pages/DriveStaff.jsx'
import DriveStudent from './pages/DriveStudent.jsx'
import Experiences from './pages/Experiences.jsx'
import Profile from './pages/Profile.jsx'
import RegisterCompany from './pages/RegisterCompany.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import AuthGuard from './components/AuthGuard.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/company" element={<AuthGuard><CompanyList /></AuthGuard>} />
        <Route path="/company/:companyName" element={<AuthGuard><CompanyDetail /></AuthGuard>} />
        <Route path="/company/create-registration" element={<AuthGuard><CreateRegistration /></AuthGuard>} />
        <Route path="/drive/:companyName" element={<AuthGuard><DriveStudent /></AuthGuard>} />
        <Route path="/staff/drive/:id" element={<AuthGuard><DriveStaff /></AuthGuard>} />
        <Route path="/company/:companyName/interview-experience" element={<AuthGuard><Experiences /></AuthGuard>} />
        <Route path="/student/profile" element={<AuthGuard><Profile /></AuthGuard>} />
        <Route path="/company/:companyName/register" element={<AuthGuard><RegisterCompany /></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  )
}



