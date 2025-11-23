import React, { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DarkModeIcon from '@mui/icons-material/DarkMode';

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";

// --- CORRECTION 1 : DÉFINIR L'URL ICI ---
// Remplace le lien ci-dessous par ton lien Ngrok ACTUEL si ce n'est pas le bon
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://scrofulous-pseudoemotionally-charley.ngrok-free.dev"; 

function CommandPanel({ plants, selectedPlant, commandStats, setCommandStats }) {
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); 
  const [open, setOpen] = useState(false);

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return; 
    setOpen(false);
  };

  const sendCommand = async (command) => {
    setLoading(true);
    try {
      // Utilisation de la variable API_BASE_URL définie plus haut
      const res = await fetch(`${API_BASE_URL}/plants/${selectedPlant}/command`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true" // INDISPENSABLE pour Ngrok
        }, 
        body: JSON.stringify({ command }),
      });
      
      const data = await res.json();

      if (res.ok) {
        setAlertMessage(`Commande "${command}" envoyée avec succès !`);
        setAlertType("success");
      } else {
        setAlertMessage(data?.error || "Erreur lors de l'envoi");
        setAlertType("error");
      }
    } catch (error) {
      console.error("Erreur commande:", error);
      setAlertMessage("Erreur réseau : Vérifiez Ngrok");
      setAlertType("error");
    } finally {
      setLoading(false);
      setOpen(true);
    }
  };

  return (
    <div className="command-panel-card">
      <h3>Contrôles de la plante</h3>

      <div className="command-buttons">
        <button
          className="btn water"
          onClick={() => sendCommand("water")}
          disabled={loading}
        >
          <WaterDropIcon style={{ marginRight: 6 }} /> Water
        </button>

        <button
          className="btn light-on"
          onClick={() => sendCommand("light_on")}
          disabled={loading}
        >
          <LightbulbIcon style={{ marginRight: 6 }} /> Light ON
        </button>

        <button
          className="btn light-off"
          onClick={() => sendCommand("light_off")}
          disabled={loading}
        >
          <DarkModeIcon style={{ marginRight: 6 }} /> Light OFF
        </button>
      </div>

      {loading && (
        <div className="loading-spinner">
          <CircularProgress size={32} color="success" />
        </div>
      )}

      {/* --- CORRECTION 2 : LE SNACKBAR DOIT ÊTRE ACTIF --- */}
      <Snackbar
        open={open}
        onClose={handleClose}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Slide direction="down" in={open}>
          <Alert
            onClose={handleClose}
            severity={alertType || "info"}
            variant="filled"
            sx={{ minWidth: 300, textAlign: "center" }}
          >
            {alertMessage}
          </Alert>
        </Slide>
      </Snackbar>
    </div>
  );
}

export default CommandPanel;
