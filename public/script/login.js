document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
        card.querySelector('.flip-container').classList.toggle('hover');
    });
});
