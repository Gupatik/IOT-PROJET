import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Sidebar from "./Sidebar";
import PlantStatusCard from "./PlantStatusCard";
import RealtimeMeasureCard from "./RealtimeMeasureCard";
import ChartsSection from "./ChartsSection";
import CommandPanel from "./CommandPanel";
import AiPanel from "./AiPanel";
import NotificationsPanel from "./NotificationsPanel";
import "../style/dashboard.css";
import PlantHistoryGrid from "./HistoryTable";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Settings from "./Settings";

const API_BASE_URL = "http://localhost:5000"; 

// --- CONFIGURATION AXIOS ---
// On force le header ici au cas où index.js n'aurait pas été mis à jour correctement
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
  },
});

function Dashboard() {
  const [activeItem, setActiveItem] = useState("plant");
  const [selectedPlant, setSelectedPlant] = useState("PLANT-001");
  const [plants, setPlants] = useState([]);
  const [plantData, setPlantData] = useState(null);
  const [commandStats, setCommandStats] = useState({
    water: 0,
    light_on: 0,
    light_off: 0,
  });
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes("settings")) setActiveItem("settings");
}, [location]);
useEffect(() => {
  const loadPlants = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/all-data`);
      const plantsData = res.data.plants || {}; // Récupère les plantes
      // Convertir en array pour le select
      const plantsArray = Object.keys(plantsData).map((id) => ({
        id,
        name: plantsData[id].name || id, // Si pas de nom, afficher l'id
      }));
      setPlants(plantsArray);

      // Sélectionner la première plante par défaut
      if (plantsArray.length > 0) setSelectedPlant(plantsArray[0].id);
    } catch (error) {
      console.error("Erreur lors du chargement des plantes:", error);
    }
  };
  loadPlants();
}, []);


useEffect(() => {
  if (!selectedPlant) return;

  const loadPlant = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/plants/${selectedPlant}/state`);
      setPlantData(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des données de la plante:", error);
      setPlantData(null);
    }
  };
  loadPlant();

  // Optionnel : refresh toutes les X secondes pour simuler temps réel
  const interval = setInterval(loadPlant, 3000);
  return () => clearInterval(interval);

}, [selectedPlant]);


  const renderContent = () => {
    switch (activeItem) {
      case "plant":
        return (
          <div className="dashboard-content">
            {plantData ? (
              <>
                <div className="measures-container">
                  <RealtimeMeasureCard
                    title="Humidité"
                    value={plantData.humidity + "%"}
                    icon="FaTint"
                    color="#4ECDC4"
                    backcolor="#DFF2EB"
                  />
                  <RealtimeMeasureCard
                    title="Température"
                    value={plantData.temperature + "°C"}
                    icon="FaThermometerHalf"
                    color="#FF6B6B"
                    backcolor="#FCEF91"
                  />
                  <RealtimeMeasureCard
                    title="Lumière"
                    value={plantData.lightLevel + " lux"}
                    icon="FaSun"
                    color="#FFD93D"
                    backcolor="#FCF9EA"
                  />
                  <RealtimeMeasureCard
                    title="Humidité du sol"
                    value={plantData.soilMoisture + "%"}
                    icon="FaSeedling"
                    color="#8D6E63"
                    backcolor="#F3E5AB"
                  />
                </div>

                <div className="plant-overview">
                  <PlantStatusCard emotion={plantData.emotion} />

                  <CommandPanel
                    plants={plants}
                    selectedPlant={selectedPlant}
                    commandStats={commandStats}
                    setCommandStats={setCommandStats}
                  />
                </div>
              </>
            ) : (
              <div className="loading-spinner">
                <CircularProgress size={32} color="success" />
              </div>
            )}
          </div>
        );

      case "statistiques":
        return (
          <div className="dashboard-content">
            <h2>Suivi des mesures</h2>
            <ChartsSection plantId={selectedPlant} commandStats={commandStats} />
          </div>
        );

      case "history":
        return (
          <div className="dashboard-content">
            <h2>Historique des mesures</h2>
            <PlantHistoryGrid selectedPlant={selectedPlant} />
          </div>
        );

      case "prediction":
        return (
          <div className="dashboard-content">
            <h2>Prévoir l'état futur de la plante</h2>
            <AiPanel plantData={plantData} />
          </div>
        );

      case "settings":
        return (
          <div className="dashboard-content">
            <Settings/>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      <main className="dashboard-main">
        {(activeItem === "plant" ||
          activeItem === "statistiques" ||
          activeItem === "history") && (
          <div className="plant-selector-global">
            <label>Plante: </label>
            <select
              onChange={(e) => setSelectedPlant(e.target.value)}
              value={selectedPlant}
            >
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {renderContent()}
      </main>

      <NotificationsPanel plantId={selectedPlant} />
    </div>
  );
}

export default Dashboard;
