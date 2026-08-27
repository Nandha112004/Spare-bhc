// Bishop Heber College (Autonomous), Tiruchirappalli — Official Data
// Source: https://bhc.edu.in/academics/departments/ and https://en.wikipedia.org/wiki/Bishop_Heber_College
// Address: Post Box No. 615, Vayalur Road, Puthur, Tiruchirappalli – 620 017, Tamil Nadu
// Coordinates: 10.8188° N, 78.6754° E (central campus)

export const BHC = {
  name: "Bishop Heber College (Autonomous)",
  short: "BHC",
  city: "Tiruchirappalli",
  state: "Tamil Nadu",
  pincode: "620017",
  address: "Post Box No. 615, Vayalur Road, Puthur, Tiruchirappalli – 620 017, Tamil Nadu",
  phone: "0431-2770136 / 2770158",
  email: "principal@bhc.edu.in",
  website: "https://bhc.edu.in",
  affiliation: "Bharathidasan University",
  accreditation: "NAAC A++ (CGPA 3.69, valid till 13-09-2030)",
  established: 1966, // as BHC autonomous; origins 1873/1762 per sources, but 1966 is Heber in Trichy form
  nirf2025: 46, // 33 in 2024, 46 in 2025 college category
  campus: {
    center: { lat: 10.8188, lng: 78.6754 },
    // Alternative precise from Shiksha: 10.8148, 78.6735 — we use 10.8188 as primary (Wikipedia geohack)
    vistorGate: "Vayalur Main Road, near Puthur Nal Road Bus Stop (400m)",
    railway: "Tiruchirappalli Junction — 3.5 km, 10 min by auto",
    airport: "Tiruchirappalli International Airport — 7.7 km, 15 min",
    busStop: "Puthur Nal Road / Kumaran Nagar — 400m",
  },
  // 23 Departments as listed on https://bhc.edu.in/academics/departments/
  departments: [
    // Arts & Humanities — 7
    "Commerce",
    "Economics",
    "English",
    "History",
    "Management Studies",
    "Social Work",
    "Tamil",
    // Science & Technology — 16
    "Actuarial Science",
    "Bioinformatics",
    "Biotechnology",
    "Botany",
    "Chemistry",
    "Computer Application",
    "Computer Science",
    "Data Science",
    "Environmental Sciences",
    "Information Technology",
    "Library and Information Science",
    "Mathematics",
    "Nutrition and Dietetics",
    "Physics",
    "Visual Communication",
    "Zoology",
  ],
  // Blocks & landmarks for resource locations — offsets around center
  campusLocations: [
    { name: "BHC Main Gate / Admin Block", lat: 10.8188, lng: 78.6754, block: "Admin" },
    { name: "P. Vishwanathan Block (Arts & Science)", lat: 10.8192, lng: 78.6758, block: "Arts" },
    { name: "Bishop Solomon Doraiswamy Block (Computer Science)", lat: 10.8185, lng: 78.6749, block: "CS" },
    { name: "BHC Central Library", lat: 10.8190, lng: 78.6752, block: "Library" },
    { name: "Men's Hostel, BHC", lat: 10.8175, lng: 78.6760, block: "Hostel" },
    { name: "Women's Hostel, BHC", lat: 10.8178, lng: 78.6745, block: "Hostel" },
    { name: "BHC Cafeteria", lat: 10.8182, lng: 78.6762, block: "Cafeteria" },
    { name: "BHC Auditorium", lat: 10.8195, lng: 78.6748, block: "Auditorium" },
    { name: "HAIF Instrumentation Facility", lat: 10.8180, lng: 78.6740, block: "HAIF" },
    { name: "BHC Sports Complex", lat: 10.8170, lng: 78.6755, block: "Sports" },
    { name: "BHC Chapel", lat: 10.8193, lng: 78.6750, block: "Chapel" },
    { name: "Environmental Sciences Lab", lat: 10.8186, lng: 78.6765, block: "Science" },
  ],
}

// Helper to pick random campus location
export const randomBhcLocation = () => {
  const loc = BHC.campusLocations[Math.floor(Math.random() * BHC.campusLocations.length)]
  // small jitter +-0.0003 deg (~30m) for realism
  const jitter = () => (Math.random() - 0.5) * 0.0006
  return {
    latitude: loc.lat + jitter(),
    longitude: loc.lng + jitter(),
    location_text: loc.name,
  }
}

// Department display helpers
export const departmentOptions = BHC.departments.map(d => ({ value: d, label: d }))
