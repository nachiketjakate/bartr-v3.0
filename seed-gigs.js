import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const dummyGigs = [
  {
    title: 'Need a Plumber for Kitchen Sink Repair',
    category: 'Manual',
    price: '₹800',
    description: 'My kitchen sink is leaking badly. Need an experienced plumber to fix it ASAP. The tap also needs replacement. Should take 2-3 hours max.',
    location: 'Dharampeth, Nagpur',
    status: 'Active'
  },
  {
    title: 'Build a React E-commerce Website',
    category: 'Digital',
    price: '₹15,000 - Negotiable',
    description: 'Looking for a React developer to build a modern e-commerce website. Need product listing, cart, checkout, and payment integration. Must be mobile responsive. Timeline: 3-4 weeks.',
    location: 'Remote',
    status: 'Active'
  },
  {
    title: 'Graphic Designer for Logo Design',
    category: 'Creative',
    price: '₹2,500',
    description: 'Need a creative logo for my new startup "TechFlow". Looking for modern, minimalist design. Should work well in both color and black & white. Need 3-4 concepts to choose from.',
    location: 'Remote',
    status: 'Active'
  },
  {
    title: 'Home Cleaning Service Required',
    category: 'Manual',
    price: '₹500/day',
    description: 'Need reliable house cleaning service for a 2BHK apartment. Deep cleaning required including kitchen, bathrooms, and all rooms. Prefer someone with experience and references.',
    location: 'Sadar, Nagpur',
    status: 'Active'
  },
  {
    title: 'Photography for Wedding Event',
    category: 'Creative',
    price: '₹25,000',
    description: 'Looking for professional photographer for wedding ceremony on June 15th. Need full day coverage (8 hours), candid shots, and edited photos within 2 weeks. Portfolio required.',
    location: 'Civil Lines, Nagpur',
    status: 'Active'
  },
  {
    title: 'Mobile App Development - Fitness Tracker',
    category: 'Digital',
    price: '₹40,000 - Negotiable',
    description: 'Need Android & iOS app for fitness tracking. Features: workout logging, calorie counter, progress charts, social sharing. Must integrate with Google Fit and Apple Health. 2-3 months timeline.',
    location: 'Remote',
    status: 'Active'
  },
  {
    title: 'Electrician for Home Wiring',
    category: 'Manual',
    price: '₹3,000',
    description: 'Need certified electrician to fix electrical wiring issues in my home. Some switches not working, need new fan installation, and general safety check. Urgent requirement.',
    location: 'Sitabuldi, Nagpur',
    status: 'Active'
  },
  {
    title: 'Content Writer for Blog Posts',
    category: 'Digital',
    price: '₹500/article',
    description: 'Looking for experienced content writer for tech blog. Need 10 articles per month (800-1000 words each). Topics: AI, web development, mobile apps. SEO knowledge required.',
    location: 'Remote',
    status: 'Active'
  },
  {
    title: 'Carpenter for Custom Furniture',
    category: 'Manual',
    price: '₹12,000',
    description: 'Need skilled carpenter to build custom bookshelf and study table. Have specific design in mind. Quality wood work required. Will provide materials, need labor and expertise.',
    location: 'Laxmi Nagar, Nagpur',
    status: 'Active'
  },
  {
    title: 'Video Editor for YouTube Channel',
    category: 'Creative',
    price: '₹800/video',
    description: 'Looking for video editor for my tech review YouTube channel. Need 4-5 videos edited per week. Should include intro/outro, transitions, color grading, and sound mixing. Quick turnaround needed.',
    location: 'Remote',
    status: 'Active'
  },
  {
    title: 'Tutor for Class 10 Mathematics',
    category: 'Manual',
    price: '₹400/hour',
    description: 'Need experienced math tutor for my son preparing for board exams. Topics: Algebra, Geometry, Trigonometry. Prefer home tuition 3 times a week. Must have good track record.',
    location: 'Pratap Nagar, Nagpur',
    status: 'Active'
  },
  {
    title: 'Social Media Manager for Startup',
    category: 'Digital',
    price: '₹8,000/month',
    description: 'Looking for social media manager to handle Instagram, Facebook, and LinkedIn for my food delivery startup. Need content creation, posting schedule, engagement, and growth strategies.',
    location: 'Remote',
    status: 'Active'
  },
  {
    title: 'Interior Designer for 3BHK Flat',
    category: 'Creative',
    price: '₹20,000 - Negotiable',
    description: 'Need interior designer for complete 3BHK flat design. Looking for modern contemporary style. Need 3D renders, material selection, and execution supervision. Budget flexible for right designer.',
    location: 'Manish Nagar, Nagpur',
    status: 'Active'
  },
  {
    title: 'Car Mechanic for Servicing',
    category: 'Manual',
    price: '₹2,500',
    description: 'Need reliable car mechanic for Honda City servicing. Oil change, brake check, AC servicing, and general inspection needed. Prefer someone who can come to my location.',
    location: 'Shankar Nagar, Nagpur',
    status: 'Active'
  },
  {
    title: 'Voice Over Artist for Commercial',
    category: 'Creative',
    price: '₹3,000',
    description: 'Looking for professional voice over artist (male/female) for 30-second radio commercial. Need clear, energetic voice. Hindi and English both required. Send voice samples.',
    location: 'Remote',
    status: 'Active'
  }
];

async function seedGigs() {
  console.log('🌱 Starting to seed dummy gigs...\n');

  try {
    // First, get the current user or create a test user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('⚠️  No authenticated user found. Please login first or the gigs will be created without a client_id.');
      console.log('   You can still run this script, but you won\'t be able to test as the gig owner.\n');
      
      // Try to get any existing user from profiles
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      if (profiles && profiles.length > 0) {
        const clientId = profiles[0].id;
        console.log(`✅ Using existing user ID: ${clientId}\n`);
        await insertGigs(clientId);
      } else {
        console.log('❌ No users found in database. Please create an account first.');
        process.exit(1);
      }
    } else {
      console.log(`✅ Authenticated as: ${user.email}`);
      console.log(`   User ID: ${user.id}\n`);
      await insertGigs(user.id);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function insertGigs(clientId) {
  const gigsWithClient = dummyGigs.map(gig => ({
    ...gig,
    client_id: clientId
  }));

  console.log(`📝 Inserting ${gigsWithClient.length} dummy gigs...\n`);

  const { data, error } = await supabase
    .from('gigs')
    .insert(gigsWithClient)
    .select();

  if (error) {
    console.error('❌ Error inserting gigs:', error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully inserted ${data.length} gigs!\n`);
  console.log('📋 Gig Summary:');
  console.log('─'.repeat(60));
  
  const categoryCounts = {};
  data.forEach(gig => {
    categoryCounts[gig.category] = (categoryCounts[gig.category] || 0) + 1;
  });

  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} gigs`);
  });

  console.log('─'.repeat(60));
  console.log('\n🎉 All done! You can now test:');
  console.log('   • Browse gigs on the Gigs page');
  console.log('   • Apply to gigs');
  console.log('   • Chat with gig posters');
  console.log('   • Negotiate prices');
  console.log('\n💡 Tip: Create another account to test the full chat experience!');
  
  process.exit(0);
}

seedGigs();
