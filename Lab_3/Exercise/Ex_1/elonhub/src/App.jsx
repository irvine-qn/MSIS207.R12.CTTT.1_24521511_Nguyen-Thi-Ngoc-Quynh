import DeveloperCard from "./components/DeveloperCard/DeveloperCard";

const BIRTH_DATE = new Date(1971, 5, 28);

// Tinh tuoi tu ngay sinh de khong phai sua tay moi nam
function getAge(birthDate) {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const hadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());
  return hadBirthday ? age : age - 1;
}

const developer = {
  name: "Elon Musk",
  title: "CEO",
  bio: "Founder of SpaceX and Tesla, building rockets and electric cars to make humanity multiplanetary.",
  avatarUrl: "/Elon_Musk_-_54820081119_(3x4_cropped,_Rule_of_thirds).jpg.webp",
  details: [
    { label: "Company", value: "SpaceX" },
    { label: "Hobbies", value: "Eating bun bo Hue and going to Mars" },
    { label: "Age", value: getAge(BIRTH_DATE) },
    { label: "Zodiac Sign", value: "Cancer" },
    { label: "Date of Birth", value: "June 28, 1971" },
    { label: "Species", value: "Human" },
  ],
  skills: [
    { name: "React" },
    { name: "Rocket Engineering" },
    { name: "Electric Vehicles" },
    { name: "Physics" },
    { name: "Entrepreneurship" },
  ],
};

function App() {
  return <DeveloperCard {...developer} />;
}

export default App;
