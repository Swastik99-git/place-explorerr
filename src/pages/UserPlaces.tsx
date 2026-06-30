import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, Edit3, User, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase, Place, Profile } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Map from '../components/ui/Map';

const PlaceCardSkeleton: React.FC = () => (
  <div className="place-card place-card-skeleton">
    <div className="skeleton" style={{ height: '13rem', width: '100%' }} />
    <div className="place-card-body">
      <div className="skeleton" style={{ height: '1.25rem', width: '65%', marginBottom: '0.5rem' }} />
      <div className="skeleton" style={{ height: '0.875rem', width: '90%', marginBottom: '0.25rem' }} />
      <div className="skeleton" style={{ height: '0.875rem', width: '70%', marginBottom: '1.25rem' }} />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div className="skeleton" style={{ height: '2.25rem', flex: 1 }} />
        <div className="skeleton" style={{ height: '2.25rem', width: '2.25rem' }} />
      </div>
    </div>
  </div>
);

interface PlaceCardProps {
  place: Place;
  isOwner: boolean;
  onDelete: (id: string) => void;
  index: number;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, isOwner, onDelete, index }) => {
  const [showMap, setShowMap] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Delete image from storage
      const pathFromUrl = place.image_url.split('/place-images/')[1];
      if (pathFromUrl) {
        await supabase.storage.from('place-images').remove([pathFromUrl]);
      }
      const { error } = await supabase.from('places').delete().eq('id', place.id);
      if (error) throw error;
      toast.success('Place deleted');
      setShowDeleteConfirm(false);
      onDelete(place.id);
    } catch {
      toast.error('Failed to delete place');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        className="place-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        whileHover={{ y: -4 }}
      >
        <div className="place-card-image-wrap">
          <img
            src={place.image_url}
            alt={place.title}
            className="place-card-image"
            loading="lazy"
          />
          <div className="place-card-image-overlay" aria-hidden="true" />
        </div>
        <div className="place-card-body">
          <h3 className="place-card-title">{place.title}</h3>
          <p className="place-card-description">{place.description}</p>
          <div className="place-card-actions">
            <Button
              variant="outline"
              size="sm"
              icon={<MapPin size={14} />}
              onClick={() => setShowMap(true)}
            >
              View Map
            </Button>
            {isOwner && (
              <div className="place-card-owner-actions">
                <Link to={`/places/${place.id}/edit`}>
                  <Button variant="secondary" size="sm" icon={<Edit3 size={14} />}>Edit</Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 size={14} />}
                  onClick={() => setShowDeleteConfirm(true)}
                  aria-label={`Delete ${place.title}`}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Map Modal */}
      <Modal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        title={place.title}
        size="lg"
      >
        <div style={{ height: '360px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <Map center={{ lat: place.lat, lng: place.lng }} zoom={14} />
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Place"
        size="sm"
        footer={
          <div className="modal-footer-actions">
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
          </div>
        }
      >
        <div className="delete-confirm-body">
          <div className="delete-confirm-icon" aria-hidden="true">
            <Trash2 size={28} />
          </div>
          <p className="delete-confirm-text">
            Are you sure you want to delete <strong>"{place.title}"</strong>? This action cannot be undone.
          </p>
        </div>
      </Modal>
    </>
  );
};

const UserPlaces: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwner = currentUser?.id === userId;

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      const [{ data: profileData }, { data: placesData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('places').select('*').eq('creator_id', userId).order('created_at', { ascending: false }),
      ]);
      setOwner(profileData);
      setPlaces(placesData || []);
      setLoading(false);
    };
    load();
  }, [userId]);

  const handleDelete = (id: string) => {
    setPlaces(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="page-content">
      <div className="container">
        <Link to="/" className="back-link">
          <ChevronLeft size={16} />
          All Explorers
        </Link>

        {loading ? (
          <>
            <div className="places-header-skeleton">
              <div className="skeleton" style={{ width: '4rem', height: '4rem', borderRadius: '50%' }} />
              <div>
                <div className="skeleton" style={{ height: '1.5rem', width: '10rem', marginBottom: '0.5rem' }} />
                <div className="skeleton" style={{ height: '1rem', width: '6rem' }} />
              </div>
            </div>
            <div className="places-grid">
              {Array.from({ length: 3 }).map((_, i) => <PlaceCardSkeleton key={i} />)}
            </div>
          </>
        ) : (
          <>
            {/* Profile header */}
            <motion.div
              className="places-profile-header"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="places-profile-avatar-wrap">
                {owner?.image_url ? (
                  <img src={owner.image_url} alt={owner.name} className="places-profile-avatar" />
                ) : (
                  <div className="places-profile-avatar places-profile-avatar-fallback">
                    <User size={28} />
                  </div>
                )}
              </div>
              <div>
                <h1 className="places-profile-name">{owner?.name || 'Explorer'}</h1>
                <p className="places-profile-count">
                  {places.length} {places.length === 1 ? 'place' : 'places'} shared
                </p>
              </div>
              {isOwner && (
                <Link to="/places/new" className="places-add-btn-link">
                  <Button icon={<Plus size={16} />}>Add Place</Button>
                </Link>
              )}
            </motion.div>

            {/* Places */}
            <AnimatePresence>
              {places.length === 0 ? (
                <motion.div
                  className="empty-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="empty-state-icon"><MapPin size={40} /></div>
                  <h3 className="empty-state-title">No places yet</h3>
                  <p className="empty-state-text">
                    {isOwner
                      ? 'Start sharing the places you love!'
                      : `${owner?.name || 'This explorer'} hasn't shared any places yet.`}
                  </p>
                  {isOwner && (
                    <Link to="/places/new">
                      <Button icon={<Plus size={16} />}>Add Your First Place</Button>
                    </Link>
                  )}
                </motion.div>
              ) : (
                <div className="places-grid">
                  {places.map((place, i) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      isOwner={isOwner}
                      onDelete={handleDelete}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

export default UserPlaces;
