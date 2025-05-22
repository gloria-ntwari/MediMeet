import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "../components/icons/ArrowRight";
import Header from "../components/Header";
import Footer from "../components/Footer";
import doctorTeam from "../assets/doctor-team.png";
import doctorEllipse from "../assets/Ellipse 581.png";
import icon1 from "../assets/doctor-svgrepo-com.png";
import icon2 from "../assets/pregnant-woman-medium-dark-skin-tone-svgrepo-com.png";
import icon3 from "../assets/Group 4131.png";
import icon4 from "../assets/child-medium-skin-tone-svgrepo-com.png";
import icon5 from "../assets/brain-14-svgrepo-com (1).png";
import icon6 from "../assets/lungs-svgrepo-com.png";
import doctorEllepse2 from "../assets/Ellipse 582.png";
import appointmentDoctor from "../assets/appointment-doc-img.png";
import { useEffect, useState } from "react";
import { authService, HomeDTO, getBackendImageUrl } from "../services/api";
import DoctorImage from "../components/DoctorImage";



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

const specialties = [
  { name: "General physician", icon: icon1 },
  { name: "Gynecologist", icon: icon2 },
  { name: "Dermatologist", icon: icon3 },
  { name: "Pediatrician", icon: icon4 },
  { name: "Neurologist", icon: icon5 },
  { name: "Gastroenterologist", icon: icon6 },
];

export default function Home() {
  const [doctors, setDoctors] = useState<HomeDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const homeDoctors = await authService.getHomeDoctors();
        setDoctors(homeDoctors);
        console.log("Fetched doctors:", homeDoctors);

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
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Function to properly format image URLs from backend
  const getImageUrl = (doctor: HomeDTO, index: number): string => {
    console.log(`Processing image URL for ${doctor.name}:`, doctor.imageUrl);

    // Use the centralized function to get the backend image URL
    const imageUrl = getBackendImageUrl(doctor.imageUrl);
    console.log(`Resolved image URL for ${doctor.name}:`, imageUrl);

    return imageUrl;
  };

  // Handler for doctor card click
  const handleDoctorClick = (doctorId: number) => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/patient-login');
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== 'PATIENT') {
      alert('Only patients can book appointments. Please log in as a patient.');
      navigate('/patient-login');
      return;
    }
    navigate(`/doctor/${doctorId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="container px-4 mx-auto my-10 max-w-7xl">
        <div className="bg-[#5f6fff] flex flex-col md:flex-row items-center p-10 md:p-16 rounded-3xl overflow-hidden shadow-xl">
          <div className="mb-10 space-y-6 text-white md:w-1/2 md:mb-0">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl drop-shadow-lg">
              Book Appointment<br />With Trusted Doctors
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 overflow-hidden border-2 border-white rounded-full">
                    <img src={doctorEllipse} alt="Doctor" className="object-cover w-full h-full" />
                    <img src={doctorEllepse2} alt="Doctor" className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
              <p className="text-base font-medium">
                Simply browse through our extensive list of trusted doctors,<br />schedule your appointment hassle-free.
              </p>
            </div>
            <Link
              to="/all-doctors"
              className="inline-flex rounded-full bg-white text-[#5f6fff] hover:bg-blue-100 items-center gap-2 px-6 py-3 font-semibold text-lg shadow-md transition-all duration-200"
            >
              Book appointment <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="justify-center flex- md:w-1/2">
            <img src={doctorTeam || "/placeholder.svg"} alt="Doctors Team" className="w-full h-auto max-w-md shadow-2xl rounded-2xl" />
          </div>
        </div>
      </section>

      {/* Find by Speciality */}
      <section className="container px-4 mx-auto my-20 text-center max-w-7xl">
        <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">Find by Speciality</h2>
        <p className="max-w-2xl mx-auto mb-10 text-base text-gray-600">
          Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 ">
          {specialties.map((specialty, index) => (
            <div key={index} className="flex flex-col items-center p-4 transition-transform rounded-xl hover:scale-105">
              <div className="w-20 h-20 rounded-full bg-[#eaefff] flex items-center justify-center mb-2 shadow-inner">
                <div className="w-12 h-12">
                  <img src={specialty.icon} alt={specialty.name} className="w-full h-full" />
                </div>
              </div>
              <span className="text-base font-semibold text-gray-700">{specialty.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Top Doctors */}
      <section className="container px-4 mx-auto my-20 text-center max-w-7xl ">
        <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">Top Doctors to Book</h2>
        <p className="max-w-2xl mx-auto mb-10 text-base text-gray-600">
          Simply browse through our extensive list of trusted doctors.
        </p>
        <div className="flex justify-center w-full">
          <div className="grid flex-col w-full max-w-6xl grid-cols-1 gap-8 mb-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="overflow-hidden bg-gray-100 shadow-md rounded-2xl animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-5 mb-2 bg-gray-200 rounded"></div>
                    <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : doctors.length > 0 ? (
              doctors.map((doctor, index) => (
                <div
                  key={index}
                  className="overflow-hidden transition-shadow border border-blue-200 shadow-lg cursor-pointer rounded-xl h-80"
                  onClick={() => handleDoctorClick(doctor.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="h-56 bg-blue-50">
                    <img
                      src={getImageUrl(doctor, index)}
                      alt={doctor.name}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `/doctor-${(index % 5) + 1}.jpg`;
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
                </div>
              ))
            ) : (
              <div className="py-8 text-center col-span-full">
                <p className="text-gray-500">No doctors available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Second Hero Section */}
      <section className="container px-4 mx-auto my-20 max-w-7xl">
        <div className="bg-[#5f6fff] flex flex-col-reverse md:flex-row items-center p-10 md:p-16 rounded-xl overflow-hidden shadow-xl h-96 border-blue-200 border-1">
          <div className="mb-10 space-y-6 text-white md:w-1/2 md:mb-0">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl drop-shadow-lg">
              Book Appointment<br />With 100+ Trusted Doctors
            </h2>
            <button className="rounded-full bg-white text-[#5f6fff] hover:bg-blue-100 px-6 py-3 font-semibold text-lg shadow-md transition-all duration-200">
              Create account
            </button>
          </div>
          <div className="absolute flex justify-end bg-transparent md:w-1/2">
            <img src={appointmentDoctor || "/placeholder.svg"} alt="Doctor" className="w-[500px] max-w-md rounded-2xl h-[450px] mb-[68px] mr-[-282px]" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
