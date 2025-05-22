import Header from "../components/Header";
import Footer from "../components/Footer";
import contactImage from "../assets/appointment-doc-img.png";

export default function Contact() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-700">
                    CONTACT <span className="text-gray-900">US</span>
                </h2>
                <div className="w-full max-w-4xl flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16">
                    <img
                        src={contactImage}
                        alt="Doctor with patient"
                        className="w-full md:w-[400px] h-auto rounded-lg object-cover shadow-md"
                    />
                    <div className="flex-1 w-full max-w-md text-gray-700">
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-2">OUR OFFICE</h3>
                            <p className="mb-1">54709 Willms Station</p>
                            <p className="mb-1">Suite 350, Washington, USA</p>
                            <p className="mb-1">Tel: (415) 555-0132</p>
                            <p className="mb-1">Email: greatstackdev@gmail.com</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">CAREERS AT PRESCRIPTO</h3>
                            <p className="mb-4">Learn more about our teams and job openings.</p>
                            <button className="px-6 py-2 border border-gray-400 rounded-md hover:bg-[#eaefff] transition-colors">Explore Jobs</button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
} 