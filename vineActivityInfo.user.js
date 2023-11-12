// ==UserScript==
// @name        Vine Activity Info
// @namespace   https://github.com/robartsd/VineTools/
// @match       https://www.amazon.com/vine/vine-reviews
// @match       https://www.amazon.com/vine/orders
// @match       https://www.amazon.com/gp/your-account/order-history*
// @grant       GM_getValue
// @grant       GM_setValue
// @version     0.3
// ==/UserScript==

const regex_orderID = /(?<=orderID=)[^&]+/;

var statusTimestamp = Date.now();

var orderIndex = GM_getValue("#orderIndex", {});

if(/vine\/(?:vine-reviews|orders)/.test(location)) {
  var timestampIndex = GM_getValue("#timestampIndex",{});
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
      var itemTitle = itemTitleNode.querySelector(".a-truncate-full").textContent;
      var itemTitleHistory = item.itemTitleHistory ? item.itemTitleHistory : {};
      if(itemTitle != item.itemTitle || !Object.values(itemTitleHistory).includes(itemTitle)) {
        itemTitleHistory[statusTimestamp] = itemTitle;
      }
      Object.assign(item, {itemLink: itemLinkNode.href, itemTitle, itemTitleHistory});
    }
    if(itemImageNode) {
      Object.assign(item, {itemImage: itemImageNode.src});
    }
    if(itemOrderNode) {
      Object.assign(item, {orderTimestamp: parseInt(itemOrderNode.dataset.orderTimestamp)});
      timestampIndex[itemOrderNode.dataset.orderTimestamp] = ASIN;
    }
    if(itemETVNode) {
      var orderETV = itemETVNode.textContent;
      var orderEtvHistory = item.orderEtvHistory ? item.orderEtvHistory : {};
      if(orderETV != item.orderETV || !Object.values(orderEtvHistory).includes(orderETV)) {
        orderEtvHistory[statusTimestamp] = orderETV;
      }
      Object.assign(item, {orderETV, orderEtvHistory});
    }
    if(itemOrderLinkNode) {
      var orderDetailsLink = itemOrderLinkNode.href;
      var orderID = orderDetailsLink.match(regex_orderID)[0];
      Object.assign(item, {orderDetailsLink, orderID});
      orderIndex[orderID] = ASIN;
    }
    if(itemReviewNode) {
      var reviewStatus = itemReviewNode.textContent;
      var reviewStatusHistory = item.reviewStatusHistory ? item.reviewStatusHistory : {};
      if(reviewStatus != item.reviewStatus) {
        reviewStatusHistory[statusTimestamp] = reviewStatus;
      }
      if(item.reviewStatus && !Object.values(reviewStatusHistory).includes(item.reviewStatus)) {
        reviewStatusHistory[item.reviewStatusTimestamp] = item.reviewStatus;
      }
      Object.assign(item, {reviewStatus, reviewStatusHistory, reviewTitle: itemReviewNode.dataset.reviewContent});
      delete item.reviewStatusTimestamp;
    } else if(completedReview) {
      var reviewStatus = "Item listing removed after review completed";
      var reviewStatusHistory = item.reviewStatusHistory ? item.reviewStatusHistory : {};
      if(reviewStatus != item.reviewStatus) {
        reviewStatusHistory[statusTimestamp] = reviewStatus;
      }
      if(item.reviewStatus && !Object.values(reviewStatusHistory).includes(item.reviewStatus)) {
        reviewStatusHistory[item.reviewStatusTimestamp] = item.reviewStatus;
      }
      Object.assign(item, {reviewStatus, reviewStatusHistory});
      delete item.reviewStatusTimestamp;
    }
    if(itemReviewLinkNode) {
      Object.assign(item, {reviewLink: itemReviewLinkNode.href})
    }
    GM_setValue(ASIN, item);
  });
  GM_setValue("#timestampIndex", timestampIndex);
  GM_setValue("#orderIndex", orderIndex);
} else if(/order-history/.test(location)) {
  console.log(location);
  document.querySelectorAll(".js-order-card").forEach((orderCard)=>{
    var orderIdNode = orderCard.querySelector(".yohtmlc-order-id .value");
    if(orderIdNode) {
      var orderID = orderIdNode.textContent.trim();
      console.log(JSON.stringify(orderID));
      if(orderIndex.hasOwnProperty(orderID)) {
        var item = GM_getValue(orderIndex[orderID], {ASIN:orderIndex[orderID]});
        var shipmentInfoNode = orderCard.querySelector(".js-shipment-info-container>:first-child>:first-child");
        if(item && shipmentInfoNode) {
          var shipmentInfo = shipmentInfoNode.textContent.trim();
          var shipmentInfoHistory = item.shipmentInfoHistory ? item.shipmentInfoHistory : {};
          if(item.shipmentInfo != shipmentInfo || !Object.values(shipmentInfoHistory).includes(shipmentInfo)) {
            shipmentInfoHistory[statusTimestamp] = shipmentInfo;
          }
          Object.assign(item, {shipmentInfo, shipmentInfoHistory});
          GM_setValue(orderIndex[orderID], item);
        }
      }
    }
  });
}
