import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { supabase, isSupabaseConfigured } from './supabase';
import { LocationPickerMap, GigLocationMap } from './OSMComponents';
import { FileUploadButton, FilePreview, MessageAttachment, uploadFile } from './FileUpload';
import {
  MapPin,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Users,
  CheckCircle,
  MessageSquare,
  Zap,
  Globe,
  Quote,
  Check,
  Target,
  Wrench, Monitor, Hammer, Scissors, Car, Camera, Paintbrush, Briefcase, Code, Music, Search,
  User, Lock, Mail, X, Edit2, Save, FileText, LayoutGrid, Calendar, Flame, Filter, Plus, Activity, Award, Star, Clock, AlertCircle, GraduationCap, ChevronLeft, Send
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Animated IP Tracing / Location Background
const TracingBackground = () => {
  const [pins, setPins] = useState([]);

  useEffect(() => {
    // Generate new pins periodically to simulate live tracking
    const generatePin = () => {
      const newPin = {
        id: Math.random(),
        x: Math.random() * 80 + 10, // 10% to 90%
        y: Math.random() * 80 + 10,
        scale: Math.random() * 0.6 + 0.4, // size variation
        duration: Math.random() * 4 + 4, // 4s to 8s 
        type: Math.random() > 0.5 ? 'success' : 'primary', // 50% chance to be green or red
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 100)}.${Math.floor(Math.random() * 255)}`
      };
      setPins(prev => {
        const next = [...prev, newPin];
        // Increase up to 15 pins for more activity
        if (next.length > 20) return next.slice(1);
        return next;
      });
    };

    const interval = setInterval(generatePin, 1200); // Slower generation for better performance
    // Initial pins
    for (let i = 0; i < 5; i++) setTimeout(generatePin, i * 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>

      {/* Dotted Map Background */}
      <div style={{
        position: 'absolute', width: '120%', height: '120%', left: '-10%', top: '-10%',
        backgroundImage: 'url("/world-map.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.25,
        filter: 'grayscale(100%) brightness(1.2)'
      }}></div>

      {/* Cyber Nodes */}
      <AnimatePresence>
        {pins.map(pin => {
          const pinColor = pin.type === 'success' ? '#10b981' : '#ef4444';
          return (
            <motion.div
              key={pin.id}
              initial={{ opacity: 0, scale: 0, left: `${pin.x}%`, top: `${pin.y}%` }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, pin.scale, pin.scale, 0],
                top: [`${pin.y}%`, `${pin.y - 8}%`] // Drift/jump upwards
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: pin.duration, ease: "easeInOut" }}
              style={{ position: 'absolute', left: `${pin.x}%`, top: `${pin.y}%`, color: pinColor, transform: 'translate(-50%, -50%)' }}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>

                {/* Location Icon */}
                <motion.div
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    filter: `drop-shadow(0 0 5px ${pinColor})`
                  }}
                >
                  <MapPin size={32} strokeWidth={2} />
                </motion.div>

              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Animated Abstract Background for Sections (Floating Tools)
const FloatingIconsBackground = React.memo(() => {
  const iconSet = [Wrench, Code, Scissors, MessageSquare, Camera, Paintbrush, Briefcase, Zap, Music, Hammer];

  // Memoize random properties so they don't regenerate continuously on mouse move
  const floatingIconsProps = useMemo(() => {
    return [...Array(15)].map((_, i) => {
      return {
        Icon: iconSet[i % iconSet.length] || Wrench,
        size: Math.random() * 80 + 40,
        left: Math.random() * 100,
        top: Math.random() * 100,
        durationY: Math.random() * 15 + 15,
        durationX: Math.random() * 10 + 10,
        delay: Math.random() * 5,
        driftY: -(Math.random() * 150 + 50),
        swayX: Math.random() * 80 - 40,
        rotateMax: Math.random() * 45
      };
    });
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* Soft gradient overlay so it doesn't clash with content, opacity slightly reduced to show icons */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(248, 250, 252, 0) 0%, rgba(248, 250, 252, 0.6) 100%)', zIndex: 1 }} />
      {floatingIconsProps.map((props, i) => {
        const { Icon, size, left, top, durationY, durationX, delay, driftY, swayX, rotateMax } = props;

        return (
          <motion.div
            key={`bg-icon-${i}`}
            initial={{ opacity: 0.12 }} // Much higher opacity
            animate={{
              y: [0, driftY, 0],
              x: [0, swayX, -swayX, 0],
              rotate: [0, rotateMax, -rotateMax, 0]
            }}
            transition={{
              y: { duration: durationY, repeat: Infinity, ease: "easeInOut", delay },
              x: { duration: durationX, repeat: Infinity, ease: "easeInOut", delay },
              rotate: { duration: durationY * 1.5, repeat: Infinity, ease: "easeInOut", delay }
            }}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${top}%`,
              color: 'var(--brand-red)',
              willChange: 'transform'
            }}
          >
            <Icon size={size} strokeWidth={1.5} />
          </motion.div>
        );
      })}
    </div>
  );
});

const fadeInUp = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

