// State Aplikasi
let state = {
  profiles: {
    user1: { name: "Abiyu", color: "#a855f7", avatar: "boy" },
    user2: { name: "Manda", color: "#ec4899", avatar: "girl" }
  },
  goals: [],
  transactions: [],
  savingChallenge: {
    targetDays: 30,
    dailyAmount: 20000,
    progress: []
  }
};

let savingsCode = "";
let currentFilter = "all";
let isFetching = false;
let syncTimer = null;

// Peta avatar emoji default
const avatarEmojis = {
  boy: "🧑‍💻",
  girl: "👩‍💻"
};

// Data Default saat inisialisasi celengan baru
const defaultData = {
  profiles: {
    user1: { name: "Abiyu", color: "#a855f7", avatar: "boy" },
    user2: { name: "Manda", color: "#ec4899", avatar: "girl" }
  },
  goals: [
    {
      id: "goal-1",
      name: "Liburan Romantis",
      target: 5000000,
      current: 0,
      deadline: "2026-12-31",
      icon: "✈️"
    },
    {
      id: "goal-2",
      name: "Makan Malam Anniversary",
      target: 1000000,
      current: 0,
      deadline: "2026-10-15",
      icon: "🕯️"
    }
  ],
  transactions: [],
  savingChallenge: {
    targetDays: 30,
    dailyAmount: 20000,
    progress: []
  }
};

// DOM Elements - Startup
const startupScreen = document.getElementById("startup-screen");
const mainApp = document.getElementById("main-app");
const btnCreateNewJar = document.getElementById("btn-create-new-jar");
const btnShowJoinInput = document.getElementById("btn-show-join-input");
const joinFormWrapper = document.getElementById("join-form-wrapper");
const inputJoinCode = document.getElementById("input-join-code");
const btnSubmitJoin = document.getElementById("btn-submit-join");
const btnBackStartup = document.getElementById("btn-back-startup");
const startupActions = document.querySelector(".startup-actions");

// DOM Elements - Main App
const totalBalanceEl = document.getElementById("total-balance");
const totalDepositsEl = document.getElementById("total-deposits");
const totalWithdrawalsEl = document.getElementById("total-withdrawals");

const user1NameEl = document.getElementById("user1-name");
const user1ContribEl = document.getElementById("user1-contrib");
const user1PctEl = document.getElementById("user1-pct");
const user1AvatarIcon = document.getElementById("user1-avatar-icon");

const user2NameEl = document.getElementById("user2-name");
const user2ContribEl = document.getElementById("user2-contrib");
const user2PctEl = document.getElementById("user2-pct");
const user2AvatarIcon = document.getElementById("user2-avatar-icon");

const splitProgressUser1 = document.getElementById("split-progress-user1");
const splitProgressUser2 = document.getElementById("split-progress-user2");

const labelSelectUser1 = document.getElementById("label-select-user1");
const labelSelectUser2 = document.getElementById("label-select-user2");
const filterUser1Btn = document.getElementById("filter-user1");
const filterUser2Btn = document.getElementById("filter-user2");
const headerUser1 = document.getElementById("header-user1");
const headerUser2 = document.getElementById("header-user2");

const transactionForm = document.getElementById("transaction-form");
const amountInput = document.getElementById("amount");
const noteInput = document.getElementById("note");
const btnSelectUser1 = document.getElementById("btn-select-user1");
const btnSelectUser2 = document.getElementById("btn-select-user2");

const goalsListEl = document.getElementById("goals-list");
const challengeGridEl = document.getElementById("challenge-grid");
const challengeCountEl = document.getElementById("challenge-count");
const challengeProgressFill = document.getElementById("challenge-progress-fill");
const btnChallengeDeposit = document.getElementById("btn-challenge-deposit");

const historyListEl = document.getElementById("history-list");
const syncStatusEl = document.getElementById("sync-status");
const btnShareCode = document.getElementById("btn-share-code");
const btnLogout = document.getElementById("btn-logout");

