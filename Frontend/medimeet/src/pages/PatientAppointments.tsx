import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Calendar, Clock, MapPin, X } from "lucide-react";
import { authService, AppointmentResponse } from "../services/api";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '../components/ui/button';
import DoctorImage from "../components/DoctorImage";

// Custom toast component for cancellation
const DeleteSuccessToast = () => (
    <div className="flex items-center">
        <div className="p-2 mr-3 bg-green-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <div>
            <h4 className="font-semibold text-gray-900">Appointment Deleted</h4>
            <p className="text-sm text-gray-600">Your appointment has been cancelled and deleted.</p>
        </div>
    </div>
);

// Custom confirmation dialog component
interface ConfirmationDialogProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationDialog = ({ isOpen, message, onConfirm, onCancel }: ConfirmationDialogProps) => {
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

export default function PatientAppointments() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allAppointments, setAllAppointments] = useState<AppointmentResponse[]>([]);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        message: '',
        appointmentId: -1
    });

    // Format date from ISO to readable format
    const formatDate = (dateStr: string | number[] | undefined): string => {
        if (!dateStr) return 'No date';

        try {
            if (Array.isArray(dateStr)) {
                // Convert date array [year, month, day] to Date object
                const [year, month, day] = dateStr;
                // Note: month is 0-indexed in JS Date
                return new Date(year, month - 1, day).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            } else {
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
        } catch (e) {
            console.error('Error formatting date:', e, dateStr);
            return Array.isArray(dateStr)
                ? `${dateStr[0]}-${String(dateStr[1]).padStart(2, '0')}-${String(dateStr[2]).padStart(2, '0')}`
                : String(dateStr);
        }
    };


    // Format time to 12-hour format
    const formatTime = (timeStr: string | number[] | undefined): string => {
        if (!timeStr) return 'No time';

        try {
            if (Array.isArray(timeStr)) {
                // Handle time array [hour, minute]
                const [hour, minute] = timeStr;
                const hourNum = Number(hour);
                const minuteStr = String(minute).padStart(2, '0');

                if (hourNum === 0) {
                    return `12:${minuteStr} AM`;
                } else if (hourNum < 12) {
                    return `${hourNum}:${minuteStr} AM`;
                } else if (hourNum === 12) {
                    return `12:${minuteStr} PM`;
                } else {
                    return `${hourNum - 12}:${minuteStr} PM`;
                }
            } else {
                // If it's just HH:MM format
                if (timeStr.length <= 5) {
                    const [hours, minutes] = timeStr.split(':');
                    const hour = parseInt(hours);

                    if (hour === 0) {
                        return `12:${minutes} AM`;
                    } else if (hour < 12) {
                        return `${hour}:${minutes} AM`;
                    } else if (hour === 12) {
                        return `12:${minutes} PM`;
                    } else {
                        return `${hour - 12}:${minutes} PM`;
                    }
                }

                // For more complex time formats
                const date = new Date(`2000-01-01T${timeStr}`);
                return date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            }
        } catch (e) {
            console.error('Error formatting time:', e, timeStr);
            return Array.isArray(timeStr)
                ? `${timeStr[0]}:${String(timeStr[1]).padStart(2, '0')}`
                : String(timeStr);
        }
    };

    useEffect(() => {
        // Check if user is logged in
        const storedUserData = localStorage.getItem('user');

        if (!storedUserData) {
            navigate('/patient-login');
            return;
        }

        try {
            const user = JSON.parse(storedUserData);

            // Check if user is a patient
            if (user.role !== 'PATIENT') {
                navigate('/');
                return;
            }

            // Fetch patient appointments
            const fetchAppointments = async () => {
                try {
                    setLoading(true);
                    const appointments = await authService.getPatientAppointments();
                    setAllAppointments(appointments);
                    setError(null);
                } catch (error: any) {
                    console.error('Error fetching appointments:', error);
                    setError('Failed to load appointments. Please try again later.');
                } finally {
                    setLoading(false);
                }
            };

            fetchAppointments();
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/patient-login');
        }
    }, [navigate]);

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

        try {
            setLoading(true);
            await authService.cancelAppointment(appointmentId);
            setAllAppointments(prev => prev.filter(app => app.id !== appointmentId));
            toast(<DeleteSuccessToast />, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error: any) {
            console.error('Error deleting appointment:', error);
            toast.error(error.message || 'Failed to delete appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden bg-white">
            <Header />
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Custom confirmation dialog */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                message={confirmDialog.message}
                onConfirm={handleCancelAppointment}
                onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            />

            <div className="container flex-grow px-4 py-10 mx-auto md:px-20">
                <h1 className="mb-6 text-3xl font-bold">My Booking</h1>

                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                )}

                {error && (
                    <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}

                {!loading && allAppointments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Calendar className="w-16 h-16 mb-4 text-gray-400" />
                        <h2 className="mb-2 text-xl font-semibold text-gray-800">No Appointments</h2>
                        <p className="text-gray-600">You don't have any appointments scheduled yet.</p>
                        <Link
                            to="/all-doctors"
                            className="px-6 py-2 mt-4 text-white transition-colors bg-[#5f6fff] rounded-md hover:bg-[#4b57e8]"
                        >
                            Book an Appointment
                        </Link>
                    </div>
                )}

                {!loading && allAppointments.length > 0 && (
                    <div className="space-y-4">
                        {allAppointments.map((appointment, index) => (
                            <div key={appointment.id} className="relative p-6 bg-white border border-gray-200 rounded-lg shadow-sm ">
                                <div className="flex flex-col md:flex-row">
                                    <div className="flex mb-4 md:mb-0">
                                        {/* Doctor image and info */}
                                        <div className="flex-shrink-0 w-16 h-16 mr-4 overflow-hidden rounded-full">
                                            <DoctorImage
                                                name={appointment.doctorName || appointment.doctor.name}
                                                imageUrl={appointment.doctor.imageUrl}
                                                index={index}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">Dr. {appointment.doctorName || appointment.doctor.name}</h3>
                                            <p className="text-sm text-gray-500">{appointment.doctor.specialisation}</p>
                                        </div>
                                    </div>

                                    {/* Appointment details */}
                                    <div className="flex-grow ml-0 md:ml-8">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar size={16} className="mr-2 text-blue-500" />
                                                <span>Date: {formatDate(appointment.appointmentDate || appointment.date)}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Clock size={16} className="mr-2 text-blue-500" />
                                                <span>Time: {formatTime(appointment.appointmentTime || appointment.time)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status and Cancel buttons */}
                                    <div className="flex flex-col items-end justify-center mt-4 space-y-2 md:mt-0">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full mb-16 ${
                                            appointment.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                            appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            appointment.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {appointment.status}
                                        </span>
                                        <Button
                                            onClick={() => promptCancelAppointment(appointment.id)}
                                            className="bg-white border border-[#5f6fff] text-[#5f6fff] hover:bg-gray-50 text-xs px-3 py-1 h-8"
                                        >
                                            Cancel appointment
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
} 