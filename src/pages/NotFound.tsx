import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound: React.FC = () => (
  <div className="page-content center" style={{ minHeight: '100vh' }}>
    <motion.div
      className="not-found"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="not-found-icon" aria-hidden="true">
        <MapPin size={48} strokeWidth={1.5} />
      </div>
      <h1 className="not-found-code">404</h1>
      <h2 className="not-found-title">Place Not Found</h2>
      <p className="not-found-text">
        Looks like this location is off the map. The page you're looking for doesn't exist.
      </p>
      <Link to="/">
        <Button icon={<Home size={16} />}>Back to Home</Button>
      </Link>
    </motion.div>
  </div>
);

export default NotFound;
