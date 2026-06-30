import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase, Place } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Input, Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const UpdatePlace: React.FC = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!placeId) return;
    const load = async () => {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('id', placeId)
        .maybeSingle();

      if (error || !data) {
        toast.error('Place not found');
        navigate('/');
        return;
      }

      if (data.creator_id !== user?.id) {
        toast.error('You can only edit your own places');
        navigate('/');
        return;
      }

      setPlace(data);
      setTitle(data.title);
      setDescription(data.description);
      setLoading(false);
    };
    load();
  }, [placeId, user, navigate]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    else if (title.trim().length < 2) e.title = 'At least 2 characters';
    if (!description.trim()) e.description = 'Description is required';
    else if (description.trim().length < 5) e.description = 'At least 5 characters';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const { error } = await supabase
        .from('places')
        .update({ title: title.trim(), description: description.trim() })
        .eq('id', placeId)
        .eq('creator_id', user?.id);
      if (error) throw error;
      toast.success('Place updated!');
      navigate(`/${user?.id}/places`);
    } catch {
      toast.error('Failed to update place');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '640px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button className="back-link" onClick={() => navigate(-1)} style={{ marginBottom: '2rem' }}>
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="form-card">
            {place?.image_url && (
              <div className="form-card-place-image">
                <img src={place.image_url} alt={place.title} />
                <div className="form-card-place-image-overlay" aria-hidden="true" />
              </div>
            )}

            <div className="form-card-header" style={{ paddingTop: place?.image_url ? '1.5rem' : undefined }}>
              <div>
                <h1 className="form-card-title">Edit Place</h1>
                <p className="form-card-subtitle">Update the details for this place</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-stack">
                <Input
                  label="Title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  error={errors.title}
                  icon={<Type size={16} />}
                  maxLength={80}
                />
                <Textarea
                  label="Description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  error={errors.description}
                  rows={4}
                />
              </div>
              <div className="form-actions">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" loading={saving} icon={<Save size={16} />}>Save Changes</Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UpdatePlace;
