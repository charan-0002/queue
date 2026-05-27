const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Hospital = require('./models/Hospital');
const Admin = require('./models/Admin');
const Patient = require('./models/Patient');
require('dotenv').config();

const hospitals = [
  { name: "Fortis Hospital", area: "Bannerghatta Rd", lat: 12.8948, lng: 77.5986, loginId: "fortis", passkey: "fortis2026" },
  { name: "Apollo Hospital", area: "Seshadripuram", lat: 12.9882, lng: 77.5724, loginId: "apollo", passkey: "apollo2026" },
  { name: "Apollo Hospital", area: "Bannerghatta Rd", lat: 12.8961, lng: 77.5985, loginId: "apollo_bannerghatta", passkey: "apollo_bannerghatta2026" },
  { name: "Apollo Speciality", area: "Jayanagar", lat: 12.9365, lng: 77.5843, loginId: "apollo_jayanagar", passkey: "apollo_jayanagar2026" },
  { name: "Manipal Hospital", area: "HAL Airport Rd", lat: 12.9584, lng: 77.6490, loginId: "manipal_hal", passkey: "manipal_hal2026" },
  { name: "Manipal Hospital", area: "Yeshwanthpur", lat: 13.0141, lng: 77.5560, loginId: "manipal_yeshwanthpur", passkey: "manipal_yeshwanthpur2026" },
  { name: "Manipal Hospital", area: "Whitefield", lat: 12.9880, lng: 77.7287, loginId: "manipal_whitefield", passkey: "manipal_whitefield2026" },
  { name: "Manipal Hospital", area: "Hebbal", lat: 13.0509, lng: 77.5939, loginId: "manipal_hebbal", passkey: "manipal_hebbal2026" },
  { name: "Manipal Hospital", area: "Varthur Rd", lat: 12.9581, lng: 77.7455, loginId: "manipal_varthur", passkey: "manipal_varthur2026" },
  { name: "Aster CMI Hospital", area: "Hebbal", lat: 13.0544, lng: 77.5915, loginId: "aster_cmi", passkey: "aster_cmi2026" },
  { name: "Bangalore Baptist Hospital", area: "Hebbal", lat: 13.0356, lng: 77.5896, loginId: "baptist", passkey: "baptist2026" },
  { name: "HCG Cancer Hospital", area: "K.R. Road", lat: 12.9637, lng: 77.5896, loginId: "hcg", passkey: "hcg2026" },
  { name: "Fortis Hospital", area: "Nagarbhavi", lat: 12.9597, lng: 77.5113, loginId: "fortis_nagarbhavi", passkey: "fortis_nagarbhavi2026" },
  { name: "United Hospital", area: "Jayanagar", lat: 12.9364, lng: 77.5848, loginId: "united", passkey: "united2026" },
  { name: "Trustwell Hospitals", area: "J.C. Road", lat: 12.9606, lng: 77.5840, loginId: "trustwell", passkey: "trustwell2026" },
  { name: "Suguna Hospital", area: "Rajajinagar", lat: 12.9881, lng: 77.5600, loginId: "suguna", passkey: "suguna2026" },
  { name: "Marvel Multispeciality", area: "Koramangala", lat: 12.9254, lng: 77.6359, loginId: "marvel", passkey: "marvel2026" },
  { name: "AMC Multispeciality", area: "Jayanagar", lat: 12.9297, lng: 77.5763, loginId: "amc", passkey: "amc2026" },
  { name: "Sankalpa Hospital", area: "Kothnur", lat: 12.8725, lng: 77.5837, loginId: "sankalpa", passkey: "sankalpa2026" },
  { name: "Springleaf Hospital", area: "Electronic City", lat: 12.8525, lng: 77.6675, loginId: "springleaf", passkey: "springleaf2026" },
  { name: "Victoria Hospital", area: "City Market", lat: 12.9643, lng: 77.5754, loginId: "victoria", passkey: "victoria2026" },
  { name: "Jayadeva Hospital", area: "BTM Layout", lat: 12.9178, lng: 77.5992, loginId: "jayadeva", passkey: "jayadeva2026" },
  { name: "NIMHANS", area: "Hosur Rd", lat: 12.9387, lng: 77.5941, loginId: "nimhans", passkey: "nimhans2026" },
  { name: "BMCRI", area: "K.R. Road", lat: 12.9594, lng: 77.5747, loginId: "bmcri", passkey: "bmcri2026" },
  { name: "PMSSY Hospital", area: "New Tharagupet", lat: 12.9622, lng: 77.5731, loginId: "pmssy", passkey: "pmssy2026" },
  { name: "K.C. General Hospital", area: "Malleshwaram", lat: 12.9961, lng: 77.5693, loginId: "kc_general", passkey: "kc_general2026" },
  { name: "Bowring Hospital", area: "Shivaji Nagar", lat: 12.9821, lng: 77.6042, loginId: "bowring", passkey: "bowring2026" },
  { name: "Jayanagar General Hospital", area: "Jayanagar", lat: 12.9266, lng: 77.5930, loginId: "jayanagar_general", passkey: "jayanagar_general2026" },
  { name: "BBMP Multi-Speciality", area: "Vijayanagar", lat: 12.9773, lng: 77.5427, loginId: "bbmp", passkey: "bbmp2026" },
  { name: "Vanivilas Hospital", area: "K.R. Road", lat: 12.9630, lng: 77.5740, loginId: "vanivilas", passkey: "vanivilas2026" },
];

