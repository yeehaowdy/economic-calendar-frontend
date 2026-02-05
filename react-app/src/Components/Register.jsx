import React from 'react'
import "../App.css";

const Register = () => {

  const [felhasznaloNev, setFelhasznaloNev] = useState("");
  const [jelszo, setJelszo] = useState("");
  const [hiba, setHiba] = useState("");
  const [toltes, setToltes] = useState(false); 

  const navigate = useNavigate();

  const registerHandler = async () => {
    if (!felhasznaloNev || !jelszo) {
      setHiba("Minden mező kitöltése kötelező!");
      return;
    }

    setHiba("");
    setToltes(true);

    try {

      const response = await fetch("/api/Auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ felhasznaloNev, jelszo }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/", {
          state: { uzenet: "Sikeres regisztráció ✅" }
        });
      } else {
        setHiba(data.message || "Hiba történt a regisztráció során.");
      }
    } catch (error) {
      setHiba("Nem sikerült kapcsolódni a szerverhez.");
    } finally {
      setToltes(false);
    }
  };

  return (
    <div className="register">
      <h2>Regisztráció</h2>

      {hiba && <p className="hiba" style={{color: "red", textAlign:"center"}}>{hiba}</p>}

      <input
        type="text"
        placeholder="Felhasználónév"
        value={felhasznaloNev}
        onChange={(e) => setFelhasznaloNev(e.target.value)}
        disabled={toltes}
      />

      <input
        type="password"
        placeholder="Jelszó"
        value={jelszo}
        onChange={(e) => setJelszo(e.target.value)}
        disabled={toltes}
      />

      <button 
        onClick={registerHandler} 
        style={{marginTop:"10px"}}
        disabled={toltes}
      >
        {toltes ? "Folyamatban..." : "Regisztráció"}
      </button>
    </div>
  )
}

export default Register
