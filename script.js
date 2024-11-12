document.getElementById("factura-form").addEventListener("submit", function(e) {
    e.preventDefault();

    // Obtener los valores del formulario
    const nombre = document.getElementById("nombre").value;
    const tipoCliente = document.getElementById("tipo").value;
    const consumo = parseFloat(document.getElementById("consumo").value);
    const factorPotencia = parseFloat(document.getElementById("factor-potencia").value); // No influye en el cálculo
    function recomendarCapacitor(consumo, factorPotencia) {
        const factorDeseado = 0.95; // Factor de potencia deseado
        const potenciaAparente = consumo / factorPotencia;
        const potenciaReactivaActual = potenciaAparente * Math.sin(Math.acos(factorPotencia));
        const potenciaReactivaNecesaria = potenciaAparente * Math.sin(Math.acos(factorDeseado));
        const capacitanciaNecesaria = potenciaReactivaActual - potenciaReactivaNecesaria;
    
        // Determinar el tamaño de capacitor necesario (en kVAR)
        const capacidadOptima = capacitanciaNecesaria > 0 ? capacitanciaNecesaria : 0;
    
        return capacidadOptima.toFixed(2); // Retorna en kVAR
    }
    

    // Constantes
    const PRECIO_PRIMEROS_600_KWH = 124.0;
    const PRECIO_EXCEDENTE = 135.0;
    const CARGO_FIJO_SUMINISTRO = 11421.88;
    const IVA_PORCENTAJE = 0.21;
    const SUBSIDIO_RESIDENCIAL = 37773.68;

    // Calcular el costo de luz
    let costoLuz;
    if (consumo <= 600) {
        costoLuz = consumo * PRECIO_PRIMEROS_600_KWH;
    } else {
        costoLuz = (600 * PRECIO_PRIMEROS_600_KWH) + ((consumo - 600) * PRECIO_EXCEDENTE);
    }

    // Aplicar descuento si el tipo de cliente es comerciante
    if (tipoCliente === "comerciante") {
        costoLuz *= 0.9;
    }

    // Calcular el costo con subsidio si el cliente es residencial
    let subsidioAplicado = 0;
    if (tipoCliente === "residencial") {
        subsidioAplicado = SUBSIDIO_RESIDENCIAL;
    }

    // Calcular IVA y total
    const costoConSubsidio = costoLuz - subsidioAplicado;
    const iva = (costoConSubsidio + CARGO_FIJO_SUMINISTRO) * IVA_PORCENTAJE;
    const total = costoConSubsidio + CARGO_FIJO_SUMINISTRO + iva;

    // Obtener la fecha actual
    const fechaActual = new Date().toLocaleDateString();

    document.getElementById("result-total").innerText = total.toFixed(2);
    document.getElementById("resultados").classList.remove("hidden");
    const capacidadOptima = recomendarCapacitor(consumo, factorPotencia);
    document.getElementById("result-capacitor").innerText = capacidadOptima + " kVAR";
    document.getElementById("recomendacion-capacitor").classList.remove("hidden");



    // Mostrar resultados en HTML
    document.getElementById("result-nombre").innerText = nombre;
    document.getElementById("result-tipo").innerText = tipoCliente === "comerciante" ? "Comerciante" : "Residencial Común";
    document.getElementById("result-consumo").innerText = consumo + " kWh";
    document.getElementById("result-costo-luz").innerText = costoLuz.toFixed(2);
    document.getElementById("result-cargo-fijo").innerText = CARGO_FIJO_SUMINISTRO.toFixed(2);
    document.getElementById("result-iva").innerText = iva.toFixed(2);
    document.getElementById("result-total").innerText = total.toFixed(2);
    document.getElementById("resultados").classList.remove("hidden");

    // Función para descargar Excel
    document.getElementById("download-excel-btn").addEventListener("click", function() {
        const wb = XLSX.utils.book_new();
        const ws_data = [
            ["Fecha", "Nombre", "Tipo de Cliente", "Consumo (kWh)", "Costo de Luz", "Subsidio", "Cargo Fijo", "IVA (21%)", "Total a Pagar"],
            [fechaActual, nombre, tipoCliente, consumo, costoLuz.toFixed(2), subsidioAplicado.toFixed(2), CARGO_FIJO_SUMINISTRO.toFixed(2), iva.toFixed(2), total.toFixed(2)]
        ];
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, "Factura");
        XLSX.writeFile(wb, "Factura_Electricidad.xlsx");
    });

    // Función para descargar PDF
    document.getElementById("download-pdf-btn").addEventListener("click", function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text("Factura de Electricidad", 10, 10);
        doc.text(`Fecha: ${fechaActual}`, 10, 20);
        doc.text(`Nombre: ${nombre}`, 10, 30);
        doc.text(`Tipo de Cliente: ${tipoCliente === "comerciante" ? "Comerciante" : "Residencial Común"}`, 10, 40);
        doc.text(`Consumo (kWh): ${consumo}`, 10, 50);
        doc.text(`Costo de Luz: $${costoLuz.toFixed(2)}`, 10, 60);
        doc.text(`Subsidio: $${subsidioAplicado.toFixed(2)}`, 10, 70);
        doc.text(`Cargo Fijo por Suministro: $${CARGO_FIJO_SUMINISTRO.toFixed(2)}`, 10, 80);
        doc.text(`IVA (21%): $${iva.toFixed(2)}`, 10, 90);
        doc.text(`Total a Pagar: $${total.toFixed(2)}`, 10, 100);

        doc.save("Factura_Electricidad.pdf");
    });
});


