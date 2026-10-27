# Product intake

Choose **New product** in Projects and upload your product information. There are no manual product-brief fields in the intake screen. For an existing product, choose **New simulation** in Projects and select that product; its existing brief and sources remain available.

## Supported documents

Upload one to five TXT, Markdown, CSV, JSON, PDF, or DOCX files, totaling at most 750 KiB. A lower configured per-file upload limit also applies. Text files must be valid UTF-8. PDF/DOCX files must contain extractable text; encrypted documents, unreadable formats, and scanned pages without text are rejected. Extracted content is limited to 400,000 characters across the selection and is rejected rather than silently truncated.

Select **Preview imported context** to review excerpts and explicitly supplied facts. Preview does not save a project or original files. Select **Create project from uploads** to save the reviewed originals, extracted text, and source chunks together with a current brief. You can then configure the simulation's target market and personas. Preview and creation failures retain the selected files so you can correct the issue or retry.

## Optional structured brief

All uploaded text remains source evidence. Brief facts are copied only from explicitly named string fields in a JSON object, either at the top level or inside a single `productBrief` wrapper. Arbitrary prose is not automatically interpreted into product facts, and import does not call a model.

For example, this authored file can supply two facts while leaving the rest unknown:

```json
{
  "productName": "Paper Plan",
  "market": "Independent bookshops"
}
```

| Field | Meaning | Maximum characters |
| --- | --- | ---: |
| `productName` | Product name | 160 |
| `category` | Product category | 120 |
| `icp` | Target buyer or user | 500 |
| `market` | Intended market | 160 |
| `expectedPrice` | Expected price, as written | 120 |
| `competitors` | Known alternatives | 1,000 |
| `launchChannel` | Distribution channel | 160 |
| `positioningStatement` | Product positioning | 1,200 |
| `notes` | Additional brief notes | 4,000 |

Omit unknown fields or use empty strings. Conflicting nonempty values across files, duplicate keys, unknown fields in a recognized brief, and invalid field types are rejected. Correct them in the document and select the revised file. Put unrelated JSON context in a separate file; arrays and objects with no recognized brief fields remain source context.

Missing facts are shown as **Not supplied in uploads** and remain blank in the current brief and simulation snapshots. If no product name is supplied, the first filename provides a project label only. It does not become a product-name fact. Runs with missing context should be treated as exploratory.

## Save failures and hosting

Creation re-extracts the selected files and verifies that they match the preview. A database transaction groups the project, brief, sources, and chunks. Definite failures remove only the import's own staged originals. If a save response or database commit acknowledgment is lost, check Projects before retrying; the save may already have completed. Originals are kept when commit success cannot be determined.

The current storage adapter writes originals to the configured local directory. Production durable storage and access isolation require the decisions described in [deployment](deployment.md); a public HTTP response alone does not prove an import can be saved durably.
