// Initialize variables
let totalBalance = 0;
let currency = "USD"; // Default currency
let transactions = [];
let expenseChart = null; // Store the chart instance

// Cache DOM elements
const balanceDisplay = document.getElementById("total-balance");
const currencySelector = document.getElementById("currency");
const transactionForm = document.getElementById("transaction-form");
const transactionList = document.getElementById("transaction-list");
const clearDataBtn = document.getElementById("clear-data");
const expenseChartCanvas = document.getElementById("expense-chart");

// Load data from localStorage
loadData();

// Set initial balance and chart
updateBalance();
updateTransactionList();
updateChart();

// Handle form submission
transactionForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const type = document.querySelector('input[name="type"]:checked').value;

  const transaction = {
    description,
    amount,
    category,
    type,
    date: new Date().toLocaleString()
  };

  transactions.push(transaction);

  // Update total balance
  if (type === "income") {
    totalBalance += amount;
  } else if (type === "expense") {
    totalBalance -= amount;
  }

  // Save and update
  saveData();
  transactionForm.reset();
  updateBalance();
  updateTransactionList();
  updateChart();
});

// Handle currency change
currencySelector.addEventListener("change", function () {
  currency = currencySelector.value;
  saveData();
  updateBalance();
});

// Update total balance display
function updateBalance() {
  const convertedBalance = totalBalance; // You can add real conversion logic here
  const currencySymbol = getCurrencySymbol(currency);
  balanceDisplay.textContent = `${currencySymbol}${convertedBalance.toFixed(2)}`;
}

// Get currency symbol
function getCurrencySymbol(currencyCode) {
  const currencySymbols = {
    USD: "$", EUR: "€", GBP: "£", NGN: "₦", INR: "₹", JPY: "¥", KRW: "₩",
    BRL: "R$", TRY: "₺", ILS: "₪", VND: "₫", PHP: "₱", THB: "฿", UAH: "₴",
    CRC: "₡", AED: "د.إ", PLN: "zł", CHF: "CHF", CAD: "CAD $", AUD: "AUD $"
  };
  return currencySymbols[currencyCode] || "$";
}

// Update transaction list
function updateTransactionList() {
  transactionList.innerHTML = "";
  transactions.forEach((transaction, index) => {
    const li = document.createElement("li");
    li.classList.add(transaction.type);
    li.innerHTML = `
      <span>${transaction.description} - ${transaction.category} (${transaction.type})</span>
      <span>${getCurrencySymbol(currency)}${transaction.amount.toFixed(2)}</span>
      <button class="delete-btn" onclick="deleteTransaction(${index})">Delete</button>
    `;
    transactionList.appendChild(li);
  });
}

// Delete transaction
function deleteTransaction(index) {
  const transaction = transactions[index];
  if (transaction.type === "income") {
    totalBalance -= transaction.amount;
  } else if (transaction.type === "expense") {
    totalBalance += transaction.amount;
  }

  transactions.splice(index, 1);
  saveData();
  updateBalance();
  updateTransactionList();
  updateChart();
}

// Update chart
function updateChart() {
  const incomeTotal = transactions.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expenseTotal = transactions.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);

  const chartData = {
    labels: ["Income", "Expense"],
    datasets: [{
      data: [incomeTotal, expenseTotal],
      backgroundColor: ["#4caf50", "#f44336"],
      borderColor: ["#388e3c", "#d32f2f"],
      borderWidth: 1
    }]
  };

  if (expenseChart) {
    expenseChart.data.datasets[0].data = [incomeTotal, expenseTotal];
    expenseChart.update();
  } else {
    expenseChart = new Chart(expenseChartCanvas, {
      type: "pie",
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" }
        }
      }
    });
  }
}

// Clear all data
clearDataBtn.addEventListener("click", function () {
  if (confirm("Are you sure you want to clear all data?")) {
    transactions = [];
    totalBalance = 0;
    currency = "USD";
    currencySelector.value = "USD";
    saveData();
    updateBalance();
    updateTransactionList();
    updateChart();
  }
});

// Save data to localStorage
function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("totalBalance", totalBalance.toString());
  localStorage.setItem("currency", currency);
}

// Load data from localStorage
function loadData() {
  const savedTransactions = localStorage.getItem("transactions");
  const savedBalance = localStorage.getItem("totalBalance");
  const savedCurrency = localStorage.getItem("currency");

  if (savedTransactions) transactions = JSON.parse(savedTransactions);
  if (savedBalance) totalBalance = parseFloat(savedBalance);
  if (savedCurrency) {
    currency = savedCurrency;
    currencySelector.value = savedCurrency;
  }
}
