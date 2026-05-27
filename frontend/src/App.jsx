import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Landing from "./pages/Landing";
import HospitalsPage from "./pages/HospitalsPage";
import CheckinPage from "./pages/CheckinPage";
import TrackPage from "./pages/TrackPage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/hospitals" element={<HospitalsPage />} />
          <Route path="/checkin/:hospitalId" element={<CheckinPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/track/:token" element={<TrackPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/:hospitalId" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1A3631",
            color: "#F7F6F3",
            border: "1px solid rgba(247, 246, 243, 0.15)",
            borderRadius: "4px",
            fontFamily: "IBM Plex Sans, sans-serif",
          },
        }}
      />
    </div>
  );
}

export default App;
