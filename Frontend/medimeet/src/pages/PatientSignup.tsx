import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import Header from "../components/Header";
import { authService } from "../services/api";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function PatientSignup() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<String | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
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
            await authService.registerPatient(formData);

            toast.success('Registration successful! Please login.');

            navigate('/patient-login', {
                state: { message: 'Registration successful! Please login.' }
            });
        } catch (err: any) {
            if (err.response?.status === 409) {
                setError('Patient with this email already exists');
            }
            else {
                setError(err.response?.data?.message || 'Registration failed please try again!');
            }
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <ToastContainer position="top-right" autoClose={3000} />
            <Header />

            <main className="container flex items-center justify-center px-4 py-16 mx-auto">
                <div className="w-full max-w-[480px] p-8 bg-white rounded-2xl shadow-lg">
                    <h1 className="mb-8 text-2xl font-medium text-center">
                        Create Patient Account
                    </h1>
                    <p className="mb-6 text-center text-gray-600">
                        Please sign up to book appointment
                    </p>

                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-500 rounded-lg bg-red-50">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-[#4A4A4A]">
                                Full Name
                            </label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-[#4A4A4A]">
                                Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                className="w-full"
                                required
                            />
                        </div>


                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-[#4A4A4A]">
                                Password
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••••"
                                className="w-full"
                                required
                                minLength={8}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#5f6fff] text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </Button>
                    </form>

                    <div className="mt-4 text-sm text-center">
                        <span className="text-[#4A4A4A]">Already have an account? </span>
                        <Link to="/patient-login" className="text-[#5f6fff] hover:underline">
                            Login here
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
} 