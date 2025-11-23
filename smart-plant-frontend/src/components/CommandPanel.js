import React, { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";

// 1. URL NGROK (Vérifie qu'elle est identique à celle du Terminal Noir)
const API_BASE_URL = "https://scrofulous-pseudoemotionally-charley.ngrok-free.dev";

function CommandPanel({ plants, selectedPlant }) {
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [open, setOpen] = useState(false);

  // Variable pour la durée d'arrosage
  const [pumpDuration, setPumpDuration] = useState(5000);

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const sendCommand = async (command) => {
    setLoading(true);

    try {
      // 2. CORRECTION : Utilisation de l'URL Ngrok + Headers obligatoires
      const res = await fetch(`${API_BASE_URL}/plants/${selectedPlant}/command`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true" // Indispensable pour Ngrok
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
      setAlertMessage("Erreur réseau (Vérifiez Ngrok)");
      setAlertType("error");
    } finally {
      setLoading(false);
      setOpen(true);
    }
  };

  return (
    <div className="command-panel-card pro-card">
      <h3 className="section-title">Panneau de Commandes</h3>

      {/* LED SECTION */}
      <div className="command-section">
        <h4>Lumière LED</h4>
        <div className="command-buttons">
          <button className="btn" onClick={() => sendCommand("SET_LED_COLOR:RED")}>RED</button>
          <button className="btn" onClick={() => sendCommand("SET_LED_COLOR:GREEN")}>GREEN</button>
          <button className="btn" onClick={() => sendCommand("SET_LED_COLOR:BLUE")}>BLUE</button>
          <button className="btn" onClick={() => sendCommand("SET_LED_COLOR:YELLOW")}>YELLOW</button>
          <button className="btn" onClick={() => sendCommand("SET_LED_COLOR:PURPLE")}>PURPLE</button>
          <button className="btn" onClick={() => sendCommand("SET_LED_COLOR:CYAN")}>CYAN</button>
          <button className="btn" onClick={() => sendCommand("SET_LED_COLOR:WHITE")}>WHITE</button>
          <button className="btn" onClick={() => sendCommand("LED_OFF")}>LED OFF</button>
        </div>
      </div>

      {/* WATER PUMP */}
      <div className="water-pump-section">
        <h4>Pompe à eau</h4>

        <div>
          <input
            type="number"
            className="water-input"
            value={pumpDuration}
            onChange={(e) => setPumpDuration(e.target.value)}
          />
          ms
        </div>

        <div className="water-buttons">
          <button className="btn" onClick={() => sendCommand(`WATER_PUMP:${pumpDuration}`)}>
            Démarrer
          </button>
          <button className="btn" onClick={() => sendCommand("STOP_WATER")}>
            Stop
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-spinner">
          <CircularProgress size={32} />
        </div>
      )}

      {/* J'ai dé-commenté le Snackbar pour que tu voies les messages de succès/erreur */}
      <Snackbar open={open} onClose={handleClose} autoHideDuration={3000} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Slide direction="down" in={open}>
          <Alert severity={alertType || "info"} variant="filled" sx={{ minWidth: 250, textAlign: "center" }}>
            {alertMessage}
          </Alert>
        </Slide>
      </Snackbar>
    </div>
  );
}

export default CommandPanel;
