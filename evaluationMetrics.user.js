// ==UserScript==
// @name        Vine Evaluation Metrics
// @namespace   Violentmonkey Scripts
// @match       https://www.amazon.com/vine/account*
// @grant       none
// @version     1.1.1
// @description Calculates approximate order total, displays evaluation period end time, and colors the activity bars if you are behind target
// ==/UserScript==

const periodStart = new Date(parseInt(document.querySelector("#vvp-eval-start-stamp").innerText));
const periodEnd = new Date(parseInt(document.querySelector("#vvp-eval-end-stamp").innerText));

document.querySelector("#vvp-evaluation-period-tooltip-trigger").innerText = `Evaluation period: ${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleString()}`;

const percent = Math.round(parseFloat(document.querySelector("#vvp-perc-reviewed-metric-display strong").innerText));
if (percent > 0) {
  const count = parseInt(document.querySelector("#vvp-num-reviewed-metric-display strong").innerText);
  const orderCount = Math.round(count/percent * 100);
  const orderMin = Math.min(Math.ceil(count/(percent+.5) * 100), orderCount);
  const orderMax = Math.max(Math.floor(count/(percent-.5) * 100), orderCount);
  const targetMin = Math.ceil(orderMin * .9) - count;
  const targetMax = Math.ceil(orderMax * .9) - count;
  const orderEstimate = orderMin == orderMax ? orderMax : `${orderMin}&ndash;${orderMax}`;
  const targetRequired = targetMin == targetMax ? targetMax : `${targetMin}&ndash;${targetMax}`;

  if (targetMax > 0) {
    document.querySelector("#vvp-perc-reviewed-metric-display p").innerHTML = `You have reviewed <strong>${percent}%</strong> of ${orderEstimate} items; review ${targetRequired} more to reach 90%`;
  } else {
    document.querySelector("#vvp-perc-reviewed-metric-display p").innerHTML = `You have reviewed <strong>${percent}%</strong> of ${orderEstimate} Vine items this period`;
  }

  const periodFraction = ((new Date()).setUTCHours(0,0,0,0) - periodStart) / (periodEnd - periodStart);
  if (periodFraction > 0) {
    const awaitingEstimate = orderMax - count;
    const projectedCount = count / periodFraction;
    const projectedOrders = orderMin / periodFraction;
    const projectedPercent = (projectedOrders - awaitingEstimate) / projectedOrders;
    const countBar = document.querySelector("#vvp-num-reviewed-metric-display .animated-progress span");
    const percentBar = document.querySelector("#vvp-perc-reviewed-metric-display .animated-progress span");

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
