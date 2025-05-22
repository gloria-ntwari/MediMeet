import axios from 'axios';

// Set the base URL based on environment to match the Spring Boot server
const API_BASE_URL = 'http://localhost:8095/api';

// Create axios instance with proper configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,
    timeout: 15000 // Increase timeout to 15 seconds
});

// Log the base URL for debugging
console.log('API configured with base URL:', API_BASE_URL);

// Interfaces matching backend models
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    id: number;
    email: string;
    role: string;
    token?: string; // Add optional token property
    // Add other user fields as needed
}

export interface User {
    id?: number;
    email: string;
    password?: string;
    role?: string;
}

// Frontend Doctor interface - Note we use 'specialization' with a 'z' in frontend code
export interface Doctor extends User {
    name: string;
    specialization: string; // Frontend uses 'z'
    phone: string;
    about?: string;
    experience?: string;
}

// Backend Doctor model - Note backend uses 'specialisation' with an 's'
export interface BackendDoctor extends User {
    name: string;
    specialisation: string; // Backend uses 's'
    phone: string;
    about?: string;
    experience?: string;
    imageUrl?: string;
}

export interface Patient extends User {
    name: string;
    phone: string;
}

export interface Admin extends User {
    name: string;
}

export interface DoctorDTO {
    id: number;
    name: string;
    specialization: string;
    email: string;
    phone: string;
    imageUrl?: string;
    about?: string;
    experience?: string;
}

export interface DoctorProfileDTO {

    name: string;
    email: string;
    specialisation: string;
    phone: string;
    about: string;
    experience: string;
    password?: string;

}

export interface HomeDTO {
    id: number;
    name: string;
    specialisation: string;
    imageUrl?: string;
}

export interface AppointDTO {
    name: string;
    specialisation: string;
    imageUrl?: string;
    about?: string;
    experience?: string;
}

// Interface for updating a doctor - includes password field
export interface DoctorUpdateDTO extends Omit<DoctorDTO, 'id'> {
    password?: string;
}

// Appointment interface
export interface Appointment {
    id?: number;
    doctor: Doctor;
    patient: Patient;
    date: string;
    time: string;
    comment: string;
}

// Interface for creating an appointment
export interface CreateAppointmentRequest {
    doctorId: number;
    date: string; // Format: YYYY-MM-DD
    time: string; // Format: HH:MM (24-hour format)
    comment: string;
}


// Interface for appointment response
export interface AppointmentResponse {
    id: number;
    doctor: any;
    patient: any;
    appointmentDate: string | number[];
    appointmentTime: string | number[];
    note: string;
    status: "pending" | "accepted" | "rejected" | "cancelled";

    // Add fields used in PatientAppointments component
    date?: string | number[];  // For backward compatibility
    time?: string | number[];  // For backward compatibility
    comment?: string;  // For backward compatibility
    doctorName?: string;  // Doctor name for display
    doctorSpecialization?: string;  // Doctor specialization for display
    // Add patient info from backend DTO
    patientName?: string;
    patientEmail?: string;
    patientPhone?: string;
}

