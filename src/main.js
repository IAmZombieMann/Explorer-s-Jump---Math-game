import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import { Preloader } from './scenes/Preloader.js';
import { MainMenu } from './scenes/MainMenu.js';
import { ConteoGame } from './scenes/ConteoGame.js';
import { ValorPosicionalGame } from './scenes/ValorPosicionalGame.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    
    // FORMATO VERTICAL (Mobile Portrait)
    width: 720,   
    height: 1280,
    
    scale: {
        mode: Phaser.Scale.FIT, 
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