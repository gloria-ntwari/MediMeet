import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService, AppointmentResponse, DoctorProfileDTO } from '../services/api';
import { Input } from "../components/ui/input";
import { Button } from '../components/ui/button';
import './DoctorDashboard.css'; // Assuming you have or will create this file
import { ToastContainer, toast } from 'react-toastify';
import logo from "../assets/Group 4134.png"
import 'react-toastify/dist/ReactToastify.css';

// Icons for sidebar
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

const ProfileIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor" />
    </svg>
);

// New dropdown component
const DecisionDropdown = ({
    appointment,
    onDecisionChange
}: {
    appointment: AppointmentResponse,
    onDecisionChange: (id: number, decision: 'accepted' | 'rejected') => void
}) => {
    const [decision, setDecision] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as 'accepted' | 'rejected';
        setDecision(value);
        if (value) {
            onDecisionChange(appointment.id, value);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <select
                value={decision}
                onChange={handleChange}
                className="px-3 py-1.5 border border-blue-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#5f6fff] text-blue-600"
            >
                <option value="">Select decision</option>
                <option value="accepted">Accept</option>
                <option value="rejected">Reject</option>
            </select>
        </div>
    );
};

// Add a custom confirmation dialog component
const ConfirmationDialog = ({ isOpen, message, onConfirm, onCancel }: { isOpen: boolean, message: string, onConfirm: () => void, onCancel: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-w-sm p-6 text-gray-800 bg-white rounded-lg shadow-lg">
                <p className="mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 text-gray-800 transition-colors bg-blue-200 rounded-full hover:bg-blue-300"
                    >
                        OK
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-full hover:bg-blue-700"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// Add DeleteSuccessToast component
const DeleteSuccessToast = () => (
    <div className="flex items-center">
        <div className="p-2 mr-3 bg-[#5f6fff]/10 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#5f6fff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <div>
            <h4 className="font-semibold text-gray-900">Appointment Deleted</h4>
            <p className="text-sm text-gray-600">The appointment has been deleted.</p>
        </div>
    </div>
);

export default function DoctorDashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract the current page from the URL path
    const path = location.pathname;
    const activePage = path.includes('/appointments') ? 'appointments' :
        path.includes('/profile') ? 'profile' : 'dashboard';

    const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentResponse[]>([]);
    const [rejectedAppointments, setRejectedAppointments] = useState<AppointmentResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'rejected'>(
        location.pathname.includes('rejected') ? 'rejected' : 'upcoming'
    );
    const [filteredAppointments, setFilteredAppointments] = useState<AppointmentResponse[]>([]);

    // Doctor profile information
    const [doctorInfo, setDoctorInfo] = useState<any>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        specialisation: '',
        phone: '',
        about: '',
        experience: '',
        currentPassword: '',
        newPassword: '',

    });

    // Add state for confirmation dialog
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        message: '',
        appointmentId: -1
    });

    // In DoctorDashboard component, add state for decision confirmation
    const [decisionDialog, setDecisionDialog] = useState({
        isOpen: false,
        message: '',
        appointmentId: -1,
        decision: '' as 'accepted' | 'rejected' | ''
    });

    // Add these state variables after the existing state declarations
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const appointmentsPerPage = 5;

    // Add state for tab-specific pagination
    const [upcomingPage, setUpcomingPage] = useState(0);
    const [rejectedPage, setRejectedPage] = useState(0);
    const [upcomingTotalPages, setUpcomingTotalPages] = useState(1);
    const [rejectedTotalPages, setRejectedTotalPages] = useState(1);

    // Add state to hold all appointments for dashboard stats
    const [allDoctorAppointments, setAllDoctorAppointments] = useState<AppointmentResponse[]>([]);

    // Add state for dashboard stats
    const [stats, setStats] = useState({
        pending: 0,
        accepted: 0,
        rejected: 0,
        cancelled: 0
    });

    // Add an effect to handle tab changes
    useEffect(() => {
        if (activeTab === 'rejected') {
            setFilteredAppointments(rejectedAppointments);
        } else {
            setFilteredAppointments(upcomingAppointments);
        }
    }, [activeTab, rejectedAppointments, upcomingAppointments]);

    // Fetch paginated appointments for a given status
    const fetchPaginatedAppointments = async (status: 'upcoming' | 'rejected', page: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const { appointments, totalPages } = await authService.getDoctorAppointments(page, appointmentsPerPage);
            if (status === 'upcoming') {
                const filtered = appointments.filter((apt: AppointmentResponse) => apt.status === 'pending' || apt.status === 'accepted');
                setUpcomingAppointments(filtered);
                setUpcomingTotalPages(totalPages);
            } else {
                const filtered = appointments.filter((apt: AppointmentResponse) => apt.status === 'rejected' || apt.status === 'cancelled');
                setRejectedAppointments(filtered);
                setRejectedTotalPages(totalPages);
            }
        } catch (error) {
            setError('Failed to fetch appointments. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch appointments when page or tab changes
    useEffect(() => {
        if (activeTab === 'upcoming') {
            fetchPaginatedAppointments('upcoming', upcomingPage);
        } else {
            fetchPaginatedAppointments('rejected', rejectedPage);
        }
    }, [activeTab, upcomingPage, rejectedPage]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const authStatus = await authService.checkAuthStatus();
                if (!authStatus.authenticated || (authStatus.userFound && authStatus.role !== 'Doctor')) {
                    setError('Authentication failed. Please log in again.');
                    setTimeout(() => navigate('/doctor-login'), 2000);
                    return;
                }
            } catch (error) {
                console.error('Error checking auth:', error);
            }
        };

        const fetchProfile = async () => {
            try {
                const profile = await authService.getDoctorProfile();
                setDoctorInfo(profile);
                setProfileData({
                    name: profile.name,
                    email: profile.email,
                    specialisation: profile.specialisation,
                    phone: profile.phone,
                    about: profile.about,
                    experience: profile.experience,
                    currentPassword: '',
                    newPassword: ''
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Failed to fetch profile information');
            }
        };

        checkAuth();
        fetchProfile();
    }, []);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const counts = await authService.getLoggedInDoctorAppointmentCounts();
                setStats({
                    pending: counts.pending || 0,
                    accepted: counts.accepted || 0,
                    rejected: counts.rejected || 0,
                    cancelled: counts.cancelled || 0
                });
            } catch (error) {
                console.error('Error fetching appointment counts:', error);
            }
        };
        fetchCounts();
    }, []);

    useEffect(() => {
        const fetchRejected = async () => {
            try {
                const rejected = await authService.getLoggedInDoctorAppointmentsByStatus('rejected');
                // Map Appointment[] to AppointmentResponse[]
                const mapped = rejected.map(app => ({
                    id: app.id ? app.id : -1,
                    doctor: app.doctor,
                    patient: app.patient,
                    appointmentDate: app.date,
                    appointmentTime: app.time,
                    note: app.comment,
                    status: (app as any).status ?? 'pending',
                    date: app.date,
                    time: app.time,
                    comment: app.comment,
                    doctorName: app.doctor?.name,
                    doctorSpecialization: app.doctor?.specialization || '',
                    patientName: app.patient?.name,
                    patientEmail: app.patient?.email,
                    patientPhone: app.patient?.phone
                }));
                setRejectedAppointments(mapped);
            } catch (error) {
                console.error('Error fetching rejected appointments:', error);
            }
        };
        fetchRejected();
    }, []);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Validate password fields if any are filled
            if (profileData.currentPassword || profileData.newPassword) {
                if (!profileData.currentPassword) {
                    throw new Error('Current password is required to change password');
                }
                if (!profileData.newPassword) {
                    throw new Error('New password is required');
                }
            }

            // Create the doctor profile data object
            const doctorData: DoctorProfileDTO = {
                name: profileData.name,
                email: profileData.email,
                specialisation: profileData.specialisation,
                phone: profileData.phone,
                about: profileData.about,
                experience: profileData.experience,
                password: profileData.newPassword || undefined
            };

            // Call API to update profile
            const updatedProfile = await authService.updateDoctorProfile(doctorData);

            // Update both doctorInfo and profileData states with the correct values
            const updatedDoctorInfo = {
                name: updatedProfile.name,
                email: updatedProfile.email,
                specialisation: updatedProfile.specialisation,
                phone: updatedProfile.phone,
                about: updatedProfile.about,
                experience: updatedProfile.experience
            };

            setDoctorInfo(updatedDoctorInfo);
            setProfileData({
                ...updatedDoctorInfo,
                currentPassword: '',
                newPassword: ''
            });

            // Update localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({
                ...user,
                ...updatedDoctorInfo
            }));

            setIsEditingProfile(false);
            alert('Profile updated successfully!');
        } catch (err: any) {
            console.error('Failed to update profile:', err);
            setError(err.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/doctor-login');
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

    const handleAppointmentAction = async (appointmentId: number, action: string) => {
        setIsLoading(true);
        try {
            console.log(`Attempting to update appointment ${appointmentId} with action: ${action}`);

            // Call API to update appointment status
            await authService.updateAppointmentStatus(appointmentId, action);
            console.log('Update appointment response:', action);

            // Refresh appointments immediately after status update
            await fetchPaginatedAppointments(activeTab, currentPage);

        } catch (err) {
            console.error(`Failed to update appointment:`, err);
            setError(`Failed to update appointment. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDecisionChange = async (appointmentId: number, decision: string) => {
        console.log(`Decision change requested for appointment ${appointmentId}: ${decision}`);
        try {
            await handleAppointmentAction(appointmentId, decision);
            console.log('Decision change completed, appointments refreshed');
        } catch (error) {
            console.error('Error updating appointment status:', error);
            setError('Failed to update appointment status. Please try again.');
        }
    };

    // Replace handleRemoveAppointment to use the dialog
    const promptCancelAppointment = (appointmentId: number) => {
        setConfirmDialog({
            isOpen: true,
            message: 'Are you sure you want to remove this appointment?',
            appointmentId
        });
    };

    const handleCancelAppointment = async () => {
        const appointmentId = confirmDialog.appointmentId;
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        if (appointmentId < 0) return;
        setIsLoading(true);
        try {
            await authService.removeAppointment(appointmentId);
            // Update the appointments state
            setUpcomingAppointments(prev => prev.filter(app => app.id !== appointmentId));
            setRejectedAppointments(prev => prev.filter(app => app.id !== appointmentId));
            setFilteredAppointments(prev => prev.filter(app => app.id !== appointmentId));

            // Show success toast with single color progress bar
            toast(<DeleteSuccessToast />, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                style: { background: 'white' },
                progressStyle: { background: '#5f6fff' }
            });
        } catch (error) {
            console.error('Failed to remove appointment:', error);
            // Show error toast with single color progress bar
            toast.error('Failed to remove appointment. Please try again.', {
                style: { background: 'white' },
                progressStyle: { background: '#5f6fff' }
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for DecisionDropdown
    const handleDecisionDropdown = (appointmentId: number, decision: 'accepted' | 'rejected') => {
        setDecisionDialog({
            isOpen: true,
            message: `Are you sure you want to ${decision === 'accepted' ? 'accept' : 'reject'} this appointment?`,
            appointmentId,
            decision
        });
    };

    const handleConfirmDecision = async () => {
        const { appointmentId, decision } = decisionDialog;
        setDecisionDialog({ ...decisionDialog, isOpen: false });
        if (appointmentId < 0 || !decision) return;
        setIsLoading(true);
        try {
            await authService.updateAppointmentStatus(appointmentId, decision);
            await fetchPaginatedAppointments(activeTab, currentPage);
        } catch (error) {
            setError('Failed to update appointment status. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch all appointments for dashboard stats (not paginated)
    const fetchAllDoctorAppointments = async () => {
        try {
            const all = await authService.getAllAppointments();
            // Filter only this doctor's appointments if needed (if endpoint returns all doctors)
            // If backend returns only this doctor's appointments, skip this filter
            setAllDoctorAppointments(all);
        } catch (error) {
            // fallback: leave as empty
            setAllDoctorAppointments([]);
        }
    };

    // Fetch all appointments for stats on mount
    useEffect(() => {
        fetchAllDoctorAppointments();
    }, []);

    // Profile view component
    const renderProfile = () => (
        <div className="p-6 bg-white shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Your Profile</h2>
                {!isEditingProfile && (
                    <Button
                        onClick={() => setIsEditingProfile(true)}
                        className="bg-[#5f6fff] hover:bg-blue-600 text-white"
                    >
                        Edit Profile
                    </Button>
                )}
            </div>

            {error && (
                <div className="p-3 mb-4 text-sm text-red-500 rounded-lg bg-red-50">
                    {error}
                </div>
            )}

            {isEditingProfile ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
                            <Input
                                name="name"
                                value={profileData.name}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                            <Input
                                name="email"
                                type="email"
                                value={profileData.email}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Specialization</label>
                            <Input
                                name="specialization"
                                value={profileData.specialisation}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Phone</label>
                            <Input
                                name="phone"
                                value={profileData.phone}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">About</label>
                        <textarea
                            name="about"
                            value={profileData.about}
                            onChange={handleProfileChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Experience</label>
                        <textarea
                            name="experience"
                            value={profileData.experience}
                            onChange={handleProfileChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            rows={3}
                        />
                    </div>

                    <div>
                        <h3 className="mb-4 text-lg font-medium">Change Password (Optional)</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Current Password</label>
                                <Input
                                    name="currentPassword"
                                    type="password"
                                    value={profileData.currentPassword}
                                    onChange={handleProfileChange}
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">New Password</label>
                                <Input
                                    name="newPassword"
                                    type="password"
                                    value={profileData.newPassword}
                                    onChange={handleProfileChange}
                                />
                            </div>

                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            onClick={() => setIsEditingProfile(false)}
                            className="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#5f6fff] hover:bg-blue-600 text-white"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                            <p className="mt-1">Dr. {doctorInfo?.name || 'Not set'}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Email</h3>
                            <p className="mt-1">{doctorInfo?.email || 'Not set'}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Specialization</h3>
                            <p className="mt-1">{doctorInfo?.specialisation || 'Not set'}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                            <p className="mt-1">{doctorInfo?.phone || 'Not set'}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500">About</h3>
                        <p className="mt-1">{doctorInfo?.about || 'No information provided'}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Experience</h3>
                        <p className="mt-1">{doctorInfo?.experience || 'No information provided'}</p>
                    </div>
                </div>
            )}
        </div>
    );

    // Render pagination controls for each tab
    const renderPagination = () => {
        if (activeTab === 'upcoming') {
            return (
                <div className="flex items-center justify-between px-4 py-3 mt-4 border-t">
                    <button
                        onClick={() => setUpcomingPage(prev => Math.max(0, prev - 1))}
                        disabled={upcomingPage === 0}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span>Page {upcomingPage + 1} of {upcomingTotalPages}</span>
                    <button
                        onClick={() => setUpcomingPage(prev => Math.min(upcomingTotalPages - 1, prev + 1))}
                        disabled={upcomingPage === upcomingTotalPages - 1}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            );
        } else {
            return (
                <div className="flex items-center justify-between px-4 py-3 mt-4 border-t">
                    <button
                        onClick={() => setRejectedPage(prev => Math.max(0, prev - 1))}
                        disabled={rejectedPage === 0}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span>Page {rejectedPage + 1} of {rejectedTotalPages}</span>
                    <button
                        onClick={() => setRejectedPage(prev => Math.min(rejectedTotalPages - 1, prev + 1))}
                        disabled={rejectedPage === rejectedTotalPages - 1}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            );
        }
    };

    // Appointments view component
    const renderAppointments = () => (
        <div className="p-6 bg-white shadow-sm rounded-xl">
            <ToastContainer />
            <h1 className="mb-6 text-2xl font-bold">My Appointments</h1>

            {/* Loading state */}
            {isLoading && (
                <div className="py-10 text-center">
                    <div className="spinner"></div>
                    <p className="mt-2 text-gray-600">Loading appointments...</p>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="p-4 mb-4 text-red-700 bg-red-100 border-l-4 border-red-500">
                    <p>{error}</p>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && filteredAppointments.length === 0 && (
                <div className="py-16 text-center rounded-lg bg-gray-50">
                    <svg className="w-12 h-12 mx-auto text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {activeTab === 'upcoming'
                            ? "You don't have any upcoming appointments."
                            : "You don't have any past appointments."}
                    </p>
                </div>
            )}

            {/* Add tab switcher above the appointments table */}
            <div className="mb-4">
                <div className="flex space-x-4 border-b">
                    <button
                        className={`px-4 py-2 ${activeTab === 'upcoming'
                            ? 'border-b-2 border-[#5f6fff] text-[#5f6fff]'
                            : 'text-gray-500'}`}
                        onClick={() => {
                            setActiveTab('upcoming');
                        }}
                    >
                        Upcoming Appointments
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === 'rejected'
                            ? 'border-b-2 border-[#5f6fff] text-[#5f6fff]'
                            : 'text-gray-500'}`}
                        onClick={() => {
                            setActiveTab('rejected');
                        }}
                    >
                        Rejected Appointments
                    </button>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                message={confirmDialog.message}
                onConfirm={handleCancelAppointment}
                onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            />

            {/* Confirmation Dialog for decision */}
            <ConfirmationDialog
                isOpen={decisionDialog.isOpen}
                message={decisionDialog.message}
                onConfirm={handleConfirmDecision}
                onCancel={() => setDecisionDialog({ ...decisionDialog, isOpen: false })}
            />

            {/* Appointment list */}
            {!isLoading && !error && (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-gray-700 border-b bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-sm font-medium">ID</th>
                                    <th className="px-4 py-3 text-sm font-medium">Patient</th>
                                    <th className="px-4 py-3 text-sm font-medium">Date & Time</th>
                                    <th className="px-4 py-3 text-sm font-medium">Status</th>
                                    {activeTab === 'upcoming' && (
                                        <th className="px-4 py-3 text-sm font-medium">Decision</th>
                                    )}
                                    <th className="px-4 py-3 text-sm font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {(activeTab === 'upcoming' ? upcomingAppointments : rejectedAppointments).map(appointment => (
                                    <tr key={appointment.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium">{appointment.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{appointment.patientName || 'Unknown Patient'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {formatDate(appointment.date)}
                                            <br />
                                            <span className="text-gray-500">
                                                {Array.isArray(appointment.time)
                                                    ? `${String(appointment.time[0]).padStart(2, '0')}:${String(appointment.time[1]).padStart(2, '0')}`
                                                    : appointment.time}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${appointment.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    appointment.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {appointment.status}
                                            </span>
                                        </td>
                                        {activeTab === 'upcoming' && (
                                            <td className="px-4 py-3 w-9">
                                                <DecisionDropdown
                                                    appointment={appointment}
                                                    onDecisionChange={handleDecisionDropdown}
                                                />
                                            </td>
                                        )}
                                        <td className="px-4 py-3">
                                            <Button
                                                onClick={() => promptCancelAppointment(appointment.id)}
                                                className="bg-white border border-[#5f6fff] text-[#5f6fff] hover:bg-gray-50 text-xs px-3 py-1 h-8"
                                            >
                                                Cancel appointment
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {renderPagination()}
                </>
            )}
        </div>
    );

    // Dashboard overview component
    const renderDashboard = () => {
        // Only count appointments for the logged-in doctor
        const doctorId = doctorInfo?.id;
        const doctorAppointments = doctorId
            ? allDoctorAppointments.filter(a => a.doctor && (a.doctor.id === doctorId))
            : [];
        return (
            <div>
                <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
                    <div className="p-6 bg-white shadow-sm rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
                                <AppointmentIcon />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold">
                                    {stats.pending}
                                </h3>
                                <p className="text-gray-600">Pending Decisions</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-white shadow-sm rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50">
                                <AppointmentIcon />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold">
                                    {stats.accepted}
                                </h3>
                                <p className="text-gray-600">Accepted Appointments</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-white shadow-sm rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
                                <AppointmentIcon />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold">
                                    {stats.rejected}
                                </h3>
                                <p className="text-gray-600">Rejected Appointments</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent appointments */}
                <div className="p-6 bg-white shadow-sm rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Recent Appointments</h2>
                        <Link to="/doctor/dashboard/appointments" className="text-[#5f6fff] hover:underline text-sm">
                            View All
                        </Link>
                    </div>

                    {filteredAppointments.length === 0 ? (
                        <div className="py-6 text-center text-gray-500">
                            You have no appointments.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-gray-700 border-b bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-sm font-medium">ID</th>
                                        <th className="px-4 py-3 text-sm font-medium">Patient</th>
                                        <th className="px-4 py-3 text-sm font-medium">Date & Time</th>
                                        <th className="px-4 py-3 text-sm font-medium">Status</th>

                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredAppointments.slice(0, 3).map(appointment => (
                                        <tr key={appointment.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium">{appointment.id}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{appointment.patientName || 'Unknown Patient'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {formatDate(appointment.date)}
                                                <br />
                                                <span className="text-gray-500">
                                                    {Array.isArray(appointment.time)
                                                        ? `${String(appointment.time[0]).padStart(2, '0')}:${String(appointment.time[1]).padStart(2, '0')}`
                                                        : appointment.time}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${appointment.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                    appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        appointment.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {appointment.status}
                                                </span>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
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
                        <span className="px-5 py-1 text-xs text-gray-600 border border-gray-700 rounded-xl">Doctor</span>
                    </div>

                    <nav className="space-y-2">
                        <Link
                            to="/doctor/dashboard"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${activePage === 'dashboard' ? 'bg-[#5f6fff] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <DashboardIcon />
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            to="/doctor/dashboard/appointments"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${activePage === 'appointments' ? 'bg-[#5f6fff] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <AppointmentIcon />
                            <span>Appointments</span>
                        </Link>
                        <Link
                            to="/doctor/dashboard/profile"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${activePage === 'profile' ? 'bg-[#5f6fff] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <ProfileIcon />
                            <span>Profile</span>
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 bg-gray-50">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-semibold">
                        {activePage === 'dashboard' && 'Dashboard Overview'}
                        {activePage === 'appointments' && 'Appointments'}
                        {activePage === 'profile' && 'Doctor Profile'}
                    </h2>
                    <button
                        onClick={handleLogout}
                        className="px-5 py-2 text-white transition-colors bg-[#5f6fff] hover:bg-blue-600 rounded-full"
                    >
                        Logout
                    </button>
                </div>

                {activePage === 'dashboard' && renderDashboard()}
                {activePage === 'appointments' && renderAppointments()}
                {activePage === 'profile' && renderProfile()}
            </main>
        </div>
    );
} 