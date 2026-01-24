import { test, expect } from '@playwright/test';

/**
 * KOMPLEXER BUCHUNGS-WORKFLOW TEST
 * 
 * Abgedeckte Schritte:
 * 1. Login
 * 2. Suche nach "Marc Baumann"
 * 3. Handling E-Mail-Abfrage (Sicherheit: Nur Test-Email)
 * 4. Mehrere Artikel hinzufügen (mind. 2)
 * 5. Mengenänderung im Warenkorb
 * 6. Bemerkung eintragen
 * 7. Externe Nummern erfassen (mit Recovery: Löschen wenn kein Bestand)
 * 8. Buchung abschließen mit E-Mail-Versand (JA)
 */

const MEMBER_SEARCH_TERM = 'Marc';
const MEMBER_FULL_NAME = 'Marc Baumann';
const TEST_EMAIL = 'marc-test@mbdevelop.de'; // Sicherheit: Nur diese Adresse wird genutzt

async function performLogin(page) {
    await page.goto('/login');
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.reload();
    await page.getByPlaceholder(/Email/i).fill(process.env.E2E_USER_EMAIL || 'info@marc79.de');
    await page.getByPlaceholder(/Passwort/i).fill(process.env.E2E_USER_PASS || 'Hallo-2023!');
    await page.locator('main').getByRole('button', { name: /^Login$/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 30000 });
}

async function handleEmailDialog(page) {
    // Der Dialog kann ein v-dialog (Desktop) oder v-bottom-sheet (Mobile) sein
    // Wir suchen nach dem Text "E-Mail-Adresse fehlt"
    const emailDialog = page.locator('.v-overlay-container').filter({ hasText: /E-Mail-Adresse fehlt/i });
    if (await emailDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log("E-Mail Dialog erkannt, trage Test-Email ein.");
        const input = emailDialog.locator('input').first();
        await input.fill(TEST_EMAIL);
        // Wir klicken den Speichern Button innerhalb des Dialogs
        await emailDialog.getByRole('button', { name: /Speichern/i }).click();
        await expect(emailDialog).toBeHidden({ timeout: 10000 });
    }
}

async function fillExterneNummerDialog(page) {
    const dialog = page.getByRole('dialog').filter({ hasText: 'Externe Inventar-Nummer' }).first();
    await expect(dialog).toBeVisible({ timeout: 10000 });

    const acInputs = dialog.locator('.v-autocomplete input');
    if ((await acInputs.count()) > 0) {
        await acInputs.first().click();
        await page.waitForTimeout(1000);
        const options = page.locator('.v-overlay-container .v-list-item, [role="option"]');

        if (await options.count() === 0) {
            console.log("Kein Bestand im Dialog gefunden -> Abbruch für diesen Artikel.");
            await page.keyboard.press('Escape');
            return false;
        }
        await options.first().click({ force: true });
    } else {
        const inventarBox = dialog.getByRole('textbox', { name: /Inventar-Nummer/i }).first();
        if (await inventarBox.isVisible()) await inventarBox.fill(`TEST-${Date.now()}`);
    }
    await dialog.getByRole('button', { name: /Speichern/i }).click();
    await expect(dialog).toBeHidden();
    return true;
}

