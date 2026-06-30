import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, User, Users as UsersIcon } from 'lucide-react';
import { supabase, Profile } from '../lib/supabase';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

interface ProfileWithCount extends Profile {
  place_count: number;
}

const UserCard: React.FC<{ user: ProfileWithCount; index: number }> = ({ user, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.07, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
  >
    <Link to={`/${user.id}/places`} className="user-card" aria-label={`${user.name}, ${user.place_count} places`}>
      <div className="user-card-avatar-wrap">
        {user.image_url ? (
          <img src={user.image_url} alt={user.name} className="user-card-avatar" loading="lazy" />
        ) : (
          <div className="user-card-avatar user-card-avatar-fallback">
            <User size={32} />
          </div>
        )}
      </div>
      <div className="user-card-info">
        <h3 className="user-card-name">{user.name}</h3>
        <div className="user-card-meta">
          <MapPin size={14} aria-hidden="true" />
          <span>{user.place_count} {user.place_count === 1 ? 'place' : 'places'}</span>
        </div>
      </div>
      <div className="user-card-arrow" aria-hidden="true">→</div>
    </Link>
  </motion.div>
);

const UserCardSkeleton: React.FC = () => (
  <div className="user-card user-card-skeleton">
    <div className="user-card-avatar-wrap">
      <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
    </div>
    <div className="user-card-info">
      <div className="skeleton" style={{ height: '1rem', width: '60%', marginBottom: '0.5rem' }} />
      <div className="skeleton" style={{ height: '0.875rem', width: '40%' }} />
    </div>
  </div>
);

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [profiles, setProfiles] = useState<ProfileWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        const { data: placesData } = await supabase
          .from('places')
          .select('creator_id');

        const countMap: Record<string, number> = {};
        (placesData || []).forEach(p => {
          countMap[p.creator_id] = (countMap[p.creator_id] || 0) + 1;
        });

        const enriched: ProfileWithCount[] = (profilesData || []).map(p => ({
          ...p,
          place_count: countMap[p.id] || 0,
        }));

        setProfiles(enriched);
      } catch (err) {
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="page-content">
      <div className="container">
        {/* Hero */}
        <motion.div
          className="users-hero"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="users-hero-icon" aria-hidden="true">
            <MapPin size={28} strokeWidth={2.5} />
          </div>
          <h1 className="users-hero-title">Discover Explorers</h1>
          <p className="users-hero-subtitle">
            Browse the community and explore the places they've discovered
          </p>
          {!currentUser && (
            <Link to="/auth">
              <Button iconRight={<span>→</span>}>Join the Community</Button>
            </Link>
          )}
        </motion.div>

        {/* Content */}
        {loading && (
          <div className="users-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="empty-state">
            <p className="empty-state-text">{error}</p>
          </div>
        )}

        {!loading && !error && profiles.length === 0 && (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="empty-state-icon"><UsersIcon size={40} /></div>
            <h3 className="empty-state-title">No explorers yet</h3>
            <p className="empty-state-text">Be the first to join and share your favourite places.</p>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </motion.div>
        )}

        {!loading && profiles.length > 0 && (
          <>
            <div className="users-count-label">
              {profiles.length} {profiles.length === 1 ? 'Explorer' : 'Explorers'}
            </div>
            <div className="users-grid">
              {profiles.map((u, i) => (
                <UserCard key={u.id} user={u} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Users;
