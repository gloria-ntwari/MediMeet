import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import About from "./pages/About"
import AdminLogin from "./pages/AdminLogin"
import AdminRegister from "./pages/AdminRegister"
import AdminDashboard from "./pages/AdminDashboard"
import PatientSignup from "./pages/PatientSignup"
import PatientLogin from "./pages/PatientLogin"
import DoctorLogin from "./pages/DoctorLogin"
import AllDoctors from "./pages/AllDoctors"
import DoctorDetail from "./pages/DoctorDetail"
import PatientProfile from "./pages/PatientProfile"
import PatientAppointments from "./pages/PatientAppointments"
import DoctorDashboard from "./pages/DoctorDashboard"
import Contact from "./pages/Contact"

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/patient-signup" element={<PatientSignup />} />
        <Route path="/all-doctors" element={<AllDoctors />} />
        <Route path="/doctor/:id" element={<DoctorDetail />} />
        <Route path="/contact" element={<Contact />} />

        {/* Patient routes */}
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />

        {/* Doctor routes */}
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/dashboard/appointments" element={<DoctorDashboard />} />
        <Route path="/doctor/dashboard/profile" element={<DoctorDashboard />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/appointments" element={<AdminDashboard />} />
        <Route path="/admin/add-doctor" element={<AdminDashboard />} />
        <Route path="/admin/doctors" element={<AdminDashboard />} />
        <Route path="/admin/patients" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
