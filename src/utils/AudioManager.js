export class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.vocesDisponibles = [];
        
        // Cargamos las voces apenas se inicia el juego
        this.cargarVoces();
    }

    cargarVoces() {
        // Obtenemos la lista de voces
        this.vocesDisponibles = window.speechSynthesis.getVoices();
        
        // Safari y Chrome a veces demoran unos milisegundos en cargar la lista,
        // este evento asegura que las capturemos en cuanto estén listas.
        if (this.vocesDisponibles.length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                this.vocesDisponibles = window.speechSynthesis.getVoices();
            };
        }
    }

    hablar(texto) {
        // Verificamos si el navegador soporta síntesis de voz
        if (!window.speechSynthesis) return;

        // Cancelamos cualquier audio anterior para evitar que se trabe
        window.speechSynthesis.cancel();

        const mensaje = new SpeechSynthesisUtterance(texto);
        mensaje.lang = 'es-MX'; // Idioma base
        mensaje.rate = 0.8;       // Velocidad normal
        mensaje.pitch = 1.1;    // Un tono ligerísimamente más alto (ayuda a que suene más femenina/infantil)

        // 1. Filtramos TODAS las voces que hablen español
        const vocesEspanol = this.vocesDisponibles.filter(voz => voz.lang.startsWith('es-') || voz.lang === 'es');

        let vozFemenina = null;

        if (vocesEspanol.length > 0) {
            // 2. Lista de nombres de voces femeninas conocidas en iOS, Mac y Windows
            const nombresFemeninos = ['paulina', 'sabina', 'helena', 'monica', 'victoria', 'laura', 'luciana'];

            // 3. Buscamos si el dispositivo tiene alguna de estas voces instaladas
            vozFemenina = vocesEspanol.find(voz => {
                const nombreVoz = voz.name.toLowerCase();
                return nombresFemeninos.some(nombre => nombreVoz.includes(nombre));
            });

            // 4. Fallback (Plan B): Si no hay ninguna con esos nombres (ej. en Android),
            // tomamos la primera voz latina disponible (MX o US), que por defecto suele ser femenina.
            if (!vozFemenina) {
                vozFemenina = vocesEspanol.find(voz => voz.lang === 'es-MX' || voz.lang === 'es-US' || voz.lang === 'es-419') || vocesEspanol[0];
            }
        }

        // Si encontramos nuestra voz ideal, se la asignamos al mensaje
        if (vozFemenina) {
            mensaje.voice = vozFemenina;
        }

        // Reproducimos
        window.speechSynthesis.speak(mensaje);
    }
}