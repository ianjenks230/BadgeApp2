const fs = require('fs');
const { createCanvas } = require('canvas');

function createBadgePlaceholder(text, color, filename) {
    // Create a 200x200 canvas
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 200, 200);

    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Wrap text if needed
    const words = text.split(' ');
    let y = 100;
    if (words.length > 1) {
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            if (currentLine.length + words[i].length < 15) {
                currentLine += " " + words[i];
            } else {
                lines.push(currentLine);
                currentLine = words[i];
            }
        }
        lines.push(currentLine);
        
        lines.forEach((line, index) => {
            const offset = (lines.length - 1) * 15;
            ctx.fillText(line, 100, y - offset + (index * 30));
        });
    } else {
        ctx.fillText(text, 100, y);
    }

    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`badges/${filename}`, buffer);
}

// Create Ozpert badges
createBadgePlaceholder('Bronze', '#CD7F32', 'ozpert-bronze.png');
createBadgePlaceholder('Silver', '#C0C0C0', 'ozpert-silver.png');
createBadgePlaceholder('Gold', '#FFD700', 'ozpert-gold.png');
createBadgePlaceholder('Diamond', '#B9F2FF', 'ozpert-diamond.png');

// Create Core Values badges
createBadgePlaceholder('Be Positive', '#4CAF50', 'be-positive.png');
createBadgePlaceholder('Empathize', '#2196F3', 'empathize.png');
createBadgePlaceholder('Evolve Constantly', '#9C27B0', 'evolve-constantly.png');
createBadgePlaceholder('Focus on Outcome', '#FF9800', 'focus-on-outcome.png');
createBadgePlaceholder('We Succeed as a Team', '#E91E63', 'succeed-as-team.png');