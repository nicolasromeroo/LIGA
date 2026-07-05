import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./Contexts/AuthContext.jsx";

import "./assets/styles/tailwind.css";

import NavBar from "./Components/NavBar.jsx";
import BottomNav from "./Components/BottomNav.jsx";
import Footer from "./Components/Footer.jsx";
import MainRoutes from "./Components/MainRoutes.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
        <main className="pb-bottom-nav">
          <MainRoutes />
        </main>
        <Footer />
        <BottomNav />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