// Modals DOM
const goalModal = document.getElementById("goal-modal");
const profileModal = document.getElementById("profile-modal");
const goalForm = document.getElementById("goal-form");
const profileForm = document.getElementById("profile-form");

// Format Angka ke Rupiah
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

// Format Tanggal
function formatDate(dateStr) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateStr).toLocaleDateString('id-ID', options);
}

// Inisialisasi Lucide Icons
function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Ubah status sinkronisasi
function setSyncStatus(status, message) {
  syncStatusEl.className = `sync-badge ${status}`;
  
  let iconHTML = '';
  if (status === 'syncing') {
    iconHTML = '<i data-lucide="refresh-cw" class="icon-spin"></i>';
  } else if (status === 'success') {
    iconHTML = '<i data-lucide="cloud-check"></i>';
  } else {
    iconHTML = '<i data-lucide="cloud-off"></i>';
  }
  
  syncStatusEl.innerHTML = `${iconHTML} <span>${message}</span>`;
  initIcons();
}

// ==========================================
// KONEKSI DATABASE AWAL & SYNC (KVDB.io)
// ==========================================

// Membuat bucket database baru
async function createNewBucket() {
  setSyncStatus("syncing", "Membuat celengan...");
  try {
    const res = await fetch("https://kvdb.io/new", { method: "POST" });
    if (!res.ok) throw new Error("Gagal membuat database baru di cloud.");
    const bucketId = await res.text();
    return bucketId.trim();
  } catch (err) {
    alert("Koneksi internet bermasalah. Gagal membuat celengan online.");
    throw err;
  }
}

// Mengambil data dari KVDB
async function fetchData() {
  if (!savingsCode || isFetching) return;
  isFetching = true;
  setSyncStatus("syncing", "Sinkronisasi...");
  
  try {
    const response = await fetch(`https://kvdb.io/${savingsCode}/savings`);
    if (response.status === 404) {
      // Jika kosong (bucket baru), inisialisasi dengan data default
      state = JSON.parse(JSON.stringify(defaultData));
      await saveToCloud();
    } else {
      if (!response.ok) throw new Error("Gagal mengambil data dari cloud.");
      state = await response.json();
    }
    
    renderUI();
    setSyncStatus("success", "Tersinkronisasi");
  } catch (error) {
    console.error("Fetch error:", error);
    setSyncStatus("error", "Koneksi terputus");
  } finally {
    isFetching = false;
  }
}

// Menyimpan data ke KVDB
async function saveToCloud() {
  if (!savingsCode) return;
  setSyncStatus("syncing", "Menyimpan data...");
  try {
    const response = await fetch(`https://kvdb.io/${savingsCode}/savings`, {
      method: 'POST',
      body: JSON.stringify(state)
    });
    
    if (!response.ok) throw new Error("Gagal mengunggah data.");
    
    renderUI();
    setSyncStatus("success", "Tersinkronisasi");
  } catch (error) {
    console.error("Save error:", error);
    setSyncStatus("error", "Gagal menyimpan!");
  }
}

// Mulai Pooling Sync Otomatis 5 Detik
function startAutoSync() {
  if (syncTimer) clearInterval(syncTimer);
  syncTimer = setInterval(fetchData, 5000);
}

// Cek Kode Hubung pada URL/LocalStorage
async function checkAuth() {
  const urlParams = new URLSearchParams(window.location.search);
  const codeInUrl = urlParams.get('code');
  const codeInLocal = localStorage.getItem('savingsCode');

  if (codeInUrl) {
    savingsCode = codeInUrl;
    localStorage.setItem('savingsCode', savingsCode);
    showMainAppView();
  } else if (codeInLocal) {
    savingsCode = codeInLocal;
    // Tambahkan parameter ke URL tanpa reload agar bisa disalin linknya langsung
    window.history.pushState({}, '', `?code=${savingsCode}`);
    showMainAppView();
  } else {
    showStartupView();
  }
}

