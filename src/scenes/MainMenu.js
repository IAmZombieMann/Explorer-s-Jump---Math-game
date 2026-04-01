import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import { AudioManager } from '../utils/AudioManager.js';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const { width, height } = this.scale;
        this.audio = new AudioManager(this); 

        // 1. FONDO OSCURO
        this.add.rectangle(width/2, height/2, width, height, 0x1a1a2e).setDepth(0);

        // 2. DECORACIÓN
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
        const panelY = height * 0.52; // Subido un poco para dar aire abajo
        const panelW = width * 0.9; 
        const panelH = height * 0.75; 
        
        const graphics = this.add.graphics({ fillStyle: { color: 0xa7e1f4, alpha: 1 } }).setDepth(200);
        graphics.fillRoundedRect(panelX - panelW/2, panelY - panelH/2, panelW, panelH, 40);
        graphics.lineStyle(6, 0xef7c23, 1);
        graphics.strokeRoundedRect(panelX - panelW/2, panelY - panelH/2, panelW, panelH, 40);

        this.crearLazoTitulo(panelX, panelY - panelH/2, panelW);

        // 5. CONFIGURACIÓN DE BOTONES (Distribución Vertical)
        const buttonW = panelW * 0.85;
        const buttonH = 75; // Un poco más delgados para que quepan 5
        const startY = panelY - (panelH * 0.3);
        const spacing = 105; // Espacio fijo entre botones

        // --- BOTONES DE CONTEO ---
        this.crearBotonMenu(panelX, startY, buttonW, buttonH, 0xe0e226, 'Contar de 2 en 2', () => {
            try { this.audio.hablar("¡Saltemos de dos en dos!"); } catch(e){}
            this.scene.start('ConteoGame', { paso: 2 });
        });

        this.crearBotonMenu(panelX, startY + spacing, buttonW, buttonH, 0xef7c23, 'Contar de 3 en 3', () => {
            try { this.audio.hablar("¡Saltemos de tres en tres!"); } catch(e){}
            this.scene.start('ConteoGame', { paso: 3 });
        });

        this.crearBotonMenu(panelX, startY + (spacing * 2), buttonW, buttonH, 0xe67e22, 'Contar de 4 en 4', () => {
            try { this.audio.hablar("¡Saltemos de cuatro en cuatro!"); } catch(e){}
            this.scene.start('ConteoGame', { paso: 4 });
        });

        // --- BOTÓN VALOR POSICIONAL ---
        this.crearBotonMenu(panelX, startY + (spacing * 3), buttonW, buttonH, 0x3498db, 'Unidades y Decenas', () => {
            try { this.audio.hablar("¡Vamos a contar!"); } catch(e){}
            this.scene.start('ValorPosicionalGame');
        });

        // --- BOTÓN ACTIVAR AUDIO (Feedback Púrpura) ---
        const btnAudio = this.crearBotonMenu(panelX, startY + (spacing * 4), buttonW, buttonH, 0x9b59b6, '🔊 ACTIVAR AUDIO', () => {
            try { 
                this.audio.hablar("¡Audio activado y listo!"); 
                btnAudio.bg.clear();
                btnAudio.bg.fillStyle(0x2ecc71); 
                btnAudio.bg.fillRoundedRect(-buttonW/2, -buttonH/2, buttonW, buttonH, 25);
                btnAudio.bg.lineStyle(5, 0xffffff, 1);
                btnAudio.bg.strokeRoundedRect(-buttonW/2, -buttonH/2, buttonW, buttonH, 25);
                btnAudio.txt.setText('✅ AUDIO LISTO');
            } catch(e){}
        });
    }

    crearBotonMenu(x, y, w, h, color, texto, accion) {
        const container = this.add.container(x, y).setDepth(300);
        container.setSize(w, h);
        container.setInteractive({ useHandCursor: true });
        
        const bgShadow = this.add.rectangle(0, 6, w, h, 0x000000, 0.4).setOrigin(0.5);
        
        const bg = this.add.graphics({ fillStyle: { color: color } });
        bg.fillRoundedRect(-w/2, -h/2, w, h, 25);
        bg.lineStyle(4, 0xffffff, 1);
        bg.strokeRoundedRect(-w/2, -h/2, w, h, 25);

        const txt = this.add.text(0, 0, texto, { 
            fontSize: '28px', 
            fill: '#fff', 
            fontWeight: 'bold', 
            fontFamily: 'Arial Black',
            stroke: '#000', 
            strokeThickness: 4
        }).setOrigin(0.5);
        
        container.add([bgShadow, bg, txt]);

        container.on('pointerdown', () => { container.setScale(0.95); });
        container.on('pointerout', () => { container.setScale(1); });
        container.on('pointerup', () => { 
            container.setScale(1); 
            accion(); 
        });

        return { container, bg, txt }; 
    }

    crearLollipop(x, y, radio, color) {
        const lollipop = this.add.container(x, y).setDepth(1);
        const stick = this.add.rectangle(0, radio * 1.5, radio * 0.3, radio * 3, 0xffffff);
        const circle = this.add.circle(0, 0, radio, color);
        lollipop.add([stick, circle]);
    }

    crearLazoTitulo(x, y, panelW) {
        const lazoW = panelW * 0.85;
        const lazoH = 80;
        const graphics = this.add.graphics({ fillStyle: { color: 0xf0619a, alpha: 1 } }).setDepth(210);
        
        graphics.fillRoundedRect(x - lazoW/2, y - lazoH/2, lazoW, lazoH, 20);
        graphics.lineStyle(5, 0xbf2c61, 1);
        graphics.strokeRoundedRect(x - lazoW/2, y - lazoH/2, lazoW, lazoH, 20);

        this.add.text(x, y, 'MATEMÁTICAS', { 
            fontSize: '38px', 
            fill: '#fff', 
            fontWeight: 'bold',
            fontFamily: 'Arial Black',
            stroke: '#bf2c61',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(220);
    }

    crearBarraHUD(x, y, iconChar, barColor, progresoPercent) {
        const barW = 80; 
        const barH = 20;
        const barX = x + (barW/2) + 25;

        this.add.text(x, y, iconChar, { fontSize: '32px' }).setOrigin(0, 0.5).setDepth(100);
        
        const bg = this.add.graphics({ fillStyle: { color: 0xcccccc } });
        bg.fillRoundedRect(barX - barW/2, y - barH/2, barW, barH, 10).setDepth(100);
        
        const progress = this.add.graphics({ fillStyle: { color: barColor } });
        progress.fillRoundedRect(barX - barW/2, y - barH/2, barW * progresoPercent, barH, 10).setDepth(101);
    }
}