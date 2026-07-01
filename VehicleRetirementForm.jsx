import React, { useState, useCallback } from 'react';
import './VehicleRetirementForm.css';

const MANAGERS = [
  { name: 'Josh Emerson', office: 'Baltimore, MD' },
  { name: 'Jay Brooks', office: 'Bowie, MD' },
  { name: 'Sloane Strus', office: 'Salisbury, MD' },
  { name: 'Mike Battle', office: 'White Plains, MD' },
  { name: 'Charles Runyon', office: 'Williamsport, MD' },
  { name: 'Derrick Boodhoo', office: 'Manassas, VA' },
  { name: 'Roger Runyon', office: 'Richmond, VA' },
  { name: 'Eddie Thomas', office: 'Dover, DE' },
  { name: 'John Barnett', office: 'Brentwood, TN' },
  { name: 'Justin Nichols', office: 'Orem, UT' },
];

const CONDITION_OPTIONS = [
  'Good Running',
  'Needs Repair Running',
  'Needs to be Towed Away',
];

export default function VehicleRetirementForm() {
  const [formData, setFormData] = useState({
    manager: '',
    office: '',
    vin: '',
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    mileage: '',
    gpsRemoved: false,
    equipmentRemoved: false,
    tagsValid: '', // 'valid' or 'expired'
    condition: '',
    notes: '',
    photos: [],
  });

  const [errors, setErrors] = useState({});
  const [vinLookupLoading, setVinLookupLoading] = useState(false);
  const [vinLookupError, setVinLookupError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleManagerChange = (e) => {
    const selectedName = e.target.value;
    const selectedManager = MANAGERS.find(m => m.name === selectedName);
    setFormData(prev => ({
      ...prev,
      manager: selectedName,
      office: selectedManager?.office || '',
    }));
  };

  const handleVinBlur = async () => {
    if (!formData.vin.trim()) return;

    setVinLookupLoading(true);
    setVinLookupError('');

    try {
      // Call backend to query FL Trucks Enterprise board
      const response = await fetch('/api/vehicle/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin: formData.vin.toUpperCase() }),
      });

      if (!response.ok) {
        throw new Error('VIN not found in system');
      }

      const vehicleData = await response.json();
      setFormData(prev => ({
        ...prev,
        make: vehicleData.make || '',
        model: vehicleData.model || '',
        year: vehicleData.year || '',
        licensePlate: vehicleData.licensePlate || '',
      }));
      setVinLookupError('');
    } catch (error) {
      setVinLookupError(error.message || 'Unable to look up VIN. Please verify and try again.');
      setFormData(prev => ({
        ...prev,
        make: '',
        model: '',
        year: '',
        licensePlate: '',
      }));
    } finally {
      setVinLookupLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);

    if (formData.photos.length + files.length > 6) {
      setErrors(prev => ({
        ...prev,
        photos: 'Maximum 6 photos allowed',
      }));
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          photos: 'File size must be less than 5MB',
        }));
        return false;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          photos: 'Only JPG and PNG files allowed',
        }));
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...validFiles],
    }));
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.manager) newErrors.manager = 'Manager is required';
    if (!formData.vin) newErrors.vin = 'VIN is required';
    if (formData.vin && formData.vin.length !== 17) newErrors.vin = 'VIN must be 17 characters';
    if (!formData.mileage) newErrors.mileage = 'Current mileage is required';
    if (isNaN(formData.mileage)) newErrors.mileage = 'Mileage must be a number';
    if (!formData.gpsRemoved) newErrors.gpsRemoved = 'Must confirm GPS removal';
    if (!formData.equipmentRemoved) newErrors.equipmentRemoved = 'Must confirm equipment removal';
    if (!formData.tagsValid) newErrors.tagsValid = 'Must select tags status';
    if (!formData.condition) newErrors.condition = 'Vehicle condition is required';
    if (formData.photos.length !== 6) newErrors.photos = `Exactly 6 photos required (${formData.photos.length} uploaded)`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('manager', formData.manager);
      formDataToSend.append('office', formData.office);
      formDataToSend.append('vin', formData.vin);
      formDataToSend.append('make', formData.make);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('year', formData.year);
      formDataToSend.append('licensePlate', formData.licensePlate);
      formDataToSend.append('mileage', formData.mileage);
      formDataToSend.append('gpsRemoved', formData.gpsRemoved);
      formDataToSend.append('equipmentRemoved', formData.equipmentRemoved);
      formDataToSend.append('tagsValid', formData.tagsValid);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('notes', formData.notes);

      formData.photos.forEach((photo, index) => {
        formDataToSend.append(`photo_${index}`, photo);
      });

      const response = await fetch('/api/vehicle/retire', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to submit retirement request');
      }

      setSubmitSuccess(true);
      setFormData({
        manager: '',
        office: '',
        vin: '',
        make: '',
        model: '',
        year: '',
        licensePlate: '',
        mileage: '',
        gpsRemoved: false,
        equipmentRemoved: false,
        tagsValid: '',
        condition: '',
        notes: '',
        photos: [],
      });

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'An error occurred during submission',
      }));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="vrp-container">
      <header className="vrp-header">
        <div className="vrp-header-content">
          <h1>Vehicle Retirement Portal</h1>
          <p>Submit vehicles for retirement and disposal</p>
        </div>
      </header>

      <main className="vrp-main">
        {submitSuccess && (
          <div className="vrp-success-banner">
            ✓ Vehicle retirement request submitted successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="vrp-form">
          {/* Section 1: Manager & Location */}
          <section className="vrp-section">
            <h2 className="vrp-section-title">Manager Information</h2>

            <div className="vrp-form-group">
              <label htmlFor="manager">Manager Name *</label>
              <select
                id="manager"
                value={formData.manager}
                onChange={handleManagerChange}
                className={`vrp-input ${errors.manager ? 'vrp-input-error' : ''}`}
              >
                <option value="">Select your name</option>
                {MANAGERS.map(m => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
              {errors.manager && <span className="vrp-error">{errors.manager}</span>}
            </div>

            <div className="vrp-form-group">
              <label htmlFor="office">Office Location</label>
              <input
                id="office"
                type="text"
                value={formData.office}
                readOnly
                className="vrp-input vrp-input-readonly"
              />
            </div>
          </section>

          {/* Section 2: Vehicle Information */}
          <section className="vrp-section">
            <h2 className="vrp-section-title">Vehicle Information</h2>

            <div className="vrp-form-group">
              <label htmlFor="vin">Vehicle VIN *</label>
              <input
                id="vin"
                type="text"
                value={formData.vin}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, vin: e.target.value.toUpperCase() }));
                  setVinLookupError('');
                }}
                onBlur={handleVinBlur}
                placeholder="Enter 17-character VIN"
                maxLength="17"
                className={`vrp-input ${errors.vin ? 'vrp-input-error' : ''}`}
              />
              {vinLookupLoading && <span className="vrp-loading">Looking up vehicle...</span>}
              {vinLookupError && <span className="vrp-error">{vinLookupError}</span>}
              {errors.vin && <span className="vrp-error">{errors.vin}</span>}
            </div>

            <div className="vrp-grid-2">
              <div className="vrp-form-group">
                <label htmlFor="make">Make</label>
                <input
                  id="make"
                  type="text"
                  value={formData.make}
                  readOnly
                  className="vrp-input vrp-input-readonly"
                />
              </div>
              <div className="vrp-form-group">
                <label htmlFor="model">Model</label>
                <input
                  id="model"
                  type="text"
                  value={formData.model}
                  readOnly
                  className="vrp-input vrp-input-readonly"
                />
              </div>
            </div>

            <div className="vrp-grid-2">
              <div className="vrp-form-group">
                <label htmlFor="year">Year</label>
                <input
                  id="year"
                  type="text"
                  value={formData.year}
                  readOnly
                  className="vrp-input vrp-input-readonly"
                />
              </div>
              <div className="vrp-form-group">
                <label htmlFor="licensePlate">License Plate</label>
                <input
                  id="licensePlate"
                  type="text"
                  value={formData.licensePlate}
                  readOnly
                  className="vrp-input vrp-input-readonly"
                />
              </div>
            </div>

            <div className="vrp-form-group">
              <label htmlFor="mileage">Current Mileage (Odometer) *</label>
              <input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                placeholder="Enter current mileage"
                className={`vrp-input ${errors.mileage ? 'vrp-input-error' : ''}`}
              />
              {errors.mileage && <span className="vrp-error">{errors.mileage}</span>}
            </div>
          </section>

          {/* Section 3: Pre-Retirement Checklist */}
          <section className="vrp-section">
            <h2 className="vrp-section-title">Pre-Retirement Checklist</h2>

            <div className="vrp-checkbox-group">
              <label className="vrp-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.gpsRemoved}
                  onChange={(e) => setFormData(prev => ({ ...prev, gpsRemoved: e.target.checked }))}
                />
                <span>GPS has been removed from the vehicle *</span>
              </label>
              {errors.gpsRemoved && <span className="vrp-error">{errors.gpsRemoved}</span>}
            </div>

            <div className="vrp-checkbox-group">
              <label className="vrp-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.equipmentRemoved}
                  onChange={(e) => setFormData(prev => ({ ...prev, equipmentRemoved: e.target.checked }))}
                />
                <span>All Frontline equipment has been removed *</span>
              </label>
              {errors.equipmentRemoved && <span className="vrp-error">{errors.equipmentRemoved}</span>}
            </div>

            <div className="vrp-checkbox-group">
              <label className="vrp-question">Tags Status *</label>
              <div className="vrp-radio-group">
                <label className="vrp-radio-label">
                  <input
                    type="radio"
                    name="tagsStatus"
                    value="valid"
                    checked={formData.tagsValid === 'valid'}
                    onChange={(e) => setFormData(prev => ({ ...prev, tagsValid: 'valid' }))}
                  />
                  <span>Tags are valid (not expired)</span>
                </label>
                <label className="vrp-radio-label">
                  <input
                    type="radio"
                    name="tagsStatus"
                    value="expired"
                    checked={formData.tagsValid === 'expired'}
                    onChange={(e) => setFormData(prev => ({ ...prev, tagsValid: 'expired' }))}
                  />
                  <span>Tags are expired</span>
                </label>
              </div>
              {errors.tagsValid && <span className="vrp-error">{errors.tagsValid}</span>}
            </div>
          </section>

          {/* Section 4: Vehicle Condition */}
          <section className="vrp-section">
            <h2 className="vrp-section-title">Vehicle Condition</h2>

            <div className="vrp-form-group">
              <label htmlFor="condition">Current Vehicle Condition *</label>
              <select
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                className={`vrp-input ${errors.condition ? 'vrp-input-error' : ''}`}
              >
                <option value="">Select condition</option>
                {CONDITION_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.condition && <span className="vrp-error">{errors.condition}</span>}
            </div>
          </section>

          {/* Section 5: Inspection Photos */}
          <section className="vrp-section">
            <h2 className="vrp-section-title">Inspection Photos</h2>
            <p className="vrp-section-hint">
              Required: All 4 sides of vehicle, driver compartment, and chemical storage compartment (6 photos total)
            </p>

            <div className="vrp-photo-upload">
              <label htmlFor="photos" className="vrp-upload-label">
                <span className="vrp-upload-icon">📸</span>
                <span>Click to upload or drag files here</span>
                <span className="vrp-upload-hint">{formData.photos.length}/6 photos</span>
              </label>
              <input
                id="photos"
                type="file"
                multiple
                accept="image/jpeg,image/png"
                onChange={handlePhotoUpload}
                className="vrp-upload-input"
              />
            </div>

            {formData.photos.length > 0 && (
              <div className="vrp-photo-preview">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="vrp-photo-item">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Preview ${index + 1}`}
                      className="vrp-photo-thumbnail"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="vrp-photo-remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.photos && <span className="vrp-error">{errors.photos}</span>}
          </section>

          {/* Section 6: Additional Notes */}
          <section className="vrp-section">
            <h2 className="vrp-section-title">Additional Notes</h2>

            <div className="vrp-form-group">
              <label htmlFor="notes">Any additional comments or context</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional: Add any additional information about this retirement"
                rows="4"
                className="vrp-textarea"
              />
            </div>
          </section>

          {/* Submit */}
          {errors.submit && <div className="vrp-error-banner">{errors.submit}</div>}

          <div className="vrp-form-actions">
            <button
              type="submit"
              disabled={submitLoading}
              className="vrp-button vrp-button-primary"
            >
              {submitLoading ? 'Submitting...' : 'Submit Vehicle for Retirement'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
