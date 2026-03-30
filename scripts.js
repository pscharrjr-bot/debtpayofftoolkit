function toNumber(value) {
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : NaN;
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function getInputValue(id) {
  const el = document.getElementById(id);
  return el ? toNumber(el.value) : NaN;
}

function payoffMonthsFromDebt(balance, annualRate, monthlyPayment) {
  if (!Number.isFinite(balance) || !Number.isFinite(annualRate) || !Number.isFinite(monthlyPayment)) return null;
  if (balance <= 0 || monthlyPayment <= 0) return null;
  const monthlyRate = annualRate / 100 / 12;
  let currentBalance = balance;
  let months = 0;
  let totalInterest = 0;
  while (currentBalance > 0 && months < 1200) {
    const interest = currentBalance * monthlyRate;
    totalInterest += interest;
    currentBalance += interest;
    currentBalance -= monthlyPayment;
    months += 1;
    if (currentBalance >= balance * 2 && months > 24) return null;
  }
  if (months >= 1200) return null;
  return { months, totalInterest, totalPaid: balance + totalInterest };
}

function runDebtPayoffCalculator() {
  const balance = getInputValue('debtBalance');
  const rate = getInputValue('debtRate');
  const monthlyPayment = getInputValue('debtMonthlyPayment');
  const extraPayment = getInputValue('debtExtraPayment');
  if ([balance, rate, monthlyPayment, extraPayment].some((v) => !Number.isFinite(v) || v < 0)) return;
  const totalMonthly = monthlyPayment + extraPayment;
  const result = payoffMonthsFromDebt(balance, rate, totalMonthly);
  if (!result) {
    setText('debtPayoffMonths', 'Too slow');
    setText('debtPayoffTotalMonthly', formatCurrency(totalMonthly));
    setText('debtPayoffInterest', '—');
    setText('debtPayoffTotalPaid', '—');
    setText('debtPayoffSummary', 'Payment may be too low to overcome interest effectively.');
    return;
  }
  setText('debtPayoffMonths', `${result.months} months`);
  setText('debtPayoffTotalMonthly', formatCurrency(totalMonthly));
  setText('debtPayoffInterest', formatCurrency(result.totalInterest));
  setText('debtPayoffTotalPaid', formatCurrency(result.totalPaid));
  setText('debtPayoffSummary', `Approximate payoff timeline: ${Math.floor(result.months / 12)} years and ${result.months % 12} months`);
}

function runCardPayoffCalculator() {
  const balance = getInputValue('cardBalance');
  const rate = getInputValue('cardRate');
  const monthlyPayment = getInputValue('cardMonthlyPayment');
  const extraPayment = getInputValue('cardExtraPayment');
  if ([balance, rate, monthlyPayment, extraPayment].some((v) => !Number.isFinite(v) || v < 0)) return;
  const totalMonthly = monthlyPayment + extraPayment;
  const result = payoffMonthsFromDebt(balance, rate, totalMonthly);
  if (!result) {
    setText('cardPayoffMonths', 'Too slow');
    setText('cardPayoffTotalMonthly', formatCurrency(totalMonthly));
    setText('cardPayoffInterest', '—');
    setText('cardPayoffTotalPaid', '—');
    setText('cardPayoffSummary', 'Payment may be too low to overcome interest effectively.');
    return;
  }
  setText('cardPayoffMonths', `${result.months} months`);
  setText('cardPayoffTotalMonthly', formatCurrency(totalMonthly));
  setText('cardPayoffInterest', formatCurrency(result.totalInterest));
  setText('cardPayoffTotalPaid', formatCurrency(result.totalPaid));
  setText('cardPayoffSummary', `Approximate payoff timeline: ${Math.floor(result.months / 12)} years and ${result.months % 12} months`);
}

function runSnowballCalculator() {
  const balances = [getInputValue('snowballDebt1'), getInputValue('snowballDebt2'), getInputValue('snowballDebt3')].filter((v) => Number.isFinite(v) && v > 0).sort((a,b) => a-b);
  const monthlyBudget = getInputValue('snowballMonthlyBudget');
  if (!Number.isFinite(monthlyBudget) || monthlyBudget <= 0 || balances.length === 0) return;
  const totalDebt = balances.reduce((sum, value) => sum + value, 0);
  const months = Math.ceil(totalDebt / monthlyBudget);
  setText('snowballOrder', balances.map((value) => formatCurrency(value)).join(' ? '));
  setText('snowballTotalDebt', formatCurrency(totalDebt));
  setText('snowballBudgetDisplay', formatCurrency(monthlyBudget));
  setText('snowballMonths', `${months} months`);
}

function runAvalancheCalculator() {
  const debts = [
    { balance: getInputValue('avalancheDebt1'), rate: getInputValue('avalancheRate1') },
    { balance: getInputValue('avalancheDebt2'), rate: getInputValue('avalancheRate2') },
    { balance: getInputValue('avalancheDebt3'), rate: getInputValue('avalancheRate3') },
  ].filter((item) => Number.isFinite(item.balance) && item.balance > 0 && Number.isFinite(item.rate) && item.rate >= 0).sort((a,b) => b.rate-a.rate);
  const monthlyBudget = getInputValue('avalancheMonthlyBudget');
  if (!Number.isFinite(monthlyBudget) || monthlyBudget <= 0 || debts.length === 0) return;
  const totalDebt = debts.reduce((sum, item) => sum + item.balance, 0);
  const weightedRate = debts.reduce((sum, item) => sum + (item.balance * item.rate), 0) / totalDebt;
  const result = payoffMonthsFromDebt(totalDebt, weightedRate, monthlyBudget);
  setText('avalancheOrder', debts.map((item) => `${formatCurrency(item.balance)} @ ${item.rate.toFixed(2)}%`).join(' ? '));
  setText('avalancheTotalDebt', formatCurrency(totalDebt));
  setText('avalancheBudgetDisplay', formatCurrency(monthlyBudget));
  setText('avalancheMonths', result ? `${result.months} months` : 'Too slow');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('calculateDebtPayoff')) {
    document.getElementById('calculateDebtPayoff').addEventListener('click', runDebtPayoffCalculator);
    runDebtPayoffCalculator();
  }
  if (document.getElementById('calculateCardPayoff')) {
    document.getElementById('calculateCardPayoff').addEventListener('click', runCardPayoffCalculator);
    runCardPayoffCalculator();
  }
  if (document.getElementById('calculateSnowball')) {
    document.getElementById('calculateSnowball').addEventListener('click', runSnowballCalculator);
    runSnowballCalculator();
  }
  if (document.getElementById('calculateAvalanche')) {
    document.getElementById('calculateAvalanche').addEventListener('click', runAvalancheCalculator);
    runAvalancheCalculator();
  }
});
