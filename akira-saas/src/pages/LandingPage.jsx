import React, { useState } from 'react';
import { BetaFormStepper } from '@/shared/components/stepper';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [showForm, setShowForm] = useState(false);

  const features = [
    {
      icon: 'ðŸ‘¥',
      title: 'Know Your Clients',
      desc: 'Stop losing client context in email threads. Every client has one profile with contact info, communication history, all their projects, invoices, and payment status.'
    },
    {
      icon: 'ðŸ‘ï¸',
      title: 'See Your Work',
      desc: 'Track every project, every deadline, no status meetings needed. Drag tasks across columns. Your team knows what they\'re working on. Clients see progress via shared portal.'
    },
    {
      icon: 'ðŸ’°',
      title: 'Get Paid Faster',
      desc: 'Invoicing takes 60 seconds, not 30 minutes. Generate from project, send with one click, get notified when they open it, when they pay. Never lose money to forgotten invoices.'
    },
    {
      icon: 'ðŸ“Š',
      title: 'Know Your Margins',
      desc: 'See exactly how profitable every project is. Log hours per project, compare to estimate, identify low-margin clients. Make smarter pricing decisions.'
    }
  ];

  const pricingTiers = [
    {
      name: 'Starter',
      price: '–‚¬29',
      period: '/month',
      features: ['1 user account', 'Up to 5 clients', 'CRM + Projects + Invoicing', 'Client portal'],
      featured: false
    },
    {
      name: 'Professional',
      price: '–‚¬79',
      period: '/month',
      features: ['3 user accounts', 'Unlimited clients', 'Everything in Starter +', 'Time Tracking + APIs', 'Priority support'],
      featured: true
    },
    {
      name: 'Enterprise',
      price: '–‚¬199+',
      period: '/month',
      features: ['5+ user accounts', 'Unlimited everything', 'Advanced analytics', 'White-label', 'Dedicated support'],
      featured: false
    }
  ];

  if (showForm) {
    return (
      <div className="landing-wrapper">
        <BetaFormStepper />
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Background */}
      <div className="landing-background" />

      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="navbar-content">
          <div className="navbar-logo">AKIRA</div>
          <button
            className="navbar-cta"
            onClick={() => setShowForm(true)}
          >
            Join Beta
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-content"
        >
          <h1 className="hero-title">
            Stop using <span className="highlight">5 SaaS tools</span> to run your agency
          </h1>
          <p className="hero-subtitle">
            Manage clients, projects, and invoices in one place.
            <br />
            No more juggling HubSpot, FreshBooks, Monday.com, and Harvest.
          </p>
          <div className="hero-ctas">
            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              Join the Beta –” Free for 3 Months
            </button>
            <button className="btn-secondary">Watch Demo</button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section-title"
        >
          The all-in-one workspace
        </motion.h2>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="feature-card"
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section-title"
        >
          Simple Pricing, No Surprises
        </motion.h2>
        <div className="pricing-grid">
          {pricingTiers.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`pricing-card ${tier.featured ? 'featured' : ''}`}
            >
              <h3>{tier.name}</h3>
              <div className="price">
                {tier.price}
                <span className="period">{tier.period}</span>
              </div>
              <ul className="features-list">
                {tier.features.map((feat, i) => (
                  <li key={i}>
                    <span className="checkmark">–œ“</span> {feat}
                  </li>
                ))}
              </ul>
              <button
                className={tier.featured ? 'btn-primary' : 'btn-outline'}
                onClick={() => setShowForm(true)}
              >
                {tier.featured ? 'Start Free Trial' : 'Learn More'}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="cta-content"
        >
          <h2>Ready to simplify your workflow?</h2>
          <p>Join 5-10 marketing agencies in our private beta. Free for 3 months + direct support from Marc.</p>
          <button
            className="btn-primary btn-large"
            onClick={() => setShowForm(true)}
          >
            Join the Beta
          </button>
          <p className="cta-footnote">No credit card required. Cancel anytime.</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2026 AKIRA. Built for marketing agencies.</p>
      </footer>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #060608 0%, #0f0507 50%, #060608 100%);
          color: #ffffff;
          overflow: hidden;
          position: relative;
        }

        .landing-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background:
            radial-gradient(circle at 20% 50%, rgba(230, 57, 70, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(230, 57, 70, 0.05) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        .landing-navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(6, 6, 8, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(230, 57, 70, 0.1);
        }

        .navbar-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .navbar-logo {
          font-size: 1.5rem;
          font-weight: 800;
          color: #e63946;
        }

        .navbar-cta {
          background: #e63946;
          color: white;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 9999px;
          cursor: pointer;
          font-weight: 600;
          transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .navbar-cta:hover {
          background: #cc2936;
          transform: scale(1.05);
        }

        .hero-section {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }

        .hero-content {
          max-width: 800px;
        }

        .hero-title {
          font-size: clamp(2.5rem, 8vw, 4.5rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .highlight {
          color: #e63946;
        }

        .hero-subtitle {
          font-size: 1.125rem;
          color: #a3a3a3;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .hero-ctas {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: #e63946;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
          font-size: 1rem;
        }

        .btn-primary:hover {
          background: #cc2936;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(230, 57, 70, 0.3);
        }

        .btn-secondary {
          background: transparent;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
          font-size: 1rem;
        }

        .btn-secondary:hover {
          border-color: #e63946;
          color: #e63946;
        }

        .btn-outline {
          background: transparent;
          color: #e63946;
          border: 1px solid #e63946;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-outline:hover {
          background: rgba(230, 57, 70, 0.1);
        }

        .btn-large {
          padding: 1.25rem 3rem;
          font-size: 1.125rem;
        }

        .features-section {
          position: relative;
          z-index: 1;
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 3rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          padding: 2rem;
          border: 1px solid rgba(230, 57, 70, 0.2);
          border-radius: 1rem;
          background: rgba(32, 32, 40, 0.4);
          backdrop-filter: blur(10px);
          transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .feature-card:hover {
          border-color: #e63946;
          transform: translateY(-5px);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .feature-card p {
          color: #a3a3a3;
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .pricing-section {
          position: relative;
          z-index: 1;
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .pricing-card {
          padding: 2rem;
          border: 1px solid rgba(230, 57, 70, 0.2);
          border-radius: 1rem;
          background: rgba(32, 32, 40, 0.4);
          backdrop-filter: blur(10px);
          transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pricing-card.featured {
          border-color: #e63946;
          background: rgba(230, 57, 70, 0.1);
          transform: scale(1.05);
        }

        .pricing-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .price {
          font-size: 2.5rem;
          font-weight: 800;
          color: #e63946;
          margin-bottom: 1.5rem;
        }

        .period {
          font-size: 0.875rem;
          color: #a3a3a3;
        }

        .features-list {
          list-style: none;
          margin-bottom: 1.5rem;
          min-height: 150px;
        }

        .features-list li {
          margin-bottom: 0.75rem;
          color: #a3a3a3;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
        }

        .checkmark {
          color: #e63946;
          font-weight: bold;
          margin-right: 0.5rem;
        }

        .cta-section {
          position: relative;
          z-index: 1;
          padding: 4rem 2rem;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-content h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .cta-content p {
          color: #a3a3a3;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .cta-footnote {
          font-size: 0.75rem;
          margin-top: 1.5rem;
        }

        .landing-footer {
          position: relative;
          z-index: 1;
          padding: 2rem;
          text-align: center;
          color: #666666;
          font-size: 0.875rem;
          border-top: 1px solid rgba(230, 57, 70, 0.1);
        }

        .landing-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #060608 0%, #0f0507 50%, #060608 100%);
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-ctas {
            flex-direction: column;
          }

          .pricing-card.featured {
            transform: scale(1);
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .pricing-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

