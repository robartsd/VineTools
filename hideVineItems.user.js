// ==UserScript==
// @name        Hide Vine Items
// @namespace   https://github.com/robartsd/VineTools/
// @match       https://www.amazon.com/vine/vine-items*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_addStyle
// @version     1.2
// @description Adds a hide button to items offered in Amazon Vine.
// ==/UserScript==

var hideLink_hideText = GM_getValue("#hideLink_hideText", "hide item");
var hideLink_unhideText = GM_getValue("#hideLink_unhideText", "unhide item");
var hideLink_background = GM_getValue("#hideLink_background", "#3339");
var hideLink_useImage = GM_getValue("#hideLink_useImage", false);
var hideLink_top = GM_getValue("#hideLink_top", "0");
var hideLink_right = GM_getValue("#hideLink_right", "0");
var hiddenCount_before = GM_getValue("#hiddenCount_before", "(");
var hiddenCount_after = GM_getValue("#hiddenCount_after", " hidden)");
var hiddenItem_opacity = GM_getValue("#hiddenItem_opacity", "50%");
var pageToggleLink_text = GM_getValue("#pageToggleLink_text", "Toggle hidden items");
var hideAllLink_text = GM_getValue("#hideAllLink_text", "Hide all items on this page");

var hiddenCount = 0;
var useProductImage = GM_getValue("#useProductImage", false);

function updateCount() {
  document.getElementById("hideVineItems-count").innerHTML = `${hiddenCount}`;
}

function isHidden(ASIN) {
  return GM_getValue(ASIN) ? true : false;
}

function addHideLink(tile, ASIN) {
  var tileContent = tile.querySelector(".vvp-item-tile-content");
  if (tileContent) {
    var a;
    if(hideLink_useImage) {
      a = tileContent.querySelector("img");
    } else {
      a = document.createElement("a");
      a.classList.add("hideVineItems-toggleASIN");
      tileContent.append(a);
    }
    a.addEventListener("click", (e) => {
      tile.classList.toggle("hideVineItems-hideASIN");
      if (isHidden(ASIN)) {
        GM_deleteValue(ASIN);
        hiddenCount -= 1;
      } else {
        GM_setValue(ASIN, new Date().toJSON().slice(0,10));
        hiddenCount += 1;
      }
      updateCount();
    });
  }
}

document.querySelectorAll(".vvp-item-tile").forEach( (tile) => {
  var itemLink = tile.querySelector(".vvp-item-product-title-container > a[href^='/dp/']");
  if (itemLink) {
    var ASIN = itemLink.getAttribute("href").slice(4);
    if (isHidden(ASIN)) {
      tile.classList.add("hideVineItems-hideASIN");
      hiddenCount += 1;
    }
    addHideLink(tile, ASIN);
  }
});

if(/vine\/vine-items/.test(location)) {
  GM_addStyle(`
  .hideVineItems-hideASIN {
    display:none;
  }
  .vvp-item-tile-content {
    position: relative;
  }
  .hideVineItems-toggleASIN {
    position: absolute;
    width: auto !important;
    top: ${hideLink_top};
    right: ${hideLink_right};
    background-color: ${hideLink_background};
    padding: 0 .5em;
  }
  .hideVineItems-toggleASIN::before {
    content: '${hideLink_hideText}';
    display: inline;
  }
  .hideVineItems-hideASIN .hideVineItems-toggleASIN::before
  {
    content: '${hideLink_unhideText}';
  }
  #hideVineItems-count::before {
    content: '${hiddenCount_before}';
    display: inline;
  }
  #hideVineItems-count::after {
    content: '${hiddenCount_after}';
    display: inline;
  }
  .hideVineItems-message, .hideVineItems-message a {
    padding: 0 1em;
  }
  .hideVineItems-showHidden .hideVineItems-hideASIN {
    display:unset;
    opacity: ${hiddenItem_opacity};
  }
  `);
  var messageSpan = document.createElement("span");
  messageSpan.classList.add("hideVineItems-message");
  messageSpan.innerHTML = ` <a id="hideVineItems-togglePage">${pageToggleLink_text} <span id="hideVineItems-count">${hiddenCount}</span></a> <a id="hideVineItems-hideAll">${hideAllLink_text}</a> `;
  messageSpan.querySelector("#hideVineItems-togglePage").addEventListener("click", (e) => {
    document.querySelector(":root").classList.toggle("hideVineItems-showHidden");
  });
  messageSpan.querySelector("#hideVineItems-hideAll").addEventListener("click", (e) => {
    document.querySelectorAll(".vvp-item-tile:not(.hideVineItems-hideASIN) .hideVineItems-toggleASIN").forEach( (hideLink) => {
      hideLink.click();
    })
  });
  document.querySelector("#vvp-items-grid-container > p").append(messageSpan);
}