test.describe('Komplexer Buchungs-Workflow Audit', () => {

    test('Vollständiger Prozess: Marc Baumann -> Mehrere Artikel -> Mengen -> Externe Nr -> Buchen', async ({ page }) => {
        await performLogin(page);
        
        // 1. Zu Leihvorgang navigieren
        await page.goto('/leihvorgang');
        
        // 2. Mitglied suchen
        await page.locator('.search-field input').fill(MEMBER_SEARCH_TERM);
        const memberRow = page.locator('main').getByText(MEMBER_FULL_NAME).first();
        await expect(memberRow).toBeVisible({ timeout: 10000 });
        await memberRow.click();
        
        // 3. Email-Schutz (Nur Marc Baumann darf Test-Emails bekommen)
        await handleEmailDialog(page);

        // 4. Artikel-Seite erreichen
        const btnNextToArticles = page.locator('[data-test="btn-next"], [data-test="btn-next-mobile"]').filter({ visible: true }).first();
        if (await btnNextToArticles.count() > 0) {
            console.log("Warte auf Aktivierung des 'Weiter'-Buttons");
            await expect(btnNextToArticles).toBeEnabled({ timeout: 15000 });
            await btnNextToArticles.click();
        }

        // 5. Mindestens 2 Artikel hinzufügen
        // Wir warten bis das Lade-Overlay weg ist
        await expect(page.locator('.loading-overlay')).toBeHidden({ timeout: 20000 });

        // Wir scrollen zur Tabelle
        await page.locator('.v-data-table').scrollIntoViewIfNeeded();

        // Auf Mobile werden Artikel anders gerendert (v-badge, div.artikel-column)
        // Wir warten auf ein Element, das den Preis enthält
        await expect(async () => {
            await expect(page.locator('main').getByText(/€/).first()).toBeVisible();
        }).toPass({ timeout: 20000 });
        
        const artikelRows = page.locator('.v-data-table tbody tr');
        const rowCount = await artikelRows.count();
        if (rowCount < 2) throw new Error("Nicht genug Artikel für den Test vorhanden!");

        // Artikel 1
        // Auf Mobile gibt es keinen .v-select in der Tabelle, sondern nur im Desktop-Zweig (v-if="!smAndDown")
        const isMobile = await page.evaluate(() => window.innerWidth <= 600);
        
        if (isMobile) {
            console.log("Mobile Modus: Nutze Chevron-Up Icons für Artikelauswahl");
            const btnUpArt1 = artikelRows.nth(0).locator('.mdi-chevron-up');
            await btnUpArt1.click();
            const btnUpArt2 = artikelRows.nth(1).locator('.mdi-chevron-up');
            await btnUpArt2.click();
        } else {
            console.log("Desktop Modus: Nutze v-select für Artikelauswahl");
            await artikelRows.nth(0).locator('.v-select').click();
            await page.locator('.v-overlay-container .v-list-item').filter({ hasText: /^1$/ }).first().click();
            
            await artikelRows.nth(1).locator('.v-select').click();
            await page.locator('.v-overlay-container .v-list-item').filter({ hasText: /^1$/ }).first().click();
        }

        // 6. Zur Übersicht (Checkout)
        const btnToOverview = page.getByRole('button', { name: /Übersicht|zur Übersicht|weiter/i }).first();
        await btnToOverview.click();

        // 7. Mengenänderung im Checkout (Plus-Button bei erstem Artikel)
        // Wir suchen das erste Plus-Icon im Chip-Bereich
        const btnPlus = page.locator('.v-chip .mdi-plus').first();
        if (await btnPlus.isVisible()) {
            console.log("Erhöhe Menge von Artikel 1");
            await btnPlus.click();
        }

        // 8. Bemerkung eintragen (Falls Feld vorhanden)
        const bemerkungField = page.getByLabel(/Bemerkung/i).first();
        if (await bemerkungField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await bemerkungField.fill("Automatisierter Test-Leihvorgang für Marc Baumann");
        }

        // 9. Externe Nummern erfassen oder Artikel löschen
        let bookingReady = false;
        while (!bookingReady) {
            const erfassenBtn = page.locator('text=*Externe Nr. erfassen, text=Externe Nr. erfassen').filter({ visible: true }).first();
            
            if (await erfassenBtn.count() === 0) {
                bookingReady = true;
                break;
            }

            await erfassenBtn.click();
            const success = await fillExterneNummerDialog(page);
            
            if (!success) {
                console.log("Kein Bestand für diesen Artikel -> Lösche Artikel aus Warenkorb.");
                // Suche Mülleimer-Icon in der gleichen Zeile (oder das erste sichtbare)
                const deleteBtn = page.locator('.mdi-trash-can, .v-label:text("Löschen")').filter({ visible: true }).first();
                await deleteBtn.click();
                await page.waitForTimeout(500);
            }
        }

        // 10. Vorgang buchen
        await page.getByRole('button', { name: /VORGANG BUCHEN|buchen/i }).click();

        // 11. Email-Dialog (Mietvertrag senden? -> JA)
        // Wir warten bis das Lade-Overlay vom Buchungsvorgang weg ist
        await expect(page.locator('.loading-overlay')).toBeHidden({ timeout: 20000 });

        // Falls der Dialog noch nicht da ist, versuchen wir ihn durch einen Klick auf den Button zu forcieren (manchmal klemmt Vue)
        const bookingBtn = page.getByRole('button', { name: /VORGANG BUCHEN|buchen/i }).first();
        if (await bookingBtn.isVisible()) {
            await bookingBtn.click({ force: true });
        }

        // Wir warten explizit darauf, dass der Dialog-Container im DOM erscheint
        await page.waitForSelector('.v-overlay-container', { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(3000); // Vuetify Transition

        // Wir suchen den Button ganz allgemein im gesamten Dokument
        const jaBtn = page.locator('button').filter({ hasText: /^JA$|^Ja$/i }).filter({ visible: true }).first();

        await expect(jaBtn).toBeVisible({ timeout: 20000 });
        await jaBtn.click({ force: true });

        // 12. Erfolgsmeldung prüfen
        await expect(page.locator('.v-snackbar, .v-alert')).toContainText(/erfolgreich|gebucht/i, { timeout: 20000 });
        
        console.log("✅ Komplexer Buchungs-Workflow erfolgreich abgeschlossen.");
    });
});
