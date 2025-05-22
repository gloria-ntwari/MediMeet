import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Doctors(): JSX.Element {
  // Specialty categories data
  const specialties = [
    { name: "General physician", isActive: false },
    { name: "Gynecologist", isActive: false },
    { name: "Dermatologist", isActive: false },
    { name: "Pediatricians", isActive: false },
    { name: "Neurologist", isActive: false },
    { name: "Gastroenterologist", isActive: false },
  ];

  // Doctor data with updated information and images
  const doctors = [
    {
      id: 1,
      name: "Dr. Richard James",
      specialty: "General physician",
      image: "/doctors/doctor1.jpg",
      available: true,
    },
    {
      id: 2,
      name: "Dr. Emily Larson",
      specialty: "Gynecologist",
      image: "/doctors/doctor2.jpg",
      available: true,
    },
    {
      id: 3,
      name: "Dr. Sarah Patel",
      specialty: "Dermatologist",
      image: "/doctors/doctor3.jpg",
      available: true,
    },
    {
      id: 4,
      name: "Dr. Christopher Lee",
      specialty: "Pediatricians",
      image: "/doctors/doctor4.jpg",
      available: true,
    },
    // ... add more doctors as needed
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-[300px] shrink-0">
            <h2 className="text-[#4A4A4A] text-xl mb-6">
              Browse through the doctors specialist.
            </h2>

            <div className="space-y-3">
              {specialties.map((specialty, index) => (
                <Button
                  key={index}
                  variant={specialty.isActive ? "default" : "outline"}
                  className={`w-full justify-start h-12 text-left px-4 ${specialty.isActive
                      ? "bg-[#e1e4ff] text-[#4A4A4A] hover:bg-[#d1d4ff]"
                      : "bg-white text-[#4A4A4A] hover:bg-gray-50"
                    } border border-[#E5E5E5] rounded-lg font-normal`}
                >
                  {specialty.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Doctor Cards Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="bg-white rounded-xl overflow-hidden border border-[#E5E5E5] hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="aspect-square bg-[#F0F3FF] flex items-center justify-center p-4">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#0FBE00]" />
                      <span className="text-[#0FBE00] text-sm font-medium">
                        Available
                      </span>
                    </div>

                    <h3 className="text-xl font-medium text-[#2D2D2D] mb-1">
                      {doctor.name}
                    </h3>

                    <p className="text-[#5C5C5C] text-sm">
                      {doctor.specialty}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
