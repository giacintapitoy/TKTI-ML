const URL = "https://teachablemachine.withgoogle.com/models/I8oWatjfE/"; 

let model, webcam, labelContainer, maxPredictions;
let currentQuestion = 0;
let detecting = false;

const questions = [
  "Apakah kamu menyukai musik rock?",
  "Apakah kamu suka bermain video game?",
  "Apakah kamu suka membaca buku?",
  "Apakah kamu menyukai makanan pedas?",
  "Apakah kamu mahasiswa informatika?",
  "Apakah kamu suka kopi daripada teh?",
  "Apakah kamu menikmati film horor?",
  "Apakah kamu tertarik dengan anime?",
  "Apakah kamu lebih suka belajar di malam hari?",
  "Apakah kamu suka berolahraga di pagi hari?"
];

async function startApp() {
  document.getElementById("response").innerText = "";
  tampilkanPertanyaan();

  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  webcam = new tmImage.Webcam(200, 200, true);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").innerHTML = "";
  document.getElementById("webcam-container").appendChild(webcam.canvas);

  labelContainer = document.getElementById("label-container");
  labelContainer.innerHTML = "";
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}

function tampilkanPertanyaan() {
  document.getElementById("question").innerText = questions[currentQuestion];
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    tampilkanPertanyaan();
    detecting = false;
  } else {
    document.getElementById("question").innerText = "Terima kasih atas jawabanmu!";
    document.getElementById("response").innerText = "";
    webcam.stop();
  }
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  if (detecting) return;

  const prediction = await model.predict(webcam.canvas);
  prediction.sort((a, b) => b.probability - a.probability);

  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction = `${prediction[i].className}: ${(prediction[i].probability * 100).toFixed(2)}%`;
    labelContainer.childNodes[i].innerHTML = classPrediction;
  }

  const topPrediction = prediction[0];

  if (topPrediction.probability > 0.95) {
    detecting = true;
    if (topPrediction.className === "👍") {
      document.getElementById("response").innerText = "Anda menjawab: Ya 👍";
    } else if (topPrediction.className === "👎") {
      document.getElementById("response").innerText = "Anda menjawab: Tidak 👎";
    }

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  }
}
