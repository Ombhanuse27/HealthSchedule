import { useState, useEffect } from 'react';
import Logo from '../../images/logo1.png';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Stethoscope } from 'lucide-react';

function NavbarLink() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) setUserRole('doctor');
    else if (token) setUserRole('admin');
    else setUserRole(null);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUserRole(null);
    setIsOpen(false);
    navigate('/login');
  };

  const close = () => setIsOpen(false);

  const linkCls = "flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-150";

  const renderRoleLinks = () => {
    if (userRole === 'admin') return (
      <>
        <Link to="/hospitalsidebar" onClick={close} className={linkCls}>
          <LayoutDashboard size={15} /> Admin Dashboard
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all">
          <LogOut size={15} /> Logout
        </button>
      </>
    );
    if (userRole === 'doctor') return (
      <>
        <Link to="/doctorsidebar" onClick={close} className={linkCls}>
          <Stethoscope size={15} /> Doctor Dashboard
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all">
          <LogOut size={15} /> Logout
        </button>
      </>
    );
    return (
      <Link
        to="/login"
        onClick={close}
        className="px-5 py-2 text-sm font-bold text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
        style={{ background: "linear-gradient(135deg,#6366F1,#0EA5E9)" }}
      >
        Login / Register
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-[72px]">

          {/* Logo */}
          <Link to="/" onClick={close} className="flex items-center hover:opacity-80 transition-opacity shrink-0">
            <img src={Logo} alt="Health-schedule" className="h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link to="/" className={linkCls}>Home</Link>
            <Link to="/hospital" className={linkCls}>Hospitals List</Link>
            <Link to="/opdForm" className={linkCls}>Book Appointment</Link>
            <div className="w-px h-5 bg-slate-200 mx-2" />
            {renderRoleLinks()}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown — purely conditional render, no Bootstrap */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white shadow-lg px-4 py-3 flex flex-col gap-1">
          <Link to="/" onClick={close} className={linkCls}>Home</Link>
          <Link to="/hospital" onClick={close} className={linkCls}>Hospitals List</Link>
          <Link to="/opdForm" onClick={close} className={linkCls}>Book Appointment</Link>
          <div className="w-full h-px bg-slate-100 my-1" />
          {renderRoleLinks()}
        </div>
      )}
    </nav>
  );
}

export default NavbarLink;