# 🛠️ Development Tools

Questa cartella contiene componenti e utilities per development e testing.

**⚠️ Nota:** Questi componenti non sono inclusi nel production build a meno che non siano esplicitamente importati.

## Componenti Disponibili

### ChatTutorTest
Test del sistema AI Chat Tutor.

**URL:** `/?test=chat`

### SupabaseTestView  
Test della connessione e configurazione Supabase.

**URL:** `/?test=supabase`

## Usage

```typescript
// In development only
if (process.env.NODE_ENV === 'development') {
  import('./dev/ChatTutorTest').then(module => {
    // Use module
  });
}
```

## Notes

- Questi componenti sono esclusi dal production build tramite tree-shaking
- Accessibili solo in development mode o con parametri URL specifici
- Non committare credenziali o dati sensibili in questi file
