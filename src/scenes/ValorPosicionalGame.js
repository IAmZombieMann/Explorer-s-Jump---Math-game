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

        // 1. FONDO LIMPIO
        this.add.rectangle(width/2, height/2, width, height, 0x1a1a2e).setDepth(0);
        
        // Estrellitas sutiles
        this.add.circle(width * 0.1, height * 0.1, 4, 0xffffff, 0.3).setDepth(0);
        this.add.circle(width * 0.9, height * 0.2, 6, 0xffffff, 0.2).setDepth(0);
        this.add.circle(width * 0.8, height * 0.8, 5, 0xffffff, 0.3).setDepth(0);
        this.add.circle(width * 0.2, height * 0.9, 7, 0xffffff, 0.2).setDepth(0);

        // 2. BOTÓN VOLVER
        const btnVolver = this.add.container(80, 50).setDepth(1000);
        const bgVolver = this.add.graphics({ fillStyle: { color: 0xe74c3c } });
        bgVolver.fillRoundedRect(-55, -20, 110, 40, 20); 
        bgVolver.setInteractive(new Phaser.Geom.Rectangle(-55, -20, 110, 40), Phaser.Geom.Rectangle.Contains);
        bgVolver.setInteractive({ useHandCursor: true });
        
        const txtVolver = this.add.text(0, 0, '← SALIR', { fontSize: '16px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        btnVolver.add([bgVolver, txtVolver]);
        bgVolver.on('pointerdown', () => this.scene.start('MainMenu'));

        // 3. ZONA DE DEPÓSITO
        this.zonaX = width * 0.7;
        this.zonaY = height * 0.55;
        this.limitesCaja = {
            xMin: this.zonaX - 140, xMax: this.zonaX + 140,
            yMin: this.zonaY - 140, yMax: this.zonaY + 140
        };

        const baseMaqui = this.add.graphics().setDepth(1);
        baseMaqui.fillStyle(0x000000, 0.3); 
        baseMaqui.fillRoundedRect(this.limitesCaja.xMin, this.limitesCaja.yMin, 280, 280, 25);
        baseMaqui.lineStyle(4, 0x4ecdc4, 1); 
        baseMaqui.strokeRoundedRect(this.limitesCaja.xMin, this.limitesCaja.yMin, 280, 280, 25);
        baseMaqui.lineStyle(2, 0xffffff, 0.2); 
        baseMaqui.strokeRoundedRect(this.limitesCaja.xMin + 10, this.limitesCaja.yMin + 10, 260, 260, 15);

        // 4. TEXTOS DOBLES (Corregido para que no se congele el juego)
        this.numeroObjetivo = Phaser.Math.Between(10, 150);
        const tituloY = 120;
        
        const bgTitulo = this.add.graphics({ fillStyle: { color: 0x2c3e50, alpha: 1 } }).setDepth(990);
        bgTitulo.fillRoundedRect((width/2) - 160, tituloY - 40, 320, 80, 20);
        bgTitulo.lineStyle(4, 0xf1c40f, 1); 
        bgTitulo.strokeRoundedRect((width/2) - 160, tituloY - 40, 320, 80, 20);

        // Texto Fijo del Objetivo
        this.uiObjetivo = this.add.text(width / 2, tituloY - 15, `OBJETIVO: ${this.numeroObjetivo}`, {
            fontSize: '34px', fontFamily: 'Arial Black', fill: '#f1c40f', stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5).setDepth(1000);

        // Texto Dinámico para ayudar al niño
        this.uiFeedback = this.add.text(width / 2, tituloY + 20, '¡Arrastra las piezas!', {
            fontSize: '18px', fontFamily: 'Arial', fill: '#4ecdc4', fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(1000);

        // 5. GENERADORES
        this.crearGenerador(120, height * 0.32, 'centena', 'CENTENAS');
        this.crearGenerador(120, height * 0.55, 'decena', 'DECENAS');
        this.crearGenerador(120, height * 0.78, 'unidad', 'UNIDADES');

        this.setupDragEvents();

        // 7. BOTÓN COMPROBAR
        this.createCheckButton(this.zonaX, this.limitesCaja.yMax + 35);
    }

    crearGenerador(x, y, tipo, etiqueta) {
        const textBg = this.add.rectangle(x, y - 75, 120, 30, 0x000000, 0.5).setCornerRadius(15).setDepth(99);
        this.add.text(x, y - 75, etiqueta, { fontSize: '16px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5).setDepth(100);
        
        const pieza = this.add.image(x, y, tipo);
        pieza.setScale(0.9); 
        
        pieza.setInteractive(new Phaser.Geom.Rectangle(0, 0, pieza.width, pieza.height), Phaser.Geom.Rectangle.Contains);
        this.input.setDraggable(pieza);

        pieza.setData('tipo', tipo);
        pieza.setData('esGenerador', true); 
        pieza.setData('startX', x);
        pieza.setData('startY', y);
        pieza.setDepth(500);
    }

    setupDragEvents() {
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            gameObject.setDepth(2000); 
        });

        this.input.on('dragend', (pointer, gameObject) => {
            const estaEnCaja = (gameObject.x > this.limitesCaja.xMin && gameObject.x < this.limitesCaja.xMax &&
                               gameObject.y > this.limitesCaja.yMin && gameObject.y < this.limitesCaja.yMax);

            if (gameObject.getData('esGenerador')) {
                if (estaEnCaja) {
                    this.crearCopiaEnCaja(gameObject.getData('tipo'), gameObject.x, gameObject.y);
                }
                gameObject.x = gameObject.getData('startX');
                gameObject.y = gameObject.getData('startY');
                gameObject.setDepth(500);
            } else {
                if (!estaEnCaja) {
                    this.eliminarPieza(gameObject);
                } else {
                    gameObject.setDepth(100);
                }
            }
        });
    }

    crearCopiaEnCaja(tipo, x, y) {
        let valorAgregado = 0;
        if (tipo === 'centena') {
            this.conteoActual.centenas++;
            valorAgregado = this.conteoActual.centenas * 100;
        } else if (tipo === 'decena') {
            this.conteoActual.decenas++;
            valorAgregado = this.conteoActual.decenas * 10;
        } else if (tipo === 'unidad') {
            this.conteoActual.unidades++;
            valorAgregado = this.conteoActual.unidades;
        }

        const total = (this.conteoActual.centenas * 100) + (this.conteoActual.decenas * 10) + this.conteoActual.unidades;

        try { this.audio.hablar(`${valorAgregado}. Llevas ${total}`); } catch(e){}
        
        this.uiFeedback.setText(`Suma actual: ${total}`);
        this.uiFeedback.setColor('#4ecdc4');

        const copia = this.add.image(x, y, tipo).setScale(0.8);
        copia.setInteractive(new Phaser.Geom.Rectangle(0, 0, copia.width, copia.height), Phaser.Geom.Rectangle.Contains);
        this.input.setDraggable(copia);
        copia.setDepth(100);
        copia.setData('tipo', tipo);
        copia.setData('esGenerador', false); 
        this.piezasVisuales.push(copia);
    }

    eliminarPieza(pieza) {
        const tipo = pieza.getData('tipo');
        if (tipo === 'centena') this.conteoActual.centenas--;
        else if (tipo === 'decena') this.conteoActual.decenas--;
        else if (tipo === 'unidad') this.conteoActual.unidades--;
        
        const total = (this.conteoActual.centenas * 100) + (this.conteoActual.decenas * 10) + this.conteoActual.unidades;
        
        try { this.audio.hablar(`Llevas ${total}`); } catch(e){}
        this.uiFeedback.setText(`Suma actual: ${total}`);

        this.tweens.add({
            targets: pieza, alpha: 0, scale: 0, duration: 200,
            onComplete: () => {
                this.piezasVisuales = this.piezasVisuales.filter(p => p !== pieza);
                pieza.destroy();
            }
        });
    }

    createCheckButton(x, y) {
        const container = this.add.container(x, y).setDepth(1000);
        
        const bg = this.add.graphics({ fillStyle: { color: 0x2ecc71 } });
        bg.fillRoundedRect(-140, -25, 280, 50, 15); 
        bg.lineStyle(3, 0xffffff, 0.8);
        bg.strokeRoundedRect(-140, -25, 280, 50, 15);

        bg.setInteractive(new Phaser.Geom.Rectangle(-140, -25, 280, 50), Phaser.Geom.Rectangle.Contains);
        bg.setInteractive({ useHandCursor: true });

        const txt = this.add.text(0, 0, '¡COMPROBAR!', { 
            fontSize: '22px', fontWeight: 'bold', fill: '#fff', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5);
        
        container.add([bg, txt]);

        bg.on('pointerdown', () => { container.setScale(0.95); });
        bg.on('pointerout', () => { container.setScale(1); });

        bg.on('pointerup', () => {
            container.setScale(1);

            const total = (this.conteoActual.centenas * 100) + (this.conteoActual.decenas * 10) + this.conteoActual.unidades;
            
            if (total === this.numeroObjetivo) {
                try { this.audio.hablar("¡Excelente! Es correcto."); } catch(e){}
                this.uiFeedback.setText("¡CORRECTO! 🎉");
                this.uiFeedback.setColor('#2ecc71');
                
                this.cameras.main.flash(500, 46, 204, 113);
                
                // ¡AQUÍ ESTÁ LA MAGIA! Llamamos al siguiente reto en lugar de recargar la página entera
                this.time.delayedCall(1500, () => this.siguienteReto());

            } else {
                try { this.audio.hablar(`Tienes ${total}. Intenta de nuevo.`); } catch(e){}
                this.uiFeedback.setText(`¡Llevas ${total}! Faltan piezas.`);
                this.uiFeedback.setColor('#e74c3c');
                this.cameras.main.shake(200, 0.01);
                
                this.time.delayedCall(2000, () => {
                    this.uiFeedback.setColor('#4ecdc4');
                    this.uiFeedback.setText(`Suma actual: ${total}`);
                });
            }
        });
    }

    // NUEVA FUNCIÓN: Limpia la mesa y pone un reto nuevo de forma súper fluida
    siguienteReto() {
        // 1. Destruimos las piezas que el niño arrastró
        this.piezasVisuales.forEach(pieza => pieza.destroy());
        this.piezasVisuales = [];

        // 2. Reiniciamos el contador interno
        this.conteoActual = { centenas: 0, decenas: 0, unidades: 0 };

        // 3. Generamos un nuevo número objetivo
        this.numeroObjetivo = Phaser.Math.Between(10, 150);

        // 4. Actualizamos los textos
        this.uiObjetivo.setText(`OBJETIVO: ${this.numeroObjetivo}`);
        this.uiFeedback.setText('¡Arrastra las piezas!');
        this.uiFeedback.setColor('#4ecdc4');

        // 5. Le avisamos con voz
        try { this.audio.hablar(`Nuevo reto. Construye el número ${this.numeroObjetivo}`); } catch(e){}
    }
}