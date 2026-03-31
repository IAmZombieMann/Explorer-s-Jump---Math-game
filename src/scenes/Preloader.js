import Phaser from 'https://esm.run/phaser';

export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        const { width, height } = this.cameras.main;

        // Establecer color de fondo de carga inmediatamente
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // 1. Interfaz de carga (Barra de progreso Estilizada)
        const progressBox = this.add.graphics();
        const progressBar = this.add.graphics();
        
        progressBox.fillStyle(0xffffff, 0.1);
        progressBox.fillRoundedRect(width/2 - 160, height/2 - 25, 320, 50, 10);

        const loadingText = this.add.text(width / 2, height / 2 - 60, 'Cargando aventura...', {
            font: '24px Arial Rounded MT Bold', 
            fill: '#ffffff'
        }).setOrigin(0.5);

        const percentText = this.add.text(width / 2, height / 2, '0%', {
            font: '18px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Evento de progreso con actualización de porcentaje
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x3498db, 1);
            progressBar.fillRoundedRect(width/2 - 150, height/2 - 15, 300 * value, 30, 5);
            percentText.setText(parseInt(value * 100) + '%');
        });

        // 2. Carga de Activos
        // Fondos y Sprites
        this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
        this.load.image('plataforma', 'https://labs.phaser.io/assets/sprites/platform.png');
        
        this.load.spritesheet('dude', 
            'https://labs.phaser.io/assets/sprites/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );

        // Limpiar eventos al terminar
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });
    }

    create() {
        // 3. Generación de Texturas Dinámicas (Valor Posicional)
        // Optimizamos las formas para que representen el concepto matemático
        
        // UNIDAD: Un cubo pequeño azul
        this.createBlockTexture('unidad', 0x3498db, 40, 40); 
        
        // DECENA: Una barra roja larga (representa 10 unidades pegadas)
        this.createBlockTexture('decena', 0xe74c3c, 40, 120); 
        
        // CENTENA: Un bloque verde grande (representa un cuadrado de 10x10)
        this.createBlockTexture('centena', 0x2ecc71, 100, 100); 

        // Una vez generadas las texturas, vamos al menú
        this.scene.start('MainMenu');
    }

    /**
     * Generador de texturas con bordes suaves para estilo Ludic Premium
     */
    createBlockTexture(key, color, w, h) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Sombra interna suave
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(0, 0, w, h, 8);
        
        // Borde brillante (Glassmorphism touch)
        graphics.lineStyle(3, 0xffffff, 0.5);
        graphics.strokeRoundedRect(2, 2, w - 4, h - 4, 8);
        
        graphics.generateTexture(key, w, h);
    }
}