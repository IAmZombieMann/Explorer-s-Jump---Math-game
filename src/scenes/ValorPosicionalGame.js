import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import { AudioManager } from '../utils/AudioManager.js';

export class ValorPosicionalGame extends Phaser.Scene {
    constructor() {
        super('ValorPosicionalGame');
    }

    init() {
        this.conteoActual = { centenas: 0, decenas: 0, unidades: 0 };
        this.piezasEnZona = []; // Array para rastrear visualmente las piezas soltadas
    }

    create() {
        const { width, height } = this.scale;
        this.audio = new AudioManager(this);

        // 1. Fondo y Botón de Regresar (Escalable para mobile)
        this.add.rectangle(width/2, height/2, width, height, 0x2c3e50);
        
        const btnHome = this.add.text(20, 20, '🏠 MENÚ', { 
            fontSize: '24px', backgroundColor: '#e74c3c', padding: { x: 10, y: 5 } 
        }).setInteractive();
        btnHome.on('pointerdown', () => this.scene.start('MainMenu'));

        // 2. Zona de Depósito (La Máquina)
        this.zonaX = width * 0.7;
        this.zonaY = height * 0.5;
        
        const baseMaqui = this.add.graphics();
        baseMaqui.fillStyle(0xffffff, 0.05);
        baseMaqui.fillRoundedRect(this.zonaX - 160, this.zonaY - 160, 320, 320, 20);
        baseMaqui.lineStyle(4, 0x3498db);
        baseMaqui.strokeRoundedRect(this.zonaX - 160, this.zonaY - 160, 320, 320, 20);

        // 3. Texto del Número Objetivo (Encima de todo)
        this.numeroObjetivo = Phaser.Math.Between(10, 150);
        this.uiTexto = this.add.text(width / 2, 50, `¡Construye el número ${this.numeroObjetivo}!`, {
            fontSize: '40px', fontFamily: 'Arial Black', fill: '#f1c40f', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(100);

        // 4. Generadores de Piezas (Lado izquierdo)
        this.crearGeneradorPiezas(120, height * 0.25, 'centena', 'CENTENAS');
        this.crearGeneradorPiezas(120, height * 0.55, 'decena', 'DECENAS');
        this.crearGeneradorPiezas(120, height * 0.85, 'unidad', 'UNIDADES');

        // 5. Configuración de Drag and Drop
        this.setupDragEvents();

        // 6. Botón de Comprobación
        this.createCheckButton(this.zonaX, height - 60);
    }

    crearGeneradorPiezas(x, y, tipo, etiqueta) {
        // Texto de etiqueta desplazado para que no lo tape la pieza
        this.add.text(x, y - 65, etiqueta, { 
            fontSize: '18px', fill: '#ffffff', fontWeight: 'bold', stroke: '#000', strokeThickness: 3 
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
            gameObject.setDepth(200); // Al arrastrar, siempre arriba
        });

        this.input.on('dragend', (pointer, gameObject) => {
            // Verificar si se soltó dentro de la caja azul
            if (gameObject.x > this.zonaX - 160 && gameObject.x < this.zonaX + 160 &&
                gameObject.y > this.zonaY - 160 && gameObject.y < this.zonaY + 160) {
                
                this.sumarPieza(gameObject.getData('tipo'), gameObject.x, gameObject.y);
                
                // Efecto de "clonar" la pieza en la zona y resetear el generador
                gameObject.x = gameObject.getData('startX');
                gameObject.y = gameObject.getData('startY');
                gameObject.setDepth(10);
            } else {
                // Vuelve a su lugar si se suelta fuera
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
        this.conteoActual[tipo + 's']++; // unidades, decenas, centenas
        this.audio.hablar(tipo);

        // Crear una copia visual que se queda en la zona
        const copia = this.add.image(x, y, tipo).setScale(0.8).setDepth(50);
        this.piezasEnZona.push(copia);

        // Pequeña animación de entrada
        this.tweens.add({ targets: copia, scale: 1, duration: 100 });
    }

    createCheckButton(x, y) {
        const btn = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, 260, 70, 0x2ecc71, 1).setInteractive();
        const txt = this.add.text(0, 0, '¡COMPROBAR!', { 
            fontSize: '28px', fontFamily: 'Arial Black', fill: '#fff' 
        }).setOrigin(0.5);
        
        btn.add([bg, txt]);
        btn.setDepth(100);

        bg.on('pointerdown', () => this.verificarResultado());
    }

    verificarResultado() {
        const total = (this.conteoActual.centenas * 100) + (this.conteoActual.decenas * 10) + this.conteoActual.unidades;

        if (total === this.numeroObjetivo) {
            this.audio.hablar("¡Excelente! Es el número correcto.");
            this.uiTexto.setText('¡LO LOGRASTE!');
            this.time.delayedCall(2000, () => this.scene.restart());
        } else {
            this.audio.hablar(`Llevas ${total}. Intenta de nuevo.`);
            this.cameras.main.shake(250, 0.01);
            
            // Limpiar zona visual tras error para reintentar
            this.piezasEnZona.forEach(p => p.destroy());
            this.init(); 
            this.uiTexto.setText(`¡Construye el número ${this.numeroObjetivo}!`);
        }
    }
}