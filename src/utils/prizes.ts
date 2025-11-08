export interface Prize {
  name: string;
  value: string;
  emoji: string;
}

const prizes: Prize[] = [
  { name: 'Grand Prize', value: '$1000', emoji: '🏆' },
  { name: 'Gold Coins', value: '500 Coins', emoji: '🪙' },
  { name: 'Diamond', value: '100 Gems', emoji: '💎' },
  { name: 'Treasure Chest', value: '$500', emoji: '🎁' },
  { name: 'Magic Potion', value: '+50 HP', emoji: '🧪' },
  { name: 'Lucky Star', value: '$250', emoji: '⭐' },
  { name: 'Golden Key', value: 'Unlock Special Level', emoji: '🔑' },
  { name: 'Fire Sword', value: '+25 Attack', emoji: '⚔️' },
  { name: 'Shield', value: '+25 Defense', emoji: '🛡️' },
  { name: 'Crown', value: '$100', emoji: '👑' },
];

export function getRandomPrize(): Prize {
  return prizes[Math.floor(Math.random() * prizes.length)];
}
