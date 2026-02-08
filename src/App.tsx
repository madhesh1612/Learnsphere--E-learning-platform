import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { WebsiteLayout } from "@/components/layout/WebsiteLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { InstructorLayout } from "@/components/layout/InstructorLayout";
import { LearnerLayout } from "@/components/layout/LearnerLayout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Courses from "./pages/Courses";
import MyCourses from "./pages/MyCourses";
import Achievements from "./pages/Achievements";
import CourseDetail from "./pages/CourseDetail";
import LessonPlayer from "./pages/LessonPlayer";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCourseForm from "./pages/admin/AdminCourseForm";

// Instructor Pages
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import InstructorCourses from "./pages/instructor/InstructorCourses";
import CourseEditor from "./pages/instructor/CourseEditor";
import LessonEditor from "./pages/instructor/LessonEditor";
import QuizBuilder from "./pages/instructor/QuizBuilder";

// Learner Pages
import LearnerDashboard from "./pages/learner/LearnerDashboard";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Website Routes */}
            <Route element={<WebsiteLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
            </Route>

            {/* Full Screen Player */}
            <Route path="/lesson/:courseId/:lessonId" element={<LessonPlayer />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Admin Routes - Protected */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="courses/new" element={<AdminCourseForm />} />
              <Route path="courses/:id/edit" element={<AdminCourseForm />} />
            </Route>

            {/* Instructor Routes - Protected */}
            <Route
              path="/instructor"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <InstructorLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<InstructorDashboard />} />
              <Route index element={<InstructorDashboard />} />
              <Route path="courses" element={<InstructorCourses />} />
              <Route path="courses/new" element={<CourseEditor />} />
              <Route path="courses/:id" element={<CourseEditor />} />
              <Route path="courses/:courseId/lessons/new" element={<LessonEditor />} />
              <Route path="courses/:courseId/lessons/:lessonId" element={<LessonEditor />} />
              <Route path="courses/:courseId/quiz/:quizId?" element={<QuizBuilder />} />
            </Route>

            {/* Learner Routes - Protected */}
            <Route
              path="/learner"
              element={
                <ProtectedRoute allowedRoles={['learner']}>
                  <LearnerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<LearnerDashboard />} />
              <Route path="my-courses" element={<MyCourses />} />
              <Route path="browse" element={<Courses />} />
              <Route path="achievements" element={<Achievements />} />
            </Route>

            {/* Legacy routes - redirect to appropriate dashboard */}
            <Route path="/my-courses" element={<Navigate to="/learner/my-courses" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