// Tampilkan Dashboard Utama
function showMainAppView() {
  startupScreen.style.display = "none";
  mainApp.style.display = "flex";
  fetchData();
  startAutoSync();
}

// Tampilkan Halaman Awal
function showStartupView() {
  mainApp.style.display = "none";
  startupScreen.style.display = "flex";
  if (syncTimer) clearInterval(syncTimer);
}

// ==========================================
// STARTUP SCREEN HANDLERS
// ==========================================

// Tombol: Buat Celengan Baru
btnCreateNewJar.addEventListener("click", async () => {
  btnCreateNewJar.disabled = true;
  try {
    const newCode = await createNewBucket();
    savingsCode = newCode;
    localStorage.setItem('savingsCode', savingsCode);
    window.history.pushState({}, '', `?code=${savingsCode}`);
    
    // Setup data default
    state = JSON.parse(JSON.stringify(defaultData));
    await saveToCloud();
    
    showMainAppView();
  } catch (err) {
    console.error(err);
  } finally {
    btnCreateNewJar.disabled = false;
  }
});

// Tombol: Tampilkan Input Gabung
btnShowJoinInput.addEventListener("click", () => {
  startupActions.style.display = "none";
  joinFormWrapper.style.display = "block";
  inputJoinCode.focus();
});

// Tombol: Kembali dari Input Gabung
btnBackStartup.addEventListener("click", () => {
  joinFormWrapper.style.display = "none";
  startupActions.style.display = "flex";
});

// Tombol: Proses Gabung Celengan
btnSubmitJoin.addEventListener("click", async () => {
  const code = inputJoinCode.value.trim();
  if (!code) {
    alert("Masukkan kode celengan pasangan Anda!");
    return;
  }

  btnSubmitJoin.disabled = true;
  setSyncStatus("syncing", "Menghubungkan...");

  try {
    // Verifikasi apakah kode ada datanya di KVDB
    const res = await fetch(`https://kvdb.io/${code}/savings`);
    if (res.status === 404) {
      alert("Kode Celengan tidak valid atau belum pernah dibuat!");
      setSyncStatus("error", "Kode salah");
    } else if (!res.ok) {
      throw new Error("Gagal verifikasi data.");
    } else {
      // Kode valid!
      savingsCode = code;
      localStorage.setItem('savingsCode', savingsCode);
      window.history.pushState({}, '', `?code=${savingsCode}`);
      showMainAppView();
    }
  } catch (err) {
    alert("Terjadi kesalahan jaringan saat memverifikasi kode.");
    setSyncStatus("error", "Koneksi gagal");
  } finally {
    btnSubmitJoin.disabled = false;
  }
});

// ==========================================
// DYNAMIC UI RENDERING
// ==========================================

