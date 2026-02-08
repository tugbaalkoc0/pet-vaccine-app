import { useState } from "react";

export default function VaccineApp() {
  const [records, setRecords] = useState([]);
  const [pet, setPet] = useState("");
  const [vaccine, setVaccine] = useState("");
  const [date, setDate] = useState("");

  const addRecord = () => {
    if (!pet || !vaccine || !date) return;

    const newRecord = {
      id: Date.now(),
      pet,
      vaccine,
      date
    };

    setRecords([...records, newRecord]);
    setPet("");
    setVaccine("");
    setDate("");
  };

  const deleteRecord = (id) => {
    setRecords(records.filter(r => r.id !== id));
  };

  const updateRecord = (id) => {
    const newVaccine = prompt("Yeni aşı adı:");
    if (!newVaccine) return;

    setRecords(records.map(r =>
      r.id === id ? { ...r, vaccine: newVaccine } : r
    ));
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">🐾 Evcil Hayvan Aşı Takip</h2>

      <div className="card p-3 mb-4">
        <input
          className="form-control mb-2"
          placeholder="Hayvan adı"
          value={pet}
          onChange={e => setPet(e.target.value)}
        />

        <input
          className="form-control mb-2"
          placeholder="Aşı adı"
          value={vaccine}
          onChange={e => setVaccine(e.target.value)}
        />

        <input
          type="date"
          className="form-control mb-3"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        <button onClick={addRecord} className="btn btn-primary">
          Aşı Ekle
        </button>
      </div>

      {records.map(r => (
        <div key={r.id} className="card p-3 mb-2">
          <b>{r.pet}</b> — {r.vaccine} — {r.date}

          <div className="mt-2">
            <button
              onClick={() => updateRecord(r.id)}
              className="btn btn-warning btn-sm me-2"
            >
              Güncelle
            </button>

            <button
              onClick={() => deleteRecord(r.id)}
              className="btn btn-danger btn-sm"
            >
              Sil
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}