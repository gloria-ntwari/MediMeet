// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { authService } from "../services/api";

// // Sidebar icons
// const DashboardIcon = () => (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor" />
//     </svg>
// );

// const AppointmentsIcon = () => (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z" fill="currentColor" />
//     </svg>
// );

// const AddDoctorIcon = () => (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
//     </svg>
// );

// const DoctorsListIcon = () => (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor" />
//     </svg>
// );

// const PatientsIcon = () => (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
//     </svg>
// );

// const AddDoctor = () => {
//     const navigate = useNavigate();
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [imageFile, setImageFile] = useState<File | undefined>(undefined);
//     const [imagePreview, setImagePreview] = useState<string | null>(null);

//     // Form state
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         password: "",
//         specialization: "General physician", // Default value
//         phone: "",
//         experience: "",
//         about: ""
//     });

//     // List of specialties
//     const specialties = [
//         "General physician",
//         "Gynecologist",
//         "Dermatologist",
//         "Pediatrician",
//         "Neurologist",
//         "Gastroenterologist",
//         "Cardiologist",
//         "Ophthalmologist",
//         "Orthopedic surgeon",
//         "Psychiatrist"
//     ];

//     // Experience options
//     const experienceOptions = [
//         "1-3 years",
//         "3-5 years",
//         "5-10 years",
//         "10+ years"
//     ];

//     // Handle form input changes
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     // Handle image upload
//     const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             const file = e.target.files[0];
//             // Validate image format
//             const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
//             if (!validFormats.includes(file.type)) {
//                 setError('Invalid image format. Only JPG, JPEG, PNG allowed.');
//                 return;
//             }
//             setImageFile(file);
//             // Create preview URL
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setImagePreview(reader.result as string);
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     // Handle form submission
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setError(null);
//         setIsLoading(true);

//         if (!imageFile) {
//             setError('Please upload a doctor photo');
//             setIsLoading(false);
//             return;
//         }

//         try {
//             // Create doctor data object with correct field names for backend
//             const doctorData = {
//                 name: formData.name.trim(),
//                 email: formData.email.trim(),
//                 password: formData.password,
//                 specialization: formData.specialization, // This will be converted in the API service
//                 phone: formData.phone.trim(),
//                 about: formData.about.trim() || "", // Ensure not null
//                 experience: formData.experience || "" // Ensure not null
//             };

//             console.log('Submitting doctor data:', doctorData);

//             // Call API to add doctor
//             await authService.addDoctor(doctorData, imageFile);

