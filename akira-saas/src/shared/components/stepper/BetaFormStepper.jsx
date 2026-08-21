import React, { useState } from 'react';
import Stepper, { Step } from './Stepper';
import './Stepper.css';

export default function BetaFormStepper() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    size: '',
    painPoint: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFinalStepCompleted = async () => {
    setLoading(true);
    try {
      // Submit to Google Sheets via Forms API
      const response = await fetch('https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'entry.XXXXX': formData.name,
          'entry.YYYYY': formData.email,
          'entry.ZZZZZ': formData.company,
          'entry.AAAAA': formData.size,
          'entry.BBBBB': formData.painPoint,
        })
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>¡Gracias, {formData.name}!</h2>
          <p>We've added you to the AKIRA beta. Check your email for next steps.</p>
          <p className="email-confirm">Confirmation sent to <strong>{formData.email}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <Stepper
      onFinalStepCompleted={handleFinalStepCompleted}
      backButtonText="Atrás"
      nextButtonText="Siguiente"
    >
      {/* Step 1: Name */}
      <Step>
        <div className="form-step">
          <h3>¿Cuál es tu nombre?</h3>
          <p className="step-subtitle">We'll use this to personalize your experience</p>
          <input
            type="text"
            name="name"
            placeholder="Your full name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            autoFocus
          />
        </div>
      </Step>

      {/* Step 2: Email */}
      <Step>
        <div className="form-step">
          <h3>¿Tu email?</h3>
          <p className="step-subtitle">We'll send you access + beta updates</p>
          <input
            type="email"
            name="email"
            placeholder="your.email@agency.com"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            autoFocus
          />
        </div>
      </Step>

      {/* Step 3: Company */}
      <Step>
        <div className="form-step">
          <h3>¿Nombre de la agencia?</h3>
          <p className="step-subtitle">Help us know who we're working with</p>
          <input
            type="text"
            name="company"
            placeholder="Your agency name"
            value={formData.company}
            onChange={handleInputChange}
            className="form-input"
            autoFocus
          />
        </div>
      </Step>

      {/* Step 4: Company Size */}
      <Step>
        <div className="form-step">
          <h3>¿Cuántos somos?</h3>
          <p className="step-subtitle">Select your team size</p>
          <div className="radio-group">
            {['1-5 people', '5-10 people', '10-25 people', '25+ people'].map(option => (
              <label key={option} className="radio-label">
                <input
                  type="radio"
                  name="size"
                  value={option}
                  checked={formData.size === option}
                  onChange={handleInputChange}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      </Step>

      {/* Step 5: Pain Point */}
      <Step>
        <div className="form-step">
          <h3>¿Tu mayor desafío?</h3>
          <p className="step-subtitle">What's your biggest pain managing clients/projects/invoices?</p>
          <textarea
            name="painPoint"
            placeholder="Tell us what's hard about your workflow..."
            value={formData.painPoint}
            onChange={handleInputChange}
            className="form-input form-textarea"
            rows={4}
            autoFocus
          />
        </div>
      </Step>
    </Stepper>
  );
}
