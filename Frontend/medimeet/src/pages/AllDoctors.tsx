import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authService, HomeDTO, getBackendImageUrl } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Import all possible doctor images dynamically
const importImages = () => {
    const defaultImages: Record<string, string> = {};
    try {
        // Try to import images from local assets if they exist
        for (let i = 1; i <= 5; i++) {
            defaultImages[`doctor-${i}`] = `/doctor-${i}.jpg`;
        }
    } catch (error) {
        console.error("Error importing doctor images:", error);
    }
    return defaultImages;
};

const doctorImages = importImages();

const AllDoctors: React.FC = () => {
    const [allDoctors, setAllDoctors] = useState<HomeDTO[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<HomeDTO[]>([]);
    const [specializations, setSpecializations] = useState<string[]>([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all specializations on component mount
    useEffect(() => {
        const fetchSpecializations = async () => {
            try {
                const allSpecializations = await authService.getAllSpecializations();
                setSpecializations(allSpecializations);
                console.log("Fetched specializations:", allSpecializations);
            } catch (error) {
                console.error('Error fetching specializations:', error);
                // If API fails, use the predefined list
                const defaultSpecializations = [
                    "General physician",
                    "Gynecologist",
                    "Dermatologist",
                    "Pediatrician",
                    "Neurologist",
                    "Gastroenterologist"
                ];
                setSpecializations(defaultSpecializations);
            }
        };

        fetchSpecializations();
    }, []);

    // Fetch all doctors first, just like the Home page does
    useEffect(() => {
        const fetchAllDoctors = async () => {
            setLoading(true);
            try {
                // Get all home doctors just like the Home page does
                const homeDoctors = await authService.getHomeDoctors();
                setAllDoctors(homeDoctors);
                setFilteredDoctors(homeDoctors); // Initially show all doctors
                console.log("Fetched home doctors:", homeDoctors);

                // Log all image paths
                homeDoctors.forEach(doctor => {
                    console.log(`Doctor ${doctor.name} has image path: ${doctor.imageUrl}`);
                });

                // Preload doctor images
                homeDoctors.forEach((doctor, index) => {
                    if (doctor.imageUrl) {
                        const img = new Image();
                        const imgUrl = getImageUrl(doctor, index);
                        console.log(`Preloading image for ${doctor.name}: ${imgUrl}`);
                        img.src = imgUrl;
                    }
                });
            } catch (error) {
                console.error("Error fetching home doctors:", error);
                setError('Failed to load doctors. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllDoctors();
    }, []);

    // Filter doctors when specialization changes
    useEffect(() => {
        if (!allDoctors.length) return;

        if (!selectedSpecialization) {
            // Show all doctors when no specialization is selected
            setFilteredDoctors(allDoctors);
            return;
        }

        // Filter doctors by selected specialization
        const filtered = allDoctors.filter(
            doctor => doctor.specialisation.toLowerCase() === selectedSpecialization.toLowerCase()
        );

        setFilteredDoctors(filtered);
        console.log(`Filtered to ${filtered.length} doctors with specialization: ${selectedSpecialization}`);
    }, [selectedSpecialization, allDoctors]);

    // Handle specialization selection
    const handleSpecializationClick = (specialization: string) => {
        if (specialization === selectedSpecialization) {
            // If clicking the already selected specialization, show all doctors
            setSelectedSpecialization('');
        } else {
            // Otherwise set the new specialization
            console.log("Selected specialization:", specialization);
            setSelectedSpecialization(specialization);
        }
    };

    // Function to get doctor image URL - using the same approach as Home page
    const getImageUrl = (doctor: HomeDTO, index: number): string => {
        // If doctor has no imageUrl, use a default image based on index
        if (!doctor.imageUrl) {
            const imageIndex = (index % 5) + 1;
            const defaultImage = `/doctor-${imageIndex}.jpg`;
            console.log(`Using default image for ${doctor.name}: ${defaultImage}`);
            return defaultImage;
        }

        console.log(`Processing image URL for ${doctor.name}:`, doctor.imageUrl);

        // Use the centralized function to get the backend image URL
        const imageUrl = getBackendImageUrl(doctor.imageUrl);
        console.log(`Resolved image URL for ${doctor.name}:`, imageUrl);

        return imageUrl;
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="container px-4 py-10 mx-auto">
                <h1 className="mb-8 text-gray-700 ml-14">Browse through the doctors specialist.</h1>

                {/* Two-column layout */}
                <div className="flex flex-col gap-16 md:flex-row">
                    {/* Specialization sidebar */}
                    <div className="ml-14 md:w-1/4">
                        <div className="flex flex-col w-56 gap-2">
                            <button
                                onClick={() => setSelectedSpecialization('')}
                                className={`p-4 text-left rounded-md transition-colors ${selectedSpecialization === ''
                                    ? 'bg-[#eaefff] text-[#5f6fff] font-medium'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                All Doctors
                            </button>
                            {specializations.map((specialization) => (
                                <button
                                    key={specialization}
                                    onClick={() => handleSpecializationClick(specialization)}
                                    className={`p-4 text-left rounded-md transition-colors ${selectedSpecialization === specialization
                                        ? 'bg-[#eaefff] text-[#5f6fff] font-medium'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {specialization}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Doctors grid */}
                    <div className="md:w-3/4">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="bg-[#f8f9ff] rounded-md overflow-hidden shadow-sm animate-pulse">
                                        <div className="h-56 bg-gray-200"></div>
                                        <div className="p-4">
                                            <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
                                            <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="p-4 text-red-500 rounded-lg bg-red-50">{error}</div>
                        ) : filteredDoctors.length === 0 ? (
                            <div className="p-8 text-center bg-[#eaefff] text-[#5f6fff] rounded-md shadow-sm w-full">
                                <h3 className="mb-2 text-xl font-semibold">No doctors found</h3>
                                <p>There are currently no doctors available{selectedSpecialization ? ` in the ${selectedSpecialization} specialization` : ''}.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredDoctors.map((doctor, index) => (
                                    <Link
                                        key={doctor.id}
                                        to={`/doctor/${doctor.id}`}
                                        className="w-56 overflow-hidden transition-shadow border border-blue-200 shadow-lg cursor-pointer rounded-xl h-80"
                                    >
                                        <div className="h-56 bg-blue-50">
                                            <img
                                                src={getImageUrl(doctor, index)}
                                                alt={`Dr. ${doctor.name}`}
                                                className="object-cover w-full h-full"
                                                onError={(e) => {
                                                    console.log(`Image load error for ${doctor.name}, trying fallback`);
                                                    const target = e.target as HTMLImageElement;
                                                    target.onerror = null; // Prevent infinite loop

                                                    // Try a different doctor image from our local fallbacks each time
                                                    const localImage = `/doctor-${(index % 5) + 1}.jpg`;
                                                    console.log(`Using local fallback: ${localImage}`);
                                                    target.src = localImage;
                                                }}
                                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                            />
                                        </div>
                                        <div className="p-2 ml-2 text-left">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-xs font-semibold text-green-500">Available</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800">Dr. {doctor.name}</h3>
                                            <p className="text-sm text-gray-500">{doctor.specialisation}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AllDoctors; 