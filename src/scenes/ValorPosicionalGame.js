import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import { AudioManager } from '../utils/AudioManager.js';

export class ValorPosicionalGame extends Phaser.Scene {
    constructor() {
        super('ValorPosicionalGame');
    }

    init() {
        this.conteoActual = { centenas: 0, decenas: 0, unidades: 0 };
        this.piezasVisuales = []; 
    }

    create() {
        const { width, height } = this.scale;
        this.audio = new AudioManager(this);

        // 1. Fondo Oscuro para resaltar el neón
        this.add.rectangle(width/2, height/2, width, height, 0x1a1a2e).setDepth(0);
        
        // 2. BOTÓN VOLVER (Esquina superior izquierda, tamaño pequeño)
        const btnVolver = this.add.container(70, 40).setDepth(1000);
        const bgVolver = this.add.rectangle(0, 0, 110, 40, 0xe74c3c).setInteractive();
        const txtVolver = this.add.text(0, 0, '← VOLVER', { fontSize: '16px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        btnVolver.add([bgVolver, txtVolver]);
        bgVolver.on('pointerdown', () => this.scene.start('MainMenu'));

        // 3. ZONA DE DEPÓSITO (Caja derecha)
        this.zonaX = width * 0.7;
        this.zonaY = height * 0.5;
        const baseMaqui = this.add.graphics().setDepth(1);
        baseMaqui.fillStyle(0xffffff, 0.05);
        baseMaqui.fillRoundedRect(this.zonaX - 140, this.zonaY - 140, 280, 280, 15);
        baseMaqui.lineStyle(3, 0x3498db);
        baseMaqui.strokeRoundedRect(this.zonaX - 140, this.zonaY - 140, 280, 280, 15);

        // 4. TEXTO OBJETIVO (Pequeño y arriba)
        this.numeroObjetivo = Phaser.Math.Between(10, 150);
        this.uiTexto = this.add.text(width / 2, 40, `CONSTRUYE: ${this.numeroObjetivo}`, {
            fontSize: '32px', fontFamily: 'Arial Black', fill: '#f1c40f', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(1000);

        // 5. GENERADORES (Piezas más pequeñas y etiquetas claras)
        // Reducimos la escala de las piezas originales para que no tapen el texto
        this.crearGenerador(100, height * 0.25, 'centena', 'CENTENAS', 0.6);
        this.crearGenerador(100, height * 0.52, 'decena', 'DECENAS', 0.6);
        this.crearGenerador(100, height * 0.82, 'unidad', 'UNIDADES', 0.6);

        this.setupDragEvents();

        // 6. BOTÓN COMPROBAR (Debajo de la caja)
        this.createCheckButton(this.zonaX, height - 60);
    }

    crearGenerador(x, y, tipo, etiqueta, escala) {
        // Texto etiqueta arriba de la pieza
        this.add.text(x, y - 50, etiqueta, { 
            fontSize: '14px', fill: '#fff', fontWeight: 'bold' 
        }).setOrigin(0.5).setDepth(100);
        
        const pieza = this.add.image(x, y, tipo).setInteractive({ draggable: true });
        pieza.setScale(escala); 
        pieza.setData('tipo', tipo);
        pieza.setData('startX', x);
        pieza.setData('startY', y);
        pieza.setData('escalaOriginal', escala);
        pieza.setDepth(500); // Los generadores siempre visibles arriba
    }

    setupDragEvents() {
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            gameObject.setDepth(2000); // Al arrastrar vuela sobre todo
        });

        this.input.on('dragend', (pointer, gameObject) => {
            // Verificar límites de la caja derecha
            if (gameObject.x > this.zonaX - 140 && gameObject.x < this.zonaX + 140 &&
                gameObject.y > this.zonaY - 140 && gameObject.y < this.zonaY + 140) {
                
                this.sumarPieza(gameObject.getData('tipo'), gameObject.x, gameObject.y);
                
                // Reset inmediato de la pieza al generador
                gameObject.x = gameObject.getData('startX');
                gameObject.y = gameObject.getData('startY');
                gameObject.setDepth(500);
            } else {
                // Si falla, vuelve suave
                this.tweens.add({
                    targets: gameObject,
                    x: gameObject.getData('startX'),
                    y: gameObject.getData('startY'),
                    duration: 200,
                    ease: 'Power2'
                });
            }
        });
    }

    sumarPieza(tipo, x, y) {
        this.conteoActual[tipo + 's']++;
        this.audio.hablar(tipo);

        // CREAR LA COPIA QUE SE QUEDA (Depth alto para que se vea sobre el fondo)
        const copia = this.add.image(x, y, tipo).setScale(0.5).setDepth(100);
        this.piezasVisuales.push(copia);
        
        // Animación de "estampado"
        this.tweens.add({ targets: copia, scale: 0.6, duration: 100, yoyo: true });
    }

    createCheckButton(x, y) {
        const container = this.add.container(x, y).setDepth(1000);
        const bg = this.add.rectangle(0, 0, 200, 50, 0x2ecc71).setInteractive();
        const txt = this.add.text(0, 0, 'COMPROBAR', { fontSize: '20px', fontWeight: 'bold', fill: '#fff' }).setOrigin(0.5);
        container.add([bg, txt]);

        bg.on('pointerdown', () => {
            const total = (this.conteoActual.centenas * 100) + (this.conteoActual.decenas * 10) + this.conteoActual.unidades;
            if (total === this.numeroObjetivo) {
                this.audio.hablar("¡Correcto!");
                this.uiTexto.setText("¡MUY BIEN!");
                this.time.delayedCall(1500, () => this.scene.restart());
            } else {
                this.audio.hablar(`Llevas ${total}. Intenta de nuevo.`);
                this.cameras.main.shake(200, 0.01);
                this.limpiarCaja();
            }
        });
    }

    limpiarCaja() {
        this.piezasVisuales.forEach(p => p.destroy());
        this.piezasVisuales = [];
        this.conteoActual = { centenas: 0, decenas: 0, unidades: 0 };
    }
}