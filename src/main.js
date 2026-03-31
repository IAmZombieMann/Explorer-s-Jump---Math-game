import Phaser from 'https://esm.run/phaser';

// Importamos las escenas
import { Preloader } from './scenes/Preloader.js';
import { MainMenu } from './scenes/MainMenu.js';
import { ConteoGame } from './scenes/ConteoGame.js';
import { ValorPosicionalGame } from './src/scenes/ValorPosicionalGame.js';

/**
 * Configuración central del motor Phaser 3
 * Optimizada para dispositivos móviles (Mobile-First)
 */
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    
    // Resolución nativa de diseño (16:9)
    width: 1024,   
    height: 576,
    
    backgroundColor: '#1a1a2e', 
    
    scale: {
        mode: Phaser.Scale.FIT, 
        autoCenter: Phaser.Scale.CENTER_BOTH,
        autoRound: true
    },

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 }, 
            debug: false         
        }
    },

    // ¡IMPORTANTE! Deben estar todas aquí para poder navegar entre ellas
    scene: [
        Preloader, 
        MainMenu,
        ConteoGame,
        ValorPosicionalGame
    ],

    render: {
        pixelArt: false,
        antialias: true
    }
};

// Inicialización del juego
const game = new Phaser.Game(config);

export default game;