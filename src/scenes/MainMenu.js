import Phaser from 'https://esm.run/phaser';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const { width, height } = this.scale;

        // 1. Fondo - Aseguramos que cubra todo y esté centrado
        this.add.image(width / 2, height / 2, 'sky')
            .setDisplaySize(width, height)
            .setAlpha(0.5);

        // 2. Título con mejor escalado para móviles
        const titleSize = width < 600 ? '32px' : '48px'; 
        this.add.text(width / 2, 80, '¡AVENTURA MATEMÁTICA!', {
            fontSize: titleSize,
            fontFamily: 'Arial Black',
            fill: '#ffffff',
            stroke: '#2980b9',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // 3. Botones (Ajustamos posiciones para que no se peguen en pantallas pequeñas)
        const spacing = width < 800 ? width * 0.25 : 200;

        this.createMenuButton(
            width / 2 - spacing, 
            height / 2 + 50, 
            0x3498db, // Pasamos el número directamente
            'EL SALTO\nNUMÉRICO', 
            'Conteo de 2, 3 y 4', 
            () => this.scene.start('ConteoGame')
        );

        this.createMenuButton(
            width / 2 + spacing, 
            height / 2 + 50, 
            0x9b59b6, 
            'FÁBRICA DE\nCRISTALES', 
            'Unidades, Decenas...', 
            () => this.scene.start('ValorPosicionalGame')
        );

        // Mensaje inferior
        this.add.text(width / 2, height - 40, 'Toca una aventura para empezar', {
            fontSize: '18px',
            fill: '#ecf0f1',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    createMenuButton(x, y, color, title, subtitle, callback) {
        // Reducimos un poco el tamaño base para mayor compatibilidad mobile
        const cardWidth = 260; 
        const cardHeight = 300;

        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(color, 0.8);
        bg.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 20);
        bg.lineStyle(4, 0xffffff, 1);
        bg.strokeRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 20);

        const txtTitle = this.add.text(0, -20, title, {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            align: 'center',
            fill: '#fff'
        }).setOrigin(0.5);

        const txtSub = this.add.text(0, 60, subtitle, {
            fontSize: '14px',
            fill: '#f0f0f0',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        container.add([bg, txtTitle, txtSub]);

        // Área interactiva exacta al tamaño de la tarjeta
        const hitArea = new Phaser.Geom.Rectangle(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        // Feedback táctil mejorado
        container.on('pointerover', () => {
            this.tweens.add({ targets: container, scale: 1.05, duration: 200 });
        });
        
        container.on('pointerout', () => {
            this.tweens.add({ targets: container, scale: 1, duration: 200 });
        });

        container.on('pointerdown', () => {
            this.tweens.add({ targets: container, scale: 0.9, duration: 100, yoyo: true });
            this.time.delayedCall(200, callback);
        });
    }
}