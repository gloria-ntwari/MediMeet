import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authService, DoctorDTO } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DoctorImage from '../components/DoctorImage';
import AppointmentModal from '../components/AppointmentModal';

const DoctorDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState<DoctorDTO | null>(null);
    const [relatedDoctors, setRelatedDoctors] = useState<DoctorDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);

    useEffect(() => {
        const fetchDoctorAndRelated = async () => {
            if (!id) return;

            setLoading(true);
            setError(null);

            try {
                // Fetch the doctor details
                const doctorId = parseInt(id);

                // Ensure doctorId is a valid number
                if (isNaN(doctorId)) {
                    throw new Error('Invalid doctor ID');
                }

                const doctorData = await authService.getDoctorById(doctorId);
                setDoctor(doctorData);
                console.log("Fetched doctor:", doctorData);

                // Fetch related doctors (with same specialization)
                if (doctorData.specialization) {
                    try {
                        const related = await authService.getRelatedDoctors(doctorData.specialization, doctorId);
                        setRelatedDoctors(related);
                        console.log("Fetched related doctors:", related);
                    } catch (relatedError) {
                        console.error('Error fetching related doctors:', relatedError);
                        // Don't set main error - we still have the doctor data
                        setRelatedDoctors([]);
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching doctor details:', err);
                setError('Failed to load doctor information. Please try again later.');
                setLoading(false);
            }
        };

        fetchDoctorAndRelated();
    }, [id]);

    const handleBookAppointment = () => {
        // Check if user is logged in
        const userData = localStorage.getItem('user');
        if (!userData) {
            alert('Please log in to book an appointment');
            navigate('/patient-login');
            return;
        }

        try {
            const user = JSON.parse(userData);
            if (user.role !== 'PATIENT') {
                alert('Only patients can book appointments');
                return;
            }

            // Verify we have a doctor with an ID
            if (!doctor || !doctor.id) {
                alert('Doctor information is not available');
                return;
            }

            // Show appointment modal
            setShowAppointmentModal(true);
        } catch (error) {
            console.error('Error parsing user data:', error);
            alert('Please log in again');
            navigate('/patient-login');
        }
    };

    const closeAppointmentModal = () => {
        setShowAppointmentModal(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="container px-4 mx-auto my-12">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                            <p className="text-gray-600">Loading doctor information...</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !doctor) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="container px-4 mx-auto my-12">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="mb-4 text-5xl text-red-500">⚠️</div>
                            <h2 className="mb-2 text-2xl font-medium">Error Loading Doctor</h2>
                            <p className="mb-6 text-gray-600">{error || 'Doctor not found.'}</p>
                            <Link to="/all-doctors" className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">
                                View All Doctors
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Doctor Profile Section */}
            <div className="container px-4 mx-auto my-12 md:px-20">
                <div className="bg-[#f8f9ff] rounded-xl overflow-hidden">
                    <div className="flex flex-col ml-10 md:flex-row">
                        {/* Doctor Image */}
                        <div className="p-6 md:w-1/3">
                            <div className="flex items-center justify-center h-full p-4 overflow-hidden bg-white shadow-md rounded-xl">
                                <DoctorImage
                                    name={doctor.name}
                                    imageUrl={doctor.imageUrl}
                                    index={0}
                                    className="object-contain w-full h-auto max-h-80"
                                />
                            </div>
                        </div>

                        {/* Doctor Info */}
                        <div className="p-6 mt-8 md:w-2/3">
                            <div className="flex items-center gap-1 mb-3">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-green-500">Available</span>
                            </div>

                            <h1 className="mb-2 text-3xl font-bold">Dr. {doctor.name}</h1>
                            <p className="mb-4 text-lg text-gray-600">{doctor.specialization}</p>

                            {doctor.experience && (
                                <div className="mb-4">
                                    <h3 className="mb-1 text-lg font-medium">Experience</h3>
                                    <p className="text-gray-700">{doctor.experience}</p>
                                </div>
                            )}

                            {doctor.about && (
                                <div className="mb-6">
                                    <h3 className="mb-1 text-lg font-medium">About</h3>
                                    <p className="text-gray-700">{doctor.about}</p>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="mb-2 text-lg font-medium">Contact Information</h3>
                                <div className="flex flex-col gap-2">
                                    <p className="text-gray-700"><span className="font-medium">Email:</span> {doctor.email}</p>
                                    <p className="text-gray-700"><span className="font-medium">Phone:</span> {doctor.phone}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleBookAppointment}
                                className="w-full md:w-auto px-6 py-3 bg-[#5f6fff] text-white rounded-md hover:bg-[#4b57e8] transition font-medium"
                            >
                                Book an Appointment
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Doctors Section */}
            {relatedDoctors.length > 0 && (
                <div className="container px-4 mx-auto my-12 md:px-20">
                    <h2 className="mb-6 text-2xl font-bold text-center">Related Doctors</h2>
                    <p className="mb-8 text-center text-gray-600">
                        Simply browse through our extensive list of trusted doctors.
                    </p>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 h-96 w-[800px]">
                        {relatedDoctors.map((relatedDoctor, index) => (
                            <Link
                                key={relatedDoctor.id}
                                to={`/doctor/${relatedDoctor.id}`}
                                className="overflow-hidden transition-shadow border border-blue-200 shadow-lg cursor-pointer rounded-xl "
                            >
                                <div className="justify-center h-60 bg-blue-50 ">
                                    <DoctorImage
                                        name={relatedDoctor.name}
                                        imageUrl={relatedDoctor.imageUrl}
                                        index={index}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div className="p-4 text-left">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-xs font-semibold text-green-500">Available</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Dr. {relatedDoctor.name}</h3>
                                    <p className="text-sm text-gray-500">{relatedDoctor.specialization}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Appointment Modal */}
            {doctor && (
                <AppointmentModal
                    isOpen={showAppointmentModal}
                    onClose={closeAppointmentModal}
                    doctorName={doctor.name}
                    doctorId={doctor.id}
                />
            )}

            <Footer />
        </div>
    );
};

export default DoctorDetail; 