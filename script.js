class CardCarousel {
    constructor(containerId, trackId) {
        this.container = document.getElementById(containerId);
        this.track = document.getElementById(trackId);
        this.cards = [];
        this.currentIndex = 0;
        this.isDragging = false;
        this.startX = 0;
        this.lastX = 0;
        this.velocity = 0;
        this.animationFrameId = null;
        this.accumulatedDrag = 0; // Accumule le drag jusqu'au seuil
        
        // Configuration
        this.cardImage = 'cartes/mystiques/Carte_test.png';
        this.numCards = 5; // Nombre de cartes à créer
        this.dragSensitivity = 5; // Sensibilité du drag (plus élevé = plus lent)
        this.dragThreshold = 80; // Distance en pixels pour faire défiler une carte
        
        this.init();
    }

    init() {
        this.createCards();
        this.setupEventListeners();
        this.updateCarousel();
    }

    createCards() {
        // Créer les cartes
        for (let i = 0; i < this.numCards; i++) {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = i;
            card.innerHTML = `<img src="${this.cardImage}" alt="Carte ${i + 1}" />`;
            this.track.appendChild(card);
            this.cards.push(card);
        }

        // Mettre à jour le nombre total
        document.getElementById('totalCards').textContent = this.numCards;
    }

    setupEventListeners() {
        // Événements souris
        this.container.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));

        // Événements tactiles (pour mobile)
        this.container.addEventListener('touchstart', (e) => this.onTouchStart(e));
        document.addEventListener('touchmove', (e) => this.onTouchMove(e));
        document.addEventListener('touchend', (e) => this.onTouchEnd(e));

        // Événements clavier
        document.addEventListener('keydown', (e) => this.onKeyDown(e));

        // Empêcher la sélection
        this.container.addEventListener('dragstart', (e) => e.preventDefault());
    }

    onMouseDown(e) {
        this.isDragging = true;
        this.startX = e.clientX;
        this.lastX = e.clientX;
        this.accumulatedDrag = 0; // Réinitialiser à chaque début de drag
        this.container.classList.add('dragging');
        this.velocity = 0;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    onMouseMove(e) {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.lastX;
        this.accumulatedDrag += deltaX;
        this.lastX = e.clientX;

        // Snapping: avancer une carte seulement si le seuil est atteint
        const cardsToMove = Math.floor(Math.abs(this.accumulatedDrag) / this.dragThreshold);
        if (cardsToMove > 0) {
            const direction = this.accumulatedDrag > 0 ? -1 : 1;
            this.currentIndex += cardsToMove * direction;
            this.accumulatedDrag = this.accumulatedDrag % this.dragThreshold;
            this.updateCarousel();
        }
    }

    onMouseUp(e) {
        this.isDragging = false;
        this.container.classList.remove('dragging');

        // Appliquer l'inertie
        if (Math.abs(this.velocity) > 5) {
            this.applyInertia();
        }
    }

    onTouchStart(e) {
        this.isDragging = true;
        this.startX = e.touches[0].clientX;
        this.lastX = e.touches[0].clientX;
        this.accumulatedDrag = 0; // Réinitialiser à chaque début de drag
        this.container.classList.add('dragging');
        this.velocity = 0;
    }

    onTouchMove(e) {
        if (!this.isDragging) return;

        const deltaX = e.touches[0].clientX - this.lastX;
        this.accumulatedDrag += deltaX;
        this.lastX = e.touches[0].clientX;

        // Snapping: avancer une carte seulement si le seuil est atteint
        const cardsToMove = Math.floor(Math.abs(this.accumulatedDrag) / this.dragThreshold);
        if (cardsToMove > 0) {
            const direction = this.accumulatedDrag > 0 ? -1 : 1;
            this.currentIndex += cardsToMove * direction;
            this.accumulatedDrag = this.accumulatedDrag % this.dragThreshold;
            this.updateCarousel();
        }
    }

    onTouchEnd(e) {
        this.isDragging = false;
        this.container.classList.remove('dragging');

        if (Math.abs(this.velocity) > 5) {
            this.applyInertia();
        }
    }

    onKeyDown(e) {
        if (e.key === 'ArrowLeft') {
            this.currentIndex++;
            this.updateCarousel();
        } else if (e.key === 'ArrowRight') {
            this.currentIndex--;
            this.updateCarousel();
        }
    }

    applyInertia() {
        const deceleration = 0.95;
        let currentVelocity = this.velocity;

        const animate = () => {
            currentVelocity *= deceleration;

            if (Math.abs(currentVelocity) > 0.5) {
                const cardMovement = Math.sign(currentVelocity) * 0.1;
                this.currentIndex -= cardMovement;
                this.updateCarousel();
                this.animationFrameId = requestAnimationFrame(animate);
            } else {
                // Arrêter sur la carte entière la plus proche
                this.currentIndex = Math.round(this.currentIndex);
                this.updateCarousel();
            }
        };

        this.animationFrameId = requestAnimationFrame(animate);
    }

    updateCarousel() {
        // Normaliser l'index (boucle infinie)
        this.currentIndex = ((this.currentIndex % this.numCards) + this.numCards) % this.numCards;

        // Mettre à jour l'affichage du numéro de carte
        document.getElementById('currentCard').textContent = this.currentIndex + 1;

        // Mettre à jour chaque carte
        this.cards.forEach((card, index) => {
            const distance = this.getCardDistance(index);
            const xPosition = distance * 120; // 120px d'espacement entre les cartes

            // Réinitialiser les classes
            card.classList.remove('active', 'side', 'far', 'very-far');

            // Ajouter la bonne classe selon la distance
            if (distance === 0) {
                card.classList.add('active');
            } else if (Math.abs(distance) === 1) {
                card.classList.add('side');
            } else if (Math.abs(distance) === 2) {
                card.classList.add('far');
            } else {
                card.classList.add('very-far');
            }

            // Appliquer la transformation
            const scale = this.getScale(distance);
            const yOffset = this.getYOffset(distance);
            const opacity = this.getOpacity(distance);
            const zIndex = 50 - Math.abs(distance) * 10;

            card.style.transform = `translateX(${xPosition}px) translateY(${yOffset}px) scale(${scale})`;
            card.style.opacity = opacity;
            card.style.zIndex = zIndex;
        });
    }

    getCardDistance(index) {
        // Calculer la distance par rapport à la carte active (modulo pour la boucle)
        const distance = index - this.currentIndex;
        const absDistance = Math.abs(distance);
        const shortestDistance = Math.min(absDistance, this.numCards - absDistance);

        // Déterminer la direction (gauche ou droite)
        let finalDistance;
        if (distance > 0 && distance > this.numCards / 2) {
            // Carte à gauche (wraparound)
            finalDistance = -(this.numCards - distance);
        } else if (distance < 0 && distance < -this.numCards / 2) {
            // Carte à droite (wraparound)
            finalDistance = this.numCards + distance;
        } else if (distance > 0) {
            // Carte à droite
            finalDistance = distance;
        } else {
            // Carte à gauche
            finalDistance = distance;
        }

        return finalDistance;
    }

    getScale(distance) {
        const absDistance = Math.abs(distance);
        if (absDistance === 0) return 1;
        if (absDistance === 1) return 0.85;
        if (absDistance === 2) return 0.7;
        return 0.6;
    }

    getYOffset(distance) {
        const absDistance = Math.abs(distance);
        if (absDistance === 0) return 0;
        if (absDistance === 1) return 20;
        if (absDistance === 2) return 40;
        return 60;
    }

    getOpacity(distance) {
        const absDistance = Math.abs(distance);
        if (absDistance === 0) return 1;
        if (absDistance === 1) return 0.6;
        if (absDistance === 2) return 0.3;
        return 0;
    }

    // Méthode pour changer le nombre de cartes
    setCardCount(count) {
        // Vider le track
        this.track.innerHTML = '';
        this.cards = [];
        this.numCards = count;
        this.currentIndex = 0;

        // Recréer les cartes
        this.createCards();
        this.updateCarousel();
    }

    // Méthode pour changer l'image des cartes
    setCardImage(imagePath) {
        this.cardImage = imagePath;
        this.cards.forEach((card, index) => {
            card.innerHTML = `<img src="${imagePath}" alt="Carte ${index + 1}" />`;
        });
    }
}

// Initialiser le carrousel au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const carousel = new CardCarousel('carouselContainer', 'carouselTrack');

    // Vous pouvez modifier le nombre de cartes ou l'image via :
    // carousel.setCardCount(8); // Changer à 8 cartes
    // carousel.setCardImage('chemin/vers/autre/image.png');
});
