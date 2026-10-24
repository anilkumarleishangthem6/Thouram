/**
 * Matching engine for volunteers and event duties
 * Returns a score between 0 and 100 with detailed breakdown
 */
function calculateMatchScore(volunteerProfile, event, duty) {
  let score = 0;
  const breakdown = {
    skillsScore: 0,
    skillsMatched: [],
    skillsMissing: [],
    locationScore: 0,
    distanceKm: null,
    availabilityScore: 0,
    interestScore: 0,
    reliabilityScore: 0,
    totalScore: 0
  };

  if (!volunteerProfile) return breakdown;

  // 1. Skill Matching (Weight: 40%)
  const requiredSkills = (duty?.requiredSkills && duty.requiredSkills.length > 0)
    ? duty.requiredSkills
    : (event.tags || []);

  const volunteerSkills = (volunteerProfile.skills || []).map(s => s.toLowerCase().trim());

  if (requiredSkills.length > 0) {
    let matchedCount = 0;
    requiredSkills.forEach(reqSkill => {
      const normalized = reqSkill.toLowerCase().trim();
      if (volunteerSkills.includes(normalized)) {
        matchedCount++;
        breakdown.skillsMatched.push(reqSkill);
      } else {
        breakdown.skillsMissing.push(reqSkill);
      }
    });

    const matchRatio = matchedCount / requiredSkills.length;
    breakdown.skillsScore = Math.round(matchRatio * 40);
  } else {
    // If no specific skills required, default baseline skill score
    breakdown.skillsScore = 30;
  }
  score += breakdown.skillsScore;

  // 2. Interest / Cause Matching (Weight: 20%)
  const volunteerInterests = (volunteerProfile.interests || []).map(i => i.toLowerCase().trim());
  if (event.cause && volunteerInterests.includes(event.cause.toLowerCase().trim())) {
    breakdown.interestScore = 20;
  } else if (event.tags && event.tags.some(tag => volunteerInterests.includes(tag.toLowerCase().trim()))) {
    breakdown.interestScore = 15;
  } else {
    breakdown.interestScore = 5;
  }
  score += breakdown.interestScore;

  // 3. Location / Proximity (Weight: 20%)
  if (event.location?.isVirtual) {
    breakdown.locationScore = 20;
    breakdown.distanceKm = 0;
  } else if (
    volunteerProfile.location?.coordinates && 
    event.location?.coordinates &&
    volunteerProfile.location.coordinates.length === 2 &&
    event.location.coordinates.length === 2
  ) {
    const [vLon, vLat] = volunteerProfile.location.coordinates;
    const [eLon, eLat] = event.location.coordinates;

    const distKm = getDistanceInKm(vLat, vLon, eLat, eLon);
    breakdown.distanceKm = Math.round(distKm * 10) / 10;
    const maxRadius = volunteerProfile.travelRadiusKm || 25;

    if (distKm <= maxRadius * 0.3) {
      breakdown.locationScore = 20;
    } else if (distKm <= maxRadius * 0.7) {
      breakdown.locationScore = 15;
    } else if (distKm <= maxRadius) {
      breakdown.locationScore = 10;
    } else {
      breakdown.locationScore = 2;
    }
  } else {
    // City match heuristic
    if (volunteerProfile.city && event.location?.city && 
        volunteerProfile.city.toLowerCase() === event.location.city.toLowerCase()) {
      breakdown.locationScore = 18;
    } else {
      breakdown.locationScore = 10;
    }
  }
  score += breakdown.locationScore;

  // 4. Reliability & Completion History (Weight: 20%)
  const reliability = volunteerProfile.metrics?.reliabilityScore ?? 80;
  breakdown.reliabilityScore = Math.round((reliability / 100) * 20);
  score += breakdown.reliabilityScore;

  breakdown.totalScore = Math.min(100, Math.max(0, score));
  return breakdown;
}

function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = { calculateMatchScore, getDistanceInKm };
