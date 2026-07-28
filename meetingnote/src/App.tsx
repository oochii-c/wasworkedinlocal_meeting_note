import { useState } from 'react'
import { RecordScreen } from './screens/RecordScreen'
import { ProcessingScreen } from './screens/ProcessingScreen'
import { DetailScreen } from './screens/DetailScreen'
import { emptyMeeting, type MeetingState, type View } from './workspace/types'
import './App.css'

function App() {
  const [view, setView] = useState<View>('record')
  const [meeting, setMeeting] = useState<MeetingState>(emptyMeeting)
  const patch = (p: Partial<MeetingState>) => setMeeting((m) => ({ ...m, ...p }))

  const newMeeting = () => {
    setMeeting(emptyMeeting)
    setView('record')
  }

  return (
    <div key={view} className="screen">
      {view === 'record' && (
        <RecordScreen
          meeting={meeting}
          patch={patch}
          onNext={() => {
            patch({ date: new Date().toLocaleString('ko-KR') })
            setView('processing')
          }}
        />
      )}
      {view === 'processing' && (
        <ProcessingScreen
          meeting={meeting}
          patch={patch}
          onDone={() => setView('detail')}
          onBack={() => setView('record')}
        />
      )}
      {view === 'detail' && (
        <DetailScreen meeting={meeting} patch={patch} onNew={newMeeting} />
      )}
    </div>
  )
}

export default App
