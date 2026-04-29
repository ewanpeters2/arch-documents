# Repository Catalog

This file contains a catalog of GitHub repositories that can be referenced in ADRs and TAs.
The extension will automatically suggest these repos during interviews.

## Format
Each repo should be listed with: `owner/repo` | Purpose | Key Files/Folders

---

## Core Services

| Name | Location | Purpose |
|------------|---------|-------------------|
|  | Main backend API service | `src/services/`, `src/controllers/` |
|  | React frontend application | `src/components/`, `src/hooks/` |
|  | Shared utilities and helpers | `lib/`, `utils/` |

## Infrastructure

| Repository | Purpose | Key Files/Folders |
|------------|---------|-------------------|
| ewanpeters2/infra-terraform | Infrastructure as Code | `modules/`, `environments/` |
| ewanpeters2/k8s-manifests | Kubernetes configurations | `deployments/`, `services/` |

## Data & Messaging

| Repository | Purpose | Key Files/Folders |
|------------|---------|-------------------|
| ewanpeters2/data-pipeline | Data processing pipelines | `src/pipelines/`, `src/transformers/` |
| ewanpeters2/event-processor | Event/message processing | `src/handlers/`, `src/consumers/` |

## Mobile

| Repository | Purpose | Key Files/Folders |
|------------|---------|-------------------|
| ewanpeters2/ios-app | iOS native application | `Sources/`, `Views/` |
| ewanpeters2/android-app | Android native application | `app/src/main/`, `features/` |

---

## How to Use

1. Add your repos to this file in the tables above
2. When creating an ADR or TA, the extension will offer these as suggestions
3. You can still add repos manually during the interview

## Adding New Repos

Add new repos to the appropriate category table above, or create a new category section.
