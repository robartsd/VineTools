// ==UserScript==
// @name        Vine Evaluation Metrics
// @namespace   Violentmonkey Scripts
// @match       https://www.amazon.com/vine/account*
// @grant       none
// @version     1.0.1
// @description Calculates approximate order total, displays evaluation period end time, and colors the activity bars if you are behind target
// ==/UserScript==

const percentText = document.querySelector("#vvp-perc-reviewed-metric-display p");
const countBar = document.querySelector("#vvp-num-reviewed-metric-display .animated-progress span");
const percentBar = document.querySelector("#vvp-perc-reviewed-metric-display .animated-progress span");

const count = parseInt(document.querySelector("#vvp-num-reviewed-metric-display strong").innerText);
const percent = Math.round(parseFloat(percentText.querySelector("strong").innerText));

if (percent > 0) {
  const orderEstimate = Math.round(count/percent * 100);

  percentText.innerHTML = `You have reviewed <strong>${percent}%<\strong> of approximately ${orderEstimate} Vine items this period`;

  const awaitingEstimate = orderEstimate - count;
  const periodStart = new Date(parseInt(document.querySelector("#vvp-eval-start-stamp").innerText));
  const periodEnd = new Date(parseInt(document.querySelector("#vvp-eval-end-stamp").innerText));

  const periodFraction = ((new Date()).setUTCHours(0,0,0,0) - periodStart) / (periodEnd - periodStart);
  if (periodFraction > 0) {
    const projectedCount = count / periodFraction;
    const projectedOrders = orderEstimate / periodFraction;
    const projectedPercent = (projectedOrders - awaitingEstimate) / projectedOrders;

    if (projectedCount < 70) {
      countBar.style.backgroundColor = "red";
    } else if (projectedCount < 77) {
      countBar.style.backgroundColor = "orange";
    } else if (projectedCount < 80) {
      countBar.style.backgroundColor = "yellow";
    }

    if (projectedPercent < .8) {
      percentBar.style.backgroundColor = "red";
    } else if (projectedPercent < .88) {
      percentBar.style.backgroundColor = "orange";
    } else if (projectedPercent < .92) {
      percentBar.style.backgroundColor = "yellow";
    }
  }
}
document.querySelector("#vvp-evaluation-period-tooltip-trigger").innerText = `Evaluation period: ${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleString()}`;
