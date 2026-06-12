import React from 'react'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import AboutUsPage from './pages/AboutUsPage.jsx' 
import ServicesPage from './pages/ServicesPage.jsx' 
import BlogsPage from './pages/BlogsPage.jsx'
import BlogDetailsPage from './pages/BlogDetailsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ClientLayout from './pages/clientDashboard/ClientLayout.jsx'
import ClientDashboardHome from './pages/clientDashboard/ClientDashboardHome.jsx'
import ClientPlans from './pages/clientDashboard/ClientPlans.jsx'
import AITrackerPage from './pages/AITrackerPage.jsx'
import AllPlansPage from './pages/AllPlansPage.jsx'
import PlanCheckoutPage from './pages/PlanCheckoutPage.jsx'
import FormationCheckoutPage from './pages/FormationCheckoutPage.jsx'
import Header from './components/Header.jsx' 
import Footer from './components/Footer.jsx' 
import CustomCursor from './components/CustomCursor.jsx'
import ScrollToTop from './utils/ScrollToTop.jsx'
import { Routes, Route, useLocation } from 'react-router-dom' 
import { Toaster } from 'react-hot-toast';
import { Toaster as SonnerToaster } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition.jsx'
import ProgressBar from './components/ProgressBar.jsx'
import SmoothScroll from './components/SmoothScroll.jsx'
import CreateBlog from './pages/dieteticienDashboard/CreateBlog.jsx'
import CreatePlan from './pages/dieteticienDashboard/CreatePlan.jsx'
import MyPlans from './pages/dieteticienDashboard/MyPlans.jsx'
import MyBlog from './pages/dieteticienDashboard/DieteticienBlogs.jsx'
import Layout from './pages/dieteticienDashboard/Layout.jsx'
import AdminLayout from './pages/AdminDasboard/AdminLayout.jsx'
import ContactMessages from './pages/dieteticienDashboard/ContactMessages.jsx'
import AddAdminNutritionist from './pages/AdminDasboard/AddAdminNutritionist.jsx'
import ClientsPage from './pages/dieteticienDashboard/ClientsPage.jsx'
import AllUsers from './pages/AdminDasboard/AllUsers.jsx'
import EditUserProfile from './pages/AdminDasboard/EditUserProfile.jsx'
import AdminPayments from './pages/AdminDasboard/AdminPayments.jsx'
import ManageDieteticiens from './pages/AdminDasboard/ManageDieteticiens.jsx'
import ConsultationRequests from './pages/dieteticienDashboard/ConsultationRequests.jsx'
import DieteticienPayments from './pages/dieteticienDashboard/DieteticienPayments.jsx'
import PaymentApprovals from './pages/dieteticienDashboard/PaymentApprovals.jsx'
import CreateCourse from './pages/dieteticienDashboard/CreateCourse.jsx'
import AllCourses from './pages/dieteticienDashboard/AllCourses.jsx'
import MyFormations from './pages/dieteticienDashboard/MyFormations.jsx'
import CreateFormation from './pages/dieteticienDashboard/CreateFormation.jsx'
import FormationSessions from './pages/dieteticienDashboard/FormationSessions.jsx'
import StudentLayout from './pages/studentDashboard/StudentLayout.jsx'
import DashboardHome from './pages/studentDashboard/DashboardHome.jsx'
import MyCoursesPage from './pages/studentDashboard/MyCourses.jsx'
import MyFormationsPage from './pages/studentDashboard/MyFormationsPage.jsx'
import LoginGate from './components/LoginGate.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ChatBubble from './components/chat/ChatBubble.jsx'
import { useChat } from './context/ChatContext.jsx'

import './App.css'

function App() {
  const location = useLocation();
  const { chatOpen } = useChat();
  const isLoginRoute = location.pathname.startsWith('/login');
  const isSignupRoute = location.pathname.startsWith('/signup');
  
  return (
    <>
      <CustomCursor />
      <SmoothScroll />
      <ProgressBar />
      <ScrollToTop />
      <Toaster />
      <SonnerToaster position="top-center" richColors closeButton />
      {(!isLoginRoute && !isSignupRoute && !chatOpen) && <Header />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route index element={<PageTransition><HomePage /></PageTransition>} />
          <Route path='/contact' element={<LoginGate><PageTransition><ContactPage /></PageTransition></LoginGate>} />
          <Route path='/login' element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path='/signup' element={<PageTransition><SignUpPage /></PageTransition>} />
          <Route path='/about' element={<PageTransition><AboutUsPage /></PageTransition>} /> 
          <Route path='/services' element={<LoginGate><PageTransition><ServicesPage /></PageTransition></LoginGate>} /> 
          <Route path='/blogs' element={<LoginGate><PageTransition><BlogsPage /></PageTransition></LoginGate>} /> 
          <Route path='/profile' element={<LoginGate><PageTransition><ProfilePage /></PageTransition></LoginGate>} /> 
          <Route path='/my-formations' element={<LoginGate><PageTransition><MyFormationsPage /></PageTransition></LoginGate>} /> 
          <Route path='/ai-tracker' element={<LoginGate><PageTransition><AITrackerPage /></PageTransition></LoginGate>} /> 
          <Route path="/blog/:id" element={<LoginGate><PageTransition><BlogDetailsPage /></PageTransition></LoginGate>} />
          <Route path="/allPlans" element={<LoginGate><PageTransition><AllPlansPage /></PageTransition></LoginGate>} />
          <Route path="/checkout/plan/:planId" element={<LoginGate><PageTransition><PlanCheckoutPage /></PageTransition></LoginGate>} />
          <Route path="/checkout/formation/:formationId" element={<LoginGate><PageTransition><FormationCheckoutPage /></PageTransition></LoginGate>} />

          <Route path="/client" element={<ProtectedRoute roles={['client']}><ClientLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<ClientDashboardHome />} />
              <Route path="my-plans" element={<ClientPlans />} />
          </Route>

          <Route path="/dieteticien" element={<ProtectedRoute roles={['dieteticien', 'admin']}><Layout /></ProtectedRoute>}>
              <Route path="create-blog" element={<CreateBlog />} />
              <Route path="create-plan" element={<CreatePlan />} />
              <Route path="MyPlans" element={<MyPlans />} />
              <Route path="MyBlogs" element={<MyBlog />} />
              <Route path="create-course" element={<CreateCourse />} />
              <Route path="all-courses" element={<AllCourses />} />
              <Route path="formations" element={<MyFormations />} />
              <Route path="formations/create" element={<CreateFormation />} />
              <Route path="formations/edit/:id" element={<CreateFormation />} />
              <Route path="formations/:formationId/sessions" element={<FormationSessions />} />
              <Route path="contact-messages" element={<ContactMessages />} />
              <Route path="my-Profile" element={<EditUserProfile />} />
              <Route path="payments" element={<DieteticienPayments />} />
              <Route path="payment-approvals" element={<PaymentApprovals />} />
              <Route path="all-clients" element={<ClientsPage />} />
              <Route path="consultation-requests" element={<ConsultationRequests />} />
          </Route>
          <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="my-courses" element={<MyCoursesPage />} />
              <Route path="my-formations" element={<MyFormationsPage />} />
          </Route>
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
              <Route path="add-admin-nutritionist" element={<AddAdminNutritionist />} />
              <Route path="all-users" element={<AllUsers />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="manage-dieteticiens" element={<ManageDieteticiens />} />
              <Route path="my-Profile" element={<EditUserProfile />} />
          </Route>
        </Routes>
      </AnimatePresence>
      <ChatBubble />
    </>
  )
}

export default App