import DeveloperCard from './components/DeveloperCard/DeveloperCard'

const developer = {
  name: 'Elon Musk',
  title: 'CEO',
  bio: '',
  avatarUrl: '',
  details: [{ label: 'Company', value: 'SpaceX' }],
  skills: [{ name: 'React' }],
}

function App() {
  return <DeveloperCard {...developer} />
}

export default App
