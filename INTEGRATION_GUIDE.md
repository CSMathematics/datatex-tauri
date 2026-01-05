# ResourceInspector Integration Guide

## Integration Strategy

Για να μην διαταράξουμε την υπάρχουσα λειτουργικότητα, θα προσθέσουμε ένα **νέο tab** "Typed Metadata" δίπλα στο existing "Metadata" tab.

## Changes Required

### 1. Update ResourceInspector.tsx

Add import:
```tsx
import { DynamicMetadataEditor } from '../metadata/DynamicMetadataEditor';
import { useTypedMetadataStore } from '../../stores/typedMetadataStore';
```

Add lookup data initialization (in component body):
```tsx
const loadAllLookupData = useTypedMetadataStore(state => state.loadAllLookupData);

useEffect(() => {
    loadAllLookupData();
}, []);
```

Add new tab to Tabs.List (around line 510):
```tsx
<Tabs.List>
    <Tabs.Tab value="preview" leftSection={<FontAwesomeIcon icon={faFilePdf} />}>PDF</Tabs.Tab>
    {resource && (
        <>
            <Tabs.Tab value="metadata" leftSection={<FontAwesomeIcon icon={faInfoCircle} />}>Metadata</Tabs.Tab>
            <Tabs.Tab value="typed-metadata" leftSection={<FontAwesomeIcon icon={faInfoCircle} />}>Typed Metadata</Tabs.Tab>
            <Tabs.Tab value="bibliography" leftSection={<FontAwesomeIcon icon={faBook} />}>Bibliography</Tabs.Tab>
        </>
    )}  
</Tabs.List>
```

Add new tab panel (after Bibliography tab,around line 574):
```tsx
{/* Typed Metadata Tab - new typed metadata system */}
{resource && (
    <Tabs.Panel value="typed-metadata" style={{ flex: 1, position: 'relative' }}>
        <ScrollArea style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
            <Stack p="md">
                <DynamicMetadataEditor
                    resourceId={resource.id}
                    resourceType={resource.kind}
                    onSave={() => {
                        // Optional: show notification or trigger refresh
                        console.log('Typed metadata saved!');
                    }}
                />
            </Stack>
        </ScrollArea>
    </Tabs.Panel>
)}
```

### 2. Register Backend Commands in lib.rs

Find the `invoke_handler` call (around line 744) and add the new commands:

```rust
.invoke_handler(tauri::generate_handler![
    // ... existing commands ...
    
    // Typed Metadata Commands
    save_typed_metadata_cmd,
    load_typed_metadata_cmd,
    migrate_resource_to_typed_cmd,
    get_fields_cmd,
    get_chapters_cmd,
    get_sections_cmd,
    get_file_types_cmd,
    get_exercise_types_cmd,
])
```

### 3. Add Module Declarations in lib.rs

Add near the top of lib.rs (after line 10):

```rust
mod types {
    pub mod metadata;
}

mod db {
    pub mod typed_metadata;
}

mod commands {
    pub mod typed_metadata;
}

// Import commands
use commands::typed_metadata::*;
```

### 4. Create Module Files (if not exists)

Ensure these module files exist with proper exports:

**src-tauri/src/types/mod.rs**:
```rust
pub mod metadata;
```

**src-tauri/src/db/mod.rs**:
```rust
pub mod typed_metadata;
pub mod typed_metadata_helpers;
```

**src-tauri/src/commands/mod.rs**:
```rust
pub mod typed_metadata;
```

---

## Testing Plan

### 1. Backend Testing
- [ ] Run migrations: `sqlite3 db.db < migrations/002_common_infrastructure.sql` (and 003-011)
- [ ] Verify tables created: `sqlite3 db.db ".tables"`
- [ ] Test lookup commands: Run app and check console for lookup data

### 2. Frontend Testing
- [ ] Open ResourceInspector
- [ ] Select a resource
- [ ] Navigate to "Typed Metadata" tab
- [ ] Verify form renders correctly
- [ ] Select field → verify chapters load
- [ ] Select chapter → verify sections load
- [ ] Fill metadata and save
- [ ] Reload and verify persistence

### 3. Integration Testing
- [ ] Create new file resource
- [ ] Add typed metadata
- [ ] Verify data in database
- [ ] Test migration from JSON → Typed metadata

---

## Migration Path

### Option A: Gradual Migration (Recommended)
1. Keep existing "Metadata" tab as-is
2. Use "Typed Metadata" tab for new/enhanced editing
3. Users can manually migrate resources when editing
4. Eventually deprecate old tab

### Option B: Bulk Migration
1. Use `migrate_resource_to_typed_cmd` for all resources
2. Update existing metadata tab to use typed data
3. Faster transition but more risk

---

## Rollback Plan

If issues arise:
1. Remove "Typed Metadata" tab from ResourceInspector
2. Comment out backend command registrations
3. Old metadata system continues working
4. No data loss (JSON metadata preserved)

---

## Benefits After Integration

✅ **Better UX**: Cascading selects, smart filtering
✅ **Data Quality**: Type validation, constraints
✅ **Performance**: Indexed queries on typed fields
✅ **Search**: Can filter by difficulty, field, etc.
✅ **Consistency**: Standardized field/chapter/section taxonomy

---

## Next Steps After Integration

1. **Data Migration UI**: Create a "Migrate All" button
2. **Search Enhancement**: Filter resources by typed metadata
3. **Statistics**: Show difficulty distribution, popular tags
4. **Templates**: Save/load metadata configurations
5. **History Viewer**: Browse edit history for resources
