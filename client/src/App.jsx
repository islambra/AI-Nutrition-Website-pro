import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Toaster as HotToaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'

const PAGE_TRANSITION_DURATION = 0.15

const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const SignUpPage = lazy(() => import('./pages/SignUpPage.jsx'))
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'))
const AboutUsPage = lazy(() => import('./pages/AboutUsPage.jsx'))
const ServicesPage = lazy(() => import('./pages/ServicesPage.jsx'))
const BlogsPage = lazy(() => import('./pages/BlogsPage.jsx'))
const BlogDetailsPage = lazy(() => import('./pages/BlogDetailsPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const ClientLayout = lazy(() => import('./pages/clientDashboard/ClientLayout.jsx'))
const ClientDashboardHome = lazy(() => import('./pages/clientDashboard/ClientDashboardHome.jsx'))
const ClientPlans = lazy(() => import('./pages/clientDashboard/ClientPlans.jsx'))
const ClientRequests = lazy(() => import('./pages/clientDashboard/ClientRequests.jsx'))
const AllPlansPage = lazy(() => import('./pages/AllPlansPage.jsx'))
const PlanCheckoutPage = lazy(() => import('./pages/PlanCheckoutPage.jsx'))
const FormationCheckoutPage = lazy(() => import('./pages/FormationCheckoutPage.jsx'))
const CourseSubscriptionCheckout = lazy(() => import('./pages/CourseSubscriptionCheckout.jsx'))
const AiToolPage = lazy(() => import('./pages/AiToolPage.jsx'))
const AiToolCheckout = lazy(() => import('./pages/AiToolCheckout.jsx'))

const CreateBlog = lazy(() => import('./pages/dieteticienDashboard/CreateBlog.jsx'))
const CreatePlan = lazy(() => import('./pages/dieteticienDashboard/CreatePlan.jsx'))
const MyPlans = lazy(() => import('./pages/dieteticienDashboard/MyPlans.jsx'))
const MyBlog = lazy(() => import('./pages/dieteticienDashboard/DieteticienBlogs.jsx'))
const Layout = lazy(() => import('./pages/dieteticienDashboard/Layout.jsx'))
const AdminLayout = lazy(() => import('./pages/AdminDashboard/AdminLayout.jsx'))
const ContactMessages = lazy(() => import('./pages/dieteticienDashboard/ContactMessages.jsx'))
const AddAdminNutritionist = lazy(() => import('./pages/AdminDashboard/AddAdminNutritionist.jsx'))
const ClientsPage = lazy(() => import('./pages/dieteticienDashboard/ClientsPage.jsx'))
const AllUsers = lazy(() => import('./pages/AdminDashboard/AllUsers.jsx'))
const EditUserProfile = lazy(() => import('./pages/AdminDashboard/EditUserProfile.jsx'))
const AdminPayments = lazy(() => import('./pages/AdminDashboard/AdminPayments.jsx'))
const ManageDieteticiens = lazy(() => import('./pages/AdminDashboard/ManageDieteticiens.jsx'))
const ConsultationRequests = lazy(() => import('./pages/dieteticienDashboard/ConsultationRequests.jsx'))
const DieteticienPayments = lazy(() => import('./pages/dieteticienDashboard/DieteticienPayments.jsx'))
const PaymentApprovals = lazy(() => import('./pages/dieteticienDashboard/PaymentApprovals.jsx'))
const CreateCourse = lazy(() => import('./pages/dieteticienDashboard/CreateCourse.jsx'))
const AllCourses = lazy(() => import('./pages/dieteticienDashboard/AllCourses.jsx'))
const MyFormations = lazy(() => import('./pages/dieteticienDashboard/MyFormations.jsx'))
const CreateFormation = lazy(() => import('./pages/dieteticienDashboard/CreateFormation.jsx'))
const FormationSessions = lazy(() => import('./pages/dieteticienDashboard/FormationSessions.jsx'))
const StudentLayout = lazy(() => import('./pages/studentDashboard/StudentLayout.jsx'))
const MyCoursesPage = lazy(() => import('./pages/studentDashboard/MyCourses.jsx'))
const MyFormationsPage = lazy(() => import('./pages/studentDashboard/MyFormationsPage.jsx'))
const StudentRequests = lazy(() => import('./pages/studentDashboard/StudentRequests.jsx'))
const ManageCourseSubscriptions = lazy(() => import('./pages/AdminDashboard/ManageCourseSubscriptions.jsx'))
const ManageAiToolSubscriptions = lazy(() => import('./pages/AdminDashboard/ManageAiToolSubscriptions.jsx'))
const PlatformPaymentSettings = lazy(() => import('./pages/AdminDashboard/PlatformPaymentSettings.jsx'))

import Header from './components/Header.jsx'
import CustomCursor from './components/CustomCursor.jsx'
import ScrollToTop from './utils/ScrollToTop.jsx'
import PageTransition from './components/PageTransition.jsx'
import ProgressBar from './components/ProgressBar.jsx'
import SmoothScroll from './components/SmoothScroll.jsx'
import LoginGate from './components/LoginGate.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import ChatBubble from './components/chat/ChatBubble.jsx'
import { useChat } from './context/ChatContext.jsx'

import './App.css'

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  )
}

