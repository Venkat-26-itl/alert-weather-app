import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import WeatherView from "./pages/WeatherView";
import { AuthProvider } from "./auth/app.auth";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/weather" element={<WeatherView />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
