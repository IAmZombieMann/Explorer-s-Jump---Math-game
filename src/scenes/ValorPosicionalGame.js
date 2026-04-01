import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import { AudioManager } from '../utils/AudioManager.js';

export class ValorPosicionalGame extends Phaser.Scene {
    constructor() {
        super('ValorPosicionalGame');
    }

    init() {
        // Reiniciamos los contadores y el array de copias cada vez que inicia el nivel
        this.conteoActual = { centenas: 0, decenas: 0, unidades: 0 };
        this.piezasVisuales = []; 
    }

    create() {
        const { width, height } = this.scale;
        this.audio = new AudioManager(this);

        // 1. FONDO
        this.add.rectangle(width/2, height/2, width, height, 0x1a1a2e).setDepth(0);
        
        // 2. BOTÓN VOLVER (Esquina superior izquierda)
        const btnVolver = this.add.container(70, 40).setDepth(1000);
        const bgVolver = this.add.rectangle(0, 0, 110, 40, 0xe74c3c).setInteractive({ useHandCursor: true });
        const txtVolver = this.add.text(0, 0, '← VOLVER', { fontSize: '16px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        btnVolver.add([bgVolver, txtVolver]);
        bgVolver.on('pointerdown', () => this.scene.start('MainMenu'));

        // 3. ZONA DE DEPÓSITO (Caja derecha)
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

        // 4. TEXTO OBJETIVO (Arriba al centro)
        this.numeroObjetivo = Phaser.Math.Between(10, 150);
        this.uiTexto = this.add.text(width / 2, 40, `CONSTRUYE: ${this.numeroObjetivo}`, {
            fontSize: '32px', fontFamily: 'Arial Black', fill: '#f1c40f', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(1000);

        // 5. GENERADORES (A la izquierda, más pequeños para que no tapen los textos)
        this.crearGenerador(100, height * 0.25, 'centena', 'CENTENAS');
        this.crearGenerador(100, height * 0.52, 'decena', 'DECENAS');
        this.crearGenerador(100, height * 0.82, 'unidad', 'UNIDADES');

        // 6. EVENTOS DE ARRASTRE (DRAG)
        this.setupDragEvents();

        // 7. BOTÓN COMPROBAR 
        // ¡CORRECCIÓN!: Lo ponemos justo debajo de la caja usando this.limitesCaja.yMax + 50 pixeles
        this.createCheckButton(this.zonaX, this.limitesCaja.yMax + 50);
    }

    crearGenerador(x, y, tipo, etiqueta) {
        // Texto descriptivo
        this.add.text(x, y - 55, etiqueta, { fontSize: '14px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5).setDepth(100);
        
        // Imagen interactiva
        const pieza = this.add.image(x, y, tipo);
        pieza.setScale(0.6);
        
        // Forzamos el área interactiva para que piezas pequeñas no fallen al hacer clic
        pieza.setInteractive(new Phaser.Geom.Rectangle(0, 0, pieza.width, pieza.height), Phaser.Geom.Rectangle.Contains);
        this.input.setDraggable(pieza);

        // Metadatos
        pieza.setData('tipo', tipo);
        pieza.setData('esGenerador', true); 
        pieza.setData('startX', x);
        pieza.setData('startY', y);
        pieza.setDepth(500);
    }

    setupDragEvents() {
        // Mientras se mueve el objeto
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            gameObject.setDepth(2000); 
        });

        // Al soltar el objeto
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
        if (tipo === 'centena') this.conteoActual.centenas++;
        else if (tipo === 'decena') this.conteoActual.decenas++;
        else if (tipo === 'unidad') this.conteoActual.unidades++;

        this.audio.hablar(tipo); 

        const copia = this.add.image(x, y, tipo).setScale(0.6);
        
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
        
        // Lo hice un poquito más bonito con bordes redondeados
        const bg = this.add.graphics({ fillStyle: { color: 0x2ecc71 } });
        bg.fillRoundedRect(-110, -30, 220, 60, 15);
        bg.setInteractive(new Phaser.Geom.Rectangle(-110, -30, 220, 60), Phaser.Geom.Rectangle.Contains);
        bg.setInteractive({ useHandCursor: true });

        const txt = this.add.text(0, 0, 'COMPROBAR', { fontSize: '22px', fontWeight: 'bold', fill: '#fff', fontFamily: 'Arial Black' }).setOrigin(0.5);
        container.add([bg, txt]);

        // Efecto de botón al pulsar
        bg.on('pointerdown', () => { container.setScale(0.95); });
        bg.on('pointerout', () => { container.setScale(1); });

        bg.on('pointerup', () => {
            container.setScale(1);

            const total = (this.conteoActual.centenas * 100) + (this.conteoActual.decenas * 10) + this.conteoActual.unidades;
            
            if (total === this.numeroObjetivo) {
                this.audio.hablar("¡Excelente! Es correcto.");
                this.uiTexto.setText("¡MUY BIEN!");
                
                this.cameras.main.flash(500, 46, 204, 113);
                this.time.delayedCall(1500, () => this.scene.restart());
            } else {
                this.audio.hablar(`Llevas ${total}. Intenta de nuevo.`);
                this.uiTexto.setText(`Llevas ${total}...`);
                this.cameras.main.shake(200, 0.01);
            }
        });
    }
}