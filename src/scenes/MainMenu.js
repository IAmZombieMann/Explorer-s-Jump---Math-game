import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const { width, height } = this.scale;
        this.audio = this.scene.get('Preloader').audio; // Recuperamos el audio

        // ----------------------------------------------------
        // CAPA 0 y 1: FONDO Y DECORACIÓN (Mobile-First)
        // ----------------------------------------------------
        // Fondo base oscuro
        this.add.rectangle(width/2, height/2, width, height, 0x1a1a2e).setDepth(0);

        // Decoración de Piruletas (Lollipops) como en la imagen
        this.crearLollipop(width * 0.1, height * 0.9, 50, 0xef7c23); // Naranja
        this.crearLollipop(width * 0.9, height * 0.9, 50, 0xe0e226); // Amarillo
        this.crearLollipop(width * 0.9, height * 0.1, 50, 0xe0e226); // Amarillo
        this.crearLollipop(width * 0.1, height * 0.1, 50, 0xef7c23); // Naranja

        // ----------------------------------------------------
        // CAPA 100: HUD (Barras superiores)
        // ----------------------------------------------------
        this.crearBarraHUD(width * 0.05, height * 0.05, '💀', 0xe0e226, 0.4); // Calavera
        this.crearBarraHUD(width * 0.50, height * 0.05, '⭐', 0xe0e226, 0.9); // Estrella
        this.crearBarraHUD(width * 0.95, height * 0.05, '⚡', 0xef7c23, 0.2); // Rayo

        // ----------------------------------------------------
        // CAPA 200: PANEL DE MENÚ (Mobile-First)
        // ----------------------------------------------------
        // Panel azul redondeado (Capa 200)
        const panelX = width * 0.5;
        const panelY = height * 0.5;
        const panelW = width * 0.65;
        const panelH = height * 0.70;
        
        const graphics = this.add.graphics({ fillStyle: { color: 0xa7e1f4, alpha: 1 } }).setDepth(200);
        graphics.fillRoundedRect(panelX - panelW/2, panelY - panelH/2, panelW, panelH, 30);
        graphics.lineStyle(5, 0xef7c23, 1);
        graphics.strokeRoundedRect(panelX - panelW/2, panelY - panelH/2, panelW, panelH, 30);

        // Lazo rosa de "MENÚ PRINCIPAL" (Capa 210)
        this.crearLazoTitulo(panelX, panelY - panelH/2, panelW);

        // ----------------------------------------------------
        // CAPA 300: BOTONES DE JUEGO (Mobile-First)
        // ----------------------------------------------------
        const buttonW = panelW * 0.8;
        const buttonH = panelH * 0.18;
        const buttonX = panelX;
        const buttonSpacing = panelH * 0.23;
        
        // 1. Botón: Jugar Conteo
        this.crearBotonMenu(buttonX, panelY - buttonSpacing, buttonW, buttonH, 0xe0e226, 'Jugar de 2 en 2', () => {
            this.audio.hablar("¡Prepárate para saltar!");
            this.scene.start('ConteoGame');
        });

        // 2. Botón: Jugar Valor Posicional
        this.crearBotonMenu(buttonX, panelY, buttonW, buttonH, 0xef7c23, 'Unidades y Decenas', () => {
            this.audio.hablar("¡Vamos a contar cristales!");
            this.scene.start('ValorPosicionalGame');
        });

        // 3. Botón: Créditos
        this.crearBotonMenu(buttonX, panelY + buttonSpacing, buttonW, buttonH, 0xe04446, 'Créditos', () => {
            // Lógica de Créditos aquí...
            console.log("Créditos...");
        });
    }

    // --- FUNCIONES HELPER (Ayudan a que el código sea Mobile-First y limpio) ---

    crearBotonMenu(x, y, w, h, color, texto, accion) {
        const container = this.add.container(x, y).setDepth(300);
        
        // Sombra sutil del botón
        const bgShadow = this.add.rectangle(0, 4, w, h, 0x000000, 0.5).setOrigin(0.5);
        
        // Rectángulo principal del botón
        const bg = this.add.graphics({ fillStyle: { color: color } });
        bg.fillRoundedRect(-w/2, -h/2, w, h, 15);
        bg.lineStyle(4, 0xffffff, 1);
        bg.strokeRoundedRect(-w/2, -h/2, w, h, 15);
        bg.setInteractive(new Phaser.Geom.Rectangle(-w/2, -h/2, w, h), Phaser.Geom.Rectangle.Contains);
        bg.setInteractive({ useHandCursor: true });

        // Texto del botón
        const txt = this.add.text(0, 0, texto, { 
            fontSize: '28px', 
            fill: '#fff', 
            fontWeight: 'bold', 
            fontFamily: 'Arial Black',
            stroke: '#000', 
            strokeThickness: 4
        }).setOrigin(0.5);
        
        container.add([bgShadow, bg, txt]);

        // Efectos de escala al pulsar
        bg.on('pointerdown', () => { container.scale = 0.95; });
        bg.on('pointerout', () => { container.scale = 1; });
        bg.on('pointerup', () => { container.scale = 1; accion(); });
    }

    crearLollipop(x, y, radio, color) {
        const lollipop = this.add.container(x, y).setDepth(1);
        const circle = this.add.circle(0, 0, radio, color);
        const stick = this.add.rectangle(0, radio * 1.5, radio * 0.2, radio * 2, 0xffffff);
        lollipop.add([circle, stick]);
    }

    crearLazoTitulo(x, y, panelW) {
        const lazoW = panelW * 0.7;
        const lazoH = panelW * 0.22;
        const graphics = this.add.graphics({ fillStyle: { color: 0xf0619a, alpha: 1 } }).setDepth(210);
        
        // Lazo principal
        graphics.fillRoundedRect(x - lazoW/2, y - lazoH/2, lazoW, lazoH, 15);
        graphics.lineStyle(4, 0xbf2c61, 1);
        graphics.strokeRoundedRect(x - lazoW/2, y - lazoH/2, lazoW, lazoH, 15);

        // Texto "MENÚ PRINCIPAL"
        this.add.text(x, y, 'MENÚ PRINCIPAL', { 
            fontSize: '32px', 
            fill: '#fff', 
            fontWeight: 'bold',
            stroke: '#bf2c61',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(220);
    }

    crearBarraHUD(x, y, iconChar, barColor, progresoPercent) {
        const barW = 120;
        const barH = 25;
        const barX = x + (barW/2) + 20;

        // Icono (💀, ⭐, ⚡)
        this.add.text(x, y, iconChar, { fontSize: '32px' }).setOrigin(0, 0.5).setDepth(100);
        
        // Fondo de la barra
        const bg = this.add.graphics({ fillStyle: { color: 0xcccccc } });
        bg.fillRect(barX - barW/2, y - barH/2, barW, barH).setDepth(100);
        
        // Progreso de la barra
        const progress = this.add.graphics({ fillStyle: { color: barColor } });
        progress.fillRect(barX - barW/2, y - barH/2, barW * progresoPercent, barH).setDepth(101);
    }
}