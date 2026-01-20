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

bubbles.forEach(bubble => {
    // Initial random position
    bubble.style.left = `${Math.random() * (window.innerWidth - 150)}px`;
    bubble.style.top = `${Math.random() * (window.innerHeight - 150)}px`;

    let vx = (Math.random() - 0.5) * 4;
    let vy = (Math.random() - 0.5) * 4;

    function animate() {
        let x = parseFloat(bubble.style.left);
        let y = parseFloat(bubble.style.top);

        x += vx;
        y += vy;

        if (x <= 0 || x >= window.innerWidth - 150) {
            vx *= -1;
        }
        if (y <= 0 || y >= window.innerHeight - 150) {
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
