import { Box, Toolbar } from "@mui/material"
import { Route, Routes } from "react-router-dom"
import Transformers from "./pages/tranformers"
import Settings from "./pages/settings"
import Sidebar from "./components/sideBar"
import TestTransformersPage from "./pages/test"


function App() {

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* <Toolbar /> */}
        <Routes>
          <Route path="/" element={<Transformers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/test" element={<TestTransformersPage />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App
