import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import './CreateListing.css';

const API_URL = 'http://localhost:3000';

function CreateListing() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const CONDITION_OPTIONS = ['Brand new', 'Like new', 'Used - excellent', 'Used - good', 'Used - fair'];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    condition: '',
    price: '',
    images: [],
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [conditionOpen, setConditionOpen] = useState(false);
  const conditionRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (conditionRef.current && !conditionRef.current.contains(e.target)) {
        setConditionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 5));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5),
    }));
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!formData.condition) {
      setError('Please select a condition.');
      setIsSubmitting(false);
      return;
    }
    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      setError('Please enter a valid price.');
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('price', price);
      formData.images.forEach((file) => formDataToSend.append('images', file));

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/listings`, {
        method: 'POST',
        headers,
        body: formDataToSend,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to create listing');
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="create-listing-page">
        <div className="create-listing-container">
          <header className="create-listing-header">
            <h1 className="create-listing-title">Create a Listing</h1>
            <p className="create-listing-subtitle">List an item for sale in the Bruin Bazaar</p>
          </header>

          <form onSubmit={handleSubmit} className="create-listing-form">
            <div className="create-listing-form-inner">
              {/* Item Name */}
              <div className="form-group">
                <label htmlFor="title" className="form-label">Item Name</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              {/* Image Upload */}
              <div className="form-group image-upload-section">
                <label className="form-label">Images</label>
                <div className="image-previews">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="image-preview-item">
                      <img src={preview} alt={`Preview ${i + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="image-remove-btn"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < 5 && (
                    <label className="image-add-label">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <span>+</span>
                    </label>
                  )}
                </div>
                <p className="image-helper">Up to 5 images. Uploaded to cloud storage and shown on your listing.</p>
              </div>

              {/* Condition */}
              <div className="form-group form-group-select" ref={conditionRef}>
                <label htmlFor="condition" className="form-label">Condition</label>
                <input type="hidden" name="condition" value={formData.condition} />
                <div
                  className={`custom-select ${conditionOpen ? 'custom-select-open' : ''}`}
                  onClick={() => setConditionOpen(!conditionOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
                    if (e.key === 'Escape') setConditionOpen(false);
                  }}
                  role="combobox"
                  aria-expanded={conditionOpen}
                  aria-haspopup="listbox"
                  aria-label="Select condition"
                  tabIndex={0}
                >
                  <span className={`custom-select-value ${!formData.condition ? 'custom-select-placeholder' : ''}`}>
                    {formData.condition || 'Select condition'}
                  </span>
                  <span className="custom-select-arrow" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                {conditionOpen && (
                  <ul className="custom-select-options" role="listbox">
                    {CONDITION_OPTIONS.map((opt) => (
                      <li
                        key={opt}
                        role="option"
                        aria-selected={formData.condition === opt}
                        className={`custom-select-option ${formData.condition === opt ? 'custom-select-option-selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData((prev) => ({ ...prev, condition: opt }));
                          setConditionOpen(false);
                        }}
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="form-input form-textarea"
                />
              </div>

              {/* Price */}
              <div className="form-group">
                <label htmlFor="price" className="form-label">Price ($)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  className="form-input"
                />
              </div>

              {error && (
                <div className="form-error">{error}</div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-btn"
              >
                {isSubmitting ? 'Creating...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateListing;