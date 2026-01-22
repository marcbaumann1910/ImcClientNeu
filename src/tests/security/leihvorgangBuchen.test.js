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
    const acCount = await acInputs.count();

    if (acCount > 0) {
        for (let i = 0; i < acCount; i++) {
            const input = acInputs.nth(i);
            await input.click();
            await page.waitForTimeout(800); // Animation abwarten

            const listbox = page.locator('.v-overlay-container .v-listbox, .v-listbox, [role="listbox"]').last();
            const option = listbox.locator('.v-list-item, [role="option"]').first();

            if (await option.count()) {
                await option.click();
                await page.waitForTimeout(300);
            } else {
                await page.keyboard.press('Escape');
                return false;
            }
        }
    } else {
        const inventarBox = dialog.getByRole('textbox', { name: /Inventar-Nummer/i }).first();
        if (await inventarBox.isVisible()) {
            await inventarBox.fill(`TEST-${Date.now()}`);
        }
    }

    const bemerkung = dialog.locator('input[placeholder*="z.B. Name"]').first();
    if (await bemerkung.count()) await bemerkung.fill(bemerkungText);

    const saveBtn = dialog.getByRole('button', { name: /Speichern/i }).first();
    await saveBtn.click();
    await expect(dialog).toBeHidden({ timeout: 10000 });
    return true;
}

async function handlePostBookingDialogs(page) {
    // 1) Email-Abfrage (falls nötig)
    const emailDialog = page.locator('.v-card').filter({ hasText: 'E-Mail-Adresse fehlt' }).first();
    if (await emailDialog.isVisible()) {
        await emailDialog.getByRole('textbox').fill(BORROWER_EMAIL_IF_MISSING);
        await emailDialog.getByRole('button', { name: /Speichern/i }).click();
        await page.waitForTimeout(1000);
    }

    // 2) Mietvertrag-Bestätigung (JA klicken)
    const confirmDialog = page.locator('.v-overlay--active .v-card').filter({ hasText: /Mietvertrag|Leihvorgang buchen/i }).first();
    if (await confirmDialog.count()) {
        const jaBtn = confirmDialog.getByRole('button', { name: /^JA$/i }).first();
        await jaBtn.click();
    }
}

test.describe('Audit: Realer Buchungsvorgang (Desktop)', () => {
    test('Workflow: Login -> Mitglied -> Artikel -> Übersicht -> Buchen', async ({ page }) => {
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
        const memberResult = page.locator('.vCardMitgliedSuchen').getByText(MEMBER_FULL_NAME).first();
        await memberResult.click();

        // 4) ARTIKEL-SEITE (Menge wählen)
        await expect(page.locator('main').getByText('€').first()).toBeVisible({ timeout: 20000 });
        const qtySelect = page.locator('.v-select').first();
        await qtySelect.click();
        await page.locator('.v-overlay-container .v-list-item').filter({ hasText: /^1$/ }).first().click();

        // 5) ZUR ÜBERSICHT
        await page.getByRole('button', { name: /Zur Übersicht/i }).click();

        // 6) EXTERNE NUMMERN ERFASSEN
        // Wir klicken auf das Label "*Externe Nr. erfassen"
        const erfassenLabel = page.locator('text=*Externe Nr. erfassen').first();
        await expect(erfassenLabel).toBeVisible({ timeout: 15000 });
        await erfassenLabel.click();

        const success = await fillExterneNummerDialog(page, "Automatischer Audit-Test");
        if (!success) throw new Error("Fehler beim Ausfüllen der externen Nummer");

        // 7) VORGANG BUCHEN (Der rote Button aus dem Screenshot)
        const buchenBtn = page.getByRole('button', { name: /VORGANG BUCHEN/i }).first();
        await expect(buchenBtn).toBeEnabled();
        await buchenBtn.click();

        // 8) DIALOGE BESTÄTIGEN (Email / Mietvertrag JA)
        await handlePostBookingDialogs(page);

        // 9) ERFOLGSMELDUNG
        await expect(page.locator('.v-snackbar, .v-alert')).toContainText(/erfolgreich|gebucht/i, { timeout: 25000 });

        // 10) AUDIT IN VERWALTUNG
        await page.goto('/leihvorgangverwalten');
        await page.locator('.search-field input').first().fill(MEMBER_FULL_NAME);
        await page.locator(`.v-expansion-panel-title:has-text("${MEMBER_FULL_NAME}")`).click();
        await expect(page.locator('.v-expansion-panel-text').first()).toContainText(/ausgeliehen/i);
    });
});