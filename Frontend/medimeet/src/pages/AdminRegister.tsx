import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from '../components/ui/button';
import { authService } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function AdminRegister() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Use the API service to register admin
            await authService.registerAdmin(formData);

            // Redirect to login page after successful registration
            navigate('/admin-login', {
                state: { message: 'Registration successful! Please login.' }
            });

            toast.success('Account created successfully!');
        } catch (err: any) {
            if (err.response?.status === 409) {
                setError('Admin with this email already exists.');
                toast.error('Admin with this email already exists.');
            } else {
                setError(err.response?.data?.message || 'Registration failed. Please try again.');
                toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-96">
                <ToastContainer position="top-right" autoClose={3000} />

                <h2 className="mb-6 text-2xl font-bold text-center">Admin Registration</h2>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-500 rounded-lg bg-red-50">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Name
                            </label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1"
                                placeholder="Enter your name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="mt-1"
                                placeholder="Enter your email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="mt-1"
                                placeholder="Enter your password"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </Button>
                    </div>
                </form>
                <div className="mt-4 text-sm text-center">
                    <span className="text-[#4A4A4A]">Already have an account? </span>
                    <Link to="/admin-login" className="text-[#5f6fff] hover:underline">
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
} 