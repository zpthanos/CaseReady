# Privacy model

CaseReady has no account system, server-side database, analytics integration or automatic draft storage.

- Answers remain in the active browser tab.
- Closing or refreshing the tab discards an unsaved case.
- “Download case file” creates a JSON file only after the operator chooses it.
- Markdown exports are created locally by the browser.
- Opening a saved case reads the selected local file into the current tab.

The application warns when an evidence field appears to contain a credential, private key or full payment-card number. Detection is intentionally narrow and cannot replace operator judgment. Customer records, authentication material and unnecessary personal information should not be entered.

Deployment infrastructure still receives ordinary web requests needed to serve the application. CaseReady does not add request logging, tracking scripts or a data submission endpoint.
