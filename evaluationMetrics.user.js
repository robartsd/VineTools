// ==UserScript==
// @name        Vine Evaluation Metrics
// @namespace   Violentmonkey Scripts
// @match       https://www.amazon.com/vine/account*
// @grant       none
// @version     1.4.0
// @description Calculates approximate order total, displays evaluation period end time, and colors the activity bars if you are behind target
// ==/UserScript==

const periodEnd = new Date(parseInt(document.querySelector("#vvp-eval-end-stamp").innerText));

document.querySelector("#vvp-evaluation-date-string > strong").innerText = periodEnd.toLocaleString();

const percent = Math.round(parseFloat(document.querySelector("#vvp-perc-reviewed-metric-display p:nth-child(-n+2) *:is(strong, .a-size-extra-large)").innerText)); //Vine seems to always round to whole percent but sometimes displays inaccurate tenths
if (percent > 0) {
  const metricsBox = document.querySelector("#vvp-vine-activity-metrics-box, #vvp-vine-account-details-box");
  metricsBox.dataset.percent = percent;
  const count = parseInt(document.querySelector("#vvp-num-reviewed-metric-display p:nth-child(-n+2) *:is(strong, .a-size-extra-large)").innerText.replaceAll(/\D+/g,'')); //review count should alwasy be integer remove possible thousands separator
  metricsBox.dataset.count = count;
  const orderCount = Math.round(count/percent * 100);
  metricsBox.dataset.orderCountEstimate = orderCount;
  // order min/max estimate assumes that percentage is rounded down
  const orderMin = Math.floor(count/(percent + 1) * 100) + 1;
  metricsBox.dataset.orderCountMin = orderMin;
  const orderMax = Math.max(Math.floor(count/(percent) * 100), orderMin);
  metricsBox.dataset.orderCountMax = orderMax;
  const awaitingMin = orderMin - count;
  metricsBox.dataset.awaitingCountMin = awaitingMin;
  const awaitingMax = orderMax - count;
  metricsBox.dataset.awaitingCountMax = awaitingMax;
  const targetMin = Math.max(Math.ceil(orderMin * .9) - count, 0);
  metricsBox.dataset.targetMin = targetMin;
  const targetMax = Math.ceil(orderMax * .9) - count;
  metricsBox.dataset.targetMax = targetMax;
  const orderEstimate = orderMin == orderMax ? orderMax : `${orderMin}&ndash;${orderMax}`;
  const awaitingEstimate = awaitingMin == awaitingMax ? awaitingMax : `${awaitingMin}&ndash;${awaitingMax}`;
  const targetRequired = targetMin == targetMax ? targetMax : `${targetMin}&ndash;${targetMax}`;
  if (awaitingMax > 0) {
    document.querySelector("#vvp-num-reviewed-metric-display p:nth-child(-n+2):has(strong, .a-size-extra-large").innerHTML = `<span class="a-size-extra-large">${count} </span> ${awaitingEstimate} items await review`
  }

  if (targetMax > 0) {
    document.querySelector("#vvp-perc-reviewed-metric-display p:nth-child(-n+2):has(strong, .a-size-extra-large").innerHTML = `<span class="a-size-extra-large">${percent}%</span> of ${orderEstimate} items; ${targetRequired} more required to reach 90%`;
  } else {
    document.querySelector("#vvp-perc-reviewed-metric-display p:nth-child(-n+2):has(strong, .a-size-extra-large").innerHTML = `<span class="a-size-extra-large">${percent}%</span> of ${orderEstimate} items`;
  }

  const periodStart = new Date(parseInt(document.querySelector("#vvp-eval-start-stamp").innerText));
  const periodFraction = ((new Date()).setUTCHours(0,0,0,0) - periodStart) / (periodEnd - periodStart);
  if (periodFraction > 0 && periodFraction < 1) {
    const projectedCount = count / periodFraction;
    metricsBox.dataset.projectedReviewCount = projectedCount.toFixed(1);
    const projectedOrders = orderCount / periodFraction;
    metricsBox.dataset.projectedOrderCount = projectedOrders.toFixed(1);
    const projectedPercent = (projectedOrders - awaitingMax) / projectedOrders;
    metricsBox.dataset.projectedReviewPercent = (projectedPercent * 100).toFixed(1);
    const countBar = document.querySelector("#vvp-num-reviewed-metric-display [class*='animated-progress'] span");
    const percentBar = document.querySelector("#vvp-perc-reviewed-metric-display [class*='animated-progress'] span");

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

