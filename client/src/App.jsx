import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentQuizzes from './pages/student/Quizzes';
import TakeQuiz from './pages/student/TakeQuiz';
import StudentResults from './pages/student/Results';

// Faculty Pages
import FacultyDashboard from './pages/faculty/Dashboard';
import QuestionBank from './pages/faculty/QuestionBank';
import ManageQuizzes from './pages/faculty/ManageQuizzes';
import CreateQuiz from './pages/faculty/CreateQuiz';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Toaster position="top-right" toastOptions={{
                    duration: 4000,
                    style: { background: '#1e293b', color: '#fff', borderRadius: '10px' }
                }} />

                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Student Routes */}
                    <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
                    <Route path="/student/quizzes" element={<ProtectedRoute allowedRoles={['student']}><StudentQuizzes /></ProtectedRoute>} />
                    <Route path="/student/quiz/:id" element={<ProtectedRoute allowedRoles={['student']}><TakeQuiz /></ProtectedRoute>} />
                    <Route path="/student/results" element={<ProtectedRoute allowedRoles={['student']}><StudentResults /></ProtectedRoute>} />

                    {/* Faculty Routes */}
                    <Route path="/faculty" element={<ProtectedRoute allowedRoles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
                    <Route path="/faculty/questions" element={<ProtectedRoute allowedRoles={['faculty']}><QuestionBank /></ProtectedRoute>} />
                    <Route path="/faculty/quizzes" element={<ProtectedRoute allowedRoles={['faculty']}><ManageQuizzes /></ProtectedRoute>} />
                    <Route path="/faculty/quizzes/create" element={<ProtectedRoute allowedRoles={['faculty']}><CreateQuiz /></ProtectedRoute>} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
                    <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><CourseManagement /></ProtectedRoute>} />

                    {/* Default Redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
