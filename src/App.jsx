import { useState, useEffect } from "react";
import { auth, db } from "./firebase";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  collection,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
  getDoc,
} from "firebase/firestore";

import { pdf } from "@react-pdf/renderer";
import ServicePDF from "./ServicePDF";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);

  const [work, setWork] = useState("");
  const [km, setKm] = useState("");
  const [price, setPrice] = useState("");

  const [editIndex, setEditIndex] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [editProfile, setEditProfile] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          setFirstName(snap.data().firstName || "");
          setLastName(snap.data().lastName || "");
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "cars"), where("uid", "==", user.uid));

    return onSnapshot(q, (snap) => {
      setCars(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  /* ================= PRO PDF EXPORT ================= */
  async function exportPDF(car) {
    const blob = await pdf(
      <ServicePDF car={car} user={user} />
    ).toBlob();

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${car.name}-service-report.pdf`;
    a.click();
  }

  /* ================= SAVE SERVICE ================= */
  async function saveService(car) {
    const ref = doc(db, "cars", car.id);

    let newHistory = [...(car.history || [])];

    if (editIndex !== null) {
      newHistory[editIndex] = {
        work,
        km,
        price,
        date: new Date().toLocaleDateString(),
      };
    } else {
      newHistory.push({
        work,
        km,
        price,
        date: new Date().toLocaleDateString(),
      });
    }

    await updateDoc(ref, { history: newHistory });

    setWork("");
    setKm("");
    setPrice("");
    setEditIndex(null);
  }

  /* ================= DELETE ================= */
  async function deleteService(car, index) {
    const ref = doc(db, "cars", car.id);

    const newHistory = car.history.filter((_, i) => i !== index);

    await updateDoc(ref, { history: newHistory });
  }

  const total = (car) =>
    (car.history || []).reduce((a, b) => a + Number(b.price || 0), 0);

  if (!user) return <div style={styles.center}>Loading...</div>;

  return (
    <div style={styles.app}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h3>🚗 Garage</h3>

        <div style={styles.nav} onClick={() => setPage("dashboard")}>Dashboard</div>
        <div style={styles.nav} onClick={() => setPage("cars")}>Cars</div>
        <div style={styles.nav} onClick={() => setPage("settings")}>Settings</div>

        <div style={styles.logoutWrap}>
          <button onClick={() => signOut(auth)} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>

        {/* DASHBOARD */}
        {page === "dashboard" && (
          <div>
            <h2>Dashboard</h2>

            <div style={styles.grid}>
              <div style={styles.card}>
                <h3>Cars</h3>
                <div style={styles.big}>{cars.length}</div>
              </div>

              <div style={styles.card}>
                <h3>Total spend</h3>
                <div style={styles.big}>
                  €{cars.reduce((a, c) => a + total(c), 0)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CARS */}
        {page === "cars" && !selectedCar && (
          <div>
            <h2>Cars</h2>

            {cars.map((c) => (
              <div
                key={c.id}
                style={styles.carCard}
                onClick={() => setSelectedCar(c)}
              >
                🚘 {c.name}
                <span>€{total(c)}</span>
              </div>
            ))}
          </div>
        )}

        {/* CAR DETAILS */}
        {page === "cars" && selectedCar && (
          <div style={styles.card}>

            <button onClick={() => setSelectedCar(null)} style={styles.backBtn}>
              ← Back
            </button>

            <h2>{selectedCar.name}</h2>

            <input value={work} onChange={(e)=>setWork(e.target.value)} placeholder="Service" style={styles.input}/>
            <input value={km} onChange={(e)=>setKm(e.target.value)} placeholder="Km" style={styles.input}/>
            <input value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="Price" style={styles.input}/>

            <button onClick={()=>saveService(selectedCar)} style={styles.primaryBtn}>
              Save service
            </button>

            {/* PDF BUTTON */}
            <button onClick={()=>exportPDF(selectedCar)} style={styles.actionBtn}>
              📄 Export PDF Report
            </button>

            <div style={styles.table}>
              {selectedCar.history?.map((h,i)=>(
                <div key={i} style={styles.row}>
                  <div>
                    <b>{h.work}</b>
                    <div style={styles.small}>{h.date}</div>
                  </div>

                  <div>{h.km} km</div>
                  <div>€{h.price}</div>

                  <button onClick={()=>{
                    setWork(h.work);
                    setKm(h.km);
                    setPrice(h.price);
                    setEditIndex(i);
                  }} style={styles.editBtn}>
                    Edit
                  </button>

                  <button onClick={()=>deleteService(selectedCar,i)} style={styles.deleteBtn}>
                    Delete
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* SETTINGS */}
        {page === "settings" && (
          <div>
            <h2>Profile</h2>

            <div style={styles.card}>
              {!editProfile ? (
                <>
                  <div><b>Name:</b> {firstName} {lastName}</div>

                  <button onClick={()=>setEditProfile(true)} style={styles.primaryBtn}>
                    Edit profile
                  </button>
                </>
              ) : (
                <>
                  <input value={firstName} onChange={(e)=>setFirstName(e.target.value)} style={styles.input}/>
                  <input value={lastName} onChange={(e)=>setLastName(e.target.value)} style={styles.input}/>

                  <button
                    onClick={async ()=>{
                      await updateDoc(doc(db,"users",user.uid),{
                        firstName,
                        lastName
                      });
                      setEditProfile(false);
                    }}
                    style={styles.primaryBtn}
                  >
                    Save
                  </button>
                </>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {

  app:{display:"flex",width:"100vw",height:"100vh",fontFamily:"Arial"},

  sidebar:{
    width:240,
    background:"#0b1220",
    color:"#fff",
    padding:20,
    display:"flex",
    flexDirection:"column"
  },

  nav:{
    padding:12,
    background:"#111b2e",
    borderRadius:12,
    marginBottom:10,
    cursor:"pointer"
  },

  logoutWrap:{
    marginTop:"auto",
    display:"flex",
    justifyContent:"center"
  },

  logoutBtn:{
    width:"100%",
    maxWidth:200,
    background:"#ef4444",
    border:"none",
    padding:"12px 18px",
    borderRadius:999,
    color:"#fff",
    cursor:"pointer"
  },

  main:{
    flex:1,
    padding:20,
    background:"#f5f6fa",
    overflowY:"auto"
  },

  card:{
    background:"#fff",
    padding:20,
    borderRadius:16,
    marginBottom:15
  },

  input:{
    width:"100%",
    padding:12,
    borderRadius:10,
    border:"1px solid #ddd",
    marginBottom:10
  },

  primaryBtn:{
    background:"#2563eb",
    color:"#fff",
    border:"none",
    padding:12,
    borderRadius:12,
    marginTop:10
  },

  actionBtn:{
    width:"100%",
    padding:12,
    borderRadius:12,
    marginTop:10,
    background:"#111827",
    color:"#fff",
    border:"none",
    cursor:"pointer"
  },

  grid:{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
    gap:15
  },

  big:{fontSize:28,fontWeight:"bold"},

  carCard:{
    background:"#fff",
    padding:15,
    borderRadius:12,
    display:"flex",
    justifyContent:"space-between",
    marginTop:10,
    cursor:"pointer"
  },

  backBtn:{
    background:"#fff",
    border:"1px solid #ddd",
    padding:"10px 14px",
    borderRadius:12,
    marginBottom:10
  },

  table:{marginTop:15},

  row:{
    display:"grid",
    gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",
    gap:10,
    padding:12,
    borderBottom:"1px solid #eee",
    alignItems:"center"
  },

  small:{fontSize:12,opacity:0.6},

  editBtn:{
    background:"#f59e0b",
    border:"none",
    padding:"6px 10px",
    borderRadius:8,
    color:"#fff"
  },

  deleteBtn:{
    background:"#ef4444",
    border:"none",
    padding:"6px 10px",
    borderRadius:8,
    color:"#fff"
  },

  center:{
    height:"100vh",
    display:"flex",
    justifyContent:"center",
    alignItems:"center"
  }
};