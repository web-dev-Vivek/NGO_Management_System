import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import Campaign from '../models/Campaign.js';
import Task from '../models/Task.js';
import Certificate from '../models/Certificate.js';
import CoordinatorRequest from '../models/CoordinatorRequest.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ngo_management_system';

const seedData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB successfully.');

        // Clean existing seed collections (except preserving logged-in admin if any)
        console.log('Cleaning existing database records...');
        await Campaign.deleteMany({});
        await Task.deleteMany({});
        await Certificate.deleteMany({});
        await CoordinatorRequest.deleteMany({});

        console.log('Inserting ~50 realistic dummy records...');

        // -------------------------------------------------------------
        // 1. USERS (~15 records)
        // -------------------------------------------------------------
        const adminEmail = (process.env.ADMIN_EMAIL || 'progamervivek2020@gmail.com').toLowerCase();

        const usersData = [
            {
                clerkUserId: 'user_clerk_admin_001',
                firstName: 'Vivek',
                lastName: 'Kumar',
                email: adminEmail,
                phone: '+1 555-0192',
                profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
                bio: 'NGO Network Global Administrator & Lead Operations Director.',
                skills: ['Leadership', 'Strategic Planning', 'Fundraising', 'Event Management'],
                availability: ['Weekdays', 'Weekends'],
                role: 'admin',
                status: 'active',
                verificationStatus: 'verified'
            },
            {
                clerkUserId: 'user_clerk_coord_001',
                firstName: 'Sarah',
                lastName: 'Jenkins',
                email: 'sarah.jenkins@unityngo.org',
                phone: '+1 555-0123',
                profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
                bio: 'Environmental Project Lead & Community Coordinator with 5+ years experience in coastal cleanups.',
                skills: ['Environmental Science', 'Team Coordination', 'Logistics', 'First Aid'],
                availability: ['Saturdays', 'Sundays'],
                role: 'coordinator',
                status: 'active',
                verificationStatus: 'verified'
            },
            {
                clerkUserId: 'user_clerk_coord_002',
                firstName: 'Marcus',
                lastName: 'Vance',
                email: 'marcus.vance@unityngo.org',
                phone: '+1 555-0144',
                profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
                bio: 'Healthcare Outreach Specialist dedicated to organizing free medical and dental screening drives.',
                skills: ['Healthcare Admin', 'Public Health', 'First Aid', 'Patient Triage'],
                availability: ['Mon-Wed Evenings', 'Weekends'],
                role: 'coordinator',
                status: 'active',
                verificationStatus: 'verified'
            },
            {
                clerkUserId: 'user_clerk_coord_003',
                firstName: 'Elena',
                lastName: 'Rostova',
                email: 'elena.rostova@unityngo.org',
                phone: '+1 555-0155',
                profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
                bio: 'Youth Education Advocate focusing on digital literacy for underprivileged children and seniors.',
                skills: ['Teaching', 'Curriculum Design', 'Child Welfare', 'Digital Literacy'],
                availability: ['Weekdays', 'Saturdays'],
                role: 'coordinator',
                status: 'active',
                verificationStatus: 'verified'
            },
            {
                clerkUserId: 'user_clerk_vol_001',
                firstName: 'David',
                lastName: 'Kim',
                email: 'david.kim@example.com',
                phone: '+1 555-0101',
                profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
                bio: 'Software engineer passionate about teaching coding and digital literacy to youth.',
                skills: ['Teaching', 'Python', 'Web Dev', 'Mentorship'],
                availability: ['Weekends'],
                role: 'volunteer',
                status: 'active',
                verificationStatus: 'verified'
            },
            {
                clerkUserId: 'user_clerk_vol_002',
                firstName: 'Priya',
                lastName: 'Patel',
                email: 'priya.patel@example.com',
                phone: '+1 555-0102',
                profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
                bio: 'Nursing student dedicated to emergency medical response and healthcare assistance.',
                skills: ['First Aid', 'Vital Signs', 'Medical Triage', 'Patient Care'],
                availability: ['Fridays', 'Saturdays'],
                role: 'volunteer',
                status: 'active',
                verificationStatus: 'verified'
            },
            {
                clerkUserId: 'user_clerk_vol_003',
                firstName: 'Michael',
                lastName: 'Chen',
                email: 'michael.chen@example.com',
                phone: '+1 555-0103',
                profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
                bio: 'Avid outdoor enthusiast active in tree planting and forest conservation.',
                skills: ['Tree Planting', 'Botany', 'Physical Labor', 'Outdoor Logistics'],
                availability: ['Sundays'],
                role: 'volunteer',
                status: 'active',
                verificationStatus: 'verified'
            },
            {
                clerkUserId: 'user_clerk_vol_004',
                firstName: 'Aisha',
                lastName: 'Khan',
                email: 'aisha.khan@example.com',
                phone: '+1 555-0104',
                profileImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=250&q=80',
                bio: 'Social worker specialized in food distribution drives and disaster relief response.',
                skills: ['Food Packing', 'Crowd Control', 'Disaster Relief', 'Logistics'],
                availability: ['Weekdays'],
                role: 'volunteer',
                status: 'active',
                verificationStatus: 'verified'
            },
            {
                clerkUserId: 'user_clerk_vol_005',
                firstName: 'Carlos',
                lastName: 'Rodriguez',
                email: 'carlos.rodriguez@example.com',
                phone: '+1 555-0105',
                profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80',
                bio: 'Graphic designer helping NGOs with campaign banners, media kits, and branding.',
                skills: ['Graphic Design', 'Photography', 'Social Media', 'Event Planning'],
                availability: ['Weekends'],
                role: 'volunteer',
                status: 'active',
                verificationStatus: 'verified'
            },
            {
                clerkUserId: 'user_clerk_vol_006',
                firstName: 'Emma',
                lastName: 'Watson',
                email: 'emma.watson@example.com',
                phone: '+1 555-0106',
                profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=250&q=80',
                bio: 'High school teacher volunteering for weekend literacy drives and book clubs.',
                skills: ['Teaching', 'Reading Assistance', 'Classroom Mgmt', 'Art & Craft'],
                availability: ['Saturdays'],
                role: 'volunteer',
                status: 'active',
                verificationStatus: 'verified'
            },
            {
                clerkUserId: 'user_clerk_vol_007',
                firstName: 'Liam',
                lastName: 'Johnson',
                email: 'liam.johnson@example.com',
                phone: '+1 555-0107',
                profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
                bio: 'College student active in environmental drives and youth mentoring programs.',
                skills: ['Event Setup', 'Public Speaking', 'Social Media', 'Cleanups'],
                availability: ['Weekends'],
                role: 'volunteer',
                status: 'active',
                verificationStatus: 'verified'
            },
            {
                clerkUserId: 'user_clerk_vol_008',
                firstName: 'Sophia',
                lastName: 'Martinez',
                email: 'sophia.martinez@example.com',
                phone: '+1 555-0108',
                profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
                bio: 'Nutritionist assisting elderly care centers and food distribution programs.',
                skills: ['Nutrition Planning', 'Elderly Care', 'Health Assessment', 'Cooking'],
                availability: ['Tuesdays', 'Thursdays'],
                role: 'volunteer',
                status: 'active',
                verificationStatus: 'verified'
            },
            {
                clerkUserId: 'user_clerk_vol_009',
                firstName: 'Lucas',
                lastName: 'Silva',
                email: 'lucas.silva@example.com',
                phone: '+1 555-0109',
                profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
                bio: 'Civil engineering graduate enthusiastic about building shelters and community infrastructure.',
                skills: ['Construction', 'Carpentry', 'Safety Management', 'Logistics'],
                availability: ['Weekends'],
                role: 'volunteer',
                status: 'active',
                verificationStatus: 'verified'
            },
            {
                clerkUserId: 'user_clerk_vol_010',
                firstName: 'Olivia',
                lastName: 'Taylor',
                email: 'olivia.taylor@example.com',
                phone: '+1 555-0110',
                profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
                bio: 'Recently joined volunteer eager to participate in healthcare and education campaigns.',
                skills: ['General Support', 'Data Entry', 'Registration Desk'],
                availability: ['On Call'],
                role: 'volunteer',
                status: 'pending',
                verificationStatus: 'pending'
            },
            {
                clerkUserId: 'user_clerk_vol_011',
                firstName: 'Noah',
                lastName: 'Wright',
                email: 'noah.wright@example.com',
                phone: '+1 555-0111',
                profileImage: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=250&q=80',
                bio: 'Community organizer focused on urban greening initiatives and local recycling drives.',
                skills: ['Recycling', 'Urban Gardening', 'Workshop Host'],
                availability: ['Saturdays'],
                role: 'volunteer',
                status: 'active',
                verificationStatus: 'verified'
            }
        ];

        // Clean non-admin dummy users
        await User.deleteMany({ email: { $ne: adminEmail } });

        const createdUsers = [];
        for (const uData of usersData) {
            let u = await User.findOne({ email: uData.email.toLowerCase() });
            if (u) {
                u.firstName = uData.firstName;
                u.lastName = uData.lastName;
                u.role = uData.role;
                u.status = uData.status;
                u.verificationStatus = uData.verificationStatus;
                u.skills = uData.skills;
                u.bio = uData.bio;
                await u.save();
                createdUsers.push(u);
            } else {
                u = await User.create(uData);
                createdUsers.push(u);
            }
        }
        console.log(`✓ Synchronized ${createdUsers.length} Users`);

        const adminUser = createdUsers.find(u => u.role === 'admin');
        const coordSarah = createdUsers.find(u => u.firstName === 'Sarah');
        const coordMarcus = createdUsers.find(u => u.firstName === 'Marcus');
        const coordElena = createdUsers.find(u => u.firstName === 'Elena');
        const volunteerList = createdUsers.filter(u => u.role === 'volunteer');

        // -------------------------------------------------------------
        // 2. CAMPAIGNS (~10 records)
        // -------------------------------------------------------------
        const campaignsData = [
            {
                title: 'Clean Ocean Beach Drive 2026',
                description: 'Join us for a massive coastal cleanup operation along Sunshine Beach. We will collect, sort, and send plastic waste for recycling to protect marine habitats.',
                category: 'Environment',
                bannerImage: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
                startDate: new Date('2026-09-15'),
                endDate: new Date('2026-09-18'),
                location: { address: 'Sunshine Beach Pier, North Coast Bay' },
                targetVolunteers: 25,
                volunteersRegistered: [volunteerList[0]._id, volunteerList[1]._id, volunteerList[2]._id, volunteerList[4]._id, volunteerList[6]._id],
                volunteersRequested: [volunteerList[7]._id, volunteerList[8]._id],
                status: 'active',
                createdBy: coordSarah._id,
                createdByRole: 'coordinator',
                approvedBy: adminUser._id,
                approvedAt: new Date('2026-09-01'),
                impact: { target: 500, achieved: 320, unit: 'kg plastic collected' }
            },
            {
                title: 'Community Youth Literacy & STEM Program',
                description: 'Empower middle school students with essential reading skills, basic coding concepts, and interactive science experiments.',
                category: 'Education',
                bannerImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
                startDate: new Date('2026-09-20'),
                endDate: new Date('2026-10-15'),
                location: { address: 'Central Library Auditorium, 5th Avenue' },
                targetVolunteers: 15,
                volunteersRegistered: [volunteerList[0]._id, volunteerList[5]._id, volunteerList[9]._id],
                volunteersRequested: [volunteerList[3]._id],
                status: 'active',
                createdBy: coordElena._id,
                createdByRole: 'coordinator',
                approvedBy: adminUser._id,
                approvedAt: new Date('2026-09-02'),
                impact: { target: 120, achieved: 85, unit: 'students tutored' }
            },
            {
                title: 'Free Rural Health & Dental Checkup Camp',
                description: 'Providing free health consultations, dental checkups, vital screenings, and essential medicine kits for rural village communities.',
                category: 'Health',
                bannerImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
                startDate: new Date('2026-10-01'),
                endDate: new Date('2026-10-03'),
                location: { address: 'Green Valley Community Health Center' },
                targetVolunteers: 20,
                volunteersRegistered: [volunteerList[1]._id, volunteerList[7]._id],
                volunteersRequested: [volunteerList[2]._id, volunteerList[6]._id],
                status: 'active',
                createdBy: coordMarcus._id,
                createdByRole: 'coordinator',
                approvedBy: adminUser._id,
                approvedAt: new Date('2026-09-03'),
                impact: { target: 400, achieved: 290, unit: 'patients treated' }
            },
            {
                title: 'Emergency Flood Relief & Food Package Supply Drive',
                description: 'Assembling emergency food packages, hygiene supplies, and clean drinking water kits for families affected by recent monsoon flooding.',
                category: 'Disaster Relief',
                bannerImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
                startDate: new Date('2026-08-10'),
                endDate: new Date('2026-08-25'),
                location: { address: 'Unity Regional Relief Logistics Warehouse, Gate 4' },
                targetVolunteers: 30,
                volunteersRegistered: [volunteerList[3]._id, volunteerList[4]._id, volunteerList[8]._id, volunteerList[10]._id],
                volunteersRequested: [],
                status: 'completed',
                createdBy: adminUser._id,
                createdByRole: 'admin',
                approvedBy: adminUser._id,
                approvedAt: new Date('2026-08-09'),
                impact: { target: 1000, achieved: 1250, unit: 'relief kits distributed' }
            },
            {
                title: 'Urban Tree Plantation & City Greening Drive',
                description: 'Help us plant 1,000 native shade trees along urban highway corridors to combat heat islands and improve city air quality.',
                category: 'Environment',
                bannerImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
                startDate: new Date('2026-10-10'),
                endDate: new Date('2026-10-12'),
                location: { address: 'Metro East Expressway Corridor, Zone 3' },
                targetVolunteers: 40,
                volunteersRegistered: [volunteerList[2]._id, volunteerList[6]._id, volunteerList[10]._id],
                volunteersRequested: [volunteerList[1]._id],
                status: 'active',
                createdBy: coordSarah._id,
                createdByRole: 'coordinator',
                approvedBy: adminUser._id,
                approvedAt: new Date('2026-09-04'),
                impact: { target: 1000, achieved: 450, unit: 'trees planted' }
            },
            {
                title: 'Senior Citizens Meals & Companion Care Program',
                description: 'Preparing and delivering warm, nutritious meals and providing friendly companionship to isolated senior citizens.',
                category: 'Community Service',
                bannerImage: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=800&q=80',
                startDate: new Date('2026-09-25'),
                endDate: new Date('2026-11-30'),
                location: { address: 'Golden Years Senior Center, West Park' },
                targetVolunteers: 12,
                volunteersRegistered: [volunteerList[7]._id, volunteerList[5]._id],
                volunteersRequested: [],
                status: 'active',
                createdBy: coordElena._id,
                createdByRole: 'coordinator',
                approvedBy: adminUser._id,
                approvedAt: new Date('2026-09-05'),
                impact: { target: 600, achieved: 200, unit: 'meals served' }
            },
            {
                title: 'Annual Blood Donation & Bone Marrow Registry',
                description: 'Partnering with the Red Cross to organize a voluntary blood donation drive and register potential bone marrow donors.',
                category: 'Health',
                bannerImage: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80',
                startDate: new Date('2026-11-05'),
                endDate: new Date('2026-11-06'),
                location: { address: 'City Medical College Campus Grounds' },
                targetVolunteers: 20,
                volunteersRegistered: [],
                volunteersRequested: [volunteerList[1]._id, volunteerList[4]._id],
                status: 'pending',
                createdBy: coordMarcus._id,
                createdByRole: 'coordinator',
                impact: { target: 300, achieved: 0, unit: 'blood units collected' }
            },
            {
                title: 'Digital Literacy Workshop for Seniors',
                description: 'Teaching senior citizens how to use smartphones, video call relatives safely, and spot online scams.',
                category: 'Education',
                bannerImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
                startDate: new Date('2026-11-15'),
                endDate: new Date('2026-11-20'),
                location: { address: 'Community Tech Center, Downtown' },
                targetVolunteers: 10,
                volunteersRegistered: [],
                volunteersRequested: [],
                status: 'draft',
                createdBy: coordElena._id,
                createdByRole: 'coordinator',
                impact: { target: 50, achieved: 0, unit: 'seniors trained' }
            },
            {
                title: 'Slum Children Evening Warm Meal Drive',
                description: 'Providing daily hot evening meals and nutritional snacks for children living in informal urban settlements.',
                category: 'Community Service',
                bannerImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
                startDate: new Date('2026-07-01'),
                endDate: new Date('2026-08-15'),
                location: { address: 'Sector 12 Railway Community Shelter' },
                targetVolunteers: 15,
                volunteersRegistered: [volunteerList[3]._id, volunteerList[7]._id],
                volunteersRequested: [],
                status: 'completed',
                createdBy: adminUser._id,
                createdByRole: 'admin',
                approvedBy: adminUser._id,
                approvedAt: new Date('2026-06-30'),
                impact: { target: 3000, achieved: 3400, unit: 'meals distributed' }
            },
            {
                title: 'Wildfire Habitat Reforestation Project',
                description: 'Restoring native plant life, clearing invasive weeds, and rebuilding bird nesting boxes in fire-damaged park reserves.',
                category: 'Environment',
                bannerImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
                startDate: new Date('2026-12-01'),
                endDate: new Date('2026-12-10'),
                location: { address: 'Pine Ridge National Park Sanctuary' },
                targetVolunteers: 35,
                volunteersRegistered: [],
                volunteersRequested: [],
                status: 'pending',
                createdBy: coordSarah._id,
                createdByRole: 'coordinator',
                impact: { target: 2000, achieved: 0, unit: 'saplings planted' }
            }
        ];

        const createdCampaigns = await Campaign.insertMany(campaignsData);
        console.log(`✓ Inserted ${createdCampaigns.length} Campaigns`);

        const beachCampaign = createdCampaigns.find(c => c.title.includes('Beach'));
        const literacyCampaign = createdCampaigns.find(c => c.title.includes('Literacy'));
        const healthCampaign = createdCampaigns.find(c => c.title.includes('Health'));
        const floodCampaign = createdCampaigns.find(c => c.title.includes('Flood'));
        const mealCampaign = createdCampaigns.find(c => c.title.includes('Slum'));

        // -------------------------------------------------------------
        // 3. TASKS (~15 records)
        // -------------------------------------------------------------
        const tasksData = [
            {
                title: 'Beach Trash Bag Distribution & Check-in Desk',
                description: 'Hand out color-coded trash collection bags, safety gloves, and log volunteer sign-ins at Sunshine Pier.',
                campaignId: beachCampaign._id,
                assignedVolunteer: volunteerList[0]._id,
                priority: 'high',
                status: 'verified',
                dueDate: new Date('2026-09-16'),
                loggedHours: 4.5,
                checkInTime: new Date('2026-09-16T08:00:00Z'),
                checkOutTime: new Date('2026-09-16T12:30:00Z'),
                verifiedBy: coordSarah._id
            },
            {
                title: 'Plastic Waste Sorting & Weighing Station',
                description: 'Categorize collected waste into recyclable plastics, glass, and non-recyclables. Record total weights.',
                campaignId: beachCampaign._id,
                assignedVolunteer: volunteerList[1]._id,
                priority: 'medium',
                status: 'completed',
                dueDate: new Date('2026-09-17'),
                loggedHours: 5.0,
                checkInTime: new Date('2026-09-17T09:00:00Z'),
                checkOutTime: new Date('2026-09-17T14:00:00Z')
            },
            {
                title: 'Hydration & Safety First Aid Point',
                description: 'Manage water refill barrels, hand out electrolyte packs, and treat minor scratches for volunteers.',
                campaignId: beachCampaign._id,
                assignedVolunteer: volunteerList[2]._id,
                priority: 'high',
                status: 'in-progress',
                dueDate: new Date('2026-09-18'),
                loggedHours: 2.0,
                checkInTime: new Date('2026-09-18T10:00:00Z')
            },
            {
                title: 'Elementary Math & Reading Module Tutoring',
                description: 'Conduct guided reading circles and math flashcard exercises for middle school students.',
                campaignId: literacyCampaign._id,
                assignedVolunteer: volunteerList[0]._id,
                priority: 'medium',
                status: 'verified',
                dueDate: new Date('2026-09-22'),
                loggedHours: 3.5,
                checkInTime: new Date('2026-09-22T13:00:00Z'),
                checkOutTime: new Date('2026-09-22T16:30:00Z'),
                verifiedBy: coordElena._id
            },
            {
                title: 'Basic Scratch Coding Workshop Instructor',
                description: 'Lead 10-14 year old students through building basic interactive games in Scratch.',
                campaignId: literacyCampaign._id,
                assignedVolunteer: volunteerList[5]._id,
                priority: 'high',
                status: 'pending',
                dueDate: new Date('2026-09-25'),
                loggedHours: 0
            },
            {
                title: 'Patient Queue & Registration Management',
                description: 'Register patient intake forms, assign queue tokens, and guide families to consultation booths.',
                campaignId: healthCampaign._id,
                assignedVolunteer: volunteerList[1]._id,
                priority: 'high',
                status: 'verified',
                dueDate: new Date('2026-10-02'),
                loggedHours: 6.0,
                checkInTime: new Date('2026-10-02T08:30:00Z'),
                checkOutTime: new Date('2026-10-02T14:30:00Z'),
                verifiedBy: coordMarcus._id
            },
            {
                title: 'Vital Signs & Blood Pressure Screening',
                description: 'Measure patient blood pressure, pulse rate, and record initial readings before physician review.',
                campaignId: healthCampaign._id,
                assignedVolunteer: volunteerList[7]._id,
                priority: 'high',
                status: 'completed',
                dueDate: new Date('2026-10-03'),
                loggedHours: 5.5,
                checkInTime: new Date('2026-10-03T09:00:00Z'),
                checkOutTime: new Date('2026-10-03T14:30:00Z')
            },
            {
                title: 'Emergency Food Box Packaging & Sealing',
                description: 'Assemble family ration boxes containing rice, lentils, cooking oil, and canned goods.',
                campaignId: floodCampaign._id,
                assignedVolunteer: volunteerList[3]._id,
                priority: 'high',
                status: 'verified',
                dueDate: new Date('2026-08-12'),
                loggedHours: 8.0,
                checkInTime: new Date('2026-08-12T08:00:00Z'),
                checkOutTime: new Date('2026-08-12T16:00:00Z'),
                verifiedBy: adminUser._id
            },
            {
                title: 'Relief Truck Loading & Inventory Audit',
                description: 'Load sealed food ration boxes onto dispatch trucks and record shipment manifests.',
                campaignId: floodCampaign._id,
                assignedVolunteer: volunteerList[4]._id,
                priority: 'medium',
                status: 'verified',
                dueDate: new Date('2026-08-15'),
                loggedHours: 7.5,
                checkInTime: new Date('2026-08-15T09:00:00Z'),
                checkOutTime: new Date('2026-08-15T16:30:00Z'),
                verifiedBy: adminUser._id
            },
            {
                title: 'Slum Meal Preparation & Kitchen Support',
                description: 'Assist chefs in chopping vegetables, boiling rice, and packing hot meals into insulated transport boxes.',
                campaignId: mealCampaign._id,
                assignedVolunteer: volunteerList[3]._id,
                priority: 'medium',
                status: 'verified',
                dueDate: new Date('2026-07-15'),
                loggedHours: 6.5,
                checkInTime: new Date('2026-07-15T10:00:00Z'),
                checkOutTime: new Date('2026-07-15T16:30:00Z'),
                verifiedBy: adminUser._id
            },
            {
                title: 'Meal Distribution & Line Control at Shelter',
                description: 'Distribute hot meal trays to children and ensure orderly queue management at the shelter.',
                campaignId: mealCampaign._id,
                assignedVolunteer: volunteerList[7]._id,
                priority: 'medium',
                status: 'verified',
                dueDate: new Date('2026-07-20'),
                loggedHours: 5.0,
                checkInTime: new Date('2026-07-20T11:00:00Z'),
                checkOutTime: new Date('2026-07-20T16:00:00Z'),
                verifiedBy: adminUser._id
            },
            {
                title: 'Tree Sapling Digging & Soil Treatment',
                description: 'Dig planting pits along expressway corridor and mix compost with topsoil.',
                campaignId: createdCampaigns[4]._id, // Urban Tree Plantation
                assignedVolunteer: volunteerList[2]._id,
                priority: 'medium',
                status: 'in-progress',
                dueDate: new Date('2026-10-11'),
                loggedHours: 3.0,
                checkInTime: new Date('2026-10-11T09:00:00Z')
            },
            {
                title: 'Sapling Staking & Watering Patrol',
                description: 'Install protective wooden stakes around newly planted trees and water thoroughly.',
                campaignId: createdCampaigns[4]._id,
                assignedVolunteer: volunteerList[6]._id,
                priority: 'low',
                status: 'pending',
                dueDate: new Date('2026-10-12'),
                loggedHours: 0
            },
            {
                title: 'Senior Citizen Meal Delivery Route A',
                description: 'Deliver packaged lunches to 12 registered senior citizen residences in West Park.',
                campaignId: createdCampaigns[5]._id, // Senior Meals
                assignedVolunteer: volunteerList[5]._id,
                priority: 'medium',
                status: 'pending',
                dueDate: new Date('2026-09-26'),
                loggedHours: 0
            },
            {
                title: 'Senior Companion Board Games & Story Hour',
                description: 'Spend 2 hours engaging seniors in board games, trivia, and conversation at the community center.',
                campaignId: createdCampaigns[5]._id,
                assignedVolunteer: volunteerList[7]._id,
                priority: 'low',
                status: 'completed',
                dueDate: new Date('2026-09-28'),
                loggedHours: 4.0,
                checkInTime: new Date('2026-09-28T13:00:00Z'),
                checkOutTime: new Date('2026-09-28T17:00:00Z')
            }
        ];

        const createdTasks = await Task.insertMany(tasksData);
        console.log(`✓ Inserted ${createdTasks.length} Tasks`);

        // -------------------------------------------------------------
        // 4. CERTIFICATES (~6 records)
        // -------------------------------------------------------------
        try {
            await Certificate.collection.dropIndexes();
        } catch (e) {
            // ignore if no indexes exist
        }
        const certificatesData = [
            {
                certificateId: uuidv4(),
                volunteerId: volunteerList[0]._id, // David Kim
                campaignId: beachCampaign._id,
                hoursLogged: 4.5,
                issueDate: new Date('2026-09-17'),
                signedBy: adminUser._id,
                pdfUrl: `/uploads/certificates/cert-sample-001.pdf`
            },
            {
                certificateId: uuidv4(),
                volunteerId: volunteerList[1]._id, // Priya Patel
                campaignId: healthCampaign._id,
                hoursLogged: 6.0,
                issueDate: new Date('2026-10-04'),
                signedBy: adminUser._id,
                pdfUrl: `/uploads/certificates/cert-sample-002.pdf`
            },
            {
                certificateId: uuidv4(),
                volunteerId: volunteerList[3]._id, // Aisha Khan
                campaignId: floodCampaign._id,
                hoursLogged: 8.0,
                issueDate: new Date('2026-08-26'),
                signedBy: adminUser._id,
                pdfUrl: `/uploads/certificates/cert-sample-003.pdf`
            },
            {
                certificateId: uuidv4(),
                volunteerId: volunteerList[4]._id, // Carlos Rodriguez
                campaignId: floodCampaign._id,
                hoursLogged: 7.5,
                issueDate: new Date('2026-08-26'),
                signedBy: adminUser._id,
                pdfUrl: `/uploads/certificates/cert-sample-004.pdf`
            },
            {
                certificateId: uuidv4(),
                volunteerId: volunteerList[3]._id, // Aisha Khan
                campaignId: mealCampaign._id,
                hoursLogged: 6.5,
                issueDate: new Date('2026-08-16'),
                signedBy: adminUser._id,
                pdfUrl: `/uploads/certificates/cert-sample-005.pdf`
            },
            {
                certificateId: uuidv4(),
                volunteerId: volunteerList[7]._id, // Sophia Martinez
                campaignId: mealCampaign._id,
                hoursLogged: 5.0,
                issueDate: new Date('2026-08-16'),
                signedBy: adminUser._id,
                pdfUrl: `/uploads/certificates/cert-sample-006.pdf`
            }
        ];

        const createdCertificates = await Certificate.insertMany(certificatesData);
        console.log(`✓ Inserted ${createdCertificates.length} Certificates`);

        // -------------------------------------------------------------
        // 5. COORDINATOR REQUESTS (~4 records)
        // -------------------------------------------------------------
        const requestsData = [
            {
                user: volunteerList[0]._id, // David Kim
                campaign: beachCampaign._id,
                reason: 'I have 3 years of experience running youth tech workshops and want to coordinate local beach sustainability initiatives.',
                status: 'approved'
            },
            {
                user: volunteerList[1]._id, // Priya Patel
                campaign: healthCampaign._id,
                reason: 'As a nursing student with paramedic training, I would like to assist in leading rural health screening camps.',
                status: 'approved'
            },
            {
                user: volunteerList[2]._id, // Michael Chen
                campaign: createdCampaigns[4]._id, // Urban Tree Plantation
                reason: 'I am certified in urban forestry and wish to coordinate sapling allocation for the city greening drive.',
                status: 'pending'
            },
            {
                user: volunteerList[5]._id, // Emma Watson
                campaign: createdCampaigns[5]._id, // Senior Meals
                reason: 'I would like to coordinate weekend volunteers for the senior meal preparation and visitation program.',
                status: 'pending'
            }
        ];

        const createdRequests = await CoordinatorRequest.insertMany(requestsData);
        console.log(`✓ Inserted ${createdRequests.length} Coordinator Requests`);

        console.log('\n======================================================');
        console.log(`🎉 Seed complete! Successfully inserted 50 records:`);
        console.log(`- ${createdUsers.length} Users`);
        console.log(`- ${createdCampaigns.length} Campaigns`);
        console.log(`- ${createdTasks.length} Tasks`);
        console.log(`- ${createdCertificates.length} Certificates`);
        console.log(`- ${createdRequests.length} Coordinator Requests`);
        console.log('======================================================\n');

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    } catch (error) {
        console.error(`❌ Seeding error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
};

seedData();
