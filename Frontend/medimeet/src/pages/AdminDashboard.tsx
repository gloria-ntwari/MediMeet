import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService, DoctorDTO, DoctorUpdateDTO } from '../services/api';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { AppointmentResponse } from '../services/api';
import logo from "../assets/Group 4134.png";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// List of specializations
const specializations = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatrician",
    "Neurologist",
    "Gastroenterologist"
];

// You might want to move these to a separate icons file
const DashboardIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 13H10C10.55 13 11 12.55 11 12V4C11 3.45 10.55 3 10 3H4C3.45 3 3 3.45 3 4V12C3 12.55 3.45 13 4 13ZM4 21H10C10.55 21 11 20.55 11 20V16C11 15.45 10.55 15 10 15H4C3.45 15 3 15.45 3 16V20C3 20.55 3.45 21 4 21ZM14 21H20C20.55 21 21 20.55 21 20V12C21 11.45 20.55 11 20 11H14C13.45 11 13 11.45 13 12V20C13 20.55 13.45 21 14 21ZM13 4V8C13 8.55 13.45 9 14 9H20C20.55 9 21 8.55 21 8V4C21 3.45 20.55 3 20 3H14C13.45 3 13 3.45 13 4Z" fill="currentColor" />
    </svg>
);

const AppointmentIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8Z" fill="currentColor" />
    </svg>
);

const AddDoctorIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 12C17.21 12 19 10.21 19 8C19 5.79 17.21 4 15 4C12.79 4 11 5.79 11 8C11 10.21 12.79 12 15 12ZM6 10V7H4V10H1V12H4V15H6V12H9V10H6ZM15 14C12.33 14 7 15.34 7 18V20H23V18C23 15.34 17.67 14 15 14Z" fill="currentColor" />
    </svg>
);

const DoctorsListIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor" />
    </svg>
);

const PatientIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor" />
    </svg>
);

interface FormData {
    name: string;
    email: string;
    password: string;
    specialization: string;
    phone: string;
    about: string;
    experience: string;
}

// Add Modal component
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Edit Doctor</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const COLORS = ['#5f6fff', '#00C49F', '#FF8042'];

