const fs = require('fs');
const path = require('path');

const emojiMap = {
  '🛒': 'ShoppingCart',
  '🚴': 'Bike',
  '📍': 'MapPin',
  '❌': 'X',
  '✕': 'X',
  '💬': 'MessageSquare',
  '💭': 'MessageCircle',
  '🥗': 'Utensils',
  '⭐': 'Star',
  '⏳': 'Hourglass',
  '➤': 'ArrowRight',
  '✅': 'CheckCircle',
  '©': 'Copyright',
  '♥': 'Heart',
  '📏': 'Ruler',
  '🧭': 'Compass',
  '🏠': 'Home',
  '🗺️': 'Map',
  '🗺': 'Map',
  '⚡': 'Zap',
  '📡': 'Radio',
  '👨‍💼': 'Briefcase',
  '👨': 'User',
  '💼': 'Briefcase',
  '📋': 'Clipboard',
  '👤': 'User',
  '✓': 'Check',
  '📖': 'BookOpen',
  '🎯': 'Target',
  '🍽️': 'Utensils',
  '🍽': 'Utensils',
  '🍳': 'Utensils',
  '🍔': 'Utensils',
  '🍰': 'Utensils',
  '☕': 'Coffee',
  '🚚': 'Truck',
  '📱': 'Smartphone',
  '💎': 'Gem',
  '📞': 'Phone',
  '✉': 'Mail',
  '👥': 'Users',
  '🙏': 'Heart',
  '⚠': 'AlertTriangle',
  '💡': 'Lightbulb',
  '📝': 'FileText',
  '📦': 'Package',
  '🥟': 'Utensils',
  '🍖': 'Beef',
  '🍿': 'Popcorn',
  '🛍️': 'ShoppingBag',
  '🛍': 'ShoppingBag',
  '🔒': 'Lock',
  '🔄': 'RefreshCw',
  '📅': 'Calendar',
  '🔐': 'Lock',
  '💳': 'CreditCard',
  '🍝': 'Utensils',
  '💊': 'Pill',
  '🥑': 'Utensils',
  '🏪': 'Store',
  '💰': 'Banknote',
  '✔': 'Check',
  '✔✔': 'CheckCheck',
  '🚫': 'Ban',
  '📭': 'Mail',
  '📊': 'BarChart',
  '🔍': 'Search',
  '🕐': 'Clock',
  '👈': 'ArrowLeft',
  '📧': 'Mail',
  '🚪': 'LogOut',
  '🧑‍💼': 'Briefcase',
  '📈': 'TrendingUp',
  '🛡️': 'Shield',
  '🔧': 'Wrench',
  '💵': 'DollarSign'
};

const emojiRegex = new RegExp(Object.keys(emojiMap).sort((a,b) => b.length - a.length).map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let usedIcons = new Set();
  
  let newContent = content.replace(emojiRegex, (match) => {
    const iconName = emojiMap[match];
    usedIcons.add(iconName);
    return `<${iconName} size={18} className="inline-block mr-1" />`;
  });
  
  usedIcons.forEach(icon => {
    // For single quotes
    newContent = newContent.replace(new RegExp(`'\\<${icon} size=\\{18\\} className="inline-block mr-1" \\/\\>'`, 'g'), `<${icon} size={18} className="inline-block mr-1" />`);
    // For double quotes
    newContent = newContent.replace(new RegExp(`"\\<${icon} size=\\{18\\} className="inline-block mr-1" \\/\\>"`, 'g'), `<${icon} size={18} className="inline-block mr-1" />`);
  });

  if (usedIcons.size > 0 && filePath.endsWith('.jsx')) {
    const importStatement = `import { ${Array.from(usedIcons).join(', ')} } from 'lucide-react';\n`;
    newContent = importStatement + newContent;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file.startsWith('.')) continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.jsx')) {
      replaceInFile(fullPath);
    }
  }
}

processDir('./src');
