import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    GraduationCap,
    ArrowRight,
    BookOpen,
    Users,
    Shield,
    Zap,
    CheckCircle,
    Menu,
    X,
    Star,
    MessageCircle,
    Calendar,
    Plus,
    Minus,
    Globe,
    Award
} from 'lucide-react';

// --- Components ---

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseStyles = "relative overflow-hidden inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 focus:ring-primary border border-transparent group",
        secondary: "bg-secondary text-white hover:bg-secondary-light hover:shadow-lg hover:shadow-secondary/30 focus:ring-secondary border border-transparent",
        outline: "bg-white/50 backdrop-blur-sm text-text-main border-2 border-gray-200 hover:border-primary hover:text-primary hover:bg-white focus:ring-gray-200",
        ghost: "bg-transparent text-text-main-light hover:bg-gray-100 hover:text-primary",
        white: "bg-white text-primary hover:bg-gray-50 shadow-md border border-transparent",
        dark: "bg-text-main text-white hover:bg-gray-800 shadow-lg hover:shadow-gray-900/30"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            <span className="relative z-10 flex items-center">{children}</span>
            {variant === 'primary' && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
            )}
        </button>
    );
};

const Badge = ({ children, color = 'indigo' }) => {
    const colors = {
        indigo: "bg-primary/10 text-primary border-primary/20",
        orange: "bg-accent/10 text-accent border-accent/20",
        green: "bg-green-100/50 text-green-700 border-green-200",
        violet: "bg-secondary/10 text-secondary border-secondary/20",
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${colors[color]}`}>
            {children}
        </span>
    );
};

const AccordionItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className="border-b border-gray-200 last:border-0">
            <button
                className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
                onClick={onClick}
            >
                <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-primary' : 'text-text-main group-hover:text-primary'}`}>
                    {question}
                </span>
                <div className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500 group-hover:bg-primary/10'}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </div>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}
            >
                <p className="text-gray-600 leading-relaxed pr-8">
                    {answer}
                </p>
            </div>
        </div>
    );
};

