// ==UserScript==
// @name        Vine Activity Info
// @namespace   https://github.com/robartsd/VineTools/
// @match       https://www.amazon.com/vine/vine-reviews
// @match       https://www.amazon.com/vine/orders
// @grant       GM_getValue
// @grant       GM_setValue
// @version     0.1
// ==/UserScript==

var statusTimestamp = Date.now();
var completedReview = /review-type=completed/.test(location.search);

document.querySelectorAll(".vvp-reviews-table--row, .vvp-orders-table--row").forEach((itemRow)=>{
  var itemImageNode = itemRow.querySelector(".vvp-reviews-table--image-col img, .vvp-orders-table--image-col img");
  var itemTitleNode = itemRow.querySelector(".vvp-reviews-table--text-col, .vvp-orders-table--text-col");
  var itemOrderNode = itemRow.querySelector("[data-order-timestamp]");
  var itemReviewNode = itemRow.querySelector(".vvp-reviews-table--text-col:nth-child(4)");
  var itemETVNode = itemRow.querySelector(".vvp-orders-table--text-col:nth-child(4)");
  var itemReviewLinkNode = itemRow.querySelector(".vvp-reviews-table--actions-col a");
  var itemOrderLinkNode = itemRow.querySelector(".vvp-orders-table--actions-col a");
  var itemLinkNode = itemTitleNode.querySelector(".a-link-normal");
  var ASIN = itemLinkNode? itemLinkNode.href.split("/").pop() : itemTitleNode.textContent.split(" ")[0].trim();
  var item = GM_getValue(ASIN, {"ASIN":ASIN});
  if(itemLinkNode) {
    Object.assign(item, {itemLink: itemLinkNode.href, itemTitle: itemTitleNode.querySelector(".a-truncate-full").textContent});
  }
  if(itemImageNode) {
    Object.assign(item, {itemImage: itemImageNode.src});
  }
  if(itemOrderNode) {
    Object.assign(item, {orderTimestamp: parseInt(itemOrderNode.dataset.orderTimestamp)});
  }
  if(itemETVNode) {
    Object.assign(item, {orderETV: itemETVNode.textContent});
  }
  if(itemOrderLinkNode) {
    Object.assign(item, {orderDetailsLink: itemOrderLinkNode.href});
  }
  if(itemReviewNode) {
    Object.assign(item, {reviewStatus: itemReviewNode.textContent, reviewTitle: itemReviewNode.dataset.reviewContent, reviewStatusTimestamp: statusTimestamp});
  } else if(completedReview) {
    Object.assign(item, {reviewStatus: "Item listing removed after review completed", reviewStatusTimestamp: statusTimestamp});
  }
  if(itemReviewLinkNode) {
    Object.assign(item, {reviewLink: itemReviewLinkNode.href})
  }
  GM_setValue(ASIN, item);
});
