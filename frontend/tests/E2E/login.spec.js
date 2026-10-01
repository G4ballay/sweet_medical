import { expect, test } from '@playwright/test';

test.describe('Flujo de Autenticación - Sweet Medical', () => {

  test('Debería iniciar sesión con credenciales válidas y redirigir a /inicio', async ({ page }) => {
    await page.goto('/iniciar-sesion');

    await page.locator('input[name="identifier"]').fill('gonzalo@testing.com.ar');
    await page.locator('input[name="password"]').fill('ContraseñaGonzalo123');

    const respuestaLoginPromise = page.waitForResponse(response =>
      response.url().includes('/sessions') && response.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    const respuestaApi = await respuestaLoginPromise;
    expect(respuestaApi.status()).toBe(200);

    await expect(page).toHaveURL('/inicio');

    const tokenGuardado = await page.evaluate(() => localStorage.getItem('sweet-medical-token'));
    expect(tokenGuardado).toBeTruthy();
  });

  test('Debería mostrar error en la pantalla si el backend rechaza las credenciales', async ({ page }) => {
    await page.goto('/iniciar-sesion');

    await page.locator('input[name="identifier"]').fill('no_existo@medical.com');
    await page.locator('input[name="password"]').fill('ClaveFalsa123');

    const respuestaApiPromise = page.waitForResponse(response =>
      response.url().includes('/sessions') && response.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    const respuestaApi = await respuestaApiPromise;
    expect(respuestaApi.status()).toBe(401);

    const componenteAlert = page.getByRole('alert');
    await expect(componenteAlert).toBeVisible();

    await expect(page).toHaveURL('/iniciar-sesion');
  });

});