function getNumber(value){
  return Number(value.replace(/[^0-9.-]+/g,""));
}

let state = {
  price: getNumber(document.querySelector('[name="price"]').value),
  loan_years: parseFloat(document.querySelector('[name="loan_years"]').value),
  down_payment: parseFloat(document.querySelector('[name="down_payment"]').value),
  interest_rate: parseFloat(document.querySelector('[name="interest_rate"]').value),
  property_tax: parseFloat(document.querySelector('[name="property_tax"]').value),
  home_insurance: parseFloat(document.querySelector('[name="home_insurance"]').value),
  hoa: parseFloat(document.querySelector('[name="hoa"]').value),
};

let labels = [
  "Principal & Interest",
  "Total Loan Amount",
  "Total Interest Paid",
  "Total Cost of Home",
  "Property Tax",
  "Home Insurance",
  "HOA"
];

let backgroundColor = [
  'rgba(255, 99, 132, 0.6)',
  'rgba(54, 162, 235, 0.6)',
  'rgba(255, 205, 86, 0.6)',
  'rgba(75, 192, 192, 0.6)',
  'rgba(153, 102, 255, 0.6)',
  'rgba(255, 159, 64, 0.6)',
  'rgba(100, 255, 218, 0.6)'
];

let borderColor = [
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 205, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
  'rgba(100, 255, 218, 1)'
];

let ctx = document.getElementById('myChart').getContext('2d');
let myChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: labels,
    datasets: [{
      label: 'Mortgage Breakdown',
      data: [],
      backgroundColor: backgroundColor,
      borderColor: borderColor,
      borderWidth: 1
    }]
  },
  options: {
    animations: false,
    responsive: true
  }
});

let inputTexts = document.getElementsByClassName('form-group__textInput');
let inputSlides = document.getElementsByClassName('form-group__range-slide');

// Attach event listeners
for (let i = 0; i < inputTexts.length; i++) {
  inputTexts[i].addEventListener('input', updateInputState);
}
for (let i = 0; i < inputSlides.length; i++) {
  inputSlides[i].addEventListener('input', updateInputState);
}

function updateInputState(event){
  let name = event.target.name;
  let value = event.target.value;

  if(name === 'price'){
    value = getNumber(value); 
  } else {
    value = parseFloat(value);
  }

  if(event.target.type === 'range'){
    document.getElementsByClassName(`total__${name}`)[0].innerHTML = `${value}`;
  }
  if(event.target.type ==='range'){
    let displayValue = value;
    if(['property_tax', 'interest_rate', 'down_payment'].includes(name)){
      displayValue = `${value}%`;
    }
    document.getElementsByClassName(`total__${name}`)[0].innerHTML = displayValue;
  }

  state = {
    ...state,
    [name]: value
  };

  calculateData();
}

document.getElementsByTagName('form')[0].addEventListener('submit', (event) => {
  event.preventDefault();
});

document.getElementsByClassName('mg-page__right')[0].classList.add('mg-page__right--animate');

calculateData();

function calculateData() {
  const totalLoan = state.price - (state.price * (state.down_payment / 100));
  const totalMonths = state.loan_years * 12;
  const monthlyInterestRate = state.interest_rate / 100 / 12;

  const monthlyPrincipalInterest = (totalLoan * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths))) /
                                   (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
  const totalInterest = (monthlyPrincipalInterest * totalMonths) - totalLoan;
  const totalCost = totalLoan + totalInterest;

  const monthlyPropertyTax = ((state.property_tax / 100) * state.price) / 12;
  const monthlyHomeInsurance = state.home_insurance / 12  ;
  const monthlyHOA = state.hoa/12;

  const monthlyTotal = monthlyPrincipalInterest + monthlyPropertyTax + monthlyHomeInsurance + monthlyHOA;

  // Update DOM
  document.getElementsByClassName('info__numbers--principal')[0].innerHTML = `$${monthlyPrincipalInterest.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
  document.getElementsByClassName('info__numbers--property_taxes')[0].innerHTML = `$${monthlyPropertyTax.toFixed(2)}`;
  document.getElementsByClassName('info__numbers--home_insurance')[0].innerHTML = `$${monthlyHomeInsurance.toFixed(2)}`;
  document.getElementsByClassName('info__numbers--hoa')[0].innerHTML = `$${monthlyHOA.toFixed(2)}`;
  document.getElementsByClassName('info__numbers--total')[0].innerHTML = `$${monthlyTotal.toLocaleString(undefined, {minimumFractionDigits: 2 , maximumFractionDigits: 2})}`;

  // Update chart
  myChart.data.datasets[0].data = [
    monthlyPrincipalInterest,
    totalLoan,
    totalInterest,
    totalCost,
    monthlyPropertyTax,
    monthlyHomeInsurance,
    monthlyHOA
  ];
  myChart.update();
}
