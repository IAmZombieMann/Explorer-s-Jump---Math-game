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

        // 1. FONDO Y DECORACIÓN (Estilo MainMenu)
        this.add.rectangle(width/2, height/2, width, height, 0x1a1a2e).setDepth(0);
        this.crearLollipop(width * 0.15, height * 0.85, 60, 0xef7c23); 
        this.crearLollipop(width * 0.85, height * 0.15, 60, 0xe0e226); 

        // 2. BOTÓN VOLVER (Mejorado con estilo)
        const btnVolver = this.add.container(80, 50).setDepth(1000);
        const bgVolver = this.add.graphics({ fillStyle: { color: 0xe74c3c } });
        bgVolver.fillRoundedRect(-55, -20, 110, 40, 12);
        bgVolver.lineStyle(3, 0xffffff, 1);
        bgVolver.strokeRoundedRect(-55, -20, 110, 40, 12);
        bgVolver.setInteractive(new Phaser.Geom.Rectangle(-55, -20, 110, 40), Phaser.Geom.Rectangle.Contains);
        bgVolver.setInteractive({ useHandCursor: true });
        
        const txtVolver = this.add.text(0, 0, '← VOLVER', { fontSize: '16px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        btnVolver.add([bgVolver, txtVolver]);
        bgVolver.on('pointerdown', () => this.scene.start('MainMenu'));

        // 3. ZONA DE DEPÓSITO (Estilo panel redondeado)
        this.zonaX = width * 0.7;
        this.zonaY = height * 0.55;
        this.limitesCaja = {
            xMin: this.zonaX - 140, xMax: this.zonaX + 140,
            yMin: this.zonaY - 140, yMax: this.zonaY + 140
        };

        const baseMaqui = this.add.graphics().setDepth(1);
        baseMaqui.fillStyle(0xa7e1f4, 0.15); // Azul claro semitransparente
        baseMaqui.fillRoundedRect(this.limitesCaja.xMin, this.limitesCaja.yMin, 280, 280, 25);
        baseMaqui.lineStyle(6, 0xef7c23, 1); // Borde naranja grueso
        baseMaqui.strokeRoundedRect(this.limitesCaja.xMin, this.limitesCaja.yMin, 280, 280, 25);

        // 4. TEXTO OBJETIVO (Con lazo rosa estilo Menú)
        this.numeroObjetivo = Phaser.Math.Between(10, 150);
        const tituloY = 120;
        
        const bgTitulo = this.add.graphics({ fillStyle: { color: 0xf0619a, alpha: 1 } }).setDepth(990);
        bgTitulo.fillRoundedRect((width/2) - 180, tituloY - 35, 360, 70, 20);
        bgTitulo.lineStyle(5, 0xbf2c61, 1);
        bgTitulo.strokeRoundedRect((width/2) - 180, tituloY - 35, 360, 70, 20);

        this.uiTexto = this.add.text(width / 2, tituloY, `CONSTRUYE: ${this.numeroObjetivo}`, {
            fontSize: '32px', fontFamily: 'Arial Black', fill: '#fff', stroke: '#bf2c61', strokeThickness: 6
        }).setOrigin(0.5).setDepth(1000);

        // 5. GENERADORES (Aumentamos la escala a 0.9 para que sean fáciles de tocar)
        this.crearGenerador(120, height * 0.32, 'centena', 'CENTENAS');
        this.crearGenerador(120, height * 0.55, 'decena', 'DECENAS');
        this.crearGenerador(120, height * 0.78, 'unidad', 'UNIDADES');

        // 6. EVENTOS DE ARRASTRE
        this.setupDragEvents();

        // 7. BOTÓN COMPROBAR (Con el nuevo diseño y justo debajo de la caja)
        this.createCheckButton(this.zonaX, this.limitesCaja.yMax + 40);
    }

    crearLollipop(x, y, radio, color) {
        const lollipop = this.add.container(x, y).setDepth(1);
        const stick = this.add.rectangle(0, radio * 1.5, radio * 0.3, radio * 3, 0xffffff);
        const circle = this.add.circle(0, 0, radio, color);
        lollipop.add([stick, circle]);
    }

    crearGenerador(x, y, tipo, etiqueta) {
        // Texto más arriba porque la pieza ahora es más grande
        this.add.text(x, y - 75, etiqueta, { fontSize: '18px', fill: '#fff', fontWeight: 'bold', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setDepth(100);
        
        const pieza = this.add.image(x, y, tipo);
        pieza.setScale(0.9); // ¡AUMENTADO PARA MÓVILES! (Antes 0.6)
        
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
        // 1. Calculamos el valor de lo que acabamos de agregar y lo sumamos
        let valorAgregado = 0;
        if (tipo === 'centena') {
            this.conteoActual.centenas++;
            valorAgregado = this.conteoActual.centenas * 100; // Ej: 100, 200...
        } else if (tipo === 'decena') {
            this.conteoActual.decenas++;
            valorAgregado = this.conteoActual.decenas * 10;   // Ej: 10, 20...
        } else if (tipo === 'unidad') {
            this.conteoActual.unidades++;
            valorAgregado = this.conteoActual.unidades;       // Ej: 1, 2...
        }

        // 2. Calculamos el total general
        const total = (this.conteoActual.centenas * 100) + (this.conteoActual.decenas * 10) + this.conteoActual.unidades;

        // 3. ¡NUEVA LÓGICA DE AUDIO!
        // Ej: Agregas 1 centena y llevas 113 -> "Cien. Llevas ciento trece."
        this.audio.hablar(`${valorAgregado}. Llevas ${total}`); 

        // 4. Creamos la copia visual (un poco más grande también)
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
        
        // Decimos el nuevo total al eliminar una pieza
        const total = (this.conteoActual.centenas * 100) + (this.conteoActual.decenas * 10) + this.conteoActual.unidades;
        this.audio.hablar(`Llevas ${total}`);

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
        
        const buttonW = 280;
        const buttonH = 65;

        // Sombra
        const bgShadow = this.add.rectangle(0, 6, buttonW, buttonH, 0x000000, 0.4).setOrigin(0.5);
        
        // Botón principal
        const bg = this.add.graphics({ fillStyle: { color: 0x2ecc71 } });
        bg.fillRoundedRect(-buttonW/2, -buttonH/2, buttonW, buttonH, 20);
        bg.lineStyle(4, 0xffffff, 1);
        bg.strokeRoundedRect(-buttonW/2, -buttonH/2, buttonW, buttonH, 20);
        
        bg.setInteractive(new Phaser.Geom.Rectangle(-buttonW/2, -buttonH/2, buttonW, buttonH), Phaser.Geom.Rectangle.Contains);
        bg.setInteractive({ useHandCursor: true });

        const txt = this.add.text(0, 0, 'COMPROBAR', { 
            fontSize: '24px', fontWeight: 'bold', fill: '#fff', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);
        
        container.add([bgShadow, bg, txt]);

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
                this.audio.hablar(`Tienes ${total}. Intenta de nuevo.`);
                this.uiTexto.setText(`Llevas ${total}...`);
                this.cameras.main.shake(200, 0.01);
            }
        });
    }
}