// Setup script to initialize MongoDB with dummy data
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Hospital = require('./models/Hospital');
const Admin = require('./models/Admin');
const Doctor = require('./models/Doctor');
require('dotenv').config();

const dummyHospitals = [
  // ─── Original hospitals ───
  {
    name: "AIIMS Delhi",
    address: "Ansari Nagar, New Delhi",
    coordinates: { lat: 28.5659, lng: 77.2045 },
    departments: ["General OPD", "Cardiology", "Orthopedics", "Pediatrics"],
    contactInfo: "011-26588500"
  },
  {
    name: "Apollo Hospitals",
    address: "Greams Road, Chennai",
    coordinates: { lat: 13.0604, lng: 80.2496 },
    departments: ["Cardiology", "Neurology", "General OPD"],
    contactInfo: "044-28293333"
  },
  {
    name: "Fortis Hospital",
    address: "Mulund, Mumbai",
    coordinates: { lat: 19.1654, lng: 72.9439 },
    departments: ["Orthopedics", "Pediatrics", "General OPD"],
    contactInfo: "022-21822000"
  },

  // ─── Bangalore Hospitals ───
  {
    name: "Manipal Hospital",
    address: "98, HAL Airport Road, Bangalore - 560017",
    coordinates: { lat: 12.9592, lng: 77.6479 },
    departments: ["General OPD", "Cardiology", "Neurology", "Oncology", "Orthopedics", "Pediatrics", "Nephrology"],
    contactInfo: "080-25024444"
  },
  {
    name: "Narayana Health City",
    address: "258/A, Bommasandra Industrial Area, Bangalore - 560099",
    coordinates: { lat: 12.8358, lng: 77.6756 },
    departments: ["Cardiology", "Cardiac Surgery", "General OPD", "Oncology", "Neurology", "Transplant"],
    contactInfo: "080-71222222"
  },
  {
    name: "Apollo Hospitals, Bannerghatta",
    address: "154/11, Bannerghatta Road, Bangalore - 560076",
    coordinates: { lat: 12.8916, lng: 77.5997 },
    departments: ["General OPD", "Cardiology", "Gynecology", "Orthopedics", "Dermatology", "Pediatrics"],
    contactInfo: "080-26304050"
  },
  {
    name: "Fortis Hospital, Cunningham Road",
    address: "14, Cunningham Road, Bangalore - 560052",
    coordinates: { lat: 12.9802, lng: 77.5928 },
    departments: ["General OPD", "Neurology", "Orthopedics", "Cardiac Sciences", "Renal Sciences"],
    contactInfo: "080-66214444"
  },
  {
    name: "Sakra World Hospital",
    address: "52/2, Devarabisanahalli, Outer Ring Road, Bangalore - 560103",
    coordinates: { lat: 12.9358, lng: 77.7013 },
    departments: ["General OPD", "Emergency", "Orthopedics", "Neurosciences", "Gastroenterology"],
    contactInfo: "080-49694969"
  },
  {
    name: "Columbia Asia Hospital, Whitefield",
    address: "Whitefield Main Road, Bangalore - 560066",
    coordinates: { lat: 12.9699, lng: 77.7499 },
    departments: ["General OPD", "Orthopedics", "Gynecology", "Pediatrics", "Internal Medicine"],
    contactInfo: "080-71202000"
  },
  {
    name: "BGS Gleneagles Global Hospital",
    address: "67, Uttarahalli Road, Kengeri, Bangalore - 560060",
    coordinates: { lat: 12.9085, lng: 77.4910 },
    departments: ["General OPD", "Liver Transplant", "Nephrology", "Cardiology", "Oncology", "Pediatrics"],
    contactInfo: "080-26762020"
  },
  {
    name: "Vikram Hospital",
    address: "71/1, Millers Road, Bangalore - 560052",
    coordinates: { lat: 12.9832, lng: 77.5902 },
    departments: ["General OPD", "Cardiology", "Neurology", "Diabetes & Endocrinology"],
    contactInfo: "080-40206000"
  },
  {
    name: "M S Ramaiah Memorial Hospital",
    address: "MSR Nagar, MSRIT Post, Mathikere, Bangalore - 560054",
    coordinates: { lat: 13.0188, lng: 77.5586 },
    departments: ["General OPD", "Cardiology", "Neurosurgery", "Orthopedics", "Oncology", "Gynecology"],
    contactInfo: "080-23606000"
  },
  {
    name: "St. John's Medical College Hospital",
    address: "Sarjapur Road, Koramangala, Bangalore - 560034",
    coordinates: { lat: 12.9370, lng: 77.6218 },
    departments: ["General OPD", "Emergency", "Orthopedics", "Psychiatry", "Neurology", "Pediatrics"],
    contactInfo: "080-22065000"
  },
  {
    name: "Bowring & Lady Curzon Hospital",
    address: "Shivaji Nagar, Bangalore - 560001",
    coordinates: { lat: 12.9778, lng: 77.6003 },
    departments: ["General OPD", "General Surgery", "Orthopedics", "ENT", "Gynecology"],
    contactInfo: "080-25582237"
  },
  {
    name: "Victoria Hospital",
    address: "Ft. Road, Krishna Rajendra Market, Bangalore - 560002",
    coordinates: { lat: 12.9677, lng: 77.5740 },
    departments: ["General OPD", "Emergency", "Burns & Plastic Surgery", "Neurology", "General Surgery"],
    contactInfo: "080-26700444"
  },
  {
    name: "Kidwai Memorial Institute of Oncology",
    address: "Dr. M H Marigowda Road, Bangalore - 560029",
    coordinates: { lat: 12.9258, lng: 77.5960 },
    departments: ["Oncology", "Radiation Therapy", "Surgical Oncology", "Medical Oncology", "Palliative Care"],
    contactInfo: "080-26094000"
  },
  {
    name: "Jayadeva Institute of Cardiovascular Sciences",
    address: "Bannerghatta Road, Jayanagar, Bangalore - 560069",
    coordinates: { lat: 12.9065, lng: 77.5961 },
    departments: ["Cardiology", "Cardiac Surgery", "Cardiac Rehabilitation", "Pediatric Cardiology"],
    contactInfo: "080-22977777"
  },
  {
    name: "Aster CMI Hospital",
    address: "43/2, New Airport Road, NH-7, Sahakara Nagar, Bangalore - 560092",
    coordinates: { lat: 13.0629, lng: 77.5979 },
    departments: ["General OPD", "Cardiology", "Oncology", "Neurology", "Orthopedics", "Transplant"],
    contactInfo: "080-43422222"
  },
  {
    name: "Sparsh Hospital",
    address: "29/P2, The SPARSH Hospital, Infantry Road, Bangalore - 560001",
    coordinates: { lat: 12.9823, lng: 77.6053 },
    departments: ["Orthopedics", "Sports Medicine", "Spine Surgery", "Joint Replacement", "Physiotherapy"],
    contactInfo: "080-44777444"
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/docqueue');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Hospital.deleteMany({});
    await Admin.deleteMany({});
    await Doctor.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Hospitals
    const createdHospitals = await Hospital.insertMany(dummyHospitals);
    console.log(`🏥 Created ${createdHospitals.length} hospitals`);

    // Print all Bangalore hospitals
    const blrHospitals = createdHospitals.filter(h => h.address.includes('Bangalore'));
    console.log(`\n📍 Bangalore Hospitals (${blrHospitals.length}):`);
    blrHospitals.forEach(h => console.log(`   - ${h.name} [${h.coordinates.lat}, ${h.coordinates.lng}]`));

    // Create Admin accounts for each Bangalore hospital
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);

    // Admin for first Bangalore hospital (Manipal)
    const manipal = createdHospitals.find(h => h.name === 'Manipal Hospital');
    await Admin.create({
      username: 'admin_manipal',
      passwordHash: hash,
      hospitalAssignment: manipal._id
    });

    // Admin for original AIIMS Delhi
    const aiims = createdHospitals.find(h => h.name === 'AIIMS Delhi');
    await Admin.create({
      username: 'admin_aiims',
      passwordHash: hash,
      hospitalAssignment: aiims._id
    });

    console.log('\n👤 Admins created:');
    console.log('   - admin_aiims (password: admin123) → AIIMS Delhi');
    console.log('   - admin_manipal (password: admin123) → Manipal Hospital Bangalore');
    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
