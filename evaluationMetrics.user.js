// ==UserScript==
// @name        Vine Evaluation Metrics
// @namespace   Violentmonkey Scripts
// @match       https://www.amazon.com/vine/account*
// @grant       none
// @version     1.2.1
// @description Calculates approximate order total, displays evaluation period end time, and colors the activity bars if you are behind target
// ==/UserScript==

const periodEnd = new Date(parseInt(document.querySelector("#vvp-eval-end-stamp").innerText));

document.querySelector("#vvp-evaluation-date-string > strong").innerText = periodEnd.toLocaleString();

const percent = Math.round(parseFloat(document.querySelector("#vvp-perc-reviewed-metric-display strong").innerText)); //Vine seems to always round to whole percent but sometimes displays inaccurate tenths
if (percent > 0) {
  const metricsBox = document.querySelector("#vvp-vine-activity-metrics-box");
  metricsBox.dataset.percent = percent;
  const count = parseInt(document.querySelector("#vvp-num-reviewed-metric-display strong").innerText.replaceAll(/\D+/g,'')); //review count should alwasy be integer remove possible thousands separator
  metricsBox.dataset.count = count;
  const orderCount = Math.round(count/percent * 100);
  metricsBox.dataset.orderCountEstimate = orderCount;
  const orderMin = Math.min(Math.ceil(count/(percent+.5) * 100), orderCount);
  const orderMax = Math.max(Math.floor(count/(percent-.5) * 100), orderCount);
  const targetMin = Math.max(Math.ceil(orderMin * .9) - count, 0);
  const targetMax = Math.ceil(orderMax * .9) - count;
  const orderEstimate = orderMin == orderMax ? orderMax : `${orderMin}&ndash;${orderMax}`;
  const targetRequired = targetMin == targetMax ? targetMax : `${targetMin}&ndash;${targetMax}`;
  const awaitingEstimate = orderCount - count;
  metricsBox.dataset.awaitingReviewEstimate = awaitingEstimate;
  if (awaitingEstimate > 0) {
    document.querySelector("#vvp-num-reviewed-metric-display p").innerHTML = `You reviewed <strong>${count}</strong> items; approximately ${awaitingEstimate} ordered this period await review`
  }

  if (targetMin > 0) {
    document.querySelector("#vvp-perc-reviewed-metric-display p").innerHTML = `You have reviewed <strong>${percent}%</strong> of ${orderEstimate} items; review ${targetRequired} more to reach 90%`;
  } else if (targetMax > 0) {
    document.querySelector("#vvp-perc-reviewed-metric-display p").innerHTML = `You have reviewed <strong>${percent}%</strong> of ${orderEstimate} items; review ${targetMax} more to be sure you're over 90%`;
  } else {
    document.querySelector("#vvp-perc-reviewed-metric-display p").innerHTML = `You have reviewed <strong>${percent}%</strong> of ${orderEstimate} Vine items this period`;
  }

  const periodStart = new Date(parseInt(document.querySelector("#vvp-eval-start-stamp").innerText));
  const periodFraction = ((new Date()).setUTCHours(0,0,0,0) - periodStart) / (periodEnd - periodStart);
  if (periodFraction > 0 && periodFraction < 1) {
    const projectedCount = count / periodFraction;
    metricsBox.dataset.projectedReviewCount = projectedCount.toFixed(1);
    const projectedOrders = orderCount / periodFraction;
    metricsBox.dataset.projectedOrderCount = projectedOrders.toFixed(1);
    const projectedPercent = (projectedOrders - awaitingEstimate) / projectedOrders;
    metricsBox.dataset.projectedReviewPercent = (projectedPercent * 100).toFixed(1);
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
