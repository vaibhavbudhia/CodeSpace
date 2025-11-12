const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileElem");
const browseBtn = document.getElementById("browse-btn");
const preview = document.getElementById("preview");
const reportSection = document.getElementById("report-section");

browseBtn.addEventListener("click", () => fileInput.click());

["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
  dropArea.addEventListener(eventName, e => e.preventDefault());
  dropArea.addEventListener(eventName, e => e.stopPropagation());
});

dropArea.addEventListener("drop", handleDrop);
fileInput.addEventListener("change", handleFiles);

function handleDrop(e) {
  const files = e.dataTransfer.files;
  if (files.length) handleFile(files[0]);
}

function handleFiles(e) {
  const file = e.target.files[0];
  if (file) handleFile(file);
}

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    alert("Please upload an image file!");
    return;
  }

  // Show image preview
  const reader = new FileReader();
  reader.onload = e => {
    preview.innerHTML = `<img src="${e.target.result}" alt="Biopsy Image">`;
  };
  reader.readAsDataURL(file);

  // Simulate sending to backend
  simulateReportGeneration(file);
}

function simulateReportGeneration(file) {
  // Simulated backend delay
  setTimeout(() => {
    // Example simulated output (replace with backend API response)
    const result = Math.random() > 0.3; // 70% healthy, 30% cancer detected
    const report = {
      patientId: "BC-" + Math.floor(Math.random() * 100000),
      fileName: file.name,
      diagnosis: result ? "Benign (Healthy Tissue)" : "Malignant Cells Detected ⚠️",
      confidence: result ? "97.8%" : "91.4%",
      date: new Date().toLocaleString(),
      note: result
        ? "No cancerous patterns detected in the biopsy image."
        : "Presence of malignant cell clusters detected. Recommend further clinical evaluation."
    };
    showReport(report);
  }, 2000);
}

function showReport(report) {
  document.getElementById("r-patient").textContent = report.patientId;
  document.getElementById("r-file").textContent = report.fileName;
  const diag = document.getElementById("r-diagnosis");
  diag.textContent = report.diagnosis;
  diag.classList.toggle("safe", report.diagnosis.includes("Benign"));
  document.getElementById("r-confidence").textContent = report.confidence;
  document.getElementById("r-date").textContent = report.date;
  document.getElementById("r-note").textContent = report.note;

  reportSection.classList.remove("hidden");
}
