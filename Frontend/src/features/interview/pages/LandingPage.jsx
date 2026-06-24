import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import '../style/landing.scss'

// Simple SVG Icons
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
)

const MinusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
)

const LandingPage = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [openFaq, setOpenFaq] = useState(null)
    const [mockTab, setMockTab] = useState("plan") // "plan", "tech", "behavior", "resume"

    // Micro-interaction: Mouse position tracking for background soft rose glow
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        e.currentTarget.style.setProperty("--mouse-x", `${x}px`)
        e.currentTarget.style.setProperty("--mouse-y", `${y}px`)
    }

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index)
    }

    const faqData = [
        {
            question: "How does the AI analyze my profile against the job description?",
            answer: "Our engine performs semantic analysis on your resume text or bio, comparing it against the key requirements, tech stack, and experience levels found in the target job description. It calculates a matching score, flags key skill gaps, and prepares a strategy tailored to satisfy what recruiters are looking for."
        },
        {
            question: "What LLM models power the preparation engine?",
            answer: "The platform runs an advanced multi-model fallback chain designed for maximum uptime. It attempts to prioritize top developer endpoints and automatically cascades down through active free models (like Llama-3.3-70b and Qwen) on OpenRouter to ensure your plan is generated even under heavy API loads."
        },
        {
            question: "Is my uploaded resume kept private and secure?",
            answer: "Yes, completely. We transmit resume data through secure HTTPS endpoints. Your resume content is strictly processed to extract skills and text for report generation and is never shared, sold, or used to train public LLM models."
        },
        {
            question: "Is there a limit to how many plans I can generate?",
            answer: "Our standard mock interview prep roadmaps and ATS keyword matches are entirely free to generate, subsidized by open API developer credits. We impose minor rate limits per user to prevent abuse and keep the platform accessible for everyone."
        }
    ]

    return (
        <div className="landing-page-wrapper" onMouseMove={handleMouseMove}>
            {/* Top Navigation */}
            <nav className="navbar animate-fade-in">
                <div className="nav-container">
                    <div className="logo" onClick={() => navigate('/')}>
                        <span>Lumina</span><span className="logo-accent">.</span>
                    </div>
                    <div className="nav-actions">
                        {user ? (
                            <Link to="/dashboard" className="nav-link-btn primary">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link">Sign In</Link>
                                <Link to="/register" className="nav-link-btn">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section">
                <div className="hero-content">
                    <div className="badge-promo animate-slide-up">AI-Driven Developer Interview Prep</div>
                    <h1 className="hero-title animate-slide-up">
                        Cracking your next role <br />
                        <span className="text-highlight">shouldn't feel like luck.</span>
                    </h1>
                    <p className="hero-subtitle animate-slide-up-delay-1">
                        Generate hyper-personalized preparation plans, targeted questions, and expert answering strategies based directly on your target job description and your real-world developer experience.
                    </p>
                    <div className="hero-cta animate-slide-up-delay-2">
                        {user ? (
                            <button onClick={() => navigate('/dashboard')} className="cta-btn main-btn">
                                Go to Your Dashboard
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </button>
                        ) : (
                            <button onClick={() => navigate('/register')} className="cta-btn main-btn">
                                Create Your Strategy
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </button>
                        )}
                        <span className="cta-note">No credit card required &bull; 100% Free Plan available</span>
                    </div>
                </div>
            </header>

            {/* Interactive Dashboard Mockup Showcase */}
            <section className="mockup-section animate-fade-in-delayed">
                <div className="mockup-container">
                    <div className="mockup-frame">
                        <div className="frame-header">
                            <span className="dot dot-red"></span>
                            <span className="dot dot-yellow"></span>
                            <span className="dot dot-green"></span>
                            <div className="frame-title">Dashboard Mockup &mdash; Interactive Preview</div>
                        </div>
                        <div className="frame-body">
                            <div className="mockup-sidebar">
                                <div 
                                    className={`sidebar-item ${mockTab === 'plan' ? 'active' : ''}`}
                                    onClick={() => setMockTab('plan')}
                                >
                                    Interview Plan
                                </div>
                                <div 
                                    className={`sidebar-item ${mockTab === 'tech' ? 'active' : ''}`}
                                    onClick={() => setMockTab('tech')}
                                >
                                    Technical Questions
                                </div>
                                <div 
                                    className={`sidebar-item ${mockTab === 'behavior' ? 'active' : ''}`}
                                    onClick={() => setMockTab('behavior')}
                                >
                                    Behavioral Prep
                                </div>
                                <div 
                                    className={`sidebar-item ${mockTab === 'resume' ? 'active' : ''}`}
                                    onClick={() => setMockTab('resume')}
                                >
                                    Resume PDF Builder
                                </div>
                            </div>
                            <div className="mockup-main">
                                {mockTab === 'plan' && (
                                    <div className="tab-content-wrapper">
                                        <div className="mockup-badge">Day 1 Focus: Event Loop & Asynchronous Node.js</div>
                                        <h4>10-Day Structured Interview Study Guide</h4>
                                        <p className="tab-desc">A customized day-by-day roadmap mapping out core priorities:</p>
                                        <div className="mock-plan-list">
                                            <div className="mock-plan-item done">
                                                <span className="plan-checkbox">✓</span>
                                                <span className="plan-task-text">Review call stack, macro-task queue, and micro-task queue ordering.</span>
                                            </div>
                                            <div className="mock-plan-item">
                                                <span className="plan-checkbox">○</span>
                                                <span className="plan-task-text">Practice coding a custom scheduler utilizing setImmediate vs setTimeout.</span>
                                            </div>
                                            <div className="mock-plan-item">
                                                <span className="plan-checkbox">○</span>
                                                <span className="plan-task-text">Revise error-first callback conventions and async error propagation patterns.</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {mockTab === 'tech' && (
                                    <div className="tab-content-wrapper">
                                        <div className="mockup-badge">Sample Generated Technical Question</div>
                                        <h4>Role-Specific Technical Assessment</h4>
                                        <div className="code-block">
                                            <span className="code-line number">01</span><span className="code-line comment">// Intention: Assess understanding of execution order in Node.js</span><br />
                                            <span className="code-line number">02</span><span className="code-line"><span className="keyword">question</span>: <span className="string">"Explain the difference between setImmediate() and process.nextTick()."</span></span><br />
                                            <span className="code-line number">03</span><span className="code-line"><span className="keyword">expectedAnswer</span>: <span className="string">"process.nextTick() fires immediately after the current phase, while setImmediate() executes on the check phase..."</span></span>
                                        </div>
                                    </div>
                                )}

                                {mockTab === 'behavior' && (
                                    <div className="tab-content-wrapper">
                                        <div className="mockup-badge">Behavioral Competency: Collaboration & Compromise</div>
                                        <h4>Tailored Situational Assessment</h4>
                                        <p className="tab-desc">Common behavioral prompts generated to match team environments:</p>
                                        <div className="behavior-mock-box">
                                            <p className="behavior-question"><strong>Prompt:</strong> "Tell me about a time you had a technical disagreement with a colleague. How was it resolved?"</p>
                                            <div className="behavior-tip">
                                                <span className="tip-badge">Recruiter Intent</span>
                                                <p>Evaluates constructiveness under friction, technical maturity, objectivity, and willingness to align on the best team outcome.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {mockTab === 'resume' && (
                                    <div className="tab-content-wrapper">
                                        <div className="mockup-badge">ATS Compatibility Score: 92% Match</div>
                                        <h4>Tailored Resume PDF Preview</h4>
                                        <p className="tab-desc">Preview of the human-written, ATS-compliant HTML resume generated for the role:</p>
                                        <div className="resume-preview-sheet">
                                            <div className="resume-name-title">
                                                <strong>Ayush Joshi</strong> &bull; <span className="resume-subtitle-text">Backend Software Engineer</span>
                                            </div>
                                            <div className="resume-divider-line"></div>
                                            <div className="resume-section-mock">
                                                <strong>Selected Experience:</strong>
                                                <p>&bull; Refactored microservices from Express.js to Fastify, boosting route throughput by 42%.</p>
                                                <p>&bull; Designed scalable background queues with BullMQ and Redis to isolate CPU-intensive calculations.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Pillars Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2>Engineered for developers who value their time</h2>
                    <p>Stop studying generic roadmaps. Get targeted preparation designed for your exact target profile.</p>
                </div>
                
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                        </div>
                        <h3>Resume ATS Matcher</h3>
                        <p>Our analyzer extracts critical keywords and gaps from your resume against your target JD, scoring your match instantly.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        </div>
                        <h3>Targeted Questions</h3>
                        <p>We generate behavioral and technical questions specific to the role. Each question details the interviewer's intent and how to structure a winning response.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        </div>
                        <h3>Day-by-Day Roadmaps</h3>
                        <p>Get a sequential, daily study plan detailing which concepts to revise, what questions to practice, and how to allocate your preparation schedule.</p>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="section-header">
                    <h2>Success stories from verified developers</h2>
                    <p>How other candidates used our personalized prep to land their engineering roles.</p>
                </div>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <p className="quote">"I was struggling to tailor my backend experience to senior React roles. PrepAI mapped out my frontend weaknesses in 30 seconds and gave me a 5-day study roadmap that got me the offer."</p>
                        <div className="author">
                            <div className="avatar">AJ</div>
                            <div>
                                <h4>Abhishek J.</h4>
                                <p>Frontend Engineer &bull; Vercel</p>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-card">
                        <p className="quote">"Being asked Event Loop questions always made me nervous. The technical question bank generated by PrepAI aligned perfectly with the node.js description, and the answers were extremely detailed."</p>
                        <div className="author">
                            <div className="avatar">MK</div>
                            <div>
                                <h4>Meera K.</h4>
                                <p>Backend Developer &bull; Stripe</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="pricing-section">
                <div className="section-header">
                    <h2>Simple, transparent pricing</h2>
                    <p>Get started preparing today. Choose the tier that matches your schedule.</p>
                </div>
                <div className="pricing-grid">
                    <div className="pricing-card">
                        <h3>Starter</h3>
                        <div className="price">$0<span>/ forever</span></div>
                        <p className="desc">Perfect for quick interview preparation and profile scans.</p>
                        <ul className="features-list">
                            <li>3 Custom Interview Plans</li>
                            <li>Full ATS Keyword Scanning</li>
                            <li>Standard AI model fallbacks</li>
                            <li>Download Resume PDF</li>
                        </ul>
                        <button onClick={() => navigate('/register')} className="pricing-btn secondary">Sign Up Free</button>
                    </div>
                    <div className="pricing-card featured">
                        <div className="badge">Recommended</div>
                        <h3>Unlimited Prep</h3>
                        <div className="price">$12<span>/ month</span></div>
                        <p className="desc">For active job hunters targeting multiple engineering roles.</p>
                        <ul className="features-list">
                            <li>Unlimited Strategy Generations</li>
                            <li>Premium Fast LLM priority routing</li>
                            <li>Unlimited custom resume building</li>
                            <li>Priority Developer Support</li>
                        </ul>
                        <button onClick={() => navigate('/register')} className="pricing-btn">Get Unlimited</button>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <div className="section-header">
                    <h2>Frequently Asked Questions</h2>
                    <p>Have questions about the platform? We've got answers.</p>
                </div>
                <div className="faq-list">
                    {faqData.map((item, idx) => {
                        const isOpen = openFaq === idx;
                        return (
                            <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`} onClick={() => toggleFaq(idx)}>
                                <div className="faq-question">
                                    <h3>{item.question}</h3>
                                    <span className="faq-icon" aria-hidden="true">
                                        {isOpen ? <MinusIcon /> : <PlusIcon />}
                                    </span>
                                </div>
                                <div className="faq-answer">
                                    <p>{item.answer}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Call To Action */}
            <section className="cta-bottom-section">
                <div className="cta-bottom-card">
                    <h2>Ready to ace your interview strategy?</h2>
                    <p>Upload your resume, input the job description, and generate your personal roadmap in 30 seconds.</p>
                    <button onClick={() => navigate('/register')} className="cta-btn main-btn">
                        Get Started for Free
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <p>&copy; {new Date().getFullYear()} Lumina. Designed for engineers.</p>
                    <div className="footer-links">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Help Center</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