export default function AdminDashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract the current page from the URL path
    const path = location.pathname;
    const activePage = path.split('/')[2] || 'dashboard';

    // State for add doctor form
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        password: "",
        specialization: "",
        phone: "",
        about: "",
        experience: "",
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | undefined>(undefined);

    // State for doctors list
    const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

    // Add state for delete confirmation
    const [deletingDoctor, setDeletingDoctor] = useState<number | null>(null);

    // Add state for editing
    const [editingDoctor, setEditingDoctor] = useState<DoctorDTO | null>(null);

    // State for appointments list (admin)
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
    const [allRecentAppointments, setAllRecentAppointments] = useState<AppointmentResponse[]>([]);

    // State for admin dashboard stats
    const [stats, setStats] = useState<{ doctors: number, patients: number, admins: number, appointments: number } | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [filteredAppointments, setFilteredAppointments] = useState<AppointmentResponse[]>([]);

    // Add state for modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Add state for confirm modal
    const [confirmModal, setConfirmModal] = useState<{ open: boolean, onConfirm: () => void, message: string }>({ open: false, onConfirm: () => { }, message: '' });

    // Add state for pie chart data
    const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>({});
    const [appointmentsOverTime, setAppointmentsOverTime] = useState<{ date: string, count: number }[]>([]);

    // Add these state variables after the existing state declarations
    const [appointmentsPage, setAppointmentsPage] = useState(0);
    const [appointmentsPerPage] = useState(5);
    const [totalAppointmentPages, setTotalAppointmentPages] = useState(1);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle image upload
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Validate image format
            const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validFormats.includes(file.type)) {
                setError('Invalid image format. Only JPG, JPEG, PNG allowed.');
                return;
            }
            setImageFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Function to fetch doctors
    const fetchDoctors = async () => {
        setIsLoadingDoctors(true);
        try {
            const doctorsData = await authService.getAllDoctors();
            console.log('Fetched doctors:', doctorsData);
            setDoctors(doctorsData);
        } catch (error: any) {
            console.error('Failed to fetch doctors:', error);
            setError('Failed to load doctors. Please try again.');
        } finally {
            setIsLoadingDoctors(false);
        }
    };

    // Function to fetch all appointments for admin
    const fetchAppointments = async () => {
        setIsLoadingAppointments(true);
        try {
            const data = await authService.getAllAppointments();
            setAppointments(data);
            setTotalAppointmentPages(Math.ceil(data.length / appointmentsPerPage));
        } catch (error) {
            setError('Failed to load appointments. Please try again.');
        } finally {
            setIsLoadingAppointments(false);
        }
    };

    const fetchRecentAppointments = async () => {
        setIsLoadingAppointments(true);
        try {
            const response = await authService.getAllRecentAppointments();
            setAllRecentAppointments(response);
            setFilteredAppointments(response);
        } catch (error) {
            console.error('Error fetching recent appointments:', error);
            setError('Failed to fetch recent appointments');
        } finally {
            setIsLoadingAppointments(false);
        }
    };

    // Fetch admin dashboard stats
    const fetchStats = async () => {
        setIsLoadingStats(true);
        try {
            const data = await authService.getAdminDashboardStats();
            setStats(data);
        } catch (error) {
            setError('Failed to load dashboard statistics.');
        } finally {
            setIsLoadingStats(false);
        }
    };

    // Format date to display in a readable format
    const formatDate = (dateString: string | number[] | undefined) => {
        if (!dateString) return 'No date';

        let date;
        try {
            if (Array.isArray(dateString)) {
                // If date is an array [year, month, day]
                // Note: month is 1-indexed in the array, but 0-indexed in Date constructor
                date = new Date(dateString[0], dateString[1] - 1, dateString[2]);
            } else {
                date = new Date(dateString);
            }

            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        } catch (error) {
            console.error('Error formatting date:', error, dateString);
            return Array.isArray(dateString)
                ? `${dateString[0]}-${String(dateString[1]).padStart(2, '0')}-${String(dateString[2]).padStart(2, '0')}`
                : String(dateString);
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Log the data being sent
        console.log('Submitting doctor data:', {
            formData,
            imageFile: imageFile ? imageFile.name : 'No image',
            editingDoctor: editingDoctor ? editingDoctor.id : 'No editing doctor'
        });

        if (!imageFile && !editingDoctor) {
            setError('Image file is required for adding a doctor');
            setIsLoading(false);
            return;
        }

        try {
            if (editingDoctor) {
                // Update doctor
                console.log(`Updating doctor with ID: ${editingDoctor.id}`);

                // Create data object with correct type
                const doctorData: DoctorUpdateDTO = {
                    name: formData.name.trim(), // Trim to remove any extra spaces
                    email: formData.email.trim(),
                    specialization: formData.specialization,
                    phone: formData.phone.trim(),
                    about: formData.about.trim(),
                    experience: formData.experience.trim()
                };

                // Only add password if it's not empty
                if (formData.password) {
                    doctorData.password = formData.password;
                }

                console.log('Sending doctor data to API:', doctorData);

                await authService.updateDoctor(editingDoctor.id, doctorData, imageFile);
                console.log("Update completed, refreshing doctor list");
                await fetchDoctors(); // Refresh doctors list after update
                toast.success('Doctor updated successfully!');
                setEditingDoctor(null);
            } else {
                // Add new doctor
                console.log('Adding new doctor');

                // Validate required fields
                if (!formData.name.trim()) {
                    setError('Doctor name is required');
                    setIsLoading(false);
                    return;
                }
                if (!formData.email.trim()) {
                    setError('Doctor email is required');
                    setIsLoading(false);
                    return;
                }
                if (!formData.password) {
                    setError('Doctor password is required');
                    setIsLoading(false);
                    return;
                }
                if (!formData.specialization) {
                    setError('Doctor specialization is required');
                    setIsLoading(false);
                    return;
                }
                if (!formData.phone.trim()) {
                    setError('Doctor phone is required');
                    setIsLoading(false);
                    return;
                }
                if (!formData.about.trim()) {
                    setError('Doctor about is required');
                    setIsLoading(false);
                    return;
                }
                if (!formData.experience) {
                    setError('Doctor experience is required');
                    setIsLoading(false);
                    return;
                }

                await authService.addDoctor({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    specialization: formData.specialization,
                    phone: formData.phone.trim(),
                    about: formData.about.trim(),
                    experience: formData.experience.trim()
                }, imageFile!);
                await fetchDoctors(); // Refresh doctors list after adding
                toast.success('Doctor added successfully!');
            }

            // Reset the form after successful submission
            setFormData({
                name: "",
                email: "",
                password: "",
                specialization: "",
                phone: "",
                about: "",
                experience: "",
            });
            setImagePreview(null);
            setImageFile(undefined);
        } catch (err: any) {
            console.error('Error during submission:', err);
            if (err.response?.status === 409) {
                setError('Doctor with this email already exists.');
            } else {
                setError(err.message || 'Operation failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (doctor: DoctorDTO) => {
        setEditingDoctor(doctor);
        setFormData({
            name: doctor.name,
            email: doctor.email,
            password: '', // Don't pre-fill password
            specialization: doctor.specialization,
            phone: doctor.phone || '',
            about: doctor.about || '',
            experience: doctor.experience || '',
        });
        setImagePreview(doctor.imageUrl || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDoctor(null);
        setFormData({
            name: "",
            email: "",
            password: "",
            specialization: "",
            phone: "",
            about: "",
            experience: "",
        });
        setImagePreview(null);
        setImageFile(undefined);
        setError(null);
    };

    // Check authentication on component mount
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            // Redirect to login if not authenticated
            navigate('/admin-login');
            return;
        }

        try {
            const userData = JSON.parse(user);
            if (userData.role !== 'ADMIN') {
                // Redirect if not an admin
                navigate('/admin-login');
            }
        } catch (error) {
            // Handle invalid user data
            localStorage.removeItem('user');
            navigate('/admin-login');
        }
    }, [navigate]);

    // Fetch doctors when the doctors page is active
    useEffect(() => {
        if (activePage === 'doctors') {
            fetchDoctors();
        }
    }, [activePage]);

    // Fetch appointments when the appointments page is active
    useEffect(() => {
        if (activePage === 'appointments') {
            fetchAppointments();
        }
    }, [activePage]);

    // Fetch stats when the dashboard page is active
    useEffect(() => {
        if (activePage === 'dashboard') {
            fetchStats();
        }
    }, [activePage]);

    useEffect(() => {
        fetchRecentAppointments();
    }, []);

    useEffect(() => {
        // Fetch pie chart data
        authService.getAdminAppointmentStatusCounts().then(setStatusCounts);
        // Fetch line chart data
        authService.getAdminAppointmentsOverTime().then(setAppointmentsOverTime);
    }, []);

    // Prepare data for recharts
    const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    const lineData = appointmentsOverTime;

    // Function to handle doctor deletion (with confirmation modal)
    const handleDeleteDoctor = (id: number) => {
        setConfirmModal({
            open: true,
            message: 'Are you sure you want to delete this doctor?',
            onConfirm: () => handleDeleteDoctorConfirmed(id)
        });
    };

    // Actual delete after confirmation
    const handleDeleteDoctorConfirmed = async (id: number) => {
        setConfirmModal({ ...confirmModal, open: false });
        setDeletingDoctor(id);
        setError(null);
        try {
            await authService.deleteDoctor(id);
            setDoctors(prevDoctors => prevDoctors.filter(doctor => doctor.id !== id));
            toast.success('Doctor deleted successfully!');
        } catch (error: any) {
            const errorMessage = error.message || error.response?.data?.message || 'Failed to delete doctor. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setDeletingDoctor(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/admin-login');
    };

    // Add this function for appointments pagination
    const renderAppointmentsPagination = () => {
        return (
            <div className="flex items-center justify-between px-4 py-3 mt-4 border-t">
                <button
                    onClick={() => setAppointmentsPage(prev => Math.max(0, prev - 1))}
                    disabled={appointmentsPage === 0}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Previous
                </button>
                <span>Page {appointmentsPage + 1} of {totalAppointmentPages}</span>
                <button
                    onClick={() => setAppointmentsPage(prev => Math.min(totalAppointmentPages - 1, prev + 1))}
                    disabled={appointmentsPage === totalAppointmentPages - 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <Modal isOpen={confirmModal.open} onClose={() => setConfirmModal({ ...confirmModal, open: false })}>
                <div>
                    <p>{confirmModal.message}</p>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => setConfirmModal({ ...confirmModal, open: false })}>Cancel</Button>
                        <Button onClick={confirmModal.onConfirm} className="text-white bg-red-600">OK</Button>
                    </div>
                </div>
            </Modal>
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-8">
                        <img
            className="h-10 w-9"
            alt="Logo"
            src={logo}
          />
                            <h1 className="text-xl font-semibold">MediMeet</h1>
                            <span className="px-5 py-1 text-xs text-gray-600 border border-gray-700 rounded-xl">Admin</span>
                        </div>

                        <nav className="space-y-2">
                            <Link
                                to="/admin/dashboard"
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${activePage === 'dashboard' ? 'bg-[#5f6fff] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <DashboardIcon />
                                <span>Dashboard</span>
                            </Link>
                            <Link
                                to="/admin/appointments"
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${activePage === 'appointments' ? 'bg-[#5f6fff] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <AppointmentIcon />
                                <span>Appointments</span>
                            </Link>
                            <Link
                                to="/admin/add-doctor"
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${activePage === 'add-doctor' ? 'bg-[#5f6fff] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <AddDoctorIcon />
                                <span>Add Doctor</span>
                            </Link>
                            <Link
                                to="/admin/doctors"
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${activePage === 'doctors' ? 'bg-[#5f6fff] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <DoctorsListIcon />
                                <span>Doctors List</span>
                            </Link>
                            {/* <Link
                                to="/admin/patients"
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${activePage === 'patients' ? 'bg-[#5f6fff] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <PatientIcon />
                                <span>Patients</span>
                            </Link> */}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 bg-gray-50">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-semibold">
                            {activePage === 'dashboard' && 'Dashboard Overview'}
                            {activePage === 'appointments' && 'Appointments'}
                            {activePage === 'add-doctor' && 'Add Doctor'}
                            {activePage === 'doctors' && 'Doctors List'}
                        </h2>
                        <button
                            onClick={handleLogout}
                            className="px-5 py-2 text-white transition-colors bg-[#5f6fff] hover:bg-blue-100 rounded-full"
                        >
                            Logout
                        </button>
                    </div>

                    {activePage === 'dashboard' && (
                        <div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="p-6 bg-white shadow-sm rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
                                            <DoctorsListIcon />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-bold">{isLoadingStats ? '...' : stats?.doctors ?? '-'}</h3>
                                            <p className="text-gray-600">Doctors</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-white shadow-sm rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
                                            <AppointmentIcon />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-bold">{isLoadingStats ? '...' : stats?.appointments ?? '-'}</h3>
                                            <p className="text-gray-600">Appointments</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-white shadow-sm rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
                                            <PatientIcon />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-bold">{isLoadingStats ? '...' : stats?.patients ?? '-'}</h3>
                                            <p className="text-gray-600">Patients</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', marginTop: '2rem' }}>
                                <div style={{ flex: 1, background: 'white', borderRadius: '1rem', padding: '1rem', boxShadow: '0 2px 8px #eee' }}>
                                    <h3 className="mb-4 text-lg font-bold">Appointments by Status</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div style={{ flex: 2, background: 'white', borderRadius: '1rem', padding: '1rem', boxShadow: '0 2px 8px #eee' }}>
                                    <h3 className="mb-4 text-lg font-bold">Appointments Over Time</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={lineData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="count" stroke="#5f6fff" strokeWidth={3} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activePage === 'appointments' && (
                        <div className="p-6 bg-white shadow-sm rounded-xl">
                            <h1 className="mb-6 text-2xl font-bold">All Appointments</h1>
                            {isLoadingAppointments ? (
                                <div className="py-10 text-center">
                                    <div className="spinner"></div>
                                    <p className="mt-2 text-gray-600">Loading appointments...</p>
                                </div>
                            ) : error ? (
                                <div className="p-4 mb-4 text-red-700 bg-red-100 border-l-4 border-red-500">
                                    <p>{error}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="font-bold text-black border-b bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-sm font-medium">ID</th>
                                                    <th className="px-4 py-3 text-sm font-medium">Doctor</th>
                                                    <th className="px-4 py-3 text-sm font-medium">Patient</th>
                                                    <th className="px-4 py-3 text-sm font-medium">Date</th>
                                                    <th className="px-4 py-3 text-sm font-medium">Time</th>
                                                    <th className="px-6 py-3 text-sm font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {appointments
                                                    .slice(appointmentsPage * appointmentsPerPage, (appointmentsPage + 1) * appointmentsPerPage)
                                                    .map((apt) => (
                                                        <tr key={apt.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-sm">{apt.id}</td>
                                                            <td className="px-4 py-3">{apt.doctor?.name || 'N/A'}</td>
                                                            <td className="px-4 py-3">{apt.patient?.name || 'N/A'}</td>
                                                            <td className="px-4 py-3">{formatDate(apt.date)}</td>
                                                            <td className="px-4 py-3">
                                                                <span className="text-gray-500">
                                                                    {Array.isArray(apt.time)
                                                                        ? `${String(apt.time[0]).padStart(2, '0')}:${String(apt.time[1]).padStart(2, '0')}`
                                                                        : apt.time}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2 py-1 text-xs rounded-full ml-2 ${apt.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                                    apt.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {apt.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {renderAppointmentsPagination()}
                                </>
                            )}
                        </div>
                    )}

                    {(activePage === 'add-doctor') && (
                        <div className="max-w-4xl p-6 mx-auto bg-white shadow-sm rounded-xl">
                            <h3 className="mb-6 text-xl font-semibold text-gray-800">Add New Doctor</h3>

                            {error && (
                                <div className="p-3 mb-4 text-sm text-red-500 rounded-lg bg-red-50">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex gap-6">
                                    {/* Left Column - Image Upload */}
                                    <div className="w-1/3">
                                        <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
                                            <div className="mb-4 text-center">
                                                {imagePreview ? (
                                                    <div className="relative w-40 h-40 mx-auto mb-4">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Doctor preview"
                                                            className="object-cover w-full h-full rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setImagePreview(null);
                                                                setImageFile(undefined);
                                                            }}
                                                            className="absolute p-1 text-white bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center w-40 h-40 mx-auto mb-4 rounded-lg bg-gray-50">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                )}

                                                <label htmlFor="doctor-image" className="px-4 py-2 text-sm font-medium text-white bg-[#5f6fff] rounded-md cursor-pointer hover:bg-[#4b57ff]">
                                                    {imagePreview ? 'Change Photo' : 'Upload Photo'}
                                                </label>
                                                <input
                                                    id="doctor-image"
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                                <p className="mt-2 text-xs text-gray-500">
                                                    JPG, JPEG or PNG
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Form Fields */}
                                    <div className="w-2/3 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
                                                <Input
                                                    name="name"
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Dr. John Doe"
                                                    required
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                                                <Input
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="doctor@example.com"
                                                    required
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Phone</label>
                                                <Input
                                                    name="phone"
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+1234567890"
                                                    required
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Specialization</label>
                                                <select
                                                    name="specialization"
                                                    value={formData.specialization}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f6fff] focus:border-transparent"
                                                >
                                                    <option value="">Select specialization</option>
                                                    {specializations.map((spec) => (
                                                        <option key={spec} value={spec}>{spec}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Experience</label>
                                                <select
                                                    name="experience"
                                                    value={formData.experience}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f6fff] focus:border-transparent"
                                                >
                                                    <option value="">Select experience</option>
                                                    <option value="1-3 years">1-3 years</option>
                                                    <option value="3-5 years">3-5 years</option>
                                                    <option value="5-10 years">5-10 years</option>
                                                    <option value="10+ years">10+ years</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                                    Password
                                                </label>
                                                <Input
                                                    name="password"
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    placeholder="••••••••••"
                                                    required
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700">About</label>
                                            <textarea
                                                name="about"
                                                value={formData.about}
                                                onChange={handleChange}
                                                required
                                                rows={3}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f6fff] focus:border-transparent"
                                                placeholder="Brief description about the doctor"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-6 py-2 text-white bg-[#5f6fff] hover:bg-[#4b57ff] rounded-md"
                                    >
                                        {isLoading ? 'Adding...' : 'Add Doctor'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activePage === 'doctors' && (
                        <div className="p-6 bg-white shadow-sm rounded-xl">
                            <h3 className="mb-4 text-lg font-medium">Doctors List</h3>
                            {isLoadingDoctors ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="w-12 h-12 border-t-2 border-b-2 border-[#5f6fff] rounded-full animate-spin"></div>
                                </div>
                            ) : error ? (
                                <div className="p-3 mb-4 text-sm text-red-500 rounded-lg bg-red-50">
                                    {error}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-4 py-3 text-left">ID</th>
                                                <th className="px-4 py-3 text-left">Name</th>
                                                <th className="px-4 py-3 text-left">Specialization</th>
                                                <th className="px-4 py-3 text-left">Email</th>
                                                <th className="px-4 py-3 text-left">Phone</th>
                                                <th className="px-4 py-3 text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {doctors.length > 0 ? (
                                                doctors.map((doctor) => (
                                                    <tr key={doctor.id} className="border-b">
                                                        <td className="px-4 py-3">{doctor.id}</td>
                                                        <td className="px-4 py-3">{doctor.name}</td>
                                                        <td className="px-4 py-3">{doctor.specialization}</td>
                                                        <td className="px-4 py-3">{doctor.email}</td>
                                                        <td className="px-4 py-3">{doctor.phone}</td>
                                                        <td className="px-4 py-3">
                                                            <button
                                                                onClick={() => handleEditClick(doctor)}
                                                                className="mr-2 text-blue-600 hover:text-blue-800"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDoctor(doctor.id)}
                                                                disabled={deletingDoctor === doctor.id}
                                                                className={`text-red-600 hover:text-red-800 ${deletingDoctor === doctor.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                {deletingDoctor === doctor.id ? 'Deleting...' : 'Delete'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                                                        No doctors found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    <Modal isOpen={isModalOpen && !!editingDoctor} onClose={handleCloseModal}>
                        <div className="max-w-4xl p-6 mx-auto bg-white shadow-sm rounded-xl">
                            <h3 className="mb-6 text-xl font-semibold text-gray-800">Edit Doctor</h3>

                            {error && (
                                <div className="p-3 mb-4 text-sm text-red-500 rounded-lg bg-red-50">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex gap-6">
                                    {/* Left Column - Image Upload */}
                                    <div className="w-1/3">
                                        <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
                                            <div className="mb-4 text-center">
                                                {imagePreview ? (
                                                    <div className="relative w-40 h-40 mx-auto mb-4">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Doctor preview"
                                                            className="object-cover w-full h-full rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setImagePreview(null);
                                                                setImageFile(undefined);
                                                            }}
                                                            className="absolute p-1 text-white bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center w-40 h-40 mx-auto mb-4 rounded-lg bg-gray-50">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                )}

                                                <label htmlFor="doctor-image" className="px-4 py-2 text-sm font-medium text-white bg-[#5f6fff] rounded-md cursor-pointer hover:bg-[#4b57ff]">
                                                    {imagePreview ? 'Change Photo' : 'Upload Photo'}
                                                </label>
                                                <input
                                                    id="doctor-image"
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                                <p className="mt-2 text-xs text-gray-500">
                                                    JPG, JPEG or PNG
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Form Fields */}
                                    <div className="w-2/3 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
                                                <Input
                                                    name="name"
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Dr. John Doe"
                                                    required
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                                                <Input
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="doctor@example.com"
                                                    required
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Phone</label>
                                                <Input
                                                    name="phone"
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+1234567890"
                                                    required
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Specialization</label>
                                                <select
                                                    name="specialization"
                                                    value={formData.specialization}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f6fff] focus:border-transparent"
                                                >
                                                    <option value="">Select specialization</option>
                                                    {specializations.map((spec) => (
                                                        <option key={spec} value={spec}>{spec}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Experience</label>
                                                <select
                                                    name="experience"
                                                    value={formData.experience}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f6fff] focus:border-transparent"
                                                >
                                                    <option value="">Select experience</option>
                                                    <option value="1-3 years">1-3 years</option>
                                                    <option value="3-5 years">3-5 years</option>
                                                    <option value="5-10 years">5-10 years</option>
                                                    <option value="10+ years">10+ years</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                                    Password (optional)
                                                </label>
                                                <Input
                                                    name="password"
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    placeholder="••••••••••"
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700">About</label>
                                            <textarea
                                                name="about"
                                                value={formData.about}
                                                onChange={handleChange}
                                                required
                                                rows={3}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f6fff] focus:border-transparent"
                                                placeholder="Brief description about the doctor"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-6 py-2 text-white bg-[#5f6fff] hover:bg-[#4b57ff] rounded-md"
                                    >
                                        {isLoading ? 'Updating...' : 'Update Doctor'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Modal>
                </main>
            </div>
        </>
    );
}