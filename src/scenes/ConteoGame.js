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

        // 1. FONDO
        this.add.image(width / 2, height / 2, 'sky').setScrollFactor(0.1).setAlpha(0.6);
        
        // 2. BOTÓN SALIR (Estilo consistente con los demás niveles)
        const btnVolver = this.add.container(80, 50).setDepth(1000).setScrollFactor(0);
        const bgVolver = this.add.graphics({ fillStyle: { color: 0xe74c3c } });
        bgVolver.fillRoundedRect(-55, -20, 110, 40, 20); 
        bgVolver.setInteractive(new Phaser.Geom.Rectangle(-55, -20, 110, 40), Phaser.Geom.Rectangle.Contains);
        bgVolver.setInteractive({ useHandCursor: true });
        
        const txtVolver = this.add.text(0, 0, '← SALIR', { fontSize: '16px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        btnVolver.add([bgVolver, txtVolver]);
        bgVolver.on('pointerdown', () => this.scene.start('MainMenu'));

        // 3. FÍSICAS Y PERSONAJE
        this.plataformas = this.physics.add.staticGroup();
        // Empezamos más arriba para dar espacio a los botones
        this.player = this.physics.add.sprite(100, height - 300, 'dude'); 
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(false); 
        this.physics.add.collider(this.player, this.plataformas);

        // 4. UI PRINCIPAL (Cartel superior elegante)
        const tituloY = 100;
        const bgTitulo = this.add.graphics({ fillStyle: { color: 0x2c3e50, alpha: 1 } }).setScrollFactor(0).setDepth(990);
        bgTitulo.fillRoundedRect((width/2) - 220, tituloY - 45, 440, 90, 20);
        bgTitulo.lineStyle(4, 0xf1c40f, 1); 
        bgTitulo.strokeRoundedRect((width/2) - 220, tituloY - 45, 440, 90, 20);

        this.uiTexto = this.add.text(width / 2, tituloY, '¡Mira cómo cuento\nde 2 en 2!', {
            fontSize: '28px', fontFamily: 'Arial Black', fill: '#f1c40f', stroke: '#000', strokeThickness: 5, align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

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
                try { this.audio.hablar('¡Ahora te toca a ti! ¿Qué número sigue?'); } catch(e){}
                this.uiTexto.setText('¡Tu turno!\n¿Qué número sigue?');
                this.uiTexto.setColor('#4ecdc4');
                this.iniciarPractica();
            });
            return;
        }

        this.numeroActual += this.paso;
        // Distancia más amplia para móviles y altura más elevada para no tapar los botones
        const nuevaX = this.numeroActual === 2 ? this.player.x + 100 : this.player.x + 240; 
        const nuevaY = this.scale.height - 250; 
        
        this.crearPlataforma(nuevaX, nuevaY, this.numeroActual);

        // Salto automático
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
            fontSize: '34px', fontFamily: 'Arial Black', fill: '#ffff00', stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5);
        return plat;
    }

    setupControlesPractica() {
        const { width, height } = this.scale;
        const yPos = height - 120; // Pegados a la parte inferior
        
        // Creamos tres botones dinámicos vacíos e invisibles (Centro, Izquierda, Derecha)
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
            fontSize: '48px', fill: '#fff', fontWeight: 'bold', fontFamily: 'Arial Black', stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5);

        container.add([bgShadow, bg, txt]);

        // Interactividad 100% segura
        container.on('pointerdown', () => { container.setScale(0.92); });
        container.on('pointerout', () => { container.setScale(1); });
        container.on('pointerup', () => { 
            container.setScale(1);
            this.time.delayedCall(50, () => this.verificarSalto(container.valorAsignado));
        });

        // Guardamos las referencias en nuestro array para modificarlas luego
        this.botonesUI.push({ container, txt });
    }

    iniciarPractica() {
        this.estado = 'PRACTICA';
        
        // ¡LA NUEVA LÓGICA DE NÚMEROS ABSOLUTOS!
        const respuestaCorrecta = this.numeroActual + this.paso;
        
        // Creamos las opciones: La correcta, una menor y una mayor
        const opciones = [
            respuestaCorrecta, 
            respuestaCorrecta - 1, 
            respuestaCorrecta + 1
        ]; 
        
        Phaser.Utils.Array.Shuffle(opciones); // Las desordenamos
        
        // Asignamos los nuevos números a los botones cada vez que le toca al jugador
        this.botonesUI.forEach((item, index) => {
            const numeroMostrado = opciones[index];
            item.txt.setText(numeroMostrado.toString());
            item.container.valorAsignado = numeroMostrado; // Guardamos el valor real del botón
            item.container.setVisible(true);
        });
    }

    verificarSalto(valorElegido) {
        if (this.estado !== 'PRACTICA') return;

        const respuestaCorrecta = this.numeroActual + this.paso;

        if (valorElegido === respuestaCorrecta) {
            this.estado = 'SALTANDO';
            
            try { this.audio.hablar("¡Muy bien! " + respuestaCorrecta); } catch(e){}
            
            // Ocultamos botones temporalmente mientras salta
            this.botonesUI.forEach(item => item.container.setVisible(false));
            
            this.numeroActual = respuestaCorrecta;
            
            const nuevaX = this.player.x + 240;
            const nuevaY = this.scale.height - 250;
            
            this.crearPlataforma(nuevaX, nuevaY, this.numeroActual);

            this.player.setVelocityY(-450);
            this.tweens.add({
                targets: this.player,
                x: nuevaX,
                duration: 600,
                onComplete: () => {
                    if (this.numeroActual >= this.objetivo) {
                        this.uiTexto.setText('¡LO LOGRASTE! 🎉');
                        this.uiTexto.setColor('#2ecc71');
                        try { this.audio.hablar("¡Excelente! Has llegado a la meta."); } catch(e){}
                        
                        this.cameras.main.flash(500, 46, 204, 113); 
                        this.time.delayedCall(2500, () => this.scene.start('MainMenu'));
                    } else {
                        // Siguiente turno
                        this.time.delayedCall(500, () => {
                            try { this.audio.hablar('¿Y ahora?'); } catch(e){}
                            this.iniciarPractica(); // Esto vuelve a generar números nuevos automáticamente
                        });
                    }
                }
            });

        } else {
            // Se equivocó
            try { this.audio.hablar("¡Casi! Sigue contando de " + this.paso + " en " + this.paso); } catch(e){}
            this.uiTexto.setText('¡Intenta de nuevo!');
            this.uiTexto.setColor('#e74c3c');
            this.cameras.main.shake(200, 0.01);
            
            // Restauramos el texto original tras equivocarse
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
            this.player.setPosition(this.player.x - 180, this.scale.height - 350);
            this.player.setVelocity(0);
        }
    }
}