const staggerCards = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const floatAnim = {
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const Navbar = ({ scrolled, setPage, isDark, isLoggedIn, onAuth, onLogout, currentPage }) => {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    let channel;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        channel = supabase.channel('navbar_notifications')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${session.user.id}` }, () => {
            setHasUnread(true);
          })
          .subscribe();
      }
    });

    const handleInboxOpened = () => setHasUnread(false);
    window.addEventListener('openInboxModal', handleInboxOpened);

    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener('openInboxModal', handleInboxOpened);
    };
  }, [isLoggedIn]);

  return (
  <nav className={`navbar transition-all duration-500 fixed top-0 w-full z-[1000] ${scrolled ? 'bg-white/80 backdrop-blur-2xl border-b border-white/20 shadow-crystal' : 'bg-transparent'}`}>
    <div className="container mx-auto px-6 md:px-8 py-3 md:py-5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
      {/* Top Row: Brand (Left) + Auth (Right) on mobile */}
      <div className="flex justify-between items-center w-full md:w-auto">
        <motion.div
          whileHover={{ scale: 1.02, rotate: -1 }}
          className="brand cursor-pointer flex items-center bg-brand-red px-4 md:px-5 py-1.5 md:py-2 rounded-xl shadow-neo"
          onClick={() => setPage('home')}
        >
          <span className="text-white text-xl md:text-2xl font-black tracking-tight font-['Space_Grotesk']">Bartr.in</span>
        </motion.div>

        {/* Mobile Auth (Now on the Right) */}
        <div className="flex md:hidden gap-2">
          {isLoggedIn ? (
            <>
              <button onClick={() => window.dispatchEvent(new Event('openInboxModal'))} className="bg-white border-2 border-slate-900 px-3 py-2 rounded-xl text-slate-900 flex items-center justify-center relative">
                <MessageSquare size={16} />
                {hasUnread && <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></span>}
              </button>
              <button onClick={onLogout} className="bg-white border-2 border-slate-900 px-4 py-2 rounded-xl font-black text-xs shadow-sm uppercase">Logout</button>
            </>
          ) : (
            <button onClick={() => onAuth('login')} className="bg-white border-2 border-slate-900 px-4 py-2 rounded-xl font-black text-xs shadow-sm uppercase">Login</button>
          )}
        </div>
      </div>


      {/* Navigation Links - Scrollable on mobile, centered on desktop */}
      <div className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar w-full md:w-auto justify-start md:justify-center py-1 md:py-0 border-t md:border-t-0 border-black/5 mt-1 md:mt-0">
        {[
          { id: 'gigs', label: 'Gigs', icon: <Zap size={18} /> },
          { id: 'events', label: 'Events', icon: <Calendar size={18} /> },
          { id: 'careers', label: 'Careers', icon: <Briefcase size={18} /> },
          { id: 'tri-score', label: 'TRI Score', icon: <Award size={18} /> },
          { id: 'student', label: 'Student', icon: <GraduationCap size={18} /> },
          ...(isLoggedIn ? [{ id: 'profile', label: 'Profile', icon: <User size={18} /> }] : [])
        ].map((item) => (
          <motion.a
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${currentPage === item.id ? 'bg-black text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            style={{ cursor: 'pointer' }}
          >
            {item.icon}
            <span>{item.label}</span>
          </motion.a>
        ))}
      </div>

      {/* Desktop Auth Actions */}
      <div className="hidden md:flex gap-3 items-center">
        {isLoggedIn ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => window.dispatchEvent(new Event('openInboxModal'))}
              className="bg-white border-2 border-black w-10 h-10 rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black relative"
            >
              <MessageSquare size={18} />
              {hasUnread && <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '14px', height: '14px', background: '#ef4444', borderRadius: '50%', border: '3px solid white', boxShadow: '0 0 0 1px black' }}></span>}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onLogout}
              className="bg-white border-2 border-black px-5 py-2 rounded-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase text-sm"
            >
              LOGOUT
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onAuth('login')}
              className="bg-white text-black border-2 border-black px-5 py-2 rounded-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase text-sm"
            >
              LOGIN
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onAuth('signup')}
              className="bg-brand-red text-white border-2 border-black px-5 py-2 rounded-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase text-sm"
            >
              SIGNUP
            </motion.button>
          </>
        )}
      </div>
    </div>
  </nav>
  );
};

// --- POST GIG MODAL ---
const PostGigModal = ({ isOpen, onClose, user, onPostSuccess, categories }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Manual');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLocationSelect = (address, coords) => {
    setLocation(address);
    setCoordinates(coords);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to post a gig!");
      return;
    }
    if (!location) {
      alert("Please select a location on the map!");
      return;
    }
    setLoading(true);
    const gigData = {
      client_id: user.id,
      title,
      category,
      price,
      description,
      location,
      status: 'Active'
    };

    const { error } = await supabase.from('gigs').insert(gigData);
    setLoading(false);
    if (!error) {
      onPostSuccess();
      onClose();
      setTitle(''); setPrice(''); setDescription(''); setLocation(''); setCoordinates(null);
    } else {
      alert("Error posting gig: " + error.message);
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white border-[5px] sm:border-[8px] border-black rounded-[28px] sm:rounded-[40px] w-full max-w-[700px] max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] sm:shadow-[16px_16px_0px_rgba(0,0,0,1)] relative" onClick={e => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-slate-100 text-black p-2 rounded-xl hover:bg-black hover:text-white transition-colors">
            <X size={20} strokeWidth={3} />
          </button>
          <h2 className="text-3xl sm:text-4xl font-black uppercase italic mb-6 pr-12">Post a Gig</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">What do you need?</label>
              <input type="text" placeholder="e.g. Fix my sink, Build a React App" className="w-full bg-slate-50 border-4 border-black p-4 rounded-2xl font-bold focus:bg-white outline-none" value={title} onChange={e=>setTitle(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Category</label>
                <select className="w-full bg-slate-50 border-4 border-black p-4 rounded-2xl font-bold outline-none" value={category} onChange={e=>setCategory(e.target.value)}>
                  {categories.filter(c => c.name !== 'All').map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Budget / Offer</label>
                <input type="text" placeholder="e.g. ₹500, Negotiable" className="w-full bg-slate-50 border-4 border-black p-4 rounded-2xl font-bold focus:bg-white outline-none" value={price} onChange={e=>setPrice(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                <span>📍</span><span>Location</span>
                {coordinates && <span style={{ color: '#16a34a', fontSize: '0.7rem', fontWeight: 800, marginLeft: 'auto' }}>✓ Pinned</span>}
              </label>
              {/* Hidden input so form validation still works */}
              <input type="text" value={location} onChange={() => {}} required style={{ display: 'none' }} readOnly />
              <div style={{ height: '420px' }}>
                <LocationPickerMap onLocationSelect={handleLocationSelect} initialLocation={coordinates ? [coordinates[0], coordinates[1]] : null} />
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</label>
              <textarea placeholder="Give more details..." className="w-full bg-slate-50 border-4 border-black p-4 rounded-2xl font-bold focus:bg-white outline-none" rows="3" value={description} onChange={e=>setDescription(e.target.value)} required></textarea>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit" className={`w-full py-4 rounded-2xl font-black text-xl sm:text-2xl border-4 border-black shadow-[6px_6px_0px_black] sm:shadow-[8px_8px_0px_black] uppercase italic ${loading ? 'opacity-50 cursor-not-allowed bg-slate-500 text-white' : 'bg-brand-red text-white'}`}>
              {loading ? 'Posting...' : 'Post It!'}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- GIG DETAILS MODAL ---
const GigDetailsModal = ({ gig, catInfo, user, myApplications, applyingGigId, onApply, onOpenChat, onClose, formatTime }) => {
  if (!gig) return null;

  const posterName = gig.user_profiles?.full_name || 'Anonymous';
  const posterRole = gig.user_profiles?.role || 'User';
  const isOwner = user && gig.client_id === user.id;
  const hasApplied = user && myApplications.includes(gig.id);
  const isApplying = applyingGigId === gig.id;

  const actionLabel = !user
    ? 'Login to Apply'
    : isOwner
      ? 'Your Gig'
      : hasApplied
        ? 'Already Applied'
        : isApplying
          ? 'Applying...'
          : 'Apply Now';

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-xl bg-black/70" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 40, rotate: -1 }} animate={{ scale: 1, y: 0, rotate: 0 }} exit={{ scale: 0.9, y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} className="bg-white border-[5px] sm:border-[8px] border-black rounded-[28px] sm:rounded-[40px] w-full max-w-[900px] max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_rgba(239,68,68,1)] sm:shadow-[18px_18px_0px_rgba(239,68,68,1)] relative" onClick={e => e.stopPropagation()}>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '30px', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '-120px', right: '-80px', width: '300px', height: '300px', background: catInfo.color, filter: 'blur(90px)', opacity: 0.22 }} />
          </div>

          <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white text-black p-2 rounded-xl border-[3px] border-black hover:bg-black hover:text-white transition-colors z-10">
            <X size={20} strokeWidth={3} />
          </button>

          <div className="relative z-[1] p-5 sm:p-7 md:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span style={{ background: `${catInfo.color}18`, color: catInfo.color, border: `2px solid ${catInfo.color}`, padding: '0.55rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                {catInfo.icon} {gig.category}
              </span>
              <span className="bg-black text-white px-4 py-2 rounded-full text-xs font-black uppercase flex items-center gap-2">
                <Clock size={14} /> Posted {formatTime(gig.created_at)}
              </span>
              <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-xs font-black uppercase flex items-center gap-2">
                <Activity size={14} /> {gig.status || 'Active'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-8">
              <div>
                <h2 className="text-[clamp(2.4rem,6vw,5rem)] font-black uppercase italic tracking-tighter leading-[0.85] mb-6">
                  {gig.title}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <motion.div whileHover={{ y: -4 }} className="bg-slate-50 border-4 border-black rounded-[28px] p-5 shadow-[7px_7px_0px_black]">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                      <MapPin size={16} /> Location
                    </div>
                    <div className="text-2xl font-black text-slate-900">{gig.location}</div>
                  </motion.div>
                  <motion.div whileHover={{ y: -4 }} className="bg-brand-red text-white border-4 border-black rounded-[28px] p-5 shadow-[7px_7px_0px_black]">
                    <div className="text-xs font-black uppercase tracking-widest text-white/70 mb-2 flex items-center gap-2">
                      <Zap size={16} /> Offer
                    </div>
                    <div className="text-3xl font-black tracking-tighter">{gig.price}</div>
                  </motion.div>
                </div>

                <div className="bg-white border-4 border-black rounded-[32px] p-6 md:p-7 shadow-[10px_10px_0px_rgba(15,23,42,1)] mb-8">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <FileText size={16} /> Full Brief
                  </div>
                  <p className="text-lg md:text-xl font-bold text-slate-700 leading-relaxed">{gig.description}</p>
                </div>

                {/* Location Map */}
                <div className="mb-8">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <MapPin size={16} /> Location on Map
                  </div>
                  <GigLocationMap 
                    location={gig.location} 
                    coordinates={gig.latitude && gig.longitude ? [gig.latitude, gig.longitude] : null}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: <ShieldCheck size={20} />, title: 'Safe Contact', text: 'Chat stays inside Bartr until both sides are ready.' },
                    { icon: <MessageSquare size={20} />, title: 'Direct Talk', text: 'Apply once, then coordinate with the poster.' },
                    { icon: <CheckCircle size={20} />, title: 'Local First', text: 'Built for fast nearby work in India.' }
                  ].map((item) => (
                    <div key={item.title} className="bg-slate-50 border-2 border-slate-200 rounded-[22px] p-5">
                      <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center mb-3">{item.icon}</div>
                      <h4 className="text-base font-black uppercase mb-1">{item.title}</h4>
                      <p className="text-sm font-bold text-slate-500 leading-snug">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-slate-950 text-white border-4 border-black rounded-[32px] p-6 shadow-[10px_10px_0px_#ef4444]">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">Posted By</div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white text-black border-4 border-brand-red flex items-center justify-center text-3xl font-black uppercase">{posterName.charAt(0)}</div>
                    <div>
                      <h3 className="text-2xl font-black text-white leading-none">{posterName}</h3>
                      <p className="text-sm font-black text-slate-400 uppercase mt-2">{posterRole}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                    <Star size={16} className="text-yellow-300" fill="currentColor" />
                    New local opportunity poster
                  </div>
                </div>

                <div className="bg-white border-4 border-black rounded-[32px] p-6 shadow-[10px_10px_0px_black]">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Quick Snapshot</div>
                  {[
                    ['Category', gig.category],
                    ['Budget', gig.price],
                    ['Area', gig.location],
                    ['Status', gig.status || 'Active']
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 py-3 border-b border-slate-100 last:border-b-0">
                      <span className="text-sm font-black uppercase text-slate-400">{label}</span>
                      <span className="text-sm font-black text-right text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={!isOwner && !hasApplied ? { scale: 1.03, y: -3 } : {}}
                  whileTap={!isOwner && !hasApplied ? { scale: 0.98 } : {}}
                  disabled={isOwner || hasApplied || isApplying}
                  onClick={() => onApply(gig)}
                  className={`w-full border-4 border-black py-5 rounded-[24px] font-black text-xl uppercase italic flex items-center justify-center gap-3 transition-all ${
                    isOwner || hasApplied
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-[8px_8px_0px_#cbd5e1]'
                      : 'bg-brand-red text-white cursor-pointer shadow-[10px_10px_0px_black]'
                  }`}
                >
                  {actionLabel}
                  {!isOwner && !hasApplied && <ArrowRight size={22} />}
                </motion.button>

                {!isOwner && user && hasApplied && (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenChat}
                    className="w-full border-4 border-black py-4 rounded-[24px] font-black text-lg uppercase flex items-center justify-center gap-3 transition-all bg-white text-black shadow-[10px_10px_0px_black]"
                  >
                    <MessageSquare size={20} />
                    Open Chat
                  </motion.button>
                )}
                {!isOwner && user && !hasApplied && (
                  <div className="text-center text-sm font-bold text-slate-500 mt-2">
                    💡 Apply first to start chatting with the poster
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- UNIQUE GIGS PAGE (Ultimate Redesign) ---
const GigsPage = ({ setPage, isLoggedIn, onAuth, onLogout, currentPage, user }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionPending, setSubscriptionPending] = useState(null); // { action: 'post' | 'apply', gig? }
  const [myApplications, setMyApplications] = useState([]);
  const [applyingGigId, setApplyingGigId] = useState(null);
  const [selectedGig, setSelectedGig] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchGigs();
    fetchApplications();
  }, [user]);

  const fetchGigs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gigs')
      .select('*, user_profiles(full_name, role)')
      .order('created_at', { ascending: false });
    
    if (data) setGigs(data);
    setLoading(false);
  };

  const fetchApplications = async () => {
    if (!user) {
      setMyApplications([]);
      return;
    }
    const { data, error } = await supabase
      .from('gig_applications')
      .select('gig_id')
      .eq('applicant_id', user.id);
    if (data) {
      setMyApplications(data.map(app => app.gig_id));
    }
  };

  const submitApplication = async (gig) => {
    setApplyingGigId(gig.id);
    const { error } = await supabase
      .from('gig_applications')
      .insert([{ gig_id: gig.id, applicant_id: user.id }]);
    if (!error) {
      setMyApplications(prev => [...prev, gig.id]);
    } else {
      alert("Failed to apply: " + error.message);
    }
    setApplyingGigId(null);
  };

  const openSubscriptionGate = (action, gig = null) => {
    setSubscriptionPending({ action, gig });
    setShowSubscriptionModal(true);
  };

  const handleSubscriptionComplete = () => {
    const pending = subscriptionPending;
    setSubscriptionPending(null);
    if (!pending) return;
    if (pending.action === 'post') {
      setShowPostModal(true);
    } else if (pending.action === 'apply' && pending.gig) {
      submitApplication(pending.gig);
    }
  };

  const handleApply = async (gig) => {
    if (!isLoggedIn || !user) {
      onAuth('login');
      return;
    }
    if (!checkSubscriptionActive(user)) {
      openSubscriptionGate('apply', gig);
      return;
    }
    await submitApplication(gig);
  };

  const categories = [
    { name: 'All', icon: <LayoutGrid size={18} />, color: '#000' },
    { name: 'Tech', icon: <Code size={18} />, color: '#3b82f6' },
    { name: 'Manual', icon: <Hammer size={18} />, color: '#ef4444' },
    { name: 'Creative', icon: <Paintbrush size={18} />, color: '#a855f7' },
    { name: 'Delivery', icon: <Zap size={18} />, color: '#22c55e' }
  ];

  const filteredGigs = activeCategory === 'All' ? gigs : gigs.filter(g => g.category === activeCategory);
  const selectedGigCategory = selectedGig
    ? categories.find(c => c.name === selectedGig.category) || categories[0]
    : categories[0];

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60); // minutes
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ background: '#f8fafc', minHeight: '100vh', color: '#000', paddingBottom: '60px' }}>
      <Navbar scrolled={scrolled} setPage={setPage} isDark={false} isLoggedIn={isLoggedIn} onAuth={onAuth} onLogout={onLogout} currentPage="gigs" />

      {/* MODALS */}
      <PostGigModal isOpen={showPostModal} onClose={() => setShowPostModal(false)} user={user} onPostSuccess={fetchGigs} categories={categories} />
      <GigDetailsModal
        gig={selectedGig}
        catInfo={selectedGigCategory}
        user={user}
        myApplications={myApplications}
        applyingGigId={applyingGigId}
        onApply={handleApply}
        onOpenChat={() => window.dispatchEvent(new Event('openInboxModal'))}
        onClose={() => setSelectedGig(null)}
        formatTime={formatTime}
      />
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => { setShowSubscriptionModal(false); setSubscriptionPending(null); }}
        user={user}
        isLoggedIn={isLoggedIn}
        onAuth={onAuth}
        onPaymentSuccess={handleSubscriptionComplete}
      />

      <div className="container" style={{ paddingTop: 'clamp(118px, 28vw, 150px)' }}>

        {/* Floating Category Pill Bar + Post Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 'clamp(2rem, 8vw, 4rem)',
          position: 'sticky',
          top: 'clamp(92px, 22vw, 110px)',
          zIndex: 100
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            padding: '0.5rem',
            borderRadius: '100px',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            width: '100%',
            maxWidth: '100%',
            overflowX: 'auto'
          }}>
            <div className="nav-links no-scrollbar" style={{ display: 'flex', gap: '0.3rem', borderRight: '1px solid #eee', paddingRight: '0.5rem', marginRight: '0.2rem', background: 'transparent', border: 'none', overflowX: 'auto', flex: '1 1 auto' }}>

              {categories.map(cat => (
                <motion.button
                  key={cat.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat.name)}
                  style={{
                    padding: '0.7rem 1.2rem',
                    borderRadius: '100px',
                    background: activeCategory === cat.name ? '#000' : 'transparent',
                    color: activeCategory === cat.name ? 'white' : '#666',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s'
                  }}
                >
                  {cat.icon} {cat.name}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05, background: '#dc2626' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!isLoggedIn || !user) {
                  onAuth('login');
                } else if (!checkSubscriptionActive(user)) {
                  openSubscriptionGate('post');
                } else {
                  setShowPostModal(true);
                }
              }}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '0.7rem clamp(1rem, 4vw, 1.5rem)',
                borderRadius: '100px',
                fontWeight: '900',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: '0 5px 15px rgba(239, 68, 68, 0.2)',
                whiteSpace: 'nowrap'
              }}
            >
              <Plus size={18} /> Post a Gig
            </motion.button>
          </div>
        </div>

        {/* Dynamic Bento Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 'clamp(1rem, 4vw, 2rem)' }}>
          {loading ? (
             <div className="col-span-full text-center py-20 font-black text-2xl text-slate-400 animate-pulse">Fetching the market...</div>
          ) : filteredGigs.length === 0 ? (
             <div className="col-span-full text-center py-20 font-black text-2xl text-slate-400">No gigs found in this category. Be the first to post!</div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredGigs.map((gig, i) => {
                const catInfo = categories.find(c => c.name === gig.category) || categories[0];
                const posterName = gig.user_profiles?.full_name || 'Anonymous';
                const posterRole = gig.user_profiles?.role || 'User';

                return (
                  <motion.div
                    key={gig.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    whileHover={{ y: -10 }}
                    onClick={() => setSelectedGig(gig)}
                    style={{
                      background: 'white',
                      border: '1px solid #eee',
                      borderRadius: '32px',
                      padding: 'clamp(1.25rem, 5vw, 2rem)',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: `0 10px 40px rgba(0,0,0,0.02), inset 0 0 0 1px rgba(255,255,255,0.5)`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '280px',
                      cursor: 'pointer'
                    }}
                  >
                    {/* Category Glow */}
                    <div style={{
                      position: 'absolute',
                      top: '-50px',
                      right: '-50px',
                      width: '150px',
                      height: '150px',
                      background: catInfo.color,
                      filter: 'blur(80px)',
                      opacity: 0.1,
                      zIndex: 0
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '900',
                          background: `${catInfo.color}15`,
                          color: catInfo.color,
                          padding: '0.4rem 0.8rem',
                          borderRadius: '8px',
                          textTransform: 'uppercase'
                        }}>{gig.category}</span>
                        <div style={{ color: '#ccc', fontWeight: '800', fontSize: '0.8rem' }}>{formatTime(gig.created_at)}</div>
                      </div>

                      <h4 style={{ fontSize: '1.6rem', fontWeight: '900', margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>{gig.title}</h4>
                      
                      <div className="flex items-center gap-2 mb-3">
                         <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black uppercase text-black">{posterName.charAt(0)}</div>
                         <div className="text-xs font-bold text-slate-500">{posterName} <span className="opacity-50">• {posterRole}</span></div>
                      </div>

                      <p style={{ color: '#777', fontSize: '0.95rem', lineHeight: '1.5', fontWeight: '500' }}>{gig.description}</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1, marginTop: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: '800', marginBottom: '0.2rem' }}>OFFER</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-1px' }}>{gig.price}</div>
                        <div style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: '700', marginTop: '0.2rem' }}>📍 {gig.location}</div>
                      </div>
                      {(() => {
                        if (!user) {
                          return (
                            <motion.button
                              onClick={(e) => { e.stopPropagation(); handleApply(gig); }}
                              whileHover={{ scale: 1.05, background: '#000', color: '#fff' }}
                              style={{ background: 'transparent', border: '2.5px solid #000', padding: '0.7rem 1.5rem', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                              APPLY
                            </motion.button>
                          );
                        }
                        
                        const isOwner = user && gig.client_id === user.id;
                        const hasApplied = user && myApplications.includes(gig.id);
                        
                        if (isOwner) {
                          return (
                            <button onClick={(e) => e.stopPropagation()} style={{ background: '#f1f5f9', color: '#94a3b8', border: '2.5px solid #e2e8f0', padding: '0.7rem 1.5rem', borderRadius: '15px', fontWeight: '900', cursor: 'not-allowed' }}>
                              YOUR GIG
                            </button>
                          );
                        }

                        if (hasApplied) {
                          return (
                            <button onClick={(e) => e.stopPropagation()} style={{ background: '#10b981', color: 'white', border: '2.5px solid #10b981', padding: '0.7rem 1.5rem', borderRadius: '15px', fontWeight: '900', cursor: 'default' }}>
                              APPLIED ✓
                            </button>
                          );
                        }

                        return (
                          <motion.button
                            onClick={(e) => { e.stopPropagation(); handleApply(gig); }}
                            disabled={applyingGigId === gig.id}
                            whileHover={{ scale: 1.05, background: '#000', color: '#fff' }}
                            style={{ background: 'transparent', border: '2.5px solid #000', padding: '0.7rem 1.5rem', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s', opacity: applyingGigId === gig.id ? 0.5 : 1 }}
                          >
                            {applyingGigId === gig.id ? '...' : 'APPLY'}
                          </motion.button>
                        );
                      })()}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* FIXED BOTTOM TICKER (Bloomberg Style) */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#000',
        color: 'white',
        padding: '0.7rem 0',
        zIndex: 10001,
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', width: '200%' }}>
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
            style={{ display: 'flex', alignItems: 'center', gap: '5rem', whiteSpace: 'nowrap' }}
          >
            {[1, 2].map(i => (
              <React.Fragment key={i}>
                <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#ef4444' }}>⚡ LIVE MARKET: KITCHEN SINK IN DHARAMPETH (₹400)</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#3b82f6' }}>• NEW TECH POST: REACT DEBUGGING (₹1200)</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#22c55e' }}>• SUCCESS: LOGO GIG FILLED IN 12 MINS</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#fff' }}>• ACTIVE USERS: 142 IN INDIA</span>
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// --- COUNTUP UTILITY ---
const CountUp = ({ target, duration = 2 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(target);
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = totalMiliseconds / end;

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count}</>;
};

export const checkSubscriptionActive = (user) => {
  if (!user) return false;
  const isSubscribed = user.user_metadata?.is_subscribed;
  const expiryStr = user.user_metadata?.subscription_expiry;
  if (!isSubscribed || !expiryStr) return false;
  const expiry = new Date(expiryStr);
  return expiry > new Date();
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const VALID_COUPON = 'COCKROACH';
const TESTER_COUPON = 'TESTER2024'; // Free access for testers

const SUBSCRIPTION_PLANS = [
  { id: '3months', name: '3 Months Pro', durationMonths: 3, originalPrice: 199, discountedPrice: 59, desc: 'Perfect for starters looking to test the India market.' },
  { id: '6months', name: '6 Months Pro', durationMonths: 6, originalPrice: 299, discountedPrice: 149, desc: 'Most popular option for active local freelancers.', popular: true },
  { id: '1year', name: '1 Year Pro', durationMonths: 12, originalPrice: 999, discountedPrice: 499, desc: 'Unbeatable value for premium local service providers.' }
];

const SubscriptionPaymentSuccess = ({ compact, onDone }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 100001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ background: '#bef264', color: 'black', padding: compact ? '2rem 3rem' : '3rem 5rem', borderRadius: '32px', border: '8px solid black', fontWeight: '900', fontSize: compact ? '1.5rem' : '2.5rem', boxShadow: '20px 20px 0px #ef4444', textAlign: 'center', maxWidth: '90%' }}>
      🎉 PAYMENT SUCCESSFUL!
      <span style={{ fontSize: compact ? '1rem' : '1.5rem', color: '#334155', display: 'block', marginTop: '1rem' }}>
        Premium subscription activated. {onDone ? 'Continuing...' : 'Redirecting back to Feed...'}
      </span>
    </motion.div>
  </motion.div>
);

const SubscriptionPlansContent = ({ coupon, setCoupon, couponApplied, couponError, handleApplyCoupon, loading, handleSubscribe, compact }) => (
  <>
    <div style={{ textAlign: 'center', marginBottom: compact ? '2rem' : '4rem' }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: '#fff', color: '#ef4444', padding: '0.6rem 1.4rem', borderRadius: '100px', fontWeight: '900', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
      >
        <Zap size={16} /> PREMIUM ACCESS REQUIRED
      </motion.div>
      <h2 style={{ fontSize: compact ? 'clamp(1.75rem, 4vw, 2.5rem)' : 'clamp(2.5rem, 6vw, 5rem)', fontWeight: '900', letterSpacing: '-2px', lineHeight: '0.95', marginBottom: '1rem' }}>
        UNLIMITED GIGS.{' '}
        <span style={{ background: 'linear-gradient(90deg, #ef4444, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ZERO LIMITS.</span>
      </h2>
      <p style={{ fontSize: compact ? '1rem' : '1.2rem', color: '#64748b', fontWeight: '600', maxWidth: '550px', margin: '0 auto' }}>
        Subscribe to Bartr Pro to unlock gig postings, applications, and direct client chats.
      </p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', alignItems: 'stretch', marginBottom: '2rem' }}>
      {SUBSCRIPTION_PLANS.map((plan) => {
        const originalPrice = plan.originalPrice;
        const isTesterFree = couponApplied && coupon === TESTER_COUPON;
        const price = isTesterFree ? 0 : (couponApplied ? plan.discountedPrice : originalPrice);
        return (
          <motion.div
            key={plan.id}
            whileHover={{ y: -6 }}
            style={{
              background: 'white',
              border: '6px solid black',
              borderRadius: '32px',
              padding: compact ? '1.75rem' : '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: plan.popular ? '16px 16px 0px #ef4444' : '10px 10px 0px black',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {plan.popular && (
              <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#ef4444', color: 'white', padding: '0.35rem 0.85rem', borderRadius: '100px', fontWeight: '900', fontSize: '0.7rem', border: '2px solid black', textTransform: 'uppercase' }}>
                MOST POPULAR
              </div>
            )}
            <div>
              <h3 style={{ fontSize: compact ? '1.35rem' : '2rem', fontWeight: '950', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{plan.name}</h3>
              <p style={{ color: '#64748b', fontWeight: '700', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{plan.desc}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {isTesterFree ? (
                  <span style={{ fontSize: compact ? 'clamp(2.5rem, 14vw, 3rem)' : 'clamp(3rem, 13vw, 4.5rem)', fontWeight: '950', letterSpacing: '-3px', color: '#10b981' }}>FREE</span>
                ) : (
                  <span style={{ fontSize: compact ? 'clamp(2.5rem, 14vw, 3rem)' : 'clamp(3rem, 13vw, 4.5rem)', fontWeight: '950', letterSpacing: '-3px' }}>₹{price}</span>
                )}
                {couponApplied && !isTesterFree && (
                  <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: compact ? '1.25rem' : '2rem', fontWeight: '700' }}>₹{originalPrice}</span>
                )}
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              {['Post Unlimited Gigs', 'Apply to Unlimited Gigs', 'Direct chat with verified locals', 'Priority feed visibility'].map((feat) => (
                <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                  <div style={{ background: '#bef264', color: 'black', borderRadius: '50%', padding: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2.5px solid black' }}>
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#1e293b' }}>{feat}</span>
                </div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              onClick={() => handleSubscribe(plan)}
              style={{
                width: '100%',
                background: isTesterFree ? '#10b981' : (plan.popular ? '#ef4444' : 'black'),
                color: 'white',
                border: '4.5px solid black',
                padding: '1rem',
                borderRadius: '16px',
                fontWeight: '900',
                fontSize: '1.1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: plan.popular ? '4px 4px 0px black' : '4px 4px 0px #ef4444',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {loading ? 'Processing...' : (isTesterFree ? 'Activate Free Access' : 'Subscribe Now')}
            </motion.button>
          </motion.div>
        );
      })}
    </div>

    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
      <div style={{ background: 'white', border: '4px solid black', padding: '1.25rem 1.5rem', borderRadius: '24px', boxShadow: '8px 8px 0px black', width: '100%', maxWidth: '450px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '0.75rem' }}>Have a coupon code?</p>
        <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Enter coupon code"
            value={coupon}
            onChange={e => setCoupon(e.target.value)}
            style={{ flex: '1 1 180px', border: '3px solid black', padding: '0.75rem 1rem', borderRadius: '12px', fontWeight: '800', outline: 'none' }}
          />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" style={{ background: 'black', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', flex: '1 1 110px' }}>
            APPLY
          </motion.button>
        </form>
        {couponApplied && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#10b981', fontWeight: '900', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            {coupon === TESTER_COUPON 
              ? '🎉 Tester code applied — FREE ACCESS for all plans!' 
              : 'Code "COCKROACH" applied — prices dropped.'}
          </motion.div>
        )}
        {couponError && (
          <div style={{ color: '#ef4444', fontWeight: '900', fontSize: '0.85rem', marginTop: '0.5rem' }}>❌ {couponError}</div>
        )}
      </div>
    </div>
  </>
);

const useSubscriptionCheckout = ({ user, isLoggedIn, onAuth, onPaymentSuccess, onClose, isOpen }) => {
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const resetCouponState = () => {
    setCoupon('');
    setCouponApplied(false);
    setCouponError('');
  };

  useEffect(() => {
    if (isOpen === false) resetCouponState();
  }, [isOpen]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon === VALID_COUPON) {
      setCouponApplied(true);
      setCouponError('');
    } else if (coupon === TESTER_COUPON) {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code (case-sensitive)');
      setCouponApplied(false);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!isLoggedIn || !user) {
      onAuth('login');
      return;
    }
    setLoading(true);
    
    // Check if tester coupon is applied - bypass payment
    if (couponApplied && coupon === TESTER_COUPON) {
      try {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + plan.durationMonths);
        const { error } = await supabase.auth.updateUser({
          data: {
            is_subscribed: true,
            subscription_plan: plan.name + ' (Tester)',
            subscription_expiry: expiryDate.toISOString(),
            tester_access: true,
          },
        });
        if (error) throw error;
        const { data: { user: updatedUser } } = await supabase.auth.getUser();
        if (updatedUser) window.dispatchEvent(new CustomEvent('subscription_updated'));
        setPaymentSuccess(true);
        setTimeout(() => {
          setPaymentSuccess(false);
          resetCouponState();
          onPaymentSuccess?.();
          onClose?.();
        }, 2500);
        setLoading(false);
        return;
      } catch (err) {
        alert(err.message || 'Error activating tester subscription.');
        setLoading(false);
        return;
      }
    }
    
    try {
      const orderRes = await fetch(`${API_URL}/create-subscription-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          couponCode: couponApplied ? coupon : '',
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order.');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'Bartr.in',
        description: `${orderData.planName} Subscription`,
        image: 'https://bartr.in/world-map.png',
        handler: async function (response) {
          setLoading(true);
          try {
            const verifyRes = await fetch(`${API_URL}/verify-subscription-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment verification failed.');
            }

            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + orderData.durationMonths);
            const { error } = await supabase.auth.updateUser({
              data: {
                is_subscribed: true,
                subscription_plan: orderData.planName,
                subscription_expiry: expiryDate.toISOString(),
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
              },
            });
            if (error) throw error;
            const { data: { user: updatedUser } } = await supabase.auth.getUser();
            if (updatedUser) window.dispatchEvent(new CustomEvent('subscription_updated'));
            setPaymentSuccess(true);
            setTimeout(() => {
              setPaymentSuccess(false);
              resetCouponState();
              onPaymentSuccess?.();
              onClose?.();
            }, 2500);
          } catch (err) {
            alert(err.message || 'Error activating subscription. Contact support with Payment ID: ' + response.razorpay_payment_id);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
          contact: user.user_metadata?.phone || '',
        },
        theme: { color: '#ef4444' },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.message || 'Failed to start Razorpay checkout.');
      setLoading(false);
    }
  };

  return { coupon, setCoupon, couponApplied, couponError, loading, paymentSuccess, handleApplyCoupon, handleSubscribe };
};

// --- SUBSCRIPTION MODAL (post gig / apply gate) ---
const SubscriptionModal = ({ isOpen, onClose, user, isLoggedIn, onAuth, onPaymentSuccess }) => {
  const checkout = useSubscriptionCheckout({ user, isLoggedIn, onAuth, onPaymentSuccess, onClose, isOpen });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60" onClick={onClose}>
        <motion.div
          initial={{ scale: 0.92, y: 24 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 24 }}
          className="bg-[#f8fafc] border-[5px] sm:border-[8px] border-black rounded-[28px] sm:rounded-[40px] w-full max-w-[1100px] max-h-[90vh] overflow-y-auto p-5 sm:p-6 md:p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] sm:shadow-[16px_16px_0px_rgba(0,0,0,1)] relative"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-6 right-6 bg-white text-black p-2 rounded-xl border-[3px] border-black hover:bg-black hover:text-white transition-colors z-10">
            <X size={20} strokeWidth={3} />
          </button>
          <AnimatePresence>{checkout.paymentSuccess && <SubscriptionPaymentSuccess compact onDone />}</AnimatePresence>
          <SubscriptionPlansContent compact {...checkout} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- PREMIUM SUBSCRIPTION PAGE ---
const SubscriptionPage = ({ setPage, user, isLoggedIn, onAuth, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const checkout = useSubscriptionCheckout({
    user,
    isLoggedIn,
    onAuth,
    onPaymentSuccess: () => setPage('gigs'),
    onClose: () => setPage('gigs')
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ background: '#f8fafc', minHeight: '100vh', color: '#000', paddingBottom: '60px' }}>
      <Navbar scrolled={scrolled} setPage={setPage} isDark={false} isLoggedIn={isLoggedIn} onAuth={onAuth} onLogout={onLogout} currentPage="subscription" />
      <FloatingIconsBackground />
      <AnimatePresence>{checkout.paymentSuccess && <SubscriptionPaymentSuccess />}</AnimatePresence>
      <div className="container" style={{ paddingTop: '150px' }}>
        <SubscriptionPlansContent compact={false} {...checkout} />
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage('gigs')} style={{ background: 'white', border: '3px solid black', padding: '0.8rem 2rem', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', boxShadow: '4px 4px 0px black', fontSize: '1rem', textTransform: 'uppercase' }}>
            ← BACK TO BROWSE
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// --- STUDENT PAGE SKELETON ---
const StudentPage = ({ setPage, isLoggedIn, onAuth, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [clickedCard, setClickedCard] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const studentCards = [
    { image: '/study.gif',      title: 'Notes Marketplace',    desc: 'Buy and sell notes, PDFs and study materials.', tag: '📚', color: '#fef2f2', border: '#fecaca' },
    { image: '/assignment.gif', title: 'Assignment Help',       desc: 'Get help with assignments and practical files.', tag: '✏️', color: '#eff6ff', border: '#bfdbfe' },
    { image: '/calculator.gif', title: 'Student Rentals',       desc: 'Rent calculators, books and gadgets nearby.',   tag: '🔧', color: '#fffbeb', border: '#fde68a' },
    { image: '/workspace.gif',  title: 'Freelance Gigs',        desc: 'Find freelance work and paid projects.',        tag: '💼', color: '#f0fdf4', border: '#bbf7d0' },
    { image: '/teamwork.gif',   title: 'Project Collaboration', desc: 'Build projects with talented students.',        tag: '🤝', color: '#faf5ff', border: '#e9d5ff' },
    { image: '/growth.gif',     title: 'Skill Exchange',        desc: 'Exchange skills and grow together.',            tag: '🚀', color: '#fff1f2', border: '#fecdd3' },
  ];

  const tickerItems = [
    { icon: '🔥', text: 'Java Assignment Help Needed', status: 'LIVE' },
    { icon: '💻', text: 'React Project Posted',         status: 'NEW' },
    { icon: '📘', text: 'Semester Notes Uploaded',      status: 'TRENDING' },
    { icon: '🧮', text: 'Scientific Calculator For Rent', status: 'HOT' },
    { icon: '🚀', text: '₹800 Gig Available',            status: 'LIVE' },
    { icon: '🎨', text: 'PPT Design Needed',             status: 'NEW' },
    { icon: '📱', text: 'App Dev Partner Wanted',        status: 'LIVE' },
    { icon: '📊', text: 'Data Science Project Open',     status: 'NEW' },
  ];

  const stats = [
    { value: 10000, label: 'Students', suffix: '+', icon: '👨‍🎓' },
    { value: 500,   label: 'Colleges', suffix: '+', icon: '🏫' },
    { value: 1000,  label: 'Projects', suffix: '+', icon: '💻' },
    { value: 4.9,   label: 'Rating',   suffix: '★', icon: '⭐' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Navbar scrolled={scrolled} setPage={setPage} isDark={false} isLoggedIn={isLoggedIn} onAuth={onAuth} onLogout={onLogout} currentPage="student" />

      {/* ═══ HERO — Centered ═══ */}
      <section
        onMouseMove={e => setMousePosition({ x: e.clientX, y: e.clientY })}
        style={{
          position: 'relative', overflow: 'hidden',
          paddingTop: '120px', paddingBottom: '90px',
          background: 'linear-gradient(160deg, #fff9f9 0%, #ffffff 45%, #fff5f5 100%)',
        }}
      >
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(220,38,38,0.06) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />
        {/* Mouse-follow glow */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle 500px at ${mousePosition.x}px ${mousePosition.y}px, rgba(220,38,38,0.07), transparent)`, pointerEvents: 'none', transition: 'background 0.1s ease' }} />
        {/* Ambient orbs */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.28, 0.12] }} transition={{ duration: 8, repeat: Infinity }}
          style={{ position: 'absolute', top: -120, right: -120, width: 550, height: 550, background: 'rgba(220,38,38,0.15)', borderRadius: '50%', filter: 'blur(130px)', pointerEvents: 'none' }} />
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.2, 0.08] }} transition={{ duration: 11, repeat: Infinity }}
          style={{ position: 'absolute', bottom: -100, left: -100, width: 460, height: 460, background: 'rgba(220,38,38,0.1)', borderRadius: '50%', filter: 'blur(110px)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

          {/* Floating illustration */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: [0, -18, 0] }}
            transition={{ opacity: { duration: 0.8 }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
            style={{ position: 'relative', marginBottom: '36px' }}
          >
            <div style={{ position: 'absolute', inset: 0, margin: 'auto', width: 280, height: 280, background: 'radial-gradient(circle, rgba(220,38,38,0.14) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
            <img
              src="/bartrstudent.png" alt="Student"
              style={{ height: '280px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 24px 48px rgba(220,38,38,0.22))', position: 'relative', zIndex: 1 }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          </motion.div>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#dcfce7', color: '#15803d', padding: '7px 18px', borderRadius: '100px', fontWeight: 800, fontSize: '0.82rem', marginBottom: '22px', border: '1.5px solid #86efac', letterSpacing: '0.01em' }}>
            🚀 India's #1 Student Ecosystem
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.15 }}
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5.2rem)', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-4px', color: '#0f172a', maxWidth: '820px', marginBottom: '18px' }}>
            Build Your{' '}
            <span style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #f87171 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              <TypeAnimation
                sequence={['Future 🚀', 2200, 'Career 💼', 2200, 'Projects 💻', 2200, 'Network 🌎', 2200]}
                wrapper="span" speed={55} repeat={Infinity}
              />
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            style={{ fontSize: '1.15rem', color: '#64748b', lineHeight: 1.75, maxWidth: '600px', marginBottom: '38px', fontWeight: 450 }}>
            Find study notes · Earn through gigs · Meet project partners · Build your student network — everything in one place made for Indian students.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '56px' }}>
            <motion.button onClick={() => setClickedCard({ title: 'Post Your Need', desc: 'Create a new request in the ecosystem.', image: '/study.gif' })} whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.96 }}
              style={{ padding: '15px 32px', borderRadius: '14px', background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: '#fff', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 10px 28px -6px rgba(220,38,38,0.45)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🚀 Post Your Need
            </motion.button>
            <motion.button onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })} whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.96 }}
              style={{ padding: '15px 32px', borderRadius: '14px', background: '#ffffff', color: '#dc2626', fontWeight: 800, fontSize: '1rem', border: '2px solid #fecaca', cursor: 'pointer', boxShadow: '0 4px 16px -4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✨ Explore Services
              <motion.span animate={{ x: [0, 6, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>→</motion.span>
            </motion.button>
          </motion.div>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ display: 'flex', gap: '0', justifyContent: 'center', flexWrap: 'wrap', background: '#fff', border: '1.5px solid #fef2f2', borderRadius: '20px', padding: '20px 8px', boxShadow: '0 4px 24px -6px rgba(0,0,0,0.07)', maxWidth: '600px', width: '100%' }}>
            {[
              { value: 10000, label: 'Students', icon: '👨‍🎓', suffix: '+' },
              { value: 500,   label: 'Colleges', icon: '🏫',   suffix: '+' },
              { value: 1000,  label: 'Projects',  icon: '💻',   suffix: '+' },
              { value: null,  label: 'Rating',    icon: '⭐',   display: '4.9★' },
            ].map((s, i, arr) => (
              <div key={i} style={{ flex: '1', minWidth: '100px', textAlign: 'center', padding: '0 16px', borderRight: i < arr.length - 1 ? '1px solid #fef2f2' : 'none' }}>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', lineHeight: 1, letterSpacing: '-1px' }}>
                  {s.display ? s.display : <><CountUp target={s.value} duration={2.5} />{s.suffix}</>}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: '5px' }}>{s.icon} {s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* ── LIVE TICKER STRIP ── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(90deg, #1e0a0a 0%, #3b0a0a 50%, #1e0a0a 100%)', padding: '18px 0', borderTop: '1px solid rgba(239,68,68,0.2)', borderBottom: '1px solid rgba(239,68,68,0.2)', marginBottom: '80px' }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 80, background: 'rgba(239,68,68,0.15)', filter: 'blur(60px)', borderRadius: '50%', pointerEvents: 'none' }} />
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex', gap: '20px', width: 'max-content' }}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 18px', background: 'rgba(255,255,255,0.06)', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap', minWidth: '260px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>{item.text}</div>
                <div style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 600 }}>● {item.status}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── UNIQUE SERVICES BENTO GRID ── */}
      <section id="services" style={{ paddingBottom: '120px', position: 'relative', background: '#fff' }}>
        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 100, right: -100, width: 500, height: 500, background: 'radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1200px' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fef2f2', color: '#dc2626', padding: '8px 18px', borderRadius: '100px', fontWeight: 800, fontSize: '0.85rem', marginBottom: '16px', border: '1.5px solid #fecaca' }}>
              ✨ Student Ecosystem
            </div>
            <h2 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 900, letterSpacing: '-2px', color: '#0f172a', marginBottom: '16px' }}>
              Explore Student Services
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7, fontWeight: 500 }}>
              Everything you need to thrive — notes, gigs, rentals, and collaborations mapped to your campus.
            </p>
          </div>

          {/* Bento Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gridAutoRows: 'auto',
            gap: '30px'
          }}>
            {studentCards.map((card, i) => {
              // Create an asymmetric feel by making the 1st and 6th cards span wider on large screens (if grid allows, though auto-fit might wrap them. We'll use a dynamic style for larger screens if possible, or just uniquely style them).
              // Since inline media queries are hard, we'll give them a consistently premium layout with the image on the right/top depending on the card.
              const isLarge = i === 0 || i === 3; 

              return (
                <motion.div
                  key={i}
                  onClick={() => setClickedCard(card)}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ y: -10 }}
                  style={{
                    position: 'relative',
                    background: '#ffffff',
                    borderRadius: '32px',
                    padding: '36px',
                    border: '1px solid rgba(220,38,38,0.1)',
                    boxShadow: '0 20px 40px -12px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '340px'
                  }}
                >
                  {/* Subtle top gradient accent */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: `linear-gradient(90deg, ${card.border}, #dc2626)` }} />
                  
                  {/* Glowing background blob behind image */}
                  <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: card.color, borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }} />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', color: '#475569', padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid #e2e8f0' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                        LIVE NOW
                      </div>
                      <div style={{ width: 80, height: 80, background: '#fff', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 24px -8px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9' }}>
                        <img src={card.image} alt={card.title} style={{ width: '56px', height: '56px', objectFit: 'contain' }} onError={(e) => { e.target.style.display='none'; e.target.parentNode.innerHTML=`<span style="font-size:2rem">${card.tag}</span>` }} />
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginBottom: '12px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
                      {card.title}
                    </h3>
                    <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '1.05rem', fontWeight: 500, marginBottom: '32px' }}>
                      {card.desc}
                    </p>
                  </div>

                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                      Trending
                    </span>
                    <motion.div whileHover={{ x: 5 }} style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #dc2626, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 16px -4px rgba(220,38,38,0.4)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-b from-[#fff8f8] via-[#fff3f3] to-[#fffafa]">
        <div className="absolute top-[0] right-[-150px] w-[400px] h-[400px] bg-red-100/30 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-100px] left-[-150px] w-[350px] h-[350px] bg-red-50/40 rounded-full blur-[120px]" />

        <motion.img src="/laptop-work.gif" alt="student"
          initial={{ opacity:0, x:100 }} whileInView={{ opacity:.65, x:0 }}
          animate={{ y:[0,-15,0] }}
          transition={{ opacity:{duration:1}, x:{duration:1}, y:{duration:5,repeat:Infinity,ease:'easeInOut'} }}
          className="hidden lg:block absolute right-[-60px] bottom-[0] w-[420px] pointer-events-none mix-blend-multiply brightness-110 saturate-110 opacity-75 blur-[0.2px] drop-shadow-[0_25px_50px_rgba(239,68,68,.06)]" />

        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-100/70 backdrop-blur-md text-red-600 font-bold mb-6">✨ Join Bartr Community</div>

          <motion.h2 initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} transition={{ duration:.8 }}
            className="text-5xl md:text-6xl font-black tracking-[-3px] text-gray-900">
            Ready To Build Your<br />
            <span className="bg-gradient-to-r from-red-700 via-red-500 to-red-400 bg-clip-text text-transparent">Student Journey?</span>
          </motion.h2>

          <p className="mt-6 text-slate-500 max-w-[700px] mx-auto leading-8 text-lg">
            Join students sharing 📚 notes, completing 💻 projects, finding 🏠 rentals and building 🚀 opportunities together.
          </p>

          <div className="flex justify-center gap-4 flex-wrap mt-10">
            {['👨‍🎓 2K+ Students','💼 500+ Gigs','📚 1K+ Notes','⭐ 4.9 Rating'].map((item,index) => (
              <div key={index} className="px-4 py-2 rounded-full bg-white border border-red-100 text-gray-700 font-medium shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-500">{item}</div>
            ))}
          </div>

          <div className="mt-12">
            <motion.button 
              onClick={() => setClickedCard({ title: 'Join the Ecosystem', desc: 'Bartr student community is launching soon. Get ready to connect, earn and build!', image: '/study.gif', tag: '🚀' })}
              whileHover={{ scale:1.05, y:-4 }} whileTap={{ scale:.95 }}
              className="group px-10 py-4 rounded-[20px] bg-gradient-to-r from-red-600 to-red-500 font-bold text-white shadow-[0_15px_35px_rgba(239,68,68,.12)]">
              <div className="flex items-center gap-3">
                🚀 Join Ecosystem (Coming Soon)
                <motion.span animate={{ x:[0,8,0] }} transition={{ duration:1, repeat:Infinity }}>→</motion.span>
              </div>
            </motion.button>
          </div>
        </div>
      </section>
      {/* MODAL / POPUP OVERLAY */}
      {clickedCard && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ position: 'relative', width: '100%', maxWidth: '440px', background: '#fff', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            
            <button onClick={() => setClickedCard(null)} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, width: '36px', height: '36px', borderRadius: '50%', background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '1.2rem' }}>
              ✕
            </button>

            <div style={{ padding: '40px 32px', textAlign: 'center', background: 'linear-gradient(135deg, #fff 0%, #fef2f2 100%)' }}>
              <div style={{ width: '90px', height: '90px', margin: '0 auto 24px', background: '#fff', borderRadius: '24px', boxShadow: '0 12px 24px -8px rgba(0,0,0,0.1)', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={clickedCard.image} alt={clickedCard.title} style={{ width: '56px', height: '56px', objectFit: 'contain' }} onError={(e) => { e.target.style.display='none'; e.target.parentNode.innerHTML=`<span style="font-size:3rem">${clickedCard.tag || '🚀'}</span>` }} />
              </div>
              
              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '12px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>{clickedCard.title}</h3>
              <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '28px' }}>{clickedCard.desc}</p>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: '#fef2f2', borderRadius: '100px', marginBottom: '32px', border: '1.5px solid #fecaca' }}>
                <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px' }}>
                  <span style={{ position: 'absolute', width: '100%', height: '100%', background: '#f87171', borderRadius: '50%', opacity: 0.7 }} className="animate-ping" />
                  <span style={{ position: 'relative', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }} />
                </span>
                <span style={{ color: '#dc2626', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Coming Soon</span>
              </div>
              
              <motion.button onClick={() => setClickedCard(null)} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#0f172a', color: '#fff', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(15,23,42,0.3)' }}>
                Got it!
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

// --- TRI SCORE PAGE (Crystal Light Redesign) ---
const TRIScorePage = ({ setPage, isLoggedIn, onAuth, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const kpis = [
    { title: 'Jobs Completed', value: 'Consistency', icon: <Activity size={32} />, color: '#6366f1', desc: 'Experience and consistency in delivering work.' },
    { title: 'Average Rating', value: 'Quality', icon: <Star size={32} />, color: '#f59e0b', desc: 'Service quality based on client feedback.' },
    { title: 'Response Time', value: 'Engagement', icon: <Clock size={32} />, color: '#10b981', desc: 'Engagement speed and reliability.' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ background: '#f8fafc', minHeight: '100vh', color: '#000', overflow: 'hidden', position: 'relative' }}>

      {/* ATMOSPHERIC BACKGROUND ANIMATION */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {/* Diagonal Ghost Marquees */}
        <div style={{ position: 'absolute', top: 0, left: '-10%', width: '120%', height: '120%', zIndex: 0 }}>
          {/* Top-Left to Bottom-Right Marquee */}
          <div style={{ position: 'absolute', top: '20%', left: 0, width: '150%', transform: 'rotate(-15deg)', opacity: 0.04 }}>
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
              className="whitespace-nowrap font-black text-[12rem] tracking-tighter"
            >
              TRUST • VELOCITY • ELITE • SCORE • REPUTATION • TRUST • VELOCITY • ELITE • SCORE • REPUTATION
            </motion.div>
          </div>

          {/* Bottom-Left to Top-Right Marquee */}
          <div style={{ position: 'absolute', top: '50%', left: '-25%', width: '150%', transform: 'rotate(15deg)', opacity: 0.03 }}>
            <motion.div
              animate={{ x: [-1000, 0] }}
              transition={{ repeat: Infinity, duration: 50, ease: 'linear' }}
              className="whitespace-nowrap font-black text-[10rem] tracking-tighter"
            >
              VERIFIED • INDIA • BARTR • PERFORMANCE • ELITE • VERIFIED • INDIA • BARTR • PERFORMANCE
            </motion.div>
          </div>
        </div>

        {/* Floating Glow Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [Math.random() * 1000, Math.random() * 1000],
              x: [Math.random() * 1000, Math.random() * 1000],
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 25 + Math.random() * 25,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(99,102,241,0.08)' : 'rgba(239,68,68,0.05)'} 0%, transparent 70%)`,
              borderRadius: '50%',
              top: 0,
              left: 0,
              willChange: 'transform, opacity'
            }}
          />
        ))}

        {/* Drifting Geometric Shapes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`geo-${i}`}
            animate={{
              rotate: [0, 360],
              y: [-100, 1000],
              x: [i * 200, i * 200 + 100]
            }}
            transition={{
              duration: 40 + Math.random() * 40,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: '150px',
              height: '150px',
              border: '1px solid rgba(0,0,0,0.03)',
              borderRadius: i % 2 === 0 ? '20%' : '50%',
              top: '-10%',
              left: 0
            }}
          />
        ))}
      </div>

      <Navbar scrolled={scrolled} setPage={setPage} isDark={false} isLoggedIn={isLoggedIn} onAuth={onAuth} onLogout={onLogout} currentPage="tri-score" />

      <div className="container" style={{ paddingTop: '150px', paddingBottom: '10rem', position: 'relative', zIndex: 1 }}>

        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: '#fff', color: '#6366f1', padding: '0.6rem 1.4rem', borderRadius: '100px', fontWeight: '900', fontSize: '0.85rem', marginBottom: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
          >
            <Award size={16} /> RELIABILITY INDEX v2.4
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, filter: 'blur(10px)', y: 30 }}
            whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', fontWeight: '900', letterSpacing: '-5px', lineHeight: '0.85', marginBottom: '2rem' }}
          >
            YOUR TRUST. <br /> <span style={{ background: 'linear-gradient(90deg, #6366f1, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>QUANTIFIED.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ fontSize: '1.4rem', color: '#64748b', fontWeight: '600', maxWidth: '650px', margin: '0 auto' }}
          >
            The TRI Score is a live mathematical reflection of your professional performance on Bartr.in.
          </motion.p>
        </div>

        {/* The Liquid Gauge Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start mb-24 md:mb-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-crystal rounded-[48px] p-10 md:p-16 text-center relative group"
          >
            <div className="relative w-[220px] md:w-[280px] h-[220px] md:h-[280px] mx-auto mb-10 md:mb-12">
              {/* Outer Glow Effect */}
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl -z-10"
              />

              <svg width="100%" height="100%" viewBox="0 0 100 100" className="drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="46" fill="none" stroke="url(#pastelGradient)" strokeWidth="8" strokeDasharray="289"
                  initial={{ strokeDashoffset: 289 }}
                  whileInView={{ strokeDashoffset: 289 - (289 * 0.85) }}
                  transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="pastelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col justify-center items-center">
                <div className="text-6xl md:text-[6rem] font-black tracking-tighter leading-none flex items-baseline">
                  <CountUp target={850} duration={2} />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-xs md:text-sm font-black text-indigo-600 tracking-[0.3em] mt-3 uppercase italic"
                >
                  MASTER
                </motion.div>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-black text-sm border-2 border-black/10 shadow-neo"
            >
              <Activity size={16} className="text-emerald-400 animate-pulse" /> TOP 1.2% NATIONWIDE
            </motion.div>
          </motion.div>

          <div className="flex flex-col gap-4">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.title}
                initial={{ x: 30, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 10 }}
                className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-crystal hover:shadow-premium hover:-translate-y-1 transition-all rounded-3xl p-6 md:p-8 flex items-center gap-6 cursor-pointer group"
              >
                <div
                  className="p-4 rounded-2xl shadow-sm transition-all group-hover:scale-110"
                  style={{ color: kpi.color, background: 'white' }}
                >
                  {kpi.icon}
                </div>
                <div>
                  <h4 className="text-lg md:text-xl font-black text-slate-800 leading-none mb-1">{kpi.title}</h4>
                  <p className="text-sm md:text-base text-slate-500 font-bold leading-tight">{kpi.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* The Algorithm Blueprint v3 (High Contrast Split) */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '1.5rem' }}>02 / THE ARCHITECTURE</div>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '900', letterSpacing: '-3px', marginBottom: '4rem' }}>The Science of <span style={{ color: '#ef4444' }}>Reputation.</span></h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">

          {/* LEFT: The Dark Engine */}
          <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            className="bg-slate-950 rounded-[32px] shadow-2xl overflow-hidden border border-slate-800"
          >
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
              </div>
              <div className="text-xs text-slate-500 font-mono font-bold tracking-widest uppercase">rep_engine_v3.py</div>
            </div>
            <div className="p-8 md:p-12 font-mono text-base md:text-lg leading-relaxed text-slate-100">
              <div className="text-slate-600 mb-4 tracking-tighter"># CORE REPUTATION ALGORITHM</div>
              <div><span className="text-rose-500">def</span> <span className="text-indigo-400">calculate_tri</span>(data):</div>
              <div className="pl-6 border-l border-slate-800 ml-1 mt-2 space-y-1">
                <div>score = (</div>
                <div className="pl-6">data.jobs <span className="text-rose-500">*</span> <span className="text-amber-500">0.45</span> +</div>
                <div className="pl-6">data.rating <span className="text-rose-500">*</span> <span className="text-amber-500">0.35</span> +</div>
                <div className="pl-6">data.response <span className="text-rose-500">*</span> <span className="text-amber-500">0.20</span></div>
                <div>)</div>
              </div>
              <div className="mt-4"><span className="text-rose-500">return</span> round(score, <span className="text-amber-500">2</span>)</div>

              <div className="mt-12 pt-6 border-t border-slate-900">
                <div className="text-emerald-400 flex items-center gap-3 text-sm font-bold tracking-wider">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse" />
                  REPUTATION SYSTEMS ONLINE // VERIFIED
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: The Explanation */}
          <div className="flex flex-col gap-4">
            {[
              { icon: <Activity className="text-indigo-500" />, title: '45% / Output Velocity', text: 'We prioritize completed jobs above all. It proves you can start and finish a task reliably.' },
              { icon: <Star className="text-amber-500" />, title: '35% / Quality Index', text: 'Sentiment analysis of reviews and star ratings ensures that speed never sacrifices excellence.' },
              { icon: <Clock className="text-emerald-500" />, title: '20% / Pulse Speed', text: 'Your response time to inquiries. On Bartr, speed is trust. Fast engagement leads to higher retention.' }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/50 shadow-crystal hover:shadow-premium transition-all"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-white p-3 rounded-xl shadow-sm">{item.icon}</div>
                  <h4 className="font-black text-lg text-slate-800 tracking-tight">{item.title}</h4>
                </div>
                <p className="text-slate-500 leading-relaxed font-bold text-sm md:text-base">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

// --- SARCASTIC CAREERS PAGE ---
const CareersPage = ({ setPage, isLoggedIn, onAuth, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on mount
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4 }}
      className="min-h-screen" style={{ background: '#f8fafc', position: 'relative', overflow: 'hidden' }}
    >
      <Navbar scrolled={scrolled} setPage={setPage} isDark={false} isLoggedIn={isLoggedIn} onAuth={onAuth} onLogout={onLogout} currentPage="careers" />

      {/* GenZ Marquee Background & Neo-brutalist Orbs */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.05, pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', top: '15%', left: '-20%', width: '150%', opacity: 0.05, pointerEvents: 'none', transform: 'rotate(-5deg)', zIndex: 0 }}>
        <motion.div animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 25, ease: 'linear' }} style={{ whiteSpace: 'nowrap', fontSize: '15rem', fontWeight: 900, lineHeight: 1 }}>
          WE OUT HERE HIRING • NO CAP • WE OUT HERE HIRING • NO CAP • WE OUT HERE HIRING • NO CAP
        </motion.div>
      </div>
      <div style={{ position: 'absolute', top: '65%', left: '-20%', width: '150%', opacity: 0.05, pointerEvents: 'none', transform: 'rotate(5deg)', zIndex: 0 }}>
        <motion.div animate={{ x: [-1000, 0] }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }} style={{ whiteSpace: 'nowrap', fontSize: '15rem', fontWeight: 900, lineHeight: 1 }}>
          DOUBT WE'LL RESPOND • DOUBT WE'LL RESPOND • DOUBT WE'LL RESPOND • DOUBT WE'LL RESPOND
        </motion.div>
      </div>

      {/* Floating Emojis */}
      <motion.div animate={{ y: [0, -40, 0], rotate: [0, 20, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} style={{ position: 'absolute', top: '20%', left: '15%', fontSize: '5rem', zIndex: 0 }}>🔥</motion.div>
      <motion.div animate={{ y: [0, 50, 0], rotate: [0, -30, 30, 0], scale: [1, 1.2, 1] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} style={{ position: 'absolute', top: '40%', right: '15%', fontSize: '5rem', zIndex: 0 }}>💀</motion.div>
      <motion.div animate={{ y: [0, -30, 0], scale: [1, 1.5, 1], rotate: [0, 45, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 2 }} style={{ position: 'absolute', bottom: '25%', left: '25%', fontSize: '5rem', zIndex: 0 }}>💸</motion.div>

      <section className="hero" style={{ minHeight: '50vh', paddingTop: '10rem', background: 'transparent' }}>
        <div className="container mx-auto px-4" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div variants={staggerCards} initial="hidden" animate="visible">
            <motion.div variants={fadeInUp} whileHover={{ rotate: [-2, 2, -2], scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }} style={{ display: 'inline-block', background: '#bef264', color: 'black', border: '3px solid black', boxShadow: '4px 4px 0 rgba(0,0,0,1)', padding: '0.75rem 2rem', borderRadius: '999px', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '2rem', cursor: 'pointer' }}>
              We're Hiring (Desperately)
            </motion.div>
            <motion.h1 variants={fadeInUp} style={{ fontSize: 'clamp(3rem, 13vw, 8rem)', lineHeight: 0.9, margin: '2rem 0', color: 'black', letterSpacing: '-0.06em', fontWeight: '900', textTransform: 'uppercase' }}>
              Join our cult<br />
              <span style={{ color: '#ef4444', textShadow: '6px 6px 0px rgba(0,0,0,0.1)' }}>erm, team.</span>
            </motion.h1>
            <motion.p variants={fadeInUp} style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)', color: '#334155', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6, fontWeight: '500', border: '3px solid black', padding: 'clamp(1rem, 4vw, 1.5rem)', borderRadius: '16px', background: 'white', boxShadow: '8px 8px 0px black' }}>
              We're disrupting the hyperlocal market by using enough buzzwords to secure our Series A. We need people who thrive in absolute chaos, write zero documentation, and exist exclusively on iced coffee.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="section" style={{ padding: '6rem 0' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(2.2rem, 10vw, 3.5rem)', marginBottom: '4rem', fontWeight: '900', textAlign: 'center', letterSpacing: '-0.03em', textTransform: 'uppercase', color: 'black' }}>Our "Industry-Leading" Perks</h2>
          <div className="grid-3" style={{ gap: '2rem' }}>
            <motion.div
              whileHover={{ y: -15, scale: 1.05, rotate: -3, boxShadow: '16px 16px 0px black' }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="modern-card" style={{ background: '#fca5a5', border: '4px solid black', boxShadow: '8px 8px 0px black', borderRadius: '16px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', background: 'white', width: '100px', height: '100px', border: '3px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', boxShadow: '4px 4px 0px black' }}>💸</div>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '2rem', fontWeight: '900', color: 'black' }}>Competitive Salary</h3>
              <p style={{ color: 'black', fontSize: '1.25rem', lineHeight: 1.5, fontWeight: '500' }}>We pay just enough so you can't quite afford to quit, but definitely not enough to buy a house anytime soon.</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -15, scale: 1.05, rotate: 3, boxShadow: '16px 16px 0px black' }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="modern-card" style={{ background: '#93c5fd', border: '4px solid black', boxShadow: '8px 8px 0px black', borderRadius: '16px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', background: 'white', width: '100px', height: '100px', border: '3px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', boxShadow: '4px 4px 0px black' }}>🏖️</div>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '2rem', fontWeight: '900', color: 'black' }}>Unlimited PTO</h3>
              <p style={{ color: 'black', fontSize: '1.25rem', lineHeight: 1.5, fontWeight: '500' }}>It's a psychological trap! We offer it knowing no one has ever taken a single day off without feeling immense guilt.</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -15, scale: 1.05, rotate: -2, boxShadow: '16px 16px 0px black' }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="modern-card" style={{ background: '#fcd34d', border: '4px solid black', boxShadow: '8px 8px 0px black', borderRadius: '16px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', background: 'white', width: '100px', height: '100px', border: '3px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', boxShadow: '4px 4px 0px black' }}>🏓</div>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '2rem', fontWeight: '900', color: 'black' }}>Mandatory Fun</h3>
              <p style={{ color: 'black', fontSize: '1.25rem', lineHeight: 1.5, fontWeight: '500' }}>We bought a ping pong table to pretend we have culture. Thursday evening awkward social events are non-negotiable.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section" style={{ padding: '2rem 0 10rem' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(2.2rem, 10vw, 3.5rem)', marginBottom: '4rem', color: 'black', fontWeight: '900', letterSpacing: '-0.03em', textTransform: 'uppercase' }}>Open Requisitions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            <motion.div
              whileHover={{ scale: 1.03, x: 10, y: -5, boxShadow: '16px 16px 0px black' }}
              transition={{ type: 'spring', stiffness: 300, damping: 12 }}
              style={{ background: '#a7f3d0', border: '4px solid black', padding: 'clamp(1.25rem, 5vw, 2.5rem)', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', cursor: 'pointer', boxShadow: '8px 8px 0px black', position: 'relative', overflow: 'hidden' }}>
              <div>
                <h3 style={{ fontSize: 'clamp(1.5rem, 7vw, 2.25rem)', marginBottom: '0.75rem', color: 'black', fontWeight: '900' }}>Senior Stack Overflow Specialist <br /><span style={{ fontSize: '1.125rem', color: '#1e293b', fontWeight: 'bold' }}>aka Frontend Developer</span></h3>
                <p style={{ color: 'black', margin: 0, fontSize: 'clamp(1rem, 4vw, 1.25rem)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontWeight: '600' }}><MapPin size={24} color="black" /> Remote • Must know how to center a div without crying.</p>
              </div>
              <motion.div whileHover={{ rotate: 45, scale: 1.2 }} transition={{ type: 'spring' }} style={{ background: 'white', padding: '1.25rem', border: '3px solid black', borderRadius: '50%', color: 'black', boxShadow: '4px 4px 0px black' }}>
                <ArrowRight size={36} strokeWidth={3} />
              </motion.div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, x: -10, y: -5, boxShadow: '-16px 16px 0px black' }}
              transition={{ type: 'spring', stiffness: 300, damping: 12 }}
              style={{ background: '#ddd6fe', border: '4px solid black', padding: 'clamp(1.25rem, 5vw, 2.5rem)', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', cursor: 'pointer', boxShadow: '-8px 8px 0px black', position: 'relative', overflow: 'hidden' }}>
              <div>
                <h3 style={{ fontSize: 'clamp(1.5rem, 7vw, 2.25rem)', marginBottom: '0.75rem', color: 'black', fontWeight: '900' }}>Professional Scope Creeper <br /><span style={{ fontSize: '1.125rem', color: '#1e293b', fontWeight: 'bold' }}>aka Product Manager</span></h3>
                <p style={{ color: 'black', margin: 0, fontSize: 'clamp(1rem, 4vw, 1.25rem)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontWeight: '600' }}><MapPin size={24} color="black" /> India HQ • Expertise in scheduling meetings that could've been emails.</p>
              </div>
              <motion.div whileHover={{ rotate: -45, scale: 1.2 }} transition={{ type: 'spring' }} style={{ background: 'white', padding: '1.25rem', border: '3px solid black', borderRadius: '50%', color: 'black', boxShadow: '-4px 4px 0px black' }}>
                <ArrowRight size={36} strokeWidth={3} />
              </motion.div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, x: 10, y: -5, boxShadow: '16px 16px 0px black' }}
              transition={{ type: 'spring', stiffness: 300, damping: 12 }}
              style={{ background: '#fbcfe8', border: '4px solid black', padding: 'clamp(1.25rem, 5vw, 2.5rem)', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', cursor: 'pointer', boxShadow: '8px 8px 0px black', position: 'relative', overflow: 'hidden' }}>
              <div>
                <h3 style={{ fontSize: 'clamp(1.5rem, 7vw, 2.25rem)', marginBottom: '0.75rem', color: 'black', fontWeight: '900' }}>Ghost Protocol Architect <br /><span style={{ fontSize: '1.125rem', color: '#1e293b', fontWeight: 'bold' }}>aka Backend Engineer</span></h3>
                <p style={{ color: 'black', margin: 0, fontSize: 'clamp(1rem, 4vw, 1.25rem)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontWeight: '600' }}><MapPin size={24} color="black" /> Remote • Building APIs nobody asked for and blaming the frontend for latency.</p>
              </div>
              <motion.div whileHover={{ rotate: 135, scale: 1.2 }} transition={{ type: 'spring' }} style={{ background: 'white', padding: '1.25rem', border: '3px solid black', borderRadius: '50%', color: 'black', boxShadow: '4px 4px 0px black' }}>
                <ArrowRight size={36} strokeWidth={3} />
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>
    </motion.div>
  );
};

// --- NEO-BRUTALIST EVENTS PAGE ---
const EventsPage = ({ setPage, isLoggedIn, onAuth, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRegisterClick = () => {
    if (!isLoggedIn) {
      onAuth('login');
    } else {
      setPage('pitch-fire-register');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4 }}
      style={{ background: '#f8fafc', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}
    >
      <Navbar scrolled={scrolled} setPage={setPage} isDark={false} isLoggedIn={isLoggedIn} onAuth={onAuth} onLogout={onLogout} currentPage="events" />

      {/* GenZ Marquee Background & Neo-brutalist Patterns */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(#10b981 2px, transparent 2px)', backgroundSize: '60px 60px', opacity: 0.1, pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', top: '15%', left: '-20%', width: '150%', opacity: 0.05, pointerEvents: 'none', transform: 'rotate(-5deg)', zIndex: 0 }}>
        <motion.div animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 25, ease: 'linear' }} style={{ whiteSpace: 'nowrap', fontSize: '15rem', fontWeight: 900, lineHeight: 1 }}>
          FOMO IS REAL • BE THERE OR BE SQUARE • FOMO IS REAL • BE THERE OR BE SQUARE
        </motion.div>
      </div>
      <div style={{ position: 'absolute', top: '75%', left: '-20%', width: '150%', opacity: 0.05, pointerEvents: 'none', transform: 'rotate(5deg)', zIndex: 0 }}>
        <motion.div animate={{ x: [-1000, 0] }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }} style={{ whiteSpace: 'nowrap', fontSize: '15rem', fontWeight: 900, lineHeight: 1 }}>
          EXCLUSIVE DROPS • VIP ONLY • EXCLUSIVE DROPS • VIP ONLY • EXCLUSIVE DROPS
        </motion.div>
      </div>

      {/* Floating Emojis */}
      <motion.div animate={{ y: [0, -40, 0], rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} style={{ position: 'absolute', top: '20%', left: '10%', fontSize: '6rem', zIndex: 0 }}>📍</motion.div>
      <motion.div animate={{ y: [0, 50, 0], rotate: [0, -30, 30, 0], scale: [1, 1.3, 1] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} style={{ position: 'absolute', top: '50%', right: '10%', fontSize: '6rem', zIndex: 0 }}>🎫</motion.div>
      <motion.div animate={{ y: [0, -30, 0], scale: [1, 1.5, 1], rotate: [0, 45, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 2 }} style={{ position: 'absolute', bottom: '15%', left: '20%', fontSize: '6rem', zIndex: 0 }}>🍻</motion.div>

      <section className="hero" style={{ minHeight: '40vh', paddingTop: '10rem', background: 'transparent' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div variants={staggerCards} initial="hidden" animate="visible">
            <motion.div variants={fadeInUp} whileHover={{ rotate: [-2, 2, -2], scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }} style={{ display: 'inline-block', background: '#34d399', color: 'black', border: '3px solid black', boxShadow: '4px 4px 0 rgba(0,0,0,1)', padding: '0.75rem 2rem', borderRadius: '999px', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '2rem', cursor: 'pointer', textTransform: 'uppercase' }}>
              Happening Now
            </motion.div>
            <motion.h1 variants={fadeInUp} style={{ fontSize: 'clamp(3rem, 13vw, 8rem)', lineHeight: 0.9, margin: '2rem 0', color: 'black', letterSpacing: '-0.06em', fontWeight: '900', textTransform: 'uppercase' }}>
              Local <br />
              <span style={{ color: '#10b981', textShadow: '6px 6px 0px rgba(0,0,0,0.1)' }}>Fixtures.</span>
            </motion.h1>
            <motion.p variants={fadeInUp} style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)', color: '#334155', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6, fontWeight: '500', border: '3px solid black', padding: 'clamp(1rem, 4vw, 1.5rem)', borderRadius: '16px', background: 'white', boxShadow: '8px 8px 0px black' }}>
              Skip the algorithm. Find out where people actually exist in real life. Underground meetups, founder coffees, and warehouse raves.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="section" style={{ padding: '4rem 0 10rem' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '3rem' }}>

          {/* EXCLUSIVE PITCH FIRE EVENT */}
          <motion.div
            whileHover={{ scale: 1.02, x: 10, y: -10, boxShadow: '30px 30px 0px #10b981' }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            style={{ background: '#fcd34d', border: '6px solid black', borderRadius: '32px', display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer', boxShadow: 'clamp(8px, 3vw, 20px) clamp(8px, 3vw, 20px) 0px black', minHeight: 'clamp(0px, 90vw, 600px)' }}>

            <div style={{ background: 'black', color: 'white', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#ef4444', width: '15px', height: '15px', borderRadius: '50%', boxShadow: '0 0 15px #ef4444' }}></div>
                <span style={{ fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>LIVE EVENT</span>
              </div>
              <div style={{ fontWeight: '900' }}>Coming Soon</div>
            </div>

            <div style={{ display: 'flex', flex: 1, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 320px', padding: 'clamp(1.5rem, 7vw, 4rem)', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '6px solid black', minWidth: 0 }}>
                <div style={{ background: 'white', color: 'black', border: '4px solid black', padding: '0.5rem 1.5rem', borderRadius: '12px', fontWeight: '900', textTransform: 'uppercase', width: 'fit-content', marginBottom: '2rem', boxShadow: '6px 6px 0px black', fontSize: '1.25rem' }}>🔥 THE MAIN STAGE</div>

                <h3 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', marginBottom: '1.5rem', color: 'black', fontWeight: '900', lineHeight: 0.85, letterSpacing: '-0.04em' }}>FOUNDERS <br /><span style={{ color: '#ef4444' }}>ARENA.</span></h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: 'clamp(1.1rem, 5vw, 1.75rem)', fontWeight: '800' }}>
                    <span style={{ fontSize: '2.5rem' }}>⏰</span> Coming Soon
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: 'clamp(1.1rem, 5vw, 1.75rem)', fontWeight: '800' }}>
                    <span style={{ fontSize: '2.5rem' }}>📍</span> Coming Soon
                  </div>
                </div>

                <p style={{ color: 'black', fontSize: 'clamp(1rem, 4vw, 1.5rem)', fontWeight: '600', marginTop: '3rem', lineHeight: 1.4, maxWidth: '500px' }}>
                  3 Minutes. 2 Founders. High stakes roasting by esteemed judges. No slides, no mercy. Survive the fire and get funded.
                </p>
              </div>

              <div style={{ flex: '1 1 280px', background: '#f472b6', padding: 'clamp(1.5rem, 7vw, 4rem)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minWidth: 0 }}>
                <div style={{ background: 'white', border: '4px solid black', padding: '2rem', borderRadius: '24px', boxShadow: '12px 12px 0px black', transform: 'rotate(5deg)' }}>
                  <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: '900', color: '#64748b', marginBottom: '0.5rem' }}>ENTRY FEE</span>
                  <h2 style={{ fontSize: 'clamp(3rem, 16vw, 5rem)', color: 'black', fontWeight: '900', lineHeight: 1, margin: 0 }}>₹1200</h2>
                </div>

                <div style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                  <motion.button
                    onClick={handleRegisterClick}
                    whileHover={{ scale: 1.05, rotate: -2, boxShadow: '0px 10px 0px black' }}
                    whileTap={{ scale: 0.95 }}
                    style={{ background: 'black', color: 'white', border: '4px solid black', padding: '1.25rem clamp(1rem, 6vw, 3rem)', borderRadius: '16px', fontSize: 'clamp(1.25rem, 6vw, 2rem)', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', width: '100%' }}>
                    GRAB A SLOT 🚀
                  </motion.button>
                  <p style={{ fontWeight: '800', fontSize: '1.125rem', color: 'black', opacity: 0.7 }}>Limited to 50 Teams Only</p>
                </div>

                <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', marginLeft: '0.5rem' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ width: '45px', height: '45px', background: `hsl(${i * 45}, 70%, 60%)`, border: '3px solid black', borderRadius: '50%', marginLeft: '-15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>👤</div>
                    ))}
                  </div>
                  <span style={{ fontSize: '1.125rem', fontWeight: '900', color: 'black' }}>+16 Founders joined</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PitchFireRegistration = ({ setPage, user }) => {
  const [step, setStep] = useState(1);
  const [teamData, setTeamData] = useState({ teamName: '', member1: '', member2: '', idea: '' });
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState('');
  const [ticketId, setTicketId] = useState('');

  const handleNext = (e) => { e.preventDefault(); setStep(step + 1); };

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading('Sending Secure OTP to your email...');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to connect to backend server. Make sure node server.js is running!");
    } finally {
      setLoading('');
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading('Verifying 2FA Code...');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (data.success) {
        setStep(3);
      } else {
        alert("Invalid or Expired OTP: " + data.error);
      }
    } catch (err) {
      alert("Failed to connect to server");
    } finally {
      setLoading('');
    }
  };

  const processPayment = async () => {
    setLoading('Initializing payment gateway...');
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert("Failed to load Razorpay Checkout SDK. Check your internet connection.");
      setLoading('');
      return;
    }

    try {
      // 1. Create order on the backend
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const orderData = await res.json();
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order on server');
      }

      setLoading(''); // Hide overlay so payment modal is interactable

      const options = {
        key: orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || '', // Configured in frontend env settings or returned by server
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Bartr.in",
        description: "Founders Arena Slot Registration",
        image: "https://bartr.in/logo.png",
        order_id: orderData.order_id,
        handler: async function (response) {
          setLoading('Verifying payment & generating ticket...');
          try {
            // 2. Verify payment signature on the backend
            const verifyRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              // 3. Generate Ticket ID and save to Supabase
              const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
              let result = 'BART-PF-';
              for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
              setTicketId(result);

              const { error: dbError } = await supabase.from('registrations').insert({
                user_id: user?.id,
                team_name: teamData.teamName,
                ticket_id: result,
                payment_status: 'success'
              });

              if (dbError) throw dbError;

              // 4. Send ticket details email
              await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/send-ticket`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, ticketId: result, teamName: teamData.teamName })
              });

              setStep(4);
            } else {
              alert("Payment verification failed: " + (verifyData.error || "Invalid Signature"));
            }
          } catch (err) {
            console.error('Registration/Verification Error:', err);
            alert('Something went wrong during payment verification. Please reach out to Bartr support.');
          } finally {
            setLoading('');
          }
        },
        prefill: {
          email: email,
          contact: ''
        },
        theme: {
          color: "#000000"
        }
      };

      const rzpObj = new window.Razorpay(options);
      rzpObj.on('payment.failed', function (resp) {
        alert("Payment failed: " + resp.error.description);
      });
      rzpObj.open();

    } catch (err) {
      console.error('Razorpay Integration Error:', err);
      alert('Failed to initialize checkout. Please check if VITE_API_URL is correct or contact support.');
      setLoading('');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '1.25rem',
    border: '4px solid black',
    borderRadius: '16px',
    background: 'white',
    fontSize: '1.25rem',
    fontWeight: '800',
    outline: 'none',
    boxShadow: '6px 6px 0px rgba(0,0,0,0.1)',
    transition: 'all 0.2s'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '1.1rem',
    fontWeight: '900',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: '#000', minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}
    >
      {/* BACKGROUND MOVING TEXT MARQUEE */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden', opacity: 0.2 }}>
        <motion.div
          animate={{ x: [-2000, 0] }}
          transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
          style={{ fontSize: '20rem', fontWeight: 900, color: 'white', whiteSpace: 'nowrap', lineHeight: 1 }}
        >
          FOUNDERS ARENA MAY 9 • FOUNDERS ARENA MAY 9 • FOUNDERS ARENA MAY 9
        </motion.div>
        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          style={{ fontSize: '20rem', fontWeight: 900, color: '#ef4444', whiteSpace: 'nowrap', lineHeight: 1 }}
        >
          INDIA STARTUPS • INDIA STARTUPS • INDIA STARTUPS
        </motion.div>
      </div>

      <div style={{ cursor: 'pointer', position: 'absolute', top: '2rem', left: '2rem', zIndex: 100, background: 'white', border: '3px solid black', padding: '0.75rem 1.5rem', borderRadius: '12px', boxShadow: '4px 4px 0px black', display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: '900' }} onClick={() => setPage('events')}>
        <ArrowRight size={24} style={{ transform: 'rotate(180deg)' }} /> EXIT
      </div>

      {/* Global Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ background: '#fcd34d', color: 'black', padding: 'clamp(1.25rem, 6vw, 2rem) clamp(1.5rem, 8vw, 4rem)', borderRadius: '24px', border: '6px solid black', fontWeight: '900', fontSize: 'clamp(1.25rem, 6vw, 2rem)', boxShadow: '15px 15px 0px #ef4444', textAlign: 'center', maxWidth: '90vw' }}>
              {loading}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ width: '100%', maxWidth: '650px', position: 'relative', zIndex: 10 }}>

        {/* Step Progress */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ flex: 1, height: '12px', background: s <= step ? (s === 4 ? '#34d399' : '#ef4444') : '#334155', border: '3px solid black', borderRadius: '6px', transition: 'all 0.4s' }}></div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} style={{ background: '#f8fafc', border: '6px solid black', padding: 'clamp(1.25rem, 7vw, 3.5rem)', borderRadius: '32px', boxShadow: 'clamp(8px, 4vw, 20px) clamp(8px, 4vw, 20px) 0px black' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', lineHeight: 1 }}>TEAM <br /><span style={{ color: '#ef4444' }}>SETUP.</span></h2>
                <div style={{ fontSize: '3rem' }}>🚀</div>
              </div>

              <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <label style={labelStyle}>Company / Team Name</label>
                  <input required placeholder="eg. Ghost Protocol" value={teamData.teamName} onChange={e => setTeamData({ ...teamData, teamName: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={labelStyle}>Founder 1</label>
                    <input required placeholder="Name" value={teamData.member1} onChange={e => setTeamData({ ...teamData, member1: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Founder 2</label>
                    <input required placeholder="Name" value={teamData.member2} onChange={e => setTeamData({ ...teamData, member2: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>The Pitch (One sentence roast)</label>
                  <textarea required rows={3} placeholder="We solve problems that don't exist..." value={teamData.idea} onChange={e => setTeamData({ ...teamData, idea: e.target.value })} style={{ ...inputStyle, resize: 'none' }} />
                </div>
                <motion.button whileHover={{ scale: 1.02, y: -5, boxShadow: '0px 10px 0px black' }} whileTap={{ scale: 0.98 }} type="submit" style={{ background: 'black', color: 'white', border: '4px solid black', padding: '1.25rem', borderRadius: '16px', fontWeight: '900', fontSize: 'clamp(1.1rem, 5vw, 1.5rem)', cursor: 'pointer', marginTop: '1rem', textTransform: 'uppercase' }}>Continue to Verify →</motion.button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} style={{ background: '#f8fafc', border: '6px solid black', padding: 'clamp(1.25rem, 7vw, 3.5rem)', borderRadius: '32px', boxShadow: 'clamp(8px, 4vw, 20px) clamp(8px, 4vw, 20px) 0px black' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', lineHeight: 1 }}>EMAIL <br /><span style={{ color: '#3b82f6' }}>AUTH.</span></h2>
                <div style={{ fontSize: '3rem' }}>🔒</div>
              </div>

              {!otpSent ? (
                <form onSubmit={sendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div>
                    <label style={labelStyle}>Founder Email</label>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@startup.com" style={inputStyle} />
                    <p style={{ marginTop: '1rem', fontWeight: '700', color: '#64748b' }}>We'll send your digital ticket here.</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }} type="submit" style={{ background: '#3b82f6', color: 'white', border: '4px solid black', padding: '1.25rem', borderRadius: '16px', fontWeight: '900', fontSize: 'clamp(1.1rem, 5vw, 1.5rem)', boxShadow: '6px 6px 0px black', cursor: 'pointer', textTransform: 'uppercase' }}>Request PIN</motion.button>
                </form>
              ) : (
                <form onSubmit={verifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div>
                    <label style={labelStyle}>6-Digit PIN</label>
                    <input required type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} style={{ ...inputStyle, fontSize: 'clamp(2rem, 11vw, 3rem)', textAlign: 'center', letterSpacing: 'clamp(0.25rem, 2vw, 0.75rem)', background: '#fef9c3' }} />
                    <p style={{ marginTop: '1rem', fontWeight: '700', color: '#ef4444' }}>Expiring in 2 minutes!</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }} type="submit" style={{ background: '#34d399', color: 'black', border: '4px solid black', padding: '1.25rem', borderRadius: '16px', fontWeight: '900', fontSize: 'clamp(1.1rem, 5vw, 1.5rem)', boxShadow: '6px 6px 0px black', cursor: 'pointer', textTransform: 'uppercase' }}>Confirm Identity</motion.button>
                  <p onClick={() => setOtpSent(false)} style={{ textAlign: 'center', fontWeight: '900', cursor: 'pointer', textDecoration: 'underline' }}>Resend code?</p>
                </form>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} style={{ background: '#f8fafc', border: '6px solid black', padding: 'clamp(1.5rem, 8vw, 3.5rem)', borderRadius: '24px', boxShadow: '10px 10px 0px black', textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 10vw, 3rem)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem' }}>GET <span style={{ color: '#a78bfa' }}>ENTRY.</span></h2>
              <p style={{ fontWeight: '800', fontSize: 'clamp(1rem, 5vw, 1.5rem)', marginBottom: '2.5rem' }}>Scan the QR to secure your team slot.</p>

              <div style={{ background: 'white', padding: '2rem', display: 'inline-block', borderRadius: '24px', border: '5px solid black', marginBottom: '2.5rem', boxShadow: '12px 12px 0px rgba(167,139,250,0.3)' }}>
                <div style={{ width: '220px', height: '220px', background: 'white', backgroundImage: 'url("https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=mock@upi&pn=Bartr&am=1200.00&tr=mock-txn")', backgroundSize: 'cover' }}></div>
                <div style={{ marginTop: '1.5rem', fontSize: '2.5rem', fontWeight: '900' }}>₹1200</div>
              </div>

              <motion.button onClick={processPayment} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }} style={{ width: '100%', background: '#a78bfa', color: 'black', border: '4px solid black', padding: '1.25rem', borderRadius: '16px', fontWeight: '900', fontSize: 'clamp(1.1rem, 5vw, 1.5rem)', boxShadow: '8px 8px 0px black', cursor: 'pointer', textTransform: 'uppercase' }}>I've Paid! Generate Ticket</motion.button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ scale: 0.5, rotate: -10, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} style={{ background: '#fff', border: '6px solid black', borderRadius: '24px', boxShadow: '15px 15px 0px black', width: '100%', overflow: 'hidden' }}>
              <div style={{ background: '#ef4444', padding: 'clamp(1.5rem, 8vw, 3rem)', color: 'white', borderBottom: '6px dashed black', textAlign: 'center' }}>
                <motion.h2 animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ fontSize: 'clamp(2.5rem, 12vw, 4rem)', fontWeight: '900', margin: 0, textShadow: '4px 4px 0px black', letterSpacing: '-0.05em' }}>SUCCESS! 🎫</motion.h2>
                <p style={{ fontWeight: '900', fontSize: '1.2rem', marginTop: '1rem', textTransform: 'uppercase' }}>You are officially in the fire.</p>
              </div>
              <div style={{ padding: 'clamp(1.5rem, 8vw, 4rem)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '2rem' }}>
                  <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '16px', border: '3px solid black' }}>
                    <span style={{ color: '#64748b', fontWeight: '900', fontSize: '0.9rem', textTransform: 'uppercase' }}>TEAM</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'black' }}>{teamData.teamName}</div>
                  </div>
                  <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '16px', border: '3px solid black' }}>
                    <span style={{ color: '#64748b', fontWeight: '900', fontSize: '0.9rem', textTransform: 'uppercase' }}>SLOT</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#10b981' }}>CONFIRMED</div>
                  </div>
                </div>
                <div style={{ background: '#000', color: '#34d399', padding: '2rem', borderRadius: '16px', border: '3px solid #34d399', textAlign: 'center' }}>
                  <span style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '1rem', display: 'block', marginBottom: '0.5rem' }}>TICKET SERIAL</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '0.2em' }}>{ticketId}</div>
                </div>
                <p style={{ textAlign: 'center', fontWeight: '800', fontSize: '1.1rem', color: '#64748b' }}>A confirmation has been sent to {email}. <br />Bring this ID to Aromas Cafe & Bistro.</p>
                <motion.button onClick={() => setPage('events')} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} style={{ width: '100%', background: 'black', color: 'white', border: '4px solid black', padding: '1.25rem', borderRadius: '16px', fontWeight: '900', fontSize: 'clamp(1.1rem, 5vw, 1.5rem)', marginTop: '1rem', cursor: 'pointer', textTransform: 'uppercase' }}>Back to Site</motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Decorative Elements */}
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }} style={{ position: 'absolute', top: '10%', right: '5%', fontSize: '8rem', zIndex: 1, opacity: 0.3 }}>🔥</motion.div>
      <motion.div animate={{ y: [0, -50, 0] }} transition={{ repeat: Infinity, duration: 5 }} style={{ position: 'absolute', bottom: '10%', left: '5%', fontSize: '6rem', zIndex: 1, opacity: 0.3 }}>🚀</motion.div>
      <motion.div animate={{ x: [0, 50, 0] }} transition={{ repeat: Infinity, duration: 4 }} style={{ position: 'absolute', top: '40%', left: '2%', fontSize: '5rem', zIndex: 1, opacity: 0.3 }}>🎫</motion.div>

    </motion.div>
  );
};

// --- CUSTOM CURSOR (Sleek & Minimalist) ---
const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Disable custom cursor on mobile/touch devices
    if (typeof window !== "undefined" && (window.innerWidth < 850 || "ontouchstart" in window)) {
      return;
    }
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Check if hovering over clickable elements
      const target = e.target;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.brand') ||
        window.getComputedStyle(target).cursor === 'pointer'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    document.body.style.cursor = 'none'; // hide default cursor globally

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.body.style.cursor = 'auto';
    };
  }, [cursorX, cursorY]);

  if (typeof window !== "undefined" && (window.innerWidth < 850 || "ontouchstart" in window)) {
    return null;
  }

  return (
    <>
      <motion.div
        style={{
          position: 'fixed', left: 0, top: 0, x: cursorXSpring, y: cursorYSpring,
          width: isHovering ? '60px' : '40px',
          height: isHovering ? '60px' : '40px',
          marginLeft: isHovering ? '-30px' : '-20px',
          marginTop: isHovering ? '-30px' : '-20px',
          backgroundColor: isHovering ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
          border: '2px solid black',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 999999,
          willChange: 'transform, width, height, margin',
          transition: 'width 0.2s, height 0.2s, margin 0.2s, background-color 0.2s'
        }}
      />
      <motion.div
        style={{
          position: 'fixed', left: 0, top: 0, x: cursorX, y: cursorY,
          width: '8px', height: '8px', marginLeft: '-4px', marginTop: '-4px',
          backgroundColor: 'black', borderRadius: '50%', pointerEvents: 'none', zIndex: 999999,
          willChange: 'transform',
          opacity: isHovering ? 0 : 1,
          transition: 'opacity 0.2s'
        }}
      />
    </>
  );
};

const ConfigMissingScreen = () => (
  <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Space Grotesk', sans-serif" }}>
    <div style={{ maxWidth: '520px', background: 'white', border: '6px solid black', borderRadius: '24px', padding: '2.5rem', boxShadow: '12px 12px 0 #ef4444' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Setup required</h1>
      <p style={{ color: '#475569', fontWeight: 600, lineHeight: 1.6, marginBottom: '1.5rem' }}>
        The app needs Supabase credentials. Create a <code style={{ background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>.env</code> file in the project root (copy from <code style={{ background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>.env.example</code>), then add:
      </p>
      <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', overflowX: 'auto', marginBottom: '1.5rem' }}>
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001`}
      </pre>
      <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>
        Restart with <strong>npm run dev</strong> and open the URL Vite prints (e.g. http://localhost:5173).
      </p>
    </div>
  </div>
);

// --- MAIN ROUTER APP ---
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showInboxModal, setShowInboxModal] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [verifiedMessage, setVerifiedMessage] = useState(false);

  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setIsPageLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      window.scrollTo(0, 0);
      setTimeout(() => setIsPageLoading(false), 400);
    }, 500);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // 1. Check for verification token instantly (Supabase Email Confirmation Redirect)
    if (window.location.hash && window.location.hash.includes('access_token')) {
      setIsPageLoading(true);

      // Give it a small delay for the session to settle and for the "Elite" B-Loader to show
      setTimeout(() => {
        setIsPageLoading(false);
        setVerifiedMessage(true);
        setCurrentPage('welcome');

        // Clean the URL of the secret tokens for a professional look
        window.history.replaceState(null, null, window.location.pathname);

        // Hide celebration toast after 5 seconds
        setTimeout(() => setVerifiedMessage(false), 5000);
      }, 2000);
    }

    // 2. Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setIsLoggedIn(true);
      }
    });

    // 3. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session);

      if (session && event === 'SIGNED_IN') {
        setShowAuthModal(false);
        
        // If the user was created less than 15 seconds ago, they just signed up (e.g. via Google OAuth)
        const isNewUser = (Date.now() - new Date(session.user.created_at).getTime()) < 15000;
        
        if (isNewUser) {
          // Send custom welcome email via backend
          const email = session.user.email;
          const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User';
          
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/welcome-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, fullName })
          }).catch(err => console.error("Welcome email failed for OAuth:", err));
        }
      }
    });

    // 3. Listen for manual triggers
    const handleOpenLogin = () => openAuth('login');
    const handleOpenInbox = () => setShowInboxModal(true);
    const handleSubscriptionUpdated = async () => {
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    };
    window.addEventListener('openLoginModal', handleOpenLogin);
    window.addEventListener('openInboxModal', handleOpenInbox);
    window.addEventListener('subscription_updated', handleSubscriptionUpdated);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('openLoginModal', handleOpenLogin);
      window.removeEventListener('openInboxModal', handleOpenInbox);
      window.removeEventListener('subscription_updated', handleSubscriptionUpdated);
    };
  }, []);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Signout error", e);
    }
    
    setUser(null);
    setIsLoggedIn(false);
    handlePageChange('home');
    
    // Safely clear any remaining auth items from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('supabase.auth.token')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  };

  if (!isSupabaseConfigured) {
    return <ConfigMissingScreen />;
  }

  return (
    <>
      <CustomCursor />

      <AnimatePresence mode="wait">
        {isPageLoading && <PageLoader />}
      </AnimatePresence>

      {currentPage === 'home' && <LandingPage setPage={handlePageChange} isLoggedIn={isLoggedIn} onAuth={openAuth} onLogout={handleLogout} />}
      {currentPage === 'gigs' && <GigsPage setPage={handlePageChange} isLoggedIn={isLoggedIn} onAuth={openAuth} onLogout={handleLogout} currentPage="gigs" user={user} />}
      {currentPage === 'careers' && <CareersPage setPage={handlePageChange} isLoggedIn={isLoggedIn} onAuth={openAuth} onLogout={handleLogout} />}
      {currentPage === 'tri-score' && <TRIScorePage setPage={handlePageChange} isLoggedIn={isLoggedIn} onAuth={openAuth} onLogout={handleLogout} />}
      {currentPage === 'student' && <StudentPage setPage={handlePageChange} isLoggedIn={isLoggedIn} onAuth={openAuth} onLogout={handleLogout} />}
      {currentPage === 'events' && <EventsPage setPage={handlePageChange} isLoggedIn={isLoggedIn} onAuth={openAuth} onLogout={handleLogout} />}
      {currentPage === 'pitch-fire-register' && <PitchFireRegistration setPage={handlePageChange} user={user} />}
      {currentPage === 'profile' && <UserProfile setPage={handlePageChange} user={user} />}
      {currentPage === 'welcome' && <WelcomePage setPage={handlePageChange} user={user} />}
      {currentPage === 'subscription' && <SubscriptionPage setPage={handlePageChange} user={user} isLoggedIn={isLoggedIn} onAuth={openAuth} onLogout={handleLogout} />}

      <AuthModal isOpen={showAuthModal} initialMode={authMode} onClose={() => setShowAuthModal(false)} />
      
      <InboxModal isOpen={showInboxModal} onClose={() => setShowInboxModal(false)} user={user} />

      <AnimatePresence>
        {verifiedMessage && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            style={{ position: 'fixed', top: '2rem', left: '50%', x: '-50%', zIndex: 10000, background: '#34d399', color: 'black', border: '4px solid black', padding: '1rem 2rem', borderRadius: '12px', fontWeight: '900', boxShadow: '6px 6px 0px black', display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div style={{ background: 'white', borderRadius: '50%', padding: '0.25rem' }}>✅</div>
            EMAIL VERIFIED! WELCOME TO BARTR.IN 🚀
          </motion.div>
        )}
      </AnimatePresence>

      {currentPage !== 'pitch-fire-register' && currentPage !== 'welcome' && <Footer setPage={handlePageChange} />}
    </>
  )
}

// --- UNIQUE MOSAIC B-LETTER LOADER ---
const PageLoader = () => {
  const bMap = [
    1, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 1, 1, 1, 0
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[20000] flex flex-col items-center justify-center backdrop-blur-md bg-white/5"
    >
      <div className="grid grid-cols-5 gap-1">
        {bMap.map((active, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={active ? {
              scale: 1,
              opacity: 1,
              backgroundColor: ['#ef4444', '#000', '#ef4444'],
            } : {
              scale: 0.2,
              opacity: 0.05
            }}
            transition={{
              duration: 0.3,
              delay: (i % 5) * 0.03 + Math.floor(i / 5) * 0.03,
              backgroundColor: { repeat: Infinity, duration: 1.5, delay: i * 0.05 }
            }}
            className="w-2.5 h-2.5 rounded-[2px]"
            style={{ filter: active ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.4))' : 'none' }}
          />
        ))}
      </div>

      <motion.span
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-[8px] font-black uppercase tracking-[0.8em] mt-6 text-black/40 italic"
      >
        Hustling
      </motion.span>
    </motion.div>
  );
};

// --- PROFESSIONAL WELCOME PAGE ---
const WelcomePage = ({ setPage, user }) => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (user) {
      setUserName(user.user_metadata?.full_name || user.email.split('@')[0]);
    }

    // Automatically redirect to home after 5 seconds
    const timer = setTimeout(() => {
      window.history.replaceState(null, null, window.location.pathname);
      setPage('home');
      // Dispatch custom event to open login modal in App
      window.dispatchEvent(new CustomEvent('openLoginModal'));
    }, 5000);
    return () => clearTimeout(timer);
  }, [setPage, user]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <TracingBackground />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[48px] p-10 md:p-16 text-center shadow-premium relative z-10 w-full max-w-xl flex flex-col items-center"
      >
        <motion.div
          whileHover={{ scale: 1.02, rotate: -1 }}
          className="brand cursor-pointer flex items-center bg-brand-red px-6 py-3 rounded-2xl shadow-neo mb-10"
        >
          <span className="text-white text-3xl font-black tracking-tight font-['Space_Grotesk']">Bartr.in</span>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-24 h-24 md:w-32 md:h-32 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(16,185,129,0.4)]"
        >
          <CheckCircle size={64} className="text-white" strokeWidth={3} />
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4 uppercase">
          Welcome, <br /><span className="text-emerald-400">{userName}!</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-300 font-bold mb-10 leading-tight">
          You are officially <span className="text-white">verified.</span> <br /> India's biggest opportunity hub is waiting.
        </p>

        {/* Countdown Progress */}
        <div className="relative w-full h-3 bg-white/5 rounded-full mb-4 overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 5, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400"
          />
        </div>
        <p className="text-slate-500 font-black text-xs uppercase tracking-[0.3em]">Redirecting to Login...</p>
      </motion.div>
    </div>
  );
};


