import fs from 'fs';
import path from 'path';

const dir = 'src/components';
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace colors and borders
    content = content.replace(/bg-\[#161A23\]/g, 'bg-white/5');
    content = content.replace(/bg-\[#0D0E15\]/g, 'bg-[#0B0C10]');
    content = content.replace(/rounded-none/g, 'rounded-2xl');
    
    // Replace other specific hardcoded colors if needed (Optional)
    content = content.replace(/#8B5CF6/g, '#7000FF'); // Violet to Purple
    content = content.replace(/#06B6D4/g, '#00F0FF'); // Cyan
    content = content.replace(/#D946EF/g, '#FF007F'); // Pink

    fs.writeFileSync(filePath, content);
  }
}
console.log('Update complete!');
