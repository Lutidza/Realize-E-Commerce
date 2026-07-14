# Check: worker profile references

```yaml
check_id: CHECK-WORKER-PROFILE-REFERENCES
owner_layer: .ai/checks/worker-runtime/
related_artifacts:
  - .ai/worker-profiles/INDEX.md
required_output:
  - profile_path
  - referenced_rules
  - referenced_checks
  - referenced_workflows
  - missing_or_stale_links
  - decision
```

## Pass Condition

Profile references exist and match the current project stack. No stale imported
project contour is used as active worker scope.
