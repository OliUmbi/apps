#!/usr/bin/env python3
"""Generate the disposable test vault, age identity and WireGuard keys.

Run on the test host as the deploy user. It writes:
  ansible/group_vars/all/vault.yml  (encrypted, mode 0600)
  .vault-pass                   (mode 0600)
  test-credentials.txt          (mode 0600)
  age-test.key                  (mode 0600; copy off the host, then delete)
  wg-laptop.conf                (mode 0600; copy off the host, then delete)

No production secrets are used.
"""

import base64
import os
import pathlib
import secrets
import subprocess

import yaml

root = pathlib.Path.home() / "apps-deploy"
vault_path = root / "ansible" / "group_vars" / "all" / "vault.yml"
pass_path = root / ".vault-pass"
creds_path = root / "test-credentials.txt"
age_path = root / "age-test.key"
wg_path = root / "wg-laptop.conf"


def password() -> str:
    return base64.urlsafe_b64encode(secrets.token_bytes(24)).decode().rstrip("=")


def token() -> str:
    return secrets.token_urlsafe(32)


def wg_key() -> str:
    return subprocess.check_output(["wg", "genkey"]).decode().strip()


def wg_pub(private: str) -> str:
    return subprocess.check_output(["wg", "pubkey"], input=private.encode()).decode().strip()


if not age_path.exists():
    subprocess.run(["age-keygen", "-o", str(age_path)], check=True)
os.chmod(age_path, 0o600)
age_public = next(
    line.split(":", 1)[1].strip()
    for line in age_path.read_text().splitlines()
    if line.startswith("# public key:")
)

server_private = wg_key()
laptop_private = wg_key()
server_public = wg_pub(server_private)
laptop_public = wg_pub(laptop_private)

vault_passphrase = token()
first_admin_password = password()

vault = {
    "vault_wireguard_server_private_key": server_private,
    "vault_wireguard_laptop_public_key": laptop_public,
    "vault_acme_email": "test@example.invalid",
    "vault_infomaniak_api_token": "test-not-used",
    "vault_postgres_db": "apps",
    "vault_postgres_migrator_user": "apps_migrator",
    "vault_postgres_migrator_password": password(),
    "vault_identity_database_user": "identity",
    "vault_identity_database_password": password(),
    "vault_messaging_database_user": "messaging",
    "vault_messaging_database_password": password(),
    "vault_assets_database_user": "assets",
    "vault_assets_database_password": password(),
    "vault_jublawoma_database_user": "jublawoma",
    "vault_jublawoma_database_password": password(),
    "vault_unclet_database_user": "unclet",
    "vault_unclet_database_password": password(),
    "vault_zelglihof_database_user": "zelglihof",
    "vault_zelglihof_database_password": password(),
    "vault_oliumbi_database_user": "oliumbi",
    "vault_oliumbi_database_password": password(),
    "vault_studio_database_user": "studio",
    "vault_studio_database_password": password(),
    "vault_monitoring_database_password": password(),
    "vault_identity_internal_authorization_token": token(),
    "vault_messaging_internal_authorization_token": token(),
    "vault_assets_internal_authorization_token": token(),
    "vault_messaging_smtp_host": "mailpit",
    "vault_messaging_smtp_port": "1025",
    "vault_messaging_smtp_username": "",
    "vault_messaging_smtp_password": "",
    "vault_unclet_requests_email": "requests@example.invalid",
    "vault_zelglihof_requests_email": "requests@example.invalid",
    "vault_zelglihof_newsletter_email": "newsletter@example.invalid",
    "vault_age_recipient": age_public,
    "vault_first_admin_name": "Test Admin",
    "vault_first_admin_email": "admin@example.invalid",
    "vault_first_admin_password": first_admin_password,
    "vault_ntfy_webhook_url": "https://example.invalid/topic",
    "vault_grafana_admin_password": password(),
}

pass_path.write_text(vault_passphrase + "\n")
os.chmod(pass_path, 0o600)

vault_path.write_text(yaml.safe_dump(vault, sort_keys=False))
os.chmod(vault_path, 0o600)
subprocess.run(
    [
        "ansible-vault",
        "encrypt",
        "--vault-password-file",
        str(pass_path),
        str(vault_path),
    ],
    check=True,
)

creds_path.write_text(
    "test host credentials\n"
    "=====================\n"
    f"first admin name:     Test Admin\n"
    f"first admin email:    admin@example.invalid\n"
    f"first admin password: {first_admin_password}\n"
    f"vault passphrase:     {vault_passphrase}\n"
    f"vault pass file:      {pass_path}\n"
    f"age public key:       {age_public}\n"
)
os.chmod(creds_path, 0o600)

wg_path.write_text(
    "# test workstation tunnel (delete after importing)\n"
    "[Interface]\n"
    "Address = 10.8.0.2/32\n"
    f"PrivateKey = {laptop_private}\n"
    "\n"
    "[Peer]\n"
    f"PublicKey = {server_public}\n"
    "Endpoint = 86.119.66.183:51820\n"
    "AllowedIPs = 10.8.0.0/24\n"
    "PersistentKeepalive = 25\n"
)
os.chmod(wg_path, 0o600)

print("vault encrypted:", vault_path)
print("credentials:", creds_path)
print("age private key:", age_path)
print("wireguard laptop config:", wg_path)
print("age public key:", age_public)