function renderUI() {
  // 1. Update CSS Variables untuk tema profil
  document.documentElement.style.setProperty('--user1-color', state.profiles.user1.color);
  document.documentElement.style.setProperty('--user2-color', state.profiles.user2.color);

  // 2. Update Info Profil
  headerUser1.innerText = state.profiles.user1.name;
  headerUser2.innerText = state.profiles.user2.name;
  labelSelectUser1.innerText = state.profiles.user1.name;
  labelSelectUser2.innerText = state.profiles.user2.name;
  filterUser1Btn.innerText = state.profiles.user1.name;
  filterUser2Btn.innerText = state.profiles.user2.name;

  user1NameEl.innerText = state.profiles.user1.name;
  user2NameEl.innerText = state.profiles.user2.name;
  user1AvatarIcon.innerText = state.profiles.user1.avatar.length <= 2 ? state.profiles.user1.avatar : (avatarEmojis[state.profiles.user1.avatar] || "🧑‍💻");
  user2AvatarIcon.innerText = state.profiles.user2.avatar.length <= 2 ? state.profiles.user2.avatar : (avatarEmojis[state.profiles.user2.avatar] || "👩‍💻");

  // 3. Kalkulasi Kontribusi
  let user1Total = 0;
  let user2Total = 0;
  let totalDeposits = 0;
  let totalWithdrawals = 0;

  state.transactions.forEach(tx => {
    const amount = Number(tx.amount);
    if (tx.type === "setor") {
      totalDeposits += amount;
      if (tx.sender === "user1") user1Total += amount;
      else if (tx.sender === "user2") user2Total += amount;
    } else if (tx.type === "tarik") {
      totalWithdrawals += amount;
      if (tx.sender === "user1") user1Total -= amount;
      else if (tx.sender === "user2") user2Total -= amount;
    }
  });

  const netBalance = totalDeposits - totalWithdrawals;

  totalBalanceEl.innerText = formatRupiah(netBalance >= 0 ? netBalance : 0);
  totalDepositsEl.innerText = formatRupiah(totalDeposits);
  totalWithdrawalsEl.innerText = formatRupiah(totalWithdrawals);

  user1ContribEl.innerText = formatRupiah(user1Total >= 0 ? user1Total : 0);
  user2ContribEl.innerText = formatRupiah(user2Total >= 0 ? user2Total : 0);

  const totalContributions = (user1Total > 0 ? user1Total : 0) + (user2Total > 0 ? user2Total : 0);
  let user1Pct = 50;
  let user2Pct = 50;

  if (totalContributions > 0) {
    user1Pct = Math.round(((user1Total > 0 ? user1Total : 0) / totalContributions) * 100);
    user2Pct = 100 - user1Pct;
  }

  user1PctEl.innerText = `${user1Pct}%`;
  user2PctEl.innerText = `${user2Pct}%`;
  splitProgressUser1.style.width = `${user1Pct}%`;
  splitProgressUser2.style.width = `${user2Pct}%`;

  // Render Target, Tantangan, dan Transaksi
  renderGoals(netBalance);
  renderChallenge();
  renderTransactions();

  initIcons();
}

// Render Goals
function renderGoals(netBalance) {
  goalsListEl.innerHTML = "";
  
  if (!state.goals || state.goals.length === 0) {
    goalsListEl.innerHTML = `
      <div class="empty-state" style="padding: 24px; text-align: center;">
        <i data-lucide="target" style="width: 32px; height: 32px; color: var(--text-muted); opacity: 0.5; margin: 0 auto 12px; display: block;"></i>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Belum ada target impian. Buat target menabung pertamamu!</p>
      </div>
    `;
    return;
  }

  let remainingAlloc = netBalance;

  state.goals.forEach(goal => {
    const target = Number(goal.target);
    const allocated = Math.min(remainingAlloc, target);
    remainingAlloc = Math.max(0, remainingAlloc - target);
    
    const percent = Math.min(100, Math.round((allocated / target) * 100));
    const isCompleted = percent >= 100;

    const goalItem = document.createElement("div");
    goalItem.className = `goal-item ${isCompleted ? 'completed' : ''}`;
    
    const deadlineDate = new Date(goal.deadline);
    const deadlineStr = deadlineDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });

    goalItem.innerHTML = `
      <div class="goal-item-top">
        <div class="goal-title-wrapper">
          <div class="goal-icon-circle">${goal.icon || '🎯'}</div>
          <div class="goal-title-info">
            <h4>${goal.name}</h4>
            <span class="goal-deadline-label">
              <i data-lucide="calendar" style="width: 12px; height: 12px;"></i> Batas: ${deadlineStr}
            </span>
          </div>
        </div>
        <div class="goal-item-actions">
          <button class="btn-goal-action edit" onclick="openEditGoal('${goal.id}')" title="Edit Target">
            <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i>
          </button>
          <button class="btn-goal-action delete" onclick="deleteGoal('${goal.id}')" title="Hapus Target">
            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
          </button>
        </div>
      </div>
      <div class="goal-money-info">
        <span class="target">Target: ${formatRupiah(target)}</span>
        <span class="current">${formatRupiah(allocated)} (${percent}%)</span>
      </div>
      <div class="goal-progress-bar-bg">
        <div class="goal-progress-bar-fill" style="width: ${percent}%;"></div>
      </div>
    `;
    goalsListEl.appendChild(goalItem);
  });
}

