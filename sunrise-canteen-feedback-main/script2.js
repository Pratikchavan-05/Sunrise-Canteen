import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDKKKiJpenTXH9vXMDkU9-Ctop9iSif9DU",
  authDomain: "canteen-feedback-new-9c0e6.firebaseapp.com",
  projectId: "canteen-feedback-new-9c0e6",
  storageBucket: "canteen-feedback-new-9c0e6.firebasestorage.app",
  messagingSenderId: "835202234208",
  appId: "1:835202234208:web:5136609a75236996705005"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
window.db = db;
console.log("Firebase initialized", { projectId: firebaseConfig.projectId, dbReady: Boolean(window.db) });

function getDb() {
  if (!window.db) return null;
  return window.db;
}

let role = "student";

function setRole(r, btn) {
  role = r;
  document.querySelectorAll(".role-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const rollGroup = document.getElementById("rollGroup");
  if (rollGroup) rollGroup.style.display = (r === "student") ? "block" : "none";
}

const foods = [
  { name: "Samosa", img: "img/samosa.avif" },
  { name: "Vada Pav", img: "img/vada-pav-3.jpg" },
  { name: "Poha", img: "img/Poha.jpg" },
  { name: "Tea", img: "img/tea.webp" },
  { name: "Coffee", img: "img/hotcofee.jpg" },
  { name: "Idli", img: "img/Idly.jpg" },
  { name: "Dosa", img: "img/three_plain_dosaa.jpg" },
  { name: "Pav Bhaji", img: "img/Pav Bhaji.webp" },
  { name: "Burger", img: "img/burger.png" },
  { name: "Pizza", img: "img/Pizza.avif" }
];

function renderFoodGrid() {
  const foodGrid = document.getElementById("foodGrid");
  if (!foodGrid) return;
  foodGrid.innerHTML = "";
  foods.forEach((food, i) => {
    foodGrid.innerHTML += `
      <div class="food-card">
        <img class="food-img" src="${food.img}" onerror="this.src='https://via.placeholder.com/80?text=No+Image'" alt="${food.name}">
        <div style="margin:8px 0; font-weight:600;">${food.name}</div>
        <div class="star-rating">
          <input type="radio" name="food${i}" value="5" id="f${i}5"><label for="f${i}5"><i class="fa fa-star"></i></label>
          <input type="radio" name="food${i}" value="4" id="f${i}4"><label for="f${i}4"><i class="fa fa-star"></i></label>
          <input type="radio" name="food${i}" value="3" id="f${i}3"><label for="f${i}3"><i class="fa fa-star"></i></label>
          <input type="radio" name="food${i}" value="2" id="f${i}2"><label for="f${i}2"><i class="fa fa-star"></i></label>
          <input type="radio" name="food${i}" value="1" id="f${i}1"><label for="f${i}1"><i class="fa fa-star"></i></label>
        </div>
      </div>`;
  });
}

function loadFeedback() {
  return JSON.parse(localStorage.getItem("canteenFeedbackData") || "[]");
}

function saveFeedback(item) {
  const all = loadFeedback();
  all.push(item);
  localStorage.setItem("canteenFeedbackData", JSON.stringify(all));
}

function localSave(item) {
  saveFeedback(item);
}

function getRating(name) {
  return Number(document.querySelector(`input[name="${name}"]:checked`)?.value || 0);
}

function getFoodRatings() {
  const result = [];
  for (let i = 0; i < foods.length; i += 1) {
    result.push(Number(document.querySelector(`input[name="food${i}"]:checked`)?.value || 0));
  }
  return result;
}

function showSuccess(msg) {
  const s = document.getElementById("successMsg");
  if (!s) return;
  s.textContent = msg;
  s.style.display = "block";
  setTimeout(() => { s.style.display = "none"; }, 1800);
}

async function openAdmin() {
  const pass = prompt("Enter Admin Password");
  if (pass !== "Admin@123") {
    alert("Wrong password");
    return;
  }

  const db = getDb();
  let data = [];
  if (db) {
    try {
      console.log("Loading admin data from Firebase", db);
      const snapshot = await getDocs(collection(db, "feedback"));
      data = snapshot.docs.map((d) => d.data());
    } catch (err) {
      console.error("Admin load failed", err);
      alert("Could not load admin data from Firebase. Showing local data.");
      data = loadFeedback();
    }
  } else {
    console.warn("Firebase DB unavailable for admin read, using local data");
    data = loadFeedback();
  }
  if (!data.length) {
    document.getElementById("adminArea").innerHTML = "<h3>No feedback submitted yet</h3>";
    return;
  }

  let cleanTotal = 0;
  let interiorTotal = 0;
  let foodTotal = 0;
  let foodCount = 0;

  data.forEach((item) => {
    const cleanValue = Number(item.clean || (item.ratings ? item.ratings[0] : 0) || 0);
    const interiorValue = Number(item.interior || (item.ratings ? item.ratings[1] : 0) || 0);
    cleanTotal += cleanValue;
    interiorTotal += interiorValue;
    const foodList = item.foodRatings || (item.ratings ? item.ratings.slice(2) : []);
    foodList.forEach((r) => { foodTotal += Number(r || 0); foodCount += 1; });
  });

  const total = data.length;
  const avgClean = total ? (cleanTotal / total).toFixed(1) : "0.0";
  const avgInterior = total ? (interiorTotal / total).toFixed(1) : "0.0";
  const avgFood = foodCount ? (foodTotal / foodCount).toFixed(1) : "0.0";

  let html = `<h2>Admin Dashboard</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px;"><div style="background:white;color:black;padding:15px;border-radius:10px;"><h3>Total Feedback</h3><p style="font-size:24px">${total}</p></div><div style="background:white;color:black;padding:15px;border-radius:10px;"><h3>Avg Food Quality</h3><p style="font-size:24px">${avgFood} ⭐</p></div><div style="background:white;color:black;padding:15px;border-radius:10px;"><h3>Avg Interior</h3><p style="font-size:24px">${avgInterior} ⭐</p></div><div style="background:white;color:black;padding:15px;border-radius:10px;"><h3>Avg Cleanliness</h3><p style="font-size:24px">${avgClean} ⭐</p></div></div><table><tr><th>Name</th><th>Role</th><th>Roll</th><th>Comment</th></tr>`;
  data.forEach((item) => {
    html += `<tr><td>${item.name || "-"}</td><td>${item.role || "-"}</td><td>${item.roll || "-"}</td><td>${item.comment || "-"}</td></tr>`;
  });
  html += "</table>";
  document.getElementById("adminArea").innerHTML = html;
}

function applyTheme() {
  const isDark = localStorage.getItem("theme") !== "light";
  const themeBtn = document.getElementById("themeToggle");
  if (isDark) {
    document.body.classList.add("dark-mode");
    if (themeBtn) themeBtn.textContent = "Light Mode";
  } else {
    document.body.classList.remove("dark-mode");
    if (themeBtn) themeBtn.textContent = "Dark Mode";
  }
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

function toggleTheme() {
  const current = localStorage.getItem("theme") || "dark";
  localStorage.setItem("theme", current === "dark" ? "light" : "dark");
  applyTheme();
}

function init() {
  renderFoodGrid();
  const form = document.getElementById("feedbackForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("name")?.value || "";
      const roll = document.getElementById("roll")?.value || "";
      const comment = document.getElementById("comment")?.value || "";
      if (role === "student" && !roll) {
        alert("Roll number required");
        return;
      }
      const item = {
        name,
        role,
        roll,
        comment,
        clean: getRating("clean"),
        interior: getRating("interior"),
        speed: getRating("speed"),
        price: getRating("price"),
        foodRatings: getFoodRatings(),
        time: new Date().toISOString()
      };
      console.log("Submitting feedback item", item);
      const db = getDb();
      if (db) {
        try {
          console.log("Saving to Firebase collection feedback", db);
          await addDoc(collection(db, "feedback"), item);
          showSuccess("Feedback submitted to Firebase successfully");
        } catch (err) {
          console.error("Firebase save failed", err);
          localSave(item);
          showSuccess("Saved locally (Firebase failed)");
        }
      } else {
        console.warn("Firebase DB unavailable, saving locally");
        localSave(item);
        showSuccess("Saved locally (Firebase unavailable)");
      }
      form.reset();
    });
  }
  const adminBtn = document.getElementById("adminBtn");
  if (adminBtn) {
    adminBtn.addEventListener("click", openAdmin);
  }
  const themeToggleBtn = document.getElementById("themeToggle");
  if (themeToggleBtn) themeToggleBtn.addEventListener("click", toggleTheme);
  applyTheme();
  window.setRole = setRole;
  renderFoodGrid();
}

init();
