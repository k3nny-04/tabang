import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LocationProvider } from './providers/LocationProvider'
import { useState } from 'react'
import MapPage from './pages/MapPage';
import AccountPage from './pages/AccountPage';
import Navbar from './components/NavBar';
import { LayersProvider } from './providers/LayersProvider';
import BottomSheet from './components/BottomSheet';
import ReportForm from './components/ReportForm';

function App() {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <BrowserRouter>
      <LocationProvider>
      <LayersProvider>
        <div className='relative flex h-screen flex-col transition-colors'>
          <main className='flex-1 overflow-hidden'>
            <Routes>
              <Route path='/' element={<Navigate to='/map' replace/>}/>
              <Route path='/map' element={<MapPage/>}/>
              <Route path='/account' element={<AccountPage/>}/>
            </Routes>
          </main>
          <Navbar onReportClick={() => setReportOpen(true)} />

          <BottomSheet open={reportOpen} onClose={() => setReportOpen(false)} title="Report an Issue">
            <ReportForm/>
          </BottomSheet>
        </div>
      </LayersProvider>
      </LocationProvider>
    </BrowserRouter>
  )
}

export default App