// Render Tantangan 30 Hari
function renderChallenge() {
  challengeGridEl.innerHTML = "";
  const days = state.savingChallenge.targetDays || 30;
  const progress = state.savingChallenge.progress || [];

  for (let i = 1; i <= days; i++) {
    const dayBtn = document.createElement("div");
    const isChecked = progress.includes(i);
    dayBtn.className = `challenge-day ${isChecked ? 'checked' : ''}`;
    dayBtn.innerText = i;
    dayBtn.onclick = () => toggleChallengeDay(i);
    challengeGridEl.appendChild(dayBtn);
  }

  const finishedCount = progress.length;
  challengeCountEl.innerText = `Selesai: ${finishedCount} dari ${days} hari`;
  
  const pct = Math.round((finishedCount / days) * 100);
  challengeProgressFill.style.width = `${pct}%`;

  if (finishedCount >= days) {
    btnChallengeDeposit.innerHTML = '<i data-lucide="trophy"></i> Tantangan Selesai! 🎉';
    btnChallengeDeposit.disabled = true;
  } else {
    btnChallengeDeposit.innerHTML = `<i data-lucide="sparkles"></i> Isi Tantangan Hari ${finishedCount + 1}`;
    btnChallengeDeposit.disabled = false;
  }
}

// Toggle status hari di tantangan
function toggleChallengeDay(dayNum) {
  const progress = [...state.savingChallenge.progress];
  const index = progress.indexOf(dayNum);
  const dailyAmount = state.savingChallenge.dailyAmount || 20000;
  const currentFormUser = document.querySelector('input[name="transaction-user"]:checked').value;

  if (index === -1) {
    progress.push(dayNum);
    progress.sort((a, b) => a - b);
    state.savingChallenge.progress = progress;

    const newTx = {
      id: "tx-challenge-" + Date.now() + "-" + dayNum,
      sender: currentFormUser,
      type: "setor",
      amount: dailyAmount,
      date: new Date().toISOString(),
      note: `Tantangan Hari ke-${dayNum} 🏆`
    };
    state.transactions.unshift(newTx);
    triggerHeartConfetti();
  } else {
    progress.splice(index, 1);
    state.savingChallenge.progress = progress;

    const noteSearch = `Tantangan Hari ke-${dayNum} 🏆`;
    state.transactions = state.transactions.filter(tx => tx.note !== noteSearch);
  }

  saveToCloud();
}

btnChallengeDeposit.addEventListener("click", () => {
  const days = state.savingChallenge.targetDays || 30;
  const progress = state.savingChallenge.progress || [];
  
  for (let i = 1; i <= days; i++) {
    if (!progress.includes(i)) {
      toggleChallengeDay(i);
      break;
    }
  }
});

// Render Riwayat Transaksi
function renderTransactions() {
  historyListEl.innerHTML = "";
  
  let filtered = [...state.transactions];
  
  if (currentFilter === "user1" || currentFilter === "user2") {
    filtered = filtered.filter(tx => tx.sender === currentFilter);
  } else if (currentFilter === "setor" || currentFilter === "tarik") {
    filtered = filtered.filter(tx => tx.type === currentFilter);
  }

  if (filtered.length === 0) {
    historyListEl.innerHTML = `
      <div class="empty-state" style="padding: 20px; text-align: center;">
        <p style="color: var(--text-muted); font-size: 0.9rem;">Tidak ada transaksi yang cocok.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(tx => {
    const isDeposit = tx.type === "setor";
    const user = state.profiles[tx.sender] || { name: "Anonim", color: "#888" };
    const prefixSymbol = isDeposit ? "+" : "-";
    const amountClass = isDeposit ? "setor" : "tarik";

    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <div class="history-left">
        <div class="history-icon-badge" style="background: ${user.color};">
          ${user.name.charAt(0).toUpperCase()}
        </div>
        <div class="history-info">
          <h5>${tx.note}</h5>
          <div class="meta">
            <span>Oleh: ${user.name}</span>
            <span>•</span>
            <span>${formatDate(tx.date)}</span>
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: center;">
        <span class="history-amount ${amountClass}">
          ${prefixSymbol} ${formatRupiah(tx.amount)}
        </span>
        <button class="btn-delete-tx" onclick="deleteTransaction('${tx.id}')" title="Hapus catatan">
          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
        </button>
      </div>
    `;
    historyListEl.appendChild(item);
  });
}

