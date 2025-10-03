import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div>
      <nav className="nav container">
        <span className="logo">PlaceMate</span>
        <div>
          <Link to="/login">Login</Link>
        </div>
      </nav>
      <section className="container hero">
        <div>
          <h1>Placement management for modern campuses</h1>
          <p>Manage companies, registrations, live drives, and student experiences — with a clean, responsive interface.</p>
          <div className="cta">
            <Link to="/login" className="btn btn-primary">Login</Link>
            <a href="#features" className="btn btn-secondary">Explore Features</a>
          </div>
        </div>
        <div className="center">
          <svg width="280" height="220" viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="260" height="200" rx="16" fill="var(--muted)"/>
            <rect x="30" y="40" width="80" height="14" rx="7" fill="var(--violet-500)"/>
            <rect x="30" y="70" width="220" height="8" rx="4" fill="#ddd"/>
            <rect x="30" y="90" width="220" height="8" rx="4" fill="#ddd"/>
            <rect x="30" y="110" width="160" height="8" rx="4" fill="#ddd"/>
            <rect x="30" y="150" width="60" height="24" rx="8" fill="var(--violet-600)"/>
          </svg>
        </div>
      </section>

      <section id="features" className="container">
        <div className="feature-grid">
          <div className="feature"><h3>Company Registration</h3><p>Create, open, and manage registrations with eligibility.</p></div>
          <div className="feature"><h3>Live Drives</h3><p>Run rounds, shortlist students, post announcements, finalize selections.</p></div>
          <div className="feature"><h3>Student Prep</h3><p>Read interview experiences and manage resumes in profile.</p></div>
        </div>
        <div className="stats">
          <div className="stat"><h4>150+</h4><small>Placements last year</small></div>
          <div className="stat"><h4>60+</h4><small>Companies</small></div>
          <div className="stat"><h4>3</h4><small>Resume slots</small></div>
          <div className="stat"><h4>7d</h4><small>JWT session</small></div>
        </div>
      </section>

      <footer className="container" style={{marginTop: 40}}>
        <hr />
        <p>Contact: placement@college.edu • © {new Date().getFullYear()} PlaceMate</p>
      </footer>
    </div>
  )
}



