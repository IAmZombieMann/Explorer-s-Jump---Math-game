import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import { Preloader } from './scenes/Preloader.js';
import { MainMenu } from './scenes/MainMenu.js';
import { ConteoGame } from './scenes/ConteoGame.js';
import { ValorPosicionalGame } from './scenes/ValorPosicionalGame.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    
    // Tamaño base interno del juego (Proporción 16:9)
    width: 1024,   
    height: 576,
    
    scale: {
        // FIT ajusta el juego a la pantalla del móvil sin deformarlo
        mode: Phaser.Scale.FIT, 
        // Lo centra usando las matemáticas internas de Phaser
        autoCenter: Phaser.Scale.CENTER_BOTH,
        autoRound: true
    },

    backgroundColor: '#1a1a2e', 

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 }, 
            debug: false         
        }
    },

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

const game = new Phaser.Game(config);

export default game;