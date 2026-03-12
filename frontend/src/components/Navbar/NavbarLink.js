import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import './NavbarLink.css'; 
import Logo from '../../images/logo1.png';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useNavigate } from 'react-router-dom';

function NavbarLink() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
      setUserRole('doctor');
    } else if (token) {
      setUserRole('admin');
    } else {
      setUserRole(null);
    }
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUserRole(null);
    setIsOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setIsOpen(false);

  const navLinkClass = "nav-link text-base font-semibold text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50/50 transition-all duration-200";
  const buttonClass = "px-6 py-2.5 text-base text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-semibold whitespace-nowrap";
  const logoutClass = "text-base text-red-500 hover:text-red-700 hover:bg-red-50 font-semibold px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap";
  
  const renderNavLinks = () => {
    if (userRole === 'admin') {
      return (
        <>
          <Link to="/hospitalsidebar" className={navLinkClass} onClick={closeMenu}>Admin Dashboard</Link>
          <button onClick={handleLogout} className={logoutClass}>Logout</button>
        </>
      );
    } else if (userRole === 'doctor') {
      return (
        <>
          <Link to="/doctorsidebar" className={navLinkClass} onClick={closeMenu}>Doctor Dashboard</Link>
          <button onClick={handleLogout} className={logoutClass}>Logout</button>
        </>
      );
    } else {
      return (
        <Link to="/login" className={buttonClass} onClick={closeMenu}>Login / Register</Link>
      );
    }
  };

  return (
    <Navbar 
      expand="lg" 
      className='fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 py-3 transition-all duration-300 shadow-sm'
    >
      {/* Replaced max-w-7xl with w-full and increased horizontal padding to push items to the edges */}
      <Container fluid className='w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between'>
        
        {/* Left Side: Logo */}
        <Navbar.Brand className='mr-0 flex items-center p-0'>
          <Link to="/" className='flex items-center transition-opacity hover:opacity-80'>
            <img id="logo-img" src={Logo} alt="Health-schedule" className='h-12 w-auto object-contain' />
          </Link>
        </Navbar.Brand>

        {/* Mobile Menu Button */}
        <div className='lg:hidden'>
          <button 
            onClick={toggleMenu} 
            className='p-2 text-gray-500 hover:text-blue-600 focus:outline-none bg-gray-50 rounded-lg transition-colors'
            aria-label="Toggle navigation"
          >
            <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className='text-xl' />
          </button>
        </div>
        
        {/* Right Side: Links */}
        <Navbar.Collapse 
          id="basic-navbar-nav" 
          className={`lg:flex lg:items-center ${isOpen ? 'block' : 'hidden'} w-full lg:w-auto absolute lg:relative top-full left-0 bg-white lg:bg-transparent shadow-lg lg:shadow-none p-4 lg:p-0 border-b lg:border-none border-gray-100`}
        >
          {/* Added ml-auto to push everything to the right */}
          <Nav className='flex flex-col lg:flex-row items-center gap-2 lg:gap-6 w-full lg:w-auto ml-auto justify-end'>
            <Link to="/" className={navLinkClass} onClick={closeMenu}>Home</Link>
            <Link to="/hospital" className={navLinkClass} onClick={closeMenu}>Hospitals List</Link>
            <Link to="/opdForm" className={navLinkClass} onClick={closeMenu}>Book Appointment</Link>
            
            <div className="w-full h-px bg-gray-100 my-2 lg:hidden"></div>
            
            {renderNavLinks()}
          </Nav>
        </Navbar.Collapse>

      </Container>
    </Navbar>
  );
}

export default NavbarLink;