const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const menu = document.getElementById("menu");
const leaderboardPage = document.getElementById("leaderboardPage");
const leaderboardList = document.getElementById("leaderboardList");
const playBtn = document.getElementById("playBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const homeBtn = document.getElementById("homeBtn");
const usernameInput = document.getElementById("username");
const gameArea = document.getElementById("gameArea");
const timerDisplay = document.getElementById("timer");
const replayBtn = document.getElementById("replayBtn");
const resultText = document.getElementById("result");
const shareScoreDiv = document.getElementById("shareScore");
const shareText = document.getElementById("shareText");
const copyLinkBtn = document.getElementById("copyLinkBtn");

let circles = 20;
let current = 0;
let startTime;
let timerInterval;

homeBtn.onclick = goHome;
playBtn.onclick = startGame;
leaderboardBtn.onclick = showLeaderboard;
replayBtn.onclick = startGame;

// Copier le lien du jeu
copyLinkBtn.onclick = () => {
  navigator.clipboard.writeText(window.location.origin).then(() => {
    alert("Game link copied! Share it with friends!");
  });
};

function goHome(){
  clearInterval(timerInterval);
  document.querySelectorAll(".circle").forEach(c => c.remove());
  gameArea.classList.add("hidden");
  leaderboardPage.classList.add("hidden");
  menu.classList.remove("hidden");
  resultText.classList.add("hidden");
  shareScoreDiv.classList.add("hidden");
  replayBtn.style.display = "none";
  document.body.style.background = "#111";
  timerDisplay.innerText = "0.00";
}

function startGame(){
  const username = usernameInput.value.trim();
  if(username.length < 2){ alert("Enter a username"); return; }
  menu.classList.add("hidden");
  leaderboardPage.classList.add("hidden");
  gameArea.classList.remove("hidden");
  resultText.classList.add("hidden");
  shareScoreDiv.classList.add("hidden");
  replayBtn.style.display = "none";
  current = 0;
  startTime = Date.now();
  timerInterval = setInterval(updateTimer,10);
  spawnCircle();
}

function updateTimer(){
  const t = (Date.now()-startTime)/1000;
  timerDisplay.innerText = t.toFixed(2);
}

function spawnCircle(){
  const size = 30 + Math.random()*60;
  const x = Math.random()*(window.innerWidth-size);
  const y = Math.random()*(window.innerHeight-size);
  const circle = document.createElement("div");
  circle.className="circle";
  circle.style.width=size+"px";
  circle.style.height=size+"px";
  circle.style.left=x+"px";
  circle.style.top=y+"px";
  circle.onclick=()=>{
    circle.remove();
    document.body.style.background="black";
    current++;
    if(current<circles){ spawnCircle(); } else { finishGame(); }
  };
  gameArea.appendChild(circle);
}

function finishGame(){
  clearInterval(timerInterval);
  const time = ((Date.now()-startTime)/1000).toFixed(2);
  saveScore(time);
  resultText.innerText = "Your time: "+time+"s";
  resultText.classList.remove("hidden");
  replayBtn.style.display="flex";
  // phrase de partage
  const username = usernameInput.value.trim();
  shareText.innerText = `I scored ${time}s on Red Reflex Game! Come try to beat me!`;
  shareScoreDiv.classList.remove("hidden");
}

function saveScore(time){
  const username = usernameInput.value;
  db.collection("scores").add({
    name:username,
    time:parseFloat(time),
    date:Date.now()
  });
}

async function showLeaderboard(){
  menu.classList.add("hidden");
  leaderboardPage.classList.remove("hidden");
  leaderboardList.innerHTML="Loading...";
  const snapshot = await db.collection("scores")
    .orderBy("time")
    .limit(300)
    .get();
  leaderboardList.innerHTML="";
  snapshot.forEach(doc=>{
    const data = doc.data();
    const li = document.createElement("li");
    li.innerText = data.name+" — "+data.time+"s";
    leaderboardList.appendChild(li);
  });
}