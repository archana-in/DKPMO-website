document.addEventListener('DOMContentLoaded', () => {
    const bubbles = document.querySelectorAll('.bubble');
    const bubbleColors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c'];

    bubbles.forEach(bubble => {
        const size = Math.random() * 80 + 120; // Size between 120px and 200px
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.backgroundColor = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
        
        // Since this page doesn't have the bouncing animation, we don't need the rest of the logic from script.js
    });
});