// Auth services
export const authService = {
    // Login endpoints
    async login(data: LoginRequest): Promise<LoginResponse> {
        try {
            console.log('Attempting to call login API with:', data.email);
            const response = await api.post('/users/login', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Store credentials in localStorage - use JWT if available, fall back to basic auth
            if (response.data.token) {
                // JWT auth
                localStorage.setItem('jwt_token', response.data.token);
                // Set the Authorization header for future requests
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            } else {
                // Basic auth fallback
                localStorage.setItem('userEmail', data.email);
                localStorage.setItem('userPassword', data.password);
                // Set Basic auth header for future requests
                const base64Credentials = btoa(`${data.email}:${data.password}`);
                api.defaults.headers.common['Authorization'] = `Basic ${base64Credentials}`;
            }

            // Store user info
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('userRole', response.data.role);

            console.log('Login response:', response.data);
            console.log('Authentication headers set for future requests');
            return response.data;
        } catch (error: any) {
            console.error('Login error details:', error);
            if (error.response) {
                console.error('Response error data:', error.response.data);
                console.error('Response status:', error.response.status);
            } else if (error.request) {
                console.error('Request error:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            throw error; // Rethrow to let the component handle it
        }
    },

    async registerPatient(data: Omit<Patient, 'id' | 'role'>): Promise<Patient> {
        try {
            const response = await api.post('/users/register/patient', data);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 409) {
                throw new Error('Patient with this email already exists');
            }
            throw error;
        }
    },

    async registerAdmin(data: Omit<Admin, 'id' | 'role'>): Promise<Admin> {
        try {
            const response = await api.post('/users/register/admin', data);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 409) {
                throw new Error('Admin with this email already exists');
            }
            throw error;
        }
    },


    // Logout endpoint
    async logout(): Promise<void> {
        try {
            await api.post('/users/logout');
        } finally {
            localStorage.removeItem('user');
        }
    },

    // Add function to get all doctors
    async getAllDoctors(): Promise<DoctorDTO[]> {
        try {
            const response = await api.get('/users/getDoctors');
            return response.data;
        } catch (error: any) {
            console.error('Error fetching doctors:', error);
            throw error;
        }
    },

    async getHomeDoctors(): Promise<HomeDTO[]> {
        try {
            const response = await api.get('/users/getHomeDoctors');
            return response.data;
        } catch (error: any) {
            console.error('Error fetching home doctors:', error);
            throw error;
        }
    },

    async getAppointDoctors(): Promise<AppointDTO[]> {
        try {
            const response = await api.get('/users/getAppointDoctors');
            return response.data;
        } catch (error: any) {
            console.error('Error fetching appointment doctors:', error);
            throw error;
        }
    },

    // Update delete doctor function
    async deleteDoctor(id: number): Promise<void> {
        if (typeof id !== 'number' || isNaN(id)) {
            throw new Error('Invalid doctor ID provided');
        }

        try {
            const response = await api.delete(`/users/deleteDoctor/${id}`);
            if (response.status === 204 || response.status === 200) {
                return;
            }
            throw new Error('Failed to delete doctor');
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Doctor not found');
            } else if (error.response?.status === 403) {
                throw new Error('Not authorized to delete this doctor');
            }
            console.error('Error deleting doctor:', error);
            throw error;
        }
    },

    // Registration endpoints
    async addDoctor(data: Omit<Doctor, 'id' | 'role'>, imageFile: File): Promise<Doctor> {
        // Create a Doctor object that matches the backend's expected structure
        const doctorData = {
            name: data.name,
            email: data.email,
            password: data.password,
            specialisation: data.specialization, // Convert to backend's expected spelling with 's'
            phone: data.phone,
            about: data.about || "",
            experience: data.experience || ""
        };

        const formData = new FormData();

        // Stringify the doctor data and append as 'doctor' parameter
        formData.append('doctor', JSON.stringify(doctorData));

        // Attach the image file as the 'image' parameter
        formData.append('image', imageFile);

        console.log('Sending doctor data:', doctorData);
        console.log('Sending image file:', imageFile.name);

        try {
            const response = await api.post('/users/doctors', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Map the backend response to our frontend Doctor interface
            const backendData = response.data;
            const mappedDoctor: Doctor = {
                id: backendData.id,
                name: backendData.name,
                email: backendData.email,
                specialization: backendData.specialisation, // Map 's' to 'z'
                phone: backendData.phone,
                about: backendData.about,
                experience: backendData.experience,
                role: backendData.role
            };

            return mappedDoctor;
        } catch (error: any) {
            console.error('Error in addDoctor:', error);
            if (error.response?.status === 409) {
                throw new Error('Doctor with this email already exists');
            } else if (error.response?.status === 400) {
                throw new Error(error.response.data || 'Invalid data or missing required fields');
            }
            throw error;
        }
    },

    // Function to update a doctor's information
    async updateDoctor(id: number, data: DoctorUpdateDTO, imageFile?: File): Promise<DoctorDTO> {
        // Create FormData object for sending data
        const formData = new FormData();

        console.log("updateDoctor called with ID:", id);
        console.log("Frontend data:", data);

        // Create a doctor object matching the backend's expected structure
        // Include an optional password property in the type definition
        const doctorData: {
            name: string;
            email: string;
            specialisation: string;
            phone: string;
            about: string;
            experience: string;
            password?: string; // Make password optional in the type
        } = {
            name: data.name,
            email: data.email,
            specialisation: data.specialization, // Convert to backend's expected spelling with 's'
            phone: data.phone,
            about: data.about || "",
            experience: data.experience || ""
        };

        // Add password if provided
        if (data.password) {
            doctorData.password = data.password;
        }

        // Stringify the doctor data and append as 'doctor' parameter
        formData.append('doctor', JSON.stringify(doctorData));

        // Add image file if provided
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            console.log("Sending update request for doctor ID:", id);
            console.log("Doctor data:", doctorData);

            const response = await api.put(`/users/updateDoctor/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Raw API response:", response);

            // Map the backend response to the frontend expected format
            const backendData = response.data;
            const mappedResponse: DoctorDTO = {
                id: backendData.id,
                name: backendData.name,
                email: backendData.email,
                phone: backendData.phone,
                specialization: backendData.specialisation, // Map 's' to 'z'
                imageUrl: backendData.imageUrl,
                about: backendData.about,
                experience: backendData.experience
            };

            console.log("Mapped response for frontend:", mappedResponse);
            return mappedResponse;
        } catch (error: any) {
            console.error("Error updating doctor:", error);
            if (error.response?.status === 404) {
                throw new Error('Doctor not found');
            } else if (error.response?.status === 400) {
                throw new Error(error.response.data || 'Invalid data provided');
            }
            throw error;
        }
    },

    // Get all specializations
    async getAllSpecializations(): Promise<string[]> {
        try {
            const response = await api.get('/users/getAllSpecializations');
            return response.data;
        } catch (error: any) {
            console.error('Error fetching specializations:', error);
            // Return default specializations if API call fails
            return [
                "General physician",
                "Gynecologist",
                "Dermatologist",
                "Pediatrician",
                "Neurologist",
                "Gastroenterologist"
            ];
        }
    },

    // Get doctors by specialization
    async getDoctorsBySpecialization(specialization: string): Promise<DoctorDTO[]> {
        try {
            const response = await api.get('/users/getDoctorsBySpecialization', {
                params: { specialization }
            });

            // Map backend response to frontend format if needed
            return response.data.map((doctor: any) => ({
                id: doctor.id,
                name: doctor.name,
                email: doctor.email,
                phone: doctor.phone,
                specialization: doctor.specialisation, // Convert to frontend spelling
                imageUrl: doctor.imageUrl,
                about: doctor.about,
                experience: doctor.experience
            }));
        } catch (error: any) {
            console.error('Error fetching doctors by specialization:', error);
            throw error;
        }
    },

    // Get doctor by ID
    async getDoctorById(id: number): Promise<DoctorDTO> {
        try {
            const response = await api.get(`/users/doctors/${id}`);

            // Map backend response to frontend format
            const doctor = response.data;
            return {
                id: doctor.id,
                name: doctor.name,
                email: doctor.email,
                phone: doctor.phone,
                specialization: doctor.specialisation, // Convert to frontend spelling
                imageUrl: doctor.imageUrl,
                about: doctor.about,
                experience: doctor.experience
            };
        } catch (error: any) {
            console.error('Error fetching doctor by ID:', error);
            throw error;
        }
    },

    // Get related doctors (with the same specialization)
    async getRelatedDoctors(specialization: string, currentDoctorId?: number): Promise<DoctorDTO[]> {
        try {
            // Reuse the existing getDoctorsBySpecialization function
            const doctors = await this.getDoctorsBySpecialization(specialization);

            // Filter out the current doctor if ID is provided
            return currentDoctorId
                ? doctors.filter(doctor => doctor.id !== currentDoctorId)
                : doctors;
        } catch (error: any) {
            console.error('Error fetching related doctors:', error);
            throw error;
        }
    },

    async getPatientAppointments(): Promise<AppointmentResponse[]> {
        try {
            const response = await api.get('/appointments/patient');
            return response.data;
        } catch (error) {
            console.error('Error fetching patient appointments:', error);
            return mockAppointments(); // Return mock data for demo purposes
        }
    },

    async getDoctorAppointments(page: number = 0, size: number = 5): Promise<{
        appointments: AppointmentResponse[],
        totalPages: number,
        currentPage: number,
        pageSize: number,
        isLastPage: boolean
    }> {
        try {
            // Force size to be exactly 5
            const pageSize = 5;

            const response = await api.get('/appointments/doctor', {
                params: {
                    page,
                    size: pageSize
                }
            });
            console.log('Doctor appointments fetched successfully:', response.data);

            // Handle the new response format
            const appointments = response.data.content.map((appt: any) => ({
                id: appt.id,
                date: appt.date,
                time: appt.time,
                comment: appt.comment,
                status: appt.status,
                patientName: appt.patient?.name,
                patientEmail: appt.patient?.email,
                patientPhone: appt.patient?.phone,
                doctor: appt.doctor,
                patient: appt.patient
            }));

            return {
                appointments,
                totalPages: response.data.totalPages,
                currentPage: response.data.currentPage,
                pageSize: response.data.pageSize,
                isLastPage: response.data.isLastPage
            };
        } catch (error: any) {
            console.error('Error fetching doctor appointments:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            if (error.response?.status === 403) {
                console.log('Authentication issue: ' + (error.response?.data || 'Unauthorized access'));
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                console.log('Current user from localStorage:', user.role);
                if (!user || user.role !== 'Doctor') {
                    throw new Error('Unauthorized: Only doctors can view their appointments');
                }
                return {
                    appointments: [],
                    totalPages: 0,
                    currentPage: 0,
                    pageSize: 5,
                    isLastPage: true
                };
            }
            if (error.response?.status === 404) {
                return {
                    appointments: [],
                    totalPages: 0,
                    currentPage: 0,
                    pageSize: 5,
                    isLastPage: true
                };
            }
            return {
                appointments: [],
                totalPages: 0,
                currentPage: 0,
                pageSize: 5,
                isLastPage: true
            };
        }
    },
    async getRecentAppointments(): Promise<AppointmentResponse[]> {
        try {
            const response = await api.get('/appointments/recentAppointment');
            console.log('Doctor appointments fetched successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching doctor appointments:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            if (error.response?.status === 403) {
                console.log('Authentication issue: ' + (error.response?.data || 'Unauthorized access'));
                // Try to refresh the authentication or handle auth issues
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                console.log('Current user from localStorage:', user.role);
                if (!user || user.role !== 'Doctor') {
                    throw new Error('Unauthorized: Only doctors can view their appointments');
                }
                // Return empty array for now to prevent UI errors
                return [];
            }
            if (error.response?.status === 404) {
                // Return empty array if no appointments found
                return [];
            }
            return []; // Return empty array instead of throwing error to prevent UI crashes
        }
    },
    async getAllRecentAppointments(): Promise<AppointmentResponse[]> {
        try {
            const response = await api.get('/appointments/allRecentAppointments');
            console.log('appointments fetched successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching appointments:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }

            if (error.response?.status === 404) {
                // Return empty array if no appointments found
                return [];
            }
            return []; // Return empty array instead of throwing error to prevent UI crashes
        }
    },

    async getUpcomingAppointments(): Promise<AppointmentResponse[]> {
        try {
            const response = await api.get('/appointments/upcoming');
            return response.data;
        } catch (error) {
            console.error('Error fetching upcoming appointments:', error);
            // Return mock data for demo purposes
            return mockAppointments().filter(a => a.status === 'pending');
        }
    },


    async cancelAppointment(appointmentId: number): Promise<void> {
        try {
            await api.delete(`/appointments/${appointmentId}`);
            console.log('Appointment cancelled successfully');
        } catch (error: any) {
            console.error('Error cancelling appointment:', error);
            // If API call fails, show appropriate error
            if (error.response?.status === 404) {
                throw new Error('Appointment not found');
            } else if (error.response?.data) {
                throw new Error(error.response.data.message || 'Failed to cancel appointment');
            } else {
                throw new Error('Failed to cancel appointment. Please try again.');
            }
        }
    },

    // Add a method specifically for removing an appointment from doctor's view
    async removeAppointment(appointmentId: number): Promise<void> {
        return this.cancelAppointment(appointmentId); // Use the same endpoint for now
    },

    // Add the missing bookAppointment function
    async bookAppointment(data: CreateAppointmentRequest): Promise<AppointmentResponse> {
        try {
            const response = await api.post('/appointments/bookAppointment', null, {
                params: {
                    doctorId: data.doctorId,
                    date: data.date,
                    time: data.time,
                    comment: data.comment
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error booking appointment:', error);

            // For demo purposes, return a mock response if the backend call fails
            // This allows the UI to still work even without a working backend
            const mockResponse: AppointmentResponse = {
                id: Math.floor(Math.random() * 1000),
                doctor: { id: data.doctorId, name: "Dr. Sample", specialisation: "General" },
                patient: { id: 1, name: "Patient" },
                appointmentDate: data.date,
                appointmentTime: data.time,
                note: data.comment,
                status: "pending",
                doctorName: "Dr. Sample",
                doctorSpecialization: "General"
            };
            return mockResponse;
        }
    },

    // Update the updateAppointmentStatus method
    updateAppointmentStatus: async (appointmentId: number, status: string) => {
        try {
            const response = await api.put(`/appointments/${appointmentId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating appointment status:', error);

            // For demo purposes, return mock data if the backend call fails
            const mockAppointment = mockAppointmentsWithDecisions().find(a => a.id === appointmentId);
            if (mockAppointment) {
                mockAppointment.status = status as any;
                return mockAppointment;
            }

            throw error;
        }
    },

    // Add auth check function
    async checkAuthStatus(): Promise<any> {
        try {
            const response = await api.get('/appointments/auth-check');
            console.log('Auth status check:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error checking auth status:', error);
            return {
                authenticated: false,
                error: 'Failed to check authentication status'
            };
        }
    },

    async getAllAppointments(): Promise<AppointmentResponse[]> {
        try {
            const response = await api.get('/appointments');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch all appointments:', error);
            throw error;
        }
    },

    async getAdminDashboardStats(): Promise<{ doctors: number, patients: number, admins: number, appointments: number }> {
        const response = await api.get('/appointments/stats');
        return response.data;
    },

    async getDoctorProfile(): Promise<DoctorProfileDTO> {
        try {
            const response = await api.get('/users/doctorProfile');
            return response.data;
        } catch (error: any) {
            console.error('Error fetching doctor profile:', error);
            throw error;
        }
    },

    async updateDoctorProfile(data: DoctorProfileDTO, imageFile?: File): Promise<DoctorProfileDTO> {
        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await api.put('/users/updateDoctorProfile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error updating doctor profile:', error);
            if (error.response?.status === 400) {
                throw new Error(error.response.data || 'Invalid data provided');
            }
            throw error;
        }
    },

    async updatePatientProfile(data: {
        name: string;
        email: string;
        phone: string;
        currentPassword?: string;
        newPassword?: string;
    }): Promise<{
        name: string;
        email: string;
        phone: string;
    }> {
        try {
            const response = await api.put('/users/updatePatientProfile', data);
            return response.data;
        } catch (error: any) {
            console.error('Error updating patient profile:', error);
            if (error.response?.status === 400) {
                throw new Error(error.response.data || 'Invalid data provided');
            } else if (error.response?.status === 401) {
                throw new Error('Current password is incorrect');
            }
            throw error;
        }
    },

    // Get appointment counts for the logged-in doctor
    getLoggedInDoctorAppointmentCounts: async (): Promise<{ [key: string]: number }> => {
        const response = await api.get('/appointments/doctor/counts');
        return response.data;
    },

    // Get appointments by status for the logged-in doctor
    getLoggedInDoctorAppointmentsByStatus: async (status: string): Promise<Appointment[]> => {
        const response = await api.get(`/appointments/doctor/appointments/status/${status}`);
        return response.data;
    },

    // Get rejected appointments for the logged-in doctor
    async getLoggedInDoctorRejectedAppointments(): Promise<Appointment[]> {
        const response = await api.get('/appointments/doctor/rejected');
        return response.data;
    },

    // Get appointment status counts for admin (for pie chart)
    async getAdminAppointmentStatusCounts(): Promise<{ [key: string]: number }> {
        const response = await api.get('/appointments/admin/status-counts');
        return response.data;
    },

    // Get appointments over time for admin (for line chart)
    async getAdminAppointmentsOverTime(): Promise<{ date: string, count: number }[]> {
        const response = await api.get('/appointments/admin/appointments-over-time');
        return response.data;
    },
};

// Helper function for mock appointment data
function mockAppointments(): AppointmentResponse[] {
    return [
        {
            id: 1,
            doctor: { name: "Dr. Smith", specialization: "Cardiology" },
            patient: { name: "John Doe" },
            appointmentDate: "2024-05-01",
            appointmentTime: "10:00",
            note: "Regular checkup",
            status: "pending",
            doctorName: "Dr. Smith",
            doctorSpecialization: "Cardiology"
        },
        // ... other mock appointments ...
    ];
}

// Helper function for mock appointment data with pending status
function mockAppointmentsWithDecisions(): AppointmentResponse[] {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
        {
            id: 1,
            doctor: {
                id: 101,
                name: "Dr. Sarah Johnson",
                specialisation: "Dermatologist",
                imageUrl: "/images/doctor1.jpg"
            },
            patient: {
                id: 201,
                name: "John Doe"
            },
            appointmentDate: tomorrow.toISOString().split('T')[0],
            appointmentTime: "10:00",
            note: "Annual skin checkup",
            status: "pending",

            // Add fields for compatibility with PatientAppointments component
            date: tomorrow.toISOString().split('T')[0],
            time: "10:00",
            comment: "Annual skin checkup",
            doctorName: "Dr. Sarah Johnson",
            doctorSpecialization: "Dermatologist"
        },
        {
            id: 2,
            doctor: {
                id: 102,
                name: "Dr. Michael Chen",
                specialisation: "Cardiologist",
                imageUrl: "/images/doctor2.jpg"
            },
            patient: {
                id: 201,
                name: "John Doe"
            },
            appointmentDate: nextWeek.toISOString().split('T')[0],
            appointmentTime: "14:30",
            note: "Follow-up on test results",
            status: "pending",

            // Add fields for compatibility with PatientAppointments component
            date: nextWeek.toISOString().split('T')[0],
            time: "14:30",
            comment: "Follow-up on test results",
            doctorName: "Dr. Michael Chen",
            doctorSpecialization: "Cardiologist"
        }
    ];
}

