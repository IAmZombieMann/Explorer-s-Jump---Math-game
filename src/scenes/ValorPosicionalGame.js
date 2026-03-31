import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import { AudioManager } from '../utils/AudioManager.js';

export class ValorPosicionalGame extends Phaser.Scene {
    constructor() {
        super('ValorPosicionalGame');
    }

    init() {
        this.conteoActual = { centenas: 0, decenas: 0, unidades: 0 };
        this.piezasVisuales = []; // Para limpiar las piezas al reiniciar
    }

    create() {
        const { width, height } = this.scale;
        this.audio = new AudioManager(this);

        // 1. Fondo y Botón Regresar (Añadido)
        this.add.rectangle(width/2, height/2, width, height, 0x2c3e50);
        
        const btnHome = this.add.text(20, 20, '🏠 VOLVER', { 
            fontSize: '20px', backgroundColor: '#e74c3c', padding: { x: 10, y: 5 } 
        }).setInteractive();
        btnHome.on('pointerdown', () => this.scene.start('MainMenu'));

        // 2. Zona de Depósito (Visualmente más clara)
        this.zonaX = width * 0.7;
        this.zonaY = height * 0.5;
        
        const baseMaqui = this.add.graphics();
        baseMaqui.fillStyle(0xffffff, 0.05);
        baseMaqui.fillRoundedRect(this.zonaX - 160, this.zonaY - 160, 320, 320, 20);
        baseMaqui.lineStyle(4, 0x3498db);
        baseMaqui.strokeRoundedRect(this.zonaX - 160, this.zonaY - 160, 320, 320, 20);

        // 3. Texto del Objetivo (Con profundidad alta para que no se tape)
        this.numeroObjetivo = Phaser.Math.Between(10, 150);
        this.uiTexto = this.add.text(width / 2, 60, `¡Construye el número ${this.numeroObjetivo}!`, {
            fontSize: '40px', fontFamily: 'Arial Black', fill: '#f1c40f', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(100);

        // 4. Generadores (Ajustamos espacio para que el texto sea legible)
        this.crearGenerador(120, height * 0.25, 'centena', 'CENTENAS');
        this.crearGenerador(120, height * 0.55, 'decena', 'DECENAS');
        this.crearGenerador(120, height * 0.85, 'unidad', 'UNIDADES');

        // 5. Configuración de Arrastre
        this.setupDragEvents();

        // 6. Botón Comprobar
        this.createCheckButton(this.zonaX, height - 70);
    }

    crearGenerador(x, y, tipo, etiqueta) {
        // Texto movido más arriba de la pieza
        this.add.text(x, y - 65, etiqueta, { 
            fontSize: '18px', fill: '#fff', stroke: '#000', strokeThickness: 3 
        }).setOrigin(0.5);
        
        const pieza = this.add.image(x, y, tipo).setInteractive({ draggable: true });
        pieza.setData('tipo', tipo);
        pieza.setData('startX', x);
        pieza.setData('startY', y);
        pieza.setDepth(10);
    }

    setupDragEvents() {
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            gameObject.setDepth(200); // Siempre encima mientras se arrastra
        });

        this.input.on('dragend', (pointer, gameObject) => {
            // Verificar si entró en el cuadro azul
            if (gameObject.x > this.zonaX - 160 && gameObject.x < this.zonaX + 160 &&
                gameObject.y > this.zonaY - 160 && gameObject.y < this.zonaY + 160) {
                
                this.sumarPieza(gameObject.getData('tipo'), gameObject.x, gameObject.y);
                
                // Efecto: la pieza original vuelve a su generador instantáneamente
                gameObject.x = gameObject.getData('startX');
                gameObject.y = gameObject.getData('startY');
                gameObject.setDepth(10);
            } else {
                // Si se suelta fuera, vuelve con animación
                this.tweens.add({
                    targets: gameObject,
                    x: gameObject.getData('startX'),
                    y: gameObject.getData('startY'),
                    duration: 300,
                    ease: 'Back.easeOut'
                });
            }
        });
    }

    sumarPieza(tipo, x, y) {
        this.conteoActual[tipo + 's']++;
        this.audio.hablar(tipo);

        // CREAR COPIA VISUAL EN LA CAJA
        // Añadimos una variación aleatoria pequeña para que no queden todas una encima de otra
        const randomX = x + Phaser.Math.Between(-10, 10);
        const randomY = y + Phaser.Math.Between(-10, 10);
        
        const copia = this.add.image(randomX, randomY, tipo).setScale(0.8).setDepth(5);
        this.piezasVisuales.push(copia);
    }

    createCheckButton(x, y) {
        const container = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, 240, 70, 0x2ecc71).setInteractive();
        const txt = this.add.text(0, 0, '¡COMPROBAR!', { fontSize: '28px', fill: '#fff' }).setOrigin(0.5);
        container.add([bg, txt]).setDepth(100);

        bg.on('pointerdown', () => this.verificar());
    }

    verificar() {
        const total = (this.conteoActual.centenas * 100) + (this.conteoActual.decenas * 10) + this.conteoActual.unidades;

        if (total === this.numeroObjetivo) {
            this.audio.hablar("¡Excelente! Has formado el " + total);
            this.uiTexto.setText('¡CORRECTO!');
            this.time.delayedCall(2000, () => this.scene.restart());
        } else {
            this.audio.hablar("Llevas " + total + ". Intenta de nuevo.");
            this.cameras.main.shake(250, 0.01);
            
            // Opcional: Limpiar todo tras error para no confundir al niño
            this.piezasVisuales.forEach(p => p.destroy());
            this.init();
            this.uiTexto.setText(`¡Construye el número ${this.numeroObjetivo}!`);
        }
    }
}