function App() {
  const location = useLocation();
  const { chatOpen } = useChat();
  const isLoginRoute = location.pathname.startsWith('/login');
  const isSignupRoute = location.pathname.startsWith('/signup');

  return (
    <ErrorBoundary>
      <CustomCursor />
      <SmoothScroll />
      <ProgressBar />
      <ScrollToTop />
      <Toaster position="top-center" richColors closeButton />
      <HotToaster position="top-center" toastOptions={{ duration: 4000 }} />
      {(!isLoginRoute && !isSignupRoute && !chatOpen) && <Header />}
      <AnimatePresence mode="sync">
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/ai-tool" element={<LoginGate><PageTransition><AiToolPage /></PageTransition></LoginGate>} />
            <Route path="/blog/:id" element={<LoginGate><PageTransition><BlogDetailsPage /></PageTransition></LoginGate>} />
            <Route path="/allPlans" element={<LoginGate><PageTransition><AllPlansPage /></PageTransition></LoginGate>} />
            <Route path="/checkout/plan/:planId" element={<LoginGate><PageTransition><PlanCheckoutPage /></PageTransition></LoginGate>} />
            <Route path="/checkout/formation/:formationId" element={<LoginGate><PageTransition><FormationCheckoutPage /></PageTransition></LoginGate>} />
            <Route path="/checkout/course-subscription" element={<LoginGate><PageTransition><CourseSubscriptionCheckout /></PageTransition></LoginGate>} />
            <Route path="/checkout/ai-tool" element={<LoginGate><PageTransition><AiToolCheckout /></PageTransition></LoginGate>} />

            <Route path="/client" element={<ProtectedRoute roles={['client']}><ClientLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<ClientDashboardHome />} />
              <Route path="my-plans" element={<ClientPlans />} />
              <Route path="my-requests" element={<ClientRequests />} />
            </Route>

            <Route path="/dieteticien" element={<ProtectedRoute roles={['dieteticien', 'admin']}><Layout /></ProtectedRoute>}>
              <Route path="create-blog" element={<CreateBlog />} />
              <Route path="create-plan" element={<CreatePlan />} />
              <Route path="MyPlans" element={<MyPlans />} />
              <Route path="MyBlogs" element={<MyBlog />} />
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
              <Route index element={<Navigate to="my-courses" replace />} />
              <Route path="dashboard" element={<Navigate to="../my-courses" replace />} />
              <Route path="my-courses" element={<MyCoursesPage />} />
              <Route path="my-formations" element={<MyFormationsPage />} />
              <Route path="my-requests" element={<StudentRequests />} />
            </Route>

            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
              <Route path="add-admin-nutritionist" element={<AddAdminNutritionist />} />
              <Route path="all-users" element={<AllUsers />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="manage-dieteticiens" element={<ManageDieteticiens />} />
              <Route path="create-course" element={<CreateCourse />} />
              <Route path="all-courses" element={<AllCourses />} />
              <Route path="course-subscriptions" element={<ManageCourseSubscriptions />} />
              <Route path="ai-tool-subscriptions" element={<ManageAiToolSubscriptions />} />
              <Route path="platform-payment-settings" element={<PlatformPaymentSettings />} />
              <Route path="my-Profile" element={<EditUserProfile />} />
            </Route>

            <Route path="*" element={
              <PageTransition>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                  <h1 className="text-6xl font-bold text-gray-300">404</h1>
                  <p className="text-gray-500 text-lg">Page not found</p>
                  <a href="/" className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                    Go Home
                  </a>
                </div>
              </PageTransition>
            } />
          </Routes>
        </Suspense>
      </AnimatePresence>
      <ChatBubble />
    </ErrorBoundary>
  )
}

export default App