// Toggle selector user di form
btnSelectUser1.addEventListener("click", () => {
  btnSelectUser1.classList.add("active");
  btnSelectUser2.classList.remove("active");
  document.getElementById("radio-user1").checked = true;
});
btnSelectUser2.addEventListener("click", () => {
  btnSelectUser2.classList.add("active");
  btnSelectUser1.classList.remove("active");
  document.getElementById("radio-user2").checked = true;
});

const radioSetor = document.getElementById("radio-setor");
const radioTarik = document.getElementById("radio-tarik");
const btnSetor = document.querySelector('label[for="radio-setor"]');
const btnTarik = document.querySelector('label[for="radio-tarik"]');

radioSetor.addEventListener("change", () => {
  btnSetor.classList.add("active");
  btnTarik.classList.remove("active");
});
radioTarik.addEventListener("change", () => {
  btnTarik.classList.add("active");
  btnSetor.classList.remove("active");
});

amountInput.addEventListener("input", (e) => {
  let val = e.target.value.replace(/[^0-9]/g, "");
  if (val) {
    e.target.value = Number(val).toLocaleString("id-ID");
  } else {
    e.target.value = "";
  }
});

document.querySelectorAll(".btn-preset").forEach(btn => {
  btn.addEventListener("click", () => {
    const val = btn.getAttribute("data-val");
    amountInput.value = Number(val).toLocaleString("id-ID");
  });
});

// Submit Transaksi Baru
transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const sender = document.querySelector('input[name="transaction-user"]:checked').value;
  const type = document.querySelector('input[name="transaction-type"]:checked').value;
  const amountStr = amountInput.value.replace(/[^0-9]/g, "");
  const amount = Number(amountStr);
  const note = noteInput.value.trim();

  if (amount <= 0) {
    alert("Nominal transaksi harus lebih dari 0!");
    return;
  }

  let currentTotal = 0;
  state.transactions.forEach(tx => {
    if (tx.type === "setor") currentTotal += Number(tx.amount);
    else if (tx.type === "tarik") currentTotal -= Number(tx.amount);
  });

  if (type === "tarik" && amount > currentTotal) {
    alert(`Uang di celengan tidak cukup! Maksimum yang bisa ditarik: ${formatRupiah(currentTotal)}`);
    return;
  }

  const newTx = {
    id: "tx-" + Date.now(),
    sender,
    type,
    amount,
    date: new Date().toISOString(),
    note
  };

  state.transactions.unshift(newTx);
  
  if (type === "setor") {
    triggerHeartConfetti();
    checkGoalMilestones(currentTotal + amount);
  }

  amountInput.value = "";
  noteInput.value = "";
  
  saveToCloud();
});

// Deteksi target impian terpenuhi
function checkGoalMilestones(newTotal) {
  let accum = 0;
  if (!state.goals) return;
  
  state.goals.forEach(goal => {
    const target = Number(goal.target);
    accum += target;
    
    if (newTotal >= accum && (newTotal - Number(state.transactions[0].amount)) < accum) {
      setTimeout(() => {
        triggerMegaConfetti();
        alert(`Selamat! Target Impian "${goal.name}" senilai ${formatRupiah(target)} telah tercapai! 🎉💖`);
      }, 500);
    }
  });
}

window.deleteTransaction = function(txId) {
  if (confirm("Apakah Anda yakin ingin menghapus catatan transaksi ini?")) {
    state.transactions = state.transactions.filter(tx => tx.id !== txId);
    saveToCloud();
  }
};

