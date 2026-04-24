import * as assert from "node:assert/strict";
import { buildDefaultLegalConfigTranslations } from "@/legal/i18n/messages";

function run() {
  const defaults = buildDefaultLegalConfigTranslations();

  assert.ok(defaults.imprintText["de-DE"].includes("Schweiz"));
  assert.ok(defaults.imprintText["en-US"].includes("Switzerland"));
  assert.ok(defaults.privacyPolicyText["fr-FR"].includes("Suisse"));

  assert.equal(defaults.imprintUrl["de-DE"], "");
  assert.equal(defaults.privacyPolicyUrl["it-IT"], "");
}

run();
console.log("legal-localization.smoke.ts: OK");
