# VineTools
Tools for using Amazon Vine

Tools in this repository are licensed under CC-BY-NC-SA. You are free to modify and/or distribute as long as you 1) attribute this repository, 2) do not sell the original or modified tools, and 3) grant the same privileges to anyone you distribute modified versions of these tools to. Pull requests to improve these tools are also welcome.

## Hide Vine Items
The hideVineItems.user.js script creates a hide item link on Amazon Vine pages. Hidden items are stored by ASIN in the browser. No interaction with any server occurs. Hidden items are still counted in the results for the page, so this does not change the number of pages of results. This script was developed for ViolentMonkey, but may work with other userscript extensions.

## Evaluation Metrics
The evaluationMetrics.user.js script does some calculations based on number of reviews completed and percent of orders reviewed to estimate how many orders have been made (and how many more reviews are required to reach 90% if you are not already above 90%). It changes the colors of the progress bars if it estimates that you are behind schedule for completing the evaulation period with enough reviews to achieve Gold. It also displays the actual time your evaluation will start.