const privateDepts = [
  "Cardiology", "Cardiac Surgery", "Neurology", "Neurosurgery",
  "Orthopaedics", "Oncology", "Gastroenterology", "Nephrology",
  "Urology", "Pulmonology", "Endocrinology", "Gynaecology",
  "Obstetrics", "Paediatrics", "Neonatology", "General Surgery",
  "General Medicine", "Emergency & Trauma", "Dermatology",
  "Ophthalmology", "ENT", "Psychiatry", "Radiology",
  "Pathology", "Anaesthesiology", "Physiotherapy",
  "Dental", "Plastic Surgery", "Vascular Surgery",
  "Rheumatology", "Haematology", "Transplant", "ICU", "Pharmacy"
];

const govtDepts = {
  "Victoria Hospital": ["General Medicine", "Surgery", "Orthopaedics", "ENT", "Ophthalmology", "Gynaecology", "Casualty/Emergency", "Dermatology", "Dentistry", "Radiology", "Pathology"],
  "Jayadeva Hospital": ["Cardiology", "Cardiac Surgery", "Interventional Cardiology", "CT Surgery", "Cardiac Rehabilitation", "ECG/Echo Lab", "Cath Lab", "ICU"],
  "NIMHANS": ["Psychiatry", "Neurology", "Neurosurgery", "Clinical Psychology", "Neuroimaging", "De-addiction", "Child Psychiatry", "Geriatric Psychiatry", "Neurochemistry"],
  "BMCRI": ["General Medicine", "Surgery", "Orthopaedics", "Paediatrics", "Gynaecology", "ENT", "Ophthalmology", "Dermatology", "Psychiatry", "TB & Chest", "Forensic Medicine"],
  "PMSSY Hospital": ["Neurosurgery", "Cardiology", "Nephrology", "Urology", "Plastic Surgery", "Gastroenterology", "Endocrinology", "Oncology"],
  "K.C. General Hospital": ["General Medicine", "Surgery", "Orthopaedics", "ENT", "Dentistry", "Dermatology", "Ophthalmology", "Gynaecology", "Casualty"],
  "Bowring Hospital": ["General Medicine", "Surgery", "Orthopaedics", "Gynaecology", "Paediatrics", "ENT", "Ophthalmology", "Dermatology", "Casualty"],
  "Jayanagar General Hospital": ["General Medicine", "Surgery", "Gynaecology", "Paediatrics", "ENT", "Dentistry", "Pharmacy", "Casualty"],
  "BBMP Multi-Speciality": ["General Medicine", "Surgery", "Orthopaedics", "Gynaecology", "Paediatrics", "Ophthalmology", "Dentistry"],
  "Vanivilas Hospital": ["Gynaecology", "Obstetrics", "Neonatology", "Paediatrics", "NICU", "PICU", "Fetal Medicine"]
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/docqueue');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Hospital.deleteMany({});
    await Admin.deleteMany({});
    await Patient.deleteMany({});
    console.log('🗑️  Cleared existing data');

    for (let i = 0; i < hospitals.length; i++) {
      const h = hospitals[i];

      let depts = privateDepts;
      if (i >= 20) {
        depts = govtDepts[h.name] || privateDepts;
      }

      const newHospital = await Hospital.create({
        name: h.name,
        address: h.area + ", Bangalore",
        city: "Bengaluru",
        state: "Karnataka",
        specialty: "General Medicine",
        coordinates: { lat: h.lat, lng: h.lng },
        loginId: h.loginId,
        passkey: h.passkey,
        departments: depts,
        contactInfo: "080-12345678",
        averageConsultationTime: Math.floor(Math.random() * 5) + 8
      });

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(h.passkey, salt);

      await Admin.create({
        username: h.loginId,
        passwordHash: hash,
        hospitalAssignment: newHospital._id
      });
      
      console.log("✅ Seeded " + h.name + " | User: " + h.loginId);
    }

    console.log('\\n✅ Seed of 30 precise hospitals completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
