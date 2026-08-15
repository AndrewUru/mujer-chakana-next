# ✨ GINERGETICA NEXT

**GINERGETICA Next** es una aplicación web espiritual y cíclica, diseñada con amor para acompañar el recorrido de autoconocimiento, conexión lunar y florecimiento interior de mujeres que vibran con su energía ancestral.

🔗 Sitio oficial del proyecto: [samariluz.com](https://samariluz.com)

---

## 🌙 ¿Qué es GINERGETICA?

**GINERGETICA** es una guía digital viva que integra:

- 🄀 Autoconocimiento cíclico emocional, biológico, creativo y espiritual.
- 🧬 Ginergía: la energía natural del ciclo femenino.
- 🌕 Moonboards: mandalas lunares donde cada día se convierte en espejo del alma.
- 🔥 Un espacio para registrar emociones, conectar con el cuerpo y recordar quiénes somos.

Este proyecto nace de la visión canalizada por **Samarí Luz** y se entrelaza con el tejido sagrado de [samariluz.com](https://samariluz.com).

---

## 🛠️ Tecnologías

- Next.js – framework React moderno.
- Supabase – base de datos y autenticación.
- Tailwind CSS – estilos suaves y responsivos.
- Lucide Icons – íconos simbólicos y sutiles.
- NextAuth.js – autenticación segura (planificada para futuras versiones).
- 🧠 OpenAI (GPT-4o) – nueva integración de inteligencia artificial.

---

## ✨ Nueva funcionalidad: Reflexiones generadas por IA

La aplicación ahora utiliza la inteligencia artificial de **OpenAI** para ofrecer a cada usuaria una **reflexión diaria personalizada** basada en sus registros de:

- Emociones
- Energía
- Creatividad
- Espiritualidad
- Notas personales

Cada vez que una usuaria guarda su huella del día, recibe un mensaje canalizado que inspira y reconecta con su ciclo y arquetipo diario, siguiendo la simbología y el lenguaje de la **Rueda Mujer Chakana** y la visión MaikU·.

_Ejemplo:_  
"Hoy tu intuición te invita a sembrar en calma y florecer en tu fuego interior."

---

## 🔐 Características

- Registro e inicio de sesión con Supabase Auth.
- Moonboard digital personalizado según el ciclo.
- Reflexiones diarias generadas con IA (OpenAI GPT-4o).
- Navegación móvil amigable, pensada para acompañar día a día.
- Panel de configuración con acceso al manual integrativo.
- Perfil con avatar y datos energéticos.
- ✨ Panel de Administración:
  - Crear, editar y eliminar Arquetipos Mujer Chakana.
  - Subir recursos complementarios (audios, PDFs, imágenes).
  - Visualización previa de imágenes, audio y documentos PDF.
- Integración directa con Supabase Storage para gestión de archivos.

## 💳 Suscripción Premium

Ahora GINERGETICA permite suscripciones seguras a través de **PayPal**:

- Plan mensual: 2,99 € / mes.
- Plan anual: 29,99 € / año.

Características:

- Los botones de suscripción se integran dinámicamente usando el SDK oficial de PayPal.
- Al completar el pago, el perfil del usuario se actualiza en Supabase (`perfiles.suscripcion_activa = true`).
- El usuario es redirigido automáticamente a su **Dashboard**.

> El código cumple con los estándares ESLint y TypeScript, evitando el uso de `any` y controlando la duplicación de botones en el DOM.

---

## 🗓️ Instalación

Sigue estos pasos para instalar y ejecutar el proyecto localmente:

1. Clona este repositorio:

```bash
git clone https://github.com/AndrewUru/mujer-chakana-next.git
```

2. Navega al directorio del proyecto:

```bash
cd mujer-chakana-next
```

3. Instala las dependencias:

```bash
npm install
```

4. Configura las variables de entorno:

Crea un archivo `.env.local` y agrega tus claves de Supabase y OpenAI:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
# Opcionales: permiten cambiar de modelo sin modificar el código
OPENAI_CHAT_MODEL=gpt-5.6-luna
OPENAI_REFLECTION_MODEL=gpt-5.6-luna
```

5. Inicia el servidor de desarrollo:

```bash
npm run dev
```

Accede a la aplicación en tu navegador en `http://localhost:3000`.

---

## 🌱 Contribución

Si deseas contribuir, por favor sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una rama para tu funcionalidad o corrección:

```bash
git checkout -b nombre-de-la-rama
```

3. Realiza tus cambios y haz un commit:

```bash
git commit -m "Descripción de los cambios"
```

4. Envía tus cambios al repositorio remoto:

```bash
git push origin nombre-de-la-rama
```

5. Abre un Pull Request.

Este proyecto está abierto a quienes deseen co-crear desde la sensibilidad, el respeto y el amor por lo cíclico.

---

## 📜 Licencia

Este proyecto está bajo la licencia Creative Commons BY-NC-SA.  
Consulta el archivo `LICENSE` para más detalles.  
**Canalizado por Samarí Luz · Implementado por [@AndrewUru](https://github.com/AndrewUru)**  
Todos los derechos reservados © Ginergía, Centro de Estudios de Metafísica Nativa A.C.  
**Uso personal, educativo y terapéutico.**

---

## 📬 Contacto

¿Tienes preguntas, inspiración o ganas de colaborar?

📧 atobio459@gmail.com

> "Cuando me escucho, recuerdo quién soy." – GINERGETICA
