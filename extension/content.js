// async function verifyUrls(links) {
//   const apiEndpoint = "http://localhost:3000/verify"; // Replace with a real API
//   for (const link of links) {
//     try {
//       const response = await fetch(`${apiEndpoint}?url=${encodeURIComponent(link)}`);
//       const data = await response.json();
//       const status = data.malicious ? "UNSAFE" : data.reason === "error" ? "ERROR" : "SAFE";
//       annotateLink(link, status);
//     } catch (error) {
//       console.error("Error verifying URL:", error);
//     }
//   }
// }

// function annotateLink(link, status) {
//   const elements = document.querySelectorAll(`a[href='${link}']`);
//   elements.forEach((element) => {
//     const statusBadge = document.createElement("span");
//     statusBadge.textContent = ` [${status}]`;
//     statusBadge.style.color = status === "SAFE" ? "green" : status === "UNSAFE" ? "red" : "grey";
//     element.parentNode.insertBefore(statusBadge, element.nextSibling);
//   });
// }


async function verifyUrls(links) {
  const apiEndpoint = "http://localhost:3000/verify"; // Replace with a real API
  for (const link of links) {
    try {
      const response = await fetch(`${apiEndpoint}?url=${encodeURIComponent(link)}`);
      const data = await response.json();
      const status = data.malicious=='possible' ? "UNSAFE" : data.reason === "error" ? "ERROR" : "SAFE";
      annotateLink(link, status, data);
    } catch (error) {
      console.error("Error verifying URL:", error);
      annotateLink(link, "ERROR", { reason: "Failed to fetch data" });
    }
  }
}

function annotateLink(link, status, data) {
  const elements = document.querySelectorAll(`a[href='${link}']`);
  elements.forEach((element) => {

    if (element.hasAttribute("data-status-annotated")) {
      return; // Skip if the badge already exists
    }

    // Add the attribute to mark the link as annotated
    element.setAttribute("data-status-annotated", "true");

    const statusBadge = document.createElement("span");
    statusBadge.style.marginLeft = "5px";
    statusBadge.style.cursor = "pointer";

    // Set the icon and color based on the status
    if (status === "SAFE") {
      statusBadge.innerHTML = "✅";
      statusBadge.style.color = "green";
    } else if (status === "UNSAFE") {
      statusBadge.innerHTML = "❗️";
      statusBadge.style.color = "red";
    } else {
      statusBadge.innerHTML = "❔";
      statusBadge.style.color = "grey";
    }

    // Add a tooltip with details
    const tooltip = document.createElement("div");
    tooltip.textContent = JSON.stringify(data, null, 2); // Format data for display
    tooltip.style.position = "absolute";
    tooltip.style.background = "white";
    tooltip.style.color = "black"
    tooltip.style.border = "1px solid black";
    tooltip.style.padding = "5px";
    tooltip.style.borderRadius = "4px";
    tooltip.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
    tooltip.style.fontSize = "12px";
    tooltip.style.display = "none";
    tooltip.style.zIndex = "1000";

    document.body.appendChild(tooltip);

    // Show/hide tooltip on hover
    statusBadge.addEventListener("mouseover", (e) => {
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.style.display = "block";
    });
    statusBadge.addEventListener("mouseout", () => {
      tooltip.style.display = "none";
    });

    // Insert badge after the link
    element.parentNode.insertBefore(statusBadge, element.nextSibling);
  });
}


function getAllSearchLinks() {
  const links = Array.from(document.querySelectorAll("a"))
    .filter((a) => a.href.startsWith("http") && !a.href.includes("google.com") && a.dataset.ved!=undefined)
    .map((a) => a.href);

  // links.forEach((a)=>console.log((a.dataset.ved).length))
  return links;
}

function updateHttpToHttps() {
  const links = document.querySelectorAll("a[href^='http://']");
  links.forEach((link) => {
    const secureUrl = link.href.replace("http://", "https://");
    link.href = secureUrl;
  });
}

window.onload = function () {
  // Update all http:// links to https://
  // updateHttpToHttps();

  // Verify links for malicious content
  const links = getAllSearchLinks();
  verifyUrls(links);
};
