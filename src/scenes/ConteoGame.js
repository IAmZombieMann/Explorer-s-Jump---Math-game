import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import { AudioManager } from '../utils/AudioManager.js';

export class ConteoGame extends Phaser.Scene {
    constructor() {
        super('ConteoGame');
    }

    init() {
        this.paso = 2; 
        this.numeroActual = 0;
        this.objetivo = 20;
        this.estado = 'EXPLICACION'; 
        this.botonesUI = []; 
    }

    create() {
        const { width, height } = this.scale;
        this.audio = new AudioManager(this);

        // 1. Fondo (con scroll lento para efecto Parallax)
        this.add.image(width / 2, height / 2, 'sky').setScrollFactor(0.1).setAlpha(0.6);
        
        // 2. BOTÓN VOLVER (Sin contenedor, fijado a la cámara primero)
        const bgVolver = this.add.rectangle(70, 40, 110, 40, 0xe74c3c)
            .setDepth(1000)
            .setScrollFactor(0) // IMPORTANTE: Primero se fija a la pantalla
            .setInteractive({ useHandCursor: true }); // Luego se hace interactivo
            
        const txtVolver = this.add.text(70, 40, '← VOLVER', { fontSize: '16px', fill: '#fff', fontWeight: 'bold' })
            .setOrigin(0.5)
            .setDepth(1001)
            .setScrollFactor(0);

        bgVolver.on('pointerdown', () => this.scene.start('MainMenu'));

        // 3. Grupo de plataformas con colisión
        this.plataformas = this.physics.add.staticGroup();

        // 4. Personaje
        this.player = this.physics.add.sprite(100, height - 150, 'dude');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(false); // Falso para que pueda avanzar libremente

        // 5. Colisionador permanente
        this.physics.add.collider(this.player, this.plataformas);

        // 6. UI Principal (Fija en pantalla)
        this.uiTexto = this.add.text(width / 2, 80, '¡Mira cómo cuento de 2 en 2!', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000000aa',
            padding: { x: 20, y: 10 },
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        this.setupControlesPractica();
        this.iniciarExplicacion();
    }

    iniciarExplicacion() {
        this.estado = 'EXPLICACION';
        this.mostrarSiguienteSalto();
    }

    mostrarSiguienteSalto() {
        if (this.numeroActual >= 10) {
            this.time.delayedCall(1000, () => {
                // Bloque Try/Catch por si el audio está bloqueado por el navegador
                try { this.audio.hablar('¡Ahora te toca a ti! Salta de dos en dos'); } catch(e){}
                
                this.uiTexto.setText('¡Tu turno! \n Elige el salto correcto');
                this.iniciarPractica();
            });
            return;
        }

        this.numeroActual += this.paso;
        this.crearPlataforma(this.player.x + 180, this.scale.height - 120, this.numeroActual);

        // Salto automático
        this.player.setVelocityY(-350);
        this.tweens.add({
            targets: this.player,
            x: this.player.x + 180,
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
            fontSize: '32px', fontStyle: 'bold', fill: '#ffff00', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);
        return plat;
    }

    setupControlesPractica() {
        const { width, height } = this.scale;
        
        const opciones = [this.paso, this.paso + 1, 1]; 
        Phaser.Utils.Array.Shuffle(opciones); // Mezclamos las opciones
        
        opciones.forEach((num, i) => {
            const xPos = width/2 + (i-1)*180;
            const yPos = height - 80;

            // EL SECRETO: El orden de estos métodos es vital para que funcionen con la cámara
            const btn = this.add.rectangle(xPos, yPos, 140, 90, 0x3498db, 0.8)
                .setDepth(100)
                .setScrollFactor(0) // 1. FIJAR A LA PANTALLA
                .setInteractive({ useHandCursor: true }) // 2. HACER INTERACTIVO DESPUÉS
                .setStrokeStyle(4, 0xffffff)
                .setVisible(false);
            
            const txt = this.add.text(xPos, yPos, `+${num}`, { fontSize: '36px', fill: '#fff', fontWeight: 'bold' })
                .setOrigin(0.5)
                .setDepth(101)
                .setScrollFactor(0)
                .setVisible(false);
            
            btn.on('pointerdown', () => this.verificarSalto(num));
            
            this.botonesUI.push({ btn, txt });
        });
    }

    iniciarPractica() {
        this.estado = 'PRACTICA';
        this.botonesUI.forEach(item => {
            item.btn.setVisible(true);
            item.txt.setVisible(true);
        });
    }

    verificarSalto(valorElegido) {
        if (this.estado !== 'PRACTICA') return;

        if (valorElegido === this.paso) {
            this.estado = 'SALTANDO'; // Evita doble clic accidental
            try { this.audio.hablar("¡Muy bien!"); } catch(e){}
            this.numeroActual += this.paso;
            
            const nuevaX = this.player.x + 180;
            const nuevaY = this.scale.height - 120;
            
            this.crearPlataforma(nuevaX, nuevaY, this.numeroActual);

            this.player.setVelocityY(-350);
            this.tweens.add({
                targets: this.player,
                x: nuevaX,
                duration: 600,
                onComplete: () => {
                    if (this.numeroActual >= this.objetivo) {
                        this.uiTexto.setText('¡LO LOGRASTE!');
                        try { this.audio.hablar("¡Excelente! Has llegado a la meta."); } catch(e){}
                        
                        this.botonesUI.forEach(item => { item.btn.setVisible(false); item.txt.setVisible(false); });
                        this.cameras.main.flash(500, 46, 204, 113); 
                        
                        this.time.delayedCall(2500, () => this.scene.start('MainMenu'));
                    } else {
                        this.estado = 'PRACTICA';
                    }
                }
            });

        } else {
            try { this.audio.hablar("¡Casi! Intenta sumar " + this.paso); } catch(e){}
            this.cameras.main.shake(200, 0.01);
        }
    }

    update() {
        // Seguimiento de cámara
        const targetX = this.player.x - 250;
        this.cameras.main.scrollX = Phaser.Math.Linear(this.cameras.main.scrollX, targetX, 0.05);

        // Si el niño se cae de la plataforma (Fail safe)
        if (this.player.y > this.scale.height) {
            this.player.setPosition(this.player.x - 180, this.scale.height - 250);
            this.player.setVelocity(0);
        }
    }
}