// Compartido entre el layout (servidor) y el switch (cliente).

export const THEME_STORAGE_KEY = "sazon:theme";

/**
 * Se ejecuta inline en <head>, antes de pintar la página y antes de que
 * cargue React: aplica el tema guardado y evita el "parpadeo" de tema.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;}catch(e){}})();`;
