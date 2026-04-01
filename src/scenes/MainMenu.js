import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import { AudioManager } from '../utils/AudioManager.js';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        // Aseguramos que la escala sea de celular (Ej: 720x1280)
        const { width, height } = this.scale;
        this.audio = new AudioManager(this); 

        // 1. FONDO OSCURO
        this.add.rectangle(width/2, height/2, width, height, 0x1a1a2e).setDepth(0);

        // 2. DECORACIÓN (Piruletas adaptadas a la verticalidad)
        this.crearLollipop(width * 0.15, height * 0.85, 60, 0xef7c23); 
        this.crearLollipop(width * 0.85, height * 0.88, 50, 0xe0e226); 
        this.crearLollipop(width * 0.85, height * 0.15, 60, 0xe0e226); 
        this.crearLollipop(width * 0.15, height * 0.12, 45, 0xef7c23); 

        // 3. HUD SUPERIOR
        const hudY = height * 0.06;
        this.crearBarraHUD(width * 0.05, hudY, '💀', 0xe0e226, 0.4); 
        this.crearBarraHUD(width * 0.40, hudY, '⭐', 0xe0e226, 0.9); 
        this.crearBarraHUD(width * 0.75, hudY, '⚡', 0xef7c23, 0.2); 

        // 4. PANEL VERTICAL PRINCIPAL
        const panelX = width * 0.5;
        const panelY = height * 0.55;
        const panelW = width * 0.85; 
        const panelH = height * 0.65; 
        
        const graphics = this.add.graphics({ fillStyle: { color: 0xa7e1f4, alpha: 1 } }).setDepth(200);
        graphics.fillRoundedRect(panelX - panelW/2, panelY - panelH/2, panelW, panelH, 40);
        graphics.lineStyle(6, 0xef7c23, 1);
        graphics.strokeRoundedRect(panelX - panelW/2, panelY - panelH/2, panelW, panelH, 40);

        // Lazo de título
        this.crearLazoTitulo(panelX, panelY - panelH/2, panelW);

        // 5. BOTONES (Medidas dinámicas para que no se amontonen)
        const buttonW = panelW * 0.85;
        const buttonH = panelH * 0.15; // Alto adaptativo
        const spacing = panelH * 0.25; // Espacio dinámico entre botones
        
        // Botón 1 (Arriba)
        this.crearBotonMenu(panelX, panelY - spacing, buttonW, buttonH, 0xe0e226, 'Jugar de 2 en 2', () => {
            try { this.audio.hablar("¡Prepárate para saltar!"); } catch(e){}
            this.scene.start('ConteoGame');
        });

        // Botón 2 (Centro)
        this.crearBotonMenu(panelX, panelY, buttonW, buttonH, 0xef7c23, 'Unidades y Decenas', () => {
            try { this.audio.hablar("¡Vamos a contar!"); } catch(e){}
            this.scene.start('ValorPosicionalGame');
        });

        // Botón 3 (Abajo)
        this.crearBotonMenu(panelX, panelY + spacing, buttonW, buttonH, 0xe04446, 'Créditos', () => {
            try { this.audio.hablar("Créditos"); } catch(e){}
            console.log("Clic en créditos funcionó");
        });
    }

    // --- LA SOLUCIÓN MÁGICA PARA LOS BOTONES ESTÁ AQUÍ ---
    crearBotonMenu(x, y, w, h, color, texto, accion) {
        // 1. Creamos el contenedor
        const container = this.add.container(x, y).setDepth(300);
        
        // 2. LE DAMOS TAMAÑO AL CONTENEDOR Y LO HACEMOS INTERACTIVO (100% Seguro)
        container.setSize(w, h);
        container.setInteractive({ useHandCursor: true });
        
        const bgShadow = this.add.rectangle(0, 8, w, h, 0x000000, 0.4).setOrigin(0.5);
        
        const bg = this.add.graphics({ fillStyle: { color: color } });
        bg.fillRoundedRect(-w/2, -h/2, w, h, 25);
        bg.lineStyle(5, 0xffffff, 1);
        bg.strokeRoundedRect(-w/2, -h/2, w, h, 25);

        const txt = this.add.text(0, 0, texto, { 
            fontSize: '34px', 
            fill: '#fff', 
            fontWeight: 'bold', 
            fontFamily: 'Arial Black',
            stroke: '#000', 
            strokeThickness: 5
        }).setOrigin(0.5);
        
        container.add([bgShadow, bg, txt]);

        // 3. ESCUCHAMOS LOS CLICS DIRECTAMENTE EN EL CONTENEDOR
        container.on('pointerdown', () => { 
            container.setScale(0.92); 
        });
        
        container.on('pointerout', () => { 
            container.setScale(1); 
        });
        
        container.on('pointerup', () => { 
            container.setScale(1); 
            // Disparamos la acción
            this.time.delayedCall(50, () => { accion(); });
        });
    }

    crearLollipop(x, y, radio, color) {
        const lollipop = this.add.container(x, y).setDepth(1);
        const stick = this.add.rectangle(0, radio * 1.5, radio * 0.3, radio * 3, 0xffffff);
        const circle = this.add.circle(0, 0, radio, color);
        lollipop.add([stick, circle]);
    }

    crearLazoTitulo(x, y, panelW) {
        const lazoW = panelW * 0.85;
        const lazoH = 90;
        const graphics = this.add.graphics({ fillStyle: { color: 0xf0619a, alpha: 1 } }).setDepth(210);
        
        graphics.fillRoundedRect(x - lazoW/2, y - lazoH/2, lazoW, lazoH, 20);
        graphics.lineStyle(5, 0xbf2c61, 1);
        graphics.strokeRoundedRect(x - lazoW/2, y - lazoH/2, lazoW, lazoH, 20);

        this.add.text(x, y, 'MENÚ PRINCIPAL', { 
            fontSize: '42px', 
            fill: '#fff', 
            fontWeight: 'bold',
            fontFamily: 'Arial Black',
            stroke: '#bf2c61',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(220);
    }

    crearBarraHUD(x, y, iconChar, barColor, progresoPercent) {
        const barW = 100; 
        const barH = 25;
        const barX = x + (barW/2) + 30;

        this.add.text(x, y, iconChar, { fontSize: '38px' }).setOrigin(0, 0.5).setDepth(100);
        
        const bg = this.add.graphics({ fillStyle: { color: 0xcccccc } });
        bg.fillRoundedRect(barX - barW/2, y - barH/2, barW, barH, 12).setDepth(100);
        
        const progress = this.add.graphics({ fillStyle: { color: barColor } });
        progress.fillRoundedRect(barX - barW/2, y - barH/2, barW * progresoPercent, barH, 12).setDepth(101);
    }
}