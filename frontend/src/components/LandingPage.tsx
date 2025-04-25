import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../assets/Frame.svg';
import appPreview from '../assets/vbruh.png';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animations after component mount
    setAnimate(true);
    
    // Add resize listener to handle zoom properly
    const handleResize = () => {
      document.documentElement.style.width = '100%';
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const features = [
    { icon: "✏️", title: "Smart Note-Taking", description: "Create and edit notes with our intuitive interface" },
    { icon: "🔍", title: "AI Auto-Tagging", description: "Let AI organize your notes with intelligent tagging" },
    { icon: "📝", title: "AI Summaries", description: "Generate concise summaries of your notes instantly" },
    { icon: "🧠", title: "Quiz Generation", description: "Test your knowledge with AI-generated quizzes" }
  ];

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className={`landing-content ${animate ? 'animate-in' : ''}`}>
          <div className="landing-logo">
            <img src={logo} alt="NoteGenius Logo" />
          </div>
          <h1 className="landing-title">Welcome to NoteGenius!</h1>
          <p className="landing-subtitle">
            Your ultimate platform for smart note-taking, easy access, and powerful organization.
          </p>
          <div className="landing-buttons">
            <Button type="primary" className="landing-button" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button className="landing-button" onClick={() => navigate('/signup')}>
              Signup
            </Button>
          </div>
        </div>
        <div className={`landing-image ${animate ? 'animate-in-delayed' : ''}`}>
          <img src={appPreview} alt="NoteGenius App Preview" />
        </div>
      </section>

      {/* Features Section - Now positioned immediately after hero */}
      <section className="landing-features">
        <h2 className="features-title">Elevate Your Note-Taking Experience</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`feature-card ${animate ? 'animate-in-staggered' : ''}`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="cta-content">
          <h2>Ready to transform how you take notes?</h2>
          <p>Join 5 students and professionals who've enhanced their learning and productivity with NoteGenius.</p>
          <Button 
            type="primary" 
            size="large" 
            className="cta-button"
            onClick={() => navigate('/signup')}
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <img src={logo} alt="NoteGenius Logo" className="footer-logo" />
          <p>© {new Date().getFullYear()} NoteGenius. Group 35 (goated).</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;