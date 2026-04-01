import React from 'react'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import AboutUsPage from './pages/AboutUsPage.jsx' 
import ServicesPage from './pages/ServicesPage.jsx' 
import BlogsPage from './pages/BlogsPage.jsx'
import Header from './components/Header.jsx' 
import Footer from './components/Footer.jsx' 
import ScrollToTop from './utils/ScrollToTop.jsx'
import { Routes, Route, useLocation } from 'react-router-dom' 
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition.jsx'
import ProgressBar from './components/ProgressBar.jsx'
import SmoothScroll from './components/SmoothScroll.jsx'
import CreateBlog from './pages/nutritionistDashboard/CreateBlog.jsx'
import Layout from './pages/nutritionistDashboard/Layout.jsx'
import './App.css'

function App() {
  const location = useLocation();
 const isLoginRoute = location.pathname.startsWith('/login');
 const isSignupRoute = location.pathname.startsWith('/signup');
  return (
    <>
      <SmoothScroll />
      <ProgressBar />
      <ScrollToTop />
      <Toaster />
      {(!isLoginRoute && !isSignupRoute) && <Header />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route index element={<PageTransition><HomePage /></PageTransition>} />
          <Route path='/contact' element={<PageTransition><ContactPage /></PageTransition>} />
          <Route path='/login' element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path='/signup' element={<PageTransition><SignUpPage /></PageTransition>} />
          <Route path='/about' element={<PageTransition><AboutUsPage /></PageTransition>} /> 
          <Route path='/services' element={<PageTransition><ServicesPage /></PageTransition>} /> 
          <Route path='/blogs' element={<PageTransition><BlogsPage /></PageTransition>} /> 

          <Route path="/nutritionist" element={<Layout />}>
              <Route path="/nutritionist/create-blog" element={<CreateBlog />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>

  )
}


export default App