// Helper function to log FormData contents (doesn't modify the formData)
function formDataToObject(formData: FormData): Record<string, any> {
    const obj: Record<string, any> = {};
    formData.forEach((value, key) => {
        // Don't try to convert File objects to string
        if (value instanceof File) {
            obj[key] = `File: ${value.name} (${value.size} bytes)`;
        } else {
            obj[key] = value;
        }
    });
    return obj;
}

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
    // Check for JWT token first
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Adding JWT token to request');
    } else {
        // Basic auth fallback
        const email = localStorage.getItem('userEmail');
        const password = localStorage.getItem('userPassword');
        if (email && password) {
            const base64Credentials = btoa(`${email}:${password}`);
            config.headers.Authorization = `Basic ${base64Credentials}`;
            console.log('Adding basic auth credentials to request');
        } else {
            // Try to get the user from localStorage and use email/password from there
            const userString = localStorage.getItem('user');
            if (userString) {
                try {
                    const user = JSON.parse(userString);
                    const storedEmail = user.email;
                    // We can't get the password from the user object as it's not stored there
                    // But we can try to use the email for the auth header to help debugging
                    console.log('Using fallback authentication with email from user object:', storedEmail);
                    // Don't set Authorization header as we don't have the password
                } catch (e) {
                    console.warn('Failed to parse user from localStorage');
                }
            } else {
                console.warn('No authentication credentials found');
            }
        }
    }

    // Add a timestamp to bypass caching
    config.params = {
        ...config.params,
        _t: Date.now()
    };

    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Enhanced error handling in response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Clear all authentication data
                    localStorage.removeItem('jwt_token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userPassword');
                    // Redirect to patient login page
                    window.location.href = '/patient-login';
                    break;
                case 403:
                    console.error('Access denied');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('Server error occurred');
                    break;
            }
        } else if (error.request) {
            console.error('Network error - no response received');
        }
        return Promise.reject(error);
    }
);

export default api;

// Helper function to get the full image URL for backend images
export const getBackendImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) {
        console.log("No image path provided, using placeholder");
        return '/doctor-placeholder.jpg';
    }

    console.log("Original image path:", imagePath);

    // If it's already a full URL, return it
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // If it's an asset path from backend (like "assets/something.jpg")
    if (imagePath.startsWith('assets/')) {
        // Get the filename part only
        const filename = imagePath.split('/').pop();

        // Return the full path to the image through the API endpoint
        return `/api/assets/${filename}`;
    }

    // Fallback to default image
    console.log("Using fallback image");
    return '/doctor-placeholder.jpg';
};