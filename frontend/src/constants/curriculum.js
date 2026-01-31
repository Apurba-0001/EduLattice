// Curriculum data organized by semester
export const CURRICULUM_DATA = [
  { semester: "Semester I", subject: "English for Technical Communication" },
  {
    semester: "Semester I",
    subject: "Understanding Harmony and Ethical Human Conduct",
  },
  { semester: "Semester I", subject: "Engineering Chemistry" },
  { semester: "Semester I", subject: "Calculus" },
  { semester: "Semester I", subject: "Programming for Problem Solving" },
  { semester: "Semester I", subject: "Engineering Chemistry Lab" },
  { semester: "Semester I", subject: "Programming for Problem Solving Lab" },
  { semester: "Semester I", subject: "Workshop and Manufacturing Practices" },
  { semester: "Semester I", subject: "Environmental Science" },
  {
    semester: "Semester II",
    subject: "Effective Communication and Soft Skills",
  },
  { semester: "Semester II", subject: "Semiconductor Physics" },
  { semester: "Semester II", subject: "Algebra and Vector Calculus" },
  {
    semester: "Semester II",
    subject: "Basic Electrical and Electronics Engineering",
  },
  { semester: "Semester II", subject: "Data Structure and Algorithms" },
  { semester: "Semester II", subject: "Semiconductor Physics Lab" },
  {
    semester: "Semester II",
    subject: "Basic Electrical and Electronics Engineering Lab",
  },
  { semester: "Semester II", subject: "Engineering Graphics and Design Lab" },
  { semester: "Semester II", subject: "Yoga and Sports" },
  { semester: "Semester III", subject: "Probability and Statistics" },
  { semester: "Semester III", subject: "Python Programming" },
  {
    semester: "Semester III",
    subject: "Computer Organization and Architecture",
  },
  { semester: "Semester III", subject: "Database Management Systems" },
  { semester: "Semester III", subject: "Python Programming Lab" },
  {
    semester: "Semester III",
    subject: "Computer Organization and Architecture Lab",
  },
  { semester: "Semester III", subject: "Database Management Systems Lab" },
  { semester: "Semester III", subject: "Constitution of India" },
  {
    semester: "Semester IV",
    subject: "Design Thinking for Entrepreneurship and Startups",
  },
  { semester: "Semester IV", subject: "Discrete Mathematics" },
  { semester: "Semester IV", subject: "Operating Systems" },
  { semester: "Semester IV", subject: "Design and Analysis of Algorithms" },
  { semester: "Semester IV", subject: "Object Oriented Programming" },
  { semester: "Semester IV", subject: "Formal Language and Automata Theory" },
  { semester: "Semester IV", subject: "Operating Systems Lab" },
  { semester: "Semester IV", subject: "Design and Analysis of Algorithms Lab" },
  { semester: "Semester IV", subject: "Object Oriented Programming Lab" },
  { semester: "Semester IV", subject: "Basic Ai tool's and Application" },
  { semester: "Semester V", subject: "Computer Networks" },
  { semester: "Semester V", subject: "Distributed System" },
  { semester: "Semester V", subject: "Compiler Design" },
  { semester: "Semester V", subject: "Professional Ethics" },
  { semester: "Semester V", subject: "Professional Elective Course I" },
  { semester: "Semester V", subject: "Computer Networks Lab" },
  { semester: "Semester V", subject: "Distributed System Lab" },
  { semester: "Semester V", subject: "Compiler Design Lab" },
  { semester: "Semester VI", subject: "Machine Learning" },
  { semester: "Semester VI", subject: "Data Mining and Data Warehousing" },
  { semester: "Semester VI", subject: "Internet of Things" },
  { semester: "Semester VI", subject: "Professional Elective Course II" },
  { semester: "Semester VI", subject: "Open Elective Course I" },
  { semester: "Semester VI", subject: "Machine Learning Lab" },
  { semester: "Semester VI", subject: "Data Mining and Data Warehousing Lab" },
  { semester: "Semester VII", subject: "Software Engineering" },
  { semester: "Semester VII", subject: "System Software and Administration" },
  { semester: "Semester VII", subject: "Professional Elective Course III" },
  { semester: "Semester VII", subject: "Open Elective Course II" },
  { semester: "Semester VII", subject: "Open Elective Course III" },
  { semester: "Semester VII", subject: "Software Tools and Techniques Lab" },
  { semester: "Semester VII", subject: "Industrial Training" },
  { semester: "Semester VII", subject: "Project I" },
  { semester: "Semester VIII", subject: "Project II" },
  { semester: "Semester VIII", subject: "Grand Viva Voce" },
];

// Get unique semesters
export const SEMESTERS = [
  ...new Set(CURRICULUM_DATA.map((item) => item.semester)),
];

// Get subjects for a specific semester
export const getSubjectsBySemester = (semester) => {
  return CURRICULUM_DATA.filter((item) => item.semester === semester).map(
    (item) => item.subject,
  );
};

// Get all unique subjects
export const ALL_SUBJECTS = [
  ...new Set(CURRICULUM_DATA.map((item) => item.subject)),
];