// ==========================================
// GOALS MANAGEMENT (IMPIAN BERSAMA)
// ==========================================

const btnAddGoal = document.getElementById("btn-add-goal");
const btnCloseGoalModal = document.getElementById("btn-close-goal-modal");
const goalIdInput = document.getElementById("goal-id");
const goalNameInput = document.getElementById("goal-name");
const goalTargetInput = document.getElementById("goal-target");
const goalDeadlineInput = document.getElementById("goal-deadline");
const goalModalTitle = document.getElementById("goal-modal-title");

btnAddGoal.addEventListener("click", () => {
  goalIdInput.value = "";
  goalNameInput.value = "";
  goalTargetInput.value = "";
  
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  goalDeadlineInput.value = nextMonth.toISOString().split("T")[0];
  
  document.querySelector('input[name="goal-emoji"][value="✈️"]').checked = true;
  goalModalTitle.innerText = "Tambah Impian Baru";
  goalModal.classList.add("open");
});

btnCloseGoalModal.addEventListener("click", () => {
  goalModal.classList.remove("open");
});

goalForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const id = goalIdInput.value;
  const name = goalNameInput.value.trim();
  const target = Number(goalTargetInput.value);
  const deadline = goalDeadlineInput.value;
  const icon = document.querySelector('input[name="goal-emoji"]:checked').value;

  if (!state.goals) state.goals = [];

  if (id) {
    const goalIndex = state.goals.findIndex(g => g.id === id);
    if (goalIndex !== -1) {
      state.goals[goalIndex] = { ...state.goals[goalIndex], name, target, deadline, icon };
    }
  } else {
    const newGoal = {
      id: "goal-" + Date.now(),
      name,
      target,
      deadline,
      icon
    };
    state.goals.push(newGoal);
  }

  goalModal.classList.remove("open");
  saveToCloud();
});

window.openEditGoal = function(goalId) {
  const goal = state.goals.find(g => g.id === goalId);
  if (!goal) return;

  goalIdInput.value = goal.id;
  goalNameInput.value = goal.name;
  goalTargetInput.value = goal.target;
  goalDeadlineInput.value = goal.deadline;
  
  const emojiRadio = document.querySelector(`input[name="goal-emoji"][value="${goal.icon}"]`);
  if (emojiRadio) emojiRadio.checked = true;

  goalModalTitle.innerText = "Edit Target Impian";
  goalModal.classList.add("open");
};

window.deleteGoal = function(goalId) {
  if (confirm("Apakah Anda yakin ingin menghapus target impian ini?")) {
    state.goals = state.goals.filter(g => g.id !== goalId);
    saveToCloud();
  }
};

// ==========================================
// PROFILE SETTINGS
// ==========================================

const btnEditProfiles = document.getElementById("btn-edit-profiles");
const btnCloseProfileModal = document.getElementById("btn-close-profile-modal");
const settingsUser1Name = document.getElementById("settings-user1-name");
const settingsUser1Color = document.getElementById("settings-user1-color");
const settingsUser1Avatar = document.getElementById("settings-user1-avatar");
const settingsUser2Name = document.getElementById("settings-user2-name");
const settingsUser2Color = document.getElementById("settings-user2-color");
const settingsUser2Avatar = document.getElementById("settings-user2-avatar");

btnEditProfiles.addEventListener("click", () => {
  settingsUser1Name.value = state.profiles.user1.name;
  settingsUser1Color.value = state.profiles.user1.color;
  settingsUser1Avatar.value = state.profiles.user1.avatar;

  settingsUser2Name.value = state.profiles.user2.name;
  settingsUser2Color.value = state.profiles.user2.color;
  settingsUser2Avatar.value = state.profiles.user2.avatar;

  profileModal.classList.add("open");
});

