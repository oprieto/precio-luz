function cleanTable() {
  document.getElementById("resultado").innerHTML = "";
  document.getElementById("status").innerHTML = "";
}

async function cargarDatos() {
  const fecha = document.getElementById("fecha").value;
  const resultado = document.getElementById("resultado");
  const status = document.getElementById("status");

  resultado.innerHTML = "";

  if (!fecha) {
    status.innerHTML = "<span class='error'>Selecciona una fecha</span>";
    return;
  }

  const url = `https://api.esios.ree.es/archives/70/download_json?locale=es&date=${fecha}`;

  status.innerHTML = "Cargando datos...";

  try {
    const res = await fetch(url);
    const data = await res.json();

    status.innerHTML = "";

    const resultadoFormateado = data.PVPC.map(item => ({
      hora: item.Hora,
      pcb: Math.round((parseFloat(item.PCB.replace(",", ".")) / 1000) * 100) / 100
    }));

    const preciosUnicos = [...new Set(resultadoFormateado.map(x => x.pcb))]
      .sort((a, b) => a - b);

    const masBarata = preciosUnicos[0];
    const segundaBarata = preciosUnicos[1];
    const masCara = preciosUnicos[preciosUnicos.length - 1];

    let html = `
      <table>
        <thead>
          <tr>
            <th>Hora</th>
            <th>€/kWh</th>
          </tr>
        </thead>
        <tbody>
    `;

    resultadoFormateado.forEach(item => {
      let clase = "";

      if (item.pcb === masBarata) clase = "green";
      else if (item.pcb === segundaBarata) clase = "purple";
      else if (item.pcb === masCara) clase = "red";

      html += `
        <tr class="${clase}">
          <td>${item.hora}</td>
          <td>${item.pcb.toFixed(2)} €</td>
        </tr>
      `;
    });

    html += "</tbody></table>";
    resultado.innerHTML = html;

  } catch (err) {
    status.innerHTML = "<span class='error'>Error al cargar datos</span>";
    console.error(err);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const inputFecha = document.getElementById("fecha");

  // Obtener fecha de hoy en formato YYYY-MM-DD
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');

  const fechaHoy = `${yyyy}-${mm}-${dd}`;

  // Asignar al input
  inputFecha.value = fechaHoy;

  // Cargar datos automáticamente
  cargarDatos();
});