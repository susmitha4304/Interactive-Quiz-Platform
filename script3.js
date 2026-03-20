const startBtn = document.getElementById("start-btn")
const categoryScreen = document.getElementById("category-screen")
const welcomeScreen = document.getElementById("welcome-screen")

const categoryButtons = document.querySelectorAll(".category-btn")
const quizContainer = document.getElementById("quiz-container")

const questionEl = document.getElementById("question")
const answersDiv = document.getElementById("answers")
const nextBtn = document.getElementById("next-btn")

const progressBar = document.getElementById("progress-bar")
const timeEl = document.getElementById("time")

const resultBox = document.getElementById("result-box")
const scoreText = document.getElementById("score")

const saveBtn = document.getElementById("save-score")
const leaderboard = document.getElementById("leaderboard")

const loader = document.getElementById("loader")
const darkToggle = document.getElementById("dark-toggle")

let questions = []
let currentQuestion = 0
let score = 0
let timer
let timeLeft = 15

// DARK MODE
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark")
}

darkToggle.onclick = () => {
  document.body.classList.toggle("dark")
  localStorage.setItem("theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  )
}

// START
startBtn.onclick = () => {
  welcomeScreen.classList.add("hidden")
  categoryScreen.classList.remove("hidden")
}

// CATEGORY
categoryButtons.forEach(btn => {
  btn.onclick = () => startQuiz(btn.dataset.cat)
})

async function startQuiz(category) {
  try {
    categoryScreen.classList.add("hidden")
    loader.classList.remove("hidden")

    let difficulty = document.getElementById("difficulty").value

    let res = await fetch(
      `https://opentdb.com/api.php?amount=5&category=${category}&difficulty=${difficulty}&type=multiple`
    )

    let data = await res.json()
    questions = data.results

    loader.classList.add("hidden")
    quizContainer.classList.remove("hidden")

    showQuestion()

  } catch {
    alert("Failed to load quiz")
  }
}

function showQuestion() {
  resetState()
  startTimer()

  let q = questions[currentQuestion]
  questionEl.innerHTML = decodeHTML(q.question)

  let answers = [...q.incorrect_answers]
  answers.splice(Math.floor(Math.random() * 4), 0, q.correct_answer)

  answers.forEach(ans => {
    let btn = document.createElement("button")
    btn.innerHTML = decodeHTML(ans)

    btn.onclick = () => selectAnswer(btn, ans === q.correct_answer)

    answersDiv.appendChild(btn)
  })

  updateProgress()
}

function selectAnswer(button, correct) {
  clearInterval(timer)

  if (correct) {
    button.classList.add("correct")
    score++
  } else {
    button.classList.add("wrong")

    Array.from(answersDiv.children).forEach(btn => {
      if (btn.innerText === decodeHTML(questions[currentQuestion].correct_answer)) {
        btn.classList.add("correct")
      }
    })
  }

  Array.from(answersDiv.children).forEach(btn => btn.disabled = true)
  nextBtn.style.display = "block"
}

nextBtn.onclick = () => {
  currentQuestion++

  if (currentQuestion < questions.length) {
    showQuestion()
  } else {
    showResult()
  }
}

function showResult() {
  quizContainer.classList.add("hidden")
  resultBox.classList.remove("hidden")

  scoreText.innerText = `Score: ${score}/${questions.length}`
  loadLeaderboard()
}

function resetState() {
  answersDiv.innerHTML = ""
  nextBtn.style.display = "none"
}

function updateProgress() {
  let percent = ((currentQuestion + 1) / questions.length) * 100
  progressBar.style.width = percent + "%"
}

// TIMER FIXED
function startTimer() {
  timeLeft = 15
  timeEl.innerText = timeLeft
  timeEl.style.color = "#ef4444"

  timer = setInterval(() => {
    timeLeft--
    timeEl.innerText = timeLeft

    if (timeLeft <= 5) timeEl.style.color = "orange"
    if (timeLeft <= 2) timeEl.style.color = "red"

    if (timeLeft === 0) {
      clearInterval(timer)
      nextBtn.style.display = "block"
    }
  }, 1000)
}

function decodeHTML(html) {
  let txt = document.createElement("textarea")
  txt.innerHTML = html
  return txt.value
}

// LEADERBOARD
saveBtn.onclick = () => {
  let name = document.getElementById("username").value.trim()
  if (!name) name = "Guest"

  let scores = JSON.parse(localStorage.getItem("quizScores")) || []

  scores.push({
    name,
    score,
    date: new Date().toLocaleDateString()
  })

  localStorage.setItem("quizScores", JSON.stringify(scores))
  loadLeaderboard()
}

function loadLeaderboard() {
  leaderboard.innerHTML = ""

  let scores = JSON.parse(localStorage.getItem("quizScores")) || []
  scores.sort((a, b) => b.score - a.score)

  scores.slice(0, 5).forEach(s => {
    let li = document.createElement("li")
    li.innerText = `${s.name} - ${s.score} (${s.date})`
    leaderboard.appendChild(li)
  })
}