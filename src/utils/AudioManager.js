export class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.vocesDisponibles = [];
        this.cargarVoces();
    }

    cargarVoces() {
        this.vocesDisponibles = window.speechSynthesis.getVoices();
        if (this.vocesDisponibles.length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                this.vocesDisponibles = window.speechSynthesis.getVoices();
            };
        }
    }

    hablar(texto) {
        if (!window.speechSynthesis) return;

        // Cancelamos cualquier audio previo
        window.speechSynthesis.cancel();

        const mensaje = new SpeechSynthesisUtterance(texto);
        mensaje.lang = 'es-MX'; 
        mensaje.rate = 1;       
        mensaje.pitch = 1.1;    

        const vocesEspanol = this.vocesDisponibles.filter(voz => voz.lang.startsWith('es-') || voz.lang === 'es');

        let vozFemenina = null;
        if (vocesEspanol.length > 0) {
            const nombresFemeninos = ['paulina', 'sabina', 'helena', 'monica', 'victoria', 'laura', 'luciana'];
            vozFemenina = vocesEspanol.find(voz => {
                const nombreVoz = voz.name.toLowerCase();
                return nombresFemeninos.some(nombre => nombreVoz.includes(nombre));
            });
            if (!vozFemenina) {
                vozFemenina = vocesEspanol.find(voz => voz.lang === 'es-MX' || voz.lang === 'es-US' || voz.lang === 'es-419') || vocesEspanol[0];
            }
        }

        if (vozFemenina) {
            mensaje.voice = vozFemenina;
        }

        window.speechSynthesis.speak(mensaje);
    }
}