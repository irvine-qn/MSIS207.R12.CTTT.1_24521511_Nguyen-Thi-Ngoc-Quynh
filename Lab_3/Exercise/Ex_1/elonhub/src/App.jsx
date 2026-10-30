import DeveloperCard from "./components/DeveloperCard/DeveloperCard";

const developer = {
  name: "Elon Musk",
  title: "CEO",
  bio: "",
  avatarUrl: "/Elon_Musk_-_54820081119_(3x4_cropped,_Rule_of_thirds).jpg.webp",
  details: [{ label: "Company", value: "SpaceX" }],
  skills: [{ name: "React" }],
};

function App() {
  return <DeveloperCard {...developer} />;
}

export default App;
