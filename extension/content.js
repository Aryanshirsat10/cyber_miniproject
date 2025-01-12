async function verifyUrls(links) {
  const apiEndpoint = "http://localhost:3000/verify"; // Replace with a real API
  for (const link of links) {
    try {
      const response = await fetch(`${apiEndpoint}?url=${encodeURIComponent(link)}`);
      const data = await response.json();
      const status = data.malicious ? "UNSAFE" : data.reason === "error" ? "ERROR" : "SAFE";
      annotateLink(link, status);
    } catch (error) {
      console.error("Error verifying URL:", error);
    }
  }
}

function annotateLink(link, status) {
  const elements = document.querySelectorAll(`a[href='${link}']`);
  elements.forEach((element) => {
    const statusBadge = document.createElement("span");
    statusBadge.textContent = ` [${status}]`;
    statusBadge.style.color = status === "SAFE" ? "green" : status === "UNSAFE" ? "red" : "grey";
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
  // links.forEach((link) => {
  //   const secureUrl = link.href.replace("http://", "https://");
  //   link.href = secureUrl;
  // });
}

window.onload = function () {
  // Update all http:// links to https://
  updateHttpToHttps();

  // Verify links for malicious content
  const links = getAllSearchLinks();
  verifyUrls(links);
};
