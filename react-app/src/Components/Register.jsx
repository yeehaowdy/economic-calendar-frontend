import React from 'react'
import "../App.css";

const Register = () => {
  const URL = process.env.BACKEND_URL
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

      const response = await fetch(`${URL}/api/Auth/register`, {
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
        placeholder="username"
        value={felhasznaloNev}
        onChange={(e) => setFelhasznaloNev(e.target.value)}
        disabled={toltes}
      />

      <input
        type="password"
        placeholder="password"
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
      <button>Goggle register</button>
    </div>
  )
}

export default Register
