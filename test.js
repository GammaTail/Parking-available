function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371; // Earth's radius in kilometers
    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = earthRadiusKm * c;
    return distance;
  }
  
  // Coordinates for Uttam Nagar and Janakpuri
  const uttamNagarLat = 28.6246;
  const uttamNagarLon = 77.0656;
  const janakpuriLat = 28.6215;
  const janakpuriLon = 77.0875;
  
  // Calculate the distance
  const distance = calculateDistance(uttamNagarLat, uttamNagarLon, janakpuriLat, janakpuriLon);
  console.log('Distance between Uttam Nagar and Janakpuri (in kilometers):', distance);