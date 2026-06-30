import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Type, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Input, Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import ImageUpload from '../components/ui/ImageUpload';

const NewPlace: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    else if (title.trim().length < 2) e.title = 'Title must be at least 2 characters';
    if (!description.trim()) e.description = 'Description is required';
    else if (description.trim().length < 5) e.description = 'Description must be at least 5 characters';
    if (!imageFile) e.image = 'An image is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    if (!user) {
      toast.error('You must be signed in');
      return;
    }

    setLoading(true);
    try {
      // Upload image
      const ext = imageFile!.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('place-images')
        .upload(fileName, imageFile!, { upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('place-images').getPublicUrl(fileName);

      // Insert place
      const { error: insertError } = await supabase.from('places').insert({
        title: title.trim(),
        description: description.trim(),
        image_url: publicUrl,
        lat: 20.2961,
        lng: 85.8245,
        creator_id: user.id,
      });
      if (insertError) throw insertError;

      toast.success('Place added successfully!');
      navigate(`/${user.id}/places`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add place';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '640px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            className="back-link"
            onClick={() => navigate(-1)}
            style={{ marginBottom: '2rem' }}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="form-card">
            <div className="form-card-header">
              <div className="form-card-icon" aria-hidden="true">
                <MapPin size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="form-card-title">Add a Place</h1>
                <p className="form-card-subtitle">Share a place you love with the community</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-stack">
                <ImageUpload
                  onFileSelect={setImageFile}
                  label="Place Photo"
                  error={errors.image}
                />
                <Input
                  label="Title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  error={errors.title}
                  icon={<Type size={16} />}
                  placeholder="e.g. Sunset Point, Marina Beach…"
                  maxLength={80}
                />
                <Textarea
                  label="Description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  error={errors.description}
                  placeholder="Tell people what makes this place special…"
                  rows={4}
                />
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  icon={<MapPin size={16} />}
                >
                  Add Place
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NewPlace;
