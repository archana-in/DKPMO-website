const bubbleContainer = document.getElementById('bubble-container');
const bubbles = document.querySelectorAll('.bubble');
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close-button');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');

const content = {
    consultancy: {
        title: 'Consultancy',
        body: 'This is the consultancy page. We offer expert advice in various fields.'
    },
    'online-services': {
        title: 'Online Services',
        body: 'Explore our wide range of online services designed to help your business grow.'
    },
    games: {
        title: 'Games',
        body: 'Check out our fun and interactive games.'
    },
    about: {
        title: 'About Us',
        body: 'Learn more about DKPMO and our mission.'
    },
    contact: {
        title: 'Contact',
        body: 'Get in touch with us through our contact page.'
    }
};

const bubbleColors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c'];

// Shuffle colors to ensure variety
for (let i = bubbleColors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bubbleColors[i], bubbleColors[j]] = [bubbleColors[j], bubbleColors[i]];
}

bubbles.forEach((bubble, index) => {
    const size = Math.random() * 100 + 100; // Size between 100px and 200px
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.backgroundColor = bubbleColors[index % bubbleColors.length];

    // Initial random position
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

    bubble.addEventListener('click', () => {
        const contentKey = bubble.getAttribute('data-content');
        if (contentKey === 'games') {
            window.location.href = 'games.html';
        } else {
            modalTitle.textContent = content[contentKey].title;
            modalBody.textContent = content[contentKey].body;
            modal.style.display = 'block';
        }
    });
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});