// --- Sections ---

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 py-3 shadow-lg shadow-gray-200/5' : 'bg-transparent py-5'}`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="EduSync Logo" className="h-10 w-auto group-hover:scale-105 transition-transform duration-300" />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text-main to-text-main-light">
                        EduSync
                    </span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {['Features', 'Stats', 'Testimonials', 'FAQ'].map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-text-main-light hover:text-primary transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
                            {item}
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-4">
                    <Link to="/login" className="text-sm font-semibold text-text-main-light hover:text-primary transition-colors">
                        Log in
                    </Link>
                    <Button size="sm" onClick={() => navigate('/register')} className="rounded-lg shadow-primary/20">
                        Get Started
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 p-6 md:hidden shadow-xl flex flex-col gap-4 animate-in slide-in-from-top-5">
                    {['Features', 'Stats', 'Testimonials', 'FAQ'].map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="text-lg font-medium text-gray-800 py-2 border-b border-gray-50" onClick={() => setMobileMenuOpen(false)}>
                            {item}
                        </a>
                    ))}
                    <div className="flex flex-col gap-3 mt-4">
                        <Button variant="outline" className="w-full justify-center">Log in</Button>
                        <Button className="w-full justify-center">Sign up Free</Button>
                    </div>
                </div>
            )}
        </nav>
    );
};

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
            {/* Dynamic Background Elements - Enhanced */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                {/* Mesh Gradient */}
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
                <div className="absolute top-[-5%] left-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-accent/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-primary/10 backdrop-blur-md text-primary font-semibold text-xs uppercase tracking-wider mb-8 shadow-sm animate-fade-in-up hover:shadow-md transition-shadow cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            v2.0 is now live
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold text-text-main mb-6 leading-[1.1] tracking-tight drop-shadow-sm">
                            Campus life, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary animate-gradient-x">
                                Synchronized.
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            The all-in-one platform for students and faculty. Manage assignments, buy textbooks, and connect with your campus community in one secure ecosystem.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Button size="lg" onClick={() => navigate('/register')} className="w-full sm:w-auto shadow-xl shadow-primary/20">
                                Join Your Campus
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button size="lg" variant="outline" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto bg-white/70">
                                <Zap className="mr-2 h-5 w-5 text-accent" />
                                Explore Features
                            </Button>
                        </div>

                        <div className="mt-10 flex items-center justify-center lg:justify-start gap-8 text-sm font-semibold text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="bg-green-100 p-1 rounded-full"><CheckCircle className="h-3 w-3 text-green-600" /></div>
                                <span>Free for Students</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="bg-green-100 p-1 rounded-full"><CheckCircle className="h-3 w-3 text-green-600" /></div>
                                <span>No Credit Card</span>
                            </div>
                        </div>
                    </div>

                    {/* Visual Content (Mockup) */}
                    <div className="flex-1 w-full max-w-[600px] perspective-1000">
                        <div className="relative transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-all duration-700 ease-out group">

                            {/* Glow behind card */}
                            <div className="absolute inset-0 bg-primary blur-[60px] opacity-20 rounded-full group-hover:opacity-30 transition-opacity"></div>

                            {/* Main Card */}
                            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden z-20">
                                <div className="bg-white/50 border-b border-gray-100 p-4 flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="ml-4 w-1/2 h-2 bg-gray-200/50 rounded-full"></div>
                                </div>
                                <div className="p-6 grid grid-cols-2 gap-4">
                                    <div className="col-span-2 bg-gradient-to-br from-primary/5 to-white rounded-xl p-4 flex items-center justify-between border border-primary/10 shadow-sm">
                                        <div>
                                            <div className="text-xs font-semibold text-primary mb-1">UPCOMING EXAM</div>
                                            <div className="font-bold text-gray-800">Advanced Algorithms</div>
                                        </div>
                                        <div className="bg-white px-3 py-1 rounded-lg text-sm font-bold text-primary shadow-sm border border-primary/10">
                                            Tomorrow
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl border border-orange-50 shadow-sm">
                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3 text-orange-600">
                                            <BookOpen size={16} />
                                        </div>
                                        <div className="text-sm font-bold text-gray-800">Marketplace</div>
                                        <div className="text-xs text-gray-500 mt-1">3 New Books</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-50 shadow-sm">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3 text-green-600">
                                            <Users size={16} />
                                        </div>
                                        <div className="text-sm font-bold text-gray-800">Groups</div>
                                        <div className="text-xs text-gray-500 mt-1">5 Active Chats</div>
                                    </div>
                                    <div className="col-span-2 h-24 bg-bkg/50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer">
                                        Drop assignments here
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements - Enhanced */}
                            <div className="absolute -right-12 top-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white z-30 animate-float">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <MessageCircle size={20} className="text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 font-medium">New Message</div>
                                        <div className="text-sm font-bold text-gray-800">Study Group A</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -left-8 bottom-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white z-30 animate-float animation-delay-2000">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle size={20} className="text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 font-medium">Task Completed</div>
                                        <div className="text-sm font-bold text-gray-800">Physics Lab Report</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const StatCard = ({ count, label, icon: Icon, delay }) => (
    <div className="flex flex-col items-center text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all duration-500 group" style={{ animationDelay: delay }}>
        <div className="mb-3 p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <Icon size={24} />
        </div>
        <div className="text-3xl font-extrabold text-text-main mb-1">{count}</div>
        <div className="text-sm font-medium text-text-main-lighter">{label}</div>
    </div>
);

const StatsSection = () => (
    <section className="py-12 border-y border-white/50 bg-white/30 backdrop-blur-sm" id="stats">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <StatCard icon={Users} count="15,000+" label="Active Students" delay="0ms" />
                <StatCard icon={BookOpen} count="450+" label="Universities" delay="100ms" />
                <StatCard icon={Globe} count="120+" label="Countries" delay="200ms" />
                <StatCard icon={Award} count="98%" label="Satisfaction" delay="300ms" />
            </div>
        </div>
    </section>
);

