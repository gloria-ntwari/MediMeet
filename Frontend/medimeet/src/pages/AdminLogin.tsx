import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { authService } from '../services/api';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    // Forgot password state
    const [showReset, setShowReset] = useState(false);
    const [resetStep, setResetStep] = useState(1);
    const [resetEmail, setResetEmail] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [resetPassword, setResetPassword] = useState("");
    const [resetMsg, setResetMsg] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (!email || !password) {
                setError('Please enter both email and password');
                return;
            }

            // Use the API service to login
            const user = await authService.login({ email, password });

            // Check if the user is an admin
            if (user && user.role === 'ADMIN') {
                // Redirect to admin dashboard
                navigate('/admin/dashboard');
            } else {
                setError('Access denied. Only admins can log in here.');
                // Clear stored data if not an admin
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userPassword');
                localStorage.removeItem('user');
                localStorage.removeItem('userRole');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.response?.status === 401) {
                setError('Invalid email or password');
            } else if (err.response?.status === 403) {
                setError('Access denied. Only admins can log in here.');
            } else if (err.message === 'No response from server. Please check your connection.') {
                setError('Unable to connect to server. Please check your internet connection.');
            } else {
                setError(err.response?.data?.message || 'Login failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestReset = async () => {
        try {
            await axios.post("/api/users/request-password-reset", null, { params: { email: resetEmail } });
            setResetMsg("Code sent to your email.");
            setResetStep(2);
        } catch {
            setResetMsg("Error sending code.");
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
        } catch {
            setResetMsg("Invalid code or error.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-96">
                <h2 className="mb-6 text-2xl font-bold text-center">Admin Login</h2>

                {location.state?.message && (
                    <div className="p-3 mb-4 text-sm text-green-500 rounded-lg bg-green-50">
                        {location.state.message}
                    </div>
                )}

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-500 rounded-lg bg-red-50">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                    </div>
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
                    {/* <div className="mb-2">
                        <span className="text-[#4A4A4A]">Don't have an account? </span>
                        <Link to="/admin-register" className="text-[#5f6fff] hover:underline">
                            Register here
                        </Link>
                    </div> */}
                    <div>
                        <span className="text-[#4A4A4A]">Doctor Login? </span>
                        <Link to="/doctor-login" className="text-[#5f6fff] hover:underline">
                            Click here
                        </Link>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
} 