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

        // 1. Fondo
        this.add.rectangle(width/2, height/2, width, height, 0x1a1a2e).setDepth(0);
        
        // 2. BOTÓN VOLVER
        const btnVolver = this.add.container(70, 40).setDepth(1000);
        const bgVolver = this.add.rectangle(0, 0, 110, 40, 0xe74c3c).setInteractive();
        const txtVolver = this.add.text(0, 0, '← VOLVER', { fontSize: '16px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        btnVolver.add([bgVolver, txtVolver]);
        bgVolver.on('pointerdown', () => this.scene.start('MainMenu'));

        // 3. ZONA DE DEPÓSITO
        this.zonaX = width * 0.7;
        this.zonaY = height * 0.5;
        this.limitesCaja = {
            xMin: this.zonaX - 140, xMax: this.zonaX + 140,
            yMin: this.zonaY - 140, yMax: this.zonaY + 140
        };

        const baseMaqui = this.add.graphics().setDepth(1);
        baseMaqui.fillStyle(0xffffff, 0.05);
        baseMaqui.fillRoundedRect(this.limitesCaja.xMin, this.limitesCaja.yMin, 280, 280, 15);
        baseMaqui.lineStyle(3, 0x3498db);
        baseMaqui.strokeRoundedRect(this.limitesCaja.xMin, this.limitesCaja.yMin, 280, 280, 15);

        // 4. TEXTO OBJETIVO
        this.numeroObjetivo = Phaser.Math.Between(10, 150);
        this.uiTexto = this.add.text(width / 2, 40, `CONSTRUYE: ${this.numeroObjetivo}`, {
            fontSize: '32px', fontFamily: 'Arial Black', fill: '#f1c40f', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(1000);

        // 5. GENERADORES
        this.crearGenerador(100, height * 0.25, 'centena', 'CENTENAS');
        this.crearGenerador(100, height * 0.52, 'decena', 'DECENAS');
        this.crearGenerador(100, height * 0.82, 'unidad', 'UNIDADES');

        // 6. EVENTOS DE ARRASTRE (DRAG)
        this.setupDragEvents();

        // 7. BOTÓN COMPROBAR
        this.createCheckButton(this.zonaX, height - 60);
    }

    crearGenerador(x, y, tipo, etiqueta) {
        this.add.text(x, y - 50, etiqueta, { fontSize: '14px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5).setDepth(100);
        const pieza = this.add.image(x, y, tipo).setInteractive({ draggable: true });
        pieza.setScale(0.6); 
        pieza.setData('tipo', tipo);
        pieza.setData('esGenerador', true);
        pieza.setData('startX', x);
        pieza.setData('startY', y);
        pieza.setDepth(500);
    }

    setupDragEvents() {
        // Evento de movimiento
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            gameObject.setDepth(2000); // Siempre encima al mover
        });

        // Evento de soltar
        this.input.on('dragend', (pointer, gameObject) => {
            const estaEnCaja = (gameObject.x > this.limitesCaja.xMin && gameObject.x < this.limitesCaja.xMax &&
                               gameObject.y > this.limitesCaja.yMin && gameObject.y < this.limitesCaja.yMax);

            if (gameObject.getData('esGenerador')) {
                // Si es del generador y cae en la caja, creamos copia
                if (estaEnCaja) {
                    this.crearCopiaEnCaja(gameObject.getData('tipo'), gameObject.x, gameObject.y);
                }
                // El generador siempre vuelve a su sitio
                gameObject.x = gameObject.getData('startX');
                gameObject.y = gameObject.getData('startY');
                gameObject.setDepth(500);
            } else {
                // Si es una copia y la sacan de la caja, se elimina
                if (!estaEnCaja) {
                    this.eliminarPieza(gameObject);
                } else {
                    gameObject.setDepth(100); // Se queda en su nueva posición dentro
                }
            }
        });
    }

    crearCopiaEnCaja(tipo, x, y) {
        this.conteoActual[tipo + 's']++;
        this.audio.hablar(tipo);

        // CRÍTICO: Aquí activamos el drag para la nueva pieza
        const copia = this.add.image(x, y, tipo).setScale(0.6).setInteractive({ draggable: true });
        copia.setDepth(100);
        copia.setData('tipo', tipo);
        copia.setData('esGenerador', false);
        
        this.piezasVisuales.push(copia);
    }

    eliminarPieza(pieza) {
        const tipo = pieza.getData('tipo');
        this.conteoActual[tipo + 's']--;
        
        this.tweens.add({
            targets: pieza,
            alpha: 0,
            scale: 0,
            duration: 200,
            onComplete: () => {
                this.piezasVisuales = this.piezasVisuales.filter(p => p !== pieza);
                pieza.destroy();
            }
        });
    }

    createCheckButton(x, y) {
        const container = this.add.container(x, y).setDepth(1000);
        const bg = this.add.rectangle(0, 0, 200, 50, 0x2ecc71).setInteractive();
        const txt = this.add.text(0, 0, 'COMPROBAR', { fontSize: '20px', fontWeight: 'bold', fill: '#fff' }).setOrigin(0.5);
        container.add([bg, txt]);

        bg.on('pointerdown', () => {
            const total = (this.conteoActual.centenas * 100) + (this.conteoActual.decenas * 10) + this.conteoActual.unidades;
            if (total === this.numeroObjetivo) {
                this.audio.hablar("¡Excelente!");
                this.scene.restart();
            } else {
                this.audio.hablar(`Llevas ${total}.`);
                this.cameras.main.shake(200, 0.01);
            }
        });
    }
}