// --- USER PROFILE PAGE ---
const UserProfile = ({ setPage, user }) => {
  const [profile, setProfile] = useState({ full_name: '', phone: '', bio: '', location: '', skills: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user) {
      setPage('home');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile({
        full_name: data.full_name || '',
        phone: data.phone || '',
        bio: data.bio || '',
        location: data.location || '',
        skills: data.skills ? data.skills.join(', ') : ''
      });
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const skillsArray = profile.skills.split(',').map(s => s.trim()).filter(Boolean);

    const { error } = await supabase.from('user_profiles').upsert({
      id: user.id,
      full_name: profile.full_name,
      phone: profile.phone,
      bio: profile.bio,
      location: profile.location,
      skills: skillsArray,
      updated_at: new Date()
    });

    if (!error) {
      setIsEditing(false);
    } else {
      console.error("Profile Save Error:", error);
      alert("Error saving profile: " + error.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPage('home');
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900' }}>LOADING PROFILE...</div>;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#f8fafc', paddingBottom: '4rem', overflow: 'hidden' }}>

      {/* Background Floaters */}
      <FloatingIconsBackground />

      {/* BACKGROUND MOVING TEXT MARQUEE */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden', opacity: 0.1 }}>
        <motion.div
          animate={{ x: [-2000, 0] }}
          transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
          style={{ fontSize: '20rem', fontWeight: 900, color: '#3b82f6', whiteSpace: 'nowrap', lineHeight: 1, marginTop: '20vh' }}
        >
          YOUR BARTR PROFILE • YOUR BARTR PROFILE • YOUR BARTR PROFILE
        </motion.div>
        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{ repeat: Infinity, duration: 35, ease: 'linear' }}
          style={{ fontSize: '20rem', fontWeight: 900, color: '#10b981', whiteSpace: 'nowrap', lineHeight: 1 }}
        >
          INDIA STARTUPS • INDIA STARTUPS • INDIA STARTUPS
        </motion.div>
      </div>

      <Navbar scrolled={scrolled} setPage={setPage} isDark={false} isLoggedIn={!!user} onLogout={handleLogout} />

      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '150px', position: 'relative', zIndex: 10 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(2.25rem, 10vw, 3rem)', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>My Profile</h1>
          {!isEditing && (
            <motion.button
              onClick={() => setIsEditing(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ background: 'black', color: 'white', border: '3px solid black', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '4px 4px 0px #ef4444' }}
            >
              <Edit2 size={20} /> EDIT PROFILE
            </motion.button>
          )}
        </div>

        <div style={{ background: 'white', border: '6px solid black', borderRadius: '24px', padding: 'clamp(1.25rem, 6vw, 3rem)', boxShadow: 'clamp(8px, 4vw, 20px) clamp(8px, 4vw, 20px) 0px black', position: 'relative' }}>

          <div style={{ position: 'absolute', top: '-40px', left: '3rem', width: '120px', height: '120px', borderRadius: '50%', background: '#3b82f6', border: '6px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '8px 8px 0px black' }}>
            <User size={60} color="white" />
          </div>

          <div style={{ marginTop: '4rem' }}>
            {isEditing ? (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '900', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Full Name</label>
                  <input required value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} style={{ width: '100%', padding: '1rem', border: '3px solid black', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '900', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phone Number</label>
                  <input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} style={{ width: '100%', padding: '1rem', border: '3px solid black', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '900', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Location (e.g., Wardha Road, India)</label>
                  <input value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} style={{ width: '100%', padding: '1rem', border: '3px solid black', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '900', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Bio / What do you do?</label>
                  <textarea rows="4" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} style={{ width: '100%', padding: '1rem', border: '3px solid black', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', resize: 'vertical' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '900', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Skills (comma separated)</label>
                  <input placeholder="React, Graphic Design, Sales..." value={profile.skills} onChange={e => setProfile({ ...profile, skills: e.target.value })} style={{ width: '100%', padding: '1rem', border: '3px solid black', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem' }} />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <motion.button type="button" onClick={() => setIsEditing(false)} whileHover={{ scale: 1.05 }} style={{ flex: 1, background: '#f1f5f9', border: '3px solid black', padding: '1rem', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>CANCEL</motion.button>
                  <motion.button type="submit" whileHover={{ scale: 1.05 }} style={{ flex: 2, background: '#34d399', color: 'black', border: '3px solid black', padding: '1rem', borderRadius: '12px', fontWeight: '900', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <Save size={20} /> SAVE PROFILE
                  </motion.button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: 'clamp(2rem, 9vw, 2.5rem)', fontWeight: '900', margin: 0, textTransform: 'uppercase', overflowWrap: 'anywhere' }}>{profile.full_name || 'Anonymous User'}</h2>
                  <p style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)', color: '#64748b', fontWeight: 'bold', margin: '0.5rem 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', overflowWrap: 'anywhere' }}>
                    <Mail size={20} /> {user.email}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '3px solid black' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: '900', marginBottom: '0.5rem', textTransform: 'uppercase' }}><MapPin size={18} /> Location</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>{profile.location || 'Not specified'}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '3px solid black' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: '900', marginBottom: '0.5rem', textTransform: 'uppercase' }}><Briefcase size={18} /> Phone Number</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>{profile.phone || 'Not specified'}</div>
                  </div>
                </div>

                <div style={{ background: '#fef3c7', padding: '2rem', borderRadius: '16px', border: '3px solid black' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontWeight: '900', marginBottom: '1rem', textTransform: 'uppercase' }}><FileText size={18} /> About Me</div>
                  <p style={{ fontSize: '1.25rem', fontWeight: '600', lineHeight: 1.6, margin: 0 }}>{profile.bio || 'This user prefers to keep an air of mystery.'}</p>
                </div>

                {profile.skills && (
                  <div>
                    <h3 style={{ fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem' }}>Superpowers</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {profile.skills.split(',').map((s, i) => (
                        <span key={i} style={{ background: 'black', color: 'white', padding: '0.5rem 1rem', borderRadius: '999px', fontWeight: '800', border: '2px solid black' }}>{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const AuthModal = ({ isOpen, initialMode, onClose }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [role, setRole] = useState('freelancer');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // New state for signup success

  useEffect(() => {
    setIsLogin(initialMode === 'login');
    setError(null);
    setShowSuccess(false);
  }, [initialMode, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: fullName,
              phone: phone,
              role: role,
              ...(role === 'student' && { college: collegeName })
            }
          }
        });
        if (error) throw error;

        // Send custom welcome email via backend
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/welcome-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, fullName })
        }).catch(err => console.error("Welcome email failed:", err));

        setShowSuccess(true); // Show the success UI
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) setError(error.message);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 30, rotate: -1 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          className="bg-white border-[5px] sm:border-[8px] border-black rounded-[28px] sm:rounded-[40px] w-full max-w-[650px] max-h-[92vh] relative overflow-y-auto shadow-[8px_8px_0px_rgba(0,0,0,1)] sm:shadow-[16px_16px_0px_rgba(0,0,0,1)]"
          onClick={e => e.stopPropagation()}
        >
          {showSuccess ? (
            <div className="p-6 sm:p-12 text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-8xl mb-8"
              >
                📩
              </motion.div>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">Check Yo Mail!</h2>
              <p className="font-bold text-slate-500 text-lg mb-10 leading-tight">We sent a magic link to <span className="text-black underline">{email}</span>. Activate it to start the hustle.</p>
              <motion.button
                onClick={() => { setShowSuccess(false); setIsLogin(true); }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-brand-red text-white border-4 border-black py-5 rounded-2xl font-black text-2xl shadow-neo uppercase italic tracking-widest"
              >
                Back to Login
              </motion.button>
            </div>
          ) : (
            <>
              {/* Vibrant Header */}
              <div className={`p-5 sm:p-8 border-b-[5px] sm:border-b-[6px] border-black relative transition-colors duration-500 ${isLogin ? 'bg-indigo-500' : 'bg-rose-500'}`}>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  className="bg-white border-4 border-black px-4 py-1.5 rounded-xl shadow-[6px_6px_0px_black] w-fit mb-6"
                >
                  <span className="text-black text-xl font-black tracking-tight font-['Space_Grotesk'] italic">Bartr.in</span>
                </motion.div>

                <h2 className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-2 pr-12">
                  {isLogin ? 'Welcome Back, Legend' : 'Join the Hustle'}
                </h2>
                <p className="text-white font-black opacity-90 uppercase tracking-widest text-xs">
                  {isLogin ? 'India is waiting for you' : 'Start building your future today'}
                </p>

                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  onClick={onClose}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-black text-white p-2 rounded-xl border-4 border-white shadow-lg"
                >
                  <X size={20} strokeWidth={3} />
                </motion.button>
              </div>

              <div className="p-5 sm:p-8 md:p-10 space-y-6">
                {error && (
                  <div className="bg-rose-100 border-4 border-rose-500 p-4 rounded-xl flex items-center gap-3 animate-shake">
                    <AlertCircle className="text-rose-600" />
                    <p className="text-rose-900 font-black text-sm uppercase italic">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Multi-Login Role Toggle */}
                  <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-2 border-2 border-slate-200">
                    <button
                      type="button"
                      onClick={() => setRole('freelancer')}
                      className={`flex-1 py-3 rounded-xl font-black text-sm uppercase transition-all ${role === 'freelancer' ? 'bg-white text-black shadow-sm border-2 border-black' : 'text-slate-400 hover:text-slate-600 border-2 border-transparent'}`}
                    >
                      Freelancer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`flex-1 py-3 rounded-xl font-black text-sm uppercase transition-all ${role === 'student' ? 'bg-indigo-500 text-white shadow-sm border-2 border-black' : 'text-slate-400 hover:text-slate-600 border-2 border-transparent'}`}
                    >
                      Student
                    </button>
                  </div>

                  <div className={`grid gap-4 ${!isLogin ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                    {!isLogin && (
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                        <input
                          type="text"
                          placeholder="Your Boss Name"
                          className="w-full bg-slate-50 border-4 border-black p-4 rounded-2xl font-bold text-lg focus:bg-white focus:shadow-[4px_4px_0px_black] transition-all outline-none"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
                      <input
                        type="email"
                        placeholder="you@hustle.com"
                        className="w-full bg-slate-50 border-4 border-black p-4 rounded-2xl font-bold text-lg focus:bg-white focus:shadow-[4px_4px_0px_black] transition-all outline-none"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border-4 border-black p-4 rounded-2xl font-bold text-lg focus:bg-white focus:shadow-[4px_4px_0px_black] transition-all outline-none"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    {!isLogin && role === 'student' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-indigo-400 ml-2">School / College</label>
                        <input
                          type="text"
                          placeholder="e.g. VNIT, Raisoni"
                          className="w-full bg-indigo-50 border-4 border-black p-4 rounded-2xl font-bold text-lg focus:bg-white focus:shadow-[4px_4px_0px_black] focus:border-indigo-500 transition-all outline-none text-indigo-900"
                          value={collegeName}
                          onChange={e => setCollegeName(e.target.value)}
                          required
                        />
                      </motion.div>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98, y: 0 }}
                    className={`w-full py-4 sm:py-5 rounded-2xl font-black text-xl sm:text-2xl border-4 border-black shadow-[6px_6px_0px_black] sm:shadow-[8px_8px_0px_black] uppercase italic tracking-widest transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'bg-black text-white hover:bg-slate-900'}`}
                  >
                    {loading ? 'Hustling...' : isLogin ? 'Let\'s Gooo' : 'Start Now'}
                  </motion.button>
                </form>

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t-4 border-black/10"></div>
                  <span className="flex-shrink mx-4 text-slate-400 font-black text-xs uppercase tracking-widest">OR</span>
                  <div className="flex-grow border-t-4 border-black/10"></div>
                </div>

                <motion.button
                  onClick={handleGoogleLogin}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98, y: 0 }}
                  className="w-full bg-white border-4 border-black py-4 rounded-2xl flex items-center justify-center gap-4 shadow-[8px_8px_0px_rgba(0,0,0,0.1)] hover:shadow-[8px_8px_0px_black] transition-all"
                >
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg" className="w-6 h-6" alt="G" />
                  <span className="font-black text-base sm:text-xl uppercase italic">Continue with Google</span>
                </motion.button>

                <div className="text-center pt-4">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-slate-500 font-black uppercase tracking-widest text-xs hover:text-black hover:underline underline-offset-4"
                  >
                    {isLogin ? 'New to the hub? Create account' : 'Already a legend? Login here'}
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- CHAT BOX ---
const ChatBox = ({ application, user, gigTitle, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);

  const applicantId = application.applicant_id;
  const gigId = application.gig_id;
  const isPoster = application.gigs.client_id === user.id;
  
  // Use optional chaining carefully since some joins might return slightly differently depending on the query
  const chatPartnerName = isPoster 
    ? (application.applicant?.full_name || 'Applicant') 
    : (application.gigs.poster?.full_name || 'Gig Poster');
    
  const receiverId = isPoster ? applicantId : application.gigs.client_id;
  const offerPrefix = '[[offer]]';
  const acceptPrefix = '[[accept]]';

  const parseStructuredMessage = (content) => {
    if (typeof content !== 'string') return { type: 'text', text: '' };
    if (content.startsWith(offerPrefix)) {
      const [, amount = '', note = ''] = content.split('|');
      return { type: 'offer', amount, note };
    }
    if (content.startsWith(acceptPrefix)) {
      const [, amount = '', note = ''] = content.split('|');
      return { type: 'accept', amount, note };
    }
    return { type: 'text', text: content };
  };

  const sendStructuredMessage = async (content, attachment = null) => {
    const msg = {
      gig_id: gigId,
      sender_id: user.id,
      receiver_id: receiverId,
      content
    };

    // Add attachment data if present
    if (attachment) {
      msg.attachment_url = attachment.url;
      msg.attachment_type = attachment.type;
      msg.attachment_name = attachment.name;
      msg.attachment_size = attachment.size;
    }

    return supabase.from('messages').insert([msg]);
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel(`chat_${gigId}_${user.id}_${receiverId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `gig_id=eq.${gigId}` 
      }, payload => {
        const msg = payload.new;
        // Only add messages that are part of this conversation
        if ((msg.sender_id === user.id && msg.receiver_id === receiverId) || 
            (msg.sender_id === receiverId && msg.receiver_id === user.id)) {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [application, gigId, user.id, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('gig_id', gigId)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
    if (error) console.error('Error fetching messages:', error);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    // Check if we have a message or file
    if (!newMessage.trim() && !selectedFile) return;
    
    setUploading(true);
    
    try {
      let attachment = null;
      
      // Upload file if selected
      if (selectedFile) {
        attachment = await uploadFile(selectedFile, user.id, gigId);
      }
      
      // Send message with or without attachment
      const messageContent = newMessage.trim() || '📎 Attachment';
      await sendStructuredMessage(messageContent, attachment);
      
      // Clear inputs
      setNewMessage('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSendOffer = async (e) => {
    e.preventDefault();
    const amount = offerAmount.trim();
    if (!amount) return;

    const note = offerNote.trim();
    const content = `${offerPrefix}|${amount}|${note}`;
    setOfferAmount('');
    setOfferNote('');
    await sendStructuredMessage(content);
  };

  const handleAcceptOffer = async (amount, note) => {
    const content = `${acceptPrefix}|${amount}|${note}`;
    await sendStructuredMessage(content);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f0f2f5', borderRadius: 'inherit' }}>
      {/* Modern Header */}
      <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', borderBottom: '1px solid #e2e8f0', zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <button onClick={onBack} style={{ background: '#f1f5f9', border: 'none', color: '#0f172a', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='#e2e8f0'} onMouseLeave={e=>e.currentTarget.style.background='#f1f5f9'}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '1.2rem', boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)' }}>
            {chatPartnerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a', letterSpacing: '-0.3px' }}>{chatPartnerName}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span> Active Now
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Area with Pattern */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', background: '#f8fafc', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        <div style={{ alignSelf: 'center', background: 'white', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', marginBottom: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
          Regarding: {gigTitle}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1rem 1.1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Negotiate</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>Send a structured offer instead of a plain message.</div>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Offer messages appear as cards</div>
        </div>
        
        {messages.map(m => {
          const isMe = m.sender_id === user.id;
          const parsed = parseStructuredMessage(m.content);
          const isOffer = parsed.type === 'offer';
          const isAccept = parsed.type === 'accept';
          return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                background: isOffer 
                  ? (isMe ? 'linear-gradient(135deg, #111827, #000000)' : '#fff7ed')
                  : isAccept
                    ? '#ecfdf5'
                    : isMe ? 'linear-gradient(135deg, #000000, #1f2937)' : '#ffffff', 
                color: isOffer
                  ? (isMe ? '#ffffff' : '#9a3412')
                  : isAccept
                    ? '#065f46'
                    : isMe ? '#ffffff' : '#0f172a', 
                padding: isOffer ? '1rem 1.2rem' : '0.8rem 1.2rem', 
                borderRadius: '20px', 
                borderBottomRightRadius: isMe ? '4px' : '20px', 
                borderBottomLeftRadius: isMe ? '20px' : '4px', 
                fontWeight: '600',
                fontSize: '0.95rem',
                lineHeight: '1.4',
                boxShadow: isOffer
                  ? (isMe ? '0 6px 18px rgba(0,0,0,0.12)' : '0 4px 14px rgba(249,115,22,0.12)')
                  : isMe ? '0 4px 15px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.04)',
                border: isMe || isOffer || isAccept ? 'none' : '1px solid #e2e8f0'
              }}>
                {isOffer ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', fontWeight: '900', letterSpacing: '0.12em', textTransform: 'uppercase', color: isMe ? '#fca5a5' : '#fb923c' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: isMe ? '#f87171' : '#f97316', display: 'inline-block' }} />
                      Negotiation Offer
                    </div>
                    <div style={{ fontSize: '1.9rem', fontWeight: '900', letterSpacing: '-0.05em' }}>{parsed.amount}</div>
                    {parsed.note && <div style={{ fontSize: '0.95rem', fontWeight: '600', opacity: 0.85 }}>{parsed.note}</div>}
                    {!isMe && (
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                        <button type="button" onClick={() => handleAcceptOffer(parsed.amount, parsed.note)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '999px', padding: '0.55rem 0.95rem', fontWeight: '900', cursor: 'pointer' }}>Accept</button>
                        <button type="button" onClick={() => { setOfferAmount(parsed.amount.replace(/[^\d.]/g, '')); setOfferNote(`Counter to ${parsed.amount}`); }} style={{ background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '999px', padding: '0.55rem 0.95rem', fontWeight: '900', cursor: 'pointer' }}>Counter</button>
                      </div>
                    )}
                  </div>
                ) : isAccept ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '900', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#059669' }}>Offer accepted</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700' }}>{parsed.amount}</div>
                    {parsed.note && <div style={{ fontSize: '0.9rem' }}>{parsed.note}</div>}
                  </div>
                ) : (
                  <>
                    {m.content}
                    {m.attachment_url && (
                      <MessageAttachment 
                        attachment={{
                          url: m.attachment_url,
                          type: m.attachment_type,
                          name: m.attachment_name,
                          size: m.attachment_size
                        }}
                      />
                    )}
                  </>
                )}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.4rem', textAlign: isMe ? 'right' : 'left', fontWeight: '700', padding: '0 0.5rem' }}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {isMe && <span style={{ marginLeft: '4px', color: '#3b82f6' }}>✓✓</span>}
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Modern Input */}
      <form onSubmit={handleSend} style={{ padding: '1rem 1.5rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.8rem', zIndex: 10 }}>
        
        {/* File Preview */}
        <AnimatePresence>
          {selectedFile && (
            <FilePreview 
              file={selectedFile} 
              onRemove={() => setSelectedFile(null)} 
            />
          )}
        </AnimatePresence>

        <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: '0.8rem', alignItems: 'center' }}>
          {/* File Upload Button */}
          <FileUploadButton 
            onFileSelect={setSelectedFile} 
            disabled={uploading}
          />
          
          {/* Message Input */}
          <div style={{ background: '#f1f5f9', borderRadius: '100px', display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', border: '1px solid #e2e8f0', transition: 'border 0.2s' }}>
            <input 
              type="text" 
              value={newMessage} 
              onChange={e=>setNewMessage(e.target.value)} 
              placeholder={selectedFile ? "Add a caption (optional)" : "Type your message..."} 
              disabled={uploading}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontWeight: '600', fontSize: '0.95rem', color: '#0f172a', padding: '0.4rem 0' }} 
            />
          </div>
          
          {/* Send Button */}
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            type="submit" 
            disabled={(!newMessage.trim() && !selectedFile) || uploading}
            style={{ 
              background: (newMessage.trim() || selectedFile) && !uploading ? '#000000' : '#cbd5e1', 
              color: 'white', 
              border: 'none', 
              width: '46px', 
              height: '46px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: (newMessage.trim() || selectedFile) && !uploading ? 'pointer' : 'not-allowed',
              boxShadow: (newMessage.trim() || selectedFile) && !uploading ? '0 4px 15px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.3s'
            }}
          >
            {uploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Send size={18} style={{ marginLeft: '2px' }} />
              </motion.div>
            ) : (
              <Send size={18} style={{ marginLeft: '2px' }} />
            )}
          </motion.button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
          <input
            type="text"
            value={offerAmount}
            onChange={e => setOfferAmount(e.target.value)}
            placeholder="Offer amount"
            style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '0.9rem 1rem', fontWeight: '800', outline: 'none', background: '#fff7ed' }}
          />
          <input
            type="text"
            value={offerNote}
            onChange={e => setOfferNote(e.target.value)}
            placeholder="Add a note"
            style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '0.9rem 1rem', fontWeight: '700', outline: 'none', background: '#fff' }}
          />
          <motion.button
            type="button"
            onClick={handleSendOffer}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!offerAmount.trim()}
            style={{ background: offerAmount.trim() ? '#f97316' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '900', cursor: offerAmount.trim() ? 'pointer' : 'not-allowed', padding: '0.9rem 1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Send Offer
          </motion.button>
        </div>
      </form>
    </div>
  );
};

// --- INBOX MODAL ---
const InboxModal = ({ isOpen, onClose, user }) => {
  const [receivedApps, setReceivedApps] = useState([]);
  const [sentApps, setSentApps] = useState([]);
  const [activeTab, setActiveTab] = useState('received');
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchInbox();
      setActiveChat(null);
    }
  }, [isOpen, user]);

  const fetchInbox = async () => {
    if (!user) return;
    // Fetch apps received on user's gigs
    const { data: myGigs } = await supabase.from('gigs').select('id, title').eq('client_id', user.id);
    if (myGigs && myGigs.length > 0) {
      const gigIds = myGigs.map(g => g.id);
      const { data: received } = await supabase
        .from('gig_applications')
        .select('*, gigs(id, title, client_id), applicant:user_profiles!gig_applications_applicant_id_fkey(full_name, role)')
        .in('gig_id', gigIds)
        .order('created_at', { ascending: false });
      if (received) setReceivedApps(received);
    }

    // Fetch apps user sent
    const { data: sent } = await supabase
      .from('gig_applications')
      .select('*, gigs(id, title, client_id, poster:user_profiles!gigs_client_id_fkey(full_name, role))')
      .eq('applicant_id', user.id)
      .order('created_at', { ascending: false });
    if (sent) setSentApps(sent);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white border-[5px] sm:border-[8px] border-black rounded-[28px] sm:rounded-[40px] w-full max-w-[800px] h-[86vh] sm:h-[80vh] overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,1)] sm:shadow-[16px_16px_0px_rgba(0,0,0,1)] relative flex flex-col" onClick={e => e.stopPropagation()}>
          
          {activeChat ? (
            <ChatBox application={activeChat} user={user} gigTitle={activeChat.gigs.title} onBack={() => setActiveChat(null)} />
          ) : (
            <>
              <div style={{ padding: '2rem', borderBottom: '4px solid black', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, textTransform: 'uppercase', fontStyle: 'italic' }}>Inbox</h2>
                <button onClick={onClose} style={{ background: 'black', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', borderBottom: '2px solid #eee' }}>
                <button onClick={() => setActiveTab('received')} style={{ flex: 1, padding: '1rem', background: activeTab === 'received' ? '#f8fafc' : 'white', border: 'none', borderBottom: activeTab === 'received' ? '4px solid black' : '4px solid transparent', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase' }}>Applicants</button>
                <button onClick={() => setActiveTab('sent')} style={{ flex: 1, padding: '1rem', background: activeTab === 'sent' ? '#f8fafc' : 'white', border: 'none', borderBottom: activeTab === 'sent' ? '4px solid black' : '4px solid transparent', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase' }}>My Applications</button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc' }}>
                {activeTab === 'received' && (
                  receivedApps.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontWeight: '800' }}>No one has applied to your gigs yet!</div>
                  ) : (
                    receivedApps.map(app => (
                      <div key={app.id} onClick={() => setActiveChat(app)} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '2px solid #eee', marginBottom: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.border = '2px solid black'} onMouseLeave={e => e.currentTarget.style.border = '2px solid #eee'}>
                        <div>
                          <div style={{ fontWeight: '900', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={18}/> {app.applicant?.full_name || 'Anonymous'}</div>
                          <div style={{ color: '#666', fontWeight: '700', fontSize: '0.9rem', marginTop: '0.3rem' }}>Applied for: {app.gigs?.title}</div>
                        </div>
                        <div style={{ background: '#000', color: '#fff', padding: '0.5rem 1rem', borderRadius: '100px', fontWeight: '900', fontSize: '0.8rem' }}>CHAT</div>
                      </div>
                    ))
                  )
                )}

                {activeTab === 'sent' && (
                  sentApps.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontWeight: '800' }}>You haven't applied to any gigs yet!</div>
                  ) : (
                    sentApps.map(app => (
                      <div key={app.id} onClick={() => setActiveChat(app)} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '2px solid #eee', marginBottom: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.border = '2px solid black'} onMouseLeave={e => e.currentTarget.style.border = '2px solid #eee'}>
                        <div>
                          <div style={{ fontWeight: '900', fontSize: '1.2rem' }}>{app.gigs?.title}</div>
                          <div style={{ color: '#666', fontWeight: '700', fontSize: '0.9rem', marginTop: '0.3rem' }}>Posted by: {app.gigs?.poster?.full_name || 'Unknown'}</div>
                        </div>
                        <div style={{ background: '#10b981', color: '#fff', padding: '0.5rem 1rem', borderRadius: '100px', fontWeight: '900', fontSize: '0.8rem' }}>OPEN CHAT</div>
                      </div>
                    ))
                  )
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


const Footer = ({ setPage }) => {
  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 overflow-hidden relative">
      {/* Background Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent opacity-50" />

      <div className="container mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <motion.div
              whileHover={{ scale: 1.02, rotate: -1 }}
              className="brand cursor-pointer flex items-center bg-brand-red px-5 py-2 rounded-xl shadow-neo w-fit"
              onClick={() => setPage('home')}
            >
              <span className="text-white text-2xl font-black tracking-tight font-['Space_Grotesk']">Bartr.in</span>
            </motion.div>
            <p className="text-slate-400 font-bold leading-relaxed text-lg">
              India's premiere hyperlocal platform. Connecting the city's talent with immediate local needs through transparency and technology.
            </p>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full w-fit">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-300">Live in India</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-[0.3em] mb-8">Platform</h4>
            <ul className="space-y-5">
              {[
                { name: 'Browse Gigs', page: 'gigs' },
                { name: 'India Events', page: 'events' },
                { name: 'Careers', page: 'careers' },
                { name: 'TRI Score', page: 'tri-score' }
              ].map((link) => (
                <motion.li
                  key={link.name}
                  whileHover={{ x: 8, color: '#ef4444' }}
                  className="text-slate-400 font-bold cursor-pointer transition-colors"
                  onClick={() => setPage(link.page)}
                >
                  {link.name}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-[0.3em] mb-8">Support</h4>
            <ul className="space-y-5">
              {[
                'Terms of Service',
                'Privacy Policy',
                'Safety Center',
                'Business Solutions'
              ].map((link) => (
                <motion.li
                  key={link}
                  whileHover={{ x: 8, color: '#ef4444' }}
                  className="text-slate-400 font-bold cursor-pointer transition-colors"
                >
                  {link}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-8">
            <h4 className="text-white font-black text-sm uppercase tracking-[0.3em] mb-8">Connect</h4>
            <div className="space-y-4">
              <a href="mailto:communication@bartr.in" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                <div className="bg-white/5 p-2 rounded-lg group-hover:bg-brand-red/10 transition-colors"><Mail size={18} /></div>
                <span className="font-bold">communication@bartr.in</span>
              </a>
              <div className="flex items-center gap-3 text-slate-400">
                <div className="bg-white/5 p-2 rounded-lg"><MapPin size={18} /></div>
                <span className="font-bold">India, Maharashtra</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {[Users, ShieldCheck, Globe].map((Icon, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5, backgroundColor: '#ef4444', borderColor: '#000' }}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer transition-all shadow-crystal"
                >
                  <Icon size={20} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-500 font-bold text-sm">
            © 2026 Bartr Platform. All rights reserved. Built for <span className="text-white">India.</span>
          </p>
          <div className="flex items-center gap-8">
            <motion.a whileHover={{ color: 'white' }} href="#" className="text-slate-500 font-black text-xs uppercase tracking-widest transition-colors">Instagram</motion.a>
            <motion.a whileHover={{ color: 'white' }} href="#" className="text-slate-500 font-black text-xs uppercase tracking-widest transition-colors">LinkedIn</motion.a>
            <div className="h-4 w-px bg-white/10 hidden md:block" />
            <span className="text-slate-500 font-bold text-sm">v1.0.4 Premium</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- LANDING PAGE ---
function LandingPage({ setPage, isLoggedIn, onAuth, onLogout }) {
  const [scrolled, setScrolled] = useState(false);

  // Scroll Parallax Hooks
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 250]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const bgScale = useTransform(scrollY, [0, 1000], [1, 1.4]);
  const bgRotate = useTransform(scrollY, [0, 1000], [0, 15]);

  // Roadmap Hooks
  const roadmapRef = useRef(null);
  const { scrollYProgress: roadmapProgress } = useScroll({
    target: roadmapRef,
    offset: ["start center", "end center"]
  });
  const lineHeight = useTransform(roadmapProgress, [0, 1], ["0%", "100%"]);
  const lineWidth = useTransform(roadmapProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Landing page main container */}
      <Navbar scrolled={scrolled} setPage={setPage} isDark={false} isLoggedIn={isLoggedIn} onAuth={onAuth} onLogout={onLogout} currentPage="home" />
      <section className="hero relative overflow-hidden w-full min-h-screen flex items-center pt-[180px] md:pt-[120px] pb-20">
        <div className="absolute inset-0 z-0">
          <TracingBackground />
        </div>

        {/* Bottom Fade Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white to-transparent z-[1] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerCards}
            className="w-full max-w-[950px]"
            style={{ y: heroY, opacity: heroOpacity }}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-brand-red/10 text-brand-red border border-brand-red/20 px-5 py-2.5 rounded-full font-black text-sm mb-8 shadow-crystal animate-pulse-slow">
              <MapPin size={18} className="animate-bounce" />
              Showing opportunities from India
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-[clamp(3rem,12vw,9rem)] font-black leading-[0.8] tracking-tighter mb-2 text-slate-900 filter drop-shadow-sm">
              Post what you <span className="text-brand-red">need.</span>
            </motion.h1>

            <motion.h1 variants={fadeInUp} className="text-[clamp(2rem,8vw,6rem)] font-black leading-[0.8] tracking-tight text-slate-800 mb-8 opacity-90">
              Find work near you.
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-3xl text-slate-600 font-medium leading-relaxed max-w-[750px] mb-10 opacity-80 px-1 md:px-0">
              Bartr is India's hyperlocal platform for workers, businesses, and individuals to exchange services, gigs, and opportunities — instantly and transparently.
            </motion.p>

          </motion.div>
        </div>
      </section>



      <div className="marquee-container" style={{ position: 'relative', zIndex: 11 }}>
        <div className="marquee-content" style={{ background: 'linear-gradient(90deg, var(--brand-red), #ff8a00)' }}>
          <span>• HYPERLOCAL SERVICES</span>
          <span>• VERIFIED PROFILES</span>
          <span>• INSTANT CONNECTIONS</span>
          <span>• AI MODERATION</span>
          <span>• INDIA FIRST</span>
          <span>• CITY WIDE EXPOSURE</span>
          <span>• SECURE PLATFORM</span>
          <span>• NO SPAM</span>
          {/* Duplicate for seamless scrolling */}
          <span>• HYPERLOCAL SERVICES</span>
          <span>• VERIFIED PROFILES</span>
          <span>• INSTANT CONNECTIONS</span>
          <span>• AI MODERATION</span>
          <span>• INDIA FIRST</span>
          <span>• CITY WIDE EXPOSURE</span>
          <span>• SECURE PLATFORM</span>
          <span>• NO SPAM</span>
        </div>
      </div>

      <section id="how-it-works" ref={roadmapRef} className="section section-bg-alt relative py-24 md:py-32 overflow-hidden">
        <FloatingIconsBackground />
        <div className="container mx-auto px-6 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="section-header"
          >
            <span className="section-tag">Smooth Process</span>
            <h2 className="section-title" style={{
              background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--brand-red) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>The Bartr Journey</h2>
            <p className="section-subtitle">How we connect your needs with local talent instantly.</p>
          </motion.div>

          <div className="roadmap-container">
            {/* Desktop Horizontal Line */}
            <div className="desktop-line-container">
              <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'var(--border-color)', borderRadius: '4px' }} />
              <motion.div style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: 'linear-gradient(to right, var(--brand-red), #ff8a00)', width: lineWidth, borderRadius: '4px', zIndex: 1 }} />
            </div>

            {/* Mobile Vertical Line */}
            <div className="mobile-line-container">
              <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'var(--border-color)', borderRadius: '4px' }} />
              <motion.div style={{ position: 'absolute', left: 0, top: 0, width: '100%', background: 'linear-gradient(to bottom, var(--brand-red), #ff8a00)', height: lineHeight, borderRadius: '4px', zIndex: 1 }} />
            </div>

            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="roadmap-step"
            >
              <h3 style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', marginBottom: '1rem' }}>1. Post Any Service Needed</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '2rem' }}>From plumbing to programming, repairing to designing. Post exactly what you need in under a minute without long forms.</p>
              <div className="roadmap-icons" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <motion.div whileHover={{ scale: 1.1, y: -5, color: '#f59e0b' }} className="modern-card" style={{ padding: '1rem', borderRadius: '16px' }}><Wrench size={24} /></motion.div>
                <motion.div whileHover={{ scale: 1.1, y: -5, color: '#3b82f6' }} className="modern-card" style={{ padding: '1rem', borderRadius: '16px' }}><Code size={24} /></motion.div>
                <motion.div whileHover={{ scale: 1.1, y: -5, color: '#10b981' }} className="modern-card" style={{ padding: '1rem', borderRadius: '16px' }}><Paintbrush size={24} /></motion.div>
                <motion.div whileHover={{ scale: 1.1, y: -5, color: '#ec4899' }} className="modern-card" style={{ padding: '1rem', borderRadius: '16px' }}><Scissors size={24} /></motion.div>
                <motion.div whileHover={{ scale: 1.1, y: -5, color: '#8b5cf6' }} className="modern-card" style={{ padding: '1rem', borderRadius: '16px' }}><Camera size={24} /></motion.div>
                <motion.div whileHover={{ scale: 1.1, y: -5, color: '#ef4444' }} className="modern-card" style={{ padding: '1rem', borderRadius: '16px' }}><Music size={24} /></motion.div>
                <motion.div whileHover={{ scale: 1.1, y: -5, color: '#0f172a' }} className="modern-card" style={{ padding: '1rem', borderRadius: '16px' }}><Briefcase size={24} /></motion.div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="roadmap-step"
            >
              <h3 style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', marginBottom: '1rem' }}>2. AI Radar Matching</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '2rem' }}>Our AI scans your neighborhood instantly (within a 5km radius) to alert highly skilled and relevant local pros via push notifications.</p>
              <motion.div
                animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 0 0 rgba(239,68,68,0)', '0 0 0 20px rgba(239,68,68,0.1)', '0 0 0 40px rgba(239,68,68,0)'] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="modern-card" style={{ padding: '2rem', borderRadius: '50%', display: 'inline-flex', background: 'var(--brand-red-light)', color: 'var(--brand-red)', border: 'none' }}
              >
                <Search size={48} />
              </motion.div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="roadmap-step"
            >
              <h3 style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', marginBottom: '1rem' }}>3. Direct Connection</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '2rem' }}>Chat securely, agree on price, and get the job done quickly. No middlemen holding your money hostage.</p>
              <motion.div whileHover={{ scale: 1.05 }} className="modern-card" style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '24px', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, var(--brand-red) 0%, #ff8a00 100%)', color: 'white', border: 'none' }}>
                <div style={{ background: 'white', color: 'var(--brand-red)', padding: '0.5rem', borderRadius: '12px' }}><MessageSquare size={24} /></div>
                <span style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)', fontWeight: 'bold' }}>"I can be there in 10 mins!"</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="container grid-2">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerCards}
          >
            <motion.span variants={fadeInUp} className="section-tag">Core Value</motion.span>
            <motion.h2 variants={fadeInUp} className="section-title" style={{
              background: 'linear-gradient(135deg, var(--brand-red) 0%, #ff8a00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Hyperlocal by Design</motion.h2>

            <ul className="check-list" style={{ marginTop: '2rem' }}>
              <motion.li variants={fadeInUp} whileHover={{ x: 15, color: 'var(--brand-red)' }}>
                <div className="check-icon"><MapPin size={24} /></div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)' }}>City-first approach</h4>
                  <span style={{ fontSize: '1.125rem' }}>Starting with India, focusing on local demand.</span>
                </div>
              </motion.li>
              <motion.li variants={fadeInUp} whileHover={{ x: 15, color: 'var(--brand-red)' }} style={{ margin: '2rem 0' }}>
                <div className="check-icon"><Users size={24} /></div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)' }}>Nearby users first</h4>
                  <span style={{ fontSize: '1.125rem' }}>No global spam. Connect with your neighborhood.</span>
                </div>
              </motion.li>
              <motion.li variants={fadeInUp} whileHover={{ x: 15, color: 'var(--brand-red)' }}>
                <div className="check-icon"><ShieldCheck size={24} /></div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)' }}>Trust & Safety Built-In</h4>
                  <span style={{ fontSize: '1.125rem' }}>AI moderation & verified users for a safe ecosystem.</span>
                </div>
              </motion.li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            style={{ position: 'relative' }}
          >
            <motion.div
              animate="animate"
              variants={floatAnim}
              style={{ background: 'linear-gradient(135deg, var(--brand-red) 0%, #ff8a00 100%)', borderRadius: '32px', padding: '1rem' }}
            >
              <div style={{ background: 'white', borderRadius: '24px', padding: 'clamp(1.5rem, 8vw, 3rem)', transform: 'rotate(-4deg)', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--brand-red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-red)' }}>
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}><MessageSquare size={28} /></motion.div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem' }}>Need a Plumber!</h4>
                    <p style={{ color: 'var(--brand-red)' }}>0.5km away • High Priority</p>
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <Users size={28} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem' }}>Freelance Web Dev</h4>
                    <p style={{ color: 'var(--text-secondary)' }}>1.2km away • Applied 2m ago</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="testimonials" className="section relative py-24 md:py-32 overflow-hidden bg-slate-50/30">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest mb-6 border border-rose-100 shadow-sm">
              Real Stories
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-6">What India is <span className="text-brand-red">Saying.</span></h2>
            <p className="text-lg md:text-xl text-slate-500 font-bold max-w-2xl mx-auto">Join thousands of local professionals who have transformed their work-life balance on Bartr.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerCards}
          >
            {[
              { quote: "I posted once and got 3 calls in 15 minutes. Much faster and direct than any other app.", author: "Local Freelancer" },
              { quote: "Much better than WhatsApp groups. Cleaner, faster, and actually shows relevant people nearby.", author: "Small Business Owner" },
              { quote: "Feels local and real, not like those massive job portals. Found a great gig a few blocks away.", author: "Individual User" }
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 md:p-10 shadow-crystal relative group"
              >
                <div className="text-brand-red mb-6 opacity-30 group-hover:opacity-100 transition-opacity"><Quote size={40} fill="currentColor" /></div>
                <p className="text-lg md:text-xl font-bold text-slate-700 italic mb-8 relative z-10 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-brand-red/20 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-brand-red/10 to-orange-500/10" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 leading-none mb-1">{t.author}</h4>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">India, India</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </motion.div>
  );
}


