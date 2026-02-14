#!/bin/bash

# OpenClaw Dashboard - Caddy Configuration Fix Script
# This script fixes the duplicate domain issue in the Caddyfile

echo "OpenClaw Caddy Configuration Fix"
echo "================================="

# Check if running on the server or locally
if [ -f /opt/jurismind/Caddyfile ]; then
    CADDYFILE="/opt/jurismind/Caddyfile"
    echo "Running on server..."

    # Create backup
    sudo cp "$CADDYFILE" "${CADDYFILE}.backup"
    echo "✓ Backup created: ${CADDYFILE}.backup"

    # Check for duplicate domain entries
    echo ""
    echo "Checking for duplicate domain entries..."
    DUPLICATE_COUNT=$(sudo grep -c "35-195-246-45.nip.io" "$CADDYFILE" 2>/dev/null || echo "0")

    if [ "$DUPLICATE_COUNT" -gt 1 ]; then
        echo "⚠ Found $DUPLICATE_COUNT occurrences of 35-195-246-45.nip.io"

        # Show the problematic lines
        echo ""
        echo "Problematic lines:"
        sudo grep -n "35-195-246-45.nip.io" "$CADDYFILE"

        # Fix strategy: Keep only the first occurrence and add OpenClaw as sub-path
        echo ""
        echo "Applying fix..."

        # Remove the old OpenClaw section (usually the second occurrence)
        # This is a simple fix - we'll comment out the second occurrence
        sudo sed -i '/^    # OPENCLAW/,/^    # END_OPENCLAW/s/^/# /' "$CADDYFILE"

        # Or alternatively, add OpenClaw as a sub-path to the main config
        # Let's create a new Caddyfile with the fix
        sudo cat > /tmp/caddy_fix.txt << 'EOF'
# This is a temporary fix script
# Run the following commands manually on the server:

# 1. Backup the current Caddyfile
# sudo cp /opt/jurismind/Caddyfile /opt/jurismind/Caddyfile.backup

# 2. Edit the Caddyfile and remove duplicate domain entries
# The second occurrence of "35-195-246-45.nip.io" should be removed or commented out

# 3. Add OpenClaw as a sub-path (recommended):
# Add this block after the main smartlaw-agent config:
#
# handle_path /openclaw* {
#     reverse_proxy openclaw-frontend:80
# }

# 4. Restart Caddy
# sudo docker restart caddy

EOF

        echo "✓ Fix script created. Please run the commands manually."
    else
        echo "✓ No duplicate entries found"
    fi

    # Show current status
    echo ""
    echo "Current Caddyfile status:"
    sudo grep -n "35-195-246-45.nip.io" "$CADDYFILE" || echo "No entries found"

else
    echo "Running locally - generating fix instructions..."
    echo ""

    # Generate fix instructions
    cat << 'EOF'
=================================================================
OPENCLAW CADDY CONFIGURATION FIX
=================================================================

PROBLEM:
--------
The Caddy server is not starting due to duplicate domain entry:
"35-195-246-45.nip.io appears twice in the Caddyfile"

SOLUTION:
---------

Option 1: Add OpenClaw as a Sub-Path (RECOMMENDED)
==================================================

1. Connect to the server:
   gcloud compute ssh --zone "europe-west1-b" "test" --project "beaming-sunset-484720-e5"

2. Edit the Caddyfile:
   sudo nano /opt/jurismind/Caddyfile

3. Find the second occurrence of "35-195-246-45.nip.io" (around lines 80-100)
   and either:
   - Comment it out by adding # at the beginning of each line, OR
   - Remove the entire block

4. Add OpenClaw as a sub-path to the main config:
   After the existing "handle_path /smartlaw-agent*" block, add:

   handle_path /openclaw* {
       reverse_proxy openclaw-frontend:80
   }

5. Save and exit (Ctrl+X, then Y, then Enter)

6. Restart Caddy:
   sudo docker restart caddy

7. Test:
   - http://35-195-246-45.nip.io/openclaw (OpenClaw Dashboard)
   - http://35-195-246-45.nip.io/smartlaw-agent (SmartLaw Agent)


Option 2: Remove Duplicate Entry Only
=====================================

1. Connect to the server:
   gcloud compute ssh --zone "europe-west1-b" "test" --project "beaming-sunset-484720-e5"

2. Edit the Caddyfile:
   sudo nano /opt/jurismind/Caddyfile

3. Find the second occurrence of "35-195-246-45.nip.io" (around lines 80-100)
   and remove or comment out that entire block

4. Save and exit (Ctrl+X, then Y, then Enter)

5. Restart Caddy:
   sudo docker restart caddy


QUICK FIX COMMANDS (Copy & Paste):
===================================

# View current Caddyfile
sudo cat /opt/jurismind/Caddyfile | grep -n "35-195-246-45"

# Count occurrences
sudo grep -c "35-195-246-45.nip.io" /opt/jurismind/Caddyfile

# Backup Caddyfile
sudo cp /opt/jurismind/Caddyfile /opt/jurismind/Caddyfile.backup

# Restart Caddy after changes
sudo docker restart caddy


TESTING:
========

# Test if Caddy is running
sudo docker ps | grep caddy

# Check Caddy logs
sudo docker logs caddy --tail 50

# Test OpenClaw URL
curl -I http://35-195-246-45.nip.io/openclaw

# Test SmartLaw URL (should already work)
curl -I http://35-195-246-45.nip.io/smartlaw-agent

=================================================================
EOF
fi

echo ""
echo "Fix process completed."