btnCloseProfileModal.addEventListener("click", () => {
  profileModal.classList.remove("open");
});

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  state.profiles.user1.name = settingsUser1Name.value.trim();
  state.profiles.user1.color = settingsUser1Color.value;
  state.profiles.user1.avatar = settingsUser1Avatar.value.trim() || "🧑‍💻";

  state.profiles.user2.name = settingsUser2Name.value.trim();
  state.profiles.user2.color = settingsUser2Color.value;
  state.profiles.user2.avatar = settingsUser2Avatar.value.trim() || "👩‍💻";

  profileModal.classList.remove("open");
  saveToCloud();
});

// ==========================================
// FILTERS TRANSACTION HISTORY
// ==========================================

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.getAttribute("data-filter");
    renderTransactions();
    initIcons();
  });
});

// ==========================================
// CONFETTI ANIMATION (CSS + JS)
// ==========================================

const confettiContainer = document.getElementById("confetti-container");
const hearts = ["❤️", "💖", "💝", "💕", "💘", "🌸", "✨"];

function triggerHeartConfetti() {
  const count = 35;
  for (let i = 0; i < count; i++) {
    const heart = document.createElement("div");
    heart.className = "confetti-heart";
    heart.innerText = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.fontSize = (Math.random() * 1.5 + 0.8) + "rem";
    heart.style.animationDelay = Math.random() * 0.5 + "s";
    heart.style.animationDuration = (Math.random() * 2 + 1.5) + "s";
    confettiContainer.appendChild(heart);
    heart.addEventListener("animationend", () => {
      heart.remove();
    });
  }
}

function triggerMegaConfetti() {
  let timer = 0;
  for (let cycle = 0; cycle < 5; cycle++) {
    setTimeout(triggerHeartConfetti, timer);
    timer += 400;
  }
}

// ==========================================
// SHARING & LOGOUT COUPLING
// ==========================================

// Salin kode hubung dan link ke clipboard
btnShareCode.addEventListener("click", () => {
  const shareUrl = `${window.location.origin}${window.location.pathname}?code=${savingsCode}`;
  navigator.clipboard.writeText(shareUrl).then(() => {
    alert(`Link Hubung Berhasil Disalin! 💖\n\nKirim link ini ke pasangan Anda agar dia bisa langsung tersambung:\n${shareUrl}`);
  }).catch(() => {
    // Fallback jika clipboard API gagal
    alert(`Kode Celengan Anda: ${savingsCode}\nSalin kode ini dan kirim ke pasangan Anda.`);
  });
});

// Logout / Putuskan koneksi celengan
btnLogout.addEventListener("click", () => {
  if (confirm("Apakah Anda yakin ingin memutuskan koneksi dari celengan ini?\n\n(Data Anda di cloud tidak akan terhapus, Anda bisa bergabung kembali nanti menggunakan kode yang sama).")) {
    localStorage.removeItem('savingsCode');
    savingsCode = "";
    // Hapus parameter query di URL
    window.history.pushState({}, '', window.location.pathname);
    showStartupView();
  }
});

// ==========================================
// EXPORT & IMPORT DATA BACKUP
// ==========================================

const btnExport = document.getElementById("btn-export");
const btnImportTrigger = document.getElementById("btn-import-trigger");
const fileImportInput = document.getElementById("file-import");

btnExport.addEventListener("click", () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `celengan_couple_backup_${new Date().toISOString().split('T')[0]}.json`);
  dlAnchorElem.click();
});

btnImportTrigger.addEventListener("click", () => {
  fileImportInput.click();
});

fileImportInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(event) {
    try {
      const importedState = JSON.parse(event.target.result);
      if (!importedState.profiles || !importedState.goals || !importedState.transactions) {
        throw new Error("Format berkas cadangan tidak valid!");
      }

      if (confirm("Apakah Anda yakin ingin menimpa data celengan online saat ini dengan data cadangan ini?")) {
        state = importedState;
        await saveToCloud();
        alert("Data online berhasil dipulihkan!");
      }
    } catch (err) {
      alert("Gagal mengimpor file: " + err.message);
    }
  };
  reader.readAsText(file);
});

// ==========================================
// ENTRY POINT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
});
