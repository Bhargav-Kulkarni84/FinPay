import { BrowserRouter } from 'react-router-dom'
import {Routes,Route} from 'react-router-dom'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>

          <Route path="/signup" element={<Singup/>}/>
          <Route path="/signin" element={<Singin/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/send" element={<SendMoney/>}/>

        </Routes>
      </BrowserRouter>
    </>

  )
}

export default App
