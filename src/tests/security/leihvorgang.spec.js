import { test, expect } from '@playwright/test';

// Konfiguration der Test-URL
const BASE_URL = 'https://test.mbdevelop.de';

test.describe('Security & Buchungs-Workflow Audit', () => {

    test('SECURITY: Zugriff auf Leihvorgang ohne Login muss scheitern', async ({ page }) => {
        // Versuch, direkt die Seite zur Verwaltung aufzurufen
        await page.goto(`${BASE_URL}/leihvorgangverwalten`);

        // Erwartung: Umleitung zum Login oder zumindest keine Datenanzeige
        // Je nachdem wie dein Router konfiguriert ist
        await expect(page).toHaveURL(/.*login/);
    });

    test('WORKFLOW: Realer Buchungsvorgang auf Klon-DB', async ({ page }) => {
        // 1. Login Vorgang
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[type="email"]', 'info@marc79.de'); // Dein Test-User
        await page.fill('input[type="password"]', 'Hallo-2025!');
        await page.click('button[type="submit"]');

        // Warten bis Dashboard geladen ist
        await expect(page).toHaveURL(/.*dashboard/);

        // 2. Zum Leihvorgang navigieren
        await page.goto(`${BASE_URL}/leihvorgang`);

        // 3. Mitglied auswählen (Nutzt deine Mitglieder.vue Logik)
        const searchInput = page.locator('input[label="Suche Mitglieder"]');
        await searchInput.fill('Testmitglied');
        await page.waitForTimeout(1000); // Warten auf Suche
        await page.click('.v-card:has-text("Testmitglied")');

        // 4. Artikel wählen (Beispiel: Erster verfügbarer Artikel)
        await page.click('.v-btn:has-text("Hinzufügen")');

        // 5. Checkout & Buchen
        await page.click('button:has-text("Warenkorb")');
        await page.click('button:has-text("Jetzt buchen")');

        // 6. Verifikation der Erfolgsmeldung (Deine Notifications.js)
        const successMessage = page.locator('.v-alert'); // Oder deine Notification-Klasse
        await expect(successMessage).toBeVisible();
        await expect(successMessage).toContainText(/erfolgreich/i);
    });

    test('SECURITY: API-Manipulation verhindern (Negative Mengen)', async ({ request }) => {
        // Dieser Test greift direkt die API an, um zu sehen ob das Backend schützt
        // Wir simulieren einen böswilligen Request an AuthenticationService.leihvorgangBuchen

        const response = await request.patch(`${BASE_URL}/api/leihvorgang`, {
            data: {
                idMitglied: 1,
                artikel: [{ id: 99, menge: -5 }] // BÖSARTIG: Negative Menge
            }
        });

        // Erwartung: Das Backend MUSS das ablehnen (400 Bad Request oder 422)
        expect(response.status()).toBeGreaterThanOrEqual(400);
    });
});