const BentoFeature = ({ title, desc, icon: Icon, className, colorClass }) => (
    <div className={`group relative overflow-hidden rounded-[2rem] p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 ${className} bg-white/60 backdrop-blur-md border border-white/60`}>
        {/* Hover Gradient Background */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${colorClass.replace('text-', 'bg-')}`}></div>

        <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${colorClass.replace('text-', 'bg-')}`}></div>

        <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${colorClass.replace('bg-', 'bg-opacity-10 ')} bg-opacity-10 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-7 w-7 ${colorClass}`} />
        </div>

        <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-indigo-900 transition-colors">{title}</h3>
        <p className="text-gray-500 leading-relaxed group-hover:text-gray-600">{desc}</p>

        <div className="mt-8 flex items-center text-sm font-bold text-indigo-600 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            Learn more <ArrowRight className="ml-2 h-4 w-4" />
        </div>
    </div>
);

const FeaturesSection = () => {
    return (
        <section className="py-32 relative" id="features">
            {/* Decorative Blob */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-50/50 rounded-full mix-blend-multiply filter blur-[100px] -z-10"></div>

            <div className="container mx-auto px-6">
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <Badge color="violet">Features</Badge>
                    <h2 className="mt-6 text-4xl md:text-5xl font-extrabold text-text-main tracking-tight">One Platform, <br />Infinite Possibilities.</h2>
                    <p className="mt-6 text-xl text-text-main-light leading-relaxed">EduSync bridges the gap between academic requirements and social life, creating a harmonious campus experience.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <BentoFeature
                        title="Academic Hub"
                        desc="Centralize your syllabus, grades, and assignments. Syncs automatically with your university portal so you never miss a deadline."
                        icon={BookOpen}
                        className="md:col-span-2"
                        colorClass="text-primary bg-primary"
                    />
                    <BentoFeature
                        title="Real-time Chat"
                        desc="Connect with classmates instantly. Create project groups, share files, or join campus-wide channels."
                        icon={MessageCircle}
                        className=""
                        colorClass="text-accent bg-accent"
                    />
                    <BentoFeature
                        title="Secure Marketplace"
                        desc="Buy and sell textbooks, electronics, and dorm essentials safely within your verified campus network."
                        icon={Shield}
                        className=""
                        colorClass="text-secondary bg-secondary"
                    />
                    <BentoFeature
                        title="Event Calendar"
                        desc="Never miss a lecture, club meeting, or campus party. Smart notifications and calendar sync keep you on track."
                        icon={Calendar}
                        className="md:col-span-2"
                        colorClass="text-primary bg-primary"
                    />
                </div>
            </div>
        </section>
    );
};

const TestimonialCard = ({ name, role, text, avatar, color }) => (
    <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-lg shadow-gray-200/50 border border-white flex flex-col h-full hover:transform hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center gap-1 text-yellow-400 mb-6">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill="currentColor" className="drop-shadow-sm" />)}
        </div>
        <p className="text-gray-600 mb-8 flex-grow text-lg leading-relaxed italic">"{text}"</p>
        <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
            <div className={`w-12 h-12 rounded-full overflow-hidden shadow-md ring-2 ring-white`}>
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
            </div>
            <div>
                <div className="font-bold text-gray-900 text-lg">{name}</div>
                <div className="text-sm text-primary font-medium">{role}</div>
            </div>
        </div>
    </div>
)

const Testimonials = () => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -400 : 400;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-32 relative overflow-hidden" id="testimonials">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/30 to-transparent"></div>

            <div className="container mx-auto px-6 mb-16 relative z-10 flex justify-between items-end">
                <div>
                    <Badge color="orange">Testimonials</Badge>
                    <h2 className="mt-6 text-4xl font-extrabold text-text-main">Loved by Students</h2>
                </div>
                <div className="hidden md:flex gap-3">
                    <button
                        onClick={() => scroll('left')}
                        className="p-3 rounded-full bg-white border border-gray-200 hover:border-primary hover:text-primary transition-colors shadow-sm"
                    >
                        <ArrowRight className="rotate-180" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-3 rounded-full bg-white border border-gray-200 hover:border-primary hover:text-primary transition-colors shadow-sm"
                    >
                        <ArrowRight />
                    </button>
                </div>
            </div>

            {/* Scroll Container */}
            <div
                ref={scrollRef}
                className="flex gap-8 overflow-x-auto pb-12 px-6 no-scrollbar snap-x relative z-10"
            >
                <div className="min-w-[350px] md:min-w-[450px] snap-center">
                    <TestimonialCard
                        name="Sarah Jenkins"
                        role="Computer Science @ MIT"
                        avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
                        text="EduSync completely changed how I manage my group projects. The chat feature combined with file sharing is a lifesaver. I can't imagine surviving finals without it."
                    />
                </div>
                <div className="min-w-[350px] md:min-w-[450px] snap-center">
                    <TestimonialCard
                        name="David Chen"
                        role="Business Admin @ Stanford"
                        avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
                        text="I sold all my old textbooks in 24 hours on the marketplace. It's so much safer than meeting strangers from generic sites because everyone is verified."
                    />
                </div>
                <div className="min-w-[350px] md:min-w-[450px] snap-center">
                    <TestimonialCard
                        name="Marcus Johnson"
                        role="Engineering @ Oxford"
                        avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
                        text="Finally, an app that actually looks good and works well. The calendar integration with my university portal is seamless and saves me so much time."
                    />
                </div>
                <div className="min-w-[350px] md:min-w-[450px] snap-center">
                    <TestimonialCard
                        name="Emily Blunt"
                        role="Arts @ NYU"
                        avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80"
                        text="The community forums helped me find friends before I even arrived on campus. Best orientation tool ever. Highly recommended for freshmen."
                    />
                </div>
            </div>
        </section>
    );
};

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            question: "Is EduSync really free for students?",
            answer: "Yes! EduSync is 100% free for students with a valid .edu email address. You get access to all core features including the calendar, marketplace, and chat."
        },
        {
            question: "How secure is the marketplace?",
            answer: "Safety is our priority. Marketplace transactions are only allowed between verified students from the same or nearby campuses. We also offer secure in-app payment protection."
        },
        {
            question: "Can I sync with my existing calendar?",
            answer: "Absolutely. EduSync integrates with Google Calendar, Outlook, and Apple Calendar. We also support direct integration with Canvas and Blackboard for assignments."
        },
        {
            question: "Is my data private?",
            answer: "Your privacy matters. We do not sell your personal data to third parties. Your academic data is encrypted and used only to provide you with the services you requested."
        }
    ];

    return (
        <section className="py-24 bg-white/50 backdrop-blur-sm" id="faq">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <Badge color="green">Support</Badge>
                    <h2 className="mt-4 text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 p-8 md:p-12">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

const CTASection = () => (
    <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-6xl">
            <div className="relative rounded-[3rem] bg-secondary overflow-hidden px-8 py-24 text-center shadow-2xl shadow-secondary/40">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

                {/* Glowing Orbs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-3xl pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight leading-tight">
                        Ready to sync your academic life?
                    </h2>
                    <p className="text-gray-300 text-xl mb-12 leading-relaxed">
                        Join over 10,000+ students and faculty members who are already using EduSync to streamline their journey.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        <Button size="lg" variant="white" className="text-gray-900 font-bold hover:scale-105" onClick={() => alert("iOS App coming soon!")}>
                            Download for iOS
                        </Button>
                        <Button size="lg" className="bg-primary hover:bg-primary-hover text-white font-bold border border-primary/50 hover:scale-105 shadow-lg shadow-secondary/50" onClick={() => alert("Android App coming soon!")}>
                            Download for Android
                        </Button>
                    </div>
                    <div className="mt-10 flex justify-center items-center gap-2 text-sm text-gray-400">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>4.9/5 rating on App Store</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="bg-secondary text-white pt-20 pb-10">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-6">
                        <img src="/logo.png" alt="EduSync Logo" className="h-10 w-auto brightness-0 invert" />
                        <span className="text-2xl font-bold">EduSync</span>
                    </div>
                    <p className="text-white/70 leading-relaxed mb-6">
                        Empowering the next generation of learners with tools that matter. Built for students, by students.
                    </p>
                    <div className="flex gap-4">
                        {/* Social icons */}
                        {['twitter', 'github', 'linkedin'].map((social) => (
                            <div key={social} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white transition-all cursor-pointer">
                                <Globe size={18} />
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-6">Product</h4>
                    <ul className="space-y-4 text-gray-400">
                        <li><a href="#" className="hover:text-accent transition-colors">Features</a></li>
                        <li><a href="#" className="hover:text-accent transition-colors">Pricing</a></li>
                        <li><a href="#" className="hover:text-accent transition-colors">Marketplace</a></li>
                        <li><a href="#" className="hover:text-accent transition-colors">Integrations</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-6">Company</h4>
                    <ul className="space-y-4 text-gray-400">
                        <li><a href="#" className="hover:text-accent transition-colors">About Us</a></li>
                        <li><a href="#" className="hover:text-accent transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
                        <li><a href="#" className="hover:text-accent transition-colors">Brand Assets</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-6">Legal</h4>
                    <ul className="space-y-4 text-gray-400">
                        <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
                        <li><a href="#" className="hover:text-accent transition-colors">Cookie Policy</a></li>
                        <li><a href="#" className="hover:text-accent transition-colors">Security</a></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
                <div>
                    © 2025 EduSync Inc. All rights reserved.
                </div>
                <div className="flex gap-8">
                    <a href="#" className="hover:text-white">Privacy</a>
                    <a href="#" className="hover:text-white">Terms</a>
                    <a href="#" className="hover:text-white">Sitemap</a>
                </div>
            </div>
        </div>
    </footer>
);

const LandingPage = () => {
    return (
        <div className="min-h-screen font-sans text-text-main selection:bg-primary/20 selection:text-primary relative">
            {/* Global Creative Background */}
            <div className="fixed inset-0 -z-50 bg-bkg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-bkg to-secondary/5"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            </div>

            <Navbar />
            <main>
                <HeroSection />
                <StatsSection />
                <FeaturesSection />
                <Testimonials />
                <FAQSection />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;