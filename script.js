import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

function getDb() {
  if (!window.db) {
    throw new Error("Firebase DB is not initialized yet. Please reload the page.");
  }
  return window.db;
}

let role = "student";

function setRole(r, btn) {
  role = r;
  document.querySelectorAll(".role-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  document.getElementById("rollGroup").style.display = (r === "student") ? "block" : "none";
  const teacherGroup = document.getElementById("titleGroup");
  if (teacherGroup) {
    teacherGroup.style.display = (r === "teacher") ? "block" : "none";
  }
}

/* FOOD ITEMS */

const foods = [
{ name: "Samosa", img: "img/samosa.avif" },
{ name: "Vada Pav", img: "img/vada-pav-3.jpg" },
{ name: "Poha", img: "img/Poha.jpg" },
{ name: "Tea", img: "img/tea.webp" },
{ name: "Coffee", img: "img/hotcofee.jpg" },
{ name: "Idli", img: "img/Idly.jpg" },
{ name: "Dosa", img: "img/three_plain_dosaa.jpg" },
{ name: "Pav Bhaji", img: "img/Pav Bhaji.webp" },
];

console.log("script.js loaded");
const foodGrid = document.getElementById("foodGrid");

if (!foodGrid) {
  console.warn("Food grid is missing; food section will not render.");
} else {
  foodGrid.innerHTML = "";
  foods.forEach((food, i) => {
    foodGrid.innerHTML += `
    <div class="food-card"><img class="food-img" src="${food.img}" onerror="this.src='https://via.placeholder.com/80?text=No+Image'" alt="${food.name}"><div>${food.name}</div><div class="star-rating"><input type="radio" name="food${i}" value="5" id="f${i}5"><label for="f${i}5"><i class="fa fa-star"></i></label>
    <input type="radio" name="food${i}" value="4" id="f${i}4"><label for="f${i}4"><i class="fa fa-star"></i></label>
    <input type="radio" name="food${i}" value="3" id="f${i}3"><label for="f${i}3"><i class="fa fa-star"></i></label>
    <input type="radio" name="food${i}" value="2" id="f${i}2"><label for="f${i}2"><i class="fa fa-star"></i></label>
    <input type="radio" name="food${i}" value="1" id="f${i}1"><label for="f${i}1"><i class="fa fa-star"></i></label>
    </div></div>`;
  });
}

const feedbackForm = document.getElementById("feedbackForm");
if (feedbackForm) {
  feedbackForm.addEventListener("submit", async function (e) {
    e.preventDefault();

const name = document.getElementById("name").value;
const roll = document.getElementById("roll").value;
const title = document.getElementById("title") ? document.getElementById("title").value : "";
const comment = document.getElementById("comment").value;

const clean = document.querySelector('input[name="clean"]:checked')?.value || 0;
const interior = document.querySelector('input[name="interior"]:checked')?.value || 0;
const speed = document.querySelector('input[name="speed"]:checked')?.value || 0;
const price = document.querySelector('input[name="price"]:checked')?.value || 0;

const newRatings = [clean, interior, speed, price];

let foodRatings = [];

for (let i = 0; i < foods.length; i++) {

let rating = document.querySelector(`input[name="food${i}"]:checked`);
foodRatings.push(rating ? rating.value : 0);

}

if (role === "student" && !roll) {
  alert("Roll number required");
  return;
}
if (role === "teacher" && !title) {
  alert("Please select your title (Mr/Ms/Miss/Dr)");
  return;
}

try {

const db = getDb();
await addDoc(collection(db, "feedback"), {
  name,
  role,
  title: title || "",
  roll,
  comment,
  ratings: newRatings,
  foodRatings: foodRatings,
  time: new Date()
});

document.getElementById("successMsg").style.display = "block";
document.getElementById("successMsg").innerHTML = "Feedback Submitted Successfully";

this.reset();

} catch (error) {

console.error("Error saving feedback:", error);

}

});
}

async function openAdmin() {
  let db;
  try {
    db = getDb();
  } catch (err) {
    alert(err.message);
    return;
  }

  let pass = prompt("Enter Admin Password");

  if (pass !== "Admin@123") {
    alert("Wrong password");
    return;
  }

  let snapshot;
  try {
    snapshot = await getDocs(collection(db, "feedback"));
  } catch (error) {
    alert("Could not load admin data. Make sure Firebase is initialized.");
    console.error(error);
    return;
  }

  let data = [];

snapshot.forEach(doc => {
data.push(doc.data());
});

let totalFeedback = data.length;

if (totalFeedback === 0) {

document.getElementById("adminArea").innerHTML = "<h3>No feedback submitted yet</h3>";
return;

}

let cleanTotal = 0;
let interiorTotal = 0;
let foodTotal = 0;
let foodCount = 0;

data.forEach(f => {

if (f.ratings) {

  cleanTotal += Number(f.ratings[0]);
  interiorTotal += Number(f.ratings[1]);

}

if (f.foodRatings) {

  f.foodRatings.forEach(r => {
    foodTotal += Number(r);
    foodCount++;
  });

}

});

/* FIX FOR NaN */

let avgClean = totalFeedback ? (cleanTotal / totalFeedback).toFixed(1) : "0.0";
let avgInterior = totalFeedback ? (interiorTotal / totalFeedback).toFixed(1) : "0.0";
let avgFood = foodCount ? (foodTotal / foodCount).toFixed(1) : "0.0";

let html = `

<h2>Admin Dashboard</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:20px"><div style="background:white;color:black;padding:15px;border-radius:10px">
<h3>Total Feedback</h3>
<p style="font-size:24px">${totalFeedback}</p>
</div><div style="background:white;color:black;padding:15px;border-radius:10px">
<h3>Avg Food Quality</h3>
<p style="font-size:24px">${avgFood} ⭐</p>
</div><div style="background:white;color:black;padding:15px;border-radius:10px">
<h3>Avg Interior</h3>
<p style="font-size:24px">${avgInterior} ⭐</p>
</div><div style="background:white;color:black;padding:15px;border-radius:10px">
<h3>Avg Cleanliness</h3>
<p style="font-size:24px">${avgClean} ⭐</p>
</div></div><table>
<tr><th>Name</th><th>Role</th><th>Roll</th><th>Comment</th></tr>
`;data.forEach(f => {
html += `<tr>

<td>${f.name}</td>
<td>${f.role}</td>
<td>${f.roll || "-"}</td>
<td>${f.comment || "-"}</td>
</tr>`;
  });html += "</table>";

document.getElementById("adminArea").innerHTML = html;

}

/* MAKE FUNCTIONS AVAILABLE TO HTML */

window.setRole = setRole;
window.openAdmin = openAdmin;

const adminBtn = document.getElementById("adminBtn");
if (adminBtn) {
  adminBtn.addEventListener("click", openAdmin);
}