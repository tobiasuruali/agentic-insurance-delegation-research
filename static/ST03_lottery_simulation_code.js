Qualtrics.SurveyEngine.addOnload(function () {
    // --- inject minimal CSS for loading animation ---
    (function () {
        var css = ""
          + "#sim-loading-wrapper {"
          + "  margin-top: 16px;"
          + "  text-align: center;"
          + "  font-family: Arial, sans-serif;"
          + "}"
          + "#sim-loading-text {"
          + "  font-weight: bold;"
          + "  margin-bottom: 6px;"
          + "}"
          + "#sim-loading-subtext {"
          + "  font-size: 0.9em;"
          + "  color: #555;"
          + "  margin-top: 6px;"
          + "}"
          + "#sim-loading-dots {"
          + "  display: inline-flex;"
          + "  gap: 6px;"
          + "  margin-top: 4px;"
          + "}"
          + "#sim-loading-dots span {"
          + "  width: 8px;"
          + "  height: 8px;"
          + "  border-radius: 50%;"
          + "  background-color: #333;"
          + "  display: inline-block;"
          + "  animation: sim-bounce 1s infinite ease-in-out;"
          + "}"
          + "#sim-loading-dots span:nth-child(2) { animation-delay: 0.15s; }"
          + "#sim-loading-dots span:nth-child(3) { animation-delay: 0.30s; }"
          + "@keyframes sim-bounce {"
          + "  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }"
          + "  40% { transform: translateY(-4px); opacity: 1; }"
          + "}";
        var style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    })();
    
    var acceptedRaw = Qualtrics.SurveyEngine.getEmbeddedData("AcceptedProduct") || "";
    var val = acceptedRaw.trim();

    // product map
    var productMap = {
        "P1":  { premium: 18, ded: 1000, limit: 15000, wb: 0 },
        "P2":  { premium: 22, ded: 1000, limit: 15000, wb: 0 },
        "P3":  { premium: 23, ded: 1000, limit: 50000, wb: 0 },
        "P4":  { premium: 27, ded: 1000, limit: 50000, wb: 0 },
        "P5":  { premium: 23, ded: 250,  limit: 15000, wb: 0 },
        "P6":  { premium: 27, ded: 250,  limit: 15000, wb: 0 },
        "P7":  { premium: 28, ded: 250,  limit: 50000, wb: 0 },
        "P8":  { premium: 32, ded: 250,  limit: 50000, wb: 0 },
        "P9":  { premium: 23, ded: 1000, limit: 15000, wb: 1 },
        "P10": { premium: 27, ded: 1000, limit: 15000, wb: 1 },
        "P11": { premium: 28, ded: 1000, limit: 50000, wb: 1 },
        "P12": { premium: 32, ded: 1000, limit: 50000, wb: 1 },
        "P13": { premium: 28, ded: 250,  limit: 15000, wb: 1 },
        "P14": { premium: 32, ded: 250,  limit: 15000, wb: 1 },
        "P15": { premium: 33, ded: 250,  limit: 50000, wb: 1 },
        "P16": { premium: 37, ded: 250,  limit: 50000, wb: 1 }
    };

    // normalize
    var uninsured = false;
    var prodId = "";
    var prem = 0, ded = 0, limit = 0, wb = 0;

    if (val === "" || val.toUpperCase() === "UNINSURED" || val === "-1") {
        uninsured = true;
        prodId = "Uninsured";
    } else {
        if (/^\d+$/.test(val)) {
            val = "P" + val;
        }
        if (productMap[val]) {
            prodId = val;
            prem   = productMap[val].premium;
            ded    = productMap[val].ded;
            limit  = productMap[val].limit;
            wb     = productMap[val].wb;
        } else {
            uninsured = true;
            prodId = "Uninsured";
        }
    }

    // event: 70 / 18 / 10 / 2
    var r = Math.random();
    var eventName, lossAmount;
    if (r < 0.70) {
        eventName = "No loss";
        lossAmount = 0;
    } else if (r < 0.88) {
        eventName = "Small loss";
        lossAmount = 1000;
    } else if (r < 0.98) {
        eventName = "Water-backup";
        lossAmount = 5000;
    } else {
        eventName = "Large loss";
        lossAmount = 40000;
    }

    // OOP
    var oop;
    if (uninsured) {
        oop = lossAmount;
    } else {
        if (eventName === "No loss") {
            oop = 0;
        } else if (eventName === "Small loss") {
            oop = Math.min(lossAmount, ded);
        } else if (eventName === "Water-backup") {
            oop = (wb === 1) ? Math.min(lossAmount, ded) : lossAmount;
        } else { // Large
            oop = Math.min(lossAmount, ded) + Math.max(0, lossAmount - ded - limit);
        }
    }

    // scenario bonus (keep your 1500 pot)
    var scenarioEndowment = 1500;
    var scenarioBonus = Math.max(scenarioEndowment - (prem + oop), 0);

    // dollar version of the scenario bonus
    var scenarioBonusDollar = Number((scenarioBonus / 1000).toFixed(2));

    // readable product description
    var productDescription;
    if (uninsured) {
        productDescription = "Uninsured";
    } else {
        productDescription = "Premium: " + prem +
            ", Deductible: " + ded +
            ", Coverage limit: " + limit +
            (wb === 1 ? ", with water-backup coverage" : ", without water-backup coverage");
    }

    // write Sim_...
    Qualtrics.SurveyEngine.setEmbeddedData("Sim_Event",               eventName);
    Qualtrics.SurveyEngine.setEmbeddedData("Sim_LossAmount",          lossAmount.toString());
    Qualtrics.SurveyEngine.setEmbeddedData("Sim_Premium",             prem.toString());
    Qualtrics.SurveyEngine.setEmbeddedData("Sim_Deductible",          ded.toString());
    Qualtrics.SurveyEngine.setEmbeddedData("Sim_Limit",               limit.toString());
    Qualtrics.SurveyEngine.setEmbeddedData("Sim_OOP",                 oop.toString());
    Qualtrics.SurveyEngine.setEmbeddedData("Sim_BonusScenario",       scenarioBonus.toString());
    Qualtrics.SurveyEngine.setEmbeddedData("Sim_BonusScenarioDollar", scenarioBonusDollar.toString());
    Qualtrics.SurveyEngine.setEmbeddedData("Sim_ProductID",           prodId);
    Qualtrics.SurveyEngine.setEmbeddedData("Sim_ProductDescription",  productDescription);
    Qualtrics.SurveyEngine.setEmbeddedData("Sim_WaterBackup",         wb.toString());

    var msg;
    if (uninsured) {
        msg = "Scenario: " + eventName +
              ". You remained uninsured. Loss: " + lossAmount +
              ". You paid: " + oop +
              ". Your remaining scenario balance is " + scenarioBonus + ".";
    } else {
        msg = "Scenario: " + eventName +
              ". You had " + prodId +
              " (premium " + prem +
              ", deductible " + ded +
              ", limit " + limit +
              (wb === 1 ? ", water-backup included" : ", no water-backup") +
              "). Loss: " + lossAmount +
              ". You paid: " + oop +
              ". Your remaining scenario balance is " + scenarioBonus + ".";
    }
    Qualtrics.SurveyEngine.setEmbeddedData("Sim_Message", msg);

    // === Timing logic: hide Next, auto-click after 5s, show Next only if needed ===
    var that = this;

    // hide Next immediately so they can't click early
    try {
        that.hideNextButton();
    } catch (e) {
        // if hide fails, just ignore; worst case Next stays visible
    }

    window.setTimeout(function () {
        var autoClicked = false;
        try {
            that.clickNextButton();
            autoClicked = true;
        } catch (e) {
            // auto-click failed, we'll show Next below
            autoClicked = false;
        }

        if (!autoClicked) {
            try {
                that.showNextButton();
            } catch (e2) {
                // if showing fails, silently ignore
            }
        }
    }, 3500);
});
