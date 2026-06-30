import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Plus, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Discover', icon: <Users size={16} />, exact: true },
    ...(user ? [
      { to: `/${user.id}/places`, label: 'My Places', icon: <MapPin size={16} /> },
      { to: '/places/new', label: 'Add Place', icon: <Plus size={16} /> },
    ] : [
      { to: '/auth', label: 'Sign In', icon: <User size={16} /> },
    ]),
  ];

  return (
    <>
      <motion.header
        className={`nav ${scrolled ? 'nav-scrolled' : ''}`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="nav-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo" aria-label="Find Your Place — home">
            <span className="nav-logo-icon" aria-hidden="true">
              <MapPin size={22} strokeWidth={2.5} />
            </span>
            <span className="nav-logo-text">FindYourPlace</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="nav-desktop" aria-label="Main navigation">
            <ul className="nav-links-list">
              {navLinks.map(link => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.exact}
                    className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Right */}
          <div className="nav-right">
            {user && (
              <div className="nav-user">
                {profile?.image_url ? (
                  <img src={profile.image_url} alt={profile.name} className="nav-avatar" />
                ) : (
                  <div className="nav-avatar nav-avatar-placeholder">
                    <User size={16} />
                  </div>
                )}
                <span className="nav-user-name">{profile?.name}</span>
                <button
                  className="nav-logout-btn"
                  onClick={signOut}
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="nav-hamburger"
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? 'x' : 'menu'}
                  initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                  transition={{ duration: 0.18 }}
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.nav
              id="mobile-nav"
              className="nav-mobile-drawer"
              aria-label="Mobile navigation"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="mobile-nav-logo">
                <MapPin size={20} strokeWidth={2.5} />
                <span>FindYourPlace</span>
              </div>

              {user && profile && (
                <div className="mobile-nav-user">
                  {profile.image_url ? (
                    <img src={profile.image_url} alt={profile.name} className="mobile-nav-avatar" />
                  ) : (
                    <div className="mobile-nav-avatar mobile-nav-avatar-placeholder">
                      <User size={20} />
                    </div>
                  )}
                  <div>
                    <p className="mobile-nav-user-name">{profile.name}</p>
                    <p className="mobile-nav-user-email">{profile.email}</p>
                  </div>
                </div>
              )}

              <ul className="mobile-nav-links">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.to}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.05 }}
                  >
                    <NavLink
                      to={link.to}
                      end={link.exact}
                      className={({ isActive }) => `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </NavLink>
                  </motion.li>
                ))}
              </ul>

              {user && (
                <div className="mobile-nav-footer">
                  <button className="mobile-nav-logout" onClick={signOut}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
