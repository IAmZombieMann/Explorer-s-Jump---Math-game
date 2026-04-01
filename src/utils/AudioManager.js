export class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.synth = window.speechSynthesis;
    }

    // Voz que narra las instrucciones
    hablar(texto) {
        // Cancelar cualquier voz previa para no solaparse
        this.synth.cancel();
        
        const mensaje = new SpeechSynthesisUtterance(texto);
        mensaje.lang = 'es-MX'; // Español Latino
        mensaje.pitch = 1.2;    // Voz un poco más aguda/infantil
        mensaje.rate = 0.9;     // Un poco más lento para que entiendan bien
        
        this.synth.speak(mensaje);
    }

    // Efectos de sonido rápidos (Cargar en Preloader antes)
    playSFX(key) {
        if (this.scene.sound.get(key)) {
            this.scene.sound.play(key, { volume: 0.5 });
        }
    }
}