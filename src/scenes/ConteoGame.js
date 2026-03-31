import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import { AudioManager } from '../utils/AudioManager.js';

export class ConteoGame extends Phaser.Scene {
    constructor() {
        super('ConteoGame');
        this.paso = 2; 
        this.numeroActual = 0;
        this.objetivo = 20;
        this.estado = 'EXPLICACION'; 
    }

    create() {
        const { width, height } = this.scale;
        this.audio = new AudioManager(this);

        // Reset de variables al iniciar la escena
        this.numeroActual = 0;

        // 1. Fondo (con scroll lento para efecto Parallax)
        this.add.image(width / 2, height / 2, 'sky').setScrollFactor(0.1).setAlpha(0.6);
        
        // 2. Grupo de plataformas con colisión
        this.plataformas = this.physics.add.staticGroup();

        // 3. Personaje
        this.player = this.physics.add.sprite(100, height - 150, 'dude');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(false); // Falso para que pueda avanzar libremente

        // 4. Colisionador permanente
        this.physics.add.collider(this.player, this.plataformas);

        // 5. UI
        this.uiTexto = this.add.text(width / 2, 80, '¡Mira cómo cuento de 2 en 2!', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000000aa',
            padding: { x: 20, y: 10 },
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10);

        this.setupControlesPráctica();
        this.iniciarExplicacion();
    }

    iniciarExplicacion() {
        this.estado = 'EXPLICACION';
        this.mostrarSiguienteSalto();
    }

    mostrarSiguienteSalto() {
        if (this.numeroActual >= 10) {
            this.time.delayedCall(1000, () => {
                this.audio.hablar('¡Ahora te toca a ti! Salta de dos en dos');
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
            onStart: () => this.audio.hablar(this.numeroActual.toString()),
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

    setupControlesPráctica() {
        const { width, height } = this.scale;
        this.btnGroup = this.add.container(0, 0).setVisible(false).setScrollFactor(0).setDepth(10);

        // Opciones fijas basadas en el paso actual
        const opciones = [this.paso, this.paso + 1, 1]; // El paso correcto, uno más, o solo uno
        
        opciones.sort(() => Math.random() - 0.5).forEach((num, i) => {
            const btn = this.add.rectangle(width/2 + (i-1)*180, height - 80, 140, 90, 0x3498db, 0.8)
                .setInteractive()
                .setStrokeStyle(4, 0xffffff);
            
            const txt = this.add.text(btn.x, btn.y, `+${num}`, { fontSize: '36px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
            
            btn.on('pointerdown', () => this.verificarSalto(num));
            this.btnGroup.add([btn, txt]);
        });
    }

    iniciarPractica() {
        this.estado = 'PRACTICA';
        this.btnGroup.setVisible(true);
    }

    verificarSalto(valorElegido) {
        if (this.estado !== 'PRACTICA') return;

        if (valorElegido === this.paso) {
            this.audio.hablar("¡Muy bien!");
            this.numeroActual += this.paso;
            
            const nuevaX = this.player.x + 180;
            const nuevaY = this.scale.height - 120;
            
            this.crearPlataforma(nuevaX, nuevaY, this.numeroActual);

            // Salto del jugador al acertar
            this.player.setVelocityY(-350);
            this.tweens.add({
                targets: this.player,
                x: nuevaX,
                duration: 600
            });

        } else {
            this.audio.hablar("¡Casi! Intenta sumar " + this.paso);
            this.cameras.main.shake(200, 0.01);
        }
    }

    update() {
        // Seguimiento suave de cámara
        const targetX = this.player.x - 250;
        this.cameras.main.scrollX = Phaser.Math.Linear(this.cameras.main.scrollX, targetX, 0.05);

        // Si el niño se cae de la plataforma (Fail safe)
        if (this.player.y > this.scale.height) {
            this.player.setPosition(this.player.x - 180, this.scale.height - 250);
            this.player.setVelocity(0);
        }
    }
}