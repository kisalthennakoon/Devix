import { Box } from "@mui/material"
import { Route, Routes } from "react-router-dom"
import Settings from "./pages/settings"
//import Trial from "./pages/trial"
import Sidebar from "./components/sideBar"
//import TestTransformersPage from "./pages/test"
import Transformers from "./pages/tranformers"



function App() {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* <Toolbar /> */}
        <Routes>
          <Route path="/" element={<Transformers />} />
          <Route path="/settings" element={<Settings />} />

          {/* <Route path="/test" element={<Test />} /> */}

          {/* <Route path="/trial" element={<Trial />} /> */}

        </Routes>
      </Box>
    </Box>
  )
}

export default App
