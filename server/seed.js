require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const VolunteerProfile = require('./models/VolunteerProfile');
const Community = require('./models/Community');
const CommunityMembership = require('./models/CommunityMembership');
const Event = require('./models/Event');
const Application = require('./models/Application');
const Assignment = require('./models/Assignment');
const AttendanceLog = require('./models/AttendanceLog');
const Rating = require('./models/Rating');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');
const { calculateMatchScore } = require('./utils/matching');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thouram';

async function seed() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected.');

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      VolunteerProfile.deleteMany({}),
      Community.deleteMany({}),
      CommunityMembership.deleteMany({}),
      Event.deleteMany({}),
      Application.deleteMany({}),
      Assignment.deleteMany({}),
      AttendanceLog.deleteMany({}),
      Rating.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log('[Seed] Creating demo users...');
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // 1. Organizer
    const organizer = await User.create({
      name: 'Priya Sharma',
      email: 'organizer@thouram.org',
      passwordHash: hashedPassword,
      phone: '+91 98765 43210',
      globalRole: 'organizer',
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
    });

    // 2. Sub-manager
    const subManager = await User.create({
      name: 'Rohan Verma',
      email: 'submanager@thouram.org',
      passwordHash: hashedPassword,
      phone: '+91 98765 43211',
      globalRole: 'sub-manager',
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
    });

    // 3. Primary Demo Volunteer
    const primaryVolunteer = await User.create({
      name: 'Aarav Patel',
      email: 'volunteer@thouram.org',
      passwordHash: hashedPassword,
      phone: '+91 98765 43212',
      globalRole: 'volunteer',
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
    });

    await VolunteerProfile.create({
      user: primaryVolunteer._id,
      bio: 'Enthusiastic community volunteer dedicated to civic education, environmental sustainability, and youth mentorship across India.',
      skills: ['Beach Cleanup', 'Crowd Guidance', 'First Aid', 'Digital Training', 'Logistics Support'],
      interests: ['Environment', 'Technology and Education', 'Social Welfare', 'Arts and Culture'],
      availability: {
        weekdays: false,
        weekends: true,
        mornings: true,
        afternoons: true
      },
      languages: ['English', 'Hindi', 'Tamil'],
      city: 'Chennai',
      location: {
        type: 'Point',
        coordinates: [80.2707, 13.0827]
      },
      travelRadiusKm: 35,
      metrics: {
        reliabilityScore: 98,
        averageRating: 4.9,
        verifiedHoursTotal: 64,
        eventsCompleted: 14
      }
    });

    // 4. Create 55 additional diverse volunteers
    console.log('[Seed] Creating 55 additional demo volunteers...');
    const extraVolunteers = [];
    const volunteerProfiles = [];

    const indianNames = [
      'Ananya Iyer', 'Aditya Nair', 'Kavita Sengupta', 'Rahul Mehta',
      'Neha Joshi', 'Vivek Singhania', 'Sneha Pillai', 'Arjun Kulkarni',
      'Pooja Deshmukh', 'Karan Malhotra', 'Tanvi Bhat', 'Vikram Choudhury',
      'Isha Mukherjee', 'Manish Reddy', 'Ritu Saxena', 'Siddharth Rao',
      'Divya Nambiar', 'Gaurav Banerjee', 'Shreya Aggarwal', 'Deepak Tiwari',
      'Meera Varma', 'Abhishek Menon', 'Anushka Goyal', 'Rajesh Krishnan',
      'Preeti Chauhan', 'Sunil Narang', 'Swati Kapoor', 'Naveen Dutta',
      'Payal Chawla', 'Harsh Trivedi', 'Simran Anand', 'Akash Jain',
      'Pallavi Roy', 'Sachin Hegde', 'Meghna Das', 'Rohit Kaul',
      'Tara Srinivasan', 'Varun Goswami', 'Anjali Pandey', 'Kunal Merchant',
      'Bhavna Shukla', 'Mohit Bansal', 'Komal Sethi', 'Alok Mathur',
      'Nandini Murthy', 'Prateek Bajaj', 'Kiran Bedi', 'Devendra Yadav',
      'Rashmi Prasad', 'Sanjay Bhattacharya', 'Garima Mittal', 'Uday Shankar',
      'Shalini Sen', 'Tushar Grover', 'Smita Bhatt'
    ];

    for (let i = 0; i < 55; i++) {
      const vName = indianNames[i] || `Volunteer ${i + 1}`;
      const vEmail = `volunteer${i + 1}@thouram.org`;
      const user = await User.create({
        name: vName,
        email: vEmail,
        passwordHash: hashedPassword,
        phone: `+91 98765 ${40000 + i}`,
        globalRole: 'volunteer',
        isEmailVerified: true,
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (i * 12345) % 80000000}?auto=format&fit=crop&q=80&w=256`
      });

      extraVolunteers.push(user);

      volunteerProfiles.push({
        user: user._id,
        bio: `Active community volunteer serving urban and grassroots initiatives across India.`,
        skills: [
          i % 2 === 0 ? 'Beach Cleanup' : 'First Aid',
          i % 3 === 0 ? 'Crowd Guidance' : 'Digital Training',
          'Logistics Support'
        ],
        interests: ['Environment', 'Education and Community Development', 'Social Welfare'],
        city: 'Chennai',
        location: {
          type: 'Point',
          coordinates: [80.2707 + (Math.random() - 0.5) * 0.1, 13.0827 + (Math.random() - 0.5) * 0.1]
        },
        travelRadiusKm: 25,
        metrics: {
          reliabilityScore: Math.floor(88 + Math.random() * 12),
          averageRating: Math.round((4.2 + Math.random() * 0.8) * 10) / 10,
          verifiedHoursTotal: Math.floor(10 + Math.random() * 50),
          eventsCompleted: Math.floor(3 + Math.random() * 10)
        }
      });
    }

    await VolunteerProfile.insertMany(volunteerProfiles);

    // 5. Community
    console.log('[Seed] Creating demo pan-India community...');
    const community = await Community.create({
      name: 'India Community Action Network',
      slug: 'india-action-network',
      description: 'A nationwide coalition of community organizers, civic volunteers, and social welfare leaders coordinating impactful local events across India.',
      mission: 'Mobilize citizen volunteers to build cleaner, more educated, and resilient Indian communities.',
      location: {
        city: 'Pan-India',
        state: 'National Network',
        country: 'India'
      },
      contactEmail: 'contact@thouram.org',
      contactPhone: '+91 11 2345 6789',
      logo: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=300',
      coverImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1400',
      createdBy: organizer._id,
      isVerified: true,
      status: 'approved',
      verificationDetails: {
        verifiedAt: new Date(),
        badgeType: 'verified_ngo',
        notes: 'National Community Impact Registered Partner'
      },
      stats: {
        totalEventsHosted: 42,
        totalVolunteersMobilized: 1850,
        totalHoursLogged: 8400
      },
      memberCount: 3
    });

    await CommunityMembership.create([
      { user: organizer._id, community: community._id, role: 'organizer', status: 'active' },
      { user: subManager._id, community: community._id, role: 'sub-manager', status: 'active', delegatedDuties: ['Shoreline Waste Sorting'] },
      { user: primaryVolunteer._id, community: community._id, role: 'volunteer', status: 'active' }
    ]);

    // 6. POPULATE THE 6 VARIED PAN-INDIA SAMPLE EVENTS MANDATED BY USER SPEC
    console.log('[Seed] Creating 6 required pan-India events...');

    // Event 1: Clean Coast Community Drive — Chennai, Environment (Flagship 50 volunteers + 5 backups)
    const cleanCoastEvent = await Event.create({
      community: community._id,
      createdBy: organizer._id,
      title: 'Clean Coast Community Drive',
      description: 'Join our comprehensive coastal preservation drive along Marina and Besant Nagar beaches. Volunteers will segregate ocean plastics, establish beach cleanup zones, deploy eco-receptacles, and educate beachgoers on sustainable waste disposal.',
      cause: 'Environment',
      status: 'published',
      location: {
        venue: 'Marina Beach Promenade & Lighthouse Grounds',
        address: 'Kamarajar Salai, Marina Beach',
        city: 'Chennai',
        area: 'Coastal Zone',
        coordinates: { type: 'Point', coordinates: [80.2824, 13.0499] },
        meetingPoint: 'Lighthouse Plaza Information Desk',
        isVirtual: false
      },
      dateTime: {
        start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        timeZone: 'Asia/Kolkata',
        checkInOpensMinutesBefore: 45,
        checkInClosesMinutesAfter: 60
      },
      duties: [
        {
          title: 'Shoreline Plastic Segregation',
          description: 'Sort recyclable plastics, microplastics, and discarded nets along the shoreline.',
          requiredSkills: ['Beach Cleanup', 'Physical Stamina'],
          volunteersRequired: 20,
          volunteersConfirmed: 20,
          physicalIntensity: 'high'
        },
        {
          title: 'Eco-Bin Deployment & Trail Marking',
          description: 'Place color-coded waste bins and install reusable informational signage.',
          requiredSkills: ['Logistics Support', 'Teamwork'],
          volunteersRequired: 15,
          volunteersConfirmed: 15,
          physicalIntensity: 'moderate'
        },
        {
          title: 'Visitor Outreach & Public Guidance',
          description: 'Engage visitors and morning walkers on marine ecology and zero-litter habits.',
          requiredSkills: ['Crowd Guidance', 'Communication'],
          volunteersRequired: 10,
          volunteersConfirmed: 10,
          physicalIntensity: 'low'
        },
        {
          title: 'First Aid & Volunteer Care Station',
          description: 'Provide electrolyte hydration, sunscreen, and immediate first aid to coastal volunteers.',
          requiredSkills: ['First Aid', 'Care'],
          volunteersRequired: 5,
          volunteersConfirmed: 5,
          physicalIntensity: 'moderate'
        }
      ],
      capacity: {
        totalRequired: 50,
        confirmed: 50,
        waitlisted: 5,
        backupCount: 5
      },
      volunteerInstructions: 'Assemble at Lighthouse Plaza by 6:45 AM. Wear comfortable walking shoes and bring your sun hat.',
      whatToBring: ['Reusable water bottle', 'Cotton cap/hat', 'Comfortable sports shoes'],
      providedOnSite: ['Protective gloves', 'Segregation sacks', 'Hydration & fresh breakfast', 'Safety first-aid kit'],
      safety: {
        firstAidAvailable: true,
        emergencyContact: '+91 98765 43210 (Priya Sharma)',
        physicalRequirements: 'Comfortable with outdoor movement and moderate physical tasks.',
        accessibilityNotes: 'Visitor outreach roles are fully wheelchair accessible on paved promenade.'
      },
      tags: ['Environment', 'Coastal Cleanup', 'Ocean Life', 'Zero Waste', 'Chennai'],
      imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&q=80&w=1200',
      publishedAt: new Date()
    });

    // Event 2: Future Skills Tech Fest 2026 — Bengaluru, Technology and Education
    const techFestEvent = await Event.create({
      community: community._id,
      createdBy: organizer._id,
      title: 'Future Skills Tech Fest 2026',
      description: 'A community-led technology festival bringing open-source workshops, coding bootcamps, and AI ethics seminars to underprivileged students. Volunteers mentor youth and manage project showcase booths.',
      cause: 'Technology and Education',
      status: 'published',
      location: {
        venue: 'Koramangala Community Convention Centre',
        address: '80 Feet Road, 4th Block, Koramangala',
        city: 'Bengaluru',
        area: 'Koramangala',
        coordinates: { type: 'Point', coordinates: [77.6245, 12.9352] },
        meetingPoint: 'Innovation Hall A Entryway',
        isVirtual: false
      },
      dateTime: {
        start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        timeZone: 'Asia/Kolkata',
        checkInOpensMinutesBefore: 30,
        checkInClosesMinutesAfter: 60
      },
      duties: [
        {
          title: 'Student Code Mentor',
          description: 'Guide school students through foundational Python and Scratch coding exercises.',
          requiredSkills: ['Digital Training', 'Mentorship'],
          volunteersRequired: 15,
          volunteersConfirmed: 12,
          physicalIntensity: 'low'
        },
        {
          title: 'Demo Stage Coordinator',
          description: 'Manage audio-visual hardware, presenter microphones, and project demonstration queues.',
          requiredSkills: ['Logistics Support', 'Communication'],
          volunteersRequired: 10,
          volunteersConfirmed: 8,
          physicalIntensity: 'moderate'
        }
      ],
      capacity: {
        totalRequired: 25,
        confirmed: 20,
        waitlisted: 2,
        backupCount: 3
      },
      volunteerInstructions: 'Laptops with web browser required for mentors. Tech fest t-shirts provided at badge desk.',
      whatToBring: ['Laptop & charger', 'Notepad', 'Government ID'],
      providedOnSite: ['High-speed Wi-Fi', 'Event T-shirt & lanyard', 'Lunch & refreshments'],
      safety: {
        firstAidAvailable: true,
        emergencyContact: '+91 98765 43211 (Rohan Verma)',
        physicalRequirements: 'Indoor seated mentoring and light event coordination.',
        accessibilityNotes: 'Elevators and wheelchair ramps available throughout convention centre.'
      },
      tags: ['Technology and Education', 'Coding', 'Youth Mentorship', 'Bengaluru', 'Open Source'],
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200',
      publishedAt: new Date()
    });

    // Event 3: Digital Literacy Drive — Pune, Education and Community Development
    const digitalDriveEvent = await Event.create({
      community: community._id,
      createdBy: organizer._id,
      title: 'Digital Literacy Drive',
      description: 'Empowering senior citizens and community vendors with hands-on training in mobile banking, UPI security, citizen portal navigation, and avoiding cyber fraud.',
      cause: 'Education and Community Development',
      status: 'published',
      location: {
        venue: 'Shivajinagar Community Hall',
        address: 'FC Road, Shivajinagar',
        city: 'Pune',
        area: 'Shivajinagar',
        coordinates: { type: 'Point', coordinates: [73.8478, 18.5314] },
        meetingPoint: 'Main Entrance Reception Table',
        isVirtual: false
      },
      dateTime: {
        start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        timeZone: 'Asia/Kolkata',
        checkInOpensMinutesBefore: 30,
        checkInClosesMinutesAfter: 45
      },
      duties: [
        {
          title: 'One-on-One Smartphone Coach',
          description: 'Sit with senior participants to teach DigiLocker, UPI payments, and security PIN hygiene.',
          requiredSkills: ['Digital Training', 'Patience', 'Communication'],
          volunteersRequired: 15,
          volunteersConfirmed: 11,
          physicalIntensity: 'low'
        },
        {
          title: 'Registration & Help Desk',
          description: 'Welcome attendees, issue learning handbooks, and assist with seating logistics.',
          requiredSkills: ['Crowd Guidance', 'Communication'],
          volunteersRequired: 5,
          volunteersConfirmed: 4,
          physicalIntensity: 'low'
        }
      ],
      capacity: {
        totalRequired: 20,
        confirmed: 15,
        waitlisted: 1,
        backupCount: 2
      },
      volunteerInstructions: 'Please arrive 30 minutes before start for a 15-minute curriculum alignment walkthrough.',
      whatToBring: ['Smartphone', 'Friendly smile and patience'],
      providedOnSite: ['Training handouts', 'Tea & snacks', 'Volunteer certificate'],
      safety: {
        firstAidAvailable: true,
        emergencyContact: '+91 98765 43210 (Priya Sharma)',
        physicalRequirements: 'Seated tutoring in air-conditioned community room.',
        accessibilityNotes: 'Ground floor venue with zero stairs.'
      },
      tags: ['Education and Community Development', 'Digital Literacy', 'Pune', 'Senior Support'],
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200',
      publishedAt: new Date()
    });

    // Event 4: Harmony for Hope Benefit Concert — Mumbai, Music and Fundraising
    const concertEvent = await Event.create({
      community: community._id,
      createdBy: organizer._id,
      title: 'Harmony for Hope Benefit Concert',
      description: 'An open-air benefit concert featuring independent indie classical musicians, raising emergency medical relief funds for children across Maharashtra.',
      cause: 'Music and Fundraising',
      status: 'published',
      location: {
        venue: 'Bandra Amphitheatre, Bandstand',
        address: 'Bandstand Promenade, Bandra West',
        city: 'Mumbai',
        area: 'Bandra',
        coordinates: { type: 'Point', coordinates: [72.8197, 19.0434] },
        meetingPoint: 'Artist Gate & Volunteer Desk',
        isVirtual: false
      },
      dateTime: {
        start: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        timeZone: 'Asia/Kolkata',
        checkInOpensMinutesBefore: 60,
        checkInClosesMinutesAfter: 60
      },
      duties: [
        {
          title: 'Guest Hospitality & Ticket Scanning',
          description: 'Scan digital admission passes and usher ticket holders to amphitheatre seating zones.',
          requiredSkills: ['Crowd Guidance', 'Communication'],
          volunteersRequired: 15,
          volunteersConfirmed: 13,
          physicalIntensity: 'moderate'
        },
        {
          title: 'Fundraising Booth Coordinator',
          description: 'Explain donor contribution tiers and guide audience through digital donation QR codes.',
          requiredSkills: ['Communication', 'Care'],
          volunteersRequired: 10,
          volunteersConfirmed: 8,
          physicalIntensity: 'low'
        }
      ],
      capacity: {
        totalRequired: 25,
        confirmed: 21,
        waitlisted: 2,
        backupCount: 3
      },
      volunteerInstructions: 'Dress code: Smart casual black or navy shirts. Report by 4:00 PM for headset briefing.',
      whatToBring: ['Power bank for phone', 'Water bottle'],
      providedOnSite: ['Crew passes', 'Dinner box', 'Concert merchandise'],
      safety: {
        firstAidAvailable: true,
        emergencyContact: '+91 98765 43211 (Rohan Verma)',
        physicalRequirements: 'Intermittent standing and guiding guests across amphitheatre tiers.',
        accessibilityNotes: 'Dedicated wheelchair entrance on north side ramp.'
      },
      tags: ['Music and Fundraising', 'Mumbai', 'Culture', 'Social Good', 'Benefit Concert'],
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200',
      publishedAt: new Date()
    });

    // Event 5: India Community Arts Festival — New Delhi, Arts and Culture
    const artsEvent = await Event.create({
      community: community._id,
      createdBy: organizer._id,
      title: 'India Community Arts Festival',
      description: 'Celebrating traditional and contemporary street art, pottery, mural installations, and handicraft exhibits from folk artisans across all states of India.',
      cause: 'Arts and Culture',
      status: 'published',
      location: {
        venue: 'Central Park Exhibition Ground',
        address: 'Connaught Place, Inner Circle',
        city: 'New Delhi',
        area: 'Connaught Place',
        coordinates: { type: 'Point', coordinates: [77.2185, 28.6328] },
        meetingPoint: 'Gate No. 2 Pavilion',
        isVirtual: false
      },
      dateTime: {
        start: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000),
        timeZone: 'Asia/Kolkata',
        checkInOpensMinutesBefore: 45,
        checkInClosesMinutesAfter: 60
      },
      duties: [
        {
          title: 'Artisan Workshop Assistant',
          description: 'Assist traditional craftsmen with clay preparation, tool sanitization, and attendee queueing.',
          requiredSkills: ['Logistics Support', 'Care'],
          volunteersRequired: 15,
          volunteersConfirmed: 12,
          physicalIntensity: 'moderate'
        },
        {
          title: 'Exhibition Docent & Tour Guide',
          description: 'Lead small visitor groups through cultural pavilions explaining heritage crafts.',
          requiredSkills: ['Communication', 'Public Speaking'],
          volunteersRequired: 10,
          volunteersConfirmed: 7,
          physicalIntensity: 'moderate'
        }
      ],
      capacity: {
        totalRequired: 25,
        confirmed: 19,
        waitlisted: 2,
        backupCount: 3
      },
      volunteerInstructions: 'Wear comfortable shoes for walking. Festival badge and sun umbrella provided.',
      whatToBring: ['Comfortable clothes', 'Sun protection'],
      providedOnSite: ['Artisan festival badge', 'Lunch buffet', 'Craft souvenir kit'],
      safety: {
        firstAidAvailable: true,
        emergencyContact: '+91 98765 43210 (Priya Sharma)',
        physicalRequirements: 'Moderate walking throughout open exhibition garden.',
        accessibilityNotes: 'Paved garden tracks throughout Central Park.'
      },
      tags: ['Arts and Culture', 'Heritage', 'New Delhi', 'Artisan Crafts', 'Community'],
      imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1200',
      publishedAt: new Date()
    });

    // Event 6: City Food Relief Initiative — Hyderabad, Social Welfare
    const foodReliefEvent = await Event.create({
      community: community._id,
      createdBy: organizer._id,
      title: 'City Food Relief Initiative',
      description: 'Community meal prep and nutrition distribution hub packaging wholesome meals for daily-wage migrant workers and shelter residents across Hyderabad.',
      cause: 'Social Welfare',
      status: 'published',
      location: {
        venue: 'Public Garden Community Kitchen & Depot',
        address: 'Nampally Station Road',
        city: 'Hyderabad',
        area: 'Nampally',
        coordinates: { type: 'Point', coordinates: [78.4738, 17.3984] },
        meetingPoint: 'Distribution Bay B Entrance',
        isVirtual: false
      },
      dateTime: {
        start: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        timeZone: 'Asia/Kolkata',
        checkInOpensMinutesBefore: 30,
        checkInClosesMinutesAfter: 45
      },
      duties: [
        {
          title: 'Nutritional Meal Packaging',
          description: 'Package, seal, and label hot nutritious meals into insulated delivery containers.',
          requiredSkills: ['Food Prep', 'Logistics Support'],
          volunteersRequired: 12,
          volunteersConfirmed: 10,
          physicalIntensity: 'moderate'
        },
        {
          title: 'Dispatch & Route Sorting',
          description: 'Organize meal packages by dispatch route zones for community delivery vans.',
          requiredSkills: ['Logistics Support', 'Teamwork'],
          volunteersRequired: 8,
          volunteersConfirmed: 6,
          physicalIntensity: 'moderate'
        }
      ],
      capacity: {
        totalRequired: 20,
        confirmed: 16,
        waitlisted: 2,
        backupCount: 2
      },
      volunteerInstructions: 'Clean kitchen attire required. Aprons, hairnets, and food-grade gloves will be issued on arrival.',
      whatToBring: ['Closed toe shoes', 'Hair tie (if applicable)'],
      providedOnSite: ['Kitchen aprons & hygiene kit', 'Refreshments & tea', 'Service certificate'],
      safety: {
        firstAidAvailable: true,
        emergencyContact: '+91 98765 43211 (Rohan Verma)',
        physicalRequirements: 'Standing packaging line and crate handling.',
        accessibilityNotes: 'Seated packing stations available on request.'
      },
      tags: ['Social Welfare', 'Food Relief', 'Hyderabad', 'Community Kitchen', 'Zero Hunger'],
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1200',
      publishedAt: new Date()
    });

    // 7. Assign Primary Volunteer to Flagship Clean Coast Community Drive as Confirmed
    console.log('[Seed] Assigning primary volunteer and 49 volunteers to Clean Coast Drive (50 confirmed + 5 backups)...');
    const primaryAssignment = await Assignment.create({
      event: cleanCoastEvent._id,
      volunteer: primaryVolunteer._id,
      duty: cleanCoastEvent.duties[0]._id,
      dutyTitle: 'Shoreline Plastic Segregation',
      team: 'Coastal Squad Alpha',
      status: 'confirmed',
      isBackup: false
    });

    // Assign 49 other volunteers to reach 50 confirmed
    for (let i = 0; i < 49; i++) {
      const v = extraVolunteers[i];
      const dutyIndex = i % 4;
      const duty = cleanCoastEvent.duties[dutyIndex];
      await Assignment.create({
        event: cleanCoastEvent._id,
        volunteer: v._id,
        duty: duty._id,
        dutyTitle: duty.title,
        team: `Squad ${String.fromCharCode(65 + dutyIndex)}`,
        status: 'confirmed',
        isBackup: false
      });
    }

    // Assign remaining 5 volunteers (index 49 to 53) as 5 Waitlisted Backups
    for (let i = 0; i < 5; i++) {
      const v = extraVolunteers[49 + i];
      await Assignment.create({
        event: cleanCoastEvent._id,
        volunteer: v._id,
        duty: cleanCoastEvent.duties[i % 4]._id,
        dutyTitle: cleanCoastEvent.duties[i % 4].title,
        status: 'waitlisted',
        isBackup: true,
        waitlistPosition: i + 1
      });
    }

    // 8. Create a Completed Event to demonstrate Check-in, Verified Hours & Feedback Ratings
    console.log('[Seed] Creating completed past event with verified hours and ratings...');
    const completedEvent = await Event.create({
      community: community._id,
      createdBy: organizer._id,
      title: 'Green Urban Canopy Drive',
      description: 'Native tree plantation and public green belt enrichment drive in Lalbagh Botanical Gardens.',
      cause: 'Environment',
      status: 'completed',
      location: {
        venue: 'Lalbagh Botanical Garden West Gate',
        city: 'Bengaluru',
        address: 'Mavalli, Bengaluru',
        coordinates: { type: 'Point', coordinates: [77.5847, 12.9507] }
      },
      dateTime: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        timeZone: 'Asia/Kolkata'
      },
      duties: [
        {
          title: 'Sapling Planting & Staking',
          volunteersRequired: 15,
          volunteersConfirmed: 15
        }
      ],
      capacity: {
        totalRequired: 15,
        confirmed: 15,
        waitlisted: 0,
        backupCount: 2
      },
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200',
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      closedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000)
    });

    const pastAssignment = await Assignment.create({
      event: completedEvent._id,
      volunteer: primaryVolunteer._id,
      dutyTitle: 'Sapling Planting & Staking',
      status: 'completed',
      checkInAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      checkOutAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      checkInMethod: 'qr',
      checkInActor: organizer._id,
      verifiedHours: 4.5
    });

    await AttendanceLog.create({
      event: completedEvent._id,
      volunteer: primaryVolunteer._id,
      assignment: pastAssignment._id,
      action: 'check-in',
      method: 'qr',
      actor: organizer._id
    });

    // Create 2 Separate Ratings: Reliability and Work Quality
    await Rating.create({
      event: completedEvent._id,
      volunteer: primaryVolunteer._id,
      ratedBy: organizer._id,
      reliabilityScore: 5,
      workQualityScore: 5,
      feedbackNotes: 'Aarav demonstrated exemplary punctuality, care for saplings, and remarkable teamwork.'
    });

    // 9. Initial Audit Logs
    await AuditLog.create([
      {
        action: 'event_create',
        actor: organizer._id,
        entityType: 'Event',
        entityId: cleanCoastEvent._id,
        community: community._id,
        event: cleanCoastEvent._id,
        details: { title: cleanCoastEvent.title, capacity: 50, backups: 5 }
      },
      {
        action: 'role_change',
        actor: organizer._id,
        entityType: 'CommunityMembership',
        entityId: subManager._id,
        community: community._id,
        newState: { role: 'sub-manager' },
        reason: 'Appointed as event operations lead'
      }
    ]);

    // 10. Notifications
    await Notification.create([
      {
        user: primaryVolunteer._id,
        title: 'Event Pass Ready!',
        message: `Your verified event pass for "${cleanCoastEvent.title}" is ready. Show your QR pass at Lighthouse Plaza.`,
        type: 'application_status',
        relatedEvent: cleanCoastEvent._id,
        relatedAssignment: primaryAssignment._id
      },
      {
        user: organizer._id,
        title: 'Coastal Drive Fully Booked!',
        message: '50 confirmed volunteers and 5 waitlisted backups have enrolled for Clean Coast Community Drive.',
        type: 'event_update',
        relatedEvent: cleanCoastEvent._id
      }
    ]);

    console.log('--------------------------------------------------');
    console.log('✅ THOURAM PAN-INDIA DATABASE SEED COMPLETED!');
    console.log('--------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('Organizer: organizer@thouram.org / Password123!');
    console.log('Sub-Manager: submanager@thouram.org / Password123!');
    console.log('Volunteer: volunteer@thouram.org / Password123!');
    console.log('Sample Events: 6 Pan-India Events Created');
    console.log('--------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
}

seed();
