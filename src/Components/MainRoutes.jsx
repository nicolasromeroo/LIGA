import { Routes, Route } from "react-router-dom"

import Dashboard from "./Dashboard.jsx"

import Register from "./Auth/Register.jsx"
import Login from "./Auth/Login.jsx"

import Players from "./Cards/Players.jsx"
import AdminPanel from "./Cards/AdminPanel.jsx"
import Sobres from "./Cards/Sobres.jsx"
import MyPlayers from "./Cards/MyPlayers.jsx"
import Pvp from "./Pvp.jsx"
import News from "./News.jsx"
import LiveScores from "./LiveScores.jsx"
import Mundial from "./Mundial.jsx"
import Prode from "./Prode.jsx"

const MainRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/panel" element={<AdminPanel />} />

            <Route path="/sobres" element={<Sobres />} />
            <Route path="/players" element={<Players />} />
            <Route path="/myPlayers" element={<MyPlayers />} />
            <Route path="/pvp" element={<Pvp />} />
            <Route path="/prode" element={<Prode />} />
            <Route path="/news" element={<News />} />
            <Route path="/live" element={<LiveScores />} />
            <Route path="/mundial" element={<Mundial />} />
        </Routes>
    )
}

export default MainRoutes