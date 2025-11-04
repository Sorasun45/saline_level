    // BLE UUIDs
    const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
    const CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

    let bleDevice;
    let bleCharacteristic;

    // Create Fluid Meter
    var fm = new FluidMeter();
    fm.init({
      targetContainer: document.getElementById("gauge-waterlevel"),
      fillPercentage: 0,
      options: {
        fontSize: "70px",
        fontFamily: "Arial",
        fontFillStyle: "white",
        drawShadow: true,
        drawText: true,
        drawPercentageSign: false,
        drawBubbles: true,
        size: 300,
        borderWidth: 1,
        fontSize: "45px",
        backgroundColor: false,
        foregroundColor: "#fff",
        maxValue: 1000,
        foregroundFluidLayer: {
          fillStyle: "purple",
          angularSpeed: 100,
          maxAmplitude: 12,
          frequency: 30,
          horizontalSpeed: -150
        },
        backgroundFluidLayer: {
          fillStyle: "pink",
          angularSpeed: 100,
          maxAmplitude: 9,
          frequency: 30,
          horizontalSpeed: 150
        }
      }
    });

    // ---- BLE Connect ----
    async function connectBLE() {
      try {
        bleDevice = await navigator.bluetooth.requestDevice({
          filters: [{ namePrefix: "ESP32C3-Scale" }],
          optionalServices: [SERVICE_UUID]
        });

        const server = await bleDevice.gatt.connect();
        const service = await server.getPrimaryService(SERVICE_UUID);
        bleCharacteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

        await bleCharacteristic.startNotifications();
        bleCharacteristic.addEventListener("characteristicvaluechanged", handleNotification);

        // alert("✅ BLE Connected!");
      } catch (error) {
        alert("❌ BLE Error: " + error);
      }
    }

    // ---- Handle data from ESP32C3 ----
    function handleNotification(event) {
      const rawText = new TextDecoder().decode(event.target.value).trim();
      const value = parseFloat(rawText);

      if (!isNaN(value)) {
        console.log("BLE Value:", value);
        fm.setPercentage(value);
      }
    }

    // ---- Add BLE Button ----
    const btn = document.createElement("button");
    btn.innerText = "Connect BLE";
    btn.style.cssText = "position:fixed; top:15px; right:15px; padding:10px 20px; font-size:18px;";
    btn.onclick = connectBLE;
    document.body.appendChild(btn);