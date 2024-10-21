
MESASHARE

Este proyecto es una aplicación móvil construida utilizando Capacitor y varias dependencias de npm para integrar funciones como escaneo de códigos de barras, acceso a la cámara, gestión de bases de datos SQLite y más. Esta guía te llevará a través de los pasos necesarios para configurar el proyecto e instalar las dependencias requeridas.

Requisitos Previos
Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu máquina:

Node.js (v14.x o posterior)

npm (v6.x o posterior)

Capacitor CLI

Android Studio (para compilaciones de Android)

Xcode (para compilaciones de iOS)

Instalación
Sigue estos pasos para instalar las dependencias necesarias y ejecutar el proyecto.


Ejecuta los siguientes comandos para instalar los plugins específicos y dependencias utilizadas en este proyecto:


npm install @capacitor/core @capacitor/cli --legacy-peer-deps

npm install -g json-server@0.17.3 --legacy-peer-deps

npm install json-server@0.17.3 --save-dev

npm install --save qrcode --legacy-peer-deps

npm install @capacitor-community/barcode-scanner --legacy-peer-deps

npm install @capacitor/camera --legacy-peer-deps

npm install @capacitor-community/sqlite --legacy-peer-deps

npm install @capacitor/storage --legacy-peer-deps

npm install --save sql.js --legacy-peer-deps

npm install --save jeep-sqlite --legacy-peer-deps

npm install @capacitor/preferences --legacy-peer-deps

npm install @capacitor/device --legacy-peer-deps

npm install jspdf --legacy-peer-deps

npm install @capacitor/share --legacy-peer-deps

npm install @capacitor/filesystem --legacy-peer-deps


Paso 4: Sincronizar con Capacitor
Después de instalar todos los paquetes necesarios, asegúrate de que Capacitor esté correctamente sincronizado con tu proyecto nativo de Android o iOS.

npx cap sync

Paso 5: Iniciar el Servidor JSON
Para simular una API REST usando json-server, inícialo con el siguiente comando:

json-server --watch db.json --port 3000

Paso 6: Ejecutar el Proyecto
Para ejecutar el proyecto en el navegador, usa:
npm start

Para ejecutar el proyecto en un dispositivo Android o iOS, asegúrate de que tu entorno de compilación nativo (Android Studio/Xcode) esté configurado y utiliza los siguientes comandos:

Para Android: npx cap open android

Para iOS: npx cap open ios

Funcionalidades
Este proyecto incluye las siguientes características clave:

Escaneo de Códigos de Barras: Integra un escáner de códigos de barras usando el plugin @capacitor-community/barcode-scanner.

Acceso a la Cámara: Captura imágenes usando la cámara del dispositivo con el plugin @capacitor/camera.

Almacenamiento Local: Almacena datos localmente en el dispositivo usando SQLite (@capacitor-community/sqlite).

Preferencias: Gestiona preferencias utilizando @capacitor/preferences.

Compartir Archivos: Permite compartir archivos con @capacitor/share.

Generación de PDF: Genera archivos PDF usando jspdf.


Resolución de Problemas
Dependencias Peer Legadas
Para evitar conflictos potenciales con las dependencias peer, se utiliza el parámetro --legacy-peer-deps durante la instalación. Si encuentras problemas, asegúrate de estar utilizando la versión correcta de Node.js y npm.


Problemas con Compilación en Android/iOS
Asegúrate de tener instaladas las versiones más recientes de Android Studio y Xcode si encuentras problemas al compilar las versiones móviles.

Licencia
Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.

