document.addEventListener('DOMContentLoaded', () => {
    const bubbles = document.querySelectorAll('.bubble');
    const bubbleColors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c'];

    // Shuffle colors to ensure variety
    for (let i = bubbleColors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bubbleColors[i], bubbleColors[j]] = [bubbleColors[j], bubbleColors[i]];
    }

    bubbles.forEach((bubble, index) => {
        const size = Math.random() * 80 + 120; // Size between 120px and 200px
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.backgroundColor = bubbleColors[index % bubbleColors.length];

        // This page doesn't have the main bubble container, so we adjust positioning relative to the body
        const body = document.querySelector('body');
        body.style.overflow = 'hidden'; // Prevent scrollbars from the animation

        // Initial random position
        bubble.style.position = 'absolute';
        bubble.style.left = `${Math.random() * (window.innerWidth - size)}px`;
        bubble.style.top = `${Math.random() * (window.innerHeight - size)}px`;

        let vx = (Math.random() - 0.5) * 4;
        let vy = (Math.random() - 0.5) * 4;

        function animate() {
            let x = parseFloat(bubble.style.left);
            let y = parseFloat(bubble.style.top);

            x += vx;
            y += vy;

            if (x <= 0 || x >= window.innerWidth - size) {
                vx *= -1;
            }
            if (y <= 0 || y >= window.innerHeight - size) {
                vy *= -1;
            }

            bubble.style.left = `${x}px`;
            bubble.style.top = `${y}px`;

            requestAnimationFrame(animate);
        }

        animate();
    });
});
