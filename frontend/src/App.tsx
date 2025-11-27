import { Box, AppBar, Toolbar } from "@mui/material"
import { Route, Routes } from "react-router-dom"
import Settings from "./pages/settings"
//import Trial from "./pages/trial"
import Sidebar from "./components/sideBar"
//import TestTransformersPage from "./pages/test"
import Transformers from "./pages/tranformers"
import UserRole from "./components/userRole"


function App() {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* <Toolbar /> */}
        <AppBar
          position="sticky"
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 1,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Toolbar sx={{ justifyContent: 'flex-end', minHeight: '64px !important' }}>
            <UserRole />
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <Routes>
            <Route path="/" element={<Transformers />} />
            <Route path="/settings" element={<Settings />} />

            {/* <Route path="/test" element={<Test />} /> */}

            {/* <Route path="/trial" element={<Trial />} /> */}

          </Routes>
        </Box>
      </Box>
    </Box>
  )
}

export default App
