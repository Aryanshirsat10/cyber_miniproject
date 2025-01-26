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
      // console.log("Data received:", data);
      const status = data.malicious=='malicious' ? "UNSAFE" : (data.malicious=='possible' ? "MAYBE" : (data.malicious=="certified safe" ? "SAFE" : "ERROR"));
      annotateLink(link, status, data);
    } catch (error) {
      console.error("Error verifying URL:", error);
      annotateLink(link, "ERROR", { reason: "Failed to fetch data" });
    }
  }
}

function formatDate(isoDate) {
  if (!isoDate) return "Not Available"; // Fallback for missing date

  const date = new Date(isoDate);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("en-US", options);
}

function annotateLink(link, status, data) {
  const elements = document.querySelectorAll(`a[href="${link}"]`);
  elements.forEach((element) => {

    if (element.hasAttribute("data-status-annotated")) {
      return; // Skip if the badge already exists
    }

    // Add the attribute to mark the link as annotated
    element.setAttribute("data-status-annotated", "true");

    const statusBadge = document.createElement("span");
    statusBadge.style.marginLeft = "5px";
    statusBadge.style.cursor = "pointer";
    let statusText = status == 'SAFE' ? 'Certified Safe' : status == 'UNSAFE' ? 'Malicious' : status == 'MAYBE' ? 'Possible' : 'Error';
    // Set the icon and color based on the status
    if (status === "SAFE") {
      statusBadge.innerHTML = "✅";
      statusBadge.style.color = "green";
    } else if (status === "UNSAFE") {
      statusBadge.innerHTML = "❌";
      statusBadge.style.color = "red";
    } else if (status === "MAYBE") {
      statusBadge.innerHTML = "⁉";
      statusBadge.style.color = "grey";
    } else {
      statusBadge.innerHTML = "⚠️";
      statusBadge.style.color = "white";
    }

    const certAuthority = data.details?.blackListCheck?.tls?.cert_authority || "Not Available";
    const certExpires = data.details?.blackListCheck?.tls?.cert_expires || "Not Available";
    const certIssuer = data.details?.blackListCheck?.tls?.cert_issuer || "Not Available";
    const domain = data.details?.blackListCheck?.site?.domain || "Not Available";
    const lastScanRaw  = data.details?.blackListCheck?.scan?.last_scan || "Not Available";
    const lastScan = formatDate(lastScanRaw);
    const ratings = data.details?.blackListCheck?.ratings?.total.rating || "Not Available";

    // Add a tooltip with details
    const tooltip = document.createElement("div");
    // tooltip.textContent = JSON.stringify(data, null, 2); // Format data for display
    tooltip.innerHTML = `
      <strong>Status:</strong> ${statusText}<br>
      <strong>Domain:</strong> ${domain}<br>
      <strong>Certificate Authority:</strong> ${certAuthority}<br>
      <strong>Certificate Issuer:</strong> ${certIssuer}<br>
      <strong>Certificate Expiration:</strong> ${certExpires}<br>
      <strong>Last Scan:</strong> ${lastScan}<br>
      <strong>Overall Rating:</strong> ${ratings}<br>
      <a href="#" class="more-info-link" target="_blank" style="color: blue; text-decoration: underline;">More Info</a>
    `;
    const moreInfoLink = tooltip.querySelector(".more-info-link");
    moreInfoLink.addEventListener("click", (event) => {
      event.preventDefault();
      // Store the URL in chrome.storage.local
      console.log("More info clicked");  // Check if this logs
      const redirectUrl = `http://localhost:5173/?urlToCheck=${encodeURIComponent(link)}`;
      console.log("Redirecting to:", redirectUrl);
      window.location.href = redirectUrl;
    });


    
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

    let showTimeout, hideTimeout;
    // Show/hide tooltip on hover
    statusBadge.addEventListener("mouseover", (e) => {
      clearTimeout(hideTimeout);
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.style.display = "block";
    });

    statusBadge.addEventListener("mouseout", () => {
      hideTimeout = setTimeout(() => {
        tooltip.style.display = "none";
      }, 300);
    });

    tooltip.addEventListener("mouseover", () => {
      clearTimeout(hideTimeout);
      tooltip.style.display = "block";
    });

    // Hide tooltip when the mouse leaves the tooltip
    tooltip.addEventListener("mouseout", () => {
      hideTimeout = setTimeout(() => {
        tooltip.style.display = "none";
      }, 300);
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
  const links = document.querySelectorAll("a[href^=`http://`]");
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
