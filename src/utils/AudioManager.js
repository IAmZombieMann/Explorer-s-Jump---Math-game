export class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.vocesDisponibles = [];
        
        // Cargamos las voces apenas se inicia el juego
        this.cargarVoces();
    }

    cargarVoces() {
        // En Safari, a veces las voces tardan un poco en cargar, 
        // así que usamos este evento para capturarlas en cuanto estén listas.
        this.vocesDisponibles = window.speechSynthesis.getVoices();
        
        if (this.vocesDisponibles.length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                this.vocesDisponibles = window.speechSynthesis.getVoices();
            };
        }
    }

    hablar(texto) {
        // Verificamos si el navegador soporta síntesis de voz
        if (!window.speechSynthesis) return;

        // Cancelamos cualquier audio que se esté reproduciendo (Evita que Safari se trabe)
        window.speechSynthesis.cancel();

        const mensaje = new SpeechSynthesisUtterance(texto);
        
        // 1. Configuramos el idioma por defecto
        mensaje.lang = 'es-MX'; 
        mensaje.rate = 1; // Velocidad normal

        // 2. Buscamos EXPLÍCITAMENTE una voz en español para obligar a iOS Safari a usarla
        // Primero intentamos buscar latino (MX o US), si no, cualquier español (ES)
        let vozEspanol = this.vocesDisponibles.find(voz => voz.lang === 'es-MX' || voz.lang === 'es-US' || voz.lang === 'es-419');
        
        if (!vozEspanol) {
            vozEspanol = this.vocesDisponibles.find(voz => voz.lang.startsWith('es-'));
        }

        // 3. Si encontramos la voz, se la asignamos directamente al mensaje
        if (vozEspanol) {
            mensaje.voice = vozEspanol;
        }

        // 4. Reproducimos
        window.speechSynthesis.speak(mensaje);
    }
}