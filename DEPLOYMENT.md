# 🚀 Guía de Despliegue en GitHub Pages

Esta guía te ayudará a desplegar **PharmaLocal** en GitHub Pages.

## 📋 Requisitos Previos

- Tener una cuenta de GitHub
- El repositorio debe estar en GitHub
- Permisos para configurar GitHub Pages en el repositorio

## 🔧 Configuración Automática (Recomendado)

El proyecto ya está configurado para desplegarse automáticamente con GitHub Actions.

### Pasos:

1. **Habilita GitHub Pages en tu repositorio:**
   - Ve a tu repositorio en GitHub
   - Click en **Settings** (Configuración)
   - En el menú lateral, click en **Pages**
   - En **Source** (Origen), selecciona **GitHub Actions**

2. **Haz push de tu código a la rama `main`:**
   ```bash
   git push origin main
   ```

3. **El despliegue se ejecutará automáticamente:**
   - Ve a la pestaña **Actions** en tu repositorio
   - Verás el workflow "Deploy to GitHub Pages" ejecutándose
   - Espera a que termine (toma unos 2-3 minutos)

4. **Accede a tu aplicación:**
   - Tu app estará disponible en: `https://[tu-usuario].github.io/literate-palm-tree/`
   - O el dominio personalizado que hayas configurado

## 🛠️ Despliegue Manual (Alternativo)

Si prefieres desplegar manualmente sin GitHub Actions:

1. **Construye el proyecto:**
   ```bash
   npm run build
   ```

2. **Instala gh-pages:**
   ```bash
   npm install -D gh-pages
   ```

3. **Añade scripts al package.json:**
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

4. **Despliega:**
   ```bash
   npm run deploy
   ```

5. **Configura la rama gh-pages:**
   - Ve a Settings > Pages
   - Selecciona la rama `gh-pages` como source
   - La carpeta debe ser `/ (root)`

## ✅ Verificación del Despliegue

Una vez desplegado, verifica:

1. ✅ La aplicación se carga correctamente
2. ✅ Los estilos (Tailwind CSS) se aplican
3. ✅ Los datos se guardan en localStorage
4. ✅ La navegación entre secciones funciona
5. ✅ Las hojas de tratamiento se pueden imprimir

## 🔍 Solución de Problemas

### La página muestra 404
- Verifica que GitHub Pages esté habilitado
- Asegúrate de que el workflow se completó exitosamente
- Revisa que la configuración de `base` en `vite.config.ts` coincida con el nombre del repositorio

### Los estilos no se cargan
- Verifica que el archivo `.nojekyll` esté en la carpeta `dist`
- Comprueba la configuración de `base` en `vite.config.ts`

### Los datos no persisten
- localStorage funciona en HTTPS y localhost, pero no en HTTP simple
- GitHub Pages usa HTTPS automáticamente, así que no debería haber problema

## 🌐 Dominio Personalizado (Opcional)

Para usar un dominio personalizado:

1. Ve a Settings > Pages
2. En "Custom domain", ingresa tu dominio
3. Configura los DNS records según las instrucciones de GitHub
4. Espera a que se active HTTPS (puede tardar hasta 24 horas)

## 📝 Notas Importantes

- **Privacidad**: Todos los datos se almacenan localmente en el navegador del usuario
- **Sin Backend**: La aplicación es completamente estática
- **Compatibilidad**: Funciona en todos los navegadores modernos
- **Offline**: Una vez cargada, la app funciona sin conexión a internet

## 🔄 Actualizaciones

Para desplegar cambios:

1. Haz tus modificaciones en el código
2. Commit los cambios:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   ```
3. Push a main:
   ```bash
   git push origin main
   ```
4. El workflow de GitHub Actions se ejecutará automáticamente

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs del workflow en la pestaña Actions
2. Verifica la consola del navegador para errores
3. Asegúrate de que todas las dependencias estén instaladas

---

**¡Tu aplicación PharmaLocal está lista para ser usada por profesionales de la salud en todo el mundo! 🏥💊**
