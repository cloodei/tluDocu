import { Route, Routes } from 'react-router'
import './index.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-4">Hello World!</div>} />
    </Routes>
  )
}
