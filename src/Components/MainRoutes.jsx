import { Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"

import Dashboard from "./Dashboard.jsx"

import Register from "./Auth/Register.jsx"
import Login from "./Auth/Login.jsx"
import RequireAdmin from "./Auth/RequireAdmin.jsx"

import Players from "./Cards/Players.jsx"
import AdminPanel from "./Cards/AdminPanel.jsx"
import Sobres from "./Cards/Sobres.jsx"
import MyPlayers from "./Cards/MyPlayers.jsx"
import Pvp from "./Pvp.jsx"
import News from "./News.jsx"
import LiveScores from "./LiveScores.jsx"
import Mundial from "./Mundial.jsx"
import Prode from "./Prode.jsx"
import NotFound from "./NotFound.jsx"
import PageTransition from "./PageTransition.jsx"

const page = (element) => <PageTransition>{element}</PageTransition>

const MainRoutes = () => {
    const location = useLocation()

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={page(<Dashboard />)} />

                <Route path="/register" element={page(<Register />)} />
                <Route path="/login" element={page(<Login />)} />
                <Route
                    path="/panel"
                    element={
                        <RequireAdmin>{page(<AdminPanel />)}</RequireAdmin>
                    }
                />

                <Route path="/sobres" element={page(<Sobres />)} />
                <Route path="/players" element={page(<Players />)} />
                <Route path="/myPlayers" element={page(<MyPlayers />)} />
                <Route path="/pvp" element={page(<Pvp />)} />
                <Route path="/prode" element={page(<Prode />)} />
                <Route path="/news" element={page(<News />)} />
                <Route path="/live" element={page(<LiveScores />)} />
                <Route path="/mundial" element={page(<Mundial />)} />

                <Route path="*" element={page(<NotFound />)} />
            </Routes>
        </AnimatePresence>
    )
}

export default MainRoutes
