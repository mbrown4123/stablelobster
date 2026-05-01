"""
StableLobster Client for OpenClaw Agent
Automatically votes on startup success or crash detection.
"""

import os
import sys
import json
import hashlib
import sqlite3
import time
import requests
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any

# Configuration
API_URL = os.getenv('STABLELOBSTER_API_URL', 'https://stablelobster.com')
SALT_FILE = Path.home() / '.openclaw' / 'stablelobster_salt'
DB_PATH = Path.home() / '.openclaw' / 'stablelobster_queue.db'
LOG_FILE = Path.home() / '.openclaw' / 'logs' / 'stablelobster.log'

# Ensure directories exist
Path.home() / '.openclaw' / 'logs'
Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
Path(LOG_FILE).parent.mkdir(parents=True, exist_ok=True)


class StableLobsterClient:
    """Client for reporting OpenClaw agent status to StableLobster."""
    
    def __init__(self, api_url: str = None):
        self.api_url = api_url or API_URL
        self.session = requests.Session()
        self.session.timeout = 10  # 10 second timeout
        
        # Get or generate install ID
        self.install_id = self._get_install_id()
        
        # Initialize local queue DB
        self._init_queue_db()
    
    def _get_install_id(self) -> str:
        """Generate or retrieve hardware-based install ID."""
        # Read or create salt file
        if not SALT_FILE.exists():
            salt = os.urandom(32).hex()
            SALT_FILE.write_text(salt)
            os.chmod(SALT_FILE, 0o600)  # Restrict permissions
        else:
            salt = SALT_FILE.read_text().strip()
        
        # Generate hardware fingerprint (simplified - in production use actual hardware IDs)
        try:
            # Try to get machine-specific info
            import platform
            fingerprint = (
                f"{platform.system()}"
                f"{platform.machine()}"
                f"{platform.processor()}"
                f"{os.environ.get('USER', 'unknown')}"
            )
        except Exception:
            fingerprint = "default_fingerprint"
        
        # Hash with salt
        hashed = hashlib.sha256((fingerprint + salt).encode()).hexdigest()
        return hashed
    
    def _init_queue_db(self):
        """Initialize local SQLite queue for offline votes."""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                version_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                category TEXT,
                os TEXT,
                node_version TEXT,
                error_tail TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                attempts INTEGER DEFAULT 0,
                last_attempt TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def _log(self, message: str):
        """Write to log file."""
        try:
            with open(LOG_FILE, 'a') as f:
                f.write(f"[{datetime.now().isoformat()}] {message}\n")
        except Exception:
            pass
    
    def _get_system_info(self) -> Dict[str, str]:
        """Get current system information."""
        import platform
        import sys
        
        return {
            'os': platform.system().lower(),
            'node_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            'platform': platform.platform(),
            'architecture': platform.machine()
        }
    
    def _sign_payload(self, payload: Dict[str, Any]) -> str:
        """Generate HMAC signature for payload."""
        import hmac
        
        salt = SALT_FILE.read_text().strip() if SALT_FILE.exists() else 'default'
        payload_str = json.dumps(payload, sort_keys=True)
        signature = hmac.new(
            salt.encode(),
            payload_str.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return signature
    
    def vote(self, version_id: int, status: str, category: str = None, 
             error_tail: str = None, force_online: bool = False) -> bool:
        """
        Submit a vote to StableLobster.
        
        Args:
            version_id: The version ID to vote on
            status: 'safe' or 'broken'
            category: Issue category (required if status='broken')
            error_tail: Last lines of error log
            force_online: Skip queue and force online attempt
            
        Returns:
            True if vote was successful, False otherwise
        """
        if status not in ('safe', 'broken'):
            raise ValueError("Status must be 'safe' or 'broken'")
        
        if status == 'broken' and not category:
            category = 'Other'
        
        system_info = self._get_system_info()
        
        payload = {
            'install_id': self.install_id,
            'version_id': version_id,
            'status': status,
            'category': category,
            'os': system_info['os'],
            'node_version': system_info['node_version'],
            'error_tail': error_tail,
            'source': 'agent'
        }
        
        # Sign payload
        payload['payload_signature'] = self._sign_payload(payload)
        
        # Remove source from signature calculation (it's added server-side)
        sign_payload = {k: v for k, v in payload.items() if k != 'source'}
        payload['payload_signature'] = self._sign_payload(sign_payload)
        
        # Try online submission
        if force_online or not self._queue_vote(payload):
            try:
                response = self.session.post(
                    f"{self.api_url}/api/vote",
                    json=payload,
                    headers={'Content-Type': 'application/json'}
                )
                
                if response.status_code == 201:
                    self._log(f"Vote submitted successfully: {status} for version {version_id}")
                    return True
                elif response.status_code == 409:
                    self._log(f"Duplicate vote rejected: version {version_id}")
                    return True  # Not an error, already voted
                else:
                    self._log(f"Vote failed: {response.status_code} - {response.text}")
                    # Queue for retry
                    self._queue_vote(payload)
                    return False
                    
            except requests.exceptions.Timeout:
                self._log("Vote request timed out, queuing for retry")
                self._queue_vote(payload)
                return False
            except requests.exceptions.ConnectionError:
                self._log("Connection error, queuing for retry")
                self._queue_vote(payload)
                return False
            except Exception as e:
                self._log(f"Vote error: {str(e)}")
                self._queue_vote(payload)
                return False
        
        return False
    
    def _queue_vote(self, payload: Dict[str, Any]) -> bool:
        """Queue a vote for later retry."""
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO queue (version_id, status, category, os, node_version, error_tail)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                payload['version_id'],
                payload['status'],
                payload.get('category'),
                payload.get('os'),
                payload.get('node_version'),
                payload.get('error_tail')
            ))
            
            conn.commit()
            conn.close()
            self._log("Vote queued for retry")
            return True
        except Exception as e:
            self._log(f"Failed to queue vote: {str(e)}")
            return False
    
    def process_queue(self) -> int:
        """
        Process queued votes with exponential backoff.
        
        Returns:
            Number of votes successfully processed
        """
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        
        # Get votes that can be retried (attempts < 5, last attempt > 15 min ago)
        cursor.execute('''
            SELECT id, version_id, status, category, os, node_version, error_tail, attempts
            FROM queue
            WHERE (attempts < 5 AND last_attempt IS NULL)
               OR (attempts < 5 AND datetime(last_attempt, '+15 minutes') < ?)
            ORDER BY created_at ASC
            LIMIT 10
        ''', (now,))
        
        queued_votes = cursor.fetchall()
        processed = 0
        
        for vote in queued_votes:
            vote_id, version_id, status, category, os_ver, node_ver, error_tail, attempts = vote
            
            payload = {
                'install_id': self.install_id,
                'version_id': version_id,
                'status': status,
                'category': category,
                'os': os_ver,
                'node_version': node_ver,
                'error_tail': error_tail,
                'source': 'agent'
            }
            
            sign_payload = {k: v for k, v in payload.items() if k != 'source'}
            payload['payload_signature'] = self._sign_payload(sign_payload)
            
            try:
                response = self.session.post(
                    f"{self.api_url}/api/vote",
                    json=payload,
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                
                if response.status_code == 201:
                    # Remove from queue
                    cursor.execute('DELETE FROM queue WHERE id = ?', (vote_id,))
                    processed += 1
                    self._log(f"Queued vote processed: version {version_id}")
                elif response.status_code == 409:
                    # Duplicate, remove from queue
                    cursor.execute('DELETE FROM queue WHERE id = ?', (vote_id,))
                    processed += 1
                else:
                    # Update attempt count
                    cursor.execute('''
                        UPDATE queue 
                        SET attempts = attempts + 1, last_attempt = ?
                        WHERE id = ?
                    ''', (now, vote_id))
                    
            except Exception as e:
                self._log(f"Failed to process queued vote {vote_id}: {str(e)}")
                cursor.execute('''
                    UPDATE queue 
                    SET attempts = attempts + 1, last_attempt = ?
                    WHERE id = ?
                ''', (now, vote_id))
        
        conn.commit()
        conn.close()
        
        if processed > 0:
            self._log(f"Processed {processed} queued votes")
        
        return processed
    
    def report_startup_success(self, version_id: int) -> bool:
        """Report successful startup."""
        return self.vote(version_id, 'safe')
    
    def report_crash(self, version_id: int, error_log: str) -> bool:
        """Report a crash with error log."""
        category = self._categorize_error(error_log)
        return self.vote(version_id, 'broken', category=category, error_tail=error_log)
    
    def _categorize_error(self, error_log: str) -> str:
        """Categorize error based on log content."""
        error_lower = error_log.lower() if error_log else ''
        
        if any(word in error_lower for word in ['config', 'configuration', '.env', 'missing']):
            return 'Config Error'
        if any(word in error_lower for word in ['crash', 'uncaught', 'segfault', 'fatal']):
            return 'Gateway Crash'
        if any(word in error_lower for word in ['network', 'connect', 'timeout', 'eaddr', 'dns']):
            return 'Network/Connectivity'
        if any(word in error_lower for word in ['slow', 'lag', 'performance', 'memory', 'oom']):
            return 'Performance Lag'
        
        return 'Other'


# Convenience functions for easy integration
_client = None

def get_client() -> StableLobsterClient:
    """Get or create the global client instance."""
    global _client
    if _client is None:
        _client = StableLobsterClient()
    return _client

def report_startup_success(version_id: int) -> bool:
    """Report successful agent startup."""
    return get_client().report_startup_success(version_id)

def report_crash(version_id: int, error_log: str) -> bool:
    """Report agent crash."""
    return get_client().report_crash(version_id, error_log)

def process_queue() -> int:
    """Process queued offline votes."""
    return get_client().process_queue()


# CLI interface
if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='StableLobster Client')
    parser.add_argument('--report', action='store_true', help='Force report current status')
    parser.add_argument('--version-id', type=int, help='Version ID to report')
    parser.add_argument('--status', choices=['safe', 'broken'], help='Status to report')
    parser.add_argument('--process-queue', action='store_true', help='Process queued votes')
    
    args = parser.parse_args()
    
    client = get_client()
    
    if args.process_queue:
        processed = client.process_queue()
        print(f"Processed {processed} queued votes")
    elif args.report and args.version_id and args.status:
        if args.status == 'safe':
            success = client.report_startup_success(args.version_id)
        else:
            success = client.report_crash(args.version_id, "Manual report")
        print(f"Vote {'successful' if success else 'queued for retry'}")
    else:
        print("StableLobster Client")
        print(f"Install ID: {client.install_id[:16]}...")
        print(f"API URL: {client.api_url}")
        print("\nUsage:")
        print("  python stablelobster_client.py --report --version-id 123 --status safe")
        print("  python stablelobster_client.py --process-queue")
