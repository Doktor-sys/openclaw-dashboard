# SSH-Schlüssel für Google Cloud Server erstellen

## Schritt 1: SSH-Schlüsselpaar erstellen

### Unter Windows (PowerShell oder Eingabeaufforderung):

```powershell
# Neues SSH-Schlüsselpaar erstellen
ssh-keygen -t ed25519 -C "deine-email@beispiel.com"
```

**Wichtig:** Drücken Sie ENTER um die Standard-Speicherorte zu akzeptieren:
```
Generating public/private ed25519 key pair.
Enter file in which to save the key: C:\Users\Achim\.ssh\id_ed25519
Enter passphrase (empty for no passphrase): [LEER lassen - ENTER]
Enter same passphrase again: [LEER lassen - ENTER]
```

### Ergebnis:
- **Privater Schlüssel:** `C:\Users\Achim\.ssh\id_ed25519` (NIEMALS teilen!)
- **Öffentlicher Schlüssel:** `C:\Users\Achim\.ssh\id_ed25519.pub`

---

## Schritt 2: Öffentlichen Schlüssel zu Google Cloud hinzufügen

### Option A: Über Google Cloud Console (Empfohlen)

1. Öffnen: https://console.cloud.google.com/compute/metadata?project=beaming-sunset-484720-e5

2. Oder direkt zur VM-Instanz:
   - https://console.cloud.google.com/compute/instances?project=beaming-sunset-484720-e5

3. Klicken Sie auf die VM-Instanz "test"

4. Klicken Sie auf "BEARBEITEN" (Edit)

5. Scrollen Sie zu "SSH-Schlüssel"

6. Klicken Sie auf "HINZUFÜGEN" (Add)

7. **Öffnen Sie die öffentliche Schlüsseldatei:**
   ```powershell
   notepad C:\Users\Achim\.ssh\id_ed25519.pub
   ```

8. **Kopieren Sie den gesamten Inhalt** (beginnt mit `ssh-ed25519 ...`)

9. **Fügen Sie ihn in Google Cloud ein**

10. Klicken Sie auf "SPEICHERN"

### Option B: Über gcloud CLI

```powershell
# Öffentlichen Schlüssel zur VM hinzufügen
gcloud compute ssh --zone "europe-west1-b" "test" --project "beaming-sunset-484720-e5" --dry-run
```

---

## Schritt 3: SSH-Verbindung testen

```powershell
# Verbindung zur VM herstellen
ssh -i C:\Users\Achim\.ssh\id_ed25519 root@35-195-246-45.nip.io
```

**Oder mit gcloud:**
```powershell
gcloud compute ssh --zone "europe-west1-b" "test" --project "beaming-sunset-484720-e5"
```

---

## Schritt 4: Caddyfile auf dem Server bearbeiten

Nach erfolgreicher Verbindung:

```bash
# 1. Backup erstellen
sudo cp /opt/jurismind/Caddyfile /opt/jurismind/Caddyfile.backup

# 2. Caddyfile bearbeiten
sudo nano /opt/jurismind/Caddyfile

# 3. Doppelten Eintrag finden und entfernen
# Suchen Sie nach "35-195-246-45.nip.io" - der zweite Block muss weg

# 4. Caddy neu starten
sudo docker restart caddy

# 5. Status prüfen
sudo docker ps | grep caddy
```

---

## Nützliche Befehle

```powershell
# Öffentlichen Schlüssel anzeigen
type C:\Users\Achim\.ssh\id_ed25519.pub

# Privaten Schlüssel anzeigen (NICHT teilen!)
type C:\Users\Achim\.ssh\id_ed25519

# SSH-Verbindung mit verbose (für Fehlersuche)
ssh -v -i C:\Users\Achim\.ssh\id_ed25519 root@35-195-246-45.nip.io
```

---

## SSH-Schlüssel für GitHub/GitLab hinzufügen (optional)

```powershell
# Öffentlichen Schlüssel kopieren
type C:\Users\Achim\.ssh\id_ed25519.pub | clip

# Dann bei GitHub hinzufügen:
# https://github.com/settings/keys
```

---

## Fehlerbehebung

### "Permission denied (publickey)"
→ Öffentlicher Schlüssel wurde nicht korrekt in Google Cloud eingefügt

### "Connection refused"
→ Server ist nicht erreichbar oder Firewall blockiert

### "Bad permissions"
→ Führen Sie PowerShell als Administrator aus:
```powershell
icacls C:\Users\Achim\.ssh\id_ed25519 /inheritance:r
icacls C:\Users\Achim\.ssh\id_ed25519 /grant Achim:F
```
