import fs from 'fs';
import path from 'path';

const projectRoot = path.join(__dirname, '..', '..', '..');
const profilesFile = path.join(projectRoot, 'src', 'data', 'profiles.json');

if (!fs.existsSync(profilesFile)) {
  fs.writeFileSync(profilesFile, JSON.stringify({}, null, 2));
}

interface UserProfile {
  bio: string;
  background: string | null;
  ownedBackgrounds?: string[];
}

export function getUserProfile(userId: string): UserProfile {
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

export function setUserBio(userId: string, bio: string): boolean {
  const data = fs.readFileSync(profilesFile, 'utf8');
  const profiles = JSON.parse(data);
  
  if (!profiles[userId]) {
    profiles[userId] = { bio: '', background: null };
  }
  
  profiles[userId].bio = bio;
  fs.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));
  
  return true;
}

export function setUserBackground(userId: string, backgroundName: string): boolean {
  const data = fs.readFileSync(profilesFile, 'utf8');
  const profiles = JSON.parse(data);
  
  if (!profiles[userId]) {
    profiles[userId] = { bio: 'A mysterious cowboy wandering the Wild West...', background: null };
  }
  
  profiles[userId].background = backgroundName;
  fs.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));
  
  return true;
}

export function setUserProfile(userId: string, profile: UserProfile): boolean {
  const data = fs.readFileSync(profilesFile, 'utf8');
  const profiles = JSON.parse(data);
  
  profiles[userId] = profile;
  fs.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));
  
  return true;
}
