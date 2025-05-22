import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import Header from "../components/Header";
import { authService } from "../services/api";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PatientLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(
        location.state?.message || null
    );
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    // Forgot password state
    const [showReset, setShowReset] = useState(false);
    const [resetStep, setResetStep] = useState(1);
    const [resetEmail, setResetEmail] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [resetPassword, setResetPassword] = useState("");
    const [resetMsg, setResetMsg] = useState("");

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
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            console.log("Attempting login with:", formData.email);
            const user = await authService.login(formData);

            // Verify if the user is a patient
            if (user.role !== 'PATIENT') {
                setError('Access denied. Please use patient credentials.');
                return;
            }

            console.log("Login successful, redirecting to home");
            // Storage is now handled in authService.login
            // Redirect to patient dashboard or home
            navigate('/');
            toast.success('Login successful!');
        } catch (err: any) {
            console.error("Login error details:", err);
            if (err.response?.status === 404) {
                setError('User not found. Please check your credentials.');
            } else if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Invalid credentials. Please try again.');
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
            toast.error('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestReset = async () => {
        try {
            await axios.post("/api/users/request-password-reset", null, { params: { email: resetEmail } });
            setResetMsg("Code sent to your email.");
            setResetStep(2);
            toast.success('Code sent to your email.');
        } catch {
            setResetMsg("Error sending code.");
            toast.error('Error sending code.');
        }
    };

    const handleResetPassword = async () => {
        try {
            await axios.post("/api/users/reset-password", null, {
                params: { email: resetEmail, code: resetCode, newPassword: resetPassword }
            });
            setResetMsg("Password reset! You can now log in.");
            setShowReset(false);
            setResetStep(1);
            toast.success('Password reset! You can now log in.');
        } catch {
            setResetMsg("Invalid code or error.");
            toast.error('Invalid code or error.');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <ToastContainer position="top-right" autoClose={3000} />
            <Header />

            <main className="container flex items-center justify-center px-4 py-16 mx-auto">
                <div className="w-full max-w-[400px] p-8 bg-white rounded-2xl shadow-lg">
                    <h1 className="mb-2 text-2xl font-medium text-center">
                        Patient Login
                    </h1>
                    <p className="mb-8 text-sm text-center text-gray-600">
                        Please login to book appointments
                    </p>

                    {successMessage && (
                        <div className="p-3 mb-4 text-sm text-green-600 rounded-lg bg-green-50">
                            {successMessage}
                        </div>
                    )}

                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-500 rounded-lg bg-red-50">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-[#4A4A4A] text-sm">
                                Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="patient@example.com"
                                className="w-full"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-[#4A4A4A] text-sm">
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
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#5f6fff] text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>

                    <div className="mt-4 text-sm text-center">
                        <button className="text-[#5f6fff] hover:underline" onClick={() => setShowReset(true)}>
                            Forgot Password?
                        </button>
                    </div>

                    {showReset && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="max-w-sm p-6 text-gray-800 bg-white rounded-lg shadow-lg">
                                {resetStep === 1 && (
                                    <div>
                                        <input value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="Enter your email" className="w-full mb-2 p-2 border rounded" />
                                        <button onClick={handleRequestReset} className="w-full bg-[#5f6fff] text-white py-2 rounded">Send Code</button>
                                    </div>
                                )}
                                {resetStep === 2 && (
                                    <div>
                                        <input value={resetCode} onChange={e => setResetCode(e.target.value)} placeholder="Enter code" className="w-full mb-2 p-2 border rounded" />
                                        <input type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="New password" className="w-full mb-2 p-2 border rounded" />
                                        <button onClick={handleResetPassword} className="w-full bg-[#5f6fff] text-white py-2 rounded">Reset Password</button>
                                    </div>
                                )}
                                <div className="mt-2 text-sm text-center">{resetMsg}</div>
                                <button onClick={() => { setShowReset(false); setResetStep(1); setResetMsg(""); }} className="mt-2 w-full bg-gray-200 py-2 rounded">Close</button>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 text-sm text-center">
                        <span className="text-[#4A4A4A]">Don't have an account? </span>
                        <Link to="/patient-signup" className="text-[#5f6fff] hover:underline">
                            Sign up here
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
} 