//             // Show success message and redirect
//             alert('Doctor added successfully!');
//             navigate('/admin/doctors');
//         } catch (err: any) {
//             console.error('Error adding doctor:', err);
//             if (err.response?.status === 409) {
//                 setError('Doctor with this email already exists.');
//             } else {
//                 setError(err.message || 'Failed to add doctor. Please try again.');
//             }
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-[#f8f9fa]">
//             {/* Header with bottom border */}
//             <header className="flex items-center justify-between p-4 bg-white shadow-sm">
//                 <div className="flex items-center">
//                     <Link to="/" className="text-lg font-bold text-[#5f6fff]">
//                         Prescripto
//                     </Link>
//                     <span className="px-2 py-0.5 ml-2 text-xs bg-gray-100 rounded-md">Admin</span>
//                 </div>
//                 <Link to="/admin-login" className="px-4 py-2 text-sm font-medium text-white bg-[#5f6fff] rounded-full">
//                     Login
//                 </Link>
//             </header>

//             <div className="flex">
//                 {/* Sidebar - more compact with icons */}
//                 <div className="w-[200px] min-h-[calc(100vh-64px)] bg-white border-r">
//                     <nav className="p-4">
//                         <ul className="space-y-2">
//                             <li>
//                                 <Link to="/admin/dashboard" className="flex items-center p-2 text-sm rounded-md hover:bg-gray-100">
//                                     <span className="w-5 h-5 mr-3 text-sm text-gray-400">⬤</span>
//                                     <span className="text-gray-700">Dashboard</span>
//                                 </Link>
//                             </li>
//                             <li>
//                                 <Link to="/admin/appointments" className="flex items-center p-2 text-sm rounded-md hover:bg-gray-100">
//                                     <span className="w-5 h-5 mr-3 text-sm text-gray-400">⬤</span>
//                                     <span className="text-gray-700">Appointments</span>
//                                 </Link>
//                             </li>
//                             <li>
//                                 <Link to="/admin/add-doctor" className="flex items-center p-2 text-sm text-[#5f6fff] bg-[#eef0ff] rounded-md">
//                                     <span className="w-5 h-5 mr-3 text-sm text-[#5f6fff]">⬤</span>
//                                     <span>Add Doctor</span>
//                                 </Link>
//                             </li>
//                             <li>
//                                 <Link to="/admin/doctors" className="flex items-center p-2 text-sm rounded-md hover:bg-gray-100">
//                                     <span className="w-5 h-5 mr-3 text-sm text-gray-400">⬤</span>
//                                     <span className="text-gray-700">Doctors List</span>
//                                 </Link>
//                             </li>
//                             <li>
//                                 <Link to="/admin/patients" className="flex items-center p-2 text-sm rounded-md hover:bg-gray-100">
//                                     <span className="w-5 h-5 mr-3 text-sm text-gray-400">⬤</span>
//                                     <span className="text-gray-700">Patients</span>
//                                 </Link>
//                             </li>
//                         </ul>
//                     </nav>
//                 </div>

//                 {/* Main Content */}
//                 <div className="flex-1 p-6">
//                     <h1 className="mb-6 text-lg font-medium">Add Doctor</h1>

//                     {/* Form Card - left-aligned with controlled width */}
//                     <div className="w-[540px] ml-0 p-6 bg-white shadow-sm rounded-lg">
//                         {error && (
//                             <div className="p-3 mb-4 text-sm text-red-500 rounded-lg bg-red-50">
//                                 {error}
//                             </div>
//                         )}

//                         <form onSubmit={handleSubmit} className="space-y-5">
//                             {/* Doctor Image Upload */}
//                             <div className="flex flex-col items-center mb-4">
//                                 <div className="mb-1 text-center">
//                                     <p className="mb-1 text-xs text-gray-500">Upload doctor picture</p>
//                                     {imagePreview ? (
//                                         <div className="relative w-20 h-20 mx-auto mb-1">
//                                             <img
//                                                 src={imagePreview}
//                                                 alt="Doctor preview"
//                                                 className="object-cover w-full h-full rounded-full"
//                                             />
//                                             <button
//                                                 type="button"
//                                                 onClick={() => {
//                                                     setImagePreview(null);
//                                                     setImageFile(undefined);
//                                                 }}
//                                                 className="absolute p-1 text-white bg-red-500 rounded-full -top-1 -right-1 hover:bg-red-600"
//                                             >
//                                                 <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                                 </svg>
//                                             </button>
//                                         </div>
//                                     ) : (
//                                         <div className="flex items-center justify-center w-20 h-20 mx-auto mb-2 bg-gray-100 rounded-full">
//                                             <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                             </svg>
//                                         </div>
//                                     )}
//                                 </div>
//                                 <label htmlFor="doctor-image" className="text-xs cursor-pointer text-[#5f6fff]">
//                                     <input
//                                         id="doctor-image"
//                                         type="file"
//                                         accept="image/jpeg,image/jpg,image/png"
//                                         onChange={handleImageChange}
//                                         className="hidden"
//                                     />
//                                     {imagePreview ? "Change picture" : "Upload picture"}
//                                 </label>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 {/* Doctor Name */}
//                                 <div>
//                                     <label htmlFor="name" className="block mb-1 text-xs text-gray-700">
//                                         Doctor name
//                                     </label>
//                                     <input
//                                         id="name"
//                                         name="name"
//                                         type="text"
//                                         value={formData.name}
//                                         onChange={handleChange}
//                                         placeholder="Name"
//                                         className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f6fff] focus:border-[#5f6fff]"
//                                         required
//                                     />
//                                 </div>

//                                 {/* Specialty */}
//                                 <div>
//                                     <label htmlFor="specialization" className="block mb-1 text-xs text-gray-700">
//                                         Specialty
//                                     </label>
//                                     <select
//                                         id="specialization"
//                                         name="specialization"
//                                         value={formData.specialization}
//                                         onChange={handleChange}
//                                         className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f6fff] focus:border-[#5f6fff]"
//                                         required
//                                     >
//                                         {specialties.map((specialty) => (
//                                             <option key={specialty} value={specialty}>
//                                                 {specialty}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>

//                                 {/* Doctor Email */}
//                                 <div>
//                                     <label htmlFor="email" className="block mb-1 text-xs text-gray-700">
//                                         Doctor Email
//                                     </label>
//                                     <input
//                                         id="email"
//                                         name="email"
//                                         type="email"
//                                         value={formData.email}
//                                         onChange={handleChange}
//                                         placeholder="Your email"
//                                         className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f6fff] focus:border-[#5f6fff]"
//                                         required
//                                     />
//                                 </div>

//                                 {/* Phone */}
//                                 <div>
//                                     <label htmlFor="phone" className="block mb-1 text-xs text-gray-700">
//                                         Phone
//                                     </label>
//                                     <input
//                                         id="phone"
//                                         name="phone"
//                                         type="tel"
//                                         value={formData.phone}
//                                         onChange={handleChange}
//                                         placeholder="Phone number"
//                                         className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f6fff] focus:border-[#5f6fff]"
//                                         required
//                                     />
//                                 </div>

//                                 {/* Doctor Password */}
//                                 <div>
//                                     <label htmlFor="password" className="block mb-1 text-xs text-gray-700">
//                                         Doctor Password
//                                     </label>
//                                     <input
//                                         id="password"
//                                         name="password"
//                                         type="password"
//                                         value={formData.password}
//                                         onChange={handleChange}
//                                         placeholder="Password"
//                                         className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f6fff] focus:border-[#5f6fff]"
//                                         required
//                                         minLength={8}
//                                     />
//                                 </div>

//                                 {/* Experience */}
//                                 <div>
//                                     <label htmlFor="experience" className="block mb-1 text-xs text-gray-700">
//                                         Experience
//                                     </label>
//                                     <select
//                                         id="experience"
//                                         name="experience"
//                                         value={formData.experience}
//                                         onChange={handleChange}
//                                         className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f6fff] focus:border-[#5f6fff]"
//                                         required
//                                     >
//                                         <option value="" disabled>Experience</option>
//                                         {experienceOptions.map((exp) => (
//                                             <option key={exp} value={exp}>
//                                                 {exp}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             </div>

//                             {/* About Me */}
//                             <div>
//                                 <label htmlFor="about" className="block mb-1 text-xs text-gray-700">
//                                     About me
//                                 </label>
//                                 <textarea
//                                     id="about"
//                                     name="about"
//                                     value={formData.about}
//                                     onChange={handleChange}
//                                     placeholder="Write about yourself"
//                                     rows={4}
//                                     className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5f6fff] focus:border-[#5f6fff]"
//                                 ></textarea>
//                             </div>

//                             {/* Submit Button */}
//                             <div>
//                                 <button
//                                     type="submit"
//                                     className="px-5 py-2 text-sm text-white bg-[#5f6fff] rounded-full hover:bg-[#4b57ff] focus:outline-none focus:ring-2 focus:ring-[#5f6fff] focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
//                                     disabled={isLoading}
//                                 >
//                                     {isLoading ? "Adding doctor..." : "Add doctor"}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AddDoctor; 