import { useState } from 'react'
import Workspace from './components/Workspace'
import WelcomeScreen from './components/WelcomeScreen'
import { useProjectStore } from './stores/projectStore'

function App() {
  const { currentProject } = useProjectStore()
  const [showWelcome, setShowWelcome] = useState(!currentProject)

  if (showWelcome && !currentProject) {
    return <WelcomeScreen onStart={() => setShowWelcome(false)} />
  }

  return <Workspace />
}

export default App



