import Footer from "../components/Footer";
import Header from "../components/Header";
import aboutImage from "../assets/about_image.png"
import { Card, CardContent } from "../components/ui/card";


export default function PrescriptoAbout(): JSX.Element {

  // Why Choose Us cards data
  const chooseUsCards = [
    {
      title: "EFFICIENCY:",
      description:
        "Streamlined Appointment Scheduling That Fits Into Your Busy Lifestyle.",
    },
    {
      title: "CONVENIENCE:",
      description:
        "Access To A Network Of Trusted Healthcare Professionals In Your Area.",
    },
    {
      title: "PERSONALIZATION:",
      description:
        "Tailored Recommendations And Reminders To Help You Stay On Top Of Your Health.",
    },
  ];


  return (
    <div className="flex flex-row justify-center w-full bg-white">
      <div className="bg-white w-full max-w-[1920px] relative">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="px-[196px] ml-[-55px]">
          {/* About Us Title */}
          <div className="flex justify-center mt-[45px] mb-[40px]">
            <h1 className="[font-family:'Outfit-Regular',Helvetica] font-normal text-3xl">
              <span className="text-gray-600">About</span>
              <span className="[font-family:'Outfit-SemiBold',Helvetica] font-semibold text-gray-800">
                {" "}
                Us
              </span>
            </h1>
          </div>

          {/* About Section */}
          <section className="flex flex-col md:flex-row gap-8 md:gap-16 mb-[70px]">
            <img className="w-full md:w-[438px] h-auto md:h-[445px] object-cover" alt="About image" src={aboutImage} />
            <div className="[font-family:'Outfit-Regular',Helvetica] font-normal text-gray-600 tracking-[0] leading-[32.4px] max-w-full md:max-w-[894px]">
              <p className="mb-6 text-gray-700">
                Welcome to Prescripto, your trusted partner in managing your
                healthcare needs conveniently and efficiently. At Prescripto, we
                understand the challenges individuals face when it comes to
                scheduling doctor appointments and managing their health
                records.
              </p>
              <p className="mb-6">
                Prescripto is committed to excellence in healthcare technology.
                We continuously strive to enhance our platform, integrating the
                latest advancements to improve user experience and deliver
                superior service. Whether you're booking your first appointment
                or managing ongoing care, Prescripto is here to support you
                every step of the way.
              </p>
              <h2 className="[font-family:'Outfit-Bold',Helvetica] font-semibold mb-6 text-lg">
                Our Vision
              </h2>
              <p>
                Our vision at Prescripto is to create a seamless healthcare
                experience for every user. We aim to bridge the gap between
                patients and healthcare providers, making it easier for you to
                access the care you need, when you need it.
              </p>
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section className="mb-[70px]">
            <h2 className="[font-family:'Outfit-Regular',Helvetica] font-normal text-2xl mb-10">
              <span className="text-gray-600">Why</span>
              <span className="[font-family:'Outfit-SemiBold',Helvetica] font-semibold text-gray-800">
                {" "}
                Choose Us
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 border border-solid border-[#ababab]">
              {chooseUsCards.map((card, index) => (
                <Card
                  key={index}
                  className={`rounded-none border-0 transition-colors duration-300 hover:bg-[#8da2e6] ${index !== 0 ? "border-l border-solid border-[#ababab]" : ""}`}
                >
                  <CardContent className="p-8 md:p-16">
                    <h3 className="[font-family:'Outfit-SemiBold',Helvetica] font-semibold text-gray-800 text-lg mb-6 md:mb-10">
                      {card.title}
                    </h3>
                    <p className="[font-family:'Outfit-Regular',Helvetica] font-normal text-gray-600 leading-[32.4px]">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
