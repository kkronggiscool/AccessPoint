document.getElementById('lookupButton').addEventListener('click', function() {
    const ipAddress = document.getElementById('ipInput').value;
  
    if (!ipAddress) {
      document.getElementById('lookupResult').textContent = 'Please enter a valid IP address.';
      return;
    }
  
    fetch(`https://ipwho.is/${ipAddress}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const { city, region, country, latitude: lat, longitude: lon } = data;
  
          // Show results
          document.getElementById('lookupResult').innerHTML = `
            <h3>IP Address: ${ipAddress}</h3>
            <p>Location: ${city}, ${region}, ${country}</p>
            <p>Coordinates: Lat: ${lat}, Lon: ${lon}</p>
          `;
  
          // Initialize the map with Leaflet
          const map = L.map('map').setView([lat, lon], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
  
          // Add a marker at the user's location
          L.marker([lat, lon]).addTo(map)
            .bindPopup(`You're here: ${city}, ${region}, ${country}`)
            .openPopup();
        } else {
          document.getElementById('lookupResult').textContent = 'Invalid IP address. Please try again.';
          document.getElementById('map').style.display = 'none'; // Hide map if IP is invalid
        }
      })
      .catch(error => {
        console.error('Error fetching IP address or location:', error);
        document.getElementById('lookupResult').textContent = 'Unable to retrieve information.';
      });
  });
  