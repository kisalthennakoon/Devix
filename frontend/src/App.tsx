import { Box, Toolbar } from "@mui/material"
import { Route, Routes } from "react-router-dom"
import Transformers from "./pages/inspectionTest"
import Settings from "./pages/settings"
import Sidebar from "./components/sideBar"


function App() {

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* <Toolbar /> */}
        <Routes>
          <Route path="/" element={<Transformers />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App
