import { BrowserRouter } from 'react-router-dom'
import {Routes,Route} from 'react-router-dom'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>

          <Route path="/signup"> element={<Singup/>}</Route>
          <Route path="/signin"> element={<Singin/>}</Route>
          <Route path="/dashboard"> element={<Dashboard/>}</Route>
          <Route path="/send"> element={<SendMoney/>}</Route>

        </Routes>
      </BrowserRouter>
    </>

  )
}

export default App
