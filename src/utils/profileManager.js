const fs = require('fs');
const path = require('path');

const profilesFile = path.join(__dirname, '..', 'data', 'profiles.json');

if (!fs.existsSync(profilesFile)) {
  fs.writeFileSync(profilesFile, JSON.stringify({}, null, 2));
}

function getUserProfile(userId) {
  const data = fs.readFileSync(profilesFile, 'utf8');
  const profiles = JSON.parse(data);
  
  if (!profiles[userId]) {
    profiles[userId] = {
      bio: 'A mysterious cowboy wandering the Wild West...',
      background: null
    };
  }
  
  return profiles[userId];
}

function setUserBio(userId, bio) {
  const data = fs.readFileSync(profilesFile, 'utf8');
  const profiles = JSON.parse(data);
  
  if (!profiles[userId]) {
    profiles[userId] = { bio: '', background: null };
  }
  
  profiles[userId].bio = bio;
  fs.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));
  
  return true;
}

function setUserBackground(userId, backgroundName) {
  const data = fs.readFileSync(profilesFile, 'utf8');
  const profiles = JSON.parse(data);
  
  if (!profiles[userId]) {
    profiles[userId] = { bio: 'A mysterious cowboy wandering the Wild West...', background: null };
  }
  
  profiles[userId].background = backgroundName;
  fs.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));
  
  return true;
}

module.exports = {
  getUserProfile,
  setUserBio,
  setUserBackground
};
