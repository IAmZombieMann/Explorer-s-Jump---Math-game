import Phaser from 'https://esm.run/phaser';
import { AudioManager } from '../utils/AudioManager.js';

export class ValorPosicionalGame extends Phaser.Scene {
    constructor() {
        super('ValorPosicionalGame');
    }

    init() {
        // Reset de conteo cada vez que inicia el nivel
        this.conteoActual = { centenas: 0, decenas: 0, unidades: 0 };
    }

    create() {
        const { width, height } = this.scale;
        this.audio = new AudioManager(this);

        // 1. Fondo
        this.add.rectangle(width/2, height/2, width, height, 0x2c3e50);
        
        // 2. Zona de Depósito (Visual)
        const zonaX = width * 0.7;
        const zonaY = height * 0.5;
        
        const baseMaqui = this.add.graphics();
        baseMaqui.fillStyle(0xffffff, 0.1);
        baseMaqui.fillRoundedRect(zonaX - 150, zonaY - 150, 300, 300, 20);
        baseMaqui.lineStyle(4, 0x3498db);
        baseMaqui.strokeRoundedRect(zonaX - 150, zonaY - 150, 300, 300, 20);

        // 3. Número Objetivo
        this.numeroObjetivo = Phaser.Math.Between(10, 150);
        this.uiTexto = this.add.text(width / 2, 50, `¡Construye el número ${this.numeroObjetivo}!`, {
            fontSize: '36px', fontFamily: 'Arial Black', fill: '#f1c40f', align: 'center'
        }).setOrigin(0.5);

        // 4. Generadores de Piezas
        this.crearGeneradorPiezas(120, height * 0.25, 'centena', 'CENTENAS (100)');
        this.crearGeneradorPiezas(120, height * 0.50, 'decena', 'DECENAS (10)');
        this.crearGeneradorPiezas(120, height * 0.75, 'unidad', 'UNIDADES (1)');

        // 5. Configuración ÚNICA de Drags (Para evitar multiplicidad de eventos)
        this.setupDragEvents();

        // 6. Botón de Comprobación
        this.createCheckButton(zonaX, height - 80);
    }

    setupDragEvents() {
        // Evento cuando se mueve cualquier objeto arrastrable
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            gameObject.setDepth(100); // Que siempre esté por encima al arrastrar
        });

        // Evento cuando se suelta
        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setDepth(1);
            
            // Si el objeto se suelta dentro de la zona derecha (la máquina)
            if (gameObject.x > 450) {
                this.sumarPieza(gameObject.getData('tipo'));
                this.audio.playSFX('acierto_corto'); // Asumiendo que tienes este sonido
                
                this.tweens.add({
                    targets: gameObject,
                    scale: 0,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        // Lo devolvemos a su posición original de forma invisible para que actúe como nuevo spawn
                        gameObject.x = gameObject.getData('startX');
                        gameObject.y = gameObject.getData('startY');
                        gameObject.scale = 1.2;
                        gameObject.alpha = 1;
                    }
                });
            } else {
                // Si falla, vuelve suavemente a su sitio
                this.tweens.add({
                    targets: gameObject,
                    x: gameObject.getData('startX'),
                    y: gameObject.getData('startY'),
                    duration: 400,
                    ease: 'Back.easeOut'
                });
            }
        });
    }

    crearGeneradorPiezas(x, y, tipo, etiqueta) {
        this.add.text(x, y - 55, etiqueta, { fontSize: '14px', fill: '#ecf0f1', fontWeight: 'bold' }).setOrigin(0.5);
        
        const pieza = this.add.image(x, y, tipo).setInteractive({ draggable: true });
        pieza.setScale(1.2);
        
        // Guardamos metadatos en la pieza para saber qué es y de dónde vino
        pieza.setData('tipo', tipo);
        pieza.setData('startX', x);
        pieza.setData('startY', y);
    }

    createCheckButton(x, y) {
        const btn = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, 240, 70, 0x2ecc71, 1).setInteractive();
        const txt = this.add.text(0, 0, '¡COMPROBAR!', { 
            fontSize: '26px', fontFamily: 'Arial Black', fill: '#fff' 
        }).setOrigin(0.5);
        
        btn.add([bg, txt]);
        
        bg.on('pointerdown', () => {
            bg.setFillStyle(0x27ae60);
            this.verificarResultado();
        });
        bg.on('pointerup', () => bg.setFillStyle(0x2ecc71));
    }

    sumarPieza(tipo) {
        if (tipo === 'centena') this.conteoActual.centenas++;
        if (tipo === 'decena') this.conteoActual.decenas++;
        if (tipo === 'unidad') this.conteoActual.unidades++;
        
        this.audio.hablar(`Añadida una ${tipo}`);
    }

    verificarResultado() {
        const total = (this.conteoActual.centenas * 100) + (this.conteoActual.decenas * 10) + this.conteoActual.unidades;

        if (total === this.numeroObjetivo) {
            this.audio.hablar("¡Excelente! Has construido el número correctamente.");
            this.uiTexto.setText('¡LO LOGRASTE!');
            this.cameras.main.flash(500, 46, 204, 113); // Flash verde
            
            this.time.delayedCall(2500, () => this.scene.restart());
        } else {
            let mensaje = `Tienes ${total}. `;
            if (total < this.numeroObjetivo) mensaje += "¡Te falta un poco!";
            else mensaje += "¡Te pasaste!";
            
            this.audio.hablar(mensaje);
            this.uiTexto.setText(mensaje);
            this.cameras.main.shake(250, 0.01);
            
            // Opcional: Reiniciar conteo tras error para evitar confusión
            this.conteoActual = { centenas: 0, decenas: 0, unidades: 0 };
        }
    }
}