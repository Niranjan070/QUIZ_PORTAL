import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentQuizzes from './pages/student/Quizzes';
import TakeQuiz from './pages/student/TakeQuiz';
import StudentResults from './pages/student/Results';
import ResultDetails from './pages/student/ResultDetails';
import Certificate from './pages/student/Certificate';

// Faculty Pages
import FacultyDashboard from './pages/faculty/Dashboard';
import QuestionBank from './pages/faculty/QuestionBank';
import ManageQuizzes from './pages/faculty/ManageQuizzes';
import CreateQuiz from './pages/faculty/CreateQuiz';
import CourseStudents from './pages/faculty/CourseStudents';
import FacultyCourseManagement from './pages/faculty/CourseManagement';
import FacultyAnalytics from './pages/faculty/Analytics';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import Analytics from './pages/admin/Analytics';

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Toaster position="top-right" toastOptions={{
                        duration: 4000,
                        style: { background: '#1e293b', color: '#fff', borderRadius: '10px' }
                    }} />

                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Student Routes */}
                        <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><Layout role="student"><StudentDashboard /></Layout></ProtectedRoute>} />
                        <Route path="/student/quizzes" element={<ProtectedRoute allowedRoles={['student']}><Layout role="student"><StudentQuizzes /></Layout></ProtectedRoute>} />
                        <Route path="/student/quiz/:id" element={<ProtectedRoute allowedRoles={['student']}><TakeQuiz /></ProtectedRoute>} />
                        <Route path="/student/results" element={<ProtectedRoute allowedRoles={['student']}><Layout role="student"><StudentResults /></Layout></ProtectedRoute>} />
                        <Route path="/student/results/:attemptId" element={<ProtectedRoute allowedRoles={['student']}><Layout role="student"><ResultDetails /></Layout></ProtectedRoute>} />
                        <Route path="/student/certificate/:attemptId" element={<ProtectedRoute allowedRoles={['student']}><Certificate /></ProtectedRoute>} />

                        {/* Faculty Routes */}
                        <Route path="/faculty" element={<ProtectedRoute allowedRoles={['faculty']}><Layout role="faculty"><FacultyDashboard /></Layout></ProtectedRoute>} />
                        <Route path="/faculty/questions" element={<ProtectedRoute allowedRoles={['faculty']}><Layout role="faculty"><QuestionBank /></Layout></ProtectedRoute>} />
                        <Route path="/faculty/quizzes" element={<ProtectedRoute allowedRoles={['faculty']}><Layout role="faculty"><ManageQuizzes /></Layout></ProtectedRoute>} />
                        <Route path="/faculty/quizzes/create" element={<ProtectedRoute allowedRoles={['faculty']}><Layout role="faculty"><CreateQuiz /></Layout></ProtectedRoute>} />
                        <Route path="/faculty/courses" element={<ProtectedRoute allowedRoles={['faculty']}><Layout role="faculty"><FacultyCourseManagement /></Layout></ProtectedRoute>} />
                        <Route path="/faculty/courses/:courseId/students" element={<ProtectedRoute allowedRoles={['faculty']}><Layout role="faculty"><CourseStudents /></Layout></ProtectedRoute>} />
                        <Route path="/faculty/analytics" element={<ProtectedRoute allowedRoles={['faculty']}><Layout role="faculty"><FacultyAnalytics /></Layout></ProtectedRoute>} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Layout role="admin"><AdminDashboard /></Layout></ProtectedRoute>} />
                        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><Layout role="admin"><UserManagement /></Layout></ProtectedRoute>} />
                        <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><Layout role="admin"><CourseManagement /></Layout></ProtectedRoute>} />
                        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><Layout role="admin"><Analytics /></Layout></ProtectedRoute>} />

                        {/* Default Redirect */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
