# CaseReady product decisions

These choices protect the interaction CaseReady is meant to demonstrate. They are not general rules for every support system.

## 1. No backend

Case information stays in the browser. This keeps deployment simple and avoids creating a customer-data store for a demonstration tool that does not need one.

The drawback is deliberate: a case cannot follow an operator between devices, there is no shared queue and a closed tab loses unsaved work. An operator can download a case file when local retention is appropriate.

## 2. No generative AI

The outputs are deterministic and use only the answers entered by the operator. The same intake produces the same wording, and the application never invents a diagnosis, action or customer commitment.

This makes the writing less flexible than a generative assistant. Awkward or incomplete input remains visible and must be corrected by the operator rather than being quietly rewritten into something more convincing.

## 3. Separate customer and internal outputs

The customer confirmation focuses on ownership, what was understood and when the next update is due. The support brief preserves context and commitments. The engineering escalation concentrates on reproduction, environment, evidence and the exact request.

The trade-off is more material to review. A single transcript would be shorter to generate, but it would make customers read internal investigation detail and make resolvers search through conversation history for the useful facts.

## 4. No automatic draft persistence

Support information should not silently remain on a shared device. CaseReady keeps the active draft in the current tab and saves nothing automatically.

This protects against forgotten local records, but it also means an accidental tab closure loses the draft. Saving is an explicit download, and the operator remains responsible for deciding whether the device is suitable.

## 5. Suggested severity remains editable

CaseReady uses a small set of impact-and-urgency rules to suggest a working severity. The operator can change it before generating outputs.

The suggestion creates consistency without pretending that every organisation uses the same incident policy. The drawback is that CaseReady cannot enforce a company-specific matrix or approval path; the operator must apply local policy.

## 6. Questions begin with the customer’s objective

The first substantive question is what the customer was trying to complete. That context explains why the report matters and prevents an error code from becoming the whole case.

This delays the technical questions by one stage. In a known major incident, responders may already understand the shared objective and need to move straight to evidence. CaseReady still asks for it because the generated customer and handoff messages require that context.
