require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Hospital = require('./models/Hospital');

const MONGODB_URI = "mongodb+srv://badamhalwa02_db_user:monish%40123e@cluster0.0i8o84m.mongodb.net/docqueue?appName=Cluster0";

const privateDepts = [
  "Cardiology", "Cardiac Surgery", "Neurology", "Neurosurgery",
  "Orthopaedics & Joint Replacement", "Oncology", "Gastroenterology",
  "Nephrology", "Urology", "Pulmonology", "Endocrinology & Diabetology",
  "Gynaecology & Obstetrics", "Paediatrics & Neonatology", "General Surgery",
  "General Medicine", "Emergency & Trauma", "Dermatology", "Ophthalmology",
  "ENT", "Psychiatry", "Radiology & Imaging", "Pathology & Laboratory",
  "Anaesthesiology", "Physiotherapy & Rehabilitation", "Dental & Maxillofacial",
  "Plastic & Cosmetic Surgery", "Vascular Surgery", "Rheumatology",
  "Haematology", "Transplant Surgery", "ICU / Critical Care", "Pharmacy"
];

const hospitals = [
  { name: "Fortis Hospital (Bannerghatta)", city: "Bengaluru", username: "fortis", password: "fortis2026", departments: privateDepts },
  { name: "Apollo Hospital (Seshadripuram)", city: "Bengaluru", username: "apollo", password: "apollo2026", departments: privateDepts },
  { name: "Apollo Hospital (Bannerghatta)", city: "Bengaluru", username: "apollo_bannerghatta", password: "apollo_bannerghatta2026", departments: privateDepts },
  { name: "Apollo Speciality (Jayanagar)", city: "Bengaluru", username: "apollo_jayanagar", password: "apollo_jayanagar2026", departments: privateDepts },
  { name: "Manipal Hospital (HAL)", city: "Bengaluru", username: "manipal_hal", password: "manipal_hal2026", departments: privateDepts },
  { name: "Manipal Hospital (Yeshwanthpur)", city: "Bengaluru", username: "manipal_yeshwanthpur", password: "manipal_yeshwanthpur2026", departments: privateDepts },
  { name: "Manipal Hospital (Whitefield)", city: "Bengaluru", username: "manipal_whitefield", password: "manipal_whitefield2026", departments: privateDepts },
  { name: "Manipal Hospital (Hebbal)", city: "Bengaluru", username: "manipal_hebbal", password: "manipal_hebbal2026", departments: privateDepts },
  { name: "Manipal Hospital (Varthur)", city: "Bengaluru", username: "manipal_varthur", password: "manipal_varthur2026", departments: privateDepts },
  { name: "Aster CMI Hospital", city: "Bengaluru", username: "aster_cmi", password: "aster_cmi2026", departments: privateDepts },
  { name: "Bangalore Baptist Hospital", city: "Bengaluru", username: "baptist", password: "baptist2026", departments: privateDepts },
  { name: "HCG Cancer Hospital", city: "Bengaluru", username: "hcg", password: "hcg2026", departments: ["Oncology", "Radiation Oncology", "Surgical Oncology", "Medical Oncology", "Haematology", "Bone Marrow Transplant", "Palliative Care", "Radiology & Imaging", "Pathology & Laboratory", "Pharmacy"] },
  { name: "Fortis Hospital (Nagarbhavi)", city: "Bengaluru", username: "fortis_nagarbhavi", password: "fortis_nagarbhavi2026", departments: privateDepts },
  { name: "United Hospital", city: "Bengaluru", username: "united", password: "united2026", departments: privateDepts },
  { name: "Trustwell Hospital", city: "Bengaluru", username: "trustwell", password: "trustwell2026", departments: privateDepts },
  { name: "Suguna Hospital", city: "Bengaluru", username: "suguna", password: "suguna2026", departments: privateDepts },
  { name: "Marvel Multispeciality Hospital", city: "Bengaluru", username: "marvel", password: "marvel2026", departments: privateDepts },
  { name: "AMC Multispeciality Hospital", city: "Bengaluru", username: "amc", password: "amc2026", departments: privateDepts },
  { name: "Sankalpa Multispeciality Hospital", city: "Bengaluru", username: "sankalpa", password: "sankalpa2026", departments: privateDepts },
  { name: "Springleaf Hospital", city: "Bengaluru", username: "springleaf", password: "springleaf2026", departments: privateDepts },
  { name: "Victoria Hospital", city: "Bengaluru", username: "victoria", password: "victoria2026", departments: ["General Medicine", "General Surgery", "Orthopaedics", "ENT", "Ophthalmology", "Gynaecology & Obstetrics", "Emergency & Trauma", "Dermatology", "Dental", "Radiology & Imaging", "Pathology & Laboratory"] },
  { name: "Jayadeva Hospital", city: "Bengaluru", username: "jayadeva", password: "jayadeva2026", departments: ["Cardiology", "Cardiac Surgery", "Interventional Cardiology", "CT Surgery", "Cardiac Rehabilitation", "ECG & Echo Lab", "Cath Lab", "ICU / Critical Care"] },
  { name: "NIMHANS", city: "Bengaluru", username: "nimhans", password: "nimhans2026", departments: ["Psychiatry", "Neurology", "Neurosurgery", "Clinical Psychology", "Neuroimaging", "De-addiction", "Child Psychiatry", "Geriatric Psychiatry", "Neurochemistry"] },
  { name: "BMCRI", city: "Bengaluru", username: "bmcri", password: "bmcri2026", departments: ["General Medicine", "General Surgery", "Orthopaedics", "Paediatrics & Neonatology", "Gynaecology & Obstetrics", "ENT", "Ophthalmology", "Dermatology", "Psychiatry", "TB & Chest", "Forensic Medicine"] },
  { name: "BMCRI Super Speciality / PMSSY", city: "Bengaluru", username: "pmssy", password: "pmssy2026", departments: ["Neurosurgery", "Cardiology", "Nephrology", "Urology", "Plastic & Cosmetic Surgery", "Gastroenterology", "Endocrinology & Diabetology", "Oncology"] },
  { name: "K.C. General Hospital", city: "Bengaluru", username: "kc_general", password: "kc_general2026", departments: ["General Medicine", "General Surgery", "Orthopaedics", "ENT", "Dental", "Dermatology", "Ophthalmology", "Gynaecology & Obstetrics", "Emergency & Trauma"] },
  { name: "Bowring & Lady Curzon Hospital", city: "Bengaluru", username: "bowring", password: "bowring2026", departments: ["General Medicine", "General Surgery", "Orthopaedics", "Gynaecology & Obstetrics", "Paediatrics & Neonatology", "ENT", "Ophthalmology", "Dermatology", "Emergency & Trauma"] },
  { name: "Jayanagar General Hospital", city: "Bengaluru", username: "jayanagar_general", password: "jayanagar_general2026", departments: ["General Medicine", "General Surgery", "Gynaecology & Obstetrics", "Paediatrics & Neonatology", "ENT", "Dental", "Pharmacy", "Emergency & Trauma"] },
  { name: "BBMP Multi-Speciality Hospital", city: "Bengaluru", username: "bbmp", password: "bbmp2026", departments: ["General Medicine", "General Surgery", "Orthopaedics", "Gynaecology & Obstetrics", "Paediatrics & Neonatology", "Ophthalmology", "Dental"] },
  { name: "Vanivilas Hospital", city: "Bengaluru", username: "vanivilas", password: "vanivilas2026", departments: ["Gynaecology & Obstetrics", "Neonatology", "Paediatrics & Neonatology", "NICU", "PICU", "Fetal Medicine"] },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB Atlas');
  await Hospital.deleteMany({});
  console.log('Cleared old hospitals');
  for (const h of hospitals) {
    const hashed = await bcrypt.hash(h.password, 10);
    const depts = h.departments.map(name => ({ name, avgConsultMinutes: 15, isActive: true }));
    await Hospital.create({ name: h.name, city: h.city, username: h.username, password: hashed, departments: depts, address: h.city, phone: '', congestionLevel: 'low' });
    console.log('Added: ' + h.name);
  }
  console.log('All 30 hospitals seeded!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
