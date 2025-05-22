// AppointmentModal.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { authService, CreateAppointmentRequest } from '../services/api';
import { useNavigate } from 'react-router-dom'; // For redirection
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay } from 'date-fns';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctorName: string;
    doctorId: number;
}

export default function AppointmentModal({ isOpen, onClose, doctorName, doctorId }: AppointmentModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const navigate = useNavigate(); // For redirecting to login page

    // Time slots in HH:MM format for Java's LocalTime.parse()
    const timeSlots = [
        '10:00', '10:30', '11:00',
        '11:30', '12:00', '12:30',
        '13:00', '13:30', '14:00',
        '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00',
        '17:30', '18:00', '18:30'
    ];

    // Generate calendar days for the current month
    const generateCalendarDays = () => {
        const days = [];
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDayOfMonth = startOfMonth(currentMonth);
        const firstDayOfWeek = getDay(firstDayOfMonth); // 0 for Sunday, 1 for Monday, etc.

        // Add days from previous month to fill the first row
        if (firstDayOfWeek > 0) {
            const prevMonth = subMonths(currentMonth, 1);
            const daysInPrevMonth = getDaysInMonth(prevMonth);

            for (let i = firstDayOfWeek - 1; i >= 0; i--) {
                const day = daysInPrevMonth - i;
                days.push({
                    day: day,
                    month: 'prev',
                    date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day)
                });
            }
        }

        // Add days from current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                month: 'current',
                date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)
            });
        }

        // Add days from next month to fill the remaining cells (6 rows of 7 days = 42 cells)
        const totalCells = 42;
        const remainingCells = totalCells - days.length;

        if (remainingCells > 0) {
            const nextMonth = addMonths(currentMonth, 1);

            for (let i = 1; i <= remainingCells; i++) {
                days.push({
                    day: i,
                    month: 'next',
                    date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i)
                });
            }
        }

        return days;
    };

    // Navigation functions
    const goToPreviousMonth = () => {
        setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
    };

    // Display time in more readable format
    const formatTimeForDisplay = (time: string): string => {
        const [hours, minutes] = time.split(':');
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
    };

    // Check if date is today or in the past
    const isDateDisabled = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Compare dates by converting to timestamps (to ignore time component)
        const dateTimestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const todayTimestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

        return dateTimestamp < todayTimestamp;
    };

    useEffect(() => {
        // Check if user is logged in when the modal opens
        if (isOpen) {
            const storedUserData = localStorage.getItem('user');
            if (!storedUserData) {
                setError("Please log in to book an appointment");
            } else {
                // Clear any previous errors or selected values when opening modal
                setError(null);
                setSuccessMessage(null);
            }
        }
    }, [isOpen, navigate]);

    const handleSubmit = async () => {
        // Check user authentication
        const storedUserData = localStorage.getItem('user');
        if (!storedUserData) {
            setError("Please log in to book an appointment");
            setTimeout(() => {
                onClose();
                navigate('/patient-login');
            }, 2000);
            return;
        }

        // Clear previous messages
        setError(null);
        setSuccessMessage(null);

        // Validate inputs
        if (!selectedDate) {
            setError("Please select a date");
            return;
        }

        if (!selectedTime) {
            setError("Please select a time");
            return;
        }

        // Format date for API (YYYY-MM-DD)
        const appointmentDate = format(selectedDate, 'yyyy-MM-dd');

        setLoading(true);
        try {
            const appointmentData: CreateAppointmentRequest = {
                doctorId: doctorId,
                date: appointmentDate,
                time: selectedTime,
                comment: note || "" // Ensure comment is never null
            };

            console.log('Sending appointment data:', appointmentData);

            await authService.bookAppointment(appointmentData);

            // Show success message
            setSuccessMessage(`Appointment booked successfully with Dr. ${doctorName}`);

            // Reset form
            setSelectedDate(null);
            setSelectedTime(null);
            setNote('');

            // Close modal after 2 seconds
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err: any) {
            console.error('Appointment booking error:', err);
            setError(err.message || 'Failed to book appointment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const days = generateCalendarDays();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-3xl p-6 mx-4 bg-white rounded-lg shadow-lg">
                {/* Header with close button */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Book Appointment with {doctorName}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Error and Success Messages */}
                {error && (
                    <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="p-3 mb-4 text-green-700 bg-green-100 rounded-md">
                        {successMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Date Selection */}
                    <div>
                        <h3 className="mb-2 text-sm font-medium text-blue-600">Select Date</h3>
                        <div className="p-4 border rounded-md">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    className="text-gray-400 hover:text-gray-600"
                                    onClick={goToPreviousMonth}
                                >
                                    &lt;
                                </button>
                                <h4 className="font-medium">{format(currentMonth, 'MMMM yyyy')}</h4>
                                <button
                                    className="text-gray-400 hover:text-gray-600"
                                    onClick={goToNextMonth}
                                >
                                    &gt;
                                </button>
                            </div>

                            {/* Calendar */}
                            <div className="grid grid-cols-7 gap-1">
                                {/* Day headers */}
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, index) => (
                                    <div key={index} className="py-1 text-sm font-medium text-center text-gray-500">
                                        {day}
                                    </div>
                                ))}

                                {/* Calendar days */}
                                {days.map((day, index) => {
                                    const isSelected = selectedDate &&
                                        selectedDate.getDate() === day.date.getDate() &&
                                        selectedDate.getMonth() === day.date.getMonth() &&
                                        selectedDate.getFullYear() === day.date.getFullYear();

                                    // Only disable past dates and dates from other months
                                    const isDisabled = isDateDisabled(day.date) || day.month !== 'current';

                                    // For debugging
                                    const dateStr = day.date.toISOString().split('T')[0];

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                if (!isDisabled) {
                                                    console.log("Selected date:", day.date.toISOString());
                                                    setSelectedDate(day.date);
                                                }
                                            }}
                                            className={`h-8 w-8 flex items-center justify-center rounded-full text-sm
                                                ${isDisabled ? 'text-gray-300 cursor-not-allowed' :
                                                    isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                                                }`}
                                            disabled={isDisabled}
                                            title={dateStr} // Add title for debugging
                                        >
                                            {day.day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Time Selection */}
                    <div>
                        <h3 className="mb-2 text-sm font-medium text-blue-600">Select Time Slot</h3>
                        <div className="p-4 border rounded-md">
                            <div className="grid grid-cols-3 gap-2">
                                {timeSlots.map((time, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedTime(time)}
                                        className={`py-2 px-1 rounded-full text-sm border 
                      ${selectedTime === time ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {formatTimeForDisplay(time)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Note Section */}
                <div className="mt-6">
                    <h3 className="mb-2 text-sm font-medium text-gray-700">Note</h3>
                    <textarea
                        className="w-full h-24 p-2 border border-gray-300 rounded-md resize-none"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add any notes about your appointment..."
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={loading}
                    >
                        Close
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Booking...' : 'Book Appointment'}
                    </button>
                </div>
            </div>
        </div>
    );
}