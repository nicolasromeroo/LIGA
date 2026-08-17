import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./Contexts/AuthContext.jsx";

import "./assets/styles/tailwind.css";

import NavBar from "./Components/NavBar.jsx";
import BottomNav from "./Components/BottomNav.jsx";
import Footer from "./Components/Footer.jsx";
import MainRoutes from "./Components/MainRoutes.jsx";
import ErrorBoundary from "./Components/ErrorBoundary.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#14161c",
              color: "#ededea",
              border: "1px solid #2a2c33",
            },
          }}
        />
        <NavBar />
        <main className="pb-bottom-nav">
          <ErrorBoundary>
            <MainRoutes />
          </ErrorBoundary>
        </main>
        <Footer />
        <BottomNav />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
