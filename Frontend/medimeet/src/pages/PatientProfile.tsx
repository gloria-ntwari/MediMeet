import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { authService } from "../services/api";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface UserData {
    id?: number;
    name: string;
    email: string;
    phone?: string;
    role?: string;
}

interface EditProfileForm {
    name: string;
    email: string;
    phone: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function PatientProfile() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState<EditProfileForm>({
        name: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Partial<EditProfileForm>>({});

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

            setUserData(user);
            setFormData(prev => ({
                ...prev,
                name: user.name,
                email: user.email,
                phone: user.phone || ''
            }));
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/patient-login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const validateForm = () => {
        const newErrors: Partial<EditProfileForm> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (formData.newPassword) {
            if (!formData.currentPassword) {
                newErrors.currentPassword = 'Current password is required';
            }
            if (formData.newPassword.length < 6) {
                newErrors.newPassword = 'Password must be at least 6 characters';
            }
            if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name as keyof EditProfileForm]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            const updateData: any = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            };

            // Only include password fields if new password is provided
            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            const response = await authService.updatePatientProfile(updateData);
            
            // Update local storage and state
            const updatedUser = {
                ...userData,
                name: response.name,
                email: response.email,
                phone: response.phone
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUserData(updatedUser);
            
            toast.success('Profile updated successfully!');
            setIsEditModalOpen(false);
            
            // Reset form
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="container flex items-center justify-center px-4 py-16 mx-auto">
                    <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="container px-4 py-16 mx-auto">
                <div className="max-w-2xl mx-auto">
                    <h1 className="mb-8 text-2xl font-bold">My Profile</h1>

                    <div className="overflow-hidden bg-white rounded-lg shadow-md">
                        <div className="p-6 bg-[#f8f9ff] border-b">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-[#5f6fff] text-white rounded-full flex items-center justify-center text-2xl font-bold">
                                    {userData?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{userData?.name}</h2>
                                    <p className="text-gray-500">Patient</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-1 text-sm font-medium text-gray-500">Full Name</h3>
                                    <p className="text-lg">{userData?.name}</p>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-sm font-medium text-gray-500">Email Address</h3>
                                    <p className="text-lg">{userData?.email}</p>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-sm font-medium text-gray-500">Account Type</h3>
                                    <p className="text-lg">Patient</p>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="px-6 py-2 bg-[#5f6fff] text-white rounded-md hover:bg-[#4b57e8] transition-colors"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md p-6 bg-white rounded-lg">
                        <h2 className="mb-6 text-2xl font-semibold">Edit Profile</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f6fff]"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f6fff]"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f6fff]"
                                />
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="mb-4 text-lg font-medium">Change Password</h3>
                                
                                <div className="mb-4">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f6fff]"
                                    />
                                    {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f6fff]"
                                    />
                                    {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5f6fff]"
                                    />
                                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-[#5f6fff] rounded-md hover:bg-[#4b57e8]"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
} 