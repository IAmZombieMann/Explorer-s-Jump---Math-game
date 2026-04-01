import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import { AudioManager } from '../utils/AudioManager.js';

export class ConteoGame extends Phaser.Scene {
    constructor() {
        super('ConteoGame');
    }

    init() {
        this.paso = 2; 
        
        // ¡NUEVO!: Generamos un número aleatorio entre 0 y 40
        this.numeroInicial = Phaser.Math.Between(0, 40);
        this.numeroActual = this.numeroInicial;
        
        // La explicación siempre dará 5 saltos (5 saltos * paso 2 = 10)
        this.limiteExplicacion = this.numeroInicial + 10;
        
        // El objetivo será dar otros 5 saltos más en la práctica
        this.objetivo = this.numeroInicial + 20;

        this.estado = 'EXPLICACION'; 
        this.botonesUI = []; 
    }

    create() {
        const { width, height } = this.scale;
        this.audio = new AudioManager(this);

        // 1. FONDO (Con el nuevo TileSprite)
        this.bg = this.add.tileSprite(width / 2, height / 2, width * 10, height, 'bg_jungle')
            .setScrollFactor(0.1) 
            .setAlpha(0.8);       

        const scaleBase = height / this.textures.get('bg_jungle').getSourceImage().height;
        this.bg.tileScaleX = scaleBase;
        this.bg.tileScaleY = scaleBase;
        
        // 2. BOTÓN SALIR
        const btnVolver = this.add.container(80, 50).setDepth(1000).setScrollFactor(0);
        btnVolver.setSize(110, 40);
        btnVolver.setInteractive({ useHandCursor: true });
        
        const bgVolver = this.add.graphics({ fillStyle: { color: 0xe74c3c } });
        bgVolver.fillRoundedRect(-55, -20, 110, 40, 20); 
        
        const txtVolver = this.add.text(0, 0, '← SALIR', { fontSize: '16px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        btnVolver.add([bgVolver, txtVolver]);
        
        btnVolver.on('pointerdown', () => {
            try { window.speechSynthesis.cancel(); } catch(e){}
            this.scene.start('MainMenu');
        });

        // 3. FÍSICAS Y PERSONAJE
        this.plataformas = this.physics.add.staticGroup();
        
        this.player = this.physics.add.sprite(100, height - 380, 'dude'); 
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(false); 
        this.physics.add.collider(this.player, this.plataformas);

        // 4. UI PRINCIPAL 
        const tituloY = 90;
        const bgTitulo = this.add.graphics({ fillStyle: { color: 0x2c3e50, alpha: 1 } }).setScrollFactor(0).setDepth(990);
        bgTitulo.fillRoundedRect((width/2) - 220, tituloY - 45, 440, 90, 20);
        bgTitulo.lineStyle(4, 0xf1c40f, 1); 
        bgTitulo.strokeRoundedRect((width/2) - 220, tituloY - 45, 440, 90, 20);

        this.uiTexto = this.add.text(width / 2, tituloY, '¡Mira cómo cuento\nde 2 en 2!', {
            fontSize: '28px', fontFamily: 'Arial Black', fill: '#f1c40f', stroke: '#000', strokeThickness: 1, align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

        this.setupControlesPractica();
        this.iniciarExplicacion();
    }

    iniciarExplicacion() {
        this.estado = 'EXPLICACION';
        this.mostrarSiguienteSalto();
    }

    mostrarSiguienteSalto() {
        // Usamos el nuevo límite dinámico en lugar del "10" estático
        if (this.numeroActual >= this.limiteExplicacion) {
            this.time.delayedCall(1000, () => {
                try { this.audio.hablar('¡Ahora te toca a ti! ¿Qué número sigue?'); } catch(e){}
                this.uiTexto.setText('¡Tu turno!\n¿Qué número sigue?');
                this.uiTexto.setColor('#4ecdc4');
                this.iniciarPractica();
            });
            return;
        }

        this.numeroActual += this.paso;
        
        // Calculamos si es el "primer salto" dinámicamente comparando con el inicio
        const esPrimerSalto = (this.numeroActual === this.numeroInicial + this.paso);
        const nuevaX = esPrimerSalto ? this.player.x + 100 : this.player.x + 240; 
        
        const nuevaY = this.scale.height - 320; 
        
        this.crearPlataforma(nuevaX, nuevaY, this.numeroActual);

        this.player.setVelocityY(-450);
        this.tweens.add({
            targets: this.player,
            x: nuevaX,
            duration: 600,
            onStart: () => {
                try { this.audio.hablar(this.numeroActual.toString()); } catch(e){}
            },
            onComplete: () => {
                this.time.delayedCall(800, () => this.mostrarSiguienteSalto());
            }
        });
    }

    crearPlataforma(x, y, numero) {
        const plat = this.plataformas.create(x, y, 'plataforma').setScale(0.6).refreshBody();
        this.add.text(x, y - 45, numero.toString(), {
            fontSize: '34px', fontFamily: 'Arial Black', fill: '#ffff00', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);
        return plat;
    }

    setupControlesPractica() {
        const { width, height } = this.scale;
        
        const yPos = height - 160; 
        
        this.crearBotonOpcion(width/2 - 200, yPos);
        this.crearBotonOpcion(width/2, yPos);
        this.crearBotonOpcion(width/2 + 200, yPos);
    }

    crearBotonOpcion(x, y) {
        const w = 160;
        const h = 100;
        
        const container = this.add.container(x, y).setDepth(1000).setScrollFactor(0).setVisible(false);
        container.setSize(w, h);
        container.setInteractive({ useHandCursor: true });

        const bgShadow = this.add.rectangle(0, 8, w, h, 0x000000, 0.4).setOrigin(0.5);
        
        const bg = this.add.graphics({ fillStyle: { color: 0x3498db } });
        bg.fillRoundedRect(-w/2, -h/2, w, h, 20);
        bg.lineStyle(4, 0xffffff, 1);
        bg.strokeRoundedRect(-w/2, -h/2, w, h, 20);

        const txt = this.add.text(0, 0, '', { 
            fontSize: '48px', fill: '#fff', fontWeight: 'bold', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);

        container.add([bgShadow, bg, txt]);

        container.on('pointerdown', () => { container.setScale(0.92); });
        container.on('pointerout', () => { container.setScale(1); });
        container.on('pointerup', () => { 
            container.setScale(1);
            this.time.delayedCall(50, () => this.verificarSalto(container.valorAsignado));
        });

        this.botonesUI.push({ container, txt });
    }

    iniciarPractica() {
        this.estado = 'PRACTICA';
        
        const respuestaCorrecta = this.numeroActual + this.paso;
        const opciones = [respuestaCorrecta, respuestaCorrecta - 1, respuestaCorrecta + 1]; 
        Phaser.Utils.Array.Shuffle(opciones); 
        
        this.botonesUI.forEach((item, index) => {
            const numeroMostrado = opciones[index];
            item.txt.setText(numeroMostrado.toString());
            item.container.valorAsignado = numeroMostrado; 
            item.container.setVisible(true);
        });
    }

    verificarSalto(valorElegido) {
        if (this.estado !== 'PRACTICA') return;

        const respuestaCorrecta = this.numeroActual + this.paso;

        if (valorElegido === respuestaCorrecta) {
            this.estado = 'SALTANDO';
            
            try { this.audio.hablar("¡Muy bien! " + respuestaCorrecta); } catch(e){}
            
            this.botonesUI.forEach(item => item.container.setVisible(false));
            
            this.numeroActual = respuestaCorrecta;
            
            const nuevaX = this.player.x + 240;
            const nuevaY = this.scale.height - 320; 
            
            this.crearPlataforma(nuevaX, nuevaY, this.numeroActual);

            this.player.setVelocityY(-450);
            this.tweens.add({
                targets: this.player,
                x: nuevaX,
                duration: 600,
                onComplete: () => {
                    // Usamos el objetivo dinámico
                    if (this.numeroActual >= this.objetivo) {
                        this.uiTexto.setText('¡LO LOGRASTE! 🎉');
                        this.uiTexto.setColor('#2ecc71');
                        try { this.audio.hablar("¡Excelente! Has llegado a la meta."); } catch(e){}
                        
                        this.cameras.main.flash(500, 46, 204, 113); 
                        this.time.delayedCall(2500, () => {
                            try { window.speechSynthesis.cancel(); } catch(e){}
                            this.scene.start('MainMenu');
                        });
                    } else {
                        this.time.delayedCall(500, () => {
                            try { this.audio.hablar('¿Y ahora?'); } catch(e){}
                            this.iniciarPractica(); 
                        });
                    }
                }
            });

        } else {
            try { this.audio.hablar("¡Casi! Sigue contando de " + this.paso + " en " + this.paso); } catch(e){}
            this.uiTexto.setText('¡Intenta de nuevo!');
            this.uiTexto.setColor('#e74c3c');
            this.cameras.main.shake(200, 0.01);
            
            this.time.delayedCall(1500, () => {
               if (this.estado === 'PRACTICA') {
                   this.uiTexto.setText('¡Tu turno!\n¿Qué número sigue?');
                   this.uiTexto.setColor('#4ecdc4');
               }
            });
        }
    }

    update() {
        const targetX = this.player.x - 250;
        this.cameras.main.scrollX = Phaser.Math.Linear(this.cameras.main.scrollX, targetX, 0.05);

        if (this.player.y > this.scale.height) {
            this.player.setPosition(this.player.x - 180, this.scale.height - 450);
            this.player.setVelocity(0);
        }
    }
}