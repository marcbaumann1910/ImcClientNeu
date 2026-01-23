import { test, expect } from '@playwright/test';

const TEST_LOGIN = {
    email: process.env.E2E_USER_EMAIL || '<TEST_EMAIL>',
    pass: process.env.E2E_USER_PASS || '<TEST_PASSWORD>',
};

const BORROWER_EMAIL_IF_MISSING = process.env.E2E_BORROWER_EMAIL || '<BORROWER_EMAIL>';
const MEMBER_SEARCH_TERM = 'Marc';
const MEMBER_FULL_NAME = 'Marc Baumann';

async function openDrawer(page) {
    const icon = page.locator('.v-app-bar-nav-icon').first();
    if (await icon.isVisible()) {
        await icon.click();
        return true;
    }
    return false;
}

async function fillExterneNummerDialog(page, bemerkungText) {
    const dialog = page.getByRole('dialog').filter({ hasText: 'Externe Inventar-Nummer' }).first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const acInputs = dialog.locator('.v-autocomplete input');
    if ((await acInputs.count()) > 0) {
        const input = acInputs.first();
        await input.click();
        await page.waitForTimeout(1200);

        const listbox = page.locator('.v-overlay-container .v-listbox, .v-listbox, [role="listbox"]').last();
        const options = listbox.locator('.v-list-item, [role="option"]');

        if (await options.count() === 0) {
            console.log("Bestand leer im Dialog erkannt.");
            await page.keyboard.press('Escape');
            return false;
        }

        await options.first().click({ force: true });
        await page.waitForTimeout(300);
    } else {
        const inventarBox = dialog.getByRole('textbox', { name: /Inventar-Nummer/i }).first();
        if (await inventarBox.isVisible()) await inventarBox.fill(`TEST-${Date.now()}`);
    }

    const bemerkung = dialog.locator('input[placeholder*="z.B. Name"]').first();
    if (await bemerkung.count()) await bemerkung.fill(bemerkungText);

    await dialog.getByRole('button', { name: /Speichern/i }).click();
    await expect(dialog).toBeHidden({ timeout: 10000 });
    return true;
}

async function handlePostBookingDialogs(page) {
    const emailDialog = page.locator('.v-card').filter({ hasText: 'E-Mail-Adresse fehlt' }).first();
    if (await emailDialog.isVisible()) {
        await emailDialog.getByRole('textbox').fill(BORROWER_EMAIL_IF_MISSING);
        await emailDialog.getByRole('button', { name: /Speichern/i }).click();
        await page.waitForTimeout(1000);
    }

    const confirmDialog = page.locator('.v-overlay--active .v-card').filter({ hasText: /Leihvorgang buchen|Mietvertrag/i }).first();
    if (await confirmDialog.count()) {
        const jaBtn = confirmDialog.getByRole('button', { name: /^JA$/i }).first();
        if (await jaBtn.count()) await jaBtn.click();
    }
}

test.describe('Audit: Realer Buchungsvorgang', () => {
    test('Workflow: Login -> Mitglied -> Artikel -> Buchen -> Audit', async ({ page }) => {
        page.on('dialog', async d => d.dismiss().catch(() => {}));

        // 1) LOGIN
        await page.goto('/login');
        await page.getByPlaceholder(/Email/i).fill(TEST_LOGIN.email);
        await page.getByPlaceholder(/Passwort/i).fill(TEST_LOGIN.pass);
        await page.locator('main').getByRole('button', { name: /^Login$/i }).click();
        await page.waitForURL('**/dashboard');

        // 2) NAVIGATION
        const drawer = await openDrawer(page);
        if (drawer) {
            await page.locator('.v-list-item-title:has-text("Leihvorgang")').click();
            await page.locator('.v-list-item-title:has-text("Buchen")').click();
        } else {
            await page.goto('/leihvorgang');
        }

        // 3) MITGLIED SUCHEN
        await page.locator('.search-field input').first().fill(MEMBER_SEARCH_TERM);
        await page.locator('.vCardMitgliedSuchen').getByText(MEMBER_FULL_NAME).first().click();

        // 4) ARTIKEL WÄHLEN (Retry Loop)
        let bookingFinished = false;
        let articleIndex = 0;

        while (!bookingFinished) {
            await expect(page.locator('main').getByText('€').first()).toBeVisible({ timeout: 20000 });

            const qtySelects = page.locator('.v-select');
            if (articleIndex >= await qtySelects.count()) throw new Error("Kein Artikel mit Bestand mehr gefunden!");

            // Wir wählen gezielt den Artikel am articleIndex (0 = Hexen-Rock, 1 = Schurtz, etc.)
            await qtySelects.nth(articleIndex).scrollIntoViewIfNeeded();
            await qtySelects.nth(articleIndex).click();
            await page.locator('.v-overlay-container .v-list-item').filter({ hasText: /^1$/ }).first().click();

            // 5) ZUR ÜBERSICHT
            await page.getByRole('button', { name: /Zur Übersicht/i }).click();

            // 6) EXTERNE NUMMER
            const erfLink = page.locator('text=*Externe Nr. erfassen').first();
            await expect(erfLink).toBeVisible({ timeout: 10000 });
            await erfLink.click();

            const success = await fillExterneNummerDialog(page, "Audit-Test");

            if (success) {
                bookingFinished = true;
            } else {
                console.log(`Artikel an Index ${articleIndex} leer. Lösche und versuche nächsten.`);
                // Artikel im Warenkorb löschen (Mülleimer rechts)
                await page.locator('.mdi-trash-can').first().click();
                await page.waitForTimeout(500);

                // Zurück zur Artikelliste
                await page.getByRole('button', { name: /ZURÜCK/i }).click();

                // Index erhöhen, damit im nächsten Durchlauf NICHT wieder der Hexen-Rock gewählt wird
                articleIndex++;
                await page.waitForTimeout(1000);
            }
        }

        // 7) VORGANG BUCHEN
        const buchenBtn = page.getByRole('button', { name: /VORGANG BUCHEN/i }).first();
        await expect(buchenBtn).toBeEnabled();
        await buchenBtn.click();

        // 8) DIALOGE BESTÄTIGEN
        await handlePostBookingDialogs(page);

        // 9) ERFOLGSMELDUNG
        await expect(page.locator('.v-snackbar, .v-alert')).toContainText(/erfolgreich|gebucht/i, { timeout: 25000 });

        // 10) AUDIT IN DER VERWALTUNG
        await page.goto('/leihvorgangverwalten');
        await page.locator('.search-field input').first().fill(MEMBER_FULL_NAME);
        await page.locator(`.v-expansion-panel-title:has-text("${MEMBER_FULL_NAME}")`).first().click();

        const content = page.locator('.v-expansion-panel-text').first();
        await expect(content).toContainText(/verliehen/i);

        const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        await expect(content).toContainText(today);
    });
});