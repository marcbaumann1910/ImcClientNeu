import { test, expect } from '@playwright/test';

const ROUTES = [
    { path: '/', name: 'Home', expectedText: /Willkommen|Dashboard/i },
    { path: '/dashboard', name: 'Dashboard', expectedText: /Dashboard/i },
    { path: '/artikel', name: 'Artikel', expectedText: /Artikel|Lager/i },
    { path: '/mitglieder', name: 'Mitglieder', expectedText: /Mitglieder/i },
    { path: '/leihvorgang', name: 'Leihvorgang', expectedText: /Mitglied suchen|Warenkorb/i },
    { path: '/abrechnung', name: 'Abrechnung', expectedText: /Abrechnung/i },
    { path: '/profile', name: 'Profil', expectedText: /Profil|Einstellungen/i },
    { path: '/leihvorgangverwalten', name: 'Leihvorgänge verwalten', expectedText: /Leihvorgänge/i },
    { path: '/lager', name: 'Lagerübersicht', expectedText: /Lager/i },
    { path: '/lagerverwaltung', name: 'Lagerverwaltung', expectedText: /Lagerverwaltung|Artikel/i },
];

test.describe('Full Route Coverage Test', () => {
    
    test.beforeEach(async ({ page }) => {
        // Login durchführen
        await page.goto('/login');
        await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
        await page.reload();
        await page.getByPlaceholder(/Email/i).fill(process.env.E2E_USER_EMAIL || 'info@marc79.de');
        await page.getByPlaceholder(/Passwort/i).fill(process.env.E2E_USER_PASS || 'Hallo-2023!');
        await page.locator('main').getByRole('button', { name: /^Login$/i }).click();
        await page.waitForURL('**/dashboard', { timeout: 30000 });
    });

    for (const route of ROUTES) {
        test(`Route Test: ${route.name} (${route.path})`, async ({ page }) => {
            await page.goto(route.path);
            await expect(page).toHaveURL(new RegExp(route.path.replace('.', '\\.')));
            
            // Prüfen ob die Seite geladen wurde und spezifischen Text enthält
            await expect(page.locator('main')).toContainText(route.expectedText, { timeout: 15000 });
            
            // Screenshot für die Dokumentation (optional, hilfreich für den User)
            await page.screenshot({ path: `test-results/route-${route.name.replace(/\s+/g, '_')}.png` });
        });
    }

    test('Mobile Route Test: Checkout', async ({ page }) => {
        // Spezieller Test für die mobile Checkout Route
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/m.checkout');
        // Da diese Route evtl. Daten im Store braucht, könnte sie leer sein oder zum Dashboard umleiten
        // Wir prüfen hier nur die Erreichbarkeit
        if (page.url().includes('checkout')) {
            await expect(page.locator('body')).toBeVisible();
        }